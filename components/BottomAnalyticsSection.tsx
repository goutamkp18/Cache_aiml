'use client'

import React, { useState, useEffect, memo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Layers,
  CheckCircle2,
  XCircle,
  Zap,
  Maximize2,
  Minimize2
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import type {
  LiveTelemetryPoint,
  SimulationMetrics,
  SimulationLifecycleState
} from '@/simulation/simulationTypes'
import { useTheme } from './ThemeProvider'

interface BottomAnalyticsSectionProps {
  lifecycleState: SimulationLifecycleState
  metrics?: SimulationMetrics
  telemetryPoints: LiveTelemetryPoint[]
  currentAccessIndex: number
  totalAccesses: number
  hits: number
  misses: number
  usefulPrefetches: number
  uselessPrefetches: number
  totalPrefetches: number
  evictionsCount: number
}

function BottomAnalyticsSection({
  lifecycleState,
  metrics,
  telemetryPoints,
  currentAccessIndex,
  hits,
  misses,
  usefulPrefetches,
  uselessPrefetches,
  totalPrefetches,
  evictionsCount,
}: BottomAnalyticsSectionProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [chartExpanded, setChartExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(241, 238, 227, 0.10)' : 'rgba(75, 90, 80, 0.14)'
  const axisColor = isDark ? '#98A59C' : '#5B6B61'
  const lineColor = isDark ? '#7AA889' : '#4B5A50'
  const dotFill = isDark ? '#29352D' : '#FFFDF8'

  const totalCalls = hits + misses
  const hitRateNum = totalCalls > 0 ? (hits / totalCalls) * 100 : 0
  const missRateNum = totalCalls > 0 ? (misses / totalCalls) * 100 : 0
  const hitRateStr = metrics?.hitRate || `${hitRateNum.toFixed(2)}%`
  const missRateStr = metrics?.missRate || `${missRateNum.toFixed(2)}%`
  const accuracyStr =
    metrics?.prefetchAccuracy ||
    (totalPrefetches > 0 ? `${((usefulPrefetches / totalPrefetches) * 100).toFixed(2)}%` : '0.00%')
  const coverageStr =
    metrics?.prefetchCoverage ||
    (misses + usefulPrefetches > 0
      ? `${((usefulPrefetches / (misses + usefulPrefetches)) * 100).toFixed(2)}%`
      : '0.00%')

  const chartData = telemetryPoints
    .filter((pt) => pt.accessIndex <= currentAccessIndex)
    .map((pt) => ({
      access: pt.accessIndex + 1,
      hitRate: Number(pt.hitRate.toFixed(2)),
    }))

  const isIdle = lifecycleState === 'IDLE' || lifecycleState === 'CONFIGURING'

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
      {/* PANEL 1: Performance Metrics */}
      <div className="lg:col-span-5 glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
          <BarChart3 className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
            Performance Metrics
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5 my-3">
          <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" />
              <span>Hit Rate</span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[var(--accent-sage-text)]">
                {isIdle ? '--%' : hitRateStr}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {isIdle ? '0 / 0 accesses' : `${hits} / ${totalCalls} accesses`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
              <XCircle className="w-3.5 h-3.5 text-[var(--accent-vermilion-text)]" />
              <span>Miss Rate</span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[var(--accent-vermilion-text)]">
                {isIdle ? '--%' : missRateStr}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {isIdle ? '0 misses' : `${misses} misses`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
              <Zap className="w-3.5 h-3.5 text-[var(--accent-amber-text)]" />
              <span>Prefetch Accuracy</span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[var(--accent-amber-text)]">
                {isIdle ? '--%' : accuracyStr}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {isIdle ? '0 useful / 0 issued' : `${usefulPrefetches} useful / ${totalPrefetches} issued`}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
              <Layers className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>Prefetch Coverage</span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[var(--text-primary)]">
                {isIdle ? '--%' : coverageStr}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              Share of potential misses
            </span>
          </div>
        </div>
      </div>

      {/* PANEL 2: Cumulative Hit Rate */}
      <div className="lg:col-span-4 glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent-sage-text)]" />
            <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
              Cumulative Hit Rate
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setChartExpanded((prev) => !prev)}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] transition-colors cursor-pointer"
            title={chartExpanded ? 'Compact chart height' : 'Expand chart height'}
            aria-label="Toggle chart height"
          >
            {chartExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className={`relative ${chartExpanded ? 'h-64' : 'h-44'} w-full mt-2 transition-all`}>
          {!isIdle && (
            <div className="absolute top-1.5 right-2 z-10">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[var(--brand-sage)] text-[#F1EEE3]">
                {hitRateStr}
              </span>
            </div>
          )}

          {mounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 14, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="access"
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] p-2 rounded-lg text-xs shadow-md font-mono">
                          <p className="text-[var(--text-muted)]">Access #{data.access}</p>
                          <p className="text-[var(--accent-sage-text)] font-bold">
                            Hit Rate: {data.hitRate}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hitRate"
                  stroke={lineColor}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: dotFill, stroke: lineColor, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: '#F20B0B', stroke: '#F1EEE3', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={350}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                {isIdle ? 'NO EXPERIMENT RUN' : 'Awaiting data points...'}
              </span>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                Chart updates live as accesses progress.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PANEL 3: Telemetry Counters */}
      <div className="lg:col-span-3 glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
          <Layers className="w-4 h-4 text-[var(--brand-sage)] dark:text-[var(--accent-sage-text)]" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
            Telemetry Counters
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2 my-2">
          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">
              Hits
            </span>
            <span className="text-xl font-black font-mono text-[var(--accent-sage-text)]">
              {isIdle ? '-' : hits}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">
              Misses
            </span>
            <span className="text-xl font-black font-mono text-[var(--accent-vermilion-text)]">
              {isIdle ? '-' : misses}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">
              Evictions
            </span>
            <span className="text-xl font-black font-mono text-[var(--accent-vermilion-text)]">
              {isIdle ? '-' : evictionsCount}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">
              Prefetches
            </span>
            <span className="text-xl font-black font-mono text-[var(--accent-amber-text)]">
              {isIdle ? '-' : totalPrefetches}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">
              Useful
            </span>
            <span className="text-xl font-black font-mono text-[var(--accent-sage-text)]">
              {isIdle ? '-' : usefulPrefetches}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">
              Useless
            </span>
            <span className="text-xl font-black font-mono text-[var(--text-muted)]">
              {isIdle ? '-' : uselessPrefetches}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(BottomAnalyticsSection)
