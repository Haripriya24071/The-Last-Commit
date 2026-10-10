import React, { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

export default function SubtitlesOverlay() {
  const { activeSubtitle, clearSubtitle } = useGameStore()

  useEffect(() => {
    if (activeSubtitle) {
      const timer = setTimeout(() => {
        clearSubtitle()
      }, 4800)
      return () => clearTimeout(timer)
    }
  }, [activeSubtitle, clearSubtitle])

  if (!activeSubtitle) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '36px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 65,
      pointerEvents: 'none',
      maxWidth: '750px',
      width: '90%',
      display: 'flex',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(9, 6, 15, 0.92)',
        border: `1.5px solid ${activeSubtitle.color || '#ef4444'}`,
        borderRadius: '12px',
        padding: '12px 24px',
        textAlign: 'center',
        backdropFilter: 'blur(16px)',
        boxShadow: `0 4px 30px rgba(0,0,0,0.9), 0 0 20px ${activeSubtitle.color}33`,
        animation: 'candleFlicker 3s infinite'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: activeSubtitle.color || '#f87171',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '1.5px',
          marginBottom: '4px'
        }}>
          🗣️ {activeSubtitle.speaker}
        </div>
        <div style={{
          color: '#f8fafc',
          fontSize: '14px',
          fontStyle: 'italic',
          lineHeight: 1.4,
          fontFamily: 'Inter, sans-serif'
        }}>
          "{activeSubtitle.text}"
        </div>
      </div>
    </div>
  )
}
