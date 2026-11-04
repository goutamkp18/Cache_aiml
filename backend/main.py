import os
import json
import pickle
import time
import asyncio
import joblib
from pathlib import Path
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from backend.schemas import (
    SimulationRequest,
    SimulationResponse,
    SimulationEventSchema,
    PrefetchStateSchema,
    SimulationMetricsSchema,
    HealthResponse,
    TraceGenerateRequest,
    TraceGenerateResponse,
    BenchmarkMatrixResponse,
    CapacityExperimentSchema
)
from backend.simulator import (
    get_workload_trace,
    MLReplacementPrefetchCache,
    AdaptiveMLCacheV3,
    LRUCache,
    FIFOCache,
    RandomCache,
    evaluate_benchmarks,
    evaluate_policy_run,
    evaluate_full_benchmark_matrix
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
BENCHMARK_CACHE_PATH = ROOT_DIR / "benchmark_matrix_cache.json"

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
            length=req.trace_length or 15,
            seed=req.seed
        )

    capacity = req.cache_size or 4
    policy = (req.policy or "ML + Prefetch").strip()

    # Research-grade execution timing
    t_sim_start = time.perf_counter()

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

    # 3. Calculate Research Execution Timing & Telemetry
    t_sim_elapsed = time.perf_counter() - t_sim_start
    exec_time_ms = round(t_sim_elapsed * 1000, 2)
    access_count = len(trace)
    avg_access_us = round((t_sim_elapsed * 1_000_000) / max(1, access_count), 2)
    eviction_count = sum(1 for e in events_out if e.evicted is not None)

    # Calculate Cumulative Metrics
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
        prefetchCoverage=f"{coverage_pct:.2f}%",
        executionTimeMs=exec_time_ms,
        avgAccessTimeUs=avg_access_us,
        totalAccesses=access_count,
        evictions=eviction_count
    )

    # 4. Generate Comparative Benchmark on Workload (or Custom Trace)
    if req.custom_trace and len(req.custom_trace) > 0:
        benchmark_trace = req.custom_trace
    else:
        benchmark_trace = get_workload_trace(
            workload_name=req.workload or "Dynamic",
            length=60,
            seed=req.seed
        )

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


