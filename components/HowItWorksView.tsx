'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  Cpu,
  Database,
  BrainCircuit,
  Radio,
  BarChart2,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  GitFork,
  FileCode2,
  Zap,
  Layers,
  Sparkles,
  ShieldAlert,
  Server,
  Activity,
  Sliders
} from 'lucide-react'

export default function HowItWorksView() {
  const pipelineSteps = [
    {
      num: '01',
      title: 'CPU Memory Request',
      icon: Cpu,
      color: 'var(--accent-crimson)',
      desc: 'The CPU issues a memory request token based on workload pattern (Dynamic, Looping, Random, Sequential) or user-specified manual sequence.',
    },
    {
      num: '02',
      title: 'Cache Tag Directory Lookup',
      icon: Database,
      color: 'var(--accent-green)',
      desc: 'The cache checks if the requested block already resides in an active slot. On a HIT, the data is served immediately with zero eviction latency.',
    },
    {
      num: '03',
      title: 'ML Feature Extraction',
      icon: Layers,
      color: 'var(--accent-cyan)',
      desc: 'On a CACHE MISS when all cache slots are occupied, the system extracts 8 runtime statistical features for each resident candidate block.',
    },
    {
      num: '04',
      title: 'Random Forest Prediction',
      icon: BrainCircuit,
      color: 'var(--accent-crimson)',
      desc: 'The trained Scikit-learn RandomForestRegressor performs micro-inference on each candidate, predicting its temporal reuse distance (time until next access).',
    },
    {
      num: '05',
      title: 'Victim Selection',
      icon: GitFork,
      color: 'var(--accent-crimson)',
      desc: 'Following the Belady MIN optimality principle, the candidate with the LARGEST predicted future-use distance is selected and evicted from the cache.',
    },
    {
      num: '06',
      title: 'Adaptive Markov Prefetching',
      icon: Radio,
      color: 'var(--accent-cyan)',
      desc: 'The Markov transition model analyzes recent 2-block access context. If the transition probability meets or exceeds the 70% threshold, it prefetches speculative lines.',
    },
    {
      num: '07',
      title: 'Telemetry & Metric Recording',
      icon: BarChart2,
      color: 'var(--accent-green)',
      desc: 'Telemetry counters record hits, misses, useful/useless prefetches, eviction counts, and high-precision execution timings in microseconds.',
    },
  ]

  const modelFeatures = [
    {
      name: 'Recency',
      key: 'recency',
      desc: 'Number of memory access cycles elapsed since this block was last accessed.',
    },
    {
      name: 'Frequency',
      key: 'frequency',
      desc: 'Total number of cumulative references to this block over the entire trace history.',
    },
    {
      name: 'Recent Frequency',
      key: 'recent_freq',
      desc: 'Number of times this block was requested within the recent sliding observation window.',
    },
    {
      name: 'Recent Frequency Ratio',
      key: 'recent_freq_ratio',
      desc: 'Ratio of short-term window frequency relative to historical lifetime frequency.',
    },
    {
      name: 'Average Reuse Distance',
      key: 'avg_reuse_dist',
      desc: 'Mean number of intervening memory requests between successive accesses to this block.',
    },
    {
      name: 'Reuse Distance Std Dev',
      key: 'reuse_dist_std',
      desc: 'Standard deviation of reuse distances, measuring access regularity versus burstiness.',
    },
    {
      name: 'Lifetime',
      key: 'lifetime',
      desc: 'Total duration (in access steps) from the first reference of this block to the current step.',
    },
    {
      name: 'Recent Working Set Size',
      key: 'working_set_size',
      desc: 'Cardinality of unique active memory blocks accessed within the recent temporal window.',
    },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Title Card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-4 rounded-full bg-[var(--accent-crimson)]" />
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Technical Architecture &amp; Algorithmic Foundations
          </h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)] max-w-3xl leading-relaxed mt-1">
          A dual-component AI memory architecture coupling offline-trained Random Forest regression for future-use distance approximation with an online Adaptive Markov Prefetcher to eliminate compulsory and capacity cache misses.
        </p>
      </div>

      {/* Animated Architecture Diagram */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-5">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[var(--accent-crimson)]" />
            <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              End-to-End System Architecture Flow
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Full-Stack Execution Pipeline
          </span>
        </div>

        {/* Vertical/Horizontal Responsive Flowchart */}
        <div className="flex flex-col items-center max-w-3xl mx-auto space-y-2 py-3">
          {/* Node 1: Next.js Frontend */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] flex items-center justify-center text-[var(--accent-crimson)]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">Next.js 16 Frontend</span>
                <span className="text-[10px] text-[var(--text-muted)]">User Controls &bull; 60 FPS Visualizer &bull; Recharts Analytics</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              Port 3000
            </span>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[var(--accent-crimson)]" />

          {/* Node 2: FastAPI Backend */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full max-w-md p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan-subtle)] border border-[var(--accent-cyan-border)] flex items-center justify-center text-[var(--accent-cyan)]">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">FastAPI Backend API</span>
                <span className="text-[10px] text-[var(--text-muted)]">REST Endpoints: /health, /simulate, /benchmark/matrix</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--accent-green)] border border-[var(--border-subtle)]">
              Port 8000
            </span>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[var(--accent-cyan)]" />

          {/* Node 3: Simulation Engine */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="w-full max-w-md p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[var(--accent-green)]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">Core Simulation Engine</span>
                <span className="text-[10px] text-[var(--text-muted)]">Trace Generation &bull; Cache Tag Directory &bull; Event Dispatcher</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              Python 3.12
            </span>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[var(--accent-green)]" />

          {/* Node 4: Dual AI Models (Random Forest + Markov Prefetcher) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="w-full max-w-md grid grid-cols-2 gap-3"
          >
            <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--accent-crimson-border)] text-left shadow-sm">
              <div className="flex items-center gap-1.5 text-[var(--accent-crimson)] mb-1">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-xs font-bold">Random Forest</span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
                Replacement Regressor predicting next-use distance (Belady MIN approximation).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--accent-cyan-border)] text-left shadow-sm">
              <div className="flex items-center gap-1.5 text-[var(--accent-cyan)] mb-1">
                <Radio className="w-4 h-4" />
                <span className="text-xs font-bold">Markov Prefetcher</span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] leading-tight">
                Adaptive transition matrix with exponential decay (0.90) &amp; confidence threshold (70%).
              </p>
            </div>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[var(--text-muted)]" />

          {/* Node 5: Performance Telemetry & Metrics */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="w-full max-w-md p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">Performance Metrics &amp; Telemetry</span>
                <span className="text-[10px] text-[var(--text-muted)]">Hit/Miss Rates &bull; Prefetch Accuracy &bull; Latency Profiling</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--accent-green)] border border-[var(--border-subtle)]">
              Real Measurements
            </span>
          </motion.div>
        </div>
      </div>

      {/* 7-Step Pipeline Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <GitFork className="w-4 h-4 text-[var(--accent-crimson)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Execution Lifecycle &bull; Seven-Stage Pipeline
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {pipelineSteps.map((st) => {
            const Icon = st.icon
            return (
              <div
                key={st.num}
                className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between hover:border-[var(--text-muted)] transition-colors shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                      STAGE {st.num}
                    </span>
                    <div
                      className="p-1.5 rounded-lg bg-[var(--bg-surface-elevated)]"
                      style={{ color: st.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">
                    {st.title}
                  </h4>

                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* The 8 Regression Features Section */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[var(--accent-crimson)]" />
            <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Eight Model Features for Eviction Distance Regression
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            REGRESSION_FEATURES
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
          The Random Forest regressor (55 MB serialized artifact) evaluates these 8 online behavioral metrics for every cache candidate upon a miss:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {modelFeatures.map((feat, idx) => (
            <div
              key={feat.key}
              className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)]">
                  {feat.name}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  #{idx + 1}
                </span>
              </div>
              <code className="text-[10px] font-mono text-[var(--accent-crimson)] block">
                {feat.key}
              </code>
              <p className="text-[11px] text-[var(--text-secondary)] leading-tight pt-1">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Markov Prefetcher Parameters Card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[var(--accent-cyan)]" />
            <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Adaptive Markov Prefetcher Parameters
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--accent-cyan)]">
            adaptive_cache_config.json
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Context Size
            </span>
            <span className="text-2xl font-extrabold font-mono text-[var(--text-primary)] mt-1 block">
              2 Blocks
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Maintains an order-2 Markov transition window (e.g., [A, B] &rarr; C) to identify complex sequential and stride patterns.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Confidence Threshold
            </span>
            <span className="text-2xl font-extrabold font-mono text-[var(--accent-cyan)] mt-1 block">
              0.70 (70%)
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Minimum transition probability required before issuing a speculative prefetch, preventing cache pollution on uncertain transitions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Adaptive Decay Rate
            </span>
            <span className="text-2xl font-extrabold font-mono text-amber-400 mt-1 block">
              0.90 (&lambda;)
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1">
              Exponential transition weighting that gradually decays stale transitions when memory access phases shift dynamically.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Scientific Rigor & Belady MIN Notice */}
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface-elevated)] border border-amber-500/30 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-[var(--text-primary)]">
            Scientific Accuracy &amp; Algorithmic Modeling Notice
          </h4>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            The Scikit-learn Random Forest model <strong>approximates</strong> future-use distance learned from historical training workloads; it does not compute the true theoretical Belady MIN algorithm, which requires full offline knowledge of future trace requests. During online simulation, the candidate block with the <strong>largest predicted future-use distance</strong> is chosen as the eviction victim.
          </p>
        </div>
      </div>
    </div>
  )
}
