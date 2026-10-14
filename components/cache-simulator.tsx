'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ArrowDown, ArrowRight, BrainCircuit, Check, ChevronRight, Circle, Cpu, Database, Gauge, GitBranch, Pause, Play, RotateCcw, SkipForward, Sparkles, Zap } from 'lucide-react'
import { buildDemoEvents, demoTrace, metricsFor } from '@/simulation/mockSimulator'
import type { SimulationEvent, BenchmarkItem } from '@/simulation/simulationTypes'
import { checkBackendHealth, fetchSimulation } from '@/lib/api'

type Workload = 'Looping' | 'Random' | 'Sequential' | 'Dynamic'
type Policy = 'LRU' | 'FIFO' | 'Random' | 'ML Replacement' | 'ML + Prefetch'

const initialPolicies: BenchmarkItem[] = [
  { name: 'LRU', value: 7.56 },
  { name: 'FIFO', value: 7.33 },
  { name: 'Random', value: 19.33 },
  { name: 'ML Replacement', value: 30.56 },
  { name: 'ML + Prefetch', value: 44.67 },
]

function SectionLabel({ children }: { children: React.ReactNode }) { return <div className="section-label"><span className="label-dot" />{children}<span className="label-line" /></div> }
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <div className={`glass-card ${className}`}>{children}</div> }

function Mascot() { return <motion.div className="mascot" animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}><div className="mascot-eye eye-left" /><div className="mascot-eye eye-right" /><div className="mascot-core"><Sparkles size={18} /></div><span className="leg l1" /><span className="leg l2" /><span className="leg l3" /><span className="leg l4" /></motion.div> }

