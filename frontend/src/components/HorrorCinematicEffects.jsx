import React, { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export default function HorrorCinematicEffects({ bloodSpillActive = false, onBloodSpillComplete = null }) {
  const grainCanvasRef = useRef(null)
  const warmth = useGameStore((state) => state.warmth)

  // 1. Procedural 16mm Film Grain Canvas Layer
  useEffect(() => {
    const canvas = grainCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    canvas.width = 160
    canvas.height = 160

    const renderGrain = () => {
      const imgData = ctx.createImageData(160, 160)
      const data = imgData.data
      const dreadFactor = Math.min(1.0, warmth * 1.5)
      const noiseIntensity = 16 + dreadFactor * 22

      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * noiseIntensity
        data[i] = val
        data[i + 1] = val
        data[i + 2] = val
        data[i + 3] = 255
      }
      ctx.putImageData(imgData, 0, 0)
      animationId = requestAnimationFrame(renderGrain)
    }
    renderGrain()

    return () => cancelAnimationFrame(animationId)
  }, [warmth])

  return (
    <>
      {/* 1. Procedural 16mm Film Grain Layer */}
      <canvas
        ref={grainCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          opacity: 0.12 + warmth * 0.08,
          mixBlendMode: 'screen',
          zIndex: 80
        }}
      />

      {/* 2. Atmospheric Subtle Cinematic Vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 50%, transparent 68%, rgba(3, 2, 6, ${0.35 + warmth * 0.15}) 100%)`,
          boxShadow: warmth > 0.5 ? `inset 0 0 ${Math.round(warmth * 80)}px rgba(185, 28, 28, 0.4)` : 'none',
          transition: 'background 0.3s, box-shadow 0.3s',
          zIndex: 81
        }}
      />

      {/* 3. Visceral Blood Spill Screen Wipe Transition */}
      {bloodSpillActive && (
        <div
          onAnimationEnd={onBloodSpillComplete}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 20%, #450a0a 0%, #1f0202 50%, #050204 100%)',
            zIndex: 150,
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'bloodDripWipe 2.0s cubic-bezier(0.77, 0, 0.175, 1) forwards'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(to bottom, #7f1d1d, #450a0a, #030205)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 85% 90%, 65% 78%, 45% 95%, 25% 82%, 0% 90%)',
            animation: 'bloodFlow 2.0s ease-in-out forwards'
          }} />
          <h2 style={{
            position: 'relative',
            zIndex: 10,
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '36px',
            color: '#fecaca',
            letterSpacing: '4px',
            textShadow: '0 0 30px #ef4444',
            margin: 0
          }}>
            THE HOUSE CALLS
          </h2>
        </div>
      )}
    </>
  )
}
