import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCachedModels, flushDeadModel, initModelEngine } from './modelManager';
import { getActiveApiKey } from './apiKeyManager';

/**
 * Extracts receipt information using the active model with automatic failover.
 * Allows specifying a preferredModelName for distributed batch processing.
 */
export async function extractBillData(base64DataUrl, customApiKey = null, preferredModelName = null) {
  const apiKey = customApiKey || getActiveApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please enter your API key in the sidebar menu.');
  }

  // Parse MIME type and raw base64 data
  const matches = base64DataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid image data URL format.');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];

  // Get current models list from cache or initialize if empty
  let modelQueue = getCachedModels(apiKey);
  if (!modelQueue || modelQueue.length === 0) {
    modelQueue = await initModelEngine(apiKey);
  }

  if (!modelQueue || modelQueue.length === 0) {
    throw new Error('No active Gemini models available. Please verify your API key.');
  }

  // If a preferred model is specified (e.g. for batch striping), put it first in queue
  if (preferredModelName && modelQueue.includes(preferredModelName)) {
    modelQueue = [preferredModelName, ...modelQueue.filter(m => m !== preferredModelName)];
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
You are an expert receipt and invoice analyzer for a mobile expense tracking app.
Carefully inspect the provided image.

TASK 1: Determine whether this image is a bill/receipt/invoice.
- If it is NOT a bill (e.g. a selfie, person, animal, room, scenery, ID card, code screenshot, chat screenshot):
  Set "is_bill" to false and provide a polite, friendly "rejection_reason" (e.g. "This looks like a selfie / document. Please upload a clear photo of a receipt or bill.").
- If it IS a bill/receipt/cash memo/utility invoice:
  Set "is_bill" to true and extract the details in TASK 2.

TASK 2: If it IS a bill, extract:
1. merchant_name: The business, store, or vendor name.
2. date: Transaction date formatted as YYYY-MM-DD (or best estimate).
3. total_amount: The final grand total / payable amount as a clean number string (e.g. "450.00").
4. currency: Currency symbol or code (e.g. "₹", "$", "EUR"). Default to "₹" if in India or ambiguous.
5. category: Exactly one of ["Food", "Groceries", "Utilities", "Shopping", "Travel", "Health", "Other"].
6. Confidence ratings:
   - For merchant_name, date, and total_amount, evaluate confidence as "high" or "low".
   - Mark as "low" if the text is crumpled, faded, handwritten, blurry, cut off, or if multiple competing totals exist.
   - If confidence is "low", provide a short, clear reason (e.g. "Amount digit is slightly smudged", "Handwritten date").

Respond strictly with this JSON structure:
{
  "is_bill": boolean,
  "rejection_reason": string | null,
  "merchant": {
    "value": string,
    "confidence": "high" | "low",
    "reason": string | null
  },
  "date": {
    "value": string,
    "confidence": "high" | "low",
    "reason": string | null
  },
  "total_amount": {
    "value": string,
    "currency": string,
    "confidence": "high" | "low",
    "reason": string | null
  },
  "category": "Food" | "Groceries" | "Utilities" | "Shopping" | "Travel" | "Health" | "Other"
}
`;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType
    }
  };

  let lastError = null;

  // Execute failover queue
  for (let i = 0; i < modelQueue.length; i++) {
    const currentModelName = modelQueue[i];
    console.log(`[AI] Attempting extraction with model: "${currentModelName}"...`);

    try {
      const model = genAI.getGenerativeModel({
        model: currentModelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const response = await model.generateContent([prompt, imagePart]);
      const text = response.response.text();
      const parsed = JSON.parse(text);

      console.log(`[AI] Successfully extracted bill using "${currentModelName}"!`);
      return {
        ...parsed,
        _usedModel: currentModelName
      };

    } catch (err) {
      console.warn(`[AI] Model "${currentModelName}" failed:`, err.message);
      lastError = err;

      const isDeadModel = err.message?.includes('404') || 
                          err.message?.includes('not found') || 
                          err.message?.includes('410');

      if (isDeadModel) {
        // Permanently flush from cache so we never waste time calling it again!
        flushDeadModel(apiKey, currentModelName);
      }
      // If 429 or other temporary error, loop will try next model in queue without flushing
    }
  }

  // If every model in queue failed, throw clean, user-friendly error
  const isOffline = (typeof navigator !== 'undefined' && !navigator.onLine) ||
                    lastError?.message?.includes('Failed to fetch') ||
                    lastError?.message?.includes('NetworkError') ||
                    lastError?.message?.includes('network');

  if (isOffline) {
    throw new Error('No Internet Connection — Please connect to Wi-Fi or mobile data and tap Retry.');
  }

  // Sanitize any raw URL dumps or internal SDK prefixes
  const cleanMsg = lastError?.message
    ?.replace(/https?:\/\/[^\s]+/g, '')
    ?.replace(/\[GoogleGenerativeAI Error\]:\s*/gi, '')
    ?.replace(/Error fetching from/gi, '')
    ?.trim() || 'Extraction failed';

  throw new Error(`AI extraction failed: ${cleanMsg}`);
}
