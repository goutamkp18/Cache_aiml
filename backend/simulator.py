import random
from typing import List, Dict, Tuple, Optional, Any, Set
from collections import deque, Counter, defaultdict
import numpy as np
import pandas as pd

from backend.replacement import predict_next_use_distances, REGRESSION_FEATURES
from backend.prefetch import MarkovPrefetcher, AdaptiveMarkovPrefetcher
from backend.schemas import SimulationEventSchema, PrefetchStateSchema, SimulationMetricsSchema, BenchmarkItemSchema


# =====================================================================
# TRACE GENERATION (Matches Cells 1, 2, 4 in Notebook)
# =====================================================================

def generate_loop_trace(length: int = 500) -> List[str]:
    pattern = ["A", "B", "C", "D", "E", "F"]
    return [pattern[i % len(pattern)] for i in range(length)]


def generate_sequential_trace(length: int = 500) -> List[str]:
    pattern = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    return [pattern[i % len(pattern)] for i in range(length)]


def generate_random_trace(length: int = 500, blocks: int = 20, seed: int = 42) -> List[str]:
    rng = random.Random(seed)
    pattern = [chr(ord("A") + i) for i in range(blocks)]
    return [rng.choice(pattern) for _ in range(length)]


def generate_dynamic_trace(
    seed: int = 42,
    phase_length: Optional[int] = None,
    total_length: Optional[int] = None
) -> List[str]:
    rng = random.Random(seed)

    if total_length is not None:
        p1_len = max(1, total_length // 3)
        p2_len = max(1, total_length // 3)
        p3_len = max(1, total_length - p1_len - p2_len)
    else:
        plen = phase_length or 300
        p1_len, p2_len, p3_len = plen, plen, plen

    # Phase 1: looping
    loop_pattern = ["A", "B", "C", "D", "E", "F"]
    loop_part = [loop_pattern[i % len(loop_pattern)] for i in range(p1_len)]
    # Phase 2: random
    random_blocks = [chr(ord("A") + i) for i in range(20)]
    random_part = [rng.choice(random_blocks) for _ in range(p2_len)]
    # Phase 3: sequential
    seq_pattern = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    seq_part = [seq_pattern[i % len(seq_pattern)] for i in range(p3_len)]

    return loop_part + random_part + seq_part


def get_workload_trace(workload_name: str, length: Optional[int] = None) -> List[str]:
    name = (workload_name or "Dynamic").strip().capitalize()
    if name == "Looping":
        trace = generate_loop_trace(length or 500)
    elif name == "Sequential":
        trace = generate_sequential_trace(length or 500)
    elif name == "Random":
        trace = generate_random_trace(length or 500)
    else:  # Dynamic
        if length is not None:
            return generate_dynamic_trace(seed=42, total_length=length)
        return generate_dynamic_trace(seed=42, phase_length=300)

    if length is not None:
        return trace[:length]
    return trace


# =====================================================================
# BASELINE CACHES (Matches Cell 31 in Notebook)
# =====================================================================

class LRUCache:
    def __init__(self, capacity: int = 4):
        self.capacity = capacity
        self.cache: List[str] = []
        self.hits = 0
        self.misses = 0
        self.evictions = 0

    def access(self, block: str):
        if block in self.cache:
            self.hits += 1
            self.cache.remove(block)
            self.cache.append(block)
        else:
            self.misses += 1
            if len(self.cache) >= self.capacity:
                self.cache.pop(0)
                self.evictions += 1
            self.cache.append(block)

    def run(self, trace: List[str]) -> Dict[str, Any]:
        for block in trace:
            self.access(block)
        total = self.hits + self.misses
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hits / total if total else 0.0,
            "miss_rate": self.misses / total if total else 0.0,
            "evictions": self.evictions
        }


class FIFOCache:
    def __init__(self, capacity: int = 4):
        self.capacity = capacity
        self.cache: List[str] = []
        self.hits = 0
        self.misses = 0
        self.evictions = 0

    def access(self, block: str):
        if block in self.cache:
            self.hits += 1
        else:
            self.misses += 1
            if len(self.cache) >= self.capacity:
                self.cache.pop(0)
                self.evictions += 1
            self.cache.append(block)

    def run(self, trace: List[str]) -> Dict[str, Any]:
        for block in trace:
            self.access(block)
        total = self.hits + self.misses
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hits / total if total else 0.0,
            "miss_rate": self.misses / total if total else 0.0,
            "evictions": self.evictions
        }


