# Cache_aiml

> **Adaptive Cache AI Simulator** — Machine-learning-powered cache replacement and adaptive prefetching for dynamic memory workloads.

An advanced AI-powered computer architecture command center and simulator combining:
- **Random Forest Regressor** for predicting future-use distance (approximating Belady's optimal MIN rule).
- **Adaptive Markov Prefetcher** for predicting upcoming memory blocks based on 2nd-order transition probability.
- **Interactive 3D Hardware Simulation** with step-by-step playback, real-time telemetry, and visual cache state.
- **Experiment-Specific Results Analytics** with empirical KPI reports, hit rate convergence charts, and CSV export.

---

## 🚀 Key Features

1. **Dual Execution Modes**:
   - **Step-by-Step (Manual)**: Advance memory accesses one by one with Jump to Start, Step Backward, Play, Step Forward, and Jump to End.
   - **Automatic Playback**: Controlled replay with user-selectable speed (`0.25x` to `4x`).
2. **Strict Workload Workflow**:
   - Preview memory access sequence (`A → B → C → ...`) before execution for **Sequential**, **Looping**, **Random**, and **Dynamic** workloads.
   - Controlled **Custom Memory Trace** input supporting alphanumeric identifiers (e.g. `S, B, C, D, A, B, C, D, H, E, K, B, F, G, A`).
3. **Live Explanation Panel ("What Is Happening Right Now?")**:
   - Plain-English breakdown of every memory access through 7 distinct execution phases.
   - Educational Mode toggle explaining Belady's MIN approximation and Markov transition mathematics.
4. **Experiment-Specific Results Report**:
   - Exclusive empirical analytics for the active completed experiment.
   - Automatic invalidation when trace or configuration changes to prevent stale data.
5. **Full-Stack Architecture**:
   - **Frontend**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Lucide icons, Framer Motion, Recharts.
   - **Backend**: Python FastAPI serving live simulation and machine learning inference on port 8000.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React, Recharts, Framer Motion
- **Backend**: Python 3.12+, FastAPI, Uvicorn, Scikit-Learn, Joblib, NumPy
- **Trained ML Models**:
  - `replacement_regression_v3.pkl` (Random Forest Regressor)
  - `prefetch_markov_model.pkl` (Markov Transition Matrix)
  - `adaptive_cache_config.json` (Context size 2, confidence threshold 0.70, decay 0.90)
  - `replacement_features.json` (8 cache feature names)

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/goutamkp18/Cache_aiml.git
cd Cache_aiml
```

### 2. Backend Setup (Python FastAPI)
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install fastapi uvicorn scikit-learn joblib numpy pydantic

# Start FastAPI server on port 8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend health check: `http://127.0.0.1:8000/health`

### 3. Frontend Setup (Next.js)
```bash
# Install Node dependencies
npm install

# Start Next.js development server on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔬 Supported Workloads & Policies

- **Workloads**: Sequential, Looping, Random, Dynamic, Custom Trace
- **Replacement Policies**:
  - `ML + Prefetch` (Random Forest + Adaptive Markov)
  - `ML Replacement` (Random Forest Regressor)
  - `LRU` (Least Recently Used)
  - `FIFO` (First In, First Out)
  - `Random` (Random Replacement)
- **Cache Capacities**: 2, 4, 8, 16 Slots

---

## 📜 License

MIT License. Designed for research and computer architecture education.
