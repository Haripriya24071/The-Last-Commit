import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function LandingScreen() {
  const { playerName, setPlayerName, setScreen } = useGameStore()

  // Stages: 'match_flash' -> 'blood_spill' -> 'letter_scene'
  const [stage, setStage] = useState('match_flash')
  const [nameInput, setNameInput] = useState(playerName || '')
  const [matchStruck, setMatchStruck] = useState(false)

  const handleStrikeMatch = () => {
    if (matchStruck) return
    setMatchStruck(true)

    // Trigger blood spill transition
    setTimeout(() => {
      setStage('blood_spill')
      setTimeout(() => {
        setStage('letter_scene')
      }, 1500)
    }, 400)
  }

  const handleProceedToGates = () => {
    const chosen = nameInput.trim() || 'Investigator'
    setPlayerName(chosen)
    setScreen('role_select')
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#040306',
      position: 'relative',
      overflow: 'hidden',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      userSelect: 'none'
    }}>

      {/* ========================================================
          STAGE 1: Exact Reference Image 2 — Title / Sudden Flash Screen
          "Are You Afraid of the Dark?" with lit match
      ======================================================== */}
      {stage === 'match_flash' && (
        <div
          onClick={handleStrikeMatch}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            background: '#000'
          }}
        >
          {/* Exact Reference Image 2 Centerpiece */}
          <div style={{
            position: 'relative',
            maxWidth: '820px',
            width: '90%',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: matchStruck
              ? '0 0 120px rgba(245, 158, 11, 0.9), 0 0 80px rgba(220, 38, 38, 0.7)'
              : '0 0 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(245, 158, 11, 0.3)',
            transform: matchStruck ? 'scale(1.04)' : 'scale(1.0)',
            transition: 'all 0.35s ease-out'
          }}>
            <img
              src="/assets/title_match_dark.jpg"
              alt="Are You Afraid of the Dark?"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                filter: matchStruck ? 'brightness(1.3) contrast(1.2)' : 'brightness(0.95)'
              }}
            />

            {/* Pulsing Ember Glow Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.8)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Minimal Action Prompt (Zero Emojis) */}
          <div style={{
            marginTop: '28px',
            padding: '12px 32px',
            background: 'rgba(18, 12, 8, 0.85)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '4px',
            color: '#fef3c7',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            boxShadow: '0 0 25px rgba(245, 158, 11, 0.25)'
          }}>
            CLICK TO STRIKE THE FLAME
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 2: Blood Spill Transition
      ======================================================== */}
      {stage === 'blood_spill' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 20%, #450a0a 0%, #1f0202 50%, #050204 100%)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          animation: 'bloodDripWipe 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(to bottom, #7f1d1d, #450a0a, #030205)',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 80% 98%, 60% 82%, 40% 95%, 20% 86%, 0% 92%)'
          }} />
          <h2 style={{
            position: 'relative',
            zIndex: 10,
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '38px',
            color: '#fecaca',
            letterSpacing: '5px',
            textShadow: '0 0 35px #ef4444',
            margin: 0
          }}>
            THE HOUSE CALLS
          </h2>
        </div>
      )}

      {/* ========================================================
          STAGE 3: Exact Reference Image 3 — Name-Entry Clue & Letter
          Bloodstained note "Now, you must find her." and antique key
      ======================================================== */}
      {stage === 'letter_scene' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#040306',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          {/* Exact Reference Image 3 Embedded Directly */}
          <div style={{
            position: 'relative',
            maxWidth: '580px',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,0.98), 0 0 40px rgba(239, 68, 68, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <img
              src="/assets/name_entry_letter.jpg"
              alt="Now, you must find her. - Clue Letter and Key"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />

            {/* In-Scene Interactive Name Inscription Panel over the floorboards */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(3, 2, 6, 0.96) 0%, rgba(3, 2, 6, 0.85) 75%, transparent 100%)',
              padding: '24px 28px 20px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                color: '#f87171',
                letterSpacing: '2px',
                marginBottom: '10px',
                fontWeight: 700
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
                  if (e.key === 'Enter') handleProceedToGates()
                }}
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  padding: '12px 18px',
                  background: 'rgba(10, 8, 14, 0.95)',
                  border: '1px solid rgba(239, 68, 68, 0.6)',
                  borderRadius: '4px',
                  color: '#fff',
                  fontFamily: 'Cinzel Decorative, serif',
                  fontSize: '18px',
                  textAlign: 'center',
                  letterSpacing: '2px',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.9), 0 0 20px rgba(239, 68, 68, 0.3)',
                  marginBottom: '16px'
                }}
              />

              <button
                onClick={handleProceedToGates}
                style={{
                  padding: '12px 32px',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(220, 38, 38, 0.7)',
                  transition: 'all 0.15s ease'
                }}
              >
                PICK UP THE KEY & ENTER GATES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
