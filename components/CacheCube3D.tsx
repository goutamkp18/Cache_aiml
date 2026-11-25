'use client'

import React, { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface CacheCube3DProps {
  block: string | null
  slotIndex?: number
  isRequest?: boolean
  result?: 'HIT' | 'MISS'
  isVictim?: boolean
  isPrefetched?: boolean
  isEmpty?: boolean
  isActiveResident?: boolean
  size?: 'normal' | 'large' | 'compact'
}

function CacheCube3D({
  block,
  slotIndex,
  isRequest = false,
  result,
  isVictim = false,
  isPrefetched = false,
  isEmpty = false,
  isActiveResident = false,
  size = 'normal',
}: CacheCube3DProps) {
  const shouldReduceMotion = useReducedMotion()
  const isHit = result === 'HIT'

  const cubeSizeClass =
    size === 'large'
      ? 'w-20 h-20 sm:w-22 sm:h-22'
      : size === 'compact'
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : 'w-16 h-16 sm:w-18 sm:h-18'

  if (isEmpty || !block) {
    return (
      <div className="flex flex-col items-center">
        <div
          className={`${cubeSizeClass} rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-inset)] flex items-center justify-center text-[var(--text-muted)] font-mono transition-colors`}
          style={{
            transform: 'perspective(600px) rotateX(10deg)',
          }}
        >
          <span className="text-[10px] uppercase tracking-wider font-semibold">Empty</span>
        </div>
        {slotIndex !== undefined && (
          <span className="text-[11px] font-mono text-[var(--text-muted)] mt-2 font-medium tabular-nums">
            Slot {slotIndex}
          </span>
        )}
      </div>
    )
  }

  let frontStyle = 'bg-[#4B5A50] border-[#667B6D] text-[#F1EEE3]'
  let topBg = 'bg-[#637669]'
  let rightBg = 'bg-[#36423A]'
  let ringClass = ''
  let badgeLabel: string | null = null
  let badgeClass = ''

  if (isRequest) {
    if (isHit) {
      frontStyle = 'bg-[#3D6B4F] border-[#6EA380] text-[#F1EEE3]'
      topBg = 'bg-[#568A6A]'
      rightBg = 'bg-[#2C4F3A]'
      badgeLabel = 'HIT'
      badgeClass = 'bg-[#F1EEE3] text-[#1E2822] border border-[#2D533C]'
    } else {
      frontStyle = 'bg-[#F20B0B] border-[#FF6B6B] text-white'
      topBg = 'bg-[#FF3D3D]'
      rightBg = 'bg-[#B30808]'
      badgeLabel = 'MISS'
      badgeClass = 'bg-white text-[#B30808] border border-[#B30808]/40'
    }
  } else if (isVictim) {
    frontStyle = 'bg-[#8F1111] border-2 border-[#F20B0B] text-[#F1EEE3]'
    topBg = 'bg-[#C71A1A]'
    rightBg = 'bg-[#660A0A]'
    ringClass = 'animate-eviction-ring ring-2 ring-[#F20B0B]/70'
    badgeLabel = 'EVICT'
    badgeClass = 'bg-[#F20B0B] text-white border border-white/40'
  } else if (isPrefetched) {
    frontStyle = 'bg-[#9E6514] border-2 border-[#E8B55D] text-[#FFFDF8]'
    topBg = 'bg-[#C48224]'
    rightBg = 'bg-[#73480B]'
    badgeLabel = 'PREF'
    badgeClass = 'bg-[#FFFDF8] text-[#73480B] border border-[#9E6514]'
  } else if (isActiveResident) {
    frontStyle = 'bg-[#3F5246] border-2 border-[#8FC4A0] text-[#F1EEE3]'
    topBg = 'bg-[#5A7263]'
    rightBg = 'bg-[#2C3A31]'
    badgeLabel = 'ACTIVE'
    badgeClass = 'bg-[#F1EEE3] text-[#1E2822] border border-[#4B5A50]'
  } else {
    frontStyle = 'bg-[#4B5A50] border-[#718678] text-[#F1EEE3]'
    topBg = 'bg-[#637669]'
    rightBg = 'bg-[#354139]'
  }

  return (
    <div className="flex flex-col items-center select-none">
      <motion.div
        key={`cube-${block}-${slotIndex}-${isVictim ? 'v' : 'nv'}-${result || 'res'}`}
        initial={shouldReduceMotion ? false : { scale: 0.9, opacity: 0, y: -4 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? undefined : { scale: 0.88, opacity: 0, y: 4 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative group"
        style={{ perspective: '800px', willChange: 'transform, opacity' }}
      >
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-2 rounded-full bg-[#1C2420]/25 blur-[2px] pointer-events-none"
          aria-hidden="true"
        />

        <div
          className={`relative ${cubeSizeClass} transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:scale-[1.03]`}
          style={{
            transformStyle: 'preserve-3d',
            transform: 'rotateX(12deg) rotateY(-8deg)',
          }}
        >
          <div
            className={`absolute -top-2.5 left-0 right-0 h-2.5 rounded-t-md ${topBg} opacity-90 border-t border-x border-black/15`}
            style={{
              transform: 'skewX(-38deg) scaleY(0.75)',
              transformOrigin: 'bottom',
            }}
          />

          <div
            className={`absolute top-0 -right-2.5 bottom-0 w-2.5 rounded-r-md ${rightBg} opacity-95 border-r border-y border-black/20`}
            style={{
              transform: 'skewY(-52deg) scaleX(0.75)',
              transformOrigin: 'left',
            }}
          />

          <div
            className={`relative w-full h-full rounded-xl border ${frontStyle} ${ringClass} flex flex-col items-center justify-center shadow-md overflow-hidden`}
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />

            <span
              className={`font-black font-mono tracking-tight ${
                size === 'large'
                  ? 'text-2xl sm:text-3xl'
                  : size === 'compact'
                  ? 'text-base sm:text-lg'
                  : 'text-xl sm:text-2xl'
              }`}
            >
              {block}
            </span>

            {badgeLabel && (
              <span
                className={`mt-0.5 px-1.5 py-[1px] rounded text-[8px] font-bold uppercase tracking-wider leading-tight ${badgeClass}`}
              >
                {badgeLabel}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {slotIndex !== undefined && (
        <span className="text-[11px] font-mono text-[var(--text-muted)] mt-2 font-medium tabular-nums">
          Slot {slotIndex}
        </span>
      )}
    </div>
  )
}

export default memo(CacheCube3D)
