'use client'

import React, { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Cpu,
  Database,
  BrainCircuit,
  Radio,
  BarChart2,
  ArrowDown,
  GitFork,
  Layers,
  ShieldAlert,
  Server
} from 'lucide-react'

function HowItWorksView() {
  const shouldReduceMotion = useReducedMotion()

  const pipelineSteps = [
    {
      num: '01',
      title: 'CPU Memory Request',
      icon: Cpu,
      colorClass: 'text-[var(--accent-vermilion-text)]',
      desc: 'The CPU issues a memory request token based on workload pattern (Dynamic, Looping, Random, Sequential) or user-specified manual sequence.',
    },
    {
      num: '02',
      title: 'Cache Tag Directory Lookup',
      icon: Database,
      colorClass: 'text-[var(--accent-sage-text)]',
      desc: 'The cache checks if the requested block already resides in an active slot. On a HIT, the data is served immediately with zero eviction latency.',
    },
    {
      num: '03',
      title: 'ML Feature Extraction',
      icon: Layers,
      colorClass: 'text-[var(--accent-amber-text)]',
      desc: 'On a CACHE MISS when all cache slots are occupied, the system extracts 8 runtime statistical features for each resident candidate block.',
    },
    {
      num: '04',
      title: 'Random Forest Prediction',
      icon: BrainCircuit,
      colorClass: 'text-[var(--accent-vermilion-text)]',
      desc: 'The trained Scikit-learn RandomForestRegressor performs micro-inference on each candidate, predicting its temporal reuse distance (time until next access).',
    },
    {
      num: '05',
      title: 'Victim Selection',
      icon: GitFork,
      colorClass: 'text-[var(--accent-vermilion-text)]',
      desc: 'Following the Belady MIN optimality principle, the candidate with the LARGEST predicted future-use distance is selected and evicted from the cache.',
    },
    {
      num: '06',
      title: 'Adaptive Markov Prefetching',
      icon: Radio,
      colorClass: 'text-[var(--accent-amber-text)]',
      desc: 'The Markov transition model analyzes recent 2-block access context. If the transition probability meets or exceeds the 70% threshold, it prefetches speculative lines.',
    },
    {
      num: '07',
      title: 'Telemetry & Metric Recording',
      icon: BarChart2,
      colorClass: 'text-[var(--accent-sage-text)]',
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
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="w-1.5 h-5 rounded-full bg-[var(--accent-vermilion)]" />
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Technical Architecture &amp; Algorithmic Foundations
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed mt-1">
          A dual-component AI memory architecture coupling offline-trained Random Forest regression for future-use distance approximation with an online Adaptive Markov Prefetcher to reduce compulsory and capacity cache misses.
        </p>
      </div>

      {/* End-to-End System Architecture Flow */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-5 gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
            <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] uppercase">
              End-to-End System Architecture Flow
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Full-Stack Execution Pipeline
          </span>
        </div>

        <div className="flex flex-col items-center max-w-2xl mx-auto space-y-2.5 py-2">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-vermilion-subtle)] border border-[var(--accent-vermilion-border)] flex items-center justify-center text-[var(--accent-vermilion-text)]">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Next.js 16 Research Interface
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Trace Controls &bull; 3D Cache Visualizer &bull; Recharts Analytics
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border border-[var(--border-subtle)] flex-shrink-0">
              Port 3000
            </span>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[var(--text-muted)]" />

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.06 }}
            className="w-full p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] flex items-center justify-center text-[var(--accent-sage-text)]">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  FastAPI Backend API
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  REST Endpoints: /health, /simulate, /trace/generate, /benchmark/matrix
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)] flex-shrink-0">
              Port 8000
            </span>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[var(--text-muted)]" />

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12 }}
            className="w-full p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] flex items-center justify-center text-[var(--accent-sage-text)]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Core Simulation Engine
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Workload Generation &bull; Cache Tag Directory &bull; Event Recording
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border border-[var(--border-subtle)] flex-shrink-0">
              Python 3.12
            </span>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[var(--text-muted)]" />

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.18 }}
            className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--accent-vermilion-border)] text-left">
              <div className="flex items-center gap-1.5 text-[var(--accent-vermilion-text)] mb-1">
                <BrainCircuit className="w-4 h-4" />
                <span className="text-xs font-bold">Random Forest Regressor</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Predicts future reuse distance for resident blocks to approximate Belady&apos;s MIN eviction policy.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--accent-amber-border)] text-left">
              <div className="flex items-center gap-1.5 text-[var(--accent-amber-text)] mb-1">
                <Radio className="w-4 h-4" />
                <span className="text-xs font-bold">Markov Prefetcher</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Adaptive transition matrix with exponential decay (0.90) and 70% confidence threshold.
              </p>
            </div>
          </motion.div>

          <ArrowDown className="w-4 h-4 text-[var(--text-muted)]" />

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.24 }}
            className="w-full p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] flex items-center justify-center text-[var(--accent-sage-text)]">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-primary)] block">
                  Performance Metrics &amp; Comparative Benchmark
                </span>
                <span className="text-[11px] text-[var(--text-secondary)]">
                  Hit/Miss Rates &bull; Prefetch Accuracy &bull; Policy Evaluation &amp; CSV Export
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)] flex-shrink-0">
              Empirical
            </span>
          </motion.div>
        </div>
      </div>

      {/* 7-Step Pipeline Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <GitFork className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Execution Lifecycle &bull; Seven-Stage Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((st) => {
            const Icon = st.icon
            return (
              <div
                key={st.num}
                className="glass-card p-4 rounded-2xl flex flex-col justify-between hover:border-[var(--border-strong)] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                      STAGE {st.num}
                    </span>
                    <div
                      className={`p-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] ${st.colorClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-[var(--text-primary)] mb-1">
                    {st.title}
                  </h3>

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
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
            <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] uppercase">
              Eight Model Features for Eviction Distance Regression
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            REGRESSION_FEATURES
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
          The Random Forest regressor (55 MB serialized artifact) evaluates these 8 runtime behavioral features for every cache candidate upon a miss:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {modelFeatures.map((feat, idx) => (
            <div
              key={feat.key}
              className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--text-primary)]">{feat.name}</span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">#{idx + 1}</span>
              </div>
              <code className="text-[10px] font-mono text-[var(--accent-vermilion-text)] block">
                {feat.key}
              </code>
              <p className="text-[11px] text-[var(--text-secondary)] leading-snug pt-1">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Markov Prefetcher Parameters Card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[var(--accent-amber-text)]" />
            <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)] uppercase">
              Adaptive Markov Prefetcher Parameters
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            adaptive_cache_config.json
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Context Size
            </span>
            <span className="text-2xl font-extrabold font-mono text-[var(--text-primary)] mt-1 block">
              2 Blocks
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
              Maintains an order-2 Markov transition window (e.g., [A, B] &rarr; C) to identify recurring stride and loop patterns.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Confidence Threshold
            </span>
            <span className="text-2xl font-extrabold font-mono text-[var(--accent-sage-text)] mt-1 block">
              0.70 (70%)
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
              Minimum transition probability required before issuing a speculative prefetch, preventing cache pollution.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Adaptive Decay Rate
            </span>
            <span className="text-2xl font-extrabold font-mono text-[var(--accent-amber-text)] mt-1 block">
              0.90 (&lambda;)
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed">
              Exponential transition weighting that gradually decays stale patterns when workload phases shift dynamically.
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Rigor Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--accent-amber-subtle)] border border-[var(--accent-amber-border)] flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-[var(--accent-amber-text)] flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h3 className="font-bold text-[var(--text-primary)]">
            Scientific Accuracy &amp; Algorithmic Modeling Notice
          </h3>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-relaxed">
            The Scikit-learn Random Forest model <strong>approximates</strong> future-use distance learned from historical training workloads; it does not compute the true theoretical Belady MIN algorithm, which requires full offline knowledge of future trace requests. During online simulation, the candidate block with the <strong>largest predicted future-use distance</strong> is selected as the eviction victim.
          </p>
        </div>
      </div>
    </div>
  )
}

export default memo(HowItWorksView)
