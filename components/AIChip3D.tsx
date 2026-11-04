'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function AIChip3D() {
  return (
    <div className="relative w-44 h-32 sm:w-56 sm:h-36 flex items-center justify-center select-none pointer-events-none">
      {/* Background Neon Glow Halos: Cyan on left, Crimson on right */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-28 h-28 bg-[#12CBEA]/25 rounded-full blur-2xl animate-pulse" />
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-28 h-28 bg-[#FF454F]/25 rounded-full blur-2xl animate-pulse" />

      {/* Floating Animated Container */}
      <motion.div
        animate={{
          y: [-3, 3, -3],
          rotateX: [12, 14, 12],
          rotateZ: [-22, -20, -22],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
          perspective: 1000,
        }}
      >
        {/* Outer Motherboard Socket Platform */}
        <div
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#131d2e] via-[#0d1522] to-[#070b13] border border-[#1e2e46] shadow-[0_20px_40px_rgba(0,0,0,0.8)] flex items-center justify-center p-3"
          style={{
            boxShadow:
              '-8px 8px 24px rgba(18, 203, 234, 0.25), 8px 8px 24px rgba(255, 69, 79, 0.25), inset 0 1px 2px rgba(255,255,255,0.15)',
          }}
        >
          {/* Socket Corner Screws */}
          <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#334155] border border-[#475569]" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#334155] border border-[#475569]" />
          <span className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-[#334155] border border-[#475569]" />
          <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#334155] border border-[#475569]" />

          {/* Radiating Circuit Pins (Cyan on Left, Crimson on Right) */}
          <div className="absolute -left-2.5 top-5 bottom-5 flex flex-col justify-between">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={`pin-l-${i}`}
                className="w-2.5 h-[2px] bg-[#12CBEA] shadow-[0_0_8px_#12CBEA]"
              />
            ))}
          </div>
          <div className="absolute -right-2.5 top-5 bottom-5 flex flex-col justify-between">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={`pin-r-${i}`}
                className="w-2.5 h-[2px] bg-[#FF454F] shadow-[0_0_8px_#FF454F]"
              />
            ))}
          </div>

          {/* Central AI Microchip Core */}
          <div
            className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-gradient-to-br from-[#1a2538] via-[#0f1724] to-[#0a0f18] border border-[#38bdf8]/40 flex flex-col items-center justify-center overflow-hidden"
            style={{
              boxShadow:
                'inset 0 0 15px rgba(18,203,234,0.2), inset 0 2px 4px rgba(255,255,255,0.2), 0 8px 16px rgba(0,0,0,0.6)',
            }}
          >
            {/* Holographic light sweep */}
            <motion.div
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />

            {/* Microchip Circuit Grid Lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-25"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M 0 20 H 25 V 40 H 80" stroke="#12CBEA" strokeWidth="1" />
              <path d="M 0 60 H 55 V 40" stroke="#FF454F" strokeWidth="1" />
              <circle cx="25" cy="20" r="2" fill="#12CBEA" />
              <circle cx="55" cy="40" r="2" fill="#FF454F" />
            </svg>

            {/* Embossed Bold "AI" Symbol */}
            <span
              className="relative text-2xl sm:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-[#e2e8f0] to-[#94a3b8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.12em',
              }}
            >
              AI
            </span>

            {/* Subtle Sub-label */}
            <span className="relative text-[7px] font-mono tracking-wider text-[#12CBEA] uppercase font-bold mt-0.5">
              RF &bull; Markov
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

