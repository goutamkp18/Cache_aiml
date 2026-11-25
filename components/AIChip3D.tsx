'use client'

import React, { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

function AIChip3D() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      className="relative w-36 h-24 sm:w-44 sm:h-28 flex items-center justify-center select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* Soft Ground Elevation Shadow */}
      <div
        className="absolute bottom-1 w-24 h-4 rounded-full bg-[#1C2420]/20 blur-md"
        style={{ transform: 'scaleX(1.15)' }}
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: [-2.5, 2.5, -2.5],
                rotateX: [16, 18, 16],
                rotateY: [-10, -8, -10],
                rotateZ: [-6, -5, -6],
              }
        }
        transition={{
          duration: 5.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
          perspective: 900,
          willChange: 'transform',
        }}
      >
        {/* 3D Bottom Substrate Slab for Real Thickness */}
        <div
          className="absolute inset-0 rounded-2xl bg-[#2E3932] border border-black/25"
          style={{
            transform: 'translate3d(3px, 5px, -6px)',
          }}
        />

        {/* Primary Bevelled Sage Processor Package */}
        <div
          className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#596B5F] via-[#4B5A50] to-[#36423A] border border-[#F1EEE3]/30 flex items-center justify-center p-2.5"
          style={{
            boxShadow:
              '0 12px 24px -8px rgba(28, 36, 32, 0.38), inset 0 1px 1px rgba(241, 238, 227, 0.35)',
          }}
        >
          {/* Corner Fiducials */}
          <span className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-[#F1EEE3]/55" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent-vermilion)] ring-1 ring-[#F1EEE3]/40" />
          <span className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-[#F1EEE3]/55" />
          <span className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-[#F1EEE3]/55" />

          {/* Precision Contact Pins: Top & Bottom Ivory */}
          <div className="absolute -top-2 left-5 right-5 flex justify-between">
            {[1, 2, 3].map((i) => (
              <span key={`pin-t-${i}`} className="w-[2px] h-2 rounded-full bg-[#D9D4C5]" />
            ))}
          </div>
          <div className="absolute -bottom-2 left-5 right-5 flex justify-between">
            {[1, 2, 3].map((i) => (
              <span key={`pin-b-${i}`} className="w-[2px] h-2 rounded-full bg-[#D9D4C5]" />
            ))}
          </div>

          {/* Left & Right Pins */}
          <div className="absolute -left-2.5 top-4 bottom-4 flex flex-col justify-between">
            {[1, 2, 3, 4].map((i) => (
              <span key={`pin-l-${i}`} className="w-2.5 h-[2px] rounded-full bg-[#E6E1D3]" />
            ))}
          </div>
          <div className="absolute -right-2.5 top-4 bottom-4 flex flex-col justify-between">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={`pin-r-${i}`}
                className={`w-2.5 h-[2px] rounded-full ${
                  i === 2 ? 'bg-[var(--accent-vermilion)]' : 'bg-[#E6E1D3]'
                }`}
              />
            ))}
          </div>

          {/* Recessed Silicon Core */}
          <div
            className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-gradient-to-br from-[#232D27] to-[#1A221D] border border-[#F1EEE3]/22 flex flex-col items-center justify-center overflow-hidden"
            style={{
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.55)',
            }}
          >
            {/* Subtle Specular Sheen */}
            {!shouldReduceMotion && (
              <motion.div
                animate={{ x: ['-130%', '210%'] }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F1EEE3]/10 to-transparent skew-x-12"
              />
            )}

            {/* Etched Micro-traces */}
            <svg
              className="absolute inset-0 w-full h-full opacity-25"
              viewBox="0 0 80 80"
              fill="none"
            >
              <path d="M 0 22 H 26 V 40 H 80" stroke="#F1EEE3" strokeWidth="1" />
              <path d="M 0 58 H 54 V 40" stroke="#F20B0B" strokeWidth="1" />
              <circle cx="26" cy="22" r="2" fill="#F1EEE3" />
              <circle cx="54" cy="40" r="2" fill="#F20B0B" />
            </svg>

            <span className="relative text-lg sm:text-xl font-black tracking-widest text-[#F1EEE3] leading-none">
              AI
            </span>
            <span className="relative text-[6.5px] font-mono tracking-wider text-[#F1EEE3]/75 uppercase font-semibold mt-1">
              RF &bull; MARKOV
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default memo(AIChip3D)
