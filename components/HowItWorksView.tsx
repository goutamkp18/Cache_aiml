'use client'

import React from 'react'
import {
  Cpu,
  Database,
  BrainCircuit,
  Radio,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  GitFork,
  FileCode2,
  Zap
} from 'lucide-react'

export default function HowItWorksView() {
  const steps = [
    {
      num: '01',
      title: 'CPU Memory Request',
      icon: Cpu,
      accent: 'text-[var(--accent-crimson)]',
      desc: 'A target memory block is generated from the access trace (Dynamic phase, Looping cyclic, Sequential stride, or Random uniform pattern).',
    },
    {
      num: '02',
      title: 'Cache Tag Directory Check',
      icon: Database,
      accent: 'text-[var(--accent-green)]',
      desc: 'The cache checks whether the requested block is already resident. If found, a CACHE HIT is logged with zero eviction latency.',
    },
    {
      num: '03',
      title: 'ML Replacement Feature Extraction',
      icon: BrainCircuit,
      accent: 'text-[var(--accent-cyan)]',
      desc: 'On a CACHE MISS with full capacity, the simulator extracts 8 runtime features (recency, reuse distance, frequency, lifetime, etc.) for each resident candidate.',
    },
    {
      num: '04',
      title: 'Victim Selection via Belady MIN',
      icon: GitFork,
      accent: 'text-[var(--accent-crimson)]',
      desc: 'The Scikit-learn RandomForestRegressor predicts future-use distance for each candidate block. The candidate with the largest predicted distance is evicted.',
    },
    {
      num: '05',
      title: 'Adaptive Markov Prefetching',
      icon: Radio,
      accent: 'text-[var(--accent-cyan)]',
      desc: 'A higher-order Markov transition matrix predicts the next likely block from recent context. If confidence exceeds the 70% threshold, it prefetches speculative lines.',
    },
    {
      num: '06',
      title: 'Telemetry & Metric Recording',
      icon: BarChart2,
      accent: 'text-[var(--accent-green)]',
      desc: 'The system updates real-time counters: Hit Rate, Miss Rate, Prefetch Accuracy (useful prefetches), and Prefetch Coverage.',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-4 rounded-full bg-[var(--accent-crimson)]" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            How It Works: Architectural Overview
          </h2>
        </div>
        <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
          The simulator couples machine-learning future-use distance regression with an adaptive Markovian prefetcher to optimize cache replacement decisions.
        </p>
      </div>

      {/* 6 Step Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((st) => {
          const Icon = st.icon
          return (
            <div
              key={st.num}
              className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-[var(--text-muted)]">
                    STEP {st.num}
                  </span>
                  <div className={`p-2 rounded-lg bg-[var(--bg-surface-elevated)] ${st.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1.5">
                  {st.title}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Model Distinction Callout: Random Forest vs Markov Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model 1: Random Forest Regressor */}
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit className="w-5 h-5 text-[var(--accent-crimson)]" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Model 1 &bull; RandomForestRegressor (Replacement)
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Trained offline on dynamic memory traces to approximate <strong>Belady&rsquo;s optimal MIN algorithm</strong>. Instead of guessing, it predicts the exact temporal distance until the next access for every candidate block.
          </p>
          <div className="text-[11px] font-mono p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            Features: [recency, frequency, recent_freq, avg_reuse_dist, reuse_std, lifetime, working_set_size]
          </div>
        </div>

        {/* Model 2: Adaptive Markov Prefetcher */}
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-5 h-5 text-[var(--accent-cyan)]" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Model 2 &bull; Adaptive Markov Prefetcher (Prefetching)
            </h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            Constructs transition probability matrices from sequential contexts. Adapts dynamically online with an exponential decay factor (0.90) and requires a 70% confidence threshold to prevent cache pollution.
          </p>
          <div className="text-[11px] font-mono p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            Params: Context Size = 2 &bull; Threshold &ge; 0.70 &bull; Decay = 0.90
          </div>
        </div>
      </div>

      {/* End-to-End System Pipeline */}
      <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm text-xs">
        <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">
          Full-Stack Runtime Data Flow
        </h4>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex-1 w-full">
            <span className="font-bold text-[var(--text-primary)] block">1. Next.js 16 UI</span>
            <span className="text-[11px] text-[var(--text-muted)]">User input &bull; SVG/CSS 3D animation</span>
          </div>

          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 hidden sm:block" />

          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex-1 w-full">
            <span className="font-bold text-[var(--accent-crimson)] block">2. FastAPI Backend</span>
            <span className="text-[11px] text-[var(--text-muted)]">Port 8000 &bull; /simulate &amp; /health</span>
          </div>

          <ArrowRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 hidden sm:block" />

          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex-1 w-full">
            <span className="font-bold text-[var(--accent-cyan)] block">3. Scikit-Learn Engine</span>
            <span className="text-[11px] text-[var(--text-muted)]">Random Forest &bull; Markov Predictor</span>
          </div>
        </div>
      </div>
    </div>
  )
}
