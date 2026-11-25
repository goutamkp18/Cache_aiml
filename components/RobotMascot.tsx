'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'

export default function RobotMascot() {
  const [isHovered, setIsHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center p-2 select-none"
      style={{ width: '260px', height: '185px' }}
      aria-label="Adaptive Cache AI mascot"
    >
      {/* Subtle Ambient Sage Ring */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 260 185"
        fill="none"
        aria-hidden="true"
      >
        <ellipse
          cx="130"
          cy="94"
          rx="96"
          ry="56"
          transform="rotate(-8 130 94)"
          stroke="currentColor"
          className="text-[var(--brand-sage)] opacity-25"
          strokeWidth="1.25"
          strokeDasharray="4 6"
        />
      </svg>

      {/* GPU-Composited Gentle Orbital Dot (Zero React re-renders) */}
      {!shouldReduceMotion && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: isHovered ? 5 : 9,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-44 h-44 pointer-events-none"
          aria-hidden="true"
        >
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[var(--accent-vermilion)] ring-4 ring-[var(--accent-vermilion)]/20" />
          <span className="absolute bottom-2 right-6 w-2 h-2 rounded-full bg-[var(--brand-sage)] opacity-75" />
        </motion.div>
      )}

      {/* Floating Mascot */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: [0, -5, 0],
              }
        }
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 drop-shadow-sm transition-transform duration-300">
          <Image
            src="/robot-mascot.png"
            alt="Adaptive Cache AI Mascot"
            fill
            sizes="128px"
            priority
            className="object-contain"
          />
        </div>
      </motion.div>

      {/* Academic Quote Tag */}
      <div className="hidden sm:flex flex-col items-start absolute right-0 bottom-0 bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] shadow-xs px-2.5 py-1.5 rounded-lg text-left pointer-events-none max-w-[165px] z-20">
        <p className="text-[10px] font-medium leading-tight text-[var(--text-secondary)]">
          &ldquo;Predictive Caching for Smarter Memory.&rdquo;
        </p>
        <span className="w-5 h-[2px] bg-[var(--accent-vermilion)] rounded mt-1" />
      </div>
    </div>
  )
}
