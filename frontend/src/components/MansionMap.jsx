import React, { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { AudioEngine } from './AudioEngine'

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
    enterRoom,
    setRole,
    fetchMansionMap,
    fetchReport,
    toggleQuality,
    setScreen,
    repoUrl,
    playerName
  } = useGameStore()

  // Ensure mouse cursor is free and normal when returning to map
  useEffect(() => {
    document.body.style.cursor = 'default'
    if (document.pointerLockElement) {
      document.exitPointerLock?.()
    }
  }, [])

  const rooms = mansionMap || {
    library: { name: 'library', title: 'The Grand Library', description: 'Towering mahogany shelves and floating parchment storing core logic.', whisper: { signal: 'scratching', intensity: 2 } },
    cellar: { name: 'cellar', title: 'The Forgotten Crypt', description: 'Cold stone flagstones, vaults, and dead memory allocations.', whisper: { signal: 'cold_spot', intensity: 3 } },
    chapel: { name: 'chapel', title: 'The Corrupted Chapel', description: 'Stained glass windows, fractured security shrines, and token leaks.', whisper: { signal: 'flickering_lights', intensity: 1 } },
    study: { name: 'study', title: "The Alchemist's Study", description: 'Alembic vials, test scrolls, assertions, and edge-case experiments.', whisper: { signal: 'silence', intensity: 0 } },
    attic: { name: 'attic', title: 'The Dust-Choked Attic', description: 'Discarded utilities, unused scripts, and abandoned legacy branches.', whisper: { signal: 'scratching', intensity: 1 } },
  }

  const roomZoneTags = {
    library: 'WEST WING • ARCHITECTURE',
    cellar: 'SUBTERRANEAN • PERSISTENCE',
    chapel: 'SANCTUARY • SECURITY',
    study: 'EAST WING • INTEGRATION',
    attic: 'ROOF TOWER • DEAD CODE'
  }

  const whisperIcons = {
    cold_spot: '❄️ Sub-zero Cold Spot detected',
    scratching: '🐀 Scratching inside the stone walls',
    flickering_lights: '🕯️ Torches sputtering violently',
    silence: '🌫️ Eerie supernatural silence'
  }

  const getRelicsInRoom = (roomName) => {
    return foundRelics.filter((r) => (r.room || 'attic') === roomName).length
  }

  const handleEnter = (roomKey) => {
    AudioEngine.playDoorCreak()
    enterRoom(roomKey)
  }

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #171324 0%, #08060d 70%, #030205 100%)',
      overflowY: 'auto',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px 36px',
      boxSizing: 'border-box'
    }}>
      {/* Background Architectural Blueprint Grid Lines */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(239, 68, 68, 0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(239, 68, 68, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* 1. Header Bar: Victorian Estate Title & Lifelines / Oil Status */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(239, 68, 68, 0.3)',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '32px', filter: 'drop-shadow(0 0 10px #ef4444)' }}>🏰</span>
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
                  Architectural floorplan of the haunted codebase. Spend 1 Lantern Visit to infiltrate each wing.
                </p>
              </div>
            </div>
          </div>

          {/* Tactical Game Lifeline Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'rgba(20, 16, 32, 0.95)',
            padding: '12px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8)'
          }}>
            {/* Lantern Oil Visits */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                LANTERN VISITS:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    title={`Lantern Visit ${idx + 1}`}
                    style={{
                      fontSize: '20px',
                      opacity: idx < lanternVisitsLeft ? 1 : 0.18,
                      filter: idx < lanternVisitsLeft ? 'drop-shadow(0 0 8px #f59e0b)' : 'grayscale(1)',
                      transition: 'all 0.3s'
                    }}
                  >
                    🏮
                  </span>
                ))}
              </div>
            </div>

            {/* Candle Lifelines */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '18px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>
                LIFELINES:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    title={`Candle ${idx + 1}`}
                    style={{
                      fontSize: '18px',
                      opacity: idx < lifelines ? 1 : 0.18,
                      filter: idx < lifelines ? 'drop-shadow(0 0 8px #fbbf24)' : 'grayscale(1)',
                      animation: idx < lifelines ? 'candleFlicker 2.5s infinite' : 'none'
                    }}
                  >
                    🕯️
                  </span>
                ))}
              </div>
            </div>

            {/* Score */}
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '18px' }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>SCORE: </span>
              <span style={{ fontSize: '18px', color: '#fbbf24', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                {score}
              </span>
            </div>

            <button
              onClick={() => {
                AudioEngine.playUiClick()
                fetchReport()
              }}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(220, 38, 38, 0.4)'
              }}
            >
              📜 HAUNTING REPORT
            </button>
          </div>
        </header>

        {/* 2. Role Specialization Banner */}
        <section style={{
          background: 'rgba(18, 14, 28, 0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '14px',
          padding: '14px 24px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              HERALDIC ROLE:
            </span>
            {['ghost', 'reaper', 'skeleton'].map((r) => {
              const presence = rolePresence[r] || 'strong'
              const isSelected = role === r
              return (
                <button
                  key={r}
                  onClick={() => {
                    AudioEngine.playUiClick()
                    setRole(r)
                    fetchMansionMap(repoUrl || 'sample')
                  }}
                  onMouseEnter={() => AudioEngine.playUiHover()}
                  style={{
                    background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 24, 42, 0.6)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: isSelected ? '#38bdf8' : '#94a3b8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    textTransform: 'uppercase',
                    boxShadow: isSelected ? '0 0 15px rgba(56, 189, 248, 0.3)' : 'none'
                  }}
                >
                  <span>{r === 'ghost' ? '👻 Ghost (Logic Bugs)' : r === 'reaper' ? '💀 Reaper (Security)' : '🦴 Skeleton (Debt)'}</span>
                  <span style={{
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: presence === 'strong' ? '#065f46' : '#854d0e',
                    color: '#fff',
                    fontWeight: 800
                  }}>
                    {presence.toUpperCase()}
                  </span>
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => {
                AudioEngine.playUiClick()
                setScreen('role_select')
              }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#cbd5e1',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              ← CHANGE ROLE
            </button>
            <button
              onClick={() => {
                AudioEngine.playUiClick()
                toggleQuality()
              }}
              style={{
                background: lowQuality ? '#78350f' : '#1e293b',
                color: '#fff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              {lowQuality ? '⚡ FAST PERFORMANCE' : '✨ CINEMATIC SHADERS'}
            </button>
          </div>
        </section>

        {/* 3. Interactive Blueprint Architectural Floorplan Rooms */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {Object.entries(rooms).map(([roomKey, room]) => {
            const relicsCleansed = getRelicsInRoom(roomKey)
            const signalKey = room.whisper?.signal || 'silence'
            const signalText = whisperIcons[signalKey] || '🌫️ Eerie Silence'
            const zoneTag = roomZoneTags[roomKey] || 'MANSION ZONE'

            return (
              <div
                key={roomKey}
                onMouseEnter={() => AudioEngine.playUiHover()}
                style={{
                  background: 'rgba(20, 16, 32, 0.94)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '16px',
                  padding: '24px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                  transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s'
                }}
              >
                <div>
                  {/* Top Bar with Blueprint Coordinates */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <span style={{
                        fontSize: '10px',
                        color: '#ef4444',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 800,
                        letterSpacing: '1px'
                      }}>
                        {zoneTag}
                      </span>
                      <h3 style={{
                        margin: '4px 0 0 0',
                        fontFamily: 'Cinzel Decorative, serif',
                        fontSize: '20px',
                        color: '#fca5a5'
                      }}>
                        {room.title}
                      </h3>
                    </div>

                    {/* Relics Cleansed Badge */}
                    {relicsCleansed > 0 && (
                      <span style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 700
                      }}>
                        ✨ {relicsCleansed} Cleansed
                      </span>
                    )}
                  </div>

                  {/* Lore Description */}
                  <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.5, margin: '8px 0 16px 0' }}>
                    {room.description}
                  </p>

                  {/* Atmospheric Whisper Radar */}
                  <div style={{
                    background: 'rgba(32, 24, 46, 0.75)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ fontSize: '10px', color: '#f87171', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
                      PARANORMAL SIGNAL:
                    </div>
                    <div style={{ fontSize: '12px', color: '#fecaca', marginTop: '3px', fontWeight: 600 }}>
                      {signalText}
                    </div>
                  </div>
                </div>

                {/* Tactile Enter Room Action Button */}
                <button
                  disabled={lanternVisitsLeft <= 0 || isGameOver}
                  onClick={() => handleEnter(roomKey)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: lanternVisitsLeft > 0 && !isGameOver ? '#dc2626' : '#27272a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: lanternVisitsLeft > 0 && !isGameOver ? 'pointer' : 'not-allowed',
                    fontFamily: 'Inter, sans-serif',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: lanternVisitsLeft > 0 && !isGameOver ? '0 0 20px rgba(220, 38, 38, 0.5)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🏮</span>
                  <span>ENTER ROOM (Spend 1 Lantern Visit)</span>
                </button>
              </div>
            )
          })}
        </div>

        {/* 4. Oil Depleted Warning Banner */}
        {lanternVisitsLeft <= 0 && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(185, 28, 28, 0.98)',
            border: '2px solid #f87171',
            borderRadius: '16px',
            padding: '20px 36px',
            textAlign: 'center',
            boxShadow: '0 0 40px rgba(0,0,0,0.95)',
            zIndex: 50
          }}>
            <h4 style={{ margin: 0, fontFamily: 'Cinzel Decorative, serif', fontSize: '20px', color: '#fff' }}>
              LANTERN VISITS EXHAUSTED!
            </h4>
            <p style={{ margin: '6px 0 16px 0', fontSize: '13px', color: '#fecaca' }}>
              Your lantern has run out of oil. The spirits seal the doors of the estate.
            </p>
            <button
              onClick={() => {
                AudioEngine.playUiClick()
                fetchReport()
              }}
              style={{
                padding: '10px 24px',
                background: '#fff',
                color: '#991b1b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              📜 View Haunting Report
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
