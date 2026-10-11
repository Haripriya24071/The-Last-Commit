import React from 'react'
import { useGameStore } from '../store/gameStore'

export default function WelcomeScreen() {
  const { playerName, setScreen } = useGameStore()

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#040306',
      backgroundImage: 'url(/assets/mansion_entrance.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* Dark vignette backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(4, 3, 6, 0.82)',
        backdropFilter: 'blur(4px)'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '720px',
        width: '100%',
        background: 'rgba(12, 10, 18, 0.94)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '8px',
        padding: '36px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.95)'
      }}>
        {/* Header with Skip Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#ef4444', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, letterSpacing: '2px' }}>
              PROTOCOL OF THE HAUNT
            </span>
            <h2 style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '24px',
              color: '#fca5a5',
              margin: '4px 0 0 0',
              letterSpacing: '1px'
            }}>
              RULES OF SURVIVAL
            </h2>
          </div>

          <button
            onClick={() => setScreen('repo_input')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#cbd5e1',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '1px'
            }}
          >
            SKIP BRIEFING →
          </button>
        </div>

        <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
          Welcome, <strong style={{ color: '#fbbf24' }}>{playerName || 'Investigator'}</strong>. The repository has manifested as a cursed Victorian manor. Software defects, leaked tokens, and architectural rot lurk disguised as relics across the chambers.
        </p>

        {/* 3 Core Rules (Zero Emojis, No Heartbeat) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          margin: '24px 0'
        }}>
          {/* Rule 1: 4 Visits */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '6px',
            padding: '16px',
            textAlign: 'left'
          }}>
            <div style={{
              width: '28px',
              height: '38px',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '10px'
            }}>
              <img src="/assets/candle_returns.jpg" alt="Candle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h4 style={{ color: '#f59e0b', margin: '0 0 4px 0', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
              4 INFILTRATIONS
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.4, margin: 0 }}>
              Entering a chamber consumes 1 visit. Escaping back to the blueprint map is permitted.
            </p>
          </div>

          {/* Rule 2: 4 Candle Lifelines */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            padding: '16px',
            textAlign: 'left'
          }}>
            <div style={{
              width: '28px',
              height: '38px',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '10px'
            }}>
              <img src="/assets/candle_extinguished.jpg" alt="Extinguished Candle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h4 style={{ color: '#ef4444', margin: '0 0 4px 0', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
              4 CANDLE LIFELINES
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.4, margin: 0 }}>
              Inspecting a clean decoy snuffs out 1 candle flame. When all 4 expire, the darkness consumes you.
            </p>
          </div>

          {/* Rule 3: Visual Spectral Distortion */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '6px',
            padding: '16px',
            textAlign: 'left'
          }}>
            <div style={{
              width: '28px',
              height: '38px',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '10px'
            }}>
              <img src="/assets/candle_carried.jpg" alt="Carried Flame" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h4 style={{ color: '#38bdf8', margin: '0 0 4px 0', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
              SPECTRAL AURA
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '11px', lineHeight: 1.4, margin: 0 }}>
              Corrupted relics cast an unearthly glow upon the masonry. Move your flame to illuminate hidden code.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <button
            onClick={() => setScreen('role_select')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#9ca3af',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '1px'
            }}
          >
            ← PREVIOUS
          </button>

          <button
            onClick={() => setScreen('repo_input')}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 0 24px rgba(220, 38, 38, 0.4)'
            }}
          >
            ENTER THE REPOSITORY
          </button>
        </div>
      </div>
    </div>
  )
}
