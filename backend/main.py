import os
import json
import pickle
import joblib
from pathlib import Path
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from backend.schemas import (
    SimulationRequest,
    SimulationResponse,
    SimulationEventSchema,
    PrefetchStateSchema,
    SimulationMetricsSchema,
    HealthResponse
)
from backend.simulator import (
    get_workload_trace,
    MLReplacementPrefetchCache,
    AdaptiveMLCacheV3,
    LRUCache,
    FIFOCache,
    RandomCache,
    evaluate_benchmarks
)
from backend.prefetch import AdaptiveMarkovPrefetcher, MarkovPrefetcher
from backend.replacement import REGRESSION_FEATURES


# =====================================================================
# MODEL ARTIFACT PATH RESOLUTION (Directly in Project Root)
# =====================================================================

ROOT_DIR = Path(__file__).resolve().parent.parent

MODEL_REGRESSION_PATH = ROOT_DIR / "replacement_regression_v3.pkl"
MODEL_PREFETCH_PATH = ROOT_DIR / "prefetch_markov_model.pkl"
CONFIG_PATH = ROOT_DIR / "adaptive_cache_config.json"
FEATURES_PATH = ROOT_DIR / "replacement_features.json"

models: Dict[str, Any] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model artifacts at startup
    print(f"[*] Loading models from {ROOT_DIR}...")

    # 1. Load Regression Model
    if MODEL_REGRESSION_PATH.exists():
        reg_model = joblib.load(str(MODEL_REGRESSION_PATH))
        # Ensure single-threaded micro-inference on Windows to avoid process-pool spawning overhead
        reg_model.n_jobs = 1
        models["regression_model"] = reg_model
        print("[+] Replacement regression model loaded successfully.")
    else:
        print(f"[!] Warning: {MODEL_REGRESSION_PATH} not found.")

    # 2. Load Prefetch Markov Model
    if MODEL_PREFETCH_PATH.exists():
        with open(MODEL_PREFETCH_PATH, "rb") as f:
            models["prefetch_model"] = pickle.load(f)
        print("[+] Prefetch Markov model loaded successfully.")
    else:
        print(f"[!] Warning: {MODEL_PREFETCH_PATH} not found.")

    # 3. Load Config
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            models["config"] = json.load(f)
        print("[+] Adaptive cache config loaded.")
    else:
        models["config"] = {
            "context_size": 2,
            "confidence_threshold": 0.70,
            "decay": 0.90,
            "replacement_features": REGRESSION_FEATURES
        }

    # 4. Load Features
    if FEATURES_PATH.exists():
        with open(FEATURES_PATH, "r", encoding="utf-8") as f:
            models["features"] = json.load(f)
        print("[+] Replacement features loaded.")
    else:
        models["features"] = REGRESSION_FEATURES

    yield

    models.clear()
    print("[-] Models unloaded.")


