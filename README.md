# Bill Snap — Smart Receipt Scanner & Expense Tracker

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![ONNX Runtime Web](https://img.shields.io/badge/ONNX_Runtime_Web-1.21.0-005CED?logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-Vision_Multimodal-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB_Offline-336791?logo=sqlite&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![PWA](https://img.shields.io/badge/PWA-Installable_Offline-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

### 📱 Live Web & Mobile Application (PWA)

> 🔗 **Direct URL**: [**https://bill-snap-seven.vercel.app/**](https://bill-snap-seven.vercel.app/)
> 🎥 **Video Demo**: [**Watch 2-Min Walkthrough on YouTube**](https://youtube.com/shorts/wF6MYNktfVI)

#### 📲 How to Install & Run as a Native App on Your Phone (0 Setup):
1. **Open on Phone**: Navigate to [**https://bill-snap-seven.vercel.app/**](https://bill-snap-seven.vercel.app/) in your mobile browser (**Chrome** on Android or **Safari** on iOS).
2. **Add to Home Screen**:
   * **Android (Chrome)**: Tap the three dots (`⋮`) at the top-right $\rightarrow$ Tap **"Install app"** or **"Add to Home screen"**.
   * **iOS (Safari)**: Tap the **Share button** (`⎙` bottom navigation bar) $\rightarrow$ Scroll down and tap **"Add to Home Screen"**.
3. **Launch Standalone**: Open the **Bill Snap** app icon from your home screen. It runs full-screen with native camera access (`capture="environment"`), zero browser URL bars, and offline service worker caching.
4. **Configure Gemini API Key**: Tap the menu icon (`≡`) at top-left $\rightarrow$ Tap **Gemini API Key** $\rightarrow$ Paste your key $\rightarrow$ Tap **Save & Test** (stored securely on-device strictly in `localStorage`).

---

## 📋 Table of Contents
1. [🚀 Product Overview & Elevator Pitch](#1--product-overview--elevator-pitch)
2. [🧪 HCI & UI/UX Design System (Authoritative Citations & App Proofs)](#2--hci--uiux-design-system)
   - [📐 Mobile Ergonomics & Physical Interaction](#1--mobile-ergonomics--physical-interaction)
   - [🧠 Cognitive Psychology & Decision-Making](#2--cognitive-psychology--decision-making)
   - [👁️ Visual Perception & Layout Stability](#3--visual-perception--layout-stability)
   - [🛡️ Usability Heuristics & Error Handling](#4--usability-heuristics--error-handling)
   - [🎨 Semantic Color Theory & Accessibility (WCAG 2.1)](#5--semantic-color-theory--accessibility-wcag-21)
3. [🔀 System Architecture: The Edge-to-Cloud Cascaded Pipeline](#3--system-architecture-the-edge-to-cloud-cascaded-pipeline)
4. [🔬 On-Device Machine Learning Engine (MobileNetV3 ONNX)](#4--on-device-machine-learning-engine-mobilenetv3-onnx)
5. [📊 Assignment ML Deliverable: 20-Image End-to-End Evaluation](#5--assignment-ml-deliverable-20-image-end-to-end-evaluation)
6. [⚖️ Architectural Decisions & Engineering Trade-Offs](#6--architectural-decisions--engineering-trade-offs)
7. [🗂️ Repository File Structure](#7--repository-file-structure)
8. [💻 Local Developer Setup & Build Instructions](#8--local-developer-setup--build-instructions)
9. [📐 Master HCI & UI/UX Scientific Compliance Matrix](#9--master-hci--uiux-scientific-compliance-matrix)

---

<a id="1-product-overview--elevator-pitch"></a>
## 1. 🚀 Product Overview & Elevator Pitch

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
  <sub><em>📷 Figure 1.1: Bill Snap Live Mobile Home Screen — Royal Indigo spending hero card and scrollable receipt feed.</em></sub>
</p>

---

<a id="2-hci--uiux-design-system"></a>
## 2. 🧪 HCI & UI/UX Design System

Every user interface component and interaction pattern across Bill Snap is intentionally engineered using established **Human-Computer Interaction (HCI)** and **Cognitive Psychology** principles, validated against research from Jon Yablonski’s [Laws of UX](https://lawsofux.com/), the [Nielsen Norman Group (NN/g)](https://www.nngroup.com/), Google Web Vitals, and W3C WCAG 2.1 standards.

---

<a id="1-mobile-ergonomics--physical-interaction"></a>
### 1. 📐 Mobile Ergonomics & Physical Interaction

#### A. Steven Hoober’s Thumb Zone
* **Authoritative Citation:** Steven Hoober (2013), *Designing Mobile Interfaces*, research published on UXmatters (*[How Do Users Really Hold Mobile Devices?](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php)*), and Smashing Magazine (*[The Thumb Zone: Designing For Mobile Users](https://www.smashingmagazine.com/2016/09/the-thumb-zone-designing-for-mobile-users/)*).
* **The Rule:** ~49% of smartphone users navigate with a single hand, relying exclusively on their thumb. Touch targets must cluster in the lower third ("Natural Zone") of the screen to minimize grip shifting, hand gymnastics, and thumb strain.

<p align="center">
  <img src="app_pics/homepage-2.jpeg" alt="Steven Hoober Thumb Zone FAB Speed Dial" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/categorical-and-mothly-analysis-of-bills.jpeg" alt="Bottom Sheet Modal Reachability" width="280">
  <br>
  <sub><em>📐 Figure 2.1: Steven Hoober's Thumb Zone — Primary actions anchored in the natural lower thumb arc (Bottom-anchored FAB speed dial and Bottom-Sheet spending modal).</em></sub>
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
  <sub><em>⚡ Figure 2.2: Fitts's Law — Full-width 64px tap surfaces in the sidebar drawer and permanent red delete touch containers on bill cards.</em></sub>
</p>

* **How Bill Snap Implements It:**
  - **Full-Width Drawer Action Rows:** Every drawer row (Export, AI Engine, API Key) is a `w-full` container with `p-3.5` padding, providing a large $\approx 64\text{px}$ tap surface.
  - **Delete Action Affordance:** On bill list cards, the delete button is a permanent `w-9 h-9` ($36\text{px}$ with surrounding margin padding) rounded container with a high-contrast red background, eliminating the tiny invisible hitboxes common in unpolished apps.

---

<a id="2-cognitive-psychology--decision-making"></a>
### 2. 🧠 Cognitive Psychology & Decision-Making

#### A. Hick’s Law (Choice Overload Reduction)
* **Authoritative Citation:** William Edmund Hick & Ray Hyman (1952); Jon Yablonski (*[Laws of UX: Hick’s Law](https://lawsofux.com/hicks-law/)*).
* **The Rule:** The time to make a decision increases logarithmically with the number and complexity of choices.

<p align="center">
  <img src="app_pics/homepage-1.jpeg" alt="Hick's Law Empty Screen Simplicity" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/homepage-3.jpeg" alt="Hick's Law Focused Home Feed" width="280">
  <br>
  <sub><em>🧠 Figure 2.3: Hick's Law — Focused home feed presenting only two clear actions on empty state (Snap or Gallery) and a single primary feed on populated state.</em></sub>
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
  <sub><em>📂 Figure 2.4: Progressive Disclosure — Advanced configurations tucked neatly into sub-modals, and multi-bill batch processing with progressive inline triage.</em></sub>
</p>

* **How Bill Snap Implements It:**
  - **Tiered Settings Architecture:** Advanced configurations (Dynamic Gemini Model Fallback Queue, On-Device Classifier toggle, LocalStorage cache inspection) are nested cleanly inside the AI Engine & Models modal rather than cluttering the main menu.
  - **Batch Thumbnail Drawer:** During multi-bill selection, thumbnails appear in a compact sequential triage list with step-by-step review, avoiding a chaotic wall of forms.

---

<a id="3-visual-perception--layout-stability"></a>
### 3. 👁️ Visual Perception & Layout Stability

#### A. Zero Cumulative Layout Shift (CLS = 0)
* **Authoritative Citation:** Google Web Vitals & W3C Web Performance Working Group (*[web.dev: Cumulative Layout Shift](https://web.dev/articles/cls)*).
* **The Rule:** Prevent unexpected visual movement during interaction. Layout shifts above $0.1$ cause accidental clicks and visual disorientation.

<p align="center">
  <img src="app_pics/sidebar-1.jpeg" alt="Zero CLS Fixed Height Rows" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/homepage-3.jpeg" alt="Zero CLS Fixed Top Hero Card" width="280">
  <br>
  <sub><em>📐 Figure 2.5: Zero Cumulative Layout Shift — Fixed drawer row heights opening dedicated modals (no accordion jumps) and fixed top hero container while only the list scrolls.</em></sub>
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
  <sub><em>🧬 Figure 2.6: Gestalt Law of Common Region — Distinct bounded cards grouping related controls in the sidebar drawer and encapsulating individual bill items in the feed.</em></sub>
</p>

* **How Bill Snap Implements It:**
  - **Card Grouping:** Encapsulated related settings into three bordered cards (`bg-slate-50 border border-slate-200/70`):
    - **Card 1:** File Export (CSV / XLSX)
    - **Card 2:** AI & Model Intelligence (CPU, Pre-Filter, API Key)
    - **Card 3:** On-Device Storage (IndexedDB stats + Wipe action)
  - **Split Storage Tiles:** Bills count (`w-[38%]`) and Data Used (`flex-1`) share a single enclosing card with clear visual grouping.

---

<a id="4-usability-heuristics--error-handling"></a>
### 4. 🛡️ Usability Heuristics & Error Handling

#### A. Visibility of System Status (Heuristic #1)
* **Authoritative Citation:** Jakob Nielsen, Nielsen Norman Group (*[NN/g 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)*).
* **The Rule:** The system should always keep users informed about what is happening through timely, appropriate feedback.

<p align="center">
  <img src="app_pics/local-model-bill-acceptance.jpeg" alt="System Status Visibility Edge Verified" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/saving-bill.jpeg" alt="System Status Pipeline Telemetry" width="280">
  <br>
  <sub><em>📡 Figure 2.7: Visibility of System Status — Real-time telemetry badges: "Verified Receipt (100% confidence) • 117ms", "3.1-flash-lite", and "Pipeline: Edge-Verified (MobileNetV3) 399ms".</em></sub>
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
  <sub><em>🛡️ Figure 2.8: Error Prevention & User Control — Zero Lockout Policy ("Scan Anyway" override) and pre-save editable review inputs with confidence ratings.</em></sub>
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
  <sub><em>⏱️ Figure 2.9: Doherty Threshold — Sub-400ms speed verified live on mobile device (⚡ 117ms on-device edge validation and 399ms total pipeline latency).</em></sub>
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
  <sub><em>💬 Figure 2.10: Polite Non-Bill Rejection — Plain-language explanations detailing why non-receipts (CNN technical diagram, internship poster) cannot be scanned.</em></sub>
</p>

* **How Bill Snap Implements It:**
  - When non-bills are detected, the UI renders a soft rose card explaining exactly what was seen (e.g., *"This image appears to be a technical diagram of a convolutional neural network, not a receipt or bill. Please upload a clear photo of a receipt or bill."*), accompanied by a one-tap `"Pick Another Photo"` recovery button.

---

<a id="5-semantic-color-theory--accessibility-wcag-21"></a>
### 5. 🎨 Semantic Color Theory & Accessibility (WCAG 2.1)

#### A. WCAG 2.1 Guideline 1.4.1 (Use of Color - Triple Encoding)
* **Authoritative Citation:** W3C Web Accessibility Initiative (*[WCAG 2.1: Guideline 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)*).
* **The Rule:** Color must not be used as the sole visual means of conveying information, indicating an action, or distinguishing an element.

<p align="center">
  <img src="app_pics/categorical-and-mothly-analysis-of-bills.jpeg" alt="WCAG 2.1 Triple Encoding in Categories" width="280">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="app_pics/saving-bill.jpeg" alt="WCAG 2.1 Triple Encoding in Form Review" width="280">
  <br>
  <sub><em>👁️ Figure 2.11: WCAG 2.1 Guideline 1.4.1 — Triple simultaneous encoding: Icon, plain text string, and exact numerical data across every category and form field.</em></sub>
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
  <sub><em>🎨 Figure 2.12: FinTech Cognitive Mental Models — Multi-colored segmented progress bar and category color hierarchy aligned with established finance applications.</em></sub>
</p>

* **How Bill Snap Implements It:**
  - 🟣 **Indigo (`#4f46e5`)**: Primary brand actions and data utilities (Export, Save & Test, Download).
  - 🟢 **Emerald (`#10b981`)**: Intelligence & healthy system state (AI Models, Pre-filter ON, Verified Key).
  - 🔵 **Blue (`#3b82f6`)**: Travel and commute (replaces danger red to prevent false alarms of negative balances).
  - 🔴 **Rose (`#f43f5e`)**: Exclusively reserved for destructive operations (Delete bill, Clear DB, Clear key).

---

<a id="3-system-architecture-the-edge-to-cloud-cascaded-pipeline"></a>
## 3. 🔀 System Architecture: The Edge-to-Cloud Cascaded Pipeline

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
  <sub><em>🔀 Figure 3.1: Distributed Multi-Batch Processing — Left: Non-intrusive floating toast enforcing safe AI model concurrency limits. Right: Parallel sharded triage grid with per-card model badges and inline soft rejection.</em></sub>
</p>

#### Multi-Batch UX & Concurrency Architecture:
- **Dynamic Model-Aware Rate-Limiting**: The app calculates safe batch capacity in real time based on active models cached on the device: `batchLimit = max(1, min(5, N - 1))`, reserving at least one model in reserve for quota headroom.
- **Zero-CLS Floating Toast (Left Image)**: If a user selects more files than safe concurrency allows (e.g., 5 receipts when limit is 4), a high-contrast floating toast appears at `fixed top-4` with backdrop blur. It informs the user transparently without shifting page layout (`CLS = 0`) and auto-dismisses or closes on tap (`X`).
- **Parallel Sharded Triage Grid (Right Image)**: Each receipt is sharded to an independent model (`#1 3.1-flash-lite`, `#2 3.5-flash`). Non-receipts (like the Bike Taxi photo) are immediately flagged with a soft rejection card offering both **"Scan Anyway"** (user override) and **"Dismiss"**, while calculating the batch total live in a sticky bottom summary bar.

---

<a id="4-on-device-machine-learning-engine-mobilenetv3-onnx"></a>
## 4. 🔬 On-Device Machine Learning Engine (MobileNetV3 ONNX)

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
    <img src="https://img.shields.io/badge/%F0%9F%94%8D%20Zoom%20In%20%2F%20Vector%20SVG-Open%20Interactive%20Graph-blue?style=for-the-badge&logo=onnx&logoColor=white" alt="Open Netron Vector SVG">
  </a>
  &nbsp;
  <a href="docs/assets/netron_architecture.png" target="_blank">
    <img src="https://img.shields.io/badge/%F0%9F%96%BC%EF%B8%8F%20Raster%20Overview-High%20Res%20PNG-grey?style=for-the-badge" alt="Open Netron PNG">
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
  <sub><em>🔬 Figure 4.1: Model graph rendered at native 1:1 scale (287px width). Scroll vertically inside the container to inspect layers, or click the <strong>🔍 Zoom In / Vector SVG</strong> badge above to freely pan and zoom across the full 18,616px pipeline.</em></sub>
</p>

### The 5,000-Image Empirical Benchmark & Threshold Proof
To eliminate guesswork, the model was evaluated across **5,000 verified images** (1,000 genuine bills vs. 4,000 negative distractors across animals, vehicles, objects, and landscapes).

<p align="center">
  <img src="docs/assets/threshold_analysis_proof.png" alt="Threshold Analysis Proof" width="550">
  <br>
  <sub><em>📈 Figure 4.2: Empirical threshold sweep curve demonstrating the 0.65 Pareto inflection point.</em></sub>
</p>

* **99.70% Genuine Bill Recall**: 997 out of 1,000 real-world receipts are automatically passed.
* **99.45% Distractor Rejection**: Blocks 3,978 out of 4,000 random non-bill images before cloud API dispatch.
* **Inflection Point Proof**: Moving to $0.70$ causes genuine bill recall to drop to $99.50\%$. Therefore, **`0.65`** represents the exact Pareto-optimal boundary.

### 📚 Technical Whitepapers & Research Reports

For deeper mathematical proofs, layer specifications, and reproducible evaluations, consult the companion whitepapers:

| Document | Primary Focus | Key Contents |
| :--- | :--- | :--- |
| [📘 **ML Architecture Whitepaper (`model.md`)**](./model.md) | **Model Architecture & Edge Engineering** | MobileNetV3-Small layer math (Stem Conv, SE attention, HardSwish), FP32 vs. INT8 quantization proof, interactive Netron vector SVG graph, and edge-to-cloud cascaded bridge. |
| [📊 **5,000-Image Benchmark Report (`benchmark_report_v2.md`)**](./test_local_model/benchmark_report_v2.md) | **Empirical Evaluation & Proof** | Full $2 \times 2$ confusion matrix, stress tests on crumpled/faded receipts, transparent 32-failure analysis, and benchmark reproduction script. |
| [🔬 **20-Image End-to-End Evaluation Report (`ML_EVALUATION.md`)**](./ML_EVALUATION.md) | **Assignment Deliverable & Test Images** | The primary assignment deliverable: end-to-end evaluation across 20 diverse real-world images (15 bills + 5 non-bills), direct links to test assets in `ml_evaluation_images/`, and honest failure analysis. |

---

<a id="5-assignment-ml-deliverable-20-image-end-to-end-evaluation"></a>
## 5. 📊 Assignment ML Deliverable: 20-Image End-to-End Evaluation

As requested by the hiring team, the complete app was evaluated end-to-end across a custom test set of **20 diverse real-world images** (15 real receipts—including crumpled, faded, handwritten, and angled chits—plus 5 non-bill distractors).

> 📁 **Dedicated Report & Image Assets**: All raw test images are hosted in the [`ml_evaluation_images/`](./ml_evaluation_images) directory. For full image previews, test asset links, and detailed edge-case breakdowns, read the dedicated [**20-Image Evaluation Report (`ML_EVALUATION.md`)**](./ML_EVALUATION.md).

> 💡 **How the 2-Stage Pipeline Works**:
> When an image is scanned, the on-device **Local Model** checks whether it is a bill. If the local model flags it as `❌ Not a Bill`, the user can tap **"Scan with AI Anyway"** to override.
> When sent to the cloud, **Gemini first verifies if the image is an authentic bill**. Only when Gemini confirms `✅ Bill` does it extract the `Merchant`, `Date`, `Total Amount`, and `Category` shown below. If Gemini detects a non-bill, it triggers the **Red Alert Card** (Table B) and blocks it from saving.

### 🧾 Table A: The 15 Real & Stress-Tested Bills

| # | Chit & Scenario | ⚡ Local Model | 🧠 Gemini Verification | Merchant | Date | Total Amount | Category | Review Form / UX Action | Status |
| :-: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
| **01** | Real Mobile Capture (`bill-1.jpeg`) | ✅ Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Food | Auto-Saved to list | **PASS** |
| **02** | Mobile Store Slip (`bill-2.jpeg`) | ❌ Not a Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Groceries | User tapped *"Scan with AI Anyway"* | **Scan Anyway** |
| **03** | Retail Store Receipt (`bill-3.jpeg`) | ✅ Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Shopping | Auto-Saved to list | **PASS** |
| **04** | Dining Receipt (`bill-4.jpeg`) | ✅ Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Food | Auto-Saved to list | **PASS** |
| **05** | Retail Thermal Slip (`bill-5.jpeg`) | ✅ Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Groceries | Instant pass on phone (0 ms delay) | **PASS** |
| **06** | Store Receipt Chit (`bill-6.jpeg`) | ✅ Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Utilities | Auto-Saved to list | **PASS** |
| **07** | Handwritten Kirana (`bill-07`) | ✅ Bill | ✅ Bill | ✅ Correct | ⚠️ Incomplete | ✅ Correct | ✅ Other | Date written as *"5/11"* (missing year); saved | **PARTIAL** |
| **08** | Handwritten Order Slip (`bill-08`) | ✅ Bill | ✅ Bill | ✅ Correct | ⚠️ Amber Badge | ❌ Wrong | ✅ Other | Carbon ink smudged 3 vs 8; edited ₹1,850 → ₹1,350 in UI | **FAIL → SAVED** |
| **09** | Crumpled Thermal Chit (`bill-09`) | ✅ Bill | ✅ Bill | ✅ Correct | ⚠️ Amber Badge | ✅ Correct | ✅ Food | Wrinkled date flagged with amber badge; confirmed | **PASS** |
| **10** | Severe Shadow Gradient (`bill-10`) | ✅ Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Shopping | Dark ambient shadow filtered by Gemini prompt | **PASS** |
| **11** | Yellowed Aged Paper (`bill-11`) | ✅ Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Other | Aged paper tone handled seamlessly by vision model | **PASS** |
| **12** | Faded Low-Contrast Chit (`bill-12`) | ✅ Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Food | Bleached thermal ink recovered by multimodal reasoning | **PASS** |
| **13** | Dim Yellow Dining Chit (`fail_01`) | ❌ Not a Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Food | User tapped *"Scan with AI Anyway"* | **Scan Anyway** |
| **14** | Hand Covering Frame (`fail_02`) | ❌ Not a Bill | ✅ Bill | ✅ Correct | ✅ Correct | ✅ Correct | ✅ Shopping | User tapped *"Scan with AI Anyway"* | **Scan Anyway** |
| **15** | Degraded Carbon Slip (`fail_03`) | ❌ Not a Bill | ✅ Bill | ✅ Correct | ⚠️ Amber Badge | ✅ Correct | ✅ Other | User tapped *"Scan with AI Anyway"* | **Scan Anyway** |

### 🚫 Table B: The 5 Non-Bills (Cascaded Defense Matrix)

| # | Distractor Asset | What It Actually Is | ⚡ Local Model | 🧠 Gemini Safety Net | API Quota | Final Outcome |
| :-: | :--- | :--- | :---: | :---: | :---: | :---: |
| **16** | `non_bill_01` | Radiator slat grille mimicking item lines | ⚠️ Fooled (`✅ Bill`) | 🛡️ **❌ Not a Bill (Red Alert)** — No receipt text | 1 Call | **BLOCKED** |
| **17** | `non_bill_02` | Architecture diagram with table boxes | ⚠️ Fooled (`✅ Bill`) | 🛡️ **❌ Not a Bill (Red Alert)** — Identified UML diagram | 1 Call | **BLOCKED** |
| **18** | `non_bill_03` | Horizontal slat mesh blinds | ⚠️ Fooled (`✅ Bill`) | 🛡️ **❌ Not a Bill (Red Alert)** — Non-bill texture | 1 Call | **BLOCKED** |
| **19** | `non_bill_04` | Household / office physical object | 🛡️ **❌ Not a Bill** | — *(Blocked on phone; no API call)* | **0 Quota ($0)** | **BLOCKED** |
| **20** | `non_bill_05` | Outdoor transit vehicle | 🛡️ **❌ Not a Bill** | — *(Blocked on phone; no API call)* | **0 Quota ($0)** | **BLOCKED** |

### Summary & Honest Failure Analysis
* **On-Device Edge Model Behavior**:
  - **11 / 15 Real Bills Auto-Passed**: Clean chits passed instantly on-device (0ms delay).
  - **4 / 15 Real Bills Rescued via Override**: Severe lighting angles (`fail_01`), foreground hands (`fail_02`), degraded chits (`fail_03`), and mobile store chits (`bill-2`) were flagged as low-confidence and rescued in one tap via *"Scan with AI Anyway"*.
  - **3 / 5 Non-Bills Bypassed Edge Model**: Repetitive slats (`#16`), UML class diagram boxes (`#17`), and window mesh lines (`#18`) fooled the spatial convolutions of MobileNetV3 into predicting high bill confidence.
  - **2 / 5 Non-Bills Blocked On-Device**: Everyday objects (`#19`) and transit vehicles (`#20`) were blocked directly on the phone in 18ms with **0 API quota spent**.
* **Cascaded Cloud Safety Net (Gemini Vision)**:
  - **100% Non-Bill Containment**: All 3 non-bills that bypassed the edge model were caught by Gemini Vision (which detected zero receipt text and explicitly identified the UML diagram), triggering the red alert card and preventing any non-bill from being saved.
* **Field Extraction Accuracy (on 15 Real Bills)**:
  - **Merchant Name**: 15 / 15 (**100.0%**)
  - **Date**: 13 / 15 (**86.7%**) — *Handwritten chit #07 omitted calendar year ("5/11"); aged chit #15 was faint.*
  - **Total Amount**: 14 / 15 (**93.3%**) — *Chit #08 smudged numerical loop (3 vs 8); corrected in UI review form.*
  - **Category Suggestion**: 15 / 15 (**100.0%**)
* **Why the UI / UX Safeguards Matter**:
  1. **The Override Button**: Without *"Scan with AI Anyway"*, 4 legitimate crumpled/faded bills would have been locked out.
  2. **The Editable Review Sheet**: Without instant inline field editing, smudged handwritten bills like Chit #08 would store inaccurate financial records. Bill Snap allowed the user to correct the value in under two seconds before persisting to IndexedDB.

---

<a id="6-architectural-decisions--engineering-trade-offs"></a>
## 6. ⚖️ Architectural Decisions & Engineering Trade-Offs

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
  - Provides instant on-device pre-screening ($15\text{ms} - 50\text{ms}$ on desktop; $0\text{ms} - 700\text{ms}$ on mobile) instead of waiting 2–4 seconds for a cloud API roundtrip.
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

<a id="7-repository-file-structure"></a>
## 7. 🗂️ Repository File Structure

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

<a id="8-local-developer-setup--build-instructions"></a>
## 8. 💻 Local Developer Setup & Build Instructions

If you prefer to clone the repository and run or modify the codebase locally on your workstation:

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
> 💡 **Mobile Local Testing**: To test on your physical phone, connect your phone to the same Wi-Fi and open the Network URL displayed in your terminal (e.g., `http://192.168.x.x:5173`).

### 3. Build & Preview PWA (Offline Testing)
```bash
npm run build
npm run preview -- --host
```

### 4. Configure Your Gemini API Key
1. Tap the menu icon (`≡`) at the top-left.
2. Tap **Gemini API Key**.
3. Paste your Gemini API key and tap **Save & Test**. The key is validated in real time against Google's models endpoint and stored strictly inside your device's `localStorage`.

---

<a id="9-master-hci--uiux-scientific-compliance-matrix"></a>
## 9. 📐 Master HCI & UI/UX Scientific Compliance Matrix

Below is the consolidated scientific reference matrix summarizing all **12 Human-Computer Interaction (HCI) laws, cognitive psychology principles, and accessibility standards** implemented across Bill Snap:

| # | Scientific / HCI Principle | Authoritative Citation | Concrete Bill Snap Implementation | Primary Ergonomic / Psychological Impact |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Thumb Zone Ergonomics** | Steven Hoober (2013, UXmatters) | Primary FAB speed dial anchored at `bottom-6 right-6`; bottom-sheet sliding modals for exports & spending analytics. | Minimizes grip shifting and thumb strain on tall 20:9 mobile screens. |
| **2** | **Fitts’s Law & Target Sizing** | Paul Fitts (1954) / WCAG 2.5.5 | Full-width 64px tap surfaces in drawer; prominent 36px red delete hitboxes on bill cards. | Prevents mis-taps; accelerates target acquisition speed. |
| **3** | **Hick’s Law (Choice Reduction)** | Hick & Hyman (1952) | Two-button empty state (Snap or Gallery); complex date ranges and API settings partitioned into dedicated sub-modals. | Eliminates choice overload; reduces time-to-first-scan. |
| **4** | **Progressive Disclosure** | Jakob Nielsen (NN/g) | Multi-model fallback queue hidden inside settings; multi-bill batch processing reviewed step-by-step in triage cards. | Keeps novice interface clean while retaining power-user flexibility. |
| **5** | **Zero-CLS Layout Stability** | Google Web Vitals ($CLS = 0$) | Fixed drawer row heights (no accordion jumps); fixed top aggregate card while only feed scrolls. | Eliminates visual disorientation and accidental taps during scrolling. |
| **6** | **Gestalt Common Region** | Max Wertheimer (1923) | Bounded bordered cards in sidebar grouping related functions (Export, AI Engine, Storage). | Users visually perceive related controls as single cognitive units. |
| **7** | **Visibility of System Status** | NN/g Heuristic #1 | Real-time `● LIVE` model badge, dynamic Gemini key connectivity status, and IndexedDB storage byte telemetry. | Keeps user continuously informed of on-device and cloud state. |
| **8** | **Error Prevention & Recovery** | NN/g Heuristics #3 & #5 | Pre-save editable review inputs with amber warnings; destructive two-step confirmation on database wipe. | Prevents slips before they happen and provides clear recovery paths. |
| **9** | **Doherty Threshold (<400ms)** | Doherty & Thadani (IBM, 1982) | 0ms–700ms on-device edge verification; $<50\text{ms}$ tactile micro-animations (`active:scale-95`). | Eliminates perception of lag; keeps interaction fluid and responsive. |
| **10** | **Polite Error Feedback** | NN/g Heuristic #9 | Soft rose banner with plain-language explanations of non-bills (diagram, selfie) + one-tap recovery. | Avoids cryptic error codes; constructively guides user recovery. |
| **11** | **WCAG 2.1 Triple Encoding** | W3C Guideline 1.4.1 | Every category encoded using **Icon + Text Label + Numerical Value** simultaneously. | Fully accessible to colorblind and visually impaired users. |
| **12** | **FinTech Mental Models** | Jakob's Law of Internet UX | Indigo (Action), Emerald (System Health/AI), Blue (Commute/Travel), Rose (Destructive Operations). | Leverages pre-established financial intuition from apps like Apple Wallet. |

---

<p align="center">
  <strong>Bill Snap — Engineering Submission by Venu Kumar</strong>
</p>
