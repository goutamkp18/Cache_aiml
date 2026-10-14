import type { SimulationEvent, SimulationMetrics } from './simulationTypes'

export const demoTrace = ['A', 'B', 'C', 'D', 'A', 'B', 'E', 'C', 'A', 'D', 'E', 'F', 'A', 'B', 'C']
export const initialCache = ['A', 'B', 'C', 'D']

export function buildDemoEvents(trace = demoTrace, startingCache = initialCache): SimulationEvent[] {
  let cache = [...startingCache]
  return trace.map((request, index) => {
    const cacheBefore = [...cache]
    const hit = cache.includes(request)
    const predictions = Object.fromEntries(cacheBefore.map((block, scoreIndex) => [block, scoreIndex + 2 + (index % 2)]))
    const selectedVictim = hit ? undefined : cacheBefore.reduce((farthest, block) => predictions[block] > predictions[farthest] ? block : farthest, cacheBefore[0])
    const cacheAfter = hit ? cacheBefore : [...cacheBefore.filter((block) => block !== selectedVictim), request]
    cache = cacheAfter
    const next = trace[index + 1]
    const prefetchBlock = next && !cacheAfter.includes(next) ? next : undefined
    return {
      request,
      result: hit ? 'HIT' : 'MISS',
      cacheBefore,
      predictions,
      selectedVictim,
      evicted: selectedVictim,
      inserted: hit ? undefined : request,
      cacheAfter,
      prefetch: { block: prefetchBlock, confidence: prefetchBlock ? 0.92 : undefined, status: prefetchBlock ? 'PREFETCHED' : 'NO PREFETCH', context: trace.slice(Math.max(0, index - 1), index + 1) },
    }
  })
}

export function metricsFor(events: SimulationEvent[], index: number): SimulationMetrics {
  const processed = events.slice(0, index + 1)
  const hits = processed.filter((event) => event.result === 'HIT').length
  const misses = processed.length - hits
  const prefetched = processed.filter((event) => event.prefetch.status === 'PREFETCHED').length
  const usefulPrefetches = processed.filter((event, i) => event.prefetch.block && events[i + 1]?.request === event.prefetch.block).length
  const total = processed.length || 1
  return { hits, misses, totalPrefetches: prefetched, usefulPrefetches, hitRate: `${(hits / total * 100).toFixed(2)}%`, missRate: `${(misses / total * 100).toFixed(2)}%`, prefetchAccuracy: `${(prefetched ? usefulPrefetches / prefetched * 100 : 0).toFixed(2)}%`, prefetchCoverage: `${(prefetched / total * 100).toFixed(2)}%` }
}
