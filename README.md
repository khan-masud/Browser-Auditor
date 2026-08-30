<div align="center">

# 🛡️ Browser Auditor

### Advanced Client-Side Browser Privacy, Security & Anti-Fingerprinting Benchmarking Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/Vanilla_JS-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0%20Zero-10b981?style=for-the-badge)](package.json)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](https://github.com/khan-masud/Browser-Inspector/pulls)

<p align="center">
  <b>Inspect client-side fingerprint entropy, hardware exfiltration, WebRTC IP leaks, tracker block rate, and browser sandbox integrity in real time.</b>
</p>

[Key Features](#-key-features--test-suite) •
[Architecture](#-system-architecture) •
[Quick Start](#-quick-start) •
[Scoring Methodology](#-dual-scoring-methodology) •
[Directory Structure](#-directory-architecture) •
[Export Options](#-telemetry--report-exporting) •
[SEO & Keywords](#-search-tags--keywords)

---

</div>

## 📌 Overview

**Browser Auditor** (also known as **Browser Inspector**) is an enterprise-grade, zero-dependency client-side browser auditing and security benchmarking platform. Built purely on modern **Web APIs**, **Vanilla ES6 Modules**, and **CSS Design Tokens**, it executes a battery of non-invasive diagnostic probes to measure hardware fingerprint entropy, network connection leaks, content filter efficacy, and sandbox security.

Unlike generic privacy testing tools that merely output static error messages, **Browser Auditor** incorporates an intelligent **Context-Aware Hardening Database**. It automatically identifies your browser environment (**Google Chrome, Brave, Mozilla Firefox, Microsoft Edge, Apple Safari, or Tor Browser**) and generates exact step-by-step remediation directives tailored specifically to your browser engine's capabilities.

```
+---------------------------------------------------------------------------------------+
|                               Browser Auditor Engine                                  |
+---------------------------------------------------------------------------------------+
        |
        +---> [ Hardware & Fingerprint Probes ] ---> Canvas 2D / WebGL / Audio DSP / Fonts
        |
        +---> [ Network & Connection Probes   ] ---> WebRTC STUN / Loopback PNA / Referrer
        |
        +---> [ Storage & Filter Probes       ] ---> Tracker Blocker / GPC / Cookie Sandboxing
        |
        +---> [ Security & Sandbox Probes     ] ---> Spectre Timing / Automation / Extension DOM
        |
        v
+---------------------------------------------------------------------------------------+
|                   Browser-Specific Intelligence & Dual-Score Engine                  |
|          Calculates: Current Score (0-99%) vs Achievable Potential Score (0-99%)       |
+---------------------------------------------------------------------------------------+
        |
        +---> [ Live High-Fidelity UI ] ---> Symmetrical Dual Scores & Real-Time Telemetry
        +---> [ Export Formats        ] ---> Raw JSON Dump / Markdown Summary / Print-to-PDF
```

---

## 🚀 Key Features & Test Suite

### 1. 🎨 Hardware & Graphical Fingerprinting
* **Canvas 2D Noise & Farbling Detection:** Renders multi-layer 2D canvas shapes (bezier curves, alpha blending, winding rules) and generates an FNV-1a hash. Tests whether your browser injects dynamic noise (e.g., **Brave Farbling**, **Firefox ResistFingerprinting**) to poison tracking hashes.
* **WebGL GPU Unmasking:** Queries `WEBGL_debug_renderer_info` to extract unmasked graphics hardware vendors (NVIDIA, AMD, Intel, Apple Silicon) and measures floating-point vertex shader precision format hashes.
* **AudioContext Acoustic DSP:** Instantiates an `OfflineAudioContext` with oscillator dynamics compressor nodes to process audio wave rendering variations across sound hardware chips.
* **Installed System Font Metric Profiling:** Performs sub-pixel canvas font metric diffing across 20+ OS fonts (`Segoe UI`, `SF Pro`, `Roboto`, `Ubuntu`, `Helvetica`, `Calibri`) against fallback fonts without requiring system permissions.

### 2. 🌐 Network & Connection Leak Probes
* **WebRTC Real IP Leak Probe:** Harvester for STUN ICE candidates via `RTCPeerConnection` (`stun.l.google.com`, `stun.cloudflare.com`). Detects local intranet IP exposure (`192.168.x.x`, `10.x.x.x`) and VPN-bypass WAN leaks.
* **Localhost Loopback Isolation (PNA):** Probes common local ports (`9050`, `8080`, `27017`) to test whether Private Network Access restrictions prevent malicious websites from port-scanning your local device.
* **Referrer Policy Evaluation:** Inspects cross-origin URL header leakage to protect sensitive search queries and navigation paths.
* **Network Telemetry Exposure:** Checks whether the `Network Information API` reveals your connection tier, downlink bandwidth, and round-trip time (RTT).

### 3. 🛡️ Storage, Tracking & State Partitioning
* **Ad & Tracker Blocker Efficacy:** Evaluates real-time blocking rates against prominent tracking endpoints (**Google Analytics, Meta/Facebook Pixel, Criteo, Google Syndication, Taboola**) combined with hidden DOM bait element collapsing checks.
* **Global Privacy Control (GPC):** Detects `navigator.globalPrivacyControl` compliance signals under GDPR/CCPA.
* **Do-Not-Track (DNT):** Evaluates `navigator.doNotTrack` header preference state.
* **Cross-Site Storage Partitioning:** Verifies Storage Access API compliance and first-party cookie isolation sandbox integrity.

### 4. 💻 Hardware Telemetry & Environmental Leakage
* **CPU & Memory Profiling:** Evaluates `navigator.hardwareConcurrency` and `navigator.deviceMemory` exposure.
* **Display Geometry & Multi-Monitor:** Measures screen resolution, usable work area, device pixel ratio, and `screen.isExtended` multi-monitor hints.
* **Media Devices Peripheral Enumeration:** Detects zero-prompt hardware counts for connected microphones, webcams, and audio output speakers.
* **Battery Status API Telemetry:** Probes legacy `navigator.getBattery()` charging level tracking risks.

### 5. 🔒 Security Posture & Sandbox Integrity
* **Spectre Side-Channel Defense:** Verifies Cross-Origin Isolation (`crossOriginIsolated`) and high-resolution timer clamping (`SharedArrayBuffer`).
* **Automation & Headless Signatures:** Inspects `navigator.webdriver`, Selenium/Puppeteer artifacts (`window.cdc_adoQpoasnfa76pfcZLmcfl_Array`, `__nightmare`), and headless user-agent indicators.
* **Engine & User-Agent Discrepancy Probe:** Catches spoofed User-Agent extensions by cross-verifying JavaScript engine primitives (V8 vs Gecko vs JavaScriptCore).
* **Permissions API Sandbox:** Queries silent permission states for geolocation, camera, microphone, and clipboard access.
* **Extension & Crypto Wallet Injections:** Detects third-party window object injections from installed extensions (MetaMask, Phantom, Solana, OKX, Bitget, 1Password, Grammarly).

---

## 📊 Dual-Scoring Methodology

Modern cybersecurity recognizes that **no system is 100% immune to tracking**. Browser Auditor enforces a **realistic 99% maximum ceiling** and introduces a **Dual-Scoring Paradigm**:

1. **Current Protection Score (0–99%):** The exact real-world security posture of your active browsing session based on weighted risk deductions.
2. **Achievable Potential Score (0–99%):** The maximum achievable privacy index if all user-actionable vulnerabilities are patched.
3. **Actionable Classification:**
   - 🟢 **User-Fixable (`Settings` / `Extensions`):** Settings you can toggle in your browser preferences or fix by installing extensions (e.g., uBlock Origin, WebRTC Control).
   - 🔒 **System Inherent (`Engine Limitation`):** Hardware or browser-core limitations that cannot be changed via standard settings (e.g., Chromium hardware concurrency reporting).

```text
+--------------------------------------------------------------------------------+
|  Overall Protection     |  Privacy Index       |  Security Index               |
|  [ B  74/100 ] -> [ A+ 92/100 (+18) ]          |  [ 68/100 ] -> [ 94/100 ]     |
+--------------------------------------------------------------------------------+
```

### Industry Benchmark Comparison

| Browser Profile | Grade | Overall Index | Baseline Security Posture |
| :--- | :---: | :---: | :--- |
| **Tor Browser** | **A+** | **97 / 100** | Uniform fingerprinting, letterboxing, WebRTC disabled, zero telemetry. |
| **Mullvad / Hardened Firefox** | **A** | **91 / 100** | `privacy.resistFingerprinting`, Total Cookie Protection, forced DoH. |
| **Brave Browser (Shields Up)** | **A-** | **86 / 100** | Farbling canvas randomization, aggressive ad blocking, WebRTC proxying. |
| **Mozilla Firefox (Default)** | **B** | **75 / 100** | Enhanced Tracking Protection active, standard font/hardware metrics exposed. |
| **Apple Safari** | **B-** | **71 / 100** | Intelligent Tracking Prevention (ITP) active, limited canvas/audio defenses. |
| **Google Chrome (Default)** | **C** | **52 / 100** | Full hardware telemetry exposed, zero built-in ad/tracker blocking. |
| **Microsoft Edge (Default)** | **D+** | **48 / 100** | Comprehensive telemetry profile, high fingerprinting surface. |

---

## 📁 Directory Architecture

```text
Browser Inspector/
├── server.js               # Zero-dependency Node.js HTTP server with header reflection
├── index.html              # Modern, accessible semantic HTML5 single-page application
├── package.json            # Project manifest & metadata
├── README.md               # Production documentation & architectural specification
├── css/
│   ├── main.css            # CSS custom properties, design tokens, dark & light themes
│   ├── components.css      # Dual-score cards, data table matrix, status pills, tooltips
│   └── responsive.css      # Mobile, tablet, desktop, and print layout media queries
└── js/
    ├── app.js              # Application lifecycle orchestrator & event bus
    ├── modules/
    │   ├── benchmark.js    # Industry benchmark dataset & bulletproof browser detection
    │   ├── browserRules.js # Context-aware hardening rules database (Chrome/Firefox/Brave/Edge)
    │   ├── fingerprint.js  # Canvas, WebGL, AudioContext, and Font metric probes
    │   ├── hardware.js     # CPU concurrency, deviceMemory, screen geometry, media devices
    │   ├── network.js      # WebRTC IP leak, localhost port isolation, referrer leaks
    │   ├── scorer.js       # Dual-scoring engine with 99% realistic cybersecurity ceiling
    │   ├── security.js     # Spectre isolation, automation flags, engine UA discrepancy
    │   └── storage.js      # Tracker blocking efficacy, GPC, DNT, cookie partitioning
    └── ui/
        ├── exporter.js     # Raw JSON telemetry dump, Markdown copy, and Print-to-PDF
        ├── icons.js        # Minimalist monochrome SVG vector icon repository
        └── renderer.js     # DOM renderer, IntersectionObserver ScrollSpy, telemetry toggles
```

---

## ⚡ Quick Start

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended) *or* **Python 3**
* Modern web browser (Chrome, Brave, Firefox, Edge, Safari, Opera, or Tor)

### Method 1: Native Node.js (Recommended)
Zero external dependencies required. Simply clone and run:

```bash
# Clone the repository
git clone https://github.com/khan-masud/Browser-Inspector.git

# Navigate to project directory
cd Browser-Inspector

# Start the high-performance local server
node server.js

# Or using npm script
npm start
```

### Method 2: Python 3 HTTP Server
```bash
python -m http.server 3000
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📑 Telemetry & Report Exporting

Browser Auditor allows security researchers, network administrators, and privacy advocates to export complete diagnostic reports in multiple standardized formats:

1. **📄 Formatted Markdown Summary:** One-click clipboard copy formatted with GitHub-flavored markdown tables, executive summary scores, and browser-tailored hardening directives.
2. **📦 Raw JSON Telemetry Dump:** Complete unmasked technical parameters including WebGL renderer strings, canvas FNV-1a hashes, audio sample sums, open localhost ports, and WebRTC candidate descriptors.
3. **🖨️ Clean Print / PDF Report:** Print-optimized stylesheet that strips navigation headers, interactive buttons, and background chrome for formal security auditing documentation.

---

## 🔒 Security & Privacy Guarantee

* **100% Client-Side Probing:** All fingerprint calculations, audio DSP measurements, and hardware queries run entirely inside your browser sandbox.
* **No Tracking / No Analytics:** Browser Auditor does not set tracking cookies, log telemetry to third-party servers, or collect personal identifying information (PII).
* **Open Source & Transparent:** Fully inspectable codebase with zero obfuscation.

---

## 🔍 Search Tags & Keywords

`browser fingerprint test` • `webrtc leak detector` • `canvas fingerprinting test` • `browser privacy audit` • `ad blocker test` • `tracker blocker efficacy` • `audio fingerprint test` • `webgl unmasking` • `browser security benchmark` • `privacy score` • `fingerprint entropy` • `tor browser test` • `brave browser shields test` • `anti-detect browser benchmark` • `global privacy control validator` • `spectre side-channel test`

---

## 🤝 Contributing

Contributions are welcome! If you would like to add new diagnostic vectors (e.g., WebGPU profiling, IPv6 STUN leaks, or Client Hints probes), feel free to fork the repository and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewDiagnosticProbe`)
3. Commit your Changes (`git commit -m 'feat: Add WebGPU entropy probe'`)
4. Push to the Branch (`git push origin feature/NewDiagnosticProbe`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <sub>Developed with precision for browser security researchers, privacy enthusiasts, and modern web users.</sub>
</div>