class RandomCache:
    def __init__(self, capacity: int = 4, seed: int = 42):
        self.capacity = capacity
        self.cache: List[str] = []
        self.hits = 0
        self.misses = 0
        self.evictions = 0
        self.rng = random.Random(seed)

    def access(self, block: str):
        if block in self.cache:
            self.hits += 1
        else:
            self.misses += 1
            if len(self.cache) >= self.capacity:
                victim_index = self.rng.randrange(len(self.cache))
                self.cache.pop(victim_index)
                self.evictions += 1
            self.cache.append(block)

    def run(self, trace: List[str]) -> Dict[str, Any]:
        for block in trace:
            self.access(block)
        total = self.hits + self.misses
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hits / total if total else 0.0,
            "miss_rate": self.misses / total if total else 0.0,
            "evictions": self.evictions
        }


# =====================================================================
# ML REPLACEMENT ONLY CACHE (Matches Cell 28 in Notebook)
# =====================================================================

class AdaptiveMLCacheV3:
    def __init__(self, model, capacity: int = 4, recent_window: int = 16, feature_names: Optional[List[str]] = None):
        self.model = model
        self.capacity = capacity
        self.recent_window = recent_window
        self.feature_names = feature_names or REGRESSION_FEATURES

        self.cache: List[str] = []
        self.last_access: Dict[str, int] = {}
        self.first_access: Dict[str, int] = {}
        self.frequency: Counter = Counter()
        self.reuse_intervals: Dict[str, List[int]] = defaultdict(list)

        self.recent_history = deque(maxlen=recent_window)
        self.recent_counter: Counter = Counter()

        self.hits = 0
        self.misses = 0
        self.evictions = 0
        self.events: List[Dict[str, Any]] = []

    def update_history(self, block: str, index: int):
        if block in self.last_access:
            interval = index - self.last_access[block]
            self.reuse_intervals[block].append(interval)
        else:
            self.first_access[block] = index

        self.last_access[block] = index
        self.frequency[block] += 1

        if len(self.recent_history) == self.recent_window:
            old_block = self.recent_history[0]
            self.recent_counter[old_block] -= 1
            if self.recent_counter[old_block] <= 0:
                del self.recent_counter[old_block]

        self.recent_history.append(block)
        self.recent_counter[block] += 1

    def choose_victim(self, current_index: int) -> Tuple[Optional[str], Dict[str, float]]:
        return predict_next_use_distances(
            candidates=self.cache,
            current_index=current_index,
            model=self.model,
            last_access=self.last_access,
            first_access=self.first_access,
            frequency=self.frequency,
            reuse_intervals=self.reuse_intervals,
            recent_counter=self.recent_counter,
            feature_names=self.feature_names
        )

    def access(self, block: str, index: int):
        cache_before = self.cache.copy()

        if block in self.cache:
            self.hits += 1
            event = {
                "index": index,
                "request": block,
                "result": "HIT",
                "cache_before": cache_before,
                "cache_after": self.cache.copy(),
                "evicted": None,
                "inserted": None,
                "scores": {},
                "victim": None,
                "prefetch": {"block": None, "confidence": None, "status": "NO PREFETCH", "context": list(self.recent_history)[-2:]}
            }
            self.events.append(event)
            self.update_history(block, index)
            return event

        self.misses += 1
        evicted = None
        scores: Dict[str, float] = {}

        if len(self.cache) >= self.capacity:
            evicted, scores = self.choose_victim(index)
            if evicted in self.cache:
                self.cache.remove(evicted)
                self.evictions += 1

        self.cache.append(block)
        event = {
            "index": index,
            "request": block,
            "result": "MISS",
            "cache_before": cache_before,
            "cache_after": self.cache.copy(),
            "evicted": evicted,
            "inserted": block,
            "scores": scores,
            "victim": evicted,
            "prefetch": {"block": None, "confidence": None, "status": "NO PREFETCH", "context": list(self.recent_history)[-2:]}
        }
        self.events.append(event)
        self.update_history(block, index)
        return event

    def run(self, trace: List[str]) -> Dict[str, Any]:
        for i, block in enumerate(trace):
            self.access(block, i)
        total = self.hits + self.misses
        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hits / total if total else 0.0,
            "miss_rate": self.misses / total if total else 0.0,
            "evictions": self.evictions,
            "events": self.events
        }


