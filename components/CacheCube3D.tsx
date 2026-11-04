'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CacheCube3DProps {
  block: string | null
  slotIndex?: number
  isRequest?: boolean
  result?: 'HIT' | 'MISS'
  isVictim?: boolean
  isPrefetched?: boolean
  isEmpty?: boolean
  size?: 'normal' | 'large'
}

export default function CacheCube3D({
  block,
  slotIndex,
  isRequest = false,
  result,
  isVictim = false,
  isPrefetched = false,
  isEmpty = false,
  size = 'normal',
}: CacheCube3DProps) {
  const isHit = result === 'HIT'
  const isMiss = result === 'MISS'

  // Dimensions
  const cubeWidth = size === 'large' ? 'w-20 sm:w-24' : 'w-16 sm:w-20'
  const cubeHeight = size === 'large' ? 'h-20 sm:h-24' : 'h-16 sm:h-20'

  if (isEmpty || !block) {
    return (
      <div className="flex flex-col items-center">
        <div
          className={`${cubeWidth} ${cubeHeight} rounded-xl border border-dashed border-[#1e2e46] bg-[#0c1320]/60 flex items-center justify-center text-[#475569] font-mono text-sm shadow-inner transition-all`}
          style={{
            transform: 'perspective(600px) rotateX(12deg)',
          }}
        >
          <span className="text-xs uppercase tracking-wider font-semibold opacity-50">Empty</span>
        </div>
        {slotIndex !== undefined && (
          <span className="text-[11px] font-mono text-[#64748b] mt-2 font-medium">
            Slot {slotIndex}
          </span>
        )}
      </div>
    )
  }

  // Theme styling based on state
  // 1. Request cube: Crimson if MISS, Green if HIT
  // 2. Resident cube: Deep cyan/navy if normal, Crimson if victim, Cyan if prefetch
  let frontBg = 'bg-gradient-to-br from-[#1c2c46] via-[#132034] to-[#0d1624]'
  let topBg = 'bg-[#293d5d]'
  let rightBg = 'bg-[#0a121e]'
  let borderColor = 'border-[#2a4369]'
  let textColor = 'text-white'
  let glowColor = 'rgba(18, 203, 234, 0.25)'

  if (isRequest) {
    if (isHit) {
      frontBg = 'bg-gradient-to-br from-[#15803d] via-[#166534] to-[#14532d]'
      topBg = 'bg-[#22c55e]'
      rightBg = 'bg-[#14532d]'
      borderColor = 'border-[#4ade80]'
      textColor = 'text-white'
      glowColor = 'rgba(34, 197, 94, 0.45)'
    } else {
      // Miss (Crimson Red)
      frontBg = 'bg-gradient-to-br from-[#b91c1c] via-[#991b1b] to-[#7f1d1d]'
      topBg = 'bg-[#ef4444]'
      rightBg = 'bg-[#7f1d1d]'
      borderColor = 'border-[#f87171]'
      textColor = 'text-white'
      glowColor = 'rgba(255, 69, 79, 0.55)'
    }
  } else if (isVictim) {
    // Eviction candidate
    frontBg = 'bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a]'
    topBg = 'bg-[#ef4444]'
    rightBg = 'bg-[#450a0a]'
    borderColor = 'border-[#ef4444]'
    textColor = 'text-[#fca5a5]'
    glowColor = 'rgba(239, 68, 68, 0.5)'
  } else if (isPrefetched) {
    // Prefetched block
    frontBg = 'bg-gradient-to-br from-[#0e7490] via-[#155e75] to-[#164e63]'
    topBg = 'bg-[#22d3ee]'
    rightBg = 'bg-[#164e63]'
    borderColor = 'border-[#38bdf8]'
    textColor = 'text-white'
    glowColor = 'rgba(18, 203, 234, 0.45)'
  } else {
    // Normal resident cache block (Deep polished blue-cyan 3D cube)
    frontBg = 'bg-gradient-to-br from-[#172e4c] via-[#10223b] to-[#0a1626]'
    topBg = 'bg-[#244b7a]'
    rightBg = 'bg-[#081220]'
    borderColor = 'border-[#1e4976]'
    textColor = 'text-[#f8fafc]'
    glowColor = 'rgba(18, 203, 234, 0.3)'
  }

  return (
    <div className="flex flex-col items-center select-none">
      <motion.div
        key={`cube-${block}-${slotIndex}-${isVictim ? 'v' : 'nv'}-${result}`}
        initial={{ scale: 0.85, opacity: 0, y: -6 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 6 }}
        transition={{ type: 'spring', damping: 16, stiffness: 220 }}
        className="relative group cursor-pointer"
        style={{
          perspective: '800px',
        }}
      >
        {/* Under-Cube Floor Shadow / Glow */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-3 rounded-full blur-md transition-all duration-300"
          style={{
            backgroundColor: glowColor,
            boxShadow: `0 0 16px ${glowColor}`,
          }}
        />

        {/* 3D Isometric Cube Container */}
        <div
          className={`relative ${cubeWidth} ${cubeHeight} transition-transform duration-300 group-hover:scale-105`}
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(14deg) rotateY(-8deg)',
          }}
        >
          {/* Top Face (Angled Bevel Highlight) */}
          <div
            className={`absolute -top-3 left-0 right-0 h-3 rounded-t-lg ${topBg} opacity-80 border-t border-x ${borderColor}`}
            style={{
              transform: 'skewX(-38deg) scaleY(0.75)',
              transformOrigin: 'bottom',
            }}
          />

          {/* Right Face (Side Depth) */}
          <div
            className={`absolute top-0 -right-3 bottom-0 w-3 rounded-r-lg ${rightBg} opacity-90 border-r border-y ${borderColor}`}
            style={{
              transform: 'skewY(-52deg) scaleX(0.75)',
              transformOrigin: 'left',
            }}
          />

          {/* Front Face (Primary Display with Letter) */}
          <div
            className={`relative w-full h-full rounded-xl ${frontBg} border ${borderColor} flex flex-col items-center justify-center shadow-lg overflow-hidden`}
            style={{
              boxShadow: `0 8px 20px -2px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.25)`,
            }}
          >
            {/* Gloss reflection shine */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-xl" />

            {/* Block Letter */}
            <span
              className={`font-black font-mono tracking-wider ${
                size === 'large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
              } ${textColor} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
            >
              {block}
            </span>

            {/* Prefetch small cyan indicator pill */}
            {isPrefetched && (
              <span className="absolute bottom-1 px-1.5 py-0.2 rounded-full text-[8px] font-bold uppercase bg-[#12CBEA]/20 text-[#12CBEA] border border-[#12CBEA]/40">
                PREF
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Underneath Slot Label */}
      {slotIndex !== undefined && (
        <span className="text-[11px] font-mono text-[#94a3b8] mt-2 font-medium">
          Slot {slotIndex}
        </span>
      )}
    </div>
  )
}

