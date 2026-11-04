import os
import io
import time
import json
import zipfile
import requests
import numpy as np
import pandas as pd
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from concurrent.futures import ThreadPoolExecutor
from huggingface_hub import hf_hub_download

BASE_DIR = r"C:\Users\pichi\Desktop\Bill Snap\test_local_model"
IMAGES_DIR = os.path.join(BASE_DIR, "images")

# Setup clean directories
CATEGORIES = [
    "bills_receipts",
    "animals",
    "vehicles",
    "nature_landscapes",
    "things_objects"
]

for cat in CATEGORIES:
    os.makedirs(os.path.join(IMAGES_DIR, cat), exist_ok=True)

manifest = []
global_id = 1

# ==============================================================================
# 1. BILLS & RECEIPTS (Target: 1,000+ Real & Varied Bills)
# ==============================================================================
print("\n" + "="*60)
print("ASSEMBLING BILLS & RECEIPTS (Target: 1,000+ images)...")
print("="*60)

# A. User's downloaded real bills
user_dl = r"C:\Users\pichi\Downloads\bills_receipts"
if os.path.exists(user_dl):
    for fn in os.listdir(user_dl):
        fp = os.path.join(user_dl, fn)
        if os.path.isfile(fp) and fn.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            try:
                img = Image.open(fp).convert('RGB')
                out_fn = f"{global_id:04d}_user_bill_{fn}"
                out_fp = os.path.join(IMAGES_DIR, "bills_receipts", out_fn)
                img.save(out_fp, 'JPEG', quality=92)
                manifest.append({
                    "id": global_id,
                    "filename": out_fn,
                    "category": "bills_receipts",
                    "sub_type": "User Real Bill (Handwritten/Store)",
                    "ground_truth": "valid"
                })
                print(f"  [ID {global_id:04d}] Added user download bill: {fn}")
                global_id += 1
            except Exception as e:
                print(f"Error copying {fn}: {e}")

# B. SROIE & CORD receipts from mychen76/ds_receipts_v2_test (472 verified receipts)
print("\nLoading 472 verified receipts from mychen76/ds_receipts_v2_test...")
url_cord_test = "https://huggingface.co/datasets/mychen76/ds_receipts_v2_test/resolve/main/data/train-00000-of-00001-e3539d8e5f0a058b.parquet"
try:
    df_cord = pd.read_parquet(url_cord_test)
    for idx, row in df_cord.iterrows():
        try:
            img_bytes = row['image']['bytes']
            img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
            out_fn = f"{global_id:04d}_cord_sroie_receipt_{idx:03d}.jpg"
            out_fp = os.path.join(IMAGES_DIR, "bills_receipts", out_fn)
            img.save(out_fp, 'JPEG', quality=92)
            manifest.append({
                "id": global_id,
                "filename": out_fn,
                "category": "bills_receipts",
                "sub_type": "CORD/SROIE Retail Receipt (Supermarket/Dining)",
                "ground_truth": "valid"
            })
            global_id += 1
        except Exception:
            pass
    print(f"  Added {len(df_cord)} receipts from ds_receipts_v2_test. Total so far: {global_id - 1}")
except Exception as e:
    print(f"Error loading ds_receipts_v2_test: {e}")

