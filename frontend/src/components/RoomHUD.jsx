import React from 'react'
import { useGameStore } from '../store/gameStore'

export default function RoomHUD() {
  const {
    currentRoom,
    roomData,
    lifelines,
    score,
    isPointerLocked,
    isGameOver,
    activeScare,
    activeRelicModal,
    lowQuality,
    isDevMode,
    clearScare,
    clearRelicModal,
    toggleQuality,
    toggleDevMode,
    fetchRoom,
    scanId,
    role,
    setRole
  } = useGameStore()

  const roomList = ['library', 'cellar', 'chapel', 'study', 'attic']

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      
      {/* 1. Top HUD Bar */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(5,5,8,0.92), transparent)'
      }}>
        {/* Room Title & Role Voice */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🕯️</span>
            <h2 style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '20px',
              color: '#f87171',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {roomData?.title || currentRoom}
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', color: '#9ca3af', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
            {roomData?.description || 'Search the room for corrupted relics.'}
          </p>
        </div>

        {/* Lifelines (4 Candles) & Score Pill */}
        <div style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          background: 'rgba(18, 16, 26, 0.85)',
          padding: '8px 20px',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)'
        }}>
          {/* Candles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>CANDLES:</span>
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '18px',
                  opacity: idx < lifelines ? 1 : 0.2,
                  filter: idx < lifelines ? 'drop-shadow(0 0 6px rgba(245,158,11,0.8))' : 'grayscale(1)',
                  transition: 'opacity 0.3s'
                }}
              >
                🕯️
              </span>
            ))}
          </div>

          {/* Score */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>SCORE: </span>
            <span style={{ fontSize: '15px', color: '#fbbf24', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {score}
            </span>
          </div>

          {/* Quality Toggle */}
          <button
            onClick={toggleQuality}
            style={{
              background: lowQuality ? '#78350f' : '#27272a',
              color: '#fff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {lowQuality ? '⚡ FAST (60FPS)' : '✨ HIGH'}
          </button>
        </div>
      </header>

      {/* 2. Wall Riddle Banner */}
      {roomData?.riddle && (
        <div style={{
          position: 'absolute',
          top: '84px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          padding: '8px 24px',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.8)'
        }}>
          <span style={{ color: '#ef4444', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '1px' }}>
            📜 RIDDLE ON THE WALL:
          </span>
          <p style={{ margin: '2px 0 0 0', color: '#fca5a5', fontSize: '13px', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>
            "{roomData.riddle}"
          </p>
        </div>
      )}

      {/* 3. Center Crosshair (When Pointer Locked) */}
      {isPointerLocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '6px',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
          pointerEvents: 'none'
        }} />
      )}

      {/* 4. Click to Enter / Lock Pointer Overlay */}
      {!isPointerLocked && !isGameOver && !activeRelicModal && !activeScare && (
        <div style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(18, 16, 26, 0.9)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          padding: '16px 32px',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 30px rgba(0,0,0,0.9)'
        }}>
          <p style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
            🖱️ CLICK SCREEN TO ENTER FIRST-PERSON VIEW
          </p>
          <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>
            WASD / Arrow Keys to Walk • Move Mouse to Look • Click glowing objects to inspect
          </p>
        </div>
      )}

      {/* 5. Jump Scare Screen Overlay */}
      {activeScare && (
        <div
          onClick={clearScare}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(185,28,28,0.95) 0%, rgba(0,0,0,0.98) 80%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50,
            cursor: 'pointer',
            animation: 'candleFlicker 0.2s infinite'
          }}
        >
          <span style={{ fontSize: '100px', marginBottom: '16px' }}>💀</span>
          <h1 style={{
            fontFamily: 'Creepster, cursive',
            fontSize: '56px',
            color: '#fff',
            letterSpacing: '4px',
            textShadow: '0 0 20px #ef4444',
            margin: 0
          }}>
            DECOY TRIGGERED!
          </h1>
          <p style={{ color: '#fca5a5', fontSize: '18px', fontFamily: 'Inter, sans-serif', marginTop: '12px' }}>
            The mansion screams at you. One candle was snuffed out.
          </p>
          <span style={{ marginTop: '24px', fontSize: '13px', color: '#cbd5e1', fontFamily: 'JetBrains Mono, monospace' }}>
            (Click anywhere to continue)
          </span>
        </div>
      )}

      {/* 6. Relic Discovered Modal */}
      {activeRelicModal && (
        <div
          onClick={clearRelicModal}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 5, 8, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 40
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '2px solid #38bdf8',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '540px',
              width: '90%',
              boxShadow: '0 0 40px rgba(56, 189, 248, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>✨</span>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Cinzel Decorative, serif', fontSize: '20px', color: '#38bdf8' }}>
                  RELIC PURGED (+100 PTS)
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                  {activeRelicModal.file}:{activeRelicModal.line} ({activeRelicModal.type})
                </span>
              </div>
            </div>

            {/* Code Snippet */}
            <div style={{
              margin: '20px 0',
              background: '#020617',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              color: '#f87171'
            }}>
              <code>{activeRelicModal.snippet}</code>
            </div>

            {/* Explanation & Fix Suggestion */}
            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.5, margin: '0 0 12px 0' }}>
              <strong>Why:</strong> {activeRelicModal.explanation}
            </p>
            <p style={{ color: '#86efac', fontSize: '13px', margin: 0 }}>
              <strong>Suggestion:</strong> {activeRelicModal.suggestion}
            </p>

            <button
              onClick={clearRelicModal}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              Continue Hunt
            </button>
          </div>
        </div>
      )}

      {/* 7. Dev Mode Room Switcher Bar (Bottom Bar) */}
      <footer style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to top, rgba(5,5,8,0.95), transparent)'
      }}>
        {/* Dev Mode Room Switcher */}
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>
            🏰 DEV ROOMS:
          </span>
          {roomList.map((rm) => (
            <button
              key={rm}
              onClick={() => fetchRoom(scanId, rm)}
              style={{
                background: currentRoom === rm ? '#dc2626' : 'rgba(39, 39, 42, 0.8)',
                color: currentRoom === rm ? '#fff' : '#9ca3af',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                fontWeight: currentRoom === rm ? 700 : 400
              }}
            >
              {rm}
            </button>
          ))}
        </div>

        {/* Role Selector in Dev Mode */}
        <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>ROLE:</span>
          {['ghost', 'reaper', 'skeleton'].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r)
                fetchRoom(null, currentRoom) // Re-fetch with new role
              }}
              style={{
                background: role === r ? '#0284c7' : 'rgba(39, 39, 42, 0.8)',
                color: role === r ? '#fff' : '#9ca3af',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                fontWeight: role === r ? 700 : 400
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </footer>
    </div>
  )
}
