import React from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * Horror Post-Processing System.
 * Renders dark horror vignette, film grain scanlines, and atmospheric horror tint.
 * Automatically skips heavy canvas shaders in FAST (lowQuality) mode for 60fps performance.
 */
export default function HorrorPostProcessing() {
  const { lowQuality, lifelines } = useGameStore()

  // Vignette intensity increases as candles die
  const vignetteDarkness = lifelines <= 1 ? '0.75' : lifelines <= 2 ? '0.6' : '0.45'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 15
    }}>
      {/* 1. Cinematic Horror Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at center, transparent 65%, rgba(0, 0, 0, ${lifelines <= 1 ? '0.45' : '0.3'}) 100%)`,
        transition: 'background 0.5s ease-out'
      }} />

      {/* 2. Film Grain / CRT Horror Scanlines (Skipped in FAST mode) */}
      {!lowQuality && (
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.035,
          background: 'repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 2px)',
          backgroundSize: '100% 2px'
        }} />
      )}
    </div>
  )
}