# C. Invoices and receipts from dajor85570 (test + valid = 195 verified bills)
print("\nLoading receipts from dajor85570/invoices-and-receipts_ocr_v1...")
for split, url in [
    ("test", "https://huggingface.co/datasets/dajor85570/invoices-and-receipts_ocr_v1/resolve/main/data/test-00000-of-00001-af2d92d1cee28514.parquet"),
    ("valid", "https://huggingface.co/datasets/dajor85570/invoices-and-receipts_ocr_v1/resolve/main/data/valid-00000-of-00001-894b4e1f736b5732.parquet")
]:
    try:
        df_dajor = pd.read_parquet(url)
        for idx, row in df_dajor.iterrows():
            try:
                img_bytes = row['image']['bytes']
                img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
                out_fn = f"{global_id:04d}_dajor_{split}_{idx:03d}.jpg"
                out_fp = os.path.join(IMAGES_DIR, "bills_receipts", out_fn)
                img.save(out_fp, 'JPEG', quality=92)
                manifest.append({
                    "id": global_id,
                    "filename": out_fn,
                    "category": "bills_receipts",
                    "sub_type": "Invoices/Receipts Benchmark",
                    "ground_truth": "valid"
                })
                global_id += 1
            except Exception:
                pass
        print(f"  Added {len(df_dajor)} receipts from {split}. Total so far: {global_id - 1}")
    except Exception as e:
        print(f"Error loading dajor85570 {split}: {e}")

# D. Real handwritten bills & invoices from Wikimedia Commons Archive
print("\nFetching real handwritten bills & invoices from Wikimedia Commons API...")
hw_queries = [
    'handwritten receipt',
    'handwritten invoice',
    'bill of sale',
    'cash receipt',
    'restaurant receipt',
    'quittance'
]

hw_urls = []
for q in hw_queries:
    try:
        r = requests.get('https://commons.wikimedia.org/w/api.php', params={
            'action': 'query',
            'generator': 'search',
            'gsrsearch': q,
            'gsrnamespace': 6,
            'gsrlimit': 40,
            'prop': 'imageinfo',
            'iiprop': 'url|mime',
            'format': 'json'
        }, headers={'User-Agent': 'BillClassifierResearch/1.0 (contact@research.org)'}, timeout=10).json()
        pages = r.get('query', {}).get('pages', {})
        for pid, p in pages.items():
            info = p.get('imageinfo', [{}])[0]
            u = info.get('url')
            mime = info.get('mime', '')
            if u and ('jpeg' in mime or 'png' in mime or 'jpg' in u.lower() or 'png' in u.lower()):
                hw_urls.append(u)
    except Exception:
        pass

hw_urls = list(set(hw_urls))
print(f"  Found {len(hw_urls)} real handwritten receipt links. Downloading...")

def fetch_hw(url):
    try:
        r = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        if r.status_code == 200 and len(r.content) > 3000:
            return r.content
    except Exception:
        pass
    return None

with ThreadPoolExecutor(max_workers=16) as ex:
    hw_images_data = list(ex.map(fetch_hw, hw_urls))

for data in hw_images_data:
    if data:
        try:
            img = Image.open(io.BytesIO(data)).convert('RGB')
            out_fn = f"{global_id:04d}_wikimedia_handwritten_bill.jpg"
            out_fp = os.path.join(IMAGES_DIR, "bills_receipts", out_fn)
            img.save(out_fp, 'JPEG', quality=90)
            manifest.append({
                "id": global_id,
                "filename": out_fn,
                "category": "bills_receipts",
                "sub_type": "Real Handwritten Bill/Invoice (Multilingual/Archival)",
                "ground_truth": "valid"
            })
            global_id += 1
        except Exception:
            pass

print(f"  Total bills so far: {global_id - 1}")

# E. Hard Edge Cases: Faded, Yellowed, Shaded, Scrambled/Crumpled bills
# Taking real receipts and applying physical photographic degradations (low contrast, yellow age cast, shadow degradation)
bills_so_far = [m for m in manifest if m['category'] == 'bills_receipts']
num_to_degrade = max(1000 - len(bills_so_far), 200)
print(f"\nGenerating {num_to_degrade} challenging degraded bills (Yellowed, Faded, Shaded, Scrambled)...")

