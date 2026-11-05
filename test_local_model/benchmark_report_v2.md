# Empirical Benchmark Evaluation: `huytd189/invoice-classifier` (5,000 Images)

> **Official Benchmark Report**: Rigorous empirical performance evaluation of the on-device MobileNetV3-Small binary receipt classifier deployed in **Bill Snap**.

---

## 📌 1. Benchmark Metadata & Evaluation Scope

| Evaluation Parameter | Value | Technical Context |
| :--- | :--- | :--- |
| **Model Evaluated** | [`huytd189/invoice-classifier`](https://huggingface.co/huytd189/invoice-classifier) | Hosted on Hugging Face Hub |
| **Base Architecture** | **MobileNetV3-Small** (Inverted Residuals, Squeeze-and-Excitation Attention) | Howard et al., 2019 ([arXiv:1905.02244](https://arxiv.org/abs/1905.02244)) |
| **Model Format & Size** | **ONNX FP32** (`model.onnx`) • **6.30 MB** (6,606,198 bytes) | Zero runtime overhead once cached in browser Service Worker |
| **Input Shape** | `[1, 3, 192, 192]` (Float32 RGB planar tensor) | Resized and normalized to $[0.0, 1.0]$ |
| **Output Shape** | `[1, 2]` (`[logit_invalid, logit_valid]`) | Normalized via Softmax: $P(\text{Valid}) = \frac{e^{z_1}}{e^{z_0} + e^{z_1}}$ |
| **Decision Threshold** | **`0.65`** ($P(\text{Valid}) \ge 0.65 \implies$ Verified Receipt) | Empirically derived Pareto-optimal cutoff |
| **Total Test Dataset** | **5,000 Verified Images** | Balanced: 1,000 genuine bills vs. 4,000 negative distractors |
| **Execution Environment** | Local Single-Threaded CPU (`onnxruntime`) | 100% offline, zero network requests, zero cloud API tokens spent |
| **Average Latency** | **15.70 ms** (Desktop/Laptop CPU); **0 ms – 700 ms** (Mobile Phones) | Instantaneous edge pre-screening |

---

## 📊 2. Macro Evaluation Metrics (5,000 Images)

The evaluation was executed across 5,000 sequentially indexed images (`0001` to `5000`) partitioned into 5 distinct categories:

| Metric | Empirical Value | Formula / Derivation | Practical User Experience Impact |
| :--- | :---: | :--- | :--- |
| **Overall Accuracy** | **99.36%** | $\frac{TP + TN}{TP + TN + FP + FN} = \frac{4968}{5000}$ | Model makes the correct determination in >99 out of 100 image scans |
| **Recall (Sensitivity)** | **99.70%** | $\frac{TP}{TP + FN} = \frac{997}{1000}$ | **997 out of 1,000 genuine receipts** are automatically accepted |
| **Precision** | **97.84%** | $\frac{TP}{TP + FP} = \frac{997}{997 + 22}$ | When the model says "Verified Receipt", it is right ~98% of the time |
| **Distractor Rejection Rate** | **99.45%** | $\frac{TN}{TN + FP} = \frac{3978}{4000}$ | Blocks 3,978 out of 4,000 non-bill images locally before calling Gemini |
| **F1-Score** | **98.76%** | $2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$ | Harmonized metric confirming exceptional class balance |

---

## 🔲 3. Full 2×2 Confusion Matrix

$$\begin{array}{c|cc}
\text{Ground Truth} \backslash \text{Prediction} & \textbf{Predicted: Valid Receipt} & \textbf{Predicted: Non-Bill (Invalid)} \\
\hline
\textbf{Actual Receipt (1,000)} & \mathbf{997}\text{ (True Positive - 99.70\%)} & \mathbf{3}\text{ (False Negative - 0.30\%)} \\
\textbf{Actual Non-Bill (4,000)} & \mathbf{22}\text{ (False Positive - 0.55\%)} & \mathbf{3,978}\text{ (True Negative - 99.45\%)}
\end{array}$$

* **True Positives (997)**: Legitimate receipts verified on-device in $<50\text{ms}$, immediately dispatched to Gemini.
* **True Negatives (3,978)**: Unrelated everyday photos (animals, nature, tools, vehicles) blocked client-side without consuming API quota.
* **False Negatives (3)**: Borderline receipts that scored $<0.65$. Thanks to Bill Snap's **"Scan with AI Anyway" override button**, users are never locked out and can bypass edge rejection with one tap.
* **False Positives (22)**: Non-bill images with high-frequency parallel slats (e.g., radiator grilles, keyboard rows) that passed edge filtering and were politely handled downstream by Gemini.

---

## 📂 4. Category-Level Performance Breakdown

| ID Range | Category | Domain Description | Total Images | Correct | Accuracy | Avg Confidence |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **0001 – 1000** | **Bills & Receipts** | Retail slips, supermarket, handwritten, thermal, faded, degraded | 1,000 | 997 | **99.70%** | 99.88% |
| **1001 – 2000** | **Animals & Wildlife** | Dogs, cats, birds, insects, reptiles (Tiny-ImageNet) | 1,000 | 995 | **99.50%** | 99.33% |
| **2001 – 3000** | **Everyday Objects** | Tools, laptops, furniture, kitchenware, desk items | 1,000 | 989 | **98.90%** | 98.56% |
| **3001 – 4000** | **Nature & Landscapes** | Mountains, forests, rivers, satellite terrain | 1,000 | 998 | **99.80%** | 98.56% |
| **4001 – 5000** | **Vehicles & Transport** | Cars, bicycles, motorcycles, trucks, airplanes | 1,000 | 996 | **99.60%** | 98.80% |
| **Combined** | **Complete Test Suite** | **5 Balanced Macro Categories** | **5,000** | **4,975** | **99.50%** | **99.03%** |

---

## 🧪 5. Stress-Testing on Real-World Degraded & Crumpled Bills

To mirror realistic smartphone camera usage in messy environments, the 1,000 positive receipts were subjected to severe real-world physical and optical degradations:

| Bill Sub-Type / Challenge | Real-World Scenario | Total Samples | Correct | Accuracy | Avg Conf |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **CORD / SROIE Retail Slips** | Multi-item grocery, dining, pharmacy thermal POS chits | 677 | 675 | **99.70%** | 99.91% |
| **Handwritten Store Bills & Chits** | Merchant manual order slips, kirana shop carbon copies | 3 | 3 | **100.00%** | 100.00% |
| **Faded Thermal POS Slips** | Low contrast bleached paper, heat-degraded thermal ink | 80 | 80 | **100.00%** | 99.54% |
| **Yellowed / Aged Paper Bills** | Old shop ledgers, tea-tinted paper, amber lighting | 80 | 79 | **98.75%** | 99.98% |
| **Shaded Bills (Severe Shadows)** | Uneven lighting gradient (top dark 40%, bottom light) | 80 | 80 | **100.00%** | 100.00% |
| **Crumpled & Folded Chits** | Heavily crinkled thermal slips, angled creases, skewed | 80 | 80 | **100.00%** | 99.79% |

---

## 🔍 6. Transparent Failure Analysis (The 32 Edge Cases)

Across the entire 5,000-image evaluation, exactly 25 misclassifications occurred at the $0.65$ cutoff:

### A. The 3 False Negatives (Genuine Bills Missed by Edge Model):
1. **ID 0005 (`HyderabadBiriyani01Jan2014.jpg`)** — *Score: $P(\text{Valid}) = 0.136$*  
   - **Root Cause**: Intense monochromatic amber-yellow incandescent dining lighting combined with an aggressive $45^\circ$ perspective angle washed out the rectangular boundary contrast.
   - **User Safeguard**: Caught gracefully by Bill Snap's **"Scan with AI Anyway"** override button.
2. **ID 0010 (`hand-holding-many-receipt.jpg`)** — *Score: $P(\text{Valid}) = 0.007$*  
   - **Root Cause**: A human hand and forearm occupied $>60\%$ of the camera frame holding multiple receipts. The model activated on human skin texture rather than paper geometry.
   - **User Safeguard**: Rescued via manual override.
3. **ID 0690 (`degraded_yellowed_010.jpg`)** — *Score: $P(\text{Valid}) = 0.002$*  
   - **Root Cause**: Severe optical sensor blue-channel clipping bleached thin carbon ink lines into the yellow paper background.
   - **User Safeguard**: Rescued via manual override.

### B. The 22 False Positives (Non-Bills Mistaken for Bills):
* **Everyday Objects (11 errors)**: White radiator grilles, computer keyboards, and horizontal window blinds produced high-frequency parallel slat patterns resembling printed receipt item tables.
* **Animals (5 errors)**: Macro close-ups of zebra stripes and barred owl plumage mimicking horizontal barcode line textures.
* **Vehicles (4 errors)**: Metal bicycle racks with repetitive white slats against asphalt.
* **Nature (2 errors)**: Aerial satellite views of plowed agricultural fields on dry chalky soil.

---

## 📈 7. Mathematical Justification for the `0.65` Threshold

<p align="center">
  <img src="../docs/assets/threshold_analysis_proof.png" alt="Threshold Analysis Proof" width="550">
  <br>
  <sub><em>📈 Figure 7.1: Empirical threshold sweep curve demonstrating the 0.65 Pareto inflection point.</em></sub>
</p>

1. **Zero Degradation in Genuine Recall**: Moving from the old $0.25$ baseline up to $0.65$ maintains **99.70% recall** (997/1,000 real receipts pass automatically).
2. **65.6% Elimination of False Alarms**: At $0.25$, 64 distractors leaked through. At $0.65$, distractor leakage drops by **65.6%** to just 22 images across 4,000 negatives.
3. **Pareto Inflection Boundary**: Moving to $0.70$ causes genuine bill recall to degrade to $99.50\%$ (dropping real receipts). **$0.65$ is the exact Pareto-optimal boundary.**

---

## 🚀 8. Reproduction Instructions

To independently verify and reproduce these benchmark figures:

```bash
# 1. Install evaluation dependencies
pip install onnxruntime pillow numpy pandas huggingface_hub

# 2. Run the 5,000-image benchmark suite
cd test_local_model
python run_benchmark_v2.py
```

### Generated Artifacts:
* `dataset_manifest_v2.csv`: Manifest of all 5,000 images with source annotations.
* `benchmark_results_v2.csv`: Full raw inference log with per-image latencies and Softmax probabilities.
