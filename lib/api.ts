import type {
  SimulationEvent,
  SimulationMetrics,
  BenchmarkItem,
  SimulationResponse,
  HealthStatus,
  BenchmarkMatrixData,
  CapacityExperiment,
  SimulationLifecycleState,
  LiveStreamEvent,
  BenchmarkPolicyProgress,
  LiveTelemetryPoint
} from '@/simulation/simulationTypes'

export type {
  SimulationEvent,
  SimulationMetrics,
  BenchmarkItem,
  SimulationResponse,
  HealthStatus,
  BenchmarkMatrixData,
  CapacityExperiment,
  SimulationLifecycleState,
  LiveStreamEvent,
  BenchmarkPolicyProgress,
  LiveTelemetryPoint
}

export type SimulationRequestPayload = {
  workload: string
  policy: string
  cache_size: number
  trace_length?: number
  custom_trace?: string[] | null
  seed?: number | null
}

export type TraceGeneratePayload = {
  workload: string
  trace_length?: number
  seed?: number | null
}

export type TraceGenerateResponse = {
  workload: string
  trace_length: number
  trace: string[]
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
 * Preview / generate trace endpoint matching FastAPI POST /trace/generate
 */
export async function generateTracePreview(
  payload: TraceGeneratePayload
): Promise<{ success: boolean; data?: TraceGenerateResponse; error?: string }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(`${API_BASE_URL}/trace/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        workload: payload.workload,
        trace_length: payload.trace_length ?? 15,
        seed: payload.seed ?? null,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const errorDetail = await res.text()
      return { success: false, error: `Trace generation failed (${res.status}): ${errorDetail}` }
    }

    const data: TraceGenerateResponse = await res.json()
    return { success: true, data }
  } catch (err: any) {
    return {
      success: false,
      error: err?.name === 'AbortError' ? 'Trace generation timed out' : err?.message
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
        seed: payload.seed ?? null,
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

/**
 * Fetch full empirical benchmark matrix across all 4 workloads and 4 capacities
 */
export async function fetchBenchmarkMatrix(): Promise<{
  success: boolean
  data?: BenchmarkMatrixData
  error?: string
}> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    const res = await fetch(`${API_BASE_URL}/benchmark/matrix`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!res.ok) {
      const errorDetail = await res.text()
      return {
        success: false,
        error: `Matrix benchmark failed (${res.status}): ${errorDetail}`
      }
    }

    const data: BenchmarkMatrixData = await res.json()
    return { success: true, data }
  } catch (err: any) {
    return {
      success: false,
      error: err?.name === 'AbortError'
        ? 'Benchmark matrix request timed out'
        : (err?.message || 'Failed to fetch benchmark matrix from backend')
    }
  }
}

export interface StreamHandlers {
  onStart?: (data: { total: number; trace: string[]; workload: string; policy: string; capacity: number }) => void
  onAccess?: (event: LiveStreamEvent) => void
  onBenchmarkStarted?: (policies: string[]) => void
  onBenchmarkPolicyEvaluating?: (policy: string) => void
  onBenchmarkPolicyCompleted?: (policy: string, value: number) => void
  onComplete?: (data: { metrics: SimulationMetrics; benchmark: BenchmarkItem[]; events: SimulationEvent[]; trace: string[] }) => void
  onError?: (error: string) => void
}

/**
 * Real-time SSE streaming client for step-by-step cache simulation
 * and live comparative benchmark updates.
 */
export async function streamSimulation(
  payload: SimulationRequestPayload,
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/simulate/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        workload: payload.workload,
        policy: payload.policy,
        cache_size: Number(payload.cache_size),
        trace_length: payload.trace_length ? Number(payload.trace_length) : 15,
        custom_trace: payload.custom_trace && payload.custom_trace.length > 0 ? payload.custom_trace : null,
        seed: payload.seed ?? null,
      }),
      signal,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Streaming failed (${res.status}): ${errText}`)
    }

    if (!res.body) {
      throw new Error('ReadableStream not supported by browser body.')
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const chunks = buffer.split('\n\n')
      // Retain last incomplete piece in buffer
      buffer = chunks.pop() || ''

      for (const chunk of chunks) {
        const trimmed = chunk.trim()
        if (!trimmed.startsWith('data:')) continue
        const jsonStr = trimmed.replace(/^data:\s*/, '').trim()
        if (!jsonStr) continue

        try {
          const event: LiveStreamEvent = JSON.parse(jsonStr)

          if (event.type === 'simulation_started') {
            handlers.onStart?.({
              total: event.total_accesses || 0,
              trace: event.trace || [],
              workload: (event as any).workload || payload.workload,
              policy: (event as any).policy || payload.policy,
              capacity: (event as any).capacity || payload.cache_size,
            })
          } else if (event.type === 'access') {
            handlers.onAccess?.(event)
          } else if (event.type === 'benchmark_started') {
            handlers.onBenchmarkStarted?.(event.policies || [])
          } else if (event.type === 'benchmark_policy_evaluating') {
            handlers.onBenchmarkPolicyEvaluating?.(event.policy || '')
          } else if (event.type === 'benchmark_policy_completed') {
            handlers.onBenchmarkPolicyCompleted?.(event.policy || '', event.value ?? 0)
          } else if (event.type === 'simulation_completed') {
            if (event.metrics && event.benchmark && event.events) {
              handlers.onComplete?.({
                metrics: event.metrics,
                benchmark: event.benchmark,
                events: event.events,
                trace: event.trace || [],
              })
            }
          } else if (event.type === 'simulation_error') {
            handlers.onError?.(event.error || 'Server reported a simulation error.')
          }
        } catch (parseErr) {
          console.warn('[SSE] JSON parse warning:', parseErr, jsonStr)
        }
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return // User intentionally cancelled/stopped
    }
    handlers.onError?.(err?.message || 'Connection lost to simulation stream.')
  }
}
