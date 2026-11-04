/**
 * API Key Manager (BYOK - Bring Your Own Key)
 * 
 * Manages the user's Gemini API key exclusively in browser localStorage.
 * Ensures the app does not rely on a hardcoded or exposed .env key.
 */

const STORAGE_KEY = 'billsnap_user_gemini_api_key';

/**
 * Retrieves the active API key directly and strictly from localStorage.
 * Does NOT read from or fall back to .env under any circumstances.
 */
export function getActiveApiKey() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch (err) {
    console.warn('Failed to read API key from localStorage:', err);
  }
  return '';
}

/**
 * Saves a new user API key into localStorage.
 */
export function setActiveApiKey(key) {
  try {
    if (!key || !key.trim()) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
  } catch (err) {
    console.warn('Failed to save API key:', err);
  }
}

/**
 * Validates a Gemini API key against Google's models endpoint.
 */
export async function testGeminiApiKey(key) {
  if (!key || !key.trim()) {
    throw new Error('API key cannot be empty');
  }

  const cleanKey = key.trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.error?.message || `API error (${res.status})`;
    throw new Error(message);
  }

  const data = await res.json();
  return Array.isArray(data.models) && data.models.length > 0;
}

/**
 * Clears the stored user API key completely from localStorage.
 * Also purges any cached models tied to previous keys.
 */
export function clearActiveApiKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    
    // Purge any cached models from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('billsnap_models_cache_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn('Failed to remove API key and cache:', err);
  }
}
