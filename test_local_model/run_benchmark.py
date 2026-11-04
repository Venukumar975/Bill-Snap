import os
import time
import json
import numpy as np
import pandas as pd
from PIL import Image, ImageOps
import onnxruntime as ort
from huggingface_hub import hf_hub_download

BASE_DIR = r"C:\Users\pichi\Desktop\Bill Snap\test_local_model"
IMAGES_DIR = os.path.join(BASE_DIR, "images")
MANIFEST_PATH = os.path.join(BASE_DIR, "dataset_manifest.csv")

print("Initializing ONNX Model...")
REPO_ID = "huytd189/invoice-classifier"
MODEL_FN = "model.onnx"
LABELS_FN = "class_mapping.json"
IMG_SIZE = 192

# Ensure model and label files
model_path = hf_hub_download(REPO_ID, MODEL_FN)
labels_path = hf_hub_download(REPO_ID, LABELS_FN)

with open(labels_path, 'r', encoding='utf-8') as f:
    labels = json.load(f)

print(f"Class mapping: {labels}")
sess = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
in_name = sess.get_inputs()[0].name
out_name = sess.get_outputs()[0].name

# Load dataset manifest
df_manifest = pd.read_csv(MANIFEST_PATH)
print(f"Running inference across {len(df_manifest)} images...")

results = []

for idx, row in df_manifest.iterrows():
    img_id = int(row['id'])
    fn = row['filename']
    category = row['category']
    ground_truth = row['ground_truth'] # 'valid' or 'invalid'
    
    img_path = os.path.join(IMAGES_DIR, category, fn)
    if not os.path.exists(img_path):
        print(f"File missing: {img_path}")
        continue
        
    try:
        t0 = time.perf_counter()
        # Preprocessing according to model author's exact pipeline
        img = ImageOps.exif_transpose(Image.open(img_path)).convert("RGB").resize((IMG_SIZE, IMG_SIZE))
        x = (np.asarray(img, np.float32) / 255.0)
        x = np.transpose(x, (2, 0, 1))[None, ...]
        
        # Inference
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
        
        # The model's confidence for its predicted class
        confidence_pct = float(probs[pred_idx] * 100.0)
        
        is_correct = (pred_label == ground_truth)
        
        results.append({
            "id": img_id,
            "filename": fn,
            "category": category,
            "ground_truth": ground_truth,
            "predicted_label": pred_label,
            "confidence_pct": round(confidence_pct, 2),
            "prob_invalid": round(prob_invalid, 4),
            "prob_valid": round(prob_valid, 4),
            "latency_ms": round(latency_ms, 2),
            "is_correct": is_correct,
            "source": row.get('source', '')
        })
        
        if img_id % 25 == 0:
            print(f"Processed {img_id}/300: ID {img_id:03d} | Pred: {pred_label} (Conf: {confidence_pct:.1f}%) | Truth: {ground_truth} | Correct: {is_correct} | {latency_ms:.1f}ms")
            
    except Exception as e:
        print(f"Error evaluating ID {img_id} ({fn}): {e}")

df_results = pd.DataFrame(results)
output_csv = os.path.join(BASE_DIR, "benchmark_results.csv")
df_results.to_csv(output_csv, index=False)
print(f"\nBenchmark completed! Results saved to {output_csv}")

# Calculate metrics
total = len(df_results)
correct = df_results['is_correct'].sum()
overall_accuracy = (correct / total) * 100.0
avg_latency = df_results['latency_ms'].mean()

print("\n" + "="*50)
print(f"OVERALL ACCURACY: {correct}/{total} ({overall_accuracy:.2f}%)")
print(f"AVERAGE INFERENCE LATENCY: {avg_latency:.2f} ms")
print("="*50)

# Class-by-class breakdown
class_stats = []
for cat in df_results['category'].unique():
    cat_df = df_results[df_results['category'] == cat]
    cat_total = len(cat_df)
    cat_correct = cat_df['is_correct'].sum()
    cat_acc = (cat_correct / cat_total) * 100.0
    cat_avg_conf = cat_df['confidence_pct'].mean()
    class_stats.append({
        "Category": cat,
        "Total": cat_total,
        "Correct": cat_correct,
        "Accuracy (%)": round(cat_acc, 2),
        "Avg Confidence (%)": round(cat_avg_conf, 2)
    })

df_class_stats = pd.DataFrame(class_stats)
print("\nCATEGORY BREAKDOWN:")
print(df_class_stats.to_string(index=False))

# Confusion Matrix
tp = len(df_results[(df_results['ground_truth'] == 'valid') & (df_results['predicted_label'] == 'valid')])
fn_ = len(df_results[(df_results['ground_truth'] == 'valid') & (df_results['predicted_label'] == 'invalid')])
fp = len(df_results[(df_results['ground_truth'] == 'invalid') & (df_results['predicted_label'] == 'valid')])
tn = len(df_results[(df_results['ground_truth'] == 'invalid') & (df_results['predicted_label'] == 'invalid')])

precision = (tp / (tp + fp)) * 100.0 if (tp + fp) > 0 else 0
recall = (tp / (tp + fn_)) * 100.0 if (tp + fn_) > 0 else 0
f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

print("\nCONFUSION MATRIX:")
print(f"True Positives (Valid Bills detected as Valid): {tp}")
print(f"False Negatives (Valid Bills misclassified as Invalid): {fn_}")
print(f"True Negatives (Non-bills detected as Invalid): {tn}")
print(f"False Positives (Non-bills mistaken as Bills): {fp}")
print(f"Precision: {precision:.2f}%")
print(f"Recall: {recall:.2f}%")
print(f"F1-Score: {f1:.2f}%")