export default function CacheSimulator() {
  const simRef = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [cacheSize, setCacheSize] = useState(4)
  const [workload, setWorkload] = useState<Workload>('Dynamic')
  const [policy, setPolicy] = useState<Policy>('ML + Prefetch')

  // Real backend simulation state with fallback to local mock
  const [events, setEvents] = useState<SimulationEvent[]>(() => buildDemoEvents())
  const [trace, setTrace] = useState<string[]>(demoTrace)
  const [benchmarkPolicies, setBenchmarkPolicies] = useState<BenchmarkItem[]>(initialPolicies)
  const [backendStatus, setBackendStatus] = useState<'CONNECTED' | 'OFFLINE' | 'PROCESSING'>('PROCESSING')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Simulation loader communicating with FastAPI
  const loadSimulation = useCallback(async (
    targetWorkload: Workload,
    targetPolicy: Policy,
    targetCacheSize: number
  ) => {
    setBackendStatus('PROCESSING')
    const res = await fetchSimulation({
      workload: targetWorkload,
      policy: targetPolicy,
      cache_size: targetCacheSize,
      trace_length: 15,
    })

    if (res.success && res.data) {
      setEvents(res.data.events)
      setTrace(res.data.trace)
      if (res.data.benchmark && res.data.benchmark.length > 0) {
        setBenchmarkPolicies(res.data.benchmark)
      }
      setStep(0)
      setBackendStatus('CONNECTED')
      setErrorMessage(null)
    } else {
      setBackendStatus('OFFLINE')
      setErrorMessage(res.error || 'Backend unavailable')
      // Graceful fallback to local mock events so UI remains fully functional
      const fallbackEvents = buildDemoEvents()
      setEvents(fallbackEvents)
      setTrace(demoTrace)
      setStep(0)
    }
  }, [])

  // Initial connection and data load
  useEffect(() => {
    let mounted = true
    async function init() {
      const health = await checkBackendHealth()
      if (!mounted) return
      if (health.connected) {
        setBackendStatus('CONNECTED')
        await loadSimulation(workload, policy, cacheSize)
      } else {
        setBackendStatus('OFFLINE')
      }
    }
    init()
    return () => { mounted = false }
  }, [loadSimulation, workload, policy, cacheSize])

  // Handlers for interactive controls
  const handleWorkloadChange = (w: Workload) => {
    setWorkload(w)
    loadSimulation(w, policy, cacheSize)
  }

  const handlePolicyChange = (p: Policy) => {
    setPolicy(p)
    loadSimulation(workload, p, cacheSize)
  }

  const handleCacheSizeChange = (c: number) => {
    setCacheSize(c)
    loadSimulation(workload, policy, c)
  }

  // Active step safety guard
  const safeEvents = events.length > 0 ? events : buildDemoEvents()
  const safeStep = Math.min(step, safeEvents.length - 1)
  const event: SimulationEvent = safeEvents[safeStep]
  const liveMetrics = metricsFor(safeEvents, safeStep)

  // Playback timer
  useEffect(() => {
    if (!playing || safeEvents.length === 0) return
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % safeEvents.length)
    }, 2800 / speed)
    return () => window.clearInterval(id)
  }, [playing, speed, safeEvents.length])

  const activeScores = useMemo(() => Object.entries(event.predictions || {}), [event])
  const prefetchBlock = (event.prefetch?.status === 'PREFETCHED' && event.prefetch.block) ? event.prefetch.block : undefined

  const visibleEvents = event.result === 'MISS'
    ? ['CPU REQUEST', 'CACHE MISS', 'AI ANALYSIS', 'NEXT-USE PREDICTION', 'VICTIM SELECTED', 'EVICT', 'INSERT', 'PREFETCH PREDICTION', 'PREFETCH']
    : ['CPU REQUEST', 'CACHE HIT', 'AI ANALYSIS', 'PREFETCH PREDICTION']

  return (
    <main className="app-shell">
      <header className="site-header">
        <a href="#top" className="brand">
          <span className="brand-mark"><Zap size={16} fill="currentColor" /></span>
          <span>ADAPTIVE <b>CACHE AI</b></span>
        </a>
        <nav>
          <a href="#simulator">Simulator</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#performance">Performance</a>
        </nav>
        <div className="online">
          <span
            style={{
              background: backendStatus === 'CONNECTED' ? 'var(--green)' : backendStatus === 'PROCESSING' ? 'var(--cyan)' : 'var(--red)',
              boxShadow: backendStatus === 'CONNECTED' ? '0 0 12px var(--green)' : backendStatus === 'PROCESSING' ? '0 0 12px var(--cyan)' : '0 0 12px var(--red)',
            }}
          />
          {backendStatus === 'CONNECTED' ? 'BACKEND CONNECTED' : backendStatus === 'PROCESSING' ? 'PROCESSING' : 'BACKEND OFFLINE'}
        </div>
      </header>

      <section id="top" className="hero">
        <div className="web-orbit orbit-one" />
        <div className="web-orbit orbit-two" />
        <div className="hero-grid" />
        <div className="hero-copy">
          <div className="eyebrow">
            <span>AI RESEARCH LAB / 07</span>
            <span className="eyebrow-rule" />
          </div>
          <h1>TEACHING CACHE<br /><em>TO PREDICT</em> THE FUTURE</h1>
          <p>Machine-learning based cache replacement and adaptive prefetching for dynamic memory workloads.</p>
          <button className="primary-button" onClick={() => simRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            Launch Simulator <ArrowRight size={17} />
          </button>
        </div>
        <div className="hero-agent">
          <Mascot />
          <div className="agent-caption">NEXUS-01 <span>ADAPTIVE AGENT</span></div>
        </div>
        <div className="hero-foot">
          <span>TRACE / {trace.join(' · ')}</span>
          <span>LATENCY <b>2.4ms</b></span>
          <span>MODEL <b>{backendStatus === 'CONNECTED' ? 'FASTAPI + ML' : 'ONLINE DEMO'}</b></span>
        </div>
      </section>

      <section ref={simRef} id="simulator" className="simulator-section">
        <SectionLabel>
          {backendStatus === 'CONNECTED' ? 'LIVE SIMULATION / FASTAPI + PYTHON ML ENGINE' : 'LIVE SIMULATION / DEMO MODE'}
        </SectionLabel>
        <div className="section-heading">
          <div>
            <h2>THE CACHE <em>THINKS AHEAD.</em></h2>
            <p>Watch the replacement model read the trace, score future use, and move data before the CPU asks.</p>
            <div className="request-progress">
              REQUEST {String(safeStep + 1).padStart(2, '0')} / {trace.length} <span>·</span> CURRENT REQUEST <b>{event.request}</b>
            </div>
            <div className="trace-line">
              {trace.map((block, index) => (
                <span className={index === safeStep ? 'current' : ''} key={`${block}-${index}`}>
                  {block}{index < trace.length - 1 ? ' → ' : ''}
                </span>
              ))}
            </div>
          </div>
          <div className="request-chip">
            <span>REQUESTING</span>
            <strong>{event.request}</strong>
            <ArrowDown size={16} />
          </div>
        </div>

        <div className="sim-layout">
          <GlassCard className="control-card">
            <div className="card-kicker">SIMULATION CONTROL</div>
            {errorMessage && backendStatus === 'OFFLINE' && (
              <div style={{ fontSize: '9px', color: 'var(--red)', padding: '6px 8px', background: '#ff375f14', border: '1px solid #ff375f33', margin: '10px 0' }}>
                Offline: Using deterministic fallback.
              </div>
            )}
            <div className="control-actions">
              <button aria-label="Play" className={playing ? 'active' : ''} onClick={() => setPlaying(true)}>
                <Play size={15} fill="currentColor" />
              </button>
              <button aria-label="Pause" onClick={() => setPlaying(false)}>
                <Pause size={15} />
              </button>
              <button aria-label="Step" onClick={() => { setPlaying(false); setStep((s) => (s + 1) % safeEvents.length) }}>
                <SkipForward size={15} />
              </button>
              <button aria-label="Reset" onClick={() => { setPlaying(false); setStep(0) }}>
                <RotateCcw size={15} />
              </button>
            </div>
            <ControlGroup label="SPEED" options={['0.5x', '1x', '2x']} value={`${speed}x`} onChange={(v) => setSpeed(Number(v.replace('x', '')))} />
            <ControlGroup label="CACHE SIZE" options={['2', '4', '8', '16']} value={String(cacheSize)} onChange={(v) => handleCacheSizeChange(Number(v))} />
            <ControlGroup label="WORKLOAD" options={['Looping', 'Random', 'Sequential', 'Dynamic']} value={workload} onChange={(v) => handleWorkloadChange(v as Workload)} />
            <ControlGroup label="POLICY" options={['LRU', 'FIFO', 'Random', 'ML Replacement', 'ML + Prefetch']} value={policy} onChange={(v) => handlePolicyChange(v as Policy)} />
          </GlassCard>

          <div className="visual-stage">
            <div className="flow-label cpu-label"><Cpu size={14} /> CPU REQUEST <b>{event.request}</b></div>
            <motion.div className="flow-beam beam-top" animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.8, repeat: Infinity }} />
            <div className="analyzer">
              <Mascot />
              <div>
                <span>AI ANALYZER</span>
                <strong>{event.result === 'HIT' ? 'Confirming cache hit' : 'Predicting future use'}</strong>
              </div>
              <Activity size={17} />
            </div>
            <div className="flow-beam beam-mid" />
            <div className="cache-frame">
              <div className="cache-title">
                <span><Database size={15} /> CACHE MEMORY / L{cacheSize}</span>
                <span className={`result ${event.result.toLowerCase()}`}>{event.result === 'HIT' ? 'CACHE HIT ✓' : 'CACHE MISS ✕'}</span>
              </div>
              <div className="cache-blocks">
                {event.cacheAfter.map((block, i) => (
                  <motion.div
                    layout
                    key={`${block}-${i}`}
                    className={`cache-block ${block === event.evicted && event.result === 'MISS' ? 'evicting' : ''}`}
                    initial={{ opacity: 0, y: 25, scale: .8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                  >
                    <span className="block-address">0x0{i + 4}F</span>
                    <strong>{block}</strong>
                    <span className="block-state">{block === event.request ? 'ACTIVE' : 'RESIDENT'}</span>
                    <div className="block-sheen" />
                  </motion.div>
                ))}
              </div>
              <div className="cache-foot">
                <span><span className="legend-dot red" /> EVICTION CANDIDATE <b>{event.evicted ?? '—'}</b></span>
                <span>{event.cacheAfter.length} / {cacheSize} SLOTS</span>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {prefetchBlock && (
                <motion.div
                  key={prefetchBlock}
                  className="prefetch-flight"
                  initial={{ opacity: 0, x: 100, y: 18 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: .8 }}
                >
                  <span>FUTURE MEMORY</span>
                  <strong>{prefetchBlock}</strong>
                  <ArrowRight size={17} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="stage-status">
              <span className="status-dot" />
              {event.result === 'HIT' ? 'CACHE HIT / FAST PATH' : 'EVICTION + INSERT COMPLETE'}
              {prefetchBlock && <b>→ PREFETCH {prefetchBlock}</b>}
            </div>
          </div>

          <div className="side-stack">
            <GlassCard>
              <PanelTitle icon={<BrainCircuit size={16} />} title="AI DECISION ENGINE" />
              <div className="decision-row"><span>CURRENT REQUEST</span><strong>{event.request}</strong></div>
              <div className="decision-row"><span>RESULT</span><strong className={event.result === 'HIT' ? 'text-green' : 'text-red'}>{event.result}</strong></div>
              <div className="score-title">PREDICTED NEXT USE</div>
              {activeScores.length > 0 ? (
                activeScores.map(([block, score]) => (
                  <div className="score-row" key={block}>
                    <span>{block}</span>
                    <div className="score-bar"><i style={{ width: `${Math.min(100, (score / 10) * 100)}%` }} /></div>
                    <b>{typeof score === 'number' ? score.toFixed(1) : score}</b>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '9px', color: '#657188', margin: '14px 0' }}>
                  {event.result === 'HIT' ? 'Fast path hit: No replacement calculation needed.' : 'Capacity available: No candidate evaluation needed.'}
                </div>
              )}
              <div className="victim"><span>SELECTED VICTIM</span><strong>{event.selectedVictim ?? 'NONE'}</strong></div>
              <details className="why-decision">
                <summary>WHY THIS DECISION?</summary>
                <p>
                  {event.result === 'MISS'
                    ? (event.selectedVictim
                      ? `All cache blocks were scored using predicted future-use distance. Block ${event.selectedVictim} had the largest predicted reuse distance and was selected for eviction.`
                      : 'The requested block was not in the cache, but empty capacity allowed insertion without eviction.')
                    : 'The requested block is already resident in the cache, so replacement inference was bypassed.'}
                </p>
              </details>
            </GlassCard>

            <GlassCard>
              <PanelTitle icon={<Sparkles size={16} />} title="ADAPTIVE PREFETCHER" />
              <div className="prefetch-big">
                <span>NEXT BLOCK</span>
                <strong>{prefetchBlock ?? '—'}</strong>
                <div><span>CONFIDENCE</span><b>{event.prefetch?.confidence ? `${Math.round(event.prefetch.confidence * 100)}%` : '—'}</b></div>
              </div>
              <div className="prefetch-status">
                {event.prefetch?.status === 'PREFETCHED' ? <><Check size={13} /> PREFETCHED</> : <>— NO PREFETCH</>}
              </div>
              <div className="model-note">MODEL <b>Adaptive Markov Predictor</b></div>
              <div className="context-line">
                Context: <b>{event.prefetch?.context?.length ? `[${event.prefetch.context.join(', ')}]` : '[—]'}</b>
                <ArrowRight size={13} /> Prediction: <b>{prefetchBlock ?? '—'}</b>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="timeline-wrap">
          <div className="timeline-head">
            <SectionLabel>EVENT STREAM</SectionLabel>
            <span>STEP {String(safeStep + 1).padStart(2, '0')} / {safeEvents.length}</span>
          </div>
          <div className="timeline">
            {visibleEvents.map((item, index) => (
              <motion.div
                key={`${item}-${safeStep}`}
                className={`timeline-event ${index === visibleEvents.length - 1 ? 'current' : ''}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="timeline-num">{String(index + 1).padStart(2, '0')}</span>
                <span className="timeline-dot" />
                <div>
                  <b>{item}</b>
                  <small>
                    {index === 0
                      ? event.request
                      : index === 1
                      ? event.result
                      : index === 3
                      ? Object.entries(event.predictions || {}).map(([b, s]) => `${b}:${typeof s === 'number' ? s.toFixed(1) : s}`).join('  ') || '—'
                      : index === 4
                      ? event.selectedVictim ?? '—'
                      : index === 5
                      ? event.evicted ?? '—'
                      : index === 6
                      ? event.inserted ?? '—'
                      : index === 7
                      ? prefetchBlock ?? '—'
                      : index === 8
                      ? prefetchBlock ?? '—'
                      : 'COMPLETE'}
                  </small>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="metrics-section">
        <SectionLabel>TELEMETRY / LIVE METRICS</SectionLabel>
        <div className="metrics-grid">
          {[
            { label: 'HIT RATE', value: liveMetrics.hitRate, tone: 'cyan' },
            { label: 'MISS RATE', value: liveMetrics.missRate, tone: 'red' },
            { label: 'PREFETCH ACCURACY', value: liveMetrics.prefetchAccuracy, tone: 'violet' },
            { label: 'PREFETCH COVERAGE', value: liveMetrics.prefetchCoverage, tone: 'blue' },
            { label: 'TOTAL PREFETCHES', value: String(liveMetrics.totalPrefetches), tone: 'cyan' },
            { label: 'USEFUL PREFETCHES', value: String(liveMetrics.usefulPrefetches), tone: 'green' },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              className={`metric-card ${metric.tone}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * .06 }}
            >
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <div className="metric-spark"><i /><i /><i /><i /><i /><i /><i /></div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="performance" className="performance-section">
        <div className="performance-copy">
          <SectionLabel>BENCHMARK / {workload.toUpperCase()} WORKLOAD</SectionLabel>
          <h2>THE MORE IT SEES,<br /><em>THE MORE IT KNOWS.</em></h2>
          <p>ML Replacement learns the temporal shape of the trace. Pair it with prefetching and the cache stops reacting — it starts arriving early.</p>
          <div className="workload-tabs">
            {(['Looping', 'Random', 'Sequential', 'Dynamic'] as Workload[]).map((item) => (
              <button
                className={workload === item ? 'selected' : ''}
                onClick={() => handleWorkloadChange(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <GlassCard className="comparison-card">
          <div className="comparison-title">
            <span>HIT RATE BY POLICY</span>
            <span>{workload.toUpperCase()} TRACE / BENCHMARK</span>
          </div>
          {benchmarkPolicies.map((item, i) => (
            <div className={`compare-row ${item.name === 'ML + Prefetch' ? 'winner' : ''}`} key={item.name}>
              <span>{item.name}</span>
              <div className="compare-track">
                <motion.i
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, item.value * 2)}%` }}
                  transition={{ duration: 1, delay: i * .1 }}
                />
              </div>
              <b>{typeof item.value === 'number' ? item.value.toFixed(2) : item.value}%</b>
            </div>
          ))}
          <div className="comparison-foot">
            <span>
              <span className="legend-dot blue" /> ML + PREFETCH PERFORMANCE: <b>
                {(benchmarkPolicies.find((p) => p.name === 'ML + Prefetch')?.value ?? 0).toFixed(2)}%
              </b>
            </span>
            <Gauge size={17} />
          </div>
        </GlassCard>
      </section>

      <section id="how-it-works" className="how-section">
        <SectionLabel>THE INTELLIGENCE LOOP</SectionLabel>
        <h2>FROM REQUEST <em>TO FORESIGHT.</em></h2>
        <div className="steps">
          {([['01', 'CPU REQUEST', Cpu], ['02', 'AI PREDICTS FUTURE USE', BrainCircuit], ['03', 'ML SELECTS EVICTION VICTIM', GitBranch], ['04', 'PREFETCHER LOADS FUTURE BLOCK', Sparkles]] as const).map(([num, label, Icon], i) => (
            <div className="step" key={num}>
              <span>{num}</span>
              <Icon size={22} />
              <h3>{label as string}</h3>
              {i < 3 && <ChevronRight className="step-arrow" size={17} />}
            </div>
          ))}
        </div>
        <div className="architecture">
          <span>CPU / REQUEST TRACE</span>
          <ArrowDown />
          <span>CACHE SIMULATOR</span>
          <ArrowDown />
          <span>ML REPLACEMENT MODEL</span>
          <ArrowDown />
          <span>ADAPTIVE PREFETCHER</span>
          <ArrowDown />
          <span>FASTAPI BACKEND</span>
          <ArrowDown />
          <span className="accent">REACT FRONTEND</span>
        </div>
      </section>

      <section className="code-section">
        <div className="code-heading">
          <SectionLabel>RUNTIME / TRACE ENGINE</SectionLabel>
          <h2>LIVE ALGORITHM <em>EXECUTION.</em></h2>
        </div>
        <div className="code-editor">
          <div className="editor-top">
            <span><Circle size={9} fill="#ff375f" /><Circle size={9} fill="#ffb800" /><Circle size={9} fill="#00d9ff" /></span>
            <span>adaptive_cache.py</span>
            <span>MODE: {policy} / {event.result}</span>
          </div>
          <div className="code-lines">
            {[
              'def access(block):',
              '    if block in cache:',
              '        return HIT',
              '    victim = choose_victim()',
              '    evict(victim)',
              '    insert(block)',
              '    prefetch(next_block)'
            ].map((line, i) => (
              <div className={i === (event.result === 'HIT' ? 2 : 4) ? 'active-line' : ''} key={line}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <code>
                  <i>{line.includes('def') ? 'def' : line.includes('return') ? 'return' : line.includes('if') ? 'if' : ''}</i>
                  {line.replace(/^(def|return|if)\s/, '')}
                </code>
                <small>{i === (event.result === 'HIT' ? 2 : 4) ? '← executing' : ''}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <span className="brand"><span className="brand-mark"><Zap size={14} fill="currentColor" /></span> ADAPTIVE CACHE AI</span>
        <span>ORIGINAL RESEARCH VISUALIZATION / AIML PBL</span>
        <span>SYSTEM STATE: <b>{backendStatus === 'CONNECTED' ? 'FASTAPI + ML ONLINE' : 'DEMO MODE'}</b></span>
      </footer>
    </main>
  )
}

function ControlGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="control-group">
      <span>{label}</span>
      <div>
        {options.map((option) => (
          <button key={option} className={value === option ? 'selected' : ''} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function PanelTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="panel-title"><span>{icon}</span><b>{title}</b></div>
}
