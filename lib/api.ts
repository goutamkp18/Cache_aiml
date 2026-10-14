import type {
  SimulationEvent,
  SimulationMetrics,
  BenchmarkItem,
  SimulationResponse,
  HealthStatus
} from '@/simulation/simulationTypes'

export type {
  SimulationEvent,
  SimulationMetrics,
  BenchmarkItem,
  SimulationResponse,
  HealthStatus
}

export type SimulationRequestPayload = {
  workload: string
  policy: string
  cache_size: number
  trace_length?: number
  custom_trace?: string[] | null
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000'

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

/**
 * Health check endpoint matching FastAPI GET /health
 */
export async function checkBackendHealth(): Promise<{
  connected: boolean
  data?: HealthStatus
  error?: string
}> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data: HealthStatus = await res.json()
      return { connected: data.models_loaded === true, data }
    }
    return { connected: false, error: `Backend responded with HTTP ${res.status}` }
  } catch (err: any) {
    return {
      connected: false,
      error: err?.name === 'AbortError' ? 'Connection timed out' : 'Backend is offline'
    }
  }
}

/**
 * Run simulation endpoint matching FastAPI POST /simulate
 */
export async function fetchSimulation(
  payload: SimulationRequestPayload
): Promise<{ success: boolean; data?: SimulationResponse; error?: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 12000)

    const res = await fetch(`${API_BASE_URL}/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        workload: payload.workload,
        policy: payload.policy,
        cache_size: Number(payload.cache_size),
        trace_length: payload.trace_length ? Number(payload.trace_length) : 15,
        custom_trace: payload.custom_trace && payload.custom_trace.length > 0 ? payload.custom_trace : null,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const errorDetail = await res.text()
      return {
        success: false,
        error: `Simulation failed (${res.status}): ${errorDetail}`
      }
    }

    const data: SimulationResponse = await res.json()
    return { success: true, data }
  } catch (err: any) {
    return {
      success: false,
      error: err?.name === 'AbortError'
        ? 'Simulation request timed out'
        : (err?.message || 'Failed to connect to FastAPI backend on http://localhost:8000')
    }
  }
}
