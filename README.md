# Federated Learning for Secure and Distributed AI Systems
## REVA University, Bengaluru — School of Computer Science and Engineering
### Faculty Development Programme (FDP) — September 2026

**Resource Person:** **Prof. (Dr.) Anjit Raja R**  
*Professor | AI/ML & Data Science Expert | Researcher | Trainer*  
*Specialization: AI/ML | Data Science | Generative AI | Intelligent Systems | IoT | Research & Innovation*

---

## 🎯 Overview & Purpose

This repository contains the complete, production-grade, interactive educational web portal designed for the live Faculty Development Programme (FDP) on **"Federated Learning for Secure and Distributed AI Systems"** hosted by the **School of Computer Science and Engineering, REVA University, Bengaluru**.

The portal serves as a unified live teaching, demonstration, simulation, and experimentation platform for faculty members, researchers, and AI/ML practitioners.

### Core Pedagogy
$$\text{Explain} \longrightarrow \text{Visualize} \longrightarrow \text{Simulate} \longrightarrow \text{Code} \longrightarrow \text{Experiment} \longrightarrow \text{Discuss} \longrightarrow \text{Research}$$

---

## 🚀 Quick Start (Zero Setup Required)

The portal is built as a zero-dependency, lightning-fast client-side web application. No Node.js build steps or local server installations are strictly required.

1. Clone or extract this repository to your computer.
2. Double-click **`index.html`** or open it with any modern browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).
3. The portal runs immediately offline and online!

---

## 📂 Project Structure

```text
Reva_University_Portal 1.0/
├── index.html                     # Main portal interface (all modules embedded)
├── README.md                      # Project documentation and user guide
├── css/
│   ├── main.css                   # University dark design system & typography scale
│   ├── animations.css             # FL data-flow, node pulses, transitions & keyframes
│   └── components.css             # Glass cards, badges, sliders, quiz & metric widgets
├── js/
│   ├── config.js                  # Central configuration (FDP metadata, quiz, resources)
│   ├── app.js                     # SPA router, presenter mode, keyboard shortcuts & events
│   ├── timer.js                   # Live session countdown timer & auto-schedule tracker
│   ├── fl-simulator.js            # Browser FL simulation engine (FedAvg, IID/Non-IID)
│   ├── dp-simulator.js            # Differential Privacy Gaussian noise demonstration
│   ├── charts.js                  # Chart.js visualizers (accuracy, loss, distributions)
│   ├── animations.js              # SVG animation coordinator for distributed learning
│   ├── quiz.js                    # Assessment engine (35+ questions across 5 modules)
│   └── code-lab.js                # Python code viewer with step-by-step guides & download
└── python/
    ├── 01_centralized_baseline.py        # Centralized ML baseline training & evaluation
    ├── 02_fedavg_simulation.py           # Federated Averaging (FedAvg) from scratch
    ├── 03_iid_vs_noniid.py               # Data heterogeneity & client drift analysis
    ├── 04_differential_privacy.py        # DP-SGD Gaussian noise mechanism & epsilon sweep
    ├── 05_secure_aggregation_demo.py     # Pairwise masking & additive secret sharing
    ├── 06_communication_compression.py  # Top-K sparsification, quantization & cost analysis
    ├── 07_flower_intro.py                # Flower (flwr) simulation & production blueprints
    └── 08_privacy_utility_tradeoff.py    # Pareto frontier & hyperparameter optimization
```

---

## 🖥️ Portal Modules & Features

### 1. Dashboard & Live Session Timer
- **Live Countdown**: Auto-detects Day 1 / Day 2 sessions with real-time countdown.
- **Manual Controls**: Start, Pause, and Reset timer during presentations.
- **Quick-Launch Tiles**: One-click navigation to all labs and simulators.

### 2. Day 1: AI Foundations & Distributed Learning
- **Interactive AI Hierarchy**: Clickable deep-dive into AI $\rightarrow$ ML $\rightarrow$ Deep Learning $\rightarrow$ Generative AI $\rightarrow$ Intelligent Systems.
- **Distributed Learning Rationale**: Regulatory compliance (GDPR, HIPAA), bandwidth bottlenecks, edge intelligence.
- **Centralized vs. Federated Side-by-Side**: Visual data-flow comparison and structured head-to-head table.
- **FL Architecture & FedAvg**: Step-by-step 7-phase training cycle and interactive formula breakdown:
  $$w^{(t+1)} = \sum_{k=1}^K \frac{n_k}{n} w_k^{(t+1)}$$
- **Interactive FL Simulator**: Configure clients, rounds, epochs, learning rate, and aggregation algorithms.
- **Non-IID Simulator**: Visualizes class distribution skews and client drift effects.
- **Real-World Case Studies**: Healthcare, Banking/Fraud, Mobile/Gboard, Smart Cities/IoT, Autonomous Fleets, and Education Analytics.

### 3. Day 2: Architectures, Privacy & Security
- **Cross-Device vs. Cross-Silo**: Deep architectural comparison, communication requirements, and availability profiles.
- **Hybrid / Hierarchical FL**: Multi-tier aggregation across edge clusters and cloud coordinators.
- **Differential Privacy (DP) Simulator**: Interactive $\varepsilon$-slider, Gaussian noise injection on gradients, and privacy-utility tradeoff curves:
  $$\sigma = \frac{\sqrt{2\ln(1.25/\delta)} \cdot \Delta f}{\varepsilon}$$