app = FastAPI(
    title="Adaptive Cache AI Simulator API",
    description="FastAPI backend serving ML-based cache replacement and adaptive prefetching simulation",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# API ENDPOINTS
# =====================================================================

@app.get("/health", response_model=HealthResponse)
def health_check():
    """
    Returns service health and model availability.
    """
    has_models = (
        "regression_model" in models and
        "prefetch_model" in models
    )
    return HealthResponse(
        status="healthy" if has_models else "degraded (models not loaded)",
        models_loaded=has_models,
        config=models.get("config", {}),
        workloads=["Looping", "Random", "Sequential", "Dynamic"],
        policies=["LRU", "FIFO", "Random", "ML Replacement", "ML + Prefetch"],
        cache_sizes=[2, 4, 8, 16]
    )


@app.post("/simulate", response_model=SimulationResponse)
def simulate(req: SimulationRequest):
    """
    Runs cache simulation based on request specifications and returns
    step-by-step events matching the frontend's SimulationEvent contract.
    """
    if "regression_model" not in models or "prefetch_model" not in models:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trained ML models are not yet loaded."
        )

    regression_model = models["regression_model"]
    prefetch_data = models["prefetch_model"]
    cfg = models.get("config", {})
    features = models.get("features", REGRESSION_FEATURES)

    # 1. Determine Access Trace
    if req.custom_trace and len(req.custom_trace) > 0:
        trace = req.custom_trace
    else:
        trace = get_workload_trace(
            workload_name=req.workload or "Dynamic",
            length=req.trace_length or 15
        )

    capacity = req.cache_size or 4
    policy = (req.policy or "ML + Prefetch").strip()

    events_out = []
    hits = 0
    misses = 0
    total_prefetches = 0
    useful_prefetches = 0

    # 2. Execute Requested Policy
    if policy == "ML + Prefetch":
        prefetcher = AdaptiveMarkovPrefetcher(
            base_model=prefetch_data,
            context_size=cfg.get("context_size", 2),
            threshold=cfg.get("confidence_threshold", 0.70),
            decay=cfg.get("decay", 0.90)
        )
        sim = MLReplacementPrefetchCache(
            replacement_model=regression_model,
            prefetcher=prefetcher,
            capacity=capacity,
            recent_window=16,
            feature_names=features
        )
        run_res = sim.run(trace)
        hits = run_res["hits"]
        misses = run_res["misses"]
        total_prefetches = run_res["total_prefetches"]
        useful_prefetches = run_res["useful_prefetches"]

        for ev in run_res["events"]:
            prefetch_dict = ev.get("prefetch", {})
            events_out.append(
                SimulationEventSchema(
                    index=ev["index"],
                    request=ev["request"],
                    result=ev["result"],
                    cacheBefore=ev["cache_before"],
                    cacheAfter=ev["cache_after"],
                    predictions=ev.get("scores", {}),
                    selectedVictim=ev.get("victim"),
                    evicted=ev.get("evicted"),
                    inserted=ev.get("inserted"),
                    prefetch=PrefetchStateSchema(
                        block=prefetch_dict.get("block"),
                        confidence=prefetch_dict.get("confidence"),
                        status=prefetch_dict.get("status", "NO PREFETCH"),
                        context=prefetch_dict.get("context", [])
                    )
                )
            )

    elif policy == "ML Replacement":
        sim = AdaptiveMLCacheV3(
            model=regression_model,
            capacity=capacity,
            recent_window=16,
            feature_names=features
        )
        run_res = sim.run(trace)
        hits = run_res["hits"]
        misses = run_res["misses"]

        for ev in run_res["events"]:
            events_out.append(
                SimulationEventSchema(
                    index=ev["index"],
                    request=ev["request"],
                    result=ev["result"],
                    cacheBefore=ev["cache_before"],
                    cacheAfter=ev["cache_after"],
                    predictions=ev.get("scores", {}),
                    selectedVictim=ev.get("victim"),
                    evicted=ev.get("evicted"),
                    inserted=ev.get("inserted"),
                    prefetch=PrefetchStateSchema(
                        block=None,
                        confidence=None,
                        status="NO PREFETCH",
                        context=ev.get("prefetch", {}).get("context", [])
                    )
                )
            )

    else:
        # Standard Baseline Policies (LRU, FIFO, Random)
        cache_state = []
        for i, block in enumerate(trace):
            cache_before = cache_state.copy()
            hit = block in cache_state
            evicted = None

            if hit:
                hits += 1
                if policy == "LRU":
                    cache_state.remove(block)
                    cache_state.append(block)
            else:
                misses += 1
                if len(cache_state) >= capacity:
                    if policy == "LRU" or policy == "FIFO":
                        evicted = cache_state.pop(0)
                    elif policy == "Random":
                        rnd_idx = (42 + i * 7) % len(cache_state)
                        evicted = cache_state.pop(rnd_idx)
                cache_state.append(block)

            events_out.append(
                SimulationEventSchema(
                    index=i,
                    request=block,
                    result="HIT" if hit else "MISS",
                    cacheBefore=cache_before,
                    cacheAfter=cache_state.copy(),
                    predictions={},
                    selectedVictim=evicted,
                    evicted=evicted,
                    inserted=block if not hit else None,
                    prefetch=PrefetchStateSchema(
                        block=None,
                        confidence=None,
                        status="NO PREFETCH",
                        context=trace[max(0, i - 1): i + 1]
                    )
                )
            )

    # 3. Calculate Cumulative Metrics
    total = hits + misses or 1
    hit_rate_pct = (hits / total) * 100
    miss_rate_pct = (misses / total) * 100
    accuracy_pct = (useful_prefetches / total_prefetches * 100) if total_prefetches > 0 else 0.0
    coverage_pct = (useful_prefetches / misses * 100) if misses > 0 else 0.0

    metrics_out = SimulationMetricsSchema(
        hits=hits,
        misses=misses,
        totalPrefetches=total_prefetches,
        usefulPrefetches=useful_prefetches,
        hitRate=f"{hit_rate_pct:.2f}%",
        missRate=f"{miss_rate_pct:.2f}%",
        prefetchAccuracy=f"{accuracy_pct:.2f}%",
        prefetchCoverage=f"{coverage_pct:.2f}%"
    )

    # 4. Generate Comparative Benchmark on Workload (or Custom Trace)
    if req.custom_trace and len(req.custom_trace) > 0:
        benchmark_trace = req.custom_trace
    else:
        benchmark_trace = get_workload_trace(req.workload or "Dynamic", length=60)

    benchmarks = evaluate_benchmarks(
        trace=benchmark_trace,
        replacement_model=regression_model,
        prefetch_model_data=prefetch_data,
        capacity=capacity
    )

    return SimulationResponse(
        trace=trace,
        events=events_out,
        metrics=metrics_out,
        benchmark=benchmarks
    )
