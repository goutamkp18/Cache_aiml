from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    workload: Optional[str] = Field("Dynamic", description="Workload type: Looping, Random, Sequential, Dynamic")
    policy: Optional[str] = Field("ML + Prefetch", description="Policy: LRU, FIFO, Random, ML Replacement, ML + Prefetch")
    cache_size: Optional[int] = Field(4, description="Cache capacity (e.g. 2, 4, 8, 16)")
    trace_length: Optional[int] = Field(15, description="Number of accesses to return for step-by-step UI animation")
    custom_trace: Optional[List[str]] = Field(None, description="Optional custom access trace")


class PrefetchStateSchema(BaseModel):
    block: Optional[str] = None
    confidence: Optional[float] = None
    status: str = Field("NO PREFETCH", description="'PREFETCHED' or 'NO PREFETCH'")
    context: List[str] = Field(default_factory=list)


class SimulationEventSchema(BaseModel):
    index: int
    request: str
    result: str  # 'HIT' | 'MISS'
    cacheBefore: List[str]
    cacheAfter: List[str]
    predictions: Dict[str, float]
    selectedVictim: Optional[str] = None
    evicted: Optional[str] = None
    inserted: Optional[str] = None
    prefetch: PrefetchStateSchema


class SimulationMetricsSchema(BaseModel):
    hits: int
    misses: int
    totalPrefetches: int
    usefulPrefetches: int
    hitRate: str
    missRate: str
    prefetchAccuracy: str
    prefetchCoverage: str


class BenchmarkItemSchema(BaseModel):
    name: str
    value: float


class SimulationResponse(BaseModel):
    trace: List[str]
    events: List[SimulationEventSchema]
    metrics: SimulationMetricsSchema
    benchmark: List[BenchmarkItemSchema]


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    config: Dict[str, Any]
    workloads: List[str]
    policies: List[str]
    cache_sizes: List[int]
