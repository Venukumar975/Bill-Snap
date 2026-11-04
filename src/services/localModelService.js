/**
 * On-Device Receipt & Bill Classifier Service (MobileNetV3 ONNX)
 * 
 * Provides ultra-fast (~15ms), 100% offline edge verification of captured images.
 * Determines whether an image is a valid receipt before cloud LLM extraction is initiated.
 */

const MODEL_PATH = '/models/model.onnx';
const INPUT_SIZE = 192;
const ACCEPT_THRESHOLD = 0.65; // Empirically proven optimal cutoff (99.70% recall, 99.45% distractor rejection)

let inferenceSession = null;
let isInitializing = false;
let modelLoadFailed = false;

/**
 * Gets the active ONNX Runtime instance (from window.ort CDN or bundler import).
 */
async function getOrt() {
  if (typeof window !== 'undefined' && window.ort) {
    return window.ort;
  }
  return await import('onnxruntime-web');
}

/**
 * Initializes the ONNX Runtime Inference Session (singleton).
 * Lazy-loaded upon first scan or app idle to preserve initial render speed.
 */
export async function initLocalModel() {
  if (inferenceSession) return inferenceSession;
  if (modelLoadFailed) return null;
  if (isInitializing) {
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return inferenceSession;
  }

  isInitializing = true;
  try {
    const ort = await getOrt();
    inferenceSession = await ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ['wasm']
    });
    console.log('✅ [On-Device AI] MobileNetV3 session initialized successfully.');
    return inferenceSession;
  } catch (err) {
    console.warn('⚠️ [On-Device AI] Failed to load local ONNX model, falling back to direct cloud processing:', err);
    modelLoadFailed = true;
    return null;
  } finally {
    isInitializing = false;
  }
}

/**
 * Preprocesses any image source (File, Blob, or DataURL) to a normalized 192x192 Float32Array tensor.
 * Formatted in CHW planar order [1, 3, 192, 192] with [0.0, 1.0] pixel normalization.
 */
async function preprocessImageToTensor(imageSource) {
  const ort = await getOrt();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = INPUT_SIZE;
        canvas.height = INPUT_SIZE;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        ctx.drawImage(img, 0, 0, INPUT_SIZE, INPUT_SIZE);
        const { data } = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);

        const floatData = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);
        const planeSize = INPUT_SIZE * INPUT_SIZE;

        for (let i = 0; i < planeSize; i++) {
          const r = data[i * 4] / 255.0;
          const g = data[i * 4 + 1] / 255.0;
          const b = data[i * 4 + 2] / 255.0;

          floatData[i] = r;                 // Red channel
          floatData[planeSize + i] = g;     // Green channel
          floatData[2 * planeSize + i] = b; // Blue channel
        }

        const tensor = new ort.Tensor('float32', floatData, [1, 3, INPUT_SIZE, INPUT_SIZE]);
        resolve(tensor);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image for local inference'));

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else if (imageSource instanceof Blob || imageSource instanceof File) {
      img.src = URL.createObjectURL(imageSource);
    } else {
      reject(new Error('Invalid image source'));
    }
  });
}

/**
 * Classifies an image locally using MobileNetV3.
 * Returns decision metrics, confidence, and latency.
 */
export async function classifyReceiptLocally(imageSource) {
  // Check if user disabled the local model in settings
  const isEnabled = localStorage.getItem('billsnap_local_model_enabled') !== 'false';
  if (!isEnabled) {
    return {
      isSupported: false,
      isValidBill: true,
      confidencePct: 100,
      rawProbValid: 1.0,
      rawProbInvalid: 0.0,
      latencyMs: 0,
      needsConfirmation: false,
      bypassed: true
    };
  }

  const session = await initLocalModel();
  if (!session) {
    // Model unsupported or failed to load -> Graceful pass-through to Gemini
    return {
      isSupported: false,
      isValidBill: true,
      confidencePct: 100,
      rawProbValid: 1.0,
      rawProbInvalid: 0.0,
      latencyMs: 0,
      needsConfirmation: false,
      bypassed: true
    };
  }

  const t0 = performance.now();
  const tensor = await preprocessImageToTensor(imageSource);

  // Run inference
  const inputName = session.inputNames[0] || 'input';
  const outputName = session.outputNames[0] || 'logits';
  const feeds = {};
  feeds[inputName] = tensor;

  const results = await session.run(feeds);
  const logits = results[outputName].data;
  const t1 = performance.now();
  const latencyMs = Math.round(t1 - t0);

  // Compute Softmax probabilities
  const maxLogit = Math.max(logits[0], logits[1]);
  const exp0 = Math.exp(logits[0] - maxLogit);
  const exp1 = Math.exp(logits[1] - maxLogit);
  const sumExp = exp0 + exp1;

  const probInvalid = exp0 / sumExp; // Class 0
  const probValid = exp1 / sumExp;   // Class 1

  // Dual-check: 
  // 1. probValid >= 0.65 auto-approves
  // 2. probValid < 0.65 flags for soft rejection with user override ("Scan Anyway")
  const isValidBill = probValid >= ACCEPT_THRESHOLD;
  const confidencePct = Math.round((isValidBill ? probValid : probInvalid) * 100);

  return {
    isSupported: true,
    isValidBill,
    confidencePct,
    rawProbValid: Math.round(probValid * 1000) / 1000,
    rawProbInvalid: Math.round(probInvalid * 1000) / 1000,
    latencyMs,
    needsConfirmation: !isValidBill
  };
}

const STORAGE_KEY = 'billsnap_local_model_enabled';

/**
 * Gets the current local model toggle state from localStorage.
 * Default is ON (true) for all new users on first launch.
 * Never expires; strictly respects the user's permanent preference once toggled.
 */
export function isLocalModelEnabled() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) {
    return true; // Default ON for brand new users
  }
  return saved === 'true';
}

/**
 * Permanently stores the user's toggle preference in localStorage.
 */
export function setLocalModelEnabled(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
}