# =====================================================================
# FULL ML REPLACEMENT + PREFETCH CACHE (Matches Cells 46, 51, 54, 60, 61)
# =====================================================================

class MLReplacementPrefetchCache:
    def __init__(
        self,
        replacement_model,
        prefetcher,
        capacity: int = 4,
        recent_window: int = 16,
        feature_names: Optional[List[str]] = None
    ):
        self.replacement_model = replacement_model
        self.prefetcher = prefetcher
        self.capacity = capacity
        self.recent_window = recent_window
        self.feature_names = feature_names or REGRESSION_FEATURES

        self.cache: List[str] = []
        self.last_access: Dict[str, int] = {}
        self.first_access: Dict[str, int] = {}
        self.frequency: Counter = Counter()
        self.reuse_intervals: Dict[str, List[int]] = defaultdict(list)

        self.recent_history = deque(maxlen=recent_window)
        self.recent_counter: Counter = Counter()

        self.hits = 0
        self.misses = 0
        self.evictions = 0

        self.total_prefetches = 0
        self.useful_prefetches = 0
        self.useless_prefetches = 0
        self.prefetched_blocks: Set[str] = set()
        self.events: List[Dict[str, Any]] = []

    def update_history(self, block: str, index: int):
        if block in self.last_access:
            interval = index - self.last_access[block]
            self.reuse_intervals[block].append(interval)
        else:
            self.first_access[block] = index

        self.last_access[block] = index
        self.frequency[block] += 1

        if len(self.recent_history) == self.recent_window:
            old_block = self.recent_history[0]
            self.recent_counter[old_block] -= 1
            if self.recent_counter[old_block] <= 0:
                del self.recent_counter[old_block]

        self.recent_history.append(block)
        self.recent_counter[block] += 1

    def choose_victim(self, current_index: int) -> Tuple[Optional[str], Dict[str, float]]:
        return predict_next_use_distances(
            candidates=self.cache,
            current_index=current_index,
            model=self.replacement_model,
            last_access=self.last_access,
            first_access=self.first_access,
            frequency=self.frequency,
            reuse_intervals=self.reuse_intervals,
            recent_counter=self.recent_counter,
            feature_names=self.feature_names
        )

    def choose_victim_excluding(
        self, current_index: int, excluded_blocks: Set[str]
    ) -> Tuple[Optional[str], Dict[str, float]]:
        candidates = [b for b in self.cache if b not in excluded_blocks]
        if not candidates:
            return None, {}
        return predict_next_use_distances(
            candidates=candidates,
            current_index=current_index,
            model=self.replacement_model,
            last_access=self.last_access,
            first_access=self.first_access,
            frequency=self.frequency,
            reuse_intervals=self.reuse_intervals,
            recent_counter=self.recent_counter,
            feature_names=self.feature_names
        )

    def access(self, block: str, index: int):
        cache_before = self.cache.copy()

        # ============================================
        # CACHE HIT
        # ============================================
        if block in self.cache:
            self.hits += 1
            was_prefetched = block in self.prefetched_blocks

            if was_prefetched:
                self.useful_prefetches += 1
                self.prefetched_blocks.remove(block)

            # Check prefetch opportunity even on Hit to display predicted next block
            prediction, confidence = self.prefetcher.predict(list(self.recent_history))
            prefetch_block = None
            prefetch_status = "NO PREFETCH"

            if prediction and prediction not in self.cache:
                prefetch_block = prediction
                prefetch_status = "PREFETCHED"

            self.update_history(block, index)

            event = {
                "index": index,
                "request": block,
                "result": "HIT",
                "cache_before": cache_before,
                "cache_after": self.cache.copy(),
                "evicted": None,
                "inserted": None,
                "scores": {},
                "victim": None,
                "prefetch": {
                    "block": prefetch_block,
                    "confidence": confidence if prefetch_block else None,
                    "status": prefetch_status,
                    "context": list(self.recent_history)[-2:]
                }
            }
            self.events.append(event)
            return event

        # ============================================
        # CACHE MISS
        # ============================================
        self.misses += 1
        evicted = None
        replacement_scores: Dict[str, float] = {}

        if len(self.cache) >= self.capacity:
            evicted, replacement_scores = self.choose_victim(index)
            if evicted in self.cache:
                self.cache.remove(evicted)
                self.evictions += 1
                if evicted in self.prefetched_blocks:
                    self.useless_prefetches += 1
                    self.prefetched_blocks.remove(evicted)

        self.cache.append(block)
        # Protect newly requested CPU block
        self.update_history(block, index)

        # ============================================
        # PREFETCH PHASE
        # ============================================
        prediction, confidence = self.prefetcher.predict(list(self.recent_history))
        prefetched = False
        prefetch_eviction = None

        if prediction is not None and prediction not in self.cache:
            if len(self.cache) >= self.capacity:
                victim, _ = self.choose_victim_excluding(index, excluded_blocks={block})
                if victim is not None and victim in self.cache:
                    self.cache.remove(victim)
                    self.evictions += 1
                    prefetch_eviction = victim
                    if victim in self.prefetched_blocks:
                        self.useless_prefetches += 1
                        self.prefetched_blocks.remove(victim)

            if prediction not in self.cache:
                self.cache.append(prediction)
                self.prefetched_blocks.add(prediction)
                self.total_prefetches += 1
                prefetched = True

        event = {
            "index": index,
            "request": block,
            "result": "MISS",
            "cache_before": cache_before,
            "cache_after": self.cache.copy(),
            "evicted": evicted,
            "inserted": block,
            "scores": replacement_scores,
            "victim": evicted,
            "prefetch": {
                "block": prediction if prefetched else None,
                "confidence": confidence if prefetched else None,
                "status": "PREFETCHED" if prefetched else "NO PREFETCH",
                "context": list(self.recent_history)[-2:]
            }
        }
        self.events.append(event)
        return event

    def run(self, trace: List[str]) -> Dict[str, Any]:
        for i, block in enumerate(trace):
            self.access(block, i)

        total_accesses = self.hits + self.misses
        prefetch_accuracy = (
            self.useful_prefetches / self.total_prefetches
            if self.total_prefetches > 0
            else 0.0
        )
        prefetch_coverage = (
            self.useful_prefetches / self.misses
            if self.misses > 0
            else 0.0
        )

        return {
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hits / total_accesses if total_accesses else 0.0,
            "miss_rate": self.misses / total_accesses if total_accesses else 0.0,
            "evictions": self.evictions,
            "total_prefetches": self.total_prefetches,
            "useful_prefetches": self.useful_prefetches,
            "useless_prefetches": self.useless_prefetches,
            "prefetch_accuracy": prefetch_accuracy,
            "prefetch_coverage": prefetch_coverage,
            "events": self.events
        }