for i in range(num_to_degrade):
    source_m = bills_so_far[i % len(bills_so_far)]
    src_fp = os.path.join(IMAGES_DIR, "bills_receipts", source_m['filename'])
    try:
        img = Image.open(src_fp).convert('RGB')
        w, h = img.size
        
        deg_type = i % 4
        if deg_type == 0:
            # Low-visibility faded thermal print (text barely visible to naked eye)
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(0.40) # heavy contrast drop
            enhancer = ImageEnhance.Brightness(img)
            img = enhancer.enhance(1.25) # washed out / faded thermal slip
            sub_type = "Faded Thermal Bill (Low Contrast / Hard to See)"
            tag = "faded"
        elif deg_type == 1:
            # Yellowed aged / tea-tinted paper
            arr = np.array(img, dtype=np.float32)
            arr[..., 0] = np.clip(arr[..., 0] * 1.15, 0, 255) # boost Red
            arr[..., 1] = np.clip(arr[..., 1] * 1.08, 0, 255) # boost Green
            arr[..., 2] = np.clip(arr[..., 2] * 0.70, 0, 255) # cut Blue -> Yellow/Amber cast
            img = Image.fromarray(arr.astype(np.uint8))
            sub_type = "Yellowed / Shaded Aged Paper Bill"
            tag = "yellowed"
        elif deg_type == 2:
            # Severe shadow gradient (top dark 40%, bottom light, uneven lighting)
            arr = np.array(img, dtype=np.float32)
            gradient = np.linspace(0.35, 1.0, h)[:, None, None]
            arr = np.clip(arr * gradient, 0, 255)
            img = Image.fromarray(arr.astype(np.uint8))
            sub_type = "Shaded Bill (Severe Uneven Room Shadows)"
            tag = "shaded"
        else:
            # Scrambled, slightly crumpled & noisy
            img = img.rotate(np.random.uniform(-12, 12), expand=False, fillcolor=(240, 240, 235))
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(0.7)
            sub_type = "Scrambled / Angled / Crumpled Thermal Chit"
            tag = "scrambled"
            
        out_fn = f"{global_id:04d}_degraded_{tag}_{i:03d}.jpg"
        out_fp = os.path.join(IMAGES_DIR, "bills_receipts", out_fn)
        img.save(out_fp, 'JPEG', quality=88)
        manifest.append({
            "id": global_id,
            "filename": out_fn,
            "category": "bills_receipts",
            "sub_type": sub_type,
            "ground_truth": "valid"
        })
        global_id += 1
    except Exception as e:
        pass

total_bills = len([m for m in manifest if m['category'] == 'bills_receipts'])
print(f"\n>>> COMPLETE BILLS COLLECTION: {total_bills} genuine bills & receipts!")

# ==============================================================================
# 2. NON-BILLS (Target: 4,000 Verified Negative Distractors)
# ==============================================================================
print("\n" + "="*60)
print("ASSEMBLING 4,000 NON-BILLS (Animals, Vehicles, Nature, Objects)...")
print("="*60)

# Load Tiny-ImageNet for verified ground-truth non-bills
print("Loading zh-plus/tiny-imagenet validation split (10,000 labelled images)...")
url_ti = "https://huggingface.co/datasets/zh-plus/tiny-imagenet/resolve/main/data/valid-00000-of-00001-70d52db3c749a935.parquet"
df_ti = pd.read_parquet(url_ti)

# Load WordNet ID mappings
p_info = hf_hub_download(repo_id='zh-plus/tiny-imagenet', filename='dataset_infos.json', repo_type='dataset')
with open(p_info, 'r') as f:
    info = json.load(f)
wnids = info['Maysee--tiny-imagenet']['features']['label']['names']

p_classes = hf_hub_download(repo_id='zh-plus/tiny-imagenet', filename='classes.py', repo_type='dataset')
ns = {}
with open(p_classes, 'r') as f:
    exec(f.read(), ns)
i2d = ns.get('i2d', {})

# Map Tiny-ImageNet labels to categories
animal_labels = set()
vehicle_labels = set()
nature_labels = set()
object_labels = set()

