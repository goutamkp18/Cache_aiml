'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Layers,
  CheckCircle2,
  XCircle,
  Zap,
  Maximize2
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
import type { LiveTelemetryPoint, SimulationMetrics, SimulationLifecycleState } from '@/simulation/simulationTypes'

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

export default function BottomAnalyticsSection({
  lifecycleState,
  metrics,
  telemetryPoints,
  currentAccessIndex,
  totalAccesses,
  hits,
  misses,
  usefulPrefetches,
  uselessPrefetches,
  totalPrefetches,
  evictionsCount,
}: BottomAnalyticsSectionProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate hit rate & miss rate
  const totalCalls = hits + misses
  const hitRateNum = totalCalls > 0 ? (hits / totalCalls) * 100 : 0
  const missRateNum = totalCalls > 0 ? (misses / totalCalls) * 100 : 0
  const hitRateStr = metrics?.hitRate || `${hitRateNum.toFixed(2)}%`
  const missRateStr = metrics?.missRate || `${missRateNum.toFixed(2)}%`
  const accuracyStr = metrics?.prefetchAccuracy || (totalPrefetches > 0 ? `${((usefulPrefetches / totalPrefetches) * 100).toFixed(2)}%` : '0.00%')
  const coverageStr = metrics?.prefetchCoverage || (misses + usefulPrefetches > 0 ? `${((usefulPrefetches / (misses + usefulPrefetches)) * 100).toFixed(2)}%` : '0.00%')

  // Prepare chart data from real telemetry points up to current access
  const chartData = telemetryPoints
    .filter((pt) => pt.accessIndex <= currentAccessIndex)
    .map((pt) => ({
      access: pt.accessIndex + 1,
      hitRate: Number(pt.hitRate.toFixed(2)),
    }))

  const isIdle = lifecycleState === 'IDLE' || lifecycleState === 'CONFIGURING'

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
      {/* PANEL 1: Performance Metrics (5 cols on lg) */}
      <div className="lg:col-span-5 bg-[#111827] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1e293b]/80">
          <BarChart3 className="w-4 h-4 text-[#FF454F]" />
          <h3 className="text-xs font-bold text-white tracking-wide">
            Performance Metrics
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5 my-3">
          {/* 1. Hit Rate */}
          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Hit Rate</span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[#22c55e]">
                {isIdle ? '--%' : hitRateStr}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#64748b]">
              {isIdle ? '0 / 0 accesses' : `${hits} / ${totalCalls} accesses`}
            </span>
          </div>

          {/* 2. Miss Rate */}
          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
              <XCircle className="w-3.5 h-3.5 text-[#FF454F]" />
              <span>Miss Rate</span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[#FF454F]">
                {isIdle ? '--%' : missRateStr}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#64748b]">
              {isIdle ? '0 misses' : `${misses} misses`}
            </span>
          </div>

          {/* 3. Prefetch Accuracy */}
          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
              <Zap className="w-3.5 h-3.5 text-[#12CBEA]" />
              <span>Prefetch Accuracy</span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[#12CBEA]">
                {isIdle ? '--%' : accuracyStr}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#64748b]">
              {isIdle ? '0 useful / 0 issued' : `${usefulPrefetches} useful / ${totalPrefetches} issued`}
            </span>
          </div>

          {/* 4. Prefetch Coverage */}
          <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
              <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Prefetch Coverage</span>
            </div>
            <div className="my-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-[#38bdf8]">
                {isIdle ? '--%' : coverageStr}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#64748b]">
              Share of potential misses
            </span>
          </div>
        </div>
      </div>

      {/* PANEL 2: Cumulative Hit Rate (4 cols on lg) */}
      <div className="lg:col-span-4 bg-[#111827] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]/80">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#12CBEA]" />
            <h3 className="text-xs font-bold text-white tracking-wide">
              Cumulative Hit Rate
            </h3>
          </div>
          <Maximize2 className="w-3.5 h-3.5 text-[#64748b] hover:text-white transition-colors cursor-pointer" />
        </div>

        {/* Chart View with pinned current value */}
        <div className="relative h-44 w-full mt-2">
          {/* Pinned pill displaying current hit rate */}
          {!isIdle && (
            <div className="absolute top-2 right-2 z-10">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#12CBEA] text-[#080B12] shadow-[0_0_10px_rgba(18,203,234,0.5)]">
                {hitRateStr}
              </span>
            </div>
          )}

          {mounted && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 12, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="access"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-[#0c121e] border border-[#1e293b] p-2 rounded-lg text-xs shadow-xl font-mono">
                          <p className="text-[#94a3b8]">Access: {data.access}</p>
                          <p className="text-[#12CBEA] font-bold">Hit Rate: {data.hitRate}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hitRate"
                  stroke="#12CBEA"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#12CBEA', stroke: '#080B12', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#FF454F', stroke: '#ffffff', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={400}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b]">
                {isIdle ? 'NO EXPERIMENT RUN' : 'Awaiting data points...'}
              </span>
              <p className="text-[11px] text-[#475569] mt-1">
                Chart generates live during access stream.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PANEL 3: Telemetry Counters (3 cols on lg) */}
      <div className="lg:col-span-3 bg-[#111827] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1e293b]/80">
          <Layers className="w-4 h-4 text-[#12CBEA]" />
          <h3 className="text-xs font-bold text-white tracking-wide">
            Telemetry Counters
          </h3>
        </div>

        {/* 2x3 Grid matching reference image */}
        <div className="grid grid-cols-3 gap-2 my-2">
          {/* Hits */}
          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[#94a3b8] block mb-1">
              Hits
            </span>
            <span className="text-xl font-black font-mono text-[#22c55e]">
              {isIdle ? '-' : hits}
            </span>
          </div>

          {/* Misses */}
          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[#94a3b8] block mb-1">
              Misses
            </span>
            <span className="text-xl font-black font-mono text-[#FF454F]">
              {isIdle ? '-' : misses}
            </span>
          </div>

          {/* Evictions */}
          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[#94a3b8] block mb-1">
              Evictions
            </span>
            <span className="text-xl font-black font-mono text-[#f59e0b]">
              {isIdle ? '-' : evictionsCount}
            </span>
          </div>

          {/* Prefetches */}
          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[#94a3b8] block mb-1">
              Prefetches
            </span>
            <span className="text-xl font-black font-mono text-[#12CBEA]">
              {isIdle ? '-' : totalPrefetches}
            </span>
          </div>

          {/* Useful */}
          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[#94a3b8] block mb-1">
              Useful
            </span>
            <span className="text-xl font-black font-mono text-[#22c55e]">
              {isIdle ? '-' : usefulPrefetches}
            </span>
          </div>

          {/* Useless */}
          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col items-center text-center">
            <span className="text-[9px] uppercase font-bold text-[#94a3b8] block mb-1">
              Useless
            </span>
            <span className="text-xl font-black font-mono text-[#64748b]">
              {isIdle ? '-' : uselessPrefetches}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

