export type SimulationResult = 'HIT' | 'MISS'

export type PrefetchState = {
  block?: string | null
  confidence?: number | null
  status: 'PREFETCHED' | 'NO PREFETCH' | string
  context: string[]
}

export type SimulationEvent = {
  index: number
  request: string
  result: SimulationResult
  cacheBefore: string[]
  cacheAfter: string[]
  predictions: Record<string, number>
  selectedVictim?: string | null
  evicted?: string | null
  inserted?: string | null
  prefetch: PrefetchState
}

export type SimulationMetrics = {
  hits: number
  misses: number
  totalPrefetches: number
  usefulPrefetches: number
  hitRate: string
  missRate: string
  prefetchAccuracy: string
  prefetchCoverage: string
  executionTimeMs?: number
  avgAccessTimeUs?: number
  totalAccesses?: number
  evictions?: number
}

export type BenchmarkItem = {
  name: string
  value: number
}

export type CapacityExperiment = {
  capacity: number
  policies: Record<string, number>
}

export type BenchmarkMatrixData = {
  workloads: string[]
  policies: string[]
  matrix: Record<string, Record<string, number>>
  capacityExperiments: Record<string, CapacityExperiment[]>
  executionTimeMs: number
}

export type SimulationResponse = {
  trace: string[]
  events: SimulationEvent[]
  metrics: SimulationMetrics
  benchmark: BenchmarkItem[]
  matrixBenchmark?: Record<string, Record<string, number>>
}

export type SimulationLifecycleState = 'IDLE' | 'CONFIGURING' | 'RUNNING' | 'COMPLETED' | 'ERROR'

export type BenchmarkPolicyProgress = {
  name: string
  status: 'PENDING' | 'EVALUATING' | 'COMPLETED'
  value?: number
}

export type LiveTelemetryPoint = {
  accessIndex: number
  request: string
  result: 'HIT' | 'MISS'
  hits: number
  misses: number
  hitRate: number
  missRate: number
  occupancy: number
  capacity: number
  totalPrefetches: number
  usefulPrefetches: number
  prefetchAccuracy: number
}

export type LiveStreamEvent = {
  type:
    | 'simulation_started'
    | 'access'
    | 'benchmark_started'
    | 'benchmark_policy_evaluating'
    | 'benchmark_policy_completed'
    | 'simulation_completed'
    | 'simulation_error'
  access_index?: number
  total_accesses?: number
  request?: string
  result?: 'HIT' | 'MISS'
  cache_before?: string[]
  cache_after?: string[]
  predictions?: Record<string, number>
  selected_victim?: string | null
  evicted?: string | null
  inserted?: string | null
  prefetch?: PrefetchState
  hits?: number
  misses?: number
  hit_rate?: number
  miss_rate?: number
  total_prefetches?: number
  useful_prefetches?: number
  useless_prefetches?: number
  prefetch_accuracy?: number
  prefetch_coverage?: number
  occupancy?: number
  capacity?: number
  policies?: string[]
  policy?: string
  value?: number
  metrics?: SimulationMetrics
  benchmark?: BenchmarkItem[]
  events?: SimulationEvent[]
  trace?: string[]
  error?: string
}

export type HealthStatus = {
  status: string
  models_loaded: boolean
  config: Record<string, any>
  workloads: string[]
  policies: string[]
  cache_sizes: number[]
}

export type ExperimentStatus =
  | 'NO_EXPERIMENT'
  | 'CONFIG_CHANGED'
  | 'TRACE_VALIDATED'
  | 'COMPUTING'
  | 'READY_FOR_PLAYBACK'
  | 'PLAYING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ERROR'

export interface ActiveExperimentRecord {
  experimentId: string
  status: ExperimentStatus
  workload: string
  trace: string[]
  traceLength: number
  cacheCapacity: number
  policy: string
  events: SimulationEvent[]
  metrics: SimulationMetrics | null
  telemetryPoints: LiveTelemetryPoint[]
  startedAt: string | null
  completedAt: string | null
  errorMessage?: string | null
}

export function parseTraceTokens(input: string): string[] {
  if (!input) return []
  return input
    .split(/[, \t\r\n]+/)
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t.length > 0)
}

