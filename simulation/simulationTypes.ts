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
}

export type BenchmarkItem = {
  name: string
  value: number
}

export type SimulationResponse = {
  trace: string[]
  events: SimulationEvent[]
  metrics: SimulationMetrics
  benchmark: BenchmarkItem[]
}

export type HealthStatus = {
  status: string
  models_loaded: boolean
  config: Record<string, any>
  workloads: string[]
  policies: string[]
  cache_sizes: number[]
}
