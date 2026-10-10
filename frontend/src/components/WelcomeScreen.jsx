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
        maxWidth: '720px',
        width: '100%',
        background: 'rgba(18, 14, 28, 0.92)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '20px',
        padding: '36px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        position: 'relative'
      }}>
        {/* Welcome Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '36px' }}>🏰📜</span>
          <h2 style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '28px',
            color: '#ef4444',
            margin: '8px 0 4px 0',
            letterSpacing: '2px',
            textShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
          }}>
            WELCOME TO THE CURSED HOUSE, {playerName.toUpperCase()}
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
            Every repository carries dark secrets. Here, corrupted code manifests as haunted relics.
          </p>
        </div>

        {/* 3 Core Rules / Mechanics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          margin: '28px 0'
        }}>
          {/* Rule 1: 4 Lantern Visits */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '18px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '28px' }}>🏮</span>
            <h4 style={{ color: '#f59e0b', margin: '8px 0 4px 0', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace' }}>
              4 LANTERN VISITS
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>
              The mansion has 5 rooms. You have only enough oil to enter 4 times before the gates seal.
            </p>
          </div>

          {/* Rule 2: 4 Candle Lifelines */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '18px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '28px' }}>🕯️</span>
            <h4 style={{ color: '#ef4444', margin: '8px 0 4px 0', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace' }}>
              4 CANDLE LIFELINES
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>
              Inspecting a clean decoy file extinguishes a candle and unleashes a jump scare.
            </p>
          </div>

          {/* Rule 3: Heartbeat Proximity */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '12px',
            padding: '18px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '28px' }}>💓</span>
            <h4 style={{ color: '#38bdf8', margin: '8px 0 4px 0', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace' }}>
              HEARTBEAT RADAR
            </h4>
            <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: 1.4, margin: 0 }}>
              Listen to the pulsing heartbeat as you walk. It accelerates when standing near real code defects.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
          <button
            onClick={() => setScreen('landing')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#9ca3af',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '12px',
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
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '1px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)'
            }}
          >
            SELECT REPOSITORY →
          </button>
        </div>
      </div>
    </div>
  )
}
