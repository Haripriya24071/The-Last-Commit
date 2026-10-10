import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { AudioEngine } from './AudioEngine'

export default function LandingScreen() {
  const { playerName, setPlayerName, setScreen, unlockAudio } = useGameStore()
  const [nameInput, setNameInput] = useState(playerName || 'Investigator')

  const handleEnter = () => {
    // Unlock Web Audio context on user gesture
    AudioEngine.init()
    AudioEngine.playHeartbeat(0.5)
    unlockAudio()
    setPlayerName(nameInput.trim() || 'Investigator')
    setScreen('welcome')
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 40%, #170f24 0%, #050308 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      
      {/* Background Eerie Particles / Ambient Glow */}
      <div style={{
        position: 'absolute',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        animation: 'candleFlicker 4s infinite'
      }} />

      {/* Atmospheric Candle Icon */}
      <div style={{
        fontSize: '64px',
        marginBottom: '16px',
        filter: 'drop-shadow(0 0 25px rgba(245, 158, 11, 0.8))',
        animation: 'candleFlicker 1.8s infinite'
      }}>
        🕯️
      </div>

      {/* Main Title */}
      <h1 style={{
        fontFamily: 'Cinzel Decorative, serif',
        fontSize: 'clamp(32px, 5vw, 54px)',
        color: '#ef4444',
        margin: 0,
        letterSpacing: '3px',
        textAlign: 'center',
        textShadow: '0 0 25px rgba(239, 68, 68, 0.5)'
      }}>
        THE LAST COMMIT
      </h1>

      <p style={{
        fontSize: 'clamp(13px, 1.8vw, 17px)',
        color: '#fca5a5',
        marginTop: '8px',
        marginBottom: '32px',
        letterSpacing: '1px',
        fontStyle: 'italic',
        textAlign: 'center'
      }}>
        A Haunted Mansion of Corrupted Code
      </p>

      {/* Investigator Name Card */}
      <div style={{
        background: 'rgba(18, 14, 28, 0.85)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '28px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            color: '#9ca3af',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '6px',
            letterSpacing: '1px'
          }}>
            INVESTIGATOR IDENTITY:
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
            placeholder="Enter your name..."
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(9, 6, 15, 0.8)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'JetBrains Mono, monospace',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Enter / Audio Unlock Button */}
        <button
          onClick={handleEnter}
          style={{
            padding: '14px',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '1px',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)',
            transition: 'transform 0.15s, background 0.15s'
          }}
        >
          🕯️ LIGHT THE CANDLE & ENTER
        </button>
      </div>

      {/* Footer credits / edition tag */}
      <footer style={{
        position: 'absolute',
        bottom: '20px',
        color: '#6b7280',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
        textAlign: 'center'
      }}>
        Turing Club Auditions 2026 • Halloween Edition • Built with Three.js & FastAPI
      </footer>
    </div>
  )
}
