# Bill Snap — Smart Receipt Scanner & Expense Tracker

> **Edge-to-Cloud Intelligent Receipt Scanner, Financial Categorization & Offline Progressive Web App (PWA)**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ONNX Runtime Web](https://img.shields.io/badge/ONNX_Runtime_Web-1.21.0-005CED?logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-Vision_Multimodal-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB_Offline-336791?logo=sqlite&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![PWA](https://img.shields.io/badge/PWA-Installable_Offline-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

---

## 📋 Table of Contents
1. [Product Overview & Elevator Pitch](#1-product-overview--elevator-pitch)
2. [HCI & UI/UX Design System (Authoritative Citations & App Proofs)](#2-hci--uiux-design-system)
   - [Mobile Ergonomics & Physical Interaction](#1-mobile-ergonomics--physical-interaction)
   - [Cognitive Psychology & Decision-Making](#2-cognitive-psychology--decision-making)
   - [Visual Perception & Layout Stability](#3-visual-perception--layout-stability)
   - [Usability Heuristics & Error Handling](#4-usability-heuristics--error-handling)
   - [Semantic Color Theory & Accessibility (WCAG 2.1)](#5-semantic-color-theory--accessibility-wcag-21)
3. [System Architecture: The Edge-to-Cloud Cascaded Pipeline](#3-system-architecture-the-edge-to-cloud-cascaded-pipeline)
4. [On-Device Machine Learning Engine (MobileNetV3 ONNX)](#4-on-device-machine-learning-engine-mobilenetv3-onnx)
5. [Assignment ML Deliverable: 20-Image End-to-End Evaluation](#5-assignment-ml-deliverable-20-image-end-to-end-evaluation)
6. [Architectural Decisions & Engineering Trade-Offs](#6-architectural-decisions--engineering-trade-offs)
7. [Repository File Structure](#7-repository-file-structure)
8. [Quick Start & Local Setup](#8-quick-start--local-setup)

---

## 1. Product Overview & Elevator Pitch

Tracking personal and business expenses from physical receipts is notoriously tedious. Users are forced to manually type store names, dates, line items, and totals into spreadsheets or finance apps, resulting in lost receipts, untracked spending, and friction.

**Bill Snap** solves this by turning any mobile smartphone into an intelligent, instant expense scanner:
1. **Instant On-Device Pre-Filter (0 ms – 700 ms on Mobile)**: Uses a local MobileNetV3 deep learning model running in WebAssembly to verify receipts directly in phone memory before making any cloud network requests.
2. **Multimodal Cloud Extraction**: Automatically extracts merchant name, transaction date, total amount, currency, and categorizes spending (`Food`, `Groceries`, `Utilities`, `Shopping`, `Travel`, `Health`, `Other`).
3. **Distributed Multi-Batch Scanning**: Select and process multiple receipt chits in parallel with dynamic model sharding (distributing requests across available Gemini models), inline soft-rejection handling, and zero-CLS concurrency protection.
4. **Field Uncertainty Awareness**: Surfaces confidence evaluations for every extracted field and marks blurry, smudged, or handwritten data in amber for user correction before committing to disk.
5. **Bring Your Own Key (BYOK) Architecture**: Direct browser-to-Google Gemini API communication without any intermediate backend servers, developer proxies, or telemetry tracking. API keys and saved receipts stay encrypted in device `localStorage` and `IndexedDB`.
6. **Installable PWA**: Launches full-screen like a native mobile app directly from the home screen, works offline, and interfaces directly with camera hardware (`capture="environment"`).

<p align="center">
  <img src="app_pics/homepage-3.jpeg" alt="Bill Snap Home Screen" width="300">
  <br>
  <em>Figure 1.1: Bill Snap Live Mobile Home Screen — Royal Indigo spending hero card and scrollable receipt feed.</em>
</p>

---

## 2. HCI & UI/UX Design System

Every user interface component and interaction pattern across Bill Snap is intentionally engineered using established **Human-Computer Interaction (HCI)** and **Cognitive Psychology** principles, validated against research from Jon Yablonski’s [Laws of UX](https://lawsofux.com/), the [Nielsen Norman Group (NN/g)](https://www.nngroup.com/), Google Web Vitals, and W3C WCAG 2.1 standards.

---

### 1. Mobile Ergonomics & Physical Interaction

#### A. Steven Hoober’s Thumb Zone
* **Authoritative Citation:** Steven Hoober (2013), *Designing Mobile Interfaces* & research published in Smashing Magazine (*[How Do Users Really Hold Mobile Devices?](https://www.smashingmagazine.com/2013/02/how-do-users-really-hold-mobile-devices/)*).
* **The Rule:** ~49% of smartphone users navigate with a single hand, relying exclusively on their thumb. Touch targets must cluster in the lower third ("Natural Zone") of the screen to minimize grip shifting, hand gymnastics, and thumb strain.

<p align="center">
  <img src="app_pics/homepage-2.jpeg" alt="Steven Hoober Thumb Zone FAB Speed Dial" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/categorical-and-mothly-analysis-of-bills.jpeg" alt="Bottom Sheet Modal Reachability" width="280">
  <br>
  <em>Figure 2.1: Steven Hoober's Thumb Zone — Primary actions anchored in the natural lower thumb arc (Bottom-anchored FAB speed dial and Bottom-Sheet spending modal).</em>
</p>

* **How Bill Snap Implements It:**
  - **Floating Action Button (FAB):** The primary Camera / Batch Gallery button is anchored at the bottom-right (`bottom-6 right-6`), placing the most critical action directly under the natural thumb arc.
  - **Bottom Sheet Modals:** The Category Spending, Export, and Settings views slide up from the bottom edge (`items-end sm:items-center rounded-t-3xl`), keeping dismiss handles and primary CTAs within one-thumb reach instead of centering them out-of-reach at the top of tall 20:9 screens.
  - **Safe-Area Gesture Clearance:** Left clean negative space at the bottom of the sidebar drawer to avoid mis-taps with Android/iOS gesture navigation bars.

---

#### B. Fitts’s Law & Minimum Touch Targets
* **Authoritative Citation:** Paul M. Fitts (1954); Jon Yablonski (*[Laws of UX: Fitts’s Law](https://lawsofux.com/fittss-law/)*); W3C WCAG 2.1 (*[Success Criterion 2.5.5 / 2.5.8 Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)*).
* **The Rule:** The time to acquire a target is a function of the distance to and size of the target. Mobile touch targets must be at least $44 \times 44\text{px}$ to $48 \times 48\text{px}$ to prevent mis-clicks.

<p align="center">
  <img src="app_pics/sidebar-1.jpeg" alt="Fitts's Law Full Width Tap Targets" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/homepage-3.jpeg" alt="Fitts's Law Delete Target on Bill Card" width="280">
  <br>
  <em>Figure 2.2: Fitts's Law — Full-width 64px tap surfaces in the sidebar drawer and permanent red delete touch containers on bill cards.</em>
</p>

* **How Bill Snap Implements It:**
  - **Full-Width Drawer Action Rows:** Every drawer row (Export, AI Engine, API Key) is a `w-full` container with `p-3.5` padding, providing a large $\approx 64\text{px}$ tap surface.
  - **Delete Action Affordance:** On bill list cards, the delete button is a permanent `w-9 h-9` ($36\text{px}$ with surrounding margin padding) rounded container with a high-contrast red background, eliminating the tiny invisible hitboxes common in unpolished apps.

---

### 2. Cognitive Psychology & Decision-Making

#### A. Hick’s Law (Choice Overload Reduction)
* **Authoritative Citation:** William Edmund Hick & Ray Hyman (1952); Jon Yablonski (*[Laws of UX: Hick’s Law](https://lawsofux.com/hicks-law/)*).
* **The Rule:** The time to make a decision increases logarithmically with the number and complexity of choices.

<p align="center">
  <img src="app_pics/homepage-1.jpeg" alt="Hick's Law Empty Screen Simplicity" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/homepage-3.jpeg" alt="Hick's Law Focused Home Feed" width="280">
  <br>
  <em>Figure 2.3: Hick's Law — Focused home feed presenting only two clear actions on empty state (Snap or Gallery) and a single primary feed on populated state.</em>
</p>

* **How Bill Snap Implements It:**
  - **Focused Home Feed:** The main screen does not overwhelm the user with multiple export switches, API inputs, or complicated form wizards. It presents one primary path: snap/pick a bill, or review recent bills.
  - **Decoupled Modals:** Rather than embedding date-range pickers and API key testing inline inside the drawer, each complex task is partitioned into its own modal dialog.

---

#### B. Progressive Disclosure
* **Authoritative Citation:** Jakob Nielsen, Nielsen Norman Group (*[NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)*).
* **The Rule:** Defer advanced or rarely used features to secondary screens to avoid overwhelming novice users during core tasks.

<p align="center">
  <img src="app_pics/sidebar-1.jpeg" alt="Progressive Disclosure in Tiered Sidebar Settings" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/multi-batch-processing-1.jpeg" alt="Progressive Disclosure in Multi-Batch Review" width="280">
  <br>
  <em>Figure 2.4: Progressive Disclosure — Advanced configurations tucked neatly into sub-modals, and multi-bill batch processing with progressive inline triage.</em>
</p>

* **How Bill Snap Implements It:**
  - **Tiered Settings Architecture:** Advanced configurations (Dynamic Gemini Model Fallback Queue, On-Device Classifier toggle, LocalStorage cache inspection) are nested cleanly inside the AI Engine & Models modal rather than cluttering the main menu.
  - **Batch Thumbnail Drawer:** During multi-bill selection, thumbnails appear in a compact sequential triage list with step-by-step review, avoiding a chaotic wall of forms.

---

### 3. Visual Perception & Layout Stability

#### A. Zero Cumulative Layout Shift (CLS = 0)
* **Authoritative Citation:** Google Web Vitals & W3C Web Performance Working Group (*[web.dev: Cumulative Layout Shift](https://web.dev/articles/cls)*).
* **The Rule:** Prevent unexpected visual movement during interaction. Layout shifts above $0.1$ cause accidental clicks and visual disorientation.

<p align="center">
  <img src="app_pics/sidebar-1.jpeg" alt="Zero CLS Fixed Height Rows" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/homepage-3.jpeg" alt="Zero CLS Fixed Top Hero Card" width="280">
  <br>
  <em>Figure 2.5: Zero Cumulative Layout Shift — Fixed drawer row heights opening dedicated modals (no accordion jumps) and fixed top hero container while only the list scrolls.</em>
</p>

* **How Bill Snap Implements It:**
  - **Fixed Drawer Row Heights:** Replaced expanding accordion rows (which previously pushed the entire drawer down by $+75\text{px}$ when tapping "Date Range") with fixed-height rows that open dedicated modals.
  - **Isolated Scroll Containers:** The header and aggregate spending card are fixed (`shrink-0`), while only the bill list scrolls (`flex-1 overflow-y-auto`). The interface never jumps or resizes while browsing.

---

#### B. Gestalt Principles: Law of Common Region & Proximity
* **Authoritative Citation:** Max Wertheimer (1923); Jon Yablonski (*[Laws of UX: Law of Common Region](https://lawsofux.com/law-of-common-region/)*); NN/g (*[Gestalt Proximity](https://www.nngroup.com/articles/gestalt-proximity/)*).
* **The Rule:** Elements positioned within the same bounded enclosure or placed close together are perceived as belonging to a single functional group.

<p align="center">
  <img src="app_pics/sidebar-1.jpeg" alt="Gestalt Law of Common Region in Sidebar" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/homepage-3.jpeg" alt="Gestalt Law of Common Region in Feed" width="280">
  <br>
  <em>Figure 2.6: Gestalt Law of Common Region — Distinct bounded cards grouping related controls in the sidebar drawer and encapsulating individual bill items in the feed.</em>
</p>

* **How Bill Snap Implements It:**
  - **Card Grouping:** Encapsulated related settings into three bordered cards (`bg-slate-50 border border-slate-200/70`):
    - **Card 1:** File Export (CSV / XLSX)
    - **Card 2:** AI & Model Intelligence (CPU, Pre-Filter, API Key)
    - **Card 3:** On-Device Storage (IndexedDB stats + Wipe action)
  - **Split Storage Tiles:** Bills count (`w-[38%]`) and Data Used (`flex-1`) share a single enclosing card with clear visual grouping.

---

### 4. Usability Heuristics & Error Handling

#### A. Visibility of System Status (Heuristic #1)
* **Authoritative Citation:** Jakob Nielsen, Nielsen Norman Group (*[NN/g 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)*).
* **The Rule:** The system should always keep users informed about what is happening through timely, appropriate feedback.

<p align="center">
  <img src="app_pics/local-model-bill-acceptance.jpeg" alt="System Status Visibility Edge Verified" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/saving-bill.jpeg" alt="System Status Pipeline Telemetry" width="280">
  <br>
  <em>Figure 2.7: Visibility of System Status — Real-time telemetry badges: "Verified Receipt (100% confidence) • 117ms", "3.1-flash-lite", and "Pipeline: Edge-Verified (MobileNetV3) 399ms".</em>
</p>

* **How Bill Snap Implements It:**
  - **Live Model Pulse:** Displays a green pulsating badge (`[● LIVE]`) and the exact active model name (e.g., `3.1-flash-lite`).
  - **Verified Key Badge:** The API key status dynamically reflects real-time Google API connectivity (`[✓ Verified & Connected]`).
  - **Storage Telemetry:** Real-time IndexedDB byte footprint display (`Used: 13.92 MB`).

---

#### B. Error Prevention & User Control (Heuristics #3 & #5)
* **Authoritative Citation:** Jakob Nielsen, Nielsen Norman Group (*[NN/g Error Prevention](https://www.nngroup.com/articles/ten-usability-heuristics/)*).
* **The Rule:** Prevent slips before they occur, provide clear emergency exits, and let users review decisions before committing data.

<p align="center">
  <img src="app_pics/bill-rejection-1.jpeg" alt="Soft Rejection with Scan Anyway Override" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/saving-bill.jpeg" alt="Pre-Save Editable Form Fields" width="280">
  <br>
  <em>Figure 2.8: Error Prevention & User Control — Zero Lockout Policy ("Scan Anyway" override) and pre-save editable review inputs with confidence ratings.</em>
</p>

* **How Bill Snap Implements It:**
  - **Pre-Save Confidence Review:** If Gemini flags low confidence (e.g., a crumpled total or faded date), field-level warning badges highlight the exact issue, giving the user full freedom to fix the values before saving.
  - **Destructive Two-Step Confirmation:** "Clear All Saved Bills" triggers a browser confirmation dialog before erasing IndexedDB records.
  - **Gentle Edge Rejection & Zero Lockout:** When an image is not a receipt (a selfie or ID), the app politely informs the user without throwing raw code errors and provides a manual override button (**"Scan Anyway"**).

---

#### C. Doherty Threshold (<400ms Rule)
* **Authoritative Citation:** Walter J. Doherty & Ahrvind J. Thadani (1982), IBM Research; Jon Yablonski (*[Laws of UX: Doherty Threshold](https://lawsofux.com/doherty-threshold/)*).
* **The Rule:** Productivity and user satisfaction soar when a system responds in under 400ms, eliminating the perception of lag.

<p align="center">
  <img src="app_pics/local-model-bill-acceptance.jpeg" alt="Doherty Threshold 117ms Edge Execution" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/saving-bill.jpeg" alt="Doherty Threshold Sub-400ms Pipeline" width="280">
  <br>
  <em>Figure 2.9: Doherty Threshold — Sub-400ms speed verified live on mobile device (⚡ 117ms on-device edge validation and 399ms total pipeline latency).</em>
</p>

* **How Bill Snap Implements It:**
  - **Edge Inference:** The on-device MobileNetV3 model executes in $\approx 0\text{ms} - 700\text{ms}$ (sub-second on physical mobile devices) using WebAssembly, giving near-instant receipt validation before any cloud network trip.
  - **Tactile Button Feedback:** All interactive buttons incorporate `active:scale-95` micro-animations and loading spinners within $<50\text{ms}$ of being tapped.

---

#### D. Polite Non-Bill Rejection (Core Assignment Requirement)
* **Authoritative Citation:** NN/g Heuristic #9 (*[Help users recognize, diagnose, and recover from errors](https://www.nngroup.com/articles/ten-usability-heuristics/)*).
* **The Rule:** Error messages should be expressed in plain language (no codes), precisely indicate the problem, and constructively suggest a solution.

<p align="center">
  <img src="app_pics/bill-rejection-2.jpeg" alt="Polite Rejection on Technical Diagram" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/multi-batch-processing-2.jpeg" alt="Polite Rejection on Internship Poster" width="280">
  <br>
  <em>Figure 2.10: Polite Non-Bill Rejection — Plain-language explanations detailing why non-receipts (CNN technical diagram, internship poster) cannot be scanned.</em>
</p>

* **How Bill Snap Implements It:**
  - When non-bills are detected, the UI renders a soft rose card explaining exactly what was seen (e.g., *"This image appears to be a technical diagram of a convolutional neural network, not a receipt or bill. Please upload a clear photo of a receipt or bill."*), accompanied by a one-tap `"Pick Another Photo"` recovery button.

---

### 5. Semantic Color Theory & Accessibility (WCAG 2.1)

#### A. WCAG 2.1 Guideline 1.4.1 (Use of Color - Triple Encoding)
* **Authoritative Citation:** W3C Web Accessibility Initiative (*[WCAG 2.1: Guideline 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)*).
* **The Rule:** Color must not be used as the sole visual means of conveying information, indicating an action, or distinguishing an element.

<p align="center">
  <img src="app_pics/categorical-and-mothly-analysis-of-bills.jpeg" alt="WCAG 2.1 Triple Encoding in Categories" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/saving-bill.jpeg" alt="WCAG 2.1 Triple Encoding in Form Review" width="280">
  <br>
  <em>Figure 2.11: WCAG 2.1 Guideline 1.4.1 — Triple simultaneous encoding: Icon, plain text string, and exact numerical data across every category and form field.</em>
</p>

* **How Bill Snap Implements It:**
  - In the Category Spending screen and Bill Cards, every category uses **three simultaneous cues**:
    1. **Icon**: (`Utensils`, `ShoppingCart`, `Zap`, `ShoppingBag`, `Car`, `HeartPulse`)
    2. **Label**: Plain text string (`Food`, `Groceries`, `Utilities`, etc.)
    3. **Data**: Exact numerical amount and percentage (`₹731.43 • 45.9%`)

---

#### B. FinTech Cognitive Mental Models & Jakob’s Law
* **Authoritative Citation:** Jakob’s Law of Internet User Experience; Jon Yablonski (*[Laws of UX: Jakob’s Law](https://lawsofux.com/jakobs-law/)*).
* **The Rule:** Align visual styles with mental models users have already established across mainstream finance applications (Apple Wallet, Revolut, Mint).

<p align="center">
  <img src="app_pics/categorical-and-mothly-analysis-of-bills.jpeg" alt="FinTech Mental Models Segmented Bar" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/homepage-3.jpeg" alt="FinTech Mental Models Color System across Feed" width="280">
  <br>
  <em>Figure 2.12: FinTech Cognitive Mental Models — Multi-colored segmented progress bar and category color hierarchy aligned with established finance applications.</em>
</p>

* **How Bill Snap Implements It:**
  - 🟣 **Indigo (`#4f46e5`)**: Primary brand actions and data utilities (Export, Save & Test, Download).
  - 🟢 **Emerald (`#10b981`)**: Intelligence & healthy system state (AI Models, Pre-filter ON, Verified Key).
  - 🔵 **Blue (`#3b82f6`)**: Travel and commute (replaces danger red to prevent false alarms of negative balances).
  - 🔴 **Rose (`#f43f5e`)**: Exclusively reserved for destructive operations (Delete bill, Clear DB, Clear key).

---

## 3. System Architecture: The Edge-to-Cloud Cascaded Pipeline

In modern productivity utilities, dispatching large images of non-receipts (selfies, ID cards, landscape photos) directly to cloud multimodal APIs wastes user quota, drains battery, and introduces 2–4 seconds of network latency just to tell the user: *"This is not a bill"*.

Bill Snap solves this by implementing an **Edge-to-Cloud Cascaded Architecture**:

```mermaid
flowchart TD
    A["📷 Camera Capture / Gallery Pick\n(Original High-Res Photo)"] --> B["⚡ In-Memory Canvas Downsampler\n(192×192 RGB Planar Float32)"]
    B --> C["🔬 On-Device MobileNetV3 ONNX (WASM)\nLatency: 0ms – 700ms on Mobile • 100% Offline"]
    C --> D{"Confidence Score\nP(Valid) ≥ 0.65?"}
    D -->|No / P < 0.65| E["⚠️ Soft Rejection Banner\n'Receipt Not Detected'"]
    E -->|User Override| F["✨ 'Scan Anyway' Button\n(Zero Lockout Policy)"]
    D -->|Yes / P ≥ 0.65| G["✅ Verified Receipt Badge\n(Instant Visual Feedback)"]
    F --> H["☁️ Cloud Gemini Multimodal API\n(High-Res Image Dispatched)"]
    G --> H
    H --> I["📝 Structured JSON Extraction\n• Merchant & Category\n• Date & Total Amount\n• Field Confidence Tags (High/Low)"]
    I --> J["✏️ Pre-Save Review & Edit Form\n(Amber Highlighting for Unsure Fields)"]
    J --> K["💾 Phone-Native IndexedDB Storage\n(Unlimited Offline Persistence)"]
```

### Distributed Multi-Batch Model Sharding
When users pick multiple receipts from their phone gallery, Bill Snap distributes the workload across active Gemini models in parallel, avoiding per-model rate limits while keeping batch processing fast:

```mermaid
flowchart LR
    A["📂 Gallery Multi-Select (e.g. 3 Receipts)"] --> B["Dynamic Concurrency Sharder"]
    B --> C["Receipt #1 ➔ gemini-3.1-flash-lite"]
    B --> D["Receipt #2 ➔ gemini-3.5-flash"]
    B --> E["Receipt #3 ➔ gemini-3.5-flash-lite"]
    C --> F["Unified Batch Triage Screen"]
    D --> F
    E --> F
```

<p align="center">
  <img src="app_pics/Limit_exceeded-multi-batch.jpeg" alt="Batch Concurrency Limit Protection" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/multi-batch-processing-1.jpeg" alt="Distributed Multi-Batch Review Grid" width="280">
  <br>
  <em>Figure 3.1: Distributed Multi-Batch Processing — Left: Non-intrusive floating toast enforcing safe AI model concurrency limits. Right: Parallel sharded triage grid with per-card model badges and inline soft rejection.</em>
</p>

#### Multi-Batch UX & Concurrency Architecture:
- **Dynamic Model-Aware Rate-Limiting**: The app calculates safe batch capacity in real time based on active models cached on the device: `batchLimit = max(1, min(5, N - 1))`, reserving at least one model in reserve for quota headroom.
- **Zero-CLS Floating Toast (Left Image)**: If a user selects more files than safe concurrency allows (e.g., 5 receipts when limit is 4), a high-contrast floating toast appears at `fixed top-4` with backdrop blur. It informs the user transparently without shifting page layout (`CLS = 0`) and auto-dismisses or closes on tap (`X`).
- **Parallel Sharded Triage Grid (Right Image)**: Each receipt is sharded to an independent model (`#1 3.1-flash-lite`, `#2 3.5-flash`). Non-receipts (like the Bike Taxi photo) are immediately flagged with a soft rejection card offering both **"Scan Anyway"** (user override) and **"Dismiss"**, while calculating the batch total live in a sticky bottom summary bar.

---

## 4. On-Device Machine Learning Engine (MobileNetV3 ONNX)

| Specification | Technical Value | Engineering Context |
| :--- | :--- | :--- |
| **Model Architecture** | **MobileNetV3-Small** | Inverted residual bottlenecks with Squeeze-and-Excitation (SE) attention |
| **Execution Engine** | **ONNX Runtime Web** (`ort-wasm.wasm`) | Single-threaded WASM runtime executing 100% client-side |
| **Model Size & Precision** | **6.30 MB** (6,606,198 bytes) • **FP32** | Full precision avoids quantization probability drift on crumpled receipts |
| **Parameters** | **1,533,780 parameters** (~1.53M) | Highly compact for mobile browser RAM footprints |
| **Inference Latency** | **15 ms – 50 ms** (Desktop); **0 ms – 700 ms** (Mobile, typically sub-second) | Instant on-device pre-screening before cloud dispatch |
| **Empirical Threshold** | **`0.65`** ($P(\text{Valid}) \ge 0.65$) | Proven optimal cutoff maximizing distractor rejection without losing real bills |

### Netron Computational Graph
Below is the verified Netron computational graph of the bundled ONNX model. You can scroll through all layers inside the viewport at native 1:1 scale, or use the interactive zoom icons below to inspect the full architecture:

<p align="center">
  <a href="docs/assets/netron_architecture.svg" target="_blank">
    <img src="https://img.shields.io/badge/🔍%20Zoom%20In%20%2F%20Vector%20SVG-Open%20Interactive%20Graph-blue?style=for-the-badge&logo=onnx&logoColor=white" alt="Open Netron Vector SVG">
  </a>
  &nbsp;
  <a href="docs/assets/netron_architecture.png" target="_blank">
    <img src="https://img.shields.io/badge/🖼️%20Raster%20Overview-High%20Res%20PNG-grey?style=for-the-badge" alt="Open Netron PNG">
  </a>
</p>

<div align="center">
  <div style="max-height: 520px; max-width: 420px; overflow-y: auto; overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 16px; padding: 16px; background: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
    <a href="docs/assets/netron_architecture.svg" target="_blank" title="Click to open full zoomable vector graph in new tab">
      <img src="docs/assets/netron_architecture.svg" alt="Netron Computational Graph SVG" width="287" style="width: 287px; max-width: 100%; height: auto; display: block; margin: 0 auto;">
    </a>
  </div>
</div>
<p align="center">
  <em>💡 Figure 4.1: Model graph rendered at native 1:1 scale (287px width). Scroll vertically inside the container to inspect layers, or click the <strong>🔍 Zoom In / Vector SVG</strong> badge above to freely pan and zoom across the full 18,616px pipeline.</em>
</p>

### The 5,000-Image Empirical Benchmark & Threshold Proof
To eliminate guesswork, the model was evaluated across **5,000 verified images** (1,000 genuine bills vs. 4,000 negative distractors across animals, vehicles, objects, and landscapes).

<p align="center">
  <img src="docs/assets/threshold_analysis_proof.png" alt="Threshold Analysis Proof" width="550">
  <br>
  <em>Figure 4.2: Empirical threshold sweep curve demonstrating the 0.65 Pareto inflection point.</em>
</p>

* **99.70% Genuine Bill Recall**: 997 out of 1,000 real-world receipts are automatically passed.
* **99.45% Distractor Rejection**: Blocks 3,978 out of 4,000 random non-bill images before cloud API dispatch.
* **Inflection Point Proof**: Moving to $0.70$ causes genuine bill recall to drop to $99.50\%$. Therefore, **`0.65`** represents the exact Pareto-optimal boundary.

> 📖 **Deep Dive Documentation Links**:
> - [📘 Detailed Architecture, Netron Analysis & Quantization Trade-offs (model.md)](./model.md)
> - [📊 Full 5,000-Image Confusion Matrix & Failure Breakdown (test_local_model/benchmark_report_v2.md)](./test_local_model/benchmark_report_v2.md)

---

## 5. Assignment ML Deliverable: 20-Image End-to-End Evaluation

As requested by the hiring team, the complete app was evaluated end-to-end across a custom test set of **20 diverse real-world images** (15 real receipts—including crumpled, faded, handwritten, and angled chits—plus 5 non-bill distractors).

### Results Table (20 Images)

| # | Image Type & Description | Is Bill? | Merchant | Date | Total Amount | Category | Overall Result | Failure Analysis / Notes |
| :-: | :--- | :-: | :-: | :-: | :-: | :-: | :-: | :--- |
| **1** | Clean Supermarket Thermal Chit (DMart) | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Groceries | **PASS** | Crisp high-contrast print. All fields extracted with high confidence. |
| **2** | Folded Retail Receipt (Avenue Supermarts) | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Groceries | **PASS** | Horizontal crease across middle did not affect extraction. |
| **3** | Faded Thermal POS Slip (Restaurant) | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Food | **PASS** | Low contrast text recovered accurately. |
| **4** | Heavily Crumpled Food Chit | ✅ Yes | ✅ Right | ⚠️ Unsure (Right) | ✅ Right | ✅ Food | **PASS** | Date was wrinkled; model correctly tagged date as low-confidence. |
| **5** | Handwritten Shop Chit (Local Kirana) | ✅ Yes | ✅ Right | ❌ Wrong | ✅ Right | ✅ Other | **PARTIAL** | Date handwritten in non-standard format was misread. Merchant & Total were correct. |
| **6** | Dimly Lit Dining Receipt (Yellow bulb) | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Food | **PASS** | Amber cast filtered cleanly by multimodal prompt. |
| **7** | Severe 45° Angled Chit Photo | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Utilities | **PASS** | Perspective distortion handled gracefully. |
| **8** | Printed Pharmacy Invoice | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Health | **PASS** | Line items and tax summary parsed accurately. |
| **9** | Fuel Station Thermal Slip | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Travel | **PASS** | Auto-categorized as Travel & Fuel correctly. |
| **10** | A4 Printed Utility Invoice (Electricity) | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Utilities | **PASS** | Large document format handled without cropping errors. |
| **11** | Bookshop Chit with Pencil Additions | ✅ Yes | ✅ Right | ✅ Right | ⚠️ Unsure (Right) | ✅ Shopping | **PASS** | Total amount pencil note flagged in amber for user confirmation. |
| **12** | Blurry Mobile Camera Chit | ✅ Yes | ⚠️ Unsure (Right) | ✅ Right | ✅ Right | ✅ Food | **PASS** | Slight motion blur caused merchant low-confidence warning. |
| **13** | Torn Bottom Thermal Slip (Missing Footer) | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Other | **PASS** | Extracted grand total correctly despite torn tax footer. |
| **14** | Multi-Currency Hotel Folio ($ USD) | ✅ Yes | ✅ Right | ✅ Right | ✅ Right | ✅ Travel | **PASS** | Extracted `$` currency symbol and total amount properly. |
| **15** | Handwritten Hardware Receipt | ✅ Yes | ✅ Right | ❌ Wrong | ❌ Wrong | ✅ Other | **FAIL** | Heavy cursive handwriting on carbon paper led to misread amount. |
| **16** | Selfie of a Person | ❌ No | — | — | — | — | **PASS** | Politely rejected on-device and confirmed by AI. |
| **17** | Government ID Card | ❌ No | — | — | — | — | **PASS** | Politely rejected with document explanation. |
| **18** | Outdoor Landscape / Scenery | ❌ No | — | — | — | — | **PASS** | Blocked locally on-device (0ms – 700ms) by MobileNetV3. |
| **19** | Screenshot of Chat Conversation | ❌ No | — | — | — | — | **PASS** | Caught by edge filter; polite rejection shown. |
| **20** | Technical Neural Network Diagram | ❌ No | — | — | — | — | **PASS** | Polite rejection explaining diagram nature (`app_pics/bill-rejection-2.jpeg`). |

### Summary & Honest Failure Analysis
* **Bill Detection Accuracy**: **20 / 20 (100%)** — All bills were identified as bills; all 5 non-bills were politely rejected.
* **Field Extraction Accuracy (on 15 Bills)**:
  - **Merchant**: 15 / 15 (100%)
  - **Date**: 13 / 15 (86.7%)
  - **Total Amount**: 14 / 15 (93.3%)
  - **Category**: 15 / 15 (100%)
* **Why Failures Occurred**:
  1. **Carbon-Copy Cursive Ink (Chit #15)**: The carbon paper smudged numerical loops (`3` vs `8`), causing an amount discrepancy. This highlights the necessity of Bill Snap's **editable review form**, which allowed the user to correct the value in under two seconds.
  2. **Non-Standard Handwritten Date (Chit #5)**: The date written as *"5/11"* without year context was unparseable into ISO YYYY-MM-DD.

---

## 6. Architectural Decisions & Engineering Trade-Offs

### 1. Progressive Web App (PWA) vs. React Native (Expo)
* **Decision**: We chose **PWA (Vite + React + Tailwind)**.
* **Why**:
  - **Zero Install Friction**: Users don't need to download a 50MB APK or go through Google Play / App Store review cycles. A single link installs instantly to the phone home screen.
  - **WASM Speed**: Direct access to SIMD-accelerated WebAssembly through `onnxruntime-web` without React Native bridge serialization overhead.
  - **Native Hardware Access**: Modern browsers support the HTML5 Media Capture API (`capture="environment"`) to launch the rear camera directly.

### 2. Cascaded Edge Pre-Filter vs. Pure Cloud Dispatch
* **Decision**: Deployed an on-device MobileNetV3 classifier in front of the Gemini API.
* **Why**:
  - Saves user API quota from accidental non-receipt uploads.
  - Provides instant $\approx 15\text{ms}$ visual feedback instead of waiting 2–4 seconds for an API roundtrip.
  - Coupled with the **"Scan with AI Anyway"** override to ensure legitimate crumpled receipts are never locked out.

### 3. FP32 Precision vs. INT8 Quantization
* **Decision**: Retained **Full Precision FP32** ONNX weights ($6.30\text{MB}$).
* **Why**:
  - $6.30\text{MB}$ is already lightweight and caches indefinitely via Service Workers.
  - INT8 quantization distorts tail Softmax probabilities on noisy, degraded, or dim receipts. FP32 guarantees exact probability calibration.

### 4. Phone-Native IndexedDB vs. LocalStorage
* **Decision**: Built a storage layer on **IndexedDB** (`BillSnapDB`).
* **Why**:
  - `localStorage` has a strict $5\text{MB}$ synchronous quota, which crashes when storing photo Data URLs and blocks the UI thread during read/writes.
  - `IndexedDB` is asynchronous, handles hundreds of megabytes of receipt images effortlessly, and supports indexing by `date`, `category`, and `createdAt`.

---

## 7. Repository File Structure

```text
Bill Snap/
├── docs/
│   └── assets/
│       ├── netron_architecture.svg       # Full-resolution vector computational graph
│       ├── netron_architecture.png       # MobileNetV3 computational graph overview
│       └── threshold_analysis_proof.png  # 5,000-image Pareto threshold curve
├── app_pics/                             # Real mobile phone app screenshots
│   ├── homepage-2.jpeg                   # Home feed & thumb zone FAB
│   ├── homepage-3.jpeg                   # Multi-bill feed
│   ├── local-model-bill-acceptance.jpeg  # Verified receipt edge telemetry
│   ├── bill-rejection-1.jpeg             # Soft rejection & user override
│   ├── bill-rejection-2.jpeg             # Polite AI non-bill rejection
│   ├── saving-bill.jpeg                  # Pre-save review form
│   ├── categorical-and-mothly-analysis-of-bills.jpeg # Spending breakdown
│   ├── sidebar-1.jpeg                    # Tiered preferences drawer
│   └── multi-batch-processing-1.jpeg     # Multi-batch parallel processing
├── public/
│   ├── models/
│   │   └── model.onnx                    # 6.3MB MobileNetV3 ONNX weights
│   ├── manifest.webmanifest              # PWA manifest
│   └── sw.js                             # Offline caching service worker
├── src/
│   ├── components/
│   │   ├── AddBillFAB.jsx                # Ergonomic bottom action button
│   │   ├── ApiKeyModal.jsx               # BYOK Gemini manager
│   │   ├── BatchReview.jsx               # Multi-bill triage grid
│   │   ├── BillCard.jsx                  # Bill list item with touch delete
│   │   ├── BillResult.jsx                # Review & uncertainty edit form
│   │   ├── CategoryBreakdownModal.jsx    # Monthly spending analytics
│   │   ├── ExportModal.jsx               # CSV & XLSX spreadsheet exporter
│   │   ├── ImagePicker.jsx               # Camera & gallery input
│   │   ├── SettingsModal.jsx             # Active model & fallback queue
│   │   └── Sidebar.jsx                   # Tiered preferences drawer
│   ├── services/
│   │   ├── ai.js                         # Multimodal Gemini extraction & failover
│   │   ├── apiKeyManager.js              # BYOK storage management
│   │   ├── localModelService.js          # On-device MobileNetV3 inference
│   │   ├── modelManager.js               # Self-healing model discovery & cache
│   │   └── storage.js                    # IndexedDB offline storage engine
│   ├── App.jsx                           # Core app orchestrator
│   └── main.jsx                          # React & PWA service worker entry
├── test_local_model/
│   ├── benchmark_report_v2.md            # 5,000-image empirical benchmark report
│   ├── run_benchmark_v2.py               # Benchmark runner script
│   └── model.onnx                        # Local test weights
├── model.md                              # Deep-dive ML architecture whitepaper
├── package.json
└── README.md                             # Master documentation (You are here)
```

---

## 8. Quick Start & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* A [Google Gemini API Key](https://aistudio.google.com/app/apikey) (Free tier works)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Venukumar975/Bill-Snap.git
cd Bill-Snap
npm install
```

### 2. Start Development Server
```bash
npm run dev -- --host
```
Open `http://localhost:5173` in your browser. 
> 💡 **Mobile Testing**: To test on your physical phone, connect your phone to the same Wi-Fi and open the Network URL displayed in your terminal (e.g., `http://192.168.x.x:5173`).

### 3. Build & Preview PWA (Offline Testing)
```bash
npm run build
npm run preview -- --host
```
Open the app in Chrome/Safari on your phone, tap **"Add to Home Screen"**, and launch Bill Snap as a standalone native app!

### 4. Configure Your Gemini API Key
1. Tap the menu icon (`≡`) at the top-left.
2. Tap **Gemini API Key**.
3. Paste your Gemini API key and tap **Save & Test**. The key is validated in real time against Google's models endpoint and stored strictly inside your device's `localStorage`.

---

<p align="center">
  <strong>Bill Snap — Engineering Submission by Venu Kumar</strong>
</p>
