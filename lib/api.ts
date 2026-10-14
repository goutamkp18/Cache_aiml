import type { SimulationEvent, SimulationMetrics } from '@/simulation/simulationTypes'

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

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function checkBackendHealth(): Promise<{ connected: boolean; data?: HealthStatus }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data: HealthStatus = await res.json()
      return { connected: data.models_loaded === true, data }
    }
    return { connected: false }
  } catch {
    return { connected: false }
  }
}

export async function fetchSimulation(payload: {
  workload: string
  policy: string
  cache_size: number
  trace_length?: number
  custom_trace?: string[] | null
}): Promise<{ success: boolean; data?: SimulationResponse; error?: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(`${BACKEND_URL}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workload: payload.workload,
        policy: payload.policy,
        cache_size: payload.cache_size,
        trace_length: payload.trace_length ?? 15,
        custom_trace: payload.custom_trace ?? null,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const errText = await res.text()
      return { success: false, error: `Backend returned ${res.status}: ${errText}` }
    }

    const data: SimulationResponse = await res.json()
    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unable to connect to FastAPI backend' }
  }
}
