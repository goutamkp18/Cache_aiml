'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Cpu, Database, Radio, Layers, Info } from 'lucide-react'
import type { BenchmarkItem, SimulationMetrics } from '@/simulation/simulationTypes'

interface ResultsViewProps {
  benchmark: BenchmarkItem[]
  workload: string
  policy: string
  cacheSize: number
  metrics?: SimulationMetrics
}

export default function ResultsView({
  benchmark,
  workload,
  policy,
  cacheSize,
  metrics,
}: ResultsViewProps) {
  // Find highest hit-rate policy in the benchmark
  const highestPolicy = [...benchmark].sort((a, b) => b.value - a.value)[0]
  const maxValue = Math.max(...benchmark.map((b) => b.value), 1)

  return (
    <div className="space-y-6">
      {/* Top Configuration Summary Card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 shadow-sm transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[var(--accent-crimson)]" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Empirical Benchmark &amp; Comparative Analysis
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Automated multi-policy benchmark computed on workload: &ldquo;{workload}&rdquo; (Capacity: {cacheSize} slots).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
              Workload: <strong className="text-[var(--text-primary)]">{workload}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
              Active: <strong className="text-[var(--accent-crimson)]">{policy}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
              Capacity: <strong className="text-[var(--text-primary)]">{cacheSize}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Benchmark Hit-Rate Comparison Chart */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 sm:p-6 shadow-sm transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--accent-crimson)]" />
            <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              Policy Hit-Rate Comparison (60-access Benchmark)
            </h3>
          </div>

          {highestPolicy && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--accent-green-subtle)] border border-[var(--accent-green-border)] text-[var(--accent-green)]">
              Top Performer: {highestPolicy.name} ({highestPolicy.value.toFixed(1)}%)
            </span>
          )}
        </div>

        {/* Bar Chart Grid */}
        <div className="space-y-4">
          {benchmark.map((item) => {
            const isHighest = highestPolicy && item.name === highestPolicy.name
            const isSelectedPolicy = item.name === policy
            const barWidthPercent = Math.min(100, Math.max(4, (item.value / (maxValue || 100)) * 100))

            return (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {item.name}
                    </span>
                    {isSelectedPolicy && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[var(--accent-crimson-subtle)] text-[var(--accent-crimson)] border border-[var(--accent-crimson-border)]">
                        Current
                      </span>
                    )}
                    {item.name.includes('ML') && !isSelectedPolicy && (
                      <span className="text-[9px] uppercase font-medium px-1.5 py-0.2 rounded bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)]">
                        AI
                      </span>
                    )}
                  </div>

                  <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                    {item.value.toFixed(2)}%
                  </span>
                </div>

                {/* Progress Track */}
                <div className="h-6 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] overflow-hidden p-0.5">
                  <motion.div
                    className={`h-full rounded-md transition-all ${
                      isHighest
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white'
                        : isSelectedPolicy
                        ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white'
                        : 'bg-[var(--text-muted)] opacity-50'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidthPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>
            Hit rates reflect actual multi-policy evaluations computed by the Python simulation engine on the active workload.
          </span>
        </div>
      </div>

      {/* Workload Performance Characteristics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[var(--accent-crimson)] tracking-wider block mb-1">
            Workload &bull; Dynamic
          </span>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Phased Memory Transitions</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Transitions between loops, stride walks, and scattered access. Adaptive ML and Markov prefetching excel here by tracking phase shifts.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-1">
            Workload &bull; Looping
          </span>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Cyclic Loop Structures</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Accesses loop across sequences longer than cache capacity. Classical LRU suffers from 0% thrashing when loop size &gt; capacity.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-1">
            Workload &bull; Sequential
          </span>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Streaming Access Walk</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Single-pass scans where blocks are never reused. Markov prefetcher captures stride patterns while replacement isolates dead blocks.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-1">
            Workload &bull; Random
          </span>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">Uniform I.I.D. Access</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Zero temporal or spatial correlation. Hit rates converge directly to <code>(Capacity / WorkingSet)</code> across all algorithms.
          </p>
        </div>
      </div>
    </div>
  )
}
