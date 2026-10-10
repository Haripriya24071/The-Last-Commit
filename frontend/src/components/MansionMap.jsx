import React from 'react'
import { useGameStore } from '../store/gameStore'

export default function MansionMap() {
  const {
    mansionMap,
    lanternVisitsLeft,
    lifelines,
    score,
    foundRelics,
    role,
    rolePresence,
    isGameOver,
    lowQuality,
    isScanning,
    enterRoom,
    setRole,
    fetchMansionMap,
    fetchReport,
    toggleQuality,
    resetGame,
    setScreen,
    repoUrl,
    playerName
  } = useGameStore()

  const rooms = mansionMap || {
    library: { name: 'library', title: 'The Grand Library', description: 'Towering bookshelves and floating parchment.', whisper: { signal: 'scratching', intensity: 2 } },
    cellar: { name: 'cellar', title: 'The Forgotten Crypt', description: 'Cold flagstones and locked database vaults.', whisper: { signal: 'cold_spot', intensity: 3 } },
    chapel: { name: 'chapel', title: 'The Corrupted Chapel', description: 'Stained glass windows and security shrines.', whisper: { signal: 'flickering_lights', intensity: 1 } },
    study: { name: 'study', title: "The Alchemist's Study", description: 'Alembic vials, test scrolls, and test suites.', whisper: { signal: 'silence', intensity: 0 } },
    attic: { name: 'attic', title: 'The Dust-Choked Attic', description: 'Discarded utilities and forgotten scripts.', whisper: { signal: 'scratching', intensity: 1 } },
  }

  const whisperIcons = {
    cold_spot: '❄️ Cold Spot',
    scratching: '🐀 Scratching in Walls',
    flickering_lights: '🕯️ Flickering Torches',
    silence: '🌫️ Eerie Silence'
  }

  // Count relics cleansed per room
  const getRelicsInRoom = (roomName) => {
    return foundRelics.filter((r) => (r.room || 'attic') === roomName).length
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #15111e 0%, #060409 100%)',
      overflowY: 'auto',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px 32px',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. Header Bar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
        paddingBottom: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🏰</span>
            <h1 style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '26px',
              color: '#ef4444',
              margin: 0,
              letterSpacing: '2px',
              textShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
            }}>
              CURSED MANSION BLUEPRINT
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '13px' }}>
            Select a room to investigate. Each entry consumes 1 Lantern Visit.
          </p>
        </div>

        {/* Lantern Visits & Candles Lifelines */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          background: 'rgba(24, 20, 36, 0.9)',
          padding: '10px 24px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
        }}>
          {/* Lantern Visits */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              LANTERN VISITS:
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '18px',
                    opacity: idx < lanternVisitsLeft ? 1 : 0.2,
                    filter: idx < lanternVisitsLeft ? 'drop-shadow(0 0 6px #f59e0b)' : 'grayscale(1)'
                  }}
                >
                  🏮
                </span>
              ))}
            </div>
          </div>

          {/* Candle Lifelines */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>CANDLES:</span>
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '16px',
                  opacity: idx < lifelines ? 1 : 0.2,
                  filter: idx < lifelines ? 'drop-shadow(0 0 6px #fbbf24)' : 'grayscale(1)'
                }}
              >
                🕯️
              </span>
            ))}
          </div>

          {/* Score */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>SCORE: </span>
            <span style={{ fontSize: '16px', color: '#fbbf24', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {score}
            </span>
          </div>

          <button
            onClick={fetchReport}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📜 HAUNTING REPORT
          </button>
        </div>
      </header>

      {/* 2. Role Selection & Presence Bar */}
      <section style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '14px 20px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>ACTIVE ROLE:</span>
          {['ghost', 'reaper', 'skeleton'].map((r) => {
            const presence = rolePresence[r] || 'faint'
            const isSelected = role === r
            return (
              <button
                key={r}
                onClick={() => {
                  setRole(r)
                  fetchMansionMap(repoUrl || 'sample')
                }}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase'
                }}
              >
                <span>{r === 'ghost' ? '👻 Ghost' : r === 'reaper' ? '💀 Reaper' : '🦴 Skeleton'}</span>
                <span style={{
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: presence === 'strong' ? '#065f46' : presence === 'faint' ? '#854d0e' : '#4b5563',
                  color: '#fff'
                }}>
                  {presence === 'strong' ? 'STRONG' : presence === 'faint' ? 'FAINT' : 'NONE'}
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setScreen('role_select')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#9ca3af',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            ← ROLES
          </button>
          <button
            onClick={toggleQuality}
            style={{
              background: lowQuality ? '#78350f' : '#1e293b',
              color: '#fff',
              border: 'none',
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {lowQuality ? '⚡ FAST 60FPS' : '✨ HIGH QUALITY'}
          </button>
        </div>
      </section>

      {/* 3. 2D Blueprint Mansion Rooms Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {Object.entries(rooms).map(([roomKey, room]) => {
          const relicsCleansed = getRelicsInRoom(roomKey)
          const signalKey = room.whisper?.signal || 'silence'
          const signalText = whisperIcons[signalKey] || '🌫️ Silence'

          return (
            <div
              key={roomKey}
              style={{
                background: 'rgba(18, 16, 28, 0.92)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
            >
              {/* Top Banner */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontFamily: 'Cinzel Decorative, serif',
                      fontSize: '18px',
                      color: '#f87171'
                    }}>
                      {room.title}
                    </h3>
                    <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                      ZONE: {roomKey}
                    </span>
                  </div>

                  {/* Relics Cleansed Badge */}
                  {relicsCleansed > 0 && (
                    <span style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid #38bdf8',
                      color: '#38bdf8',
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}>
                      ✨ {relicsCleansed} Cleaned
                    </span>
                  )}
                </div>

                <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.4, margin: '8px 0 16px 0' }}>
                  {room.description}
                </p>

                {/* Whisper Hint (Atmospheric only, no counts leaked) */}
                <div style={{
                  background: 'rgba(30, 27, 45, 0.7)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '10px', color: '#f87171', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                    ATMOSPHERIC WHISPER:
                  </div>
                  <div style={{ fontSize: '12px', color: '#fca5a5', marginTop: '2px' }}>
                    {signalText}
                  </div>
                </div>
              </div>

              {/* Enter Room Action */}
              <button
                disabled={lanternVisitsLeft <= 0 || isGameOver}
                onClick={() => enterRoom(roomKey)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: lanternVisitsLeft > 0 && !isGameOver ? '#dc2626' : '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: lanternVisitsLeft > 0 && !isGameOver ? 'pointer' : 'not-allowed',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🏮 Enter Room (Uses 1 Visit)</span>
              </button>
            </div>
          )
        })}
      </div>

      {/* 4. Lantern Oil Depleted Banner */}
      {lanternVisitsLeft <= 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(185, 28, 28, 0.95)',
          border: '2px solid #f87171',
          borderRadius: '12px',
          padding: '16px 32px',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(0,0,0,0.9)',
          zIndex: 40
        }}>
          <h4 style={{ margin: 0, fontFamily: 'Cinzel Decorative, serif', fontSize: '18px', color: '#fff' }}>
            LANTERN OIL DEPLETED!
          </h4>
          <p style={{ margin: '4px 0 12px 0', fontSize: '13px', color: '#fecaca' }}>
            You have exhausted all 4 lantern visits. The mansion doors seal shut.
          </p>
          <button
            onClick={fetchReport}
            style={{
              padding: '8px 20px',
              background: '#fff',
              color: '#991b1b',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📜 View Haunting Report
          </button>
        </div>
      )}
    </div>
  )
}
