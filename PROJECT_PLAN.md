# Bill Snap — Step-by-Step Build Plan

A minimal, focused roadmap covering the exact assignment requirements without unnecessary complexity.

---

## 🎯 Core Requirements Checklist

- [ ] **1. Image Input:** Take photo using phone camera or choose from gallery.
- [ ] **2. Bill Check:** Decide if image is actually a bill. If not, show polite rejection message.
- [ ] **3. Field Extraction:** Extract Merchant Name, Date, Total Amount, and Category.
- [ ] **4. Verification UX:** Highlight low-confidence / unsure fields in yellow and allow easy editing before saving.
- [ ] **5. Local Storage:** Save bills on device in a simple list.
- [ ] **6. 20-Image ML Evaluation:** Test set of 15 bills (messy, blurry, crumpled) + 5 non-bills with a results table and failure analysis.

---

## 🪜 Step-by-Step Implementation Steps

### Phase 1: Clean Foundation (Scaffolding)
- Set up React + Vite + Tailwind CSS.
- Add mobile viewport container and responsive mobile frame for testing on PC.
- Configure PWA manifest (for "Add to Home Screen" on phone).

### Phase 2: Capture & Pick (Camera & Gallery)
- File input supporting both native camera capture (`capture="environment"`) and file picker.
- Image preview card with image compression (so uploads are fast even on slow mobile data).

### Phase 3: Vision & Extraction Pipeline
- Connect to Gemini 1.5 Flash via `@google/genai` or direct REST API.
- Prompt designed for strict JSON response:
  - `is_bill`: boolean + friendly rejection reason if false.
  - `merchant`: { value, confidence: "high" | "low" }
  - `date`: { value, confidence: "high" | "low" }
  - `total_amount`: { value, currency, confidence: "high" | "low" }
  - `category`: "Food" | "Groceries" | "Utilities" | "Shopping" | "Other"

### Phase 4: Verification & Edit Screen (UX Focus)
- If `is_bill === false`: Show polite dialog (*"This looks like an ID / selfie. Please upload a receipt."*) with a "Try Again" button.
- If `is_bill === true`:
  - Show bill image preview.
  - Show editable form inputs.
  - Highlight unsure/low-confidence fields in amber/yellow with a "Please verify" hint.
  - "Save Bill" button.

### Phase 5: Saved Bills List (Home Screen)
- LocalStorage / IndexedDB persistence.
- Simple, beautiful list view showing:
  - Merchant name
  - Date
  - Category badge
  - Total amount
  - Thumbnail preview
- Delete bill option.

### Phase 6: Test Set & Evaluation Table (Assignment Requirement)
- Collect 15 bill photos (clean, crumpled, handwritten, blurry, angled) + 5 non-bills.
- Run them through the app and document:
  - Image type
  - Bill detected? (Yes/No)
  - Merchant extracted correctly? (Yes/No)
  - Date correct? (Yes/No)
  - Total amount correct? (Yes/No)
  - Honest reflection on failure cases.