@app.post("/simulate/stream")
async def simulate_stream(req: SimulationRequest):
    """
    Streaming SSE endpoint delivering live simulation events step-by-step
    as each memory access is simulated, followed by live benchmark evaluation.
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
            length=req.trace_length or 15,
            seed=req.seed
        )

    capacity = req.cache_size or 4
    policy = (req.policy or "ML + Prefetch").strip()

    async def event_generator():
        try:
            t_sim_start = time.perf_counter()

            # Signal simulation start
            yield f"data: {json.dumps({'type': 'simulation_started', 'total_accesses': len(trace), 'workload': req.workload or 'Dynamic', 'policy': policy, 'capacity': capacity, 'trace': trace})}\n\n"
            await asyncio.sleep(0.01)

            events_out = []
            hits = 0
            misses = 0
            total_prefetches = 0
            useful_prefetches = 0

            # Instantiate simulation engine based on policy
            if policy == "ML + Prefetch":
                pref = AdaptiveMarkovPrefetcher(
                    base_model=prefetch_data,
                    context_size=cfg.get("context_size", 2),
                    threshold=cfg.get("confidence_threshold", 0.70),
                    decay=cfg.get("decay", 0.90)
                )
                sim = MLReplacementPrefetchCache(
                    replacement_model=regression_model,
                    prefetcher=pref,
                    capacity=capacity,
                    recent_window=16,
                    feature_names=features
                )

                for i, block in enumerate(trace):
                    ev = sim.access(block, i)
                    events_out.append(ev)
                    hits = sim.hits
                    misses = sim.misses
                    total_prefetches = sim.total_prefetches
                    useful_prefetches = sim.useful_prefetches
                    total_so_far = hits + misses or 1
                    hr = round((hits / total_so_far) * 100, 2)
                    mr = round((misses / total_so_far) * 100, 2)
                    acc = round((useful_prefetches / total_prefetches * 100), 2) if total_prefetches > 0 else 0.0
                    cov = round((useful_prefetches / misses * 100), 2) if misses > 0 else 0.0

                    access_ev = {
                        "type": "access",
                        "access_index": i,
                        "total_accesses": len(trace),
                        "request": block,
                        "result": ev.get("result", "MISS"),
                        "cache_before": ev.get("cache_before", []),
                        "cache_after": ev.get("cache_after", []),
                        "predictions": ev.get("scores", {}),
                        "selected_victim": ev.get("victim"),
                        "evicted": ev.get("evicted"),
                        "inserted": ev.get("inserted"),
                        "prefetch": ev.get("prefetch", {}),
                        "hits": hits,
                        "misses": misses,
                        "hit_rate": hr,
                        "miss_rate": mr,
                        "total_prefetches": total_prefetches,
                        "useful_prefetches": useful_prefetches,
                        "useless_prefetches": max(0, total_prefetches - useful_prefetches),
                        "prefetch_accuracy": acc,
                        "prefetch_coverage": cov,
                        "occupancy": len(ev.get("cache_after", [])),
                        "capacity": capacity
                    }
                    yield f"data: {json.dumps(access_ev)}\n\n"
                    await asyncio.sleep(0.04)

            elif policy == "ML Replacement":
                sim = AdaptiveMLCacheV3(
                    model=regression_model,
                    capacity=capacity,
                    recent_window=16,
                    feature_names=features
                )

                for i, block in enumerate(trace):
                    ev = sim.access(block, i)
                    events_out.append(ev)
                    hits = sim.hits
                    misses = sim.misses
                    total_so_far = hits + misses or 1
                    hr = round((hits / total_so_far) * 100, 2)
                    mr = round((misses / total_so_far) * 100, 2)

                    access_ev = {
                        "type": "access",
                        "access_index": i,
                        "total_accesses": len(trace),
                        "request": block,
                        "result": ev.get("result", "MISS"),
                        "cache_before": ev.get("cache_before", []),
                        "cache_after": ev.get("cache_after", []),
                        "predictions": ev.get("scores", {}),
                        "selected_victim": ev.get("victim"),
                        "evicted": ev.get("evicted"),
                        "inserted": ev.get("inserted"),
                        "prefetch": {"block": None, "confidence": None, "status": "NO PREFETCH", "context": []},
                        "hits": hits,
                        "misses": misses,
                        "hit_rate": hr,
                        "miss_rate": mr,
                        "total_prefetches": 0,
                        "useful_prefetches": 0,
                        "useless_prefetches": 0,
                        "prefetch_accuracy": 0.0,
                        "prefetch_coverage": 0.0,
                        "occupancy": len(ev.get("cache_after", [])),
                        "capacity": capacity
                    }
                    yield f"data: {json.dumps(access_ev)}\n\n"
                    await asyncio.sleep(0.04)

            else:
                # Baseline Policies: LRU, FIFO, Random
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
                            if policy in ("LRU", "FIFO"):
                                evicted = cache_state.pop(0)
                            elif policy == "Random":
                                rnd_idx = (42 + i * 7) % len(cache_state)
                                evicted = cache_state.pop(rnd_idx)
                        cache_state.append(block)

                    ev = {
                        "index": i,
                        "request": block,
                        "result": "HIT" if hit else "MISS",
                        "cache_before": cache_before,
                        "cache_after": cache_state.copy(),
                        "scores": {},
                        "victim": evicted,
                        "evicted": evicted,
                        "inserted": block if not hit else None,
                        "prefetch": {"block": None, "confidence": None, "status": "NO PREFETCH", "context": trace[max(0, i - 1): i + 1]}
                    }
                    events_out.append(ev)

                    total_so_far = hits + misses or 1
                    hr = round((hits / total_so_far) * 100, 2)
                    mr = round((misses / total_so_far) * 100, 2)

                    access_ev = {
                        "type": "access",
                        "access_index": i,
                        "total_accesses": len(trace),
                        "request": block,
                        "result": "HIT" if hit else "MISS",
                        "cache_before": cache_before,
                        "cache_after": cache_state.copy(),
                        "predictions": {},
                        "selected_victim": evicted,
                        "evicted": evicted,
                        "inserted": block if not hit else None,
                        "prefetch": {"block": None, "confidence": None, "status": "NO PREFETCH", "context": trace[max(0, i - 1): i + 1]},
                        "hits": hits,
                        "misses": misses,
                        "hit_rate": hr,
                        "miss_rate": mr,
                        "total_prefetches": 0,
                        "useful_prefetches": 0,
                        "useless_prefetches": 0,
                        "prefetch_accuracy": 0.0,
                        "prefetch_coverage": 0.0,
                        "occupancy": len(cache_state),
                        "capacity": capacity
                    }
                    yield f"data: {json.dumps(access_ev)}\n\n"
                    await asyncio.sleep(0.04)

            t_elapsed = time.perf_counter() - t_sim_start
            exec_time_ms = round(t_elapsed * 1000, 2)
            avg_access_us = round((t_elapsed * 1_000_000) / max(1, len(trace)), 2)

            # Signal benchmark comparison phase
            benchmark_policies = ["LRU", "FIFO", "Random", "ML Replacement", "ML + Prefetch"]
            yield f"data: {json.dumps({'type': 'benchmark_started', 'policies': benchmark_policies})}\n\n"

            benchmark_trace = trace if req.custom_trace else get_workload_trace(req.workload or "Dynamic", length=60, seed=req.seed)
            benchmarks = []

            for pol in benchmark_policies:
                yield f"data: {json.dumps({'type': 'benchmark_policy_evaluating', 'policy': pol})}\n\n"
                score = evaluate_policy_run(
                    policy_name=pol,
                    trace=benchmark_trace,
                    capacity=capacity,
                    replacement_model=regression_model,
                    prefetch_model_data=prefetch_data
                )
                benchmarks.append({"name": pol, "value": score})
                yield f"data: {json.dumps({'type': 'benchmark_policy_completed', 'policy': pol, 'value': score})}\n\n"
                await asyncio.sleep(0.02)

            # Build final completed structures
            total_accesses = len(trace)
            total = hits + misses or 1
            hit_rate_pct = (hits / total) * 100
            miss_rate_pct = (misses / total) * 100
            acc_pct = (useful_prefetches / total_prefetches * 100) if total_prefetches > 0 else 0.0
            cov_pct = (useful_prefetches / misses * 100) if misses > 0 else 0.0

            final_metrics = {
                "hits": hits,
                "misses": misses,
                "totalPrefetches": total_prefetches,
                "usefulPrefetches": useful_prefetches,
                "hitRate": f"{hit_rate_pct:.2f}%",
                "missRate": f"{miss_rate_pct:.2f}%",
                "prefetchAccuracy": f"{acc_pct:.2f}%",
                "prefetchCoverage": f"{cov_pct:.2f}%",
                "executionTimeMs": exec_time_ms,
                "avgAccessTimeUs": avg_access_us,
                "totalAccesses": total_accesses,
                "evictions": sum(1 for e in events_out if e.get("evicted") is not None)
            }

            mapped_events = []
            for ev in events_out:
                p_dict = ev.get("prefetch", {})
                mapped_events.append({
                    "index": ev["index"],
                    "request": ev["request"],
                    "result": ev["result"],
                    "cacheBefore": ev["cache_before"],
                    "cacheAfter": ev["cache_after"],
                    "predictions": ev.get("scores", {}),
                    "selectedVictim": ev.get("victim"),
                    "evicted": ev.get("evicted"),
                    "inserted": ev.get("inserted"),
                    "prefetch": {
                        "block": p_dict.get("block"),
                        "confidence": p_dict.get("confidence"),
                        "status": p_dict.get("status", "NO PREFETCH"),
                        "context": p_dict.get("context", [])
                    }
                })

            yield f"data: {json.dumps({'type': 'simulation_completed', 'metrics': final_metrics, 'benchmark': benchmarks, 'events': mapped_events, 'trace': trace})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'simulation_error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/benchmark/matrix", response_model=BenchmarkMatrixResponse)
def get_benchmark_matrix_endpoint():
    """
    Returns full empirical evaluation across all 4 workloads, 5 policies,
    and 4 cache capacities [2, 4, 8, 16] using actual trained models.
    Cached after first computation for 60-FPS UI interactions.
    """
    if "regression_model" not in models or "prefetch_model" not in models:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trained ML models are not yet loaded."
        )

    if "cached_matrix_response" in models:
        return models["cached_matrix_response"]

    if BENCHMARK_CACHE_PATH.exists():
        try:
            with open(BENCHMARK_CACHE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                response_obj = BenchmarkMatrixResponse(**data)
                models["cached_matrix_response"] = response_obj
                return response_obj
        except Exception as e:
            print(f"[!] Warning reading benchmark cache: {e}")

    t0 = time.perf_counter()
    regression_model = models["regression_model"]
    prefetch_data = models["prefetch_model"]

    res = evaluate_full_benchmark_matrix(
        replacement_model=regression_model,
        prefetch_model_data=prefetch_data,
        trace_length=60,
        seed=42
    )

    total_time_ms = round((time.perf_counter() - t0) * 1000, 2)

    response_obj = BenchmarkMatrixResponse(
        workloads=res["workloads"],
        policies=res["policies"],
        matrix=res["matrix"],
        capacityExperiments=res["capacity_experiments"],
        executionTimeMs=total_time_ms
    )

    models["cached_matrix_response"] = response_obj

    try:
        with open(BENCHMARK_CACHE_PATH, "w", encoding="utf-8") as f:
            json.dump(response_obj.model_dump(), f, indent=2)
    except Exception as e:
        print(f"[!] Warning saving benchmark cache: {e}")

    return response_obj


@app.post("/trace/generate", response_model=TraceGenerateResponse)
def generate_trace_endpoint(req: TraceGenerateRequest):
    """
    Additive helper endpoint to preview/generate memory access traces
    directly from the backend workload generators.
    """
    length = max(2, min(req.trace_length or 15, 200))
    trace = get_workload_trace(
        workload_name=req.workload or "Dynamic",
        length=length,
        seed=req.seed
    )
    return TraceGenerateResponse(
        workload=req.workload or "Dynamic",
        trace_length=len(trace),
        trace=trace
    )