# =====================================================================
# BENCHMARK EVALUATOR (Matches Cells 58 & 65 in Notebook)
# =====================================================================

def evaluate_benchmarks(
    trace: List[str],
    replacement_model,
    prefetch_model_data: Dict,
    capacity: int = 4
) -> List[BenchmarkItemSchema]:
    """
    Runs all 5 policies on the given workload trace and returns comparative hit rates.
    """
    lru = LRUCache(capacity=capacity).run(trace)
    fifo = FIFOCache(capacity=capacity).run(trace)
    rnd = RandomCache(capacity=capacity, seed=42).run(trace)

    ml_replace = AdaptiveMLCacheV3(
        model=replacement_model,
        capacity=capacity,
        recent_window=16
    ).run(trace)

    prefetcher = MarkovPrefetcher(
        transition_model=prefetch_model_data,
        context_size=2,
        threshold=0.70
    )

    combined = MLReplacementPrefetchCache(
        replacement_model=replacement_model,
        prefetcher=prefetcher,
        capacity=capacity
    ).run(trace)

    return [
        BenchmarkItemSchema(name="LRU", value=round(lru["hit_rate"] * 100, 2)),
        BenchmarkItemSchema(name="FIFO", value=round(fifo["hit_rate"] * 100, 2)),
        BenchmarkItemSchema(name="Random", value=round(rnd["hit_rate"] * 100, 2)),
        BenchmarkItemSchema(name="ML Replacement", value=round(ml_replace["hit_rate"] * 100, 2)),
        BenchmarkItemSchema(name="ML + Prefetch", value=round(combined["hit_rate"] * 100, 2)),
    ]
