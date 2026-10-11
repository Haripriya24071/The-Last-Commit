import React, { useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

export default function LandingScreen() {
  const { playerName, setPlayerName, setScreen } = useGameStore()

  // Stages: 'match_flash' -> 'blood_spill' -> 'letter_scene'
  const [stage, setStage] = useState('match_flash')
  const [nameInput, setNameInput] = useState(playerName || '')
  const [matchStruck, setMatchStruck] = useState(false)

  // Handle clicking the match to trigger blood spill wipe
  const handleStrikeMatch = () => {
    if (matchStruck) return
    setMatchStruck(true)

    // Trigger dramatic blood spill transition after 400ms flare
    setTimeout(() => {
      setStage('blood_spill')
      setTimeout(() => {
        setStage('letter_scene')
      }, 1600)
    }, 450)
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
          STAGE 1: Title & Match Strike (Reference Image 2)
          "Are You Afraid of the Dark?"
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
            background: 'radial-gradient(circle at 50% 60%, #150a06 0%, #060305 60%, #000 100%)',
            transition: 'filter 0.4s'
          }}
        >
          {/* Subtle Ambient Fog Layer */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0%, transparent 60%)',
            animation: 'candleFlicker 3s infinite ease-in-out'
          }} />

          {/* Title from Reference Image 2 */}
          <div style={{ textAlign: 'center', zIndex: 10, marginBottom: '24px' }}>
            <h1 style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '44px',
              fontWeight: 900,
              color: '#f59e0b',
              margin: '0 0 6px 0',
              letterSpacing: '3px',
              textShadow: '0 0 35px rgba(245, 158, 11, 0.7), 0 0 60px rgba(220, 38, 38, 0.5)',
              transform: matchStruck ? 'scale(1.08)' : 'scale(1.0)',
              transition: 'transform 0.4s ease'
            }}>
              Are You Afraid of the Dark?
            </h1>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              color: '#d97706',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              margin: 0
            }}>
              THE CODEBASE HAS A MEMORY
            </p>
          </div>

          {/* The Hand Cupping the Burning Match (Reference Image 2) */}
          <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: matchStruck ? 'none' : 'matchGlow 2.5s infinite ease-in-out'
          }}>
            {/* Matchstick Head & Flame Graphic */}
            <div style={{
              width: '18px',
              height: '38px',
              background: 'radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fbbf24 35%, #ef4444 80%, transparent 100%)',
              borderRadius: '50% 50% 35% 35%',
              filter: 'drop-shadow(0 0 20px #f59e0b) drop-shadow(0 0 45px #ef4444)',
              transform: matchStruck ? 'scale(2.2)' : 'scale(1.0)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              marginBottom: '-4px'
            }} />

            {/* Wooden Match Stick */}
            <div style={{
              width: '5px',
              height: '55px',
              background: 'linear-gradient(to bottom, #451a03, #78350f)',
              borderRadius: '2px',
              boxShadow: '0 0 10px rgba(0,0,0,0.8)'
            }} />

            {/* Hand Silhouette Graphic beneath match */}
            <div style={{
              fontSize: '48px',
              marginTop: '-16px',
              filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))'
            }}>
              🖐️
            </div>
          </div>

          {/* Action Prompt */}
          <div style={{
            marginTop: '36px',
            padding: '10px 24px',
            background: 'rgba(24, 16, 28, 0.75)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '9999px',
            color: '#fde68a',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            letterSpacing: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)'
          }}>
            <span>🔥</span>
            <span>STRIKE THE MATCH TO AWAKEN THE HOUSE</span>
          </div>
        </div>
      )}


      {/* ========================================================
          STAGE 2: Blood Spill Transition (User's Exact Directive)
          "after candle a big blood spills on screen cover screen"
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
          animation: 'bloodDripWipe 1.6s cubic-bezier(0.77, 0, 0.175, 1) forwards'
        }}>
          {/* Organic Blood Flow Drips */}
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
            fontSize: '42px',
            color: '#fecaca',
            letterSpacing: '5px',
            textShadow: '0 0 30px #ef4444',
            margin: 0
          }}>
            THE HOUSE REMEMBERS
          </h2>
        </div>
      )}


      {/* ========================================================
          STAGE 3: Bloodstained Floorboard Letter & Key (Reference Image 3)
          "Now, you must find her." + Broken Typewriter Name Entry
      ======================================================== */}
      {stage === 'letter_scene' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'radial-gradient(circle at 50% 30%, #171c26 0%, #0a0e17 50%, #030408 100%)',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          {/* Moonlit Misty Window in Background (Reference Image 3) */}
          <div style={{
            position: 'absolute',
            top: '30px',
            width: '140px',
            height: '180px',
            border: '8px solid #1e293b',
            borderRadius: '4px',
            background: 'radial-gradient(circle at 50% 50%, #94a3b8 0%, #334155 70%, #0f172a 100%)',
            boxShadow: '0 0 80px rgba(148, 163, 184, 0.35)',
            opacity: 0.6,
            pointerEvents: 'none'
          }}>
            {/* Window crossbars */}
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', background: '#1e293b' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '4px', background: '#1e293b' }} />
          </div>

          {/* Decaying Wooden Floorboards Base */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '680px',
            width: '100%',
            background: 'rgba(16, 12, 22, 0.95)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '36px 44px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.95), 0 0 40px rgba(239, 68, 68, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>

            {/* Antique Iron Skeleton Key Icon (Reference Image 3) */}
            <div style={{
              fontSize: '44px',
              marginBottom: '10px',
              filter: 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.5))'
            }}>
              🗝️
            </div>

            {/* Bloodstained Letter Note from Reference Image 3 */}
            <div style={{
              background: '#f8fafc',
              backgroundImage: 'radial-gradient(circle at 75% 25%, #fecaca 0%, #fef08a 40%, #e2e8f0 100%)',
              color: '#0f172a',
              padding: '24px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
              transform: 'rotate(-1.5deg)',
              marginBottom: '28px',
              maxWidth: '480px',
              width: '100%'
            }}>
              <p style={{
                fontFamily: 'Cinzel Decorative, serif',
                fontSize: '24px',
                fontWeight: 900,
                color: '#7f1d1d',
                fontStyle: 'italic',
                margin: '0 0 6px 0',
                letterSpacing: '1px'
              }}>
                "Now, you must find her."
              </p>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                color: '#64748b'
              }}>
                — A message left beside the iron key on the wet floorboards.
              </span>
            </div>

            {/* Broken Typewriter Name Entry Input */}
            <label style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: '#f87171',
              letterSpacing: '2px',
              marginBottom: '10px',
              fontWeight: 700
            }}>
              WHO DARES TO ENTER? INSCRIBE YOUR NAME:
            </label>

            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter Investigator Name..."
              maxLength={24}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProceedToGates()
              }}
              style={{
                width: '100%',
                maxWidth: '380px',
                padding: '14px 20px',
                background: '#0a0812',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'Cinzel Decorative, serif',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '2px',
                outline: 'none',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8), 0 0 15px rgba(239, 68, 68, 0.25)',
                marginBottom: '24px'
              }}
            />

            {/* Pick Up Key Button */}
            <button
              onClick={handleProceedToGates}
              style={{
                padding: '14px 36px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '1px',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(220, 38, 38, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🗝️</span>
              <span>TAKE THE KEY & ENTER THE GATES</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