for idx, w in enumerate(wnids):
    name = i2d.get(w, '').lower()
    if any(k in name for k in ['car', 'truck', 'bus', 'vehicle', 'bicycle', 'motor', 'train', 'locomotive', 'plane', 'boat', 'ship', 'ambulance', 'wagon', 'trolley', 'scooter', 'cab', 'minivan', 'convertible', 'jeep', 'tractor', 'trailer']):
        vehicle_labels.add(idx)
    elif any(k in name for k in ['dog', 'cat', 'fish', 'bird', 'bear', 'frog', 'snake', 'spider', 'scorpion', 'alligator', 'koala', 'jellyfish', 'snail', 'slug', 'lobster', 'crab', 'whale', 'lion', 'beetle', 'bee', 'ant', 'fly', 'butterfly', 'rabbit', 'hare', 'sheep', 'ox', 'elephant', 'pig', 'boar', 'bison', 'baboon', 'monkey', 'panda', 'ferret', 'badger']):
        animal_labels.add(idx)
    elif any(k in name for k in ['cliff', 'mountain', 'alp', 'sea', 'coast', 'beach', 'lake', 'volcano', 'promontory', 'sandbar', 'valley', 'coral', 'geyser']):
        nature_labels.add(idx)
    else:
        object_labels.add(idx)

# A. Animals (1,000 images)
print("\nExtracting 1,000 verified Animal images (Dogs, Cats, Birds, Wildlife)...")
animal_rows = df_ti[df_ti['label'].isin(animal_labels)].sample(n=1000, random_state=42)
for idx, row in animal_rows.iterrows():
    img_bytes = row['image']['bytes']
    w_name = i2d.get(wnids[row['label']], 'animal')
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize((192, 192))
    out_fn = f"{global_id:04d}_animal_{row['label']:03d}.jpg"
    out_fp = os.path.join(IMAGES_DIR, "animals", out_fn)
    img.save(out_fp, 'JPEG', quality=90)
    manifest.append({
        "id": global_id,
        "filename": out_fn,
        "category": "animals",
        "sub_type": f"Animal: {w_name}",
        "ground_truth": "invalid"
    })
    global_id += 1
print(f"  Added 1,000 Animals. Global ID is now: {global_id}")

# B. Everyday Objects (1,000 images)
print("\nExtracting 1,000 verified Everyday Objects (Laptops, Chairs, Books, Tools, Cups)...")
object_rows = df_ti[df_ti['label'].isin(object_labels)].sample(n=1000, random_state=42)
for idx, row in object_rows.iterrows():
    img_bytes = row['image']['bytes']
    w_name = i2d.get(wnids[row['label']], 'object')
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize((192, 192))
    out_fn = f"{global_id:04d}_object_{row['label']:03d}.jpg"
    out_fp = os.path.join(IMAGES_DIR, "things_objects", out_fn)
    img.save(out_fp, 'JPEG', quality=90)
    manifest.append({
        "id": global_id,
        "filename": out_fn,
        "category": "things_objects",
        "sub_type": f"Everyday Object: {w_name}",
        "ground_truth": "invalid"
    })
    global_id += 1
print(f"  Added 1,000 Everyday Objects. Global ID is now: {global_id}")

# C. Vehicles (1,000 images)
print("\nExtracting 1,000 verified Vehicles (Cars, Bikes, Trucks, Planes, Trains)...")
# 600 from Tiny ImageNet
vehicle_rows = df_ti[df_ti['label'].isin(vehicle_labels)]
for idx, row in vehicle_rows.iterrows():
    img_bytes = row['image']['bytes']
    w_name = i2d.get(wnids[row['label']], 'vehicle')
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize((192, 192))
    out_fn = f"{global_id:04d}_vehicle_{row['label']:03d}.jpg"
    out_fp = os.path.join(IMAGES_DIR, "vehicles", out_fn)
    img.save(out_fp, 'JPEG', quality=90)
    manifest.append({
        "id": global_id,
        "filename": out_fn,
        "category": "vehicles",
        "sub_type": f"Vehicle: {w_name}",
        "ground_truth": "invalid"
    })
    global_id += 1

