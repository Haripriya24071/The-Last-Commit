import React from 'react'
import { useGameStore } from '../store/gameStore'

export default function WelcomeScreen() {
  const { playerName, setScreen } = useGameStore()

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #151020 0%, #06040a 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: 'rgba(18, 14, 28, 0.92)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        position: 'relative'
      }}>
        {/* Header with Skip Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🏰📜</span>
            <h2 style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '22px',
              color: '#ef4444',
              margin: 0,
              letterSpacing: '1px'
            }}>
              RULES OF THE HAUNT
            </h2>
          </div>

          <button
            onClick={() => setScreen('repo_input')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fca5a5',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            ⚡ SKIP BRIEFING →
          </button>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, margin: '0 0 20px 0' }}>
          Welcome, <strong>{playerName}</strong>. You have entered a haunted codebase. Bugs and security vulnerabilities manifest as corrupted relics scattered across 5 rooms.
        </p>

        {/* 3 Core Rules */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          margin: '20px 0'
        }}>
          {/* Rule 1: 4 Lantern Visits */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '10px',
            padding: '14px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '24px' }}>🏮</span>
            <h4 style={{ color: '#f59e0b', margin: '6px 0 2px 0', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              4 VISITS
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.3, margin: 0 }}>
              Entering a room consumes 1 visit. Escaping back to the blueprint is free.
            </p>
          </div>

          {/* Rule 2: 4 Candle Lifelines */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '14px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '24px' }}>🕯️</span>
            <h4 style={{ color: '#ef4444', margin: '6px 0 2px 0', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              4 CANDLES
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.3, margin: 0 }}>
              Clicking a clean decoy snuffs out 1 candle and unleashes a jump scare.
            </p>
          </div>

          {/* Rule 3: Proximity Pulse */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
            padding: '14px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '24px' }}>💓</span>
            <h4 style={{ color: '#38bdf8', margin: '6px 0 2px 0', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              HEARTBEAT
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.3, margin: 0 }}>
              Listen to the pulse. It accelerates when standing close to hidden bugs.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
          <button
            onClick={() => setScreen('landing')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#9ca3af',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            ← BACK
          </button>

          <button
            onClick={() => setScreen('repo_input')}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)'
            }}
          >
            PROCEED TO REPO SELECT →
          </button>
        </div>
      </div>
    </div>
  )
}
