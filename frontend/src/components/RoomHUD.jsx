import React, { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { AudioEngine } from './AudioEngine'

export default function RoomHUD() {
  const {
    currentRoom,
    roomData,
    lifelines,
    lanternVisitsLeft,
    score,
    isPointerLocked,
    isGameOver,
    activeScare,
    activeRelicModal,
    lowQuality,
    reduceScares,
    warmth,
    hasRelicsRemaining,
    foundRelics,
    showReport,
    hauntingReport,
    clearScare,
    clearRelicModal,
    closeReport,
    toggleQuality,
    toggleReduceScares,
    fetchReport,
    returnToMap,
    resetGame,
    role
  } = useGameStore()

  const [showDrawer, setShowDrawer] = useState(false)

  // Listen for Escape key to return to map
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        returnToMap()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [returnToMap])

  // Heartbeat sound loop driven by /api/warmth
  useEffect(() => {
    if (warmth <= 0.05 || !hasRelicsRemaining || isGameOver) return

    // Interval shrinks as warmth approaches 1.0 (from 1600ms down to 350ms)
    const intervalMs = Math.max(350, Math.round(1600 - warmth * 1250))
    const timer = setInterval(() => {
      AudioEngine.playHeartbeat(0.3 + warmth * 0.7)
    }, intervalMs)

    return () => clearInterval(timer)
  }, [warmth, hasRelicsRemaining, isGameOver])

  // Play audio and auto-dismiss 1-second jump scares
  useEffect(() => {
    if (activeScare) {
      if (reduceScares) {
        AudioEngine.playHeartbeat(1.0)
      } else {
        AudioEngine.playJumpScare(activeScare)
      }

      const timer = setTimeout(() => {
        clearScare()
      }, reduceScares ? 600 : 1100)

      return () => clearTimeout(timer)
    }
  }, [activeScare, reduceScares, clearScare])

  // Play relic audio chime on discovery
  useEffect(() => {
    if (activeRelicModal) {
      AudioEngine.playRelicFound()
    }
  }, [activeRelicModal])

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
      
      {/* 1. Top HUD Bar */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(5,5,8,0.94), transparent)'
      }}>
        {/* Room Title & Return to Map Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', pointerEvents: 'auto' }}>
          <button
            onClick={returnToMap}
            title="Return to Cursed Blueprint (Esc)"
            style={{
              background: 'rgba(220, 38, 38, 0.25)',
              border: '1px solid #ef4444',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🗺️</span>
            <span>RETURN TO MAP (Esc)</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{
                fontFamily: 'Cinzel Decorative, serif',
                fontSize: '18px',
                color: '#f87171',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {roomData?.title || currentRoom}
              </h2>
              <span style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '4px',
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase'
              }}>
                {role}
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', color: '#9ca3af', fontSize: '11px' }}>
              {roomData?.description || 'Search for hidden code defects.'}
            </p>
          </div>
        </div>

        {/* Lifelines (4 Candles), Lantern Visits, Score, Relics & Toggles */}
        <div style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(18, 16, 26, 0.9)',
          padding: '8px 18px',
          borderRadius: '9999px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)'
        }}>
          {/* Lantern Visits Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>VISITS:</span>
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '14px',
                  opacity: idx < lanternVisitsLeft ? 1 : 0.2,
                  filter: idx < lanternVisitsLeft ? 'drop-shadow(0 0 5px #f59e0b)' : 'grayscale(1)'
                }}
              >
                🏮
              </span>
            ))}
          </div>

          {/* Candles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
            <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>CANDLES:</span>
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '16px',
                  opacity: idx < lifelines ? 1 : 0.2,
                  filter: idx < lifelines ? 'drop-shadow(0 0 6px rgba(245,158,11,0.9))' : 'grayscale(1)',
                  transition: 'opacity 0.3s, transform 0.2s',
                  transform: idx < lifelines ? 'scale(1)' : 'scale(0.85)'
                }}
              >
                🕯️
              </span>
            ))}
          </div>

          {/* Relics Cleansed Counter */}
          <button
            onClick={() => setShowDrawer(true)}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            ✨ RELICS: {foundRelics.length}
          </button>

          {/* Score */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>SCORE: </span>
            <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {score}
            </span>
          </div>

          {/* Reduce Scares Toggle */}
          <button
            onClick={toggleReduceScares}
            title="Toggle Mild Jump Scares"
            style={{
              background: reduceScares ? '#065f46' : '#27272a',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {reduceScares ? '🛡️ MILD SCARES' : '👻 FULL SCARES'}
          </button>

          {/* Fast 60FPS Quality Toggle */}
          <button
            onClick={toggleQuality}
            style={{
              background: lowQuality ? '#78350f' : '#27272a',
              color: '#fff',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {lowQuality ? '⚡ FAST (60FPS)' : '✨ HIGH'}
          </button>
        </div>
      </header>

      {/* 2. Permanent Wall Riddle Banner */}
      {roomData?.riddle && (
        <div style={{
          position: 'absolute',
          top: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          padding: '6px 20px',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.85)'
        }}>
          <span style={{ color: '#ef4444', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '1px' }}>
            📜 RIDDLE ON THE WALL:
          </span>
          <p style={{ margin: '2px 0 0 0', color: '#fca5a5', fontSize: '12px', fontStyle: 'italic' }}>
            "{roomData.riddle}"
          </p>
        </div>
      )}

      {/* 3. Dynamic Heartbeat Proximity Indicator */}
      {warmth > 0.1 && hasRelicsRemaining && (
        <div style={{
          position: 'absolute',
          top: '118px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(127, 29, 29, 0.7)',
          border: '1px solid #ef4444',
          borderRadius: '9999px',
          padding: '3px 14px',
          animation: 'candleFlicker 0.4s infinite'
        }}>
          <span style={{ fontSize: '13px' }}>💓</span>
          <span style={{ fontSize: '10px', color: '#fecaca', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            COLD CHILL NEARBY ({(warmth * 100).toFixed(0)}%)
          </span>
        </div>
      )}

      {/* 4. Center Crosshair (When Pointer Locked) */}
      {isPointerLocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '6px',
          height: '6px',
          background: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(255, 255, 255, 0.9)',
          pointerEvents: 'none'
        }} />
      )}

      {/* 5. Click to Enter / Lock Pointer Overlay */}
      {!isPointerLocked && !isGameOver && !activeRelicModal && !activeScare && !showReport && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(18, 16, 26, 0.92)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          padding: '14px 28px',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 30px rgba(0,0,0,0.9)'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 600 }}>
            🖱️ CLICK SCREEN TO ENTER FIRST-PERSON VIEW
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>
            WASD to Walk • Mouse to Look • Click floating files to test for bugs • Press Esc to return to map
          </p>
        </div>
      )}

      {/* 6. 6 Distinct Jump Scares (1-second duration) */}
      {activeScare && (
        <div
          onClick={clearScare}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            animation: reduceScares ? 'none' : 'shakeScreen 0.15s infinite',
            ...(activeScare === 'door_slam' && {
              background: 'radial-gradient(circle, rgba(185,28,28,0.96) 0%, rgba(0,0,0,0.98) 75%)'
            }),
            ...(activeScare === 'ghost_face' && {
              background: 'radial-gradient(circle, rgba(6,78,59,0.95) 0%, rgba(0,0,0,0.98) 75%)'
            }),
            ...(activeScare === 'lights_out' && {
              background: 'rgba(0, 0, 0, 0.99)'
            }),
            ...(activeScare === 'skeleton_pop' && {
              background: 'radial-gradient(circle, rgba(120,53,15,0.95) 0%, rgba(0,0,0,0.98) 75%)'
            }),
            ...(activeScare === 'mirror_shatter' && {
              background: 'radial-gradient(circle, rgba(30,58,138,0.95) 0%, rgba(0,0,0,0.98) 75%)'
            }),
            ...(activeScare === 'eerie_laughter' && {
              background: 'radial-gradient(circle, rgba(88,28,135,0.95) 0%, rgba(0,0,0,0.98) 75%)'
            })
          }}
        >
          {/* Scare Visual Icon */}
          <span style={{ fontSize: '110px', marginBottom: '12px', filter: 'drop-shadow(0 0 20px #ef4444)' }}>
            {activeScare === 'door_slam' && '🚪💥'}
            {activeScare === 'ghost_face' && '👻💀'}
            {activeScare === 'lights_out' && '🕯️❌'}
            {activeScare === 'skeleton_pop' && '🦴💀'}
            {activeScare === 'mirror_shatter' && '🪞⚡'}
            {activeScare === 'eerie_laughter' && '😈🦇'}
          </span>

          <h1 style={{
            fontFamily: 'Creepster, cursive',
            fontSize: '52px',
            color: '#fff',
            letterSpacing: '3px',
            textShadow: '0 0 24px #ef4444',
            margin: 0
          }}>
            {activeScare === 'door_slam' && 'DOOR SLAMS SHUT!'}
            {activeScare === 'ghost_face' && 'A PHANTOM LUNGES!'}
            {activeScare === 'lights_out' && 'THE FLAME DIES!'}
            {activeScare === 'skeleton_pop' && 'SKELETON IN THE CODE!'}
            {activeScare === 'mirror_shatter' && 'THE MIRROR SHATTERS!'}
            {activeScare === 'eerie_laughter' && 'DEMONIC LAUGHTER!'}
          </h1>
          <p style={{ color: '#fca5a5', fontSize: '16px', marginTop: '10px' }}>
            DECOY TRIGGERED! 1 candle was snuffed out ({lifelines} left).
          </p>
        </div>
      )}

      {/* 7. Relic Discovered Modal */}
      {activeRelicModal && (
        <div
          onClick={clearRelicModal}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 5, 8, 0.88)',
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
              padding: '30px',
              maxWidth: '560px',
              width: '90%',
              boxShadow: '0 0 40px rgba(56, 189, 248, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '32px' }}>✨</span>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Cinzel Decorative, serif', fontSize: '19px', color: '#38bdf8' }}>
                  CORRUPTED RELIC PURGED (+100 PTS)
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                  {activeRelicModal.file}:{activeRelicModal.line} • {activeRelicModal.type}
                </span>
              </div>
            </div>

            {/* Code Snippet */}
            <div style={{
              margin: '18px 0',
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
            <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, margin: '0 0 10px 0' }}>
              <strong>Why:</strong> {activeRelicModal.explanation}
            </p>
            <p style={{ color: '#86efac', fontSize: '13px', margin: 0 }}>
              <strong>Fix:</strong> {activeRelicModal.suggestion}
            </p>

            <button
              onClick={clearRelicModal}
              style={{
                marginTop: '22px',
                width: '100%',
                padding: '12px',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Continue Code Hunt
            </button>
          </div>
        </div>
      )}

      {/* 8. Soft Ending Screen (Game Over / Candles or Visits Depleted) */}
      {isGameOver && (
        <div
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(30,10,10,0.98) 0%, rgba(0,0,0,0.99) 90%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 60
          }}
        >
          <span style={{ fontSize: '70px', marginBottom: '16px' }}>💀🕯️</span>
          <h1 style={{
            fontFamily: 'Creepster, cursive',
            fontSize: '52px',
            color: '#ef4444',
            margin: 0,
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(239,68,68,0.6)'
          }}>
            THE HOUSE WINS THIS TIME
          </h1>
          <p style={{ color: '#d1d5db', fontSize: '16px', marginTop: '12px', maxWidth: '480px', textAlign: 'center' }}>
            {lifelines <= 0
              ? 'All four candles were snuffed out by decoys in the dark.'
              : 'Lantern oil depleted! No visits remaining to explore the rooms.'}
          </p>

          <div style={{
            margin: '24px 0',
            background: 'rgba(18, 16, 26, 0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '16px 32px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>
              RELICS CLEANSED: <strong style={{ color: '#38bdf8' }}>{foundRelics.length}</strong> • FINAL SCORE: <strong style={{ color: '#fbbf24' }}>{score}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <button
              onClick={() => {
                resetGame()
                returnToMap()
              }}
              style={{
                padding: '12px 28px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 Re-light Candles & Retry
            </button>
            <button
              onClick={fetchReport}
              style={{
                padding: '12px 28px',
                background: '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📜 View Haunting Report
            </button>
          </div>
        </div>
      )}

      {/* 9. Found Relics Slide-Out Drawer */}
      {showDrawer && (
        <div
          onClick={() => setShowDrawer(false)}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 35,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '380px',
              height: '100%',
              background: '#090d16',
              borderLeft: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '24px',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8', fontFamily: 'Cinzel Decorative, serif', fontSize: '18px' }}>
                ✨ CLEANSED RELICS ({foundRelics.length})
              </h3>
              <button
                onClick={() => setShowDrawer(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {foundRelics.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', fontStyle: 'italic' }}>
                No relics discovered yet. Explore the room and inspect suspicious objects.
              </p>
            ) : (
              foundRelics.map((r, i) => (
                <div key={i} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    {r.file}:{r.line}
                  </div>
                  <div style={{ fontSize: '11px', color: '#ef4444', margin: '4px 0', fontFamily: 'JetBrains Mono, monospace' }}>
                    {r.type}
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '6px' }}>
                    {r.explanation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 10. Comprehensive Haunting Report Modal */}
      {showReport && hauntingReport && (
        <div
          onClick={closeReport}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'rgba(5, 5, 8, 0.94)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 70
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#090d16',
              border: '2px solid #ef4444',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '680px',
              width: '90%',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '36px' }}>📜👑</span>
              <h2 style={{ margin: '8px 0 0 0', fontFamily: 'Cinzel Decorative, serif', color: '#ef4444', fontSize: '24px' }}>
                HAUNTING REPORT
              </h2>
              <h3 style={{ color: '#fbbf24', fontSize: '18px', margin: '6px 0 0 0' }}>
                {hauntingReport.rank_title}
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0 0' }}>
                {hauntingReport.rank_description}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              margin: '20px 0',
              textAlign: 'center'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>TOTAL RELICS</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8' }}>{hauntingReport.total_relics_in_mansion}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>CLEANSED</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#4ade80' }}>{hauntingReport.relics_found_count}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>FINAL SCORE</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#fbbf24' }}>{hauntingReport.score}</div>
              </div>
            </div>

            {/* Revealed Missed Relics after game finishes */}
            {hauntingReport.is_game_finished && hauntingReport.relics_missed && hauntingReport.relics_missed.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#f87171', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace' }}>
                  👻 LURKING SPIRITS MISSED ({hauntingReport.relics_missed.length}):
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {hauntingReport.relics_missed.map((m, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '6px',
                      padding: '10px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'JetBrains Mono, monospace' }}>
                        {m.file}:{m.line} ({m.type})
                      </div>
                      <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>
                        {m.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={closeReport}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


