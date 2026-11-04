'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  TrendingUp,
  BarChart2,
  Database,
  Radio,
  CheckCircle2,
  XCircle,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import type { LiveTelemetryPoint, SimulationLifecycleState } from '@/simulation/simulationTypes'

interface LiveTelemetryChartsProps {
  lifecycleState: SimulationLifecycleState
  telemetryPoints: LiveTelemetryPoint[]
  currentAccessIndex: number
  totalAccesses: number
  capacity: number
  occupancy: number
  hits: number
  misses: number
  usefulPrefetches: number
  uselessPrefetches: number
  hitRate: number
  activeBlock?: string
  activeResult?: 'HIT' | 'MISS'
}

export default function LiveTelemetryCharts({
  lifecycleState,
  telemetryPoints,
  currentAccessIndex,
  totalAccesses,
  capacity,
  occupancy,
  hits,
  misses,
  usefulPrefetches,
  uselessPrefetches,
  hitRate,
  activeBlock,
  activeResult,
}: LiveTelemetryChartsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (lifecycleState === 'IDLE' || lifecycleState === 'CONFIGURING') {
    return null
  }

  // Bar data for Hits vs Misses
  const hitMissData = [
    { name: 'Hits', count: hits, fill: '#22C55E' },
    { name: 'Misses', count: misses, fill: '#FF454F' },
  ]

  // Chart data for Live Cumulative Hit Rate
  const lineData = telemetryPoints.map((pt) => ({
    step: pt.accessIndex + 1,
    hitRate: pt.hitRate,
    block: pt.request,
    result: pt.result,
  }))

  const occupancyPercent = capacity > 0 ? Math.min(100, Math.round((occupancy / capacity) * 100)) : 0
  const progressPercent = totalAccesses > 0 ? Math.min(100, Math.round(((currentAccessIndex + 1) / totalAccesses) * 100)) : 0

  return (
    <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
      {/* Live Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-crimson)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Live Stream Analytics &bull; Real-Time Telemetry
          </h3>
          {lifecycleState === 'RUNNING' && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping-subtle" />
              <span>Streaming Event #{currentAccessIndex + 1}</span>
            </span>
          )}
          {lifecycleState === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-green-subtle)] text-[var(--accent-green)] border border-[var(--accent-green-border)]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Run Completed</span>
            </span>
          )}
        </div>

        {/* Global Progress Gauge */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[var(--text-muted)] text-[11px]">Progress:</span>
          <div className="w-24 h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden border border-[var(--border-subtle)]">
            <motion.div
              className="h-full bg-[var(--accent-crimson)] rounded-full"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </div>
          <span className="font-bold text-[var(--text-primary)]">
            {currentAccessIndex + 1} / {totalAccesses}
          </span>
        </div>
      </div>

      {/* 4 Live Telemetry Gauges / Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* A. Live Cumulative Hit Rate */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Cumulative Hit Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-green)]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--accent-green)]">
              {hitRate.toFixed(1)}%
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            {hits} hits / {hits + misses} accesses
          </span>
        </div>

        {/* B. Live Hits vs Misses */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Hit / Miss Ratio</span>
            <BarChart2 className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold font-mono text-[var(--accent-green)]">
              {hits}H
            </span>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-lg font-bold font-mono text-[var(--accent-crimson)]">
              {misses}M
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            Delta: {hits - misses >= 0 ? `+${hits - misses}` : hits - misses}
          </span>
        </div>

        {/* C. Live Cache Occupancy */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Cache Occupancy</span>
            <Database className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--text-primary)]">
              {occupancy} / {capacity}
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              ({occupancyPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface)] mt-1.5 overflow-hidden">
            <div
              className="h-full bg-[var(--accent-cyan)] rounded-full transition-all duration-300"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* D. Live Prefetch Activity */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Prefetch Activity</span>
            <Radio className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--accent-cyan)]">
              {usefulPrefetches}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              useful / {usefulPrefetches + uselessPrefetches} total
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            {uselessPrefetches > 0 ? `${uselessPrefetches} useless lines` : 'Zero line pollution'}
          </span>
        </div>
      </div>

      {/* Live Charts Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Live Cumulative Hit Rate Line Chart (8 cols) */}
        <div className="lg:col-span-8 p-3 rounded-lg bg-[var(--bg-surface-elevated)]/50 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Live Hit-Rate Convergence Timeline
            </span>
            <span className="text-[10px] font-mono text-[var(--accent-green)] font-semibold">
              Current: {hitRate.toFixed(1)}%
            </span>
          </div>

          {mounted && lineData.length > 0 ? (
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="step" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis unit="%" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload
                        return (
                          <div className="bg-[#0C111B] border border-[#1E293B] rounded p-2 text-xs">
                            <span className="font-bold text-[#F8FAFC]">
                              Step {pt.step}: Block {pt.block} ({pt.result})
                            </span>
                            <br />
                            <span className="text-[#22C55E] font-mono">
                              Hit Rate: {pt.hitRate}%
                            </span>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hitRate"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={350}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-xs text-[var(--text-muted)]">
              Streaming access data points...
            </div>
          )}
        </div>

        {/* Live Hits vs Misses Bar Chart (4 cols) */}
        <div className="lg:col-span-4 p-3 rounded-lg bg-[var(--bg-surface-elevated)]/50 border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Hits vs Misses Distribution
            </span>
          </div>

          {mounted ? (
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hitMissData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#0C111B] border border-[#1E293B] rounded p-2 text-xs">
                            <span className="font-bold text-[#F8FAFC]">
                              {payload[0].payload.name}: {payload[0].value}
                            </span>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={350}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

