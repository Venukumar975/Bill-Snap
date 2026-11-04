# Local On-Device Model Benchmark Report
**Model:** `huytd189/invoice-classifier` (MobileNetV3 ONNX)  
**Input Size:** 192 × 192 px | **Model Size:** 5.86 MB  
**Evaluation Scope:** 300 Images across 6 Balanced Classes (IDs 1 to 300)  
**Environment:** Client-side local CPU runtime (`onnxruntime`) — Zero network latency, zero cloud API cost  

---

## 1. Executive Summary

| Metric | Result | Benchmark Significance |
| :--- | :--- | :--- |
| **Total Test Dataset** | **300 Images** | 50 Bills vs 250 Negative Distractors (Animals, Vehicles, People, Nature, Objects) |
| **Overall Accuracy** | **98.67%** (296 / 300) | Exceptional reliability for binary pre-filtering |
| **Average Inference Time** | **27.16 ms** | Runs smoothly in real-time on any mobile CPU (< 30ms) |
| **Precision** | **97.92%** | Only 1 false alarm out of 250 non-bill photos |
| **Recall** | **94.00%** | Caught 47 out of 50 real-world bills |
| **F1-Score** | **95.92%** | Robust balance of high detection rate and low false positives |

---

## 2. Class-by-Class Breakdown (50 Images per Class)

| Class ID Range | Category | Total | Correct | Accuracy (%) | Avg Confidence (%) |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **001 – 050** | **Bills & Receipts** (Real, handwritten, crumpled, thermal) | 50 | 47 | **94.00%** | 98.50% |
| **051 – 100** | **Animals** (Dogs, cats, birds, wildlife) | 50 | 50 | **100.00%** | 99.30% |
| **101 – 150** | **Vehicles & Cycles** (Bicycles, cars, motorbikes) | 50 | 49 | **98.00%** | 98.69% |
| **151 – 200** | **People & Selfies** (Faces, portraits, casual shots) | 50 | 50 | **100.00%** | 99.80% |
| **201 – 250** | **Nature & Landscapes** (Mountains, trees, skies) | 50 | 50 | **100.00%** | 99.68% |
| **251 – 300** | **Everyday Objects & Documents** (Desks, laptops, books) | 50 | 50 | **100.00%** | 99.44% |
| **Total** | **All 6 Classes Combined** | **300** | **296** | **98.67%** | **99.24%** |

---

## 3. Confusion Matrix

| Ground Truth \ Predicted | Predicted: **Valid Bill** | Predicted: **Invalid (Non-Bill)** | Total |
| :--- | :---: | :---: | :---: |
| **Actual Bill** | **47** (True Positive) | **3** (False Negative) | 50 |
| **Actual Non-Bill** | **1** (False Positive) | **249** (True Negative) | 250 |

---

## 4. Failure Analysis (The 4 Misclassified Samples)

Out of 300 images tested, exactly 4 edge-cases were misclassified:

1. **ID 005 (`HyderabadBiriyani01Jan2014.jpg`)** — *False Negative (Pred: Invalid, 87.43% conf)*  
   - **Reason:** Very dark lighting, heavy yellow restaurant ambient cast, and extreme camera tilt.
2. **ID 010 (`stock-photo-...hand-holding-many-receipt-for-...jpg`)** — *False Negative (Pred: Invalid, 99.28% conf)*  
   - **Reason:** A person's hand and arm occupied >60% of the frame holding fanned-out receipts. MobileNet recognized the human hand/skin rather than the receipt texture.
3. **ID 014 (`app_receipt_14.jpg`)** — *False Negative (Pred: Invalid, 99.99% conf)*  
   - **Reason:** Extreme crop showing only a partial barcode line without standard receipt header or tabular text margins.
4. **ID 133 (`133_vehicles_cycles_133.jpg`)** — *False Positive (Pred: Valid, 91.46% conf)*  
   - **Reason:** High-contrast parallel bicycle rack lines and white metal slats closely mimicked the vertical tabular stripe pattern of a receipt.

---

## 5. Performance on Challenging & Light-Colored Bills

| ID | Description / Source | True Label | Model Prediction | Model Confidence |
| :---: | :--- | :---: | :---: | :---: |
| **001** | Light thermal POS slip (`1 (1).webp`) | Valid | **Valid** | **99.98%** |
| **002** | Faded thermal store bill (`1.webp`) | Valid | **Valid** | **86.54%** |
| **003** | Folded grocery invoice (`1000_F_...jpg`) | Valid | **Valid** | **99.99%** |
| **004** | **Handwritten shop bill** (`good-hand-written-bill.jpg`) | Valid | **Valid** | **71.24%** |
| **006** | Retail supermarket slip (`OIP (1).webp`) | Valid | **Valid** | **100.00%** |
| **007** | Crumpled food order chit (`OIP.webp`) | Valid | **Valid** | **100.00%** |
| **008** | Indonesian regional store bill (`pekalongan-...webp`) | Valid | **Valid** | **100.00%** |
| **011** | DMart Supermarket Receipt (Live App Scan) | Valid | **Valid** | **82.37%** |
| **012** | Mahavitaran Electricity Bill (A4 fold) | Valid | **Valid** | **99.92%** |
| **016–050** | SROIE / CORD real thermal store receipts | Valid | **Valid** | **100.00% (35/35)** |
