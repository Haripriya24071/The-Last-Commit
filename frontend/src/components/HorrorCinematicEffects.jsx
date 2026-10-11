import React, { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'

export default function HorrorCinematicEffects({ bloodSpillActive = false, onBloodSpillComplete = null }) {
  const grainCanvasRef = useRef(null)
  const ecgCanvasRef = useRef(null)
  const warmth = useGameStore((state) => state.warmth)
  const isGameOver = useGameStore((state) => state.isGameOver)
  const lifelines = useGameStore((state) => state.lifelines)

  // 1. Procedural High-Fidelity 16mm Film Grain Canvas Loop
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
      const noiseIntensity = 18 + dreadFactor * 25

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

  // 2. Live Electrocardiogram (ECG) Heartbeat Monitor
  useEffect(() => {
    const canvas = ecgCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId
    let phase = 0

    const pulseFormula = (p) => {
      p = p % 1
      if (p < 0.1) return Math.sin((p / 0.1) * Math.PI) * 0.12
      if (p > 0.2 && p < 0.23) return -0.15
      if (p >= 0.23 && p < 0.28) return -1.0 // Main QRS spike
      if (p >= 0.28 && p < 0.32) return 0.4
      if (p > 0.5 && p < 0.62) return Math.sin(((p - 0.5) / 0.12) * Math.PI) * 0.22
      return 0
    }

    const renderEcg = () => {
      const w = canvas.width
      const h = canvas.height
      const heartRateSpeed = 0.015 + warmth * 0.04 + (4 - lifelines) * 0.008
      phase += heartRateSpeed

      ctx.clearRect(0, 0, w, h)

      // Color shifts from spooky green to racing crimson as danger nears
      const r = Math.min(255, Math.floor(120 + warmth * 135))
      const g = Math.max(20, Math.floor(220 - warmth * 190))
      const b = Math.max(20, Math.floor(120 - warmth * 100))
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`
      ctx.lineWidth = 1.6
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`
      ctx.shadowBlur = 6

      ctx.beginPath()
      for (let x = 0; x < w; x++) {
        const pOffset = phase - ((w - x) / w) * 1.5
        const spike = isGameOver ? 0 : pulseFormula(pOffset)
        const y = h / 2 - spike * (h * 0.38)
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      animationId = requestAnimationFrame(renderEcg)
    }
    renderEcg()

    return () => cancelAnimationFrame(animationId)
  }, [warmth, isGameOver, lifelines])

  return (
    <>
      {/* 1. Procedural 16mm Film Grain Texture */}
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

      {/* 2. Heavy Gothic Vignette & Breathing Darkness */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at 50% 50%, transparent ${Math.max(25, 55 - warmth * 30)}%, rgba(3, 2, 6, ${0.85 + warmth * 0.12}) 100%)`,
          boxShadow: warmth > 0.5 ? `inset 0 0 ${Math.round(warmth * 120)}px rgba(185, 28, 28, 0.4)` : 'none',
          transition: 'background 0.3s, box-shadow 0.3s',
          zIndex: 81
        }}
      />

      {/* 3. Live ECG Heart-Rate Monitor in Lower Right Corner */}
      <div style={{
        position: 'fixed',
        bottom: '18px',
        right: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(8, 6, 14, 0.88)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        padding: '6px 14px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
        zIndex: 85,
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#9ca3af', fontWeight: 700 }}>
            INVESTIGATOR PULSE
          </span>
          <span style={{
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 800,
            color: warmth > 0.6 ? '#ef4444' : warmth > 0.3 ? '#f59e0b' : '#34d399'
          }}>
            {isGameOver ? 'FLATLINE' : `${Math.round(62 + warmth * 95)} BPM`}
          </span>
        </div>
        <canvas ref={ecgCanvasRef} width={130} height={32} />
      </div>

      {/* 4. Dramatic Blood Spill Transition Overlay */}
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
            animation: 'bloodDripWipe 2.2s cubic-bezier(0.77, 0, 0.175, 1) forwards'
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
            animation: 'bloodFlow 2.2s ease-in-out forwards'
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
