'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  TrendingUp,
  BarChart2,
  Database,
  Radio,
  CheckCircle2
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
  CartesianGrid,
  Cell
} from 'recharts'
import type { LiveTelemetryPoint, SimulationLifecycleState } from '@/simulation/simulationTypes'
import { useTheme } from './ThemeProvider'

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
}: LiveTelemetryChartsProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (lifecycleState === 'IDLE' || lifecycleState === 'CONFIGURING') {
    return null
  }

  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(241, 238, 227, 0.10)' : 'rgba(75, 90, 80, 0.14)'
  const axisColor = isDark ? '#98A59C' : '#5B6B61'
  const sageColor = isDark ? '#7AA889' : '#4B5A50'
  const vermilionColor = '#F20B0B'

  const hitMissData = [
    { name: 'Hits', count: hits, fill: sageColor },
    { name: 'Misses', count: misses, fill: vermilionColor },
  ]

  const lineData = telemetryPoints.map((pt) => ({
    step: pt.accessIndex + 1,
    hitRate: pt.hitRate,
    block: pt.request,
    result: pt.result,
  }))

  const occupancyPercent = capacity > 0 ? Math.min(100, Math.round((occupancy / capacity) * 100)) : 0
  const progressPercent =
    totalAccesses > 0 ? Math.min(100, Math.round(((currentAccessIndex + 1) / totalAccesses) * 100)) : 0

  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Live Stream Analytics &bull; Real-Time Telemetry
          </h3>
          {lifecycleState === 'RUNNING' && (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-amber-subtle)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] animate-ping-subtle" />
              <span>Streaming Event #{currentAccessIndex + 1}</span>
            </span>
          )}
          {lifecycleState === 'COMPLETED' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Run Completed</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[var(--text-muted)] text-[11px]">Progress:</span>
          <div className="w-24 h-2 rounded-full bg-[var(--bg-surface-secondary)] overflow-hidden border border-[var(--border-subtle)]">
            <motion.div
              className="h-full bg-[var(--brand-sage)] rounded-full"
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Cumulative Hit Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" />
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--accent-sage-text)]">
              {hitRate.toFixed(1)}%
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            {hits} hits / {hits + misses} accesses
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Hit / Miss Ratio</span>
            <BarChart2 className="w-3.5 h-3.5 text-[var(--accent-vermilion-text)]" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-bold font-mono text-[var(--accent-sage-text)]">
              {hits}H
            </span>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-lg font-bold font-mono text-[var(--accent-vermilion-text)]">
              {misses}M
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            Delta: {hits - misses >= 0 ? `+${hits - misses}` : hits - misses}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Cache Occupancy</span>
            <Database className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--text-primary)]">
              {occupancy} / {capacity}
            </span>
            <span className="text-xs font-mono text-[var(--text-secondary)]">
              ({occupancyPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--bg-inset)] mt-1.5 overflow-hidden">
            <div
              className="h-full bg-[var(--brand-sage)] rounded-full transition-all duration-300"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Prefetch Activity</span>
            <Radio className="w-3.5 h-3.5 text-[var(--accent-amber-text)]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold font-mono text-[var(--accent-amber-text)]">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Live Hit-Rate Convergence Timeline
            </span>
            <span className="text-[10px] font-mono text-[var(--accent-sage-text)] font-semibold">
              Current: {hitRate.toFixed(1)}%
            </span>
          </div>

          {mounted && lineData.length > 0 ? (
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="step" tick={{ fill: axisColor, fontSize: 10 }} />
                  <YAxis unit="%" domain={[0, 100]} tick={{ fill: axisColor, fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload
                        return (
                          <div className="bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] rounded-lg p-2 text-xs shadow-md font-mono">
                            <span className="font-bold text-[var(--text-primary)]">
                              Step {pt.step}: Block {pt.block} ({pt.result})
                            </span>
                            <br />
                            <span className="text-[var(--accent-sage-text)]">
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
                    stroke={sageColor}
                    strokeWidth={2.2}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={350}
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

        <div className="lg:col-span-4 p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Hits vs Misses Distribution
            </span>
          </div>

          {mounted ? (
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hitMissData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 10 }} />
                  <YAxis tick={{ fill: axisColor, fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] rounded-lg p-2 text-xs font-mono shadow-md">
                            <span className="font-bold text-[var(--text-primary)]">
                              {payload[0].payload.name}: {payload[0].value}
                            </span>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={350}>
                    {hitMissData.map((entry, idx) => (
                      <Cell key={`hm-cell-${idx}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
