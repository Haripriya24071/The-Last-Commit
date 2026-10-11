import React, { useEffect } from 'react'
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
    enterRoom,
    setRole,
    fetchMansionMap,
    fetchReport,
    setScreen,
    repoUrl
  } = useGameStore()

  useEffect(() => {
    document.body.style.cursor = 'default'
    if (document.pointerLockElement) {
      document.exitPointerLock?.()
    }
  }, [])

  const rooms = mansionMap || {
    library: { name: 'library', title: 'The Grand Library', description: 'Multi-tiered bookshelves and floating parchment storing core logic.', whisper: { signal: 'scratching' } },
    cellar: { name: 'cellar', title: 'The Forgotten Crypt', description: 'Cold stone vaults and dead memory allocations.', whisper: { signal: 'cold_spot' } },
    chapel: { name: 'chapel', title: 'The Corrupted Chapel', description: 'Fractured security shrines, auth tokens, and key leaks.', whisper: { signal: 'flickering_lights' } },
    study: { name: 'study', title: "The Alchemist's Study", description: 'Alembic vials, test scrolls, assertions, and edge-case experiments.', whisper: { signal: 'silence' } },
    attic: { name: 'attic', title: 'The Dust-Choked Attic', description: 'Discarded utilities, unused scripts, and abandoned legacy branches.', whisper: { signal: 'scratching' } },
  }

  const roomZoneTags = {
    library: 'WEST WING • ARCHITECTURE',
    cellar: 'SUBTERRANEAN • PERSISTENCE',
    chapel: 'SANCTUARY • SECURITY',
    study: 'EAST WING • INTEGRATION',
    attic: 'ROOF TOWER • DEAD CODE'
  }

  const roomImageMap = {
    library: '/assets/library_room.jpg',
    attic: '/assets/attic_room.jpg',
    study: '/assets/study_room_1.jpg',
    cellar: '/assets/portrait_hallway.jpg',
    chapel: '/assets/mansion_entrance.jpg'
  }

  const getRelicsInRoom = (roomName) => {
    return foundRelics.filter((r) => (r.room || 'attic') === roomName).length
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#040306',
      backgroundImage: 'url(/assets/mansion_blueprint_map.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflowY: 'auto',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px 36px',
      boxSizing: 'border-box'
    }}>
      {/* Dark Film Shadow Overlay so UI text is crisp */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4, 3, 6, 0.82)',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header Bar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(239, 68, 68, 0.4)',
          paddingBottom: '18px',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '28px',
              color: '#ef4444',
              margin: 0,
              letterSpacing: '2px',
              textShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
            }}>
              CURSED ESTATE BLUEPRINT
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '13px' }}>
              Architectural layout of the haunted codebase. Spend 1 Lantern Visit to infiltrate each chamber.
            </p>
          </div>

          {/* Tactical Game Lifeline Bar using Real Candle Images */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(12, 10, 18, 0.96)',
            padding: '10px 22px',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.9)'
          }}>
            {/* Lantern Visits Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                LANTERN VISITS:
              </span>
              <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                {lanternVisitsLeft} / 4
              </span>
            </div>

            {/* Candle Lifelines (Exact Candle Images from PDF) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '16px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>
                CANDLES:
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      width: '18px',
                      height: '28px',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      opacity: idx < lifelines ? 1 : 0.25,
                      filter: idx < lifelines ? 'drop-shadow(0 0 4px #fbbf24)' : 'grayscale(1)',
                      transition: 'all 0.3s'
                    }}
                  >
                    <img
                      src={idx < lifelines ? '/assets/candle_returns.jpg' : '/assets/candle_extinguished.jpg'}
                      alt="Candle"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Score */}
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '16px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>SCORE: </span>
              <span style={{ fontSize: '16px', color: '#fbbf24', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                {score}
              </span>
            </div>

            <button
              onClick={fetchReport}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer'
              }}
            >
              HAUNTING REPORT
            </button>
          </div>
        </header>

        {/* Role Bar */}
        <section style={{
          background: 'rgba(12, 10, 18, 0.9)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '12px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              ACTIVE SPECTRE:
            </span>
            {['ghost', 'reaper', 'skeleton'].map((r) => {
              const presence = rolePresence[r] || 'strong'
              const isSelected = role === r
              return (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r)
                    fetchMansionMap(repoUrl || 'sample')
                  }}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(25, 20, 32, 0.6)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    padding: '6px 14px',
                    color: isSelected ? '#38bdf8' : '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase'
                  }}
                >
                  {r.toUpperCase()} ({presence.toUpperCase()})
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setScreen('role_select')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#cbd5e1',
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            CHANGE SPECTRE
          </button>
        </section>

        {/* Interactive Mansion Chambers Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '22px'
        }}>
          {Object.entries(rooms).map(([roomKey, room]) => {
            const relicsCleansed = getRelicsInRoom(roomKey)
            const zoneTag = roomZoneTags[roomKey] || 'MANSION ZONE'

            return (
              <div
                key={roomKey}
                style={{
                  background: 'rgba(12, 10, 18, 0.94)',
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  borderRadius: '8px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.85)',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                <div>
                  {/* Chamber Visual Reference Preview */}
                  <div style={{
                    width: '100%',
                    height: '140px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '14px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    position: 'relative'
                  }}>
                    <img
                      src={roomImageMap[roomKey] || '/assets/library_room.jpg'}
                      alt={room.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(12,10,18,0.95) 0%, transparent 60%)'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{
                        fontSize: '9px',
                        color: '#ef4444',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 800,
                        letterSpacing: '1px'
                      }}>
                        {zoneTag}
                      </span>
                      <h3 style={{
                        margin: '2px 0 0 0',
                        fontFamily: 'Cinzel Decorative, serif',
                        fontSize: '20px',
                        color: '#fca5a5'
                      }}>
                        {room.title}
                      </h3>
                    </div>

                    {relicsCleansed > 0 && (
                      <span style={{
                        background: 'rgba(56, 189, 248, 0.2)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        fontSize: '10px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700
                      }}>
                        CLEANSED: {relicsCleansed}
                      </span>
                    )}
                  </div>

                  <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: 1.5, margin: '8px 0 16px 0' }}>
                    {room.description}
                  </p>
                </div>

                <button
                  disabled={lanternVisitsLeft <= 0 || isGameOver}
                  onClick={() => enterRoom(roomKey)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: lanternVisitsLeft > 0 && !isGameOver ? '#dc2626' : '#27272a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: lanternVisitsLeft > 0 && !isGameOver ? 'pointer' : 'not-allowed',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  ENTER CHAMBER (CONSUMES 1 VISIT)
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
