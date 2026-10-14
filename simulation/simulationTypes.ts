export type SimulationResult = 'HIT' | 'MISS'

export type PrefetchState = {
  block?: string
  confidence?: number
  status: 'PREFETCHED' | 'NO PREFETCH'
  context: string[]
}

export type SimulationEvent = {
  request: string
  result: SimulationResult
  cacheBefore: string[]
  predictions: Record<string, number>
  selectedVictim?: string
  evicted?: string
  inserted?: string
  cacheAfter: string[]
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

export type SimulationSnapshot = {
  event: SimulationEvent
  metrics: SimulationMetrics
  index: number
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
