import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function LandingScreen() {
  const { playerName, setPlayerName, setScreen } = useGameStore()

  // Exact requested order:
  // 1. Fully black screen with candle animation popping up ('candle_popup')
  // 2. The "Are You Ready" thing filled into the page ('are_you_ready')
  // 3. The name entry filled into the page ('name_entry')
  // Then -> repo_input -> role_select -> map -> room
  const [stage, setStage] = useState('candle_popup')
  const [nameInput, setNameInput] = useState(playerName || '')
  const [matchStruck, setMatchStruck] = useState(false)

  // Stage 1 -> Stage 2
  const handleLightCandle = () => {
    setStage('are_you_ready')
  }

  // Stage 2 -> Blood Spill Transition -> Stage 3
  const handleStrikeMatch = () => {
    if (matchStruck) return
    setMatchStruck(true)
    setTimeout(() => {
      setStage('blood_transition')
      setTimeout(() => {
        setStage('name_entry')
      }, 1400)
    }, 450)
  }

  // Stage 3 -> Repo Input Screen
  const handleProceedToRepo = () => {
    const chosen = nameInput.trim() || 'Investigator'
    setPlayerName(chosen)
    setScreen('repo_input')
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000000',
      position: 'relative',
      overflow: 'hidden',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      userSelect: 'none'
    }}>

      {/* ========================================================
          STAGE 1: Fully black screen with candle image & animation popping up
      ======================================================== */}
      {stage === 'candle_popup' && (
        <div
          onClick={handleLightCandle}
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          {/* Animated candle popping up with flickering halo glow */}
          <div style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'candlePopUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}>
            {/* Candle flame dynamic radial aura */}
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(220, 38, 38, 0.15) 45%, transparent 70%)',
              pointerEvents: 'none',
              animation: 'flickerPulse 2s ease-in-out infinite alternate'
            }} />

            {/* Candle Image Frame */}
            <div style={{
              width: '240px',
              height: '320px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 0 60px rgba(245, 158, 11, 0.6), 0 0 100px rgba(220, 38, 38, 0.4)',
              border: '2px solid rgba(245, 158, 11, 0.6)',
              position: 'relative',
              background: '#050204'
            }}>
              <img
                src="/assets/candle_carried.jpg"
                alt="The Solitary Flame"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'contrast(1.15) brightness(1.05)'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.85)'
              }} />
            </div>

            {/* Action Prompt */}
            <button
              onClick={handleLightCandle}
              style={{
                marginTop: '36px',
                padding: '14px 38px',
                background: 'rgba(18, 12, 8, 0.9)',
                border: '1px solid rgba(245, 158, 11, 0.7)',
                borderRadius: '4px',
                color: '#fef3c7',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.35)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              CLICK TO AWAKEN THE FLAME
            </button>
          </div>

          <style>{`
            @keyframes candlePopUp {
              0% {
                opacity: 0;
                transform: scale(0.6) translateY(50px);
              }
              70% {
                transform: scale(1.05) translateY(-6px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            @keyframes flickerPulse {
              0% { opacity: 0.7; transform: translate(-50%, -50%) scale(0.95); }
              50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
              100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* ========================================================
          STAGE 2: "Are You Ready" thing FILLED INTO THE PAGE
      ======================================================== */}
      {stage === 'are_you_ready' && (
        <div
          onClick={handleStrikeMatch}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100vw',
            height: '100vh',
            cursor: 'pointer',
            overflow: 'hidden'
          }}
        >
          {/* Exact Image 2 filled into the full viewport */}
          <img
            src="/assets/title_match_dark.jpg"
            alt="Are You Afraid of the Dark?"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: matchStruck ? 'brightness(1.4) contrast(1.2)' : 'brightness(1.0)',
              transform: matchStruck ? 'scale(1.03)' : 'scale(1.0)',
              transition: 'all 0.4s ease-out',
              display: 'block'
            }}
          />

          {/* Heavy cinematic vignette edges */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.85) 90%, #000 100%)',
            pointerEvents: 'none'
          }} />

          {/* Interactive Bottom Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '48px',
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10
          }}>
            <button
              onClick={handleStrikeMatch}
              style={{
                padding: '16px 44px',
                background: 'rgba(10, 6, 8, 0.92)',
                border: '2px solid rgba(245, 158, 11, 0.8)',
                borderRadius: '6px',
                color: '#fef3c7',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                boxShadow: matchStruck
                  ? '0 0 60px rgba(245, 158, 11, 0.9), 0 0 100px rgba(220, 38, 38, 0.8)'
                  : '0 0 35px rgba(245, 158, 11, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {matchStruck ? 'STRIKING FLAME...' : 'ARE YOU READY? CLICK TO STRIKE MATCH'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          TRANSITION: Blood Spill
      ======================================================== */}
      {stage === 'blood_transition' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 20%, #450a0a 0%, #1f0202 50%, #050204 100%)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'bloodWipe 1.4s cubic-bezier(0.77, 0, 0.175, 1) forwards'
        }}>
          <h2 style={{
            position: 'relative',
            zIndex: 10,
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '36px',
            color: '#fecaca',
            letterSpacing: '6px',
            textShadow: '0 0 35px #ef4444',
            margin: 0
          }}>
            THE HOUSE CALLS
          </h2>
        </div>
      )}

      {/* ========================================================
          STAGE 3: The Name Entry FILLED INTO THE PAGE
      ======================================================== */}
      {stage === 'name_entry' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden'
        }}>
          {/* Exact Image 3 (name_entry_letter.jpg) filled into the full viewport */}
          <img
            src="/assets/name_entry_letter.jpg"
            alt="Now, you must find her - Letter and Key"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block'
            }}
          />

          {/* Dark atmospheric floorboard gradient for readability */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(3, 2, 6, 0.95) 0%, rgba(3, 2, 6, 0.75) 45%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none'
          }} />

          {/* Inscription Panel on top of the scene */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '520px',
            background: 'rgba(12, 9, 16, 0.94)',
            border: '2px solid rgba(239, 68, 68, 0.65)',
            borderRadius: '10px',
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 20px 80px rgba(0,0,0,0.98), 0 0 40px rgba(239, 68, 68, 0.35)',
            zIndex: 10
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              color: '#f87171',
              letterSpacing: '3px',
              marginBottom: '12px',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              INSCRIBE YOUR INVESTIGATOR NAME
            </span>

            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Type your name..."
              maxLength={24}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProceedToRepo()
              }}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'rgba(5, 4, 8, 0.95)',
                border: '1px solid rgba(239, 68, 68, 0.7)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'Cinzel Decorative, serif',
                fontSize: '20px',
                textAlign: 'center',
                letterSpacing: '2px',
                outline: 'none',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(239, 68, 68, 0.3)',
                marginBottom: '18px'
              }}
            />

            <button
              onClick={handleProceedToRepo}
              style={{
                width: '100%',
                padding: '14px 28px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(220, 38, 38, 0.75)',
                transition: 'all 0.15s ease'
              }}
            >
              PICK UP THE KEY & FEED REPOSITORY →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
