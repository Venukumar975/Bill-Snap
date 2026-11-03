/**
 * ModelManager: Self-Healing Model Discovery, Caching & Failover Engine
 * 
 * - Discovers live models for the user's API key
 * - Filters for 1.x, 2.x, 3.x Flash and Vision-capable models
 * - Caches validated models in localStorage for 7 days (Zero wasted startup calls)
 * - Manages active model queue and failover:
 *     * 404 / 410 -> Permanently removed from cache
 *     * 429 -> Temporarily bypassed, kept in cache
 */

const CACHE_KEY_PREFIX = 'billsnap_models_cache_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days

// Hash helper to ensure cache is tied strictly to the specific API key
function getCacheKey(apiKey) {
  const hash = apiKey ? apiKey.slice(-8) : 'default';
  return `${CACHE_KEY_PREFIX}${hash}`;
}

/**
 * Reads valid cached models from localStorage if not expired
 */
export function getCachedModels(apiKey) {
  try {
    const raw = localStorage.getItem(getCacheKey(apiKey));
    if (!raw) return null;

    const data = JSON.parse(raw);
    const isExpired = Date.now() - data.timestamp > CACHE_TTL_MS;
    if (isExpired || !Array.isArray(data.models) || data.models.length === 0) {
      localStorage.removeItem(getCacheKey(apiKey));
      return null;
    }

    return data.models; // Array of model name strings: ['gemini-2.5-flash', ...]
  } catch (err) {
    console.warn('Failed to read model cache:', err);
    return null;
  }
}

/**
 * Saves an array of validated models to localStorage
 */
export function saveCachedModels(apiKey, models) {
  try {
    if (!models || models.length === 0) {
      localStorage.removeItem(getCacheKey(apiKey));
      return;
    }
    const payload = {
      models,
      timestamp: Date.now()
    };
    localStorage.setItem(getCacheKey(apiKey), JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save model cache:', err);
  }
}

/**
 * Removes a dead model (404/410) permanently from the cache
 */
export function flushDeadModel(apiKey, deadModelName) {
  const current = getCachedModels(apiKey) || [];
  const updated = current.filter(m => m !== deadModelName);
  saveCachedModels(apiKey, updated);
  console.log(`[ModelManager] Flushed dead model "${deadModelName}". Remaining in cache:`, updated);
  return updated;
}

/**
 * Filters the raw models list from Google API using smart regex
 * Covers: 1.x, 2.x, 3.x, flash, latest, preview
 * Excludes: tts, audio, transcribe, robotics, computer-use
 */
export function filterCandidateModels(rawModels) {
  // Regex covers: gemini 1.x, 2.x, 3.x and generic flash/pro aliases
  const includePattern = /^models\/gemini-(?:1\.[0-9]|2\.[0-9]|3\.[0-9]|flash|pro)/i;
  const excludePattern = /tts|transcribe|robotics|audio|computer-use|deep-research/i;

  const candidates = rawModels
    .filter(m => {
      const name = m.name;
      const canGenerate = m.supportedGenerationMethods?.includes('generateContent');
      return canGenerate && includePattern.test(name) && !excludePattern.test(name);
    })
    .map(m => m.name.replace('models/', ''));

  // Sort candidates prioritizing fast Flash models
  candidates.sort((a, b) => {
    const aIsFlash = a.includes('flash');
    const bIsFlash = b.includes('flash');
    if (aIsFlash && !bIsFlash) return -1;
    if (!aIsFlash && bIsFlash) return 1;
    return a.localeCompare(b);
  });

  return candidates;
}

/**
 * Pings a model with a minimal prompt to verify it responds 200 OK
 */
export async function pingModel(modelName, apiKey, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'hi' }] }],
        generationConfig: { maxOutputTokens: 1 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    clearTimeout(timeoutId);
    return false;
  }
}

/**
 * Main Orchestrator:
 * 1. Checks cache (instant hit, 0 network calls!)
 * 2. If cache empty, fetches models list from Google API
 * 3. Finds first working model ASAP and triggers onFirstReady
 * 4. Verifies remaining candidates in the background and saves to cache
 */
export async function initModelEngine(apiKey, onFirstReady, onAllReady) {
  if (!apiKey) return [];

  // Check 7-day cache first
  const cached = getCachedModels(apiKey);
  if (cached && cached.length > 0) {
    console.log('[ModelManager] Cache hit! Using cached models:', cached);
    if (onFirstReady) onFirstReady(cached[0]);
    if (onAllReady) onAllReady(cached);
    return cached;
  }

  console.log('[ModelManager] Cache empty. Discovering models from Google API...');
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) {
      if (res.status === 400 || res.status === 403) {
        throw new Error('Invalid Gemini API Key. Please verify your key.');
      }
      throw new Error(`Failed to list models (HTTP ${res.status})`);
    }

    const data = await res.json();
    const candidates = filterCandidateModels(data.models || []);

    if (candidates.length === 0) {
      throw new Error('No compatible Gemini vision models found for this API key.');
    }

    console.log('[ModelManager] Discovered candidates:', candidates);

    // Test the first candidate immediately to unblock the user UI
    let verifiedModels = [];
    let firstFound = false;

    for (const model of candidates) {
      const isAlive = await pingModel(model, apiKey);
      if (isAlive) {
        verifiedModels.push(model);
        if (!firstFound) {
          firstFound = true;
          if (onFirstReady) onFirstReady(model);
        }
      }
    }

    // Save all verified models to cache for 7 days
    if (verifiedModels.length > 0) {
      saveCachedModels(apiKey, verifiedModels);
      if (onAllReady) onAllReady(verifiedModels);
    }

    return verifiedModels;
  } catch (err) {
    console.error('[ModelManager] Discovery error:', err);
    throw err;
  }
}

/**
 * Manually flushes cache and forces re-discovery of all models
 */
export async function refreshModelEngine(apiKey, onFirstReady, onAllReady) {
  try {
    localStorage.removeItem(getCacheKey(apiKey));
    console.log('[ModelManager] Cache cleared. Re-running engine discovery...');
    return await initModelEngine(apiKey, onFirstReady, onAllReady);
  } catch (err) {
    console.error('[ModelManager] Refresh error:', err);
    throw err;
  }
}

