import os
import time
import json
import numpy as np
import pandas as pd
from PIL import Image, ImageOps
import onnxruntime as ort

BASE_DIR = r"C:\Users\pichi\Desktop\Bill Snap\test_local_model"
IMAGES_DIR = os.path.join(BASE_DIR, "images")
MANIFEST_PATH = os.path.join(BASE_DIR, "dataset_manifest_v2.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.onnx")

print("Initializing ONNX Model...")
IMG_SIZE = 192
labels = {"0": "invalid", "1": "valid"}

sess_options = ort.SessionOptions()
sess_options.intra_op_num_threads = 4
sess = ort.InferenceSession(MODEL_PATH, sess_options, providers=["CPUExecutionProvider"])
in_name = sess.get_inputs()[0].name
out_name = sess.get_outputs()[0].name

# Load dataset manifest
df_manifest = pd.read_csv(MANIFEST_PATH)
total_count = len(df_manifest)
print(f"Loaded manifest: {total_count} images across {df_manifest['category'].nunique()} categories.")
print("Running local on-device inference benchmark...")

results = []
t_start = time.time()

for idx, row in df_manifest.iterrows():
    img_id = int(row['id'])
    fn = row['filename']
    category = row['category']
    sub_type = row.get('sub_type', '')
    ground_truth = row['ground_truth'] # 'valid' or 'invalid'
    
    img_path = os.path.join(IMAGES_DIR, category, fn)
    if not os.path.exists(img_path):
        continue
        
    try:
        t0 = time.perf_counter()
        img = ImageOps.exif_transpose(Image.open(img_path)).convert("RGB").resize((IMG_SIZE, IMG_SIZE))
        x = (np.asarray(img, np.float32) / 255.0)
        x = np.transpose(x, (2, 0, 1))[None, ...]
        
        logits = sess.run([out_name], {in_name: x})[0]
        t1 = time.perf_counter()
        latency_ms = (t1 - t0) * 1000.0
        
        # Softmax probabilities
        exp_logits = np.exp(logits - np.max(logits))
        probs = (exp_logits / exp_logits.sum(-1, keepdims=True))[0]
        
        pred_idx = int(np.argmax(probs))
        pred_label = labels.get(str(pred_idx), f"class_{pred_idx}")
        
        prob_invalid = float(probs[0])
        prob_valid = float(probs[1])
        confidence_pct = float(probs[pred_idx] * 100.0)
        
        is_correct = (pred_label == ground_truth)
        
        results.append({
            "id": img_id,
            "filename": fn,
            "category": category,
            "sub_type": sub_type,
            "ground_truth": ground_truth,
            "predicted_label": pred_label,
            "confidence_pct": round(confidence_pct, 2),
            "prob_invalid": round(prob_invalid, 4),
            "prob_valid": round(prob_valid, 4),
            "latency_ms": round(latency_ms, 2),
            "is_correct": is_correct
        })
        
        if img_id % 500 == 0 or img_id == total_count:
            elapsed = time.time() - t_start
            print(f"Processed [{img_id:04d}/{total_count}] ({img_id/total_count*100:.1f}%) | Elapsed: {elapsed:.1f}s | Latency: {latency_ms:.1f}ms")
            
    except Exception as e:
        print(f"Error evaluating ID {img_id}: {e}")

df_results = pd.DataFrame(results)
output_csv = os.path.join(BASE_DIR, "benchmark_results_v2.csv")
df_results.to_csv(output_csv, index=False)
print(f"\nInference completed in {time.time()-t_start:.1f}s! Results saved to: {output_csv}")

# Compute Core Metrics
total = len(df_results)
correct = df_results['is_correct'].sum()
overall_accuracy = (correct / total) * 100.0
avg_latency = df_results['latency_ms'].mean()

print("\n" + "="*60)
print(f"OVERALL ACCURACY: {correct}/{total} ({overall_accuracy:.2f}%)")
print(f"AVERAGE INFERENCE LATENCY: {avg_latency:.2f} ms")
print("="*60)

# Confusion Matrix
tp = len(df_results[(df_results['ground_truth'] == 'valid') & (df_results['predicted_label'] == 'valid')])
fn_ = len(df_results[(df_results['ground_truth'] == 'valid') & (df_results['predicted_label'] == 'invalid')])
fp = len(df_results[(df_results['ground_truth'] == 'invalid') & (df_results['predicted_label'] == 'valid')])
tn = len(df_results[(df_results['ground_truth'] == 'invalid') & (df_results['predicted_label'] == 'invalid')])

precision = (tp / (tp + fp)) * 100.0 if (tp + fp) > 0 else 0
recall = (tp / (tp + fn_)) * 100.0 if (tp + fn_) > 0 else 0
f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

print("\nCONFUSION MATRIX:")
print(f"True Positives (Valid Bills recognized): {tp}")
print(f"False Negatives (Valid Bills missed): {fn_}")
print(f"True Negatives (Non-bills rejected): {tn}")
print(f"False Positives (Non-bills mistaken as bills): {fp}")
print(f"Precision: {precision:.2f}%")
print(f"Recall: {recall:.2f}%")
print(f"F1-Score: {f1:.2f}%")

# Category Breakdown
print("\nCATEGORY-LEVEL BREAKDOWN:")
cat_summary = []
for cat in df_results['category'].unique():
    c_df = df_results[df_results['category'] == cat]
    cat_summary.append({
        "Category": cat,
        "Total": len(c_df),
        "Correct": c_df['is_correct'].sum(),
        "Accuracy (%)": round((c_df['is_correct'].sum() / len(c_df)) * 100.0, 2),
        "Avg Confidence (%)": round(c_df['confidence_pct'].mean(), 2)
    })
print(pd.DataFrame(cat_summary).to_string(index=False))

# Sub-Type Breakdown for Bills
print("\nBILLS SUB-TYPE BREAKDOWN (Challenging Varied Styles):")
bills_df = df_results[df_results['category'] == 'bills_receipts']
sub_summary = []
for st in bills_df['sub_type'].unique():
    s_df = bills_df[bills_df['sub_type'] == st]
    sub_summary.append({
        "Sub-Type / Style": st,
        "Total": len(s_df),
        "Correct": s_df['is_correct'].sum(),
        "Accuracy (%)": round((s_df['is_correct'].sum() / len(s_df)) * 100.0, 2),
        "Avg Conf (%)": round(s_df['confidence_pct'].mean(), 2)
    })
print(pd.DataFrame(sub_summary).to_string(index=False))

# Misclassified Samples
errors = df_results[df_results['is_correct'] == False]
print(f"\nTOTAL MISCLASSIFICATIONS: {len(errors)} out of {total} images")
if len(errors) > 0:
    print(errors[['id', 'category', 'sub_type', 'ground_truth', 'predicted_label', 'confidence_pct']].head(20).to_string(index=False))