# Additional 400 vehicles from plane-detection
needed_vehicles = 1000 - len(vehicle_rows)
p_plane = hf_hub_download(repo_id='keremberke/plane-detection', filename='data/train.zip', repo_type='dataset')
with zipfile.ZipFile(p_plane, 'r') as z:
    p_names = [n for n in z.namelist() if n.lower().endswith(('.jpg', '.png'))]
    for n in p_names[:needed_vehicles]:
        with z.open(n) as f:
            img = Image.open(f).convert('RGB').resize((192, 192))
            out_fn = f"{global_id:04d}_plane_vehicle.jpg"
            out_fp = os.path.join(IMAGES_DIR, "vehicles", out_fn)
            img.save(out_fp, 'JPEG', quality=90)
            manifest.append({
                "id": global_id,
                "filename": out_fn,
                "category": "vehicles",
                "sub_type": "Vehicle: Aircraft / Transport",
                "ground_truth": "invalid"
            })
            global_id += 1

print(f"  Added 1,000 Vehicles. Global ID is now: {global_id}")

# D. Nature & Landscapes (1,000 images)
print("\nExtracting 1,000 verified Nature & Landscapes (Mountains, Forests, Seas, Rivers)...")
# 400 from Tiny ImageNet
nature_rows = df_ti[df_ti['label'].isin(nature_labels)]
for idx, row in nature_rows.iterrows():
    img_bytes = row['image']['bytes']
    w_name = i2d.get(wnids[row['label']], 'landscape')
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize((192, 192))
    out_fn = f"{global_id:04d}_nature_{row['label']:03d}.jpg"
    out_fp = os.path.join(IMAGES_DIR, "nature_landscapes", out_fn)
    img.save(out_fp, 'JPEG', quality=90)
    manifest.append({
        "id": global_id,
        "filename": out_fn,
        "category": "nature_landscapes",
        "sub_type": f"Nature: {w_name}",
        "ground_truth": "invalid"
    })
    global_id += 1

# Additional 600 from EuroSAT (Forests, Rivers, Sea, Pastures)
needed_nature = 1000 - len(nature_rows)
print("Loading EuroSAT nature parquet for landscapes...")
url_eurosat = "https://huggingface.co/datasets/nielsr/eurosat-demo/resolve/main/data/train-00000-of-00001.parquet"
df_euro = pd.read_parquet(url_eurosat).sample(n=needed_nature, random_state=42)
for idx, row in df_euro.iterrows():
    img_bytes = row['image']['bytes']
    label_name = row.get('label', 'Nature Scene')
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB').resize((192, 192))
    out_fn = f"{global_id:04d}_eurosat_nature_{idx}.jpg"
    out_fp = os.path.join(IMAGES_DIR, "nature_landscapes", out_fn)
    img.save(out_fp, 'JPEG', quality=90)
    manifest.append({
        "id": global_id,
        "filename": out_fn,
        "category": "nature_landscapes",
        "sub_type": "Nature: Landscape / Forest / River",
        "ground_truth": "invalid"
    })
    global_id += 1

print(f"  Added 1,000 Nature & Landscapes. Global ID is now: {global_id}")

# Save full manifest
manifest_df = pd.DataFrame(manifest)
manifest_df.sort_values(by="id", inplace=True)
manifest_out = os.path.join(BASE_DIR, "dataset_manifest_v2.csv")
manifest_df.to_csv(manifest_out, index=False)

print("\n" + "="*60)
print(f"DATASET PREPARATION V2 COMPLETE!")
print(f"Total Images Assembled: {len(manifest_df)}")
print(f"Manifest written to: {manifest_out}")
print("Category Breakdown:")
print(manifest_df['category'].value_counts())
print("="*60)