- **Secure Aggregation (SecAgg)**: Interactive demonstration of pairwise masking and additive secret sharing where individual updates remain hidden from the server.
- **Homomorphic Encryption (HE) Toy Demo**: Interactive ciphertext computation ($[enc(A)] + [enc(B)] = [enc(A+B)]$) and overview of PHE, SHE, and FHE.
- **Threat Models**: In-depth cards for Honest-but-Curious Server, Model Poisoning, Gradient Leakage, Membership Inference, Data Poisoning, Free-Riders, and Sybil Attacks.
- **Communication Efficiency Calculator**: Interactive calculator comparing uncompressed vs Top-K sparsified / quantized updates over $N$ rounds.

### 4. Hands-on Laboratories & Code Viewer
- **FL Training Lab**: Step-by-step guided procedure for conducting browser-based experiments.
- **Python Code Lab**: Syntax-highlighted code viewer with step-by-step explanations, one-click copy, and `.py` file download.

### 5. Structured Experiments (8 Practical Sessions)
1. Centralized vs Federated Learning Baseline
2. FedAvg Weight Averaging & Influence Analysis
3. IID vs Non-IID Data Heterogeneity & Client Drift
4. Cross-Device vs Cross-Silo Architectural Design
5. Differential Privacy $\varepsilon$-Sweep & Noise Analysis
6. Secure Aggregation Role-Play & Mask Cancellation
7. Communication Compression & Bandwidth Optimization
8. Privacy-Utility Pareto Frontier Exploration

### 6. Mini-Project Blueprints (8 Research Ideas)
- Federated Healthcare Prediction (MIMIC-III / UCI)
- Federated Financial Fraud Detection (Kaggle Credit Card)
- Federated Industrial IoT Anomaly Detection (UNSW-NB15)
- Federated Student Performance Analytics (FERPA Compliant)
- Federated Multi-Domain Sentiment Analysis (NLP)
- Federated Medical Image Classification (Vision / CNNs)
- Privacy-Preserving Collaborative Filtering (RecSys)
- Federated Network Intrusion Detection (CICIDS)

### 7. Interactive Knowledge Assessment (Quiz)
- 35+ questions across 5 focused modules: FL Basics, FedAvg Deep Dive, Privacy & DP, Security Threats, and Advanced Topics.
- Instant score calculation, feedback, and explanation for every question.

### 8. Research Corner & Technology Ecosystem
- Analysis of open research problems: non-IID convergence, personalized FL (pFedMe, Per-FedAvg), fairness, Byzantine robustness, and federated LLMs (LoRA/adapters).
- Framework landscape: Flower (`flwr`), TensorFlow Federated (`tff`), OpenFL (Intel), NVIDIA FLARE, PySyft, and FedML.

---

## 📽️ Presenter Mode (For Resource Person)

The portal includes a dedicated **Presenter Mode** tailored for delivering the live sessions:
- Press **`P`** on your keyboard (or click **📽️ Presenter Mode** in the header).
- Increases font sizes, optimizes card spacing, and shows hidden **Trainer Notes / Speaker Prompts**.
- Activates the bottom presenter navigation bar with quick shortcuts to simulators, Python scripts, and quizzes.
- Use **`←`** and **`→`** arrow keys to step through sections.

---

## ⚙️ Customization (`js/config.js`)

All dynamic metadata is cleanly decoupled into `js/config.js`. You can edit this file in any text editor without modifying HTML or core code:

```javascript
window.FDP_CONFIG = {
  fdp: {
    title: 'Federated Learning for Secure and Distributed AI Systems',
    institution: 'REVA University, Bengaluru',
    school: 'School of Computer Science and Engineering',
    dates: '22nd September 2026 to 26th September 2026',
    // ...
  },
  resourcePerson: {
    name: 'Prof. (Dr.) Anjit Raja R',
    role: 'Professor | AI/ML & Data Science Expert | Researcher | Trainer',
    // ...
  },
  sessions: [ ... ],
  quiz: { ... },
  resources: [ ... ]
};
```

---

## 🐍 Running Python Scripts Locally or on Google Colab

All Python demonstrations in the `python/` directory are self-contained and require only standard scientific packages:

```bash
pip install numpy scikit-learn matplotlib
```

To run a demonstration:
```bash
python python/02_fedavg_simulation.py
```

### Google Colab Usage:
1. Open [Google Colab](https://colab.research.google.com).
2. Upload any `.py` file from the `python/` folder or copy the code from the **Python Lab** module inside the portal.
3. Run all cells — pre-installed Colab packages will execute the simulation and generate high-resolution plots.

---

## ⚖️ Academic Integrity & Disclaimer

> **Educational Simulation Notice:**  
> All browser simulations in this portal are educational demonstrations intended for research training and conceptual clarity. They mathematically model federated learning behavior without requiring a live distributed network. Real-world deployment requires formal privacy guarantees (e.g., moments accountant DP-SGD), cryptographic security parameters, and institutional governance.

---

*Developed for REVA University Faculty Development Programme — School of Computer Science and Engineering (September 2026).*
