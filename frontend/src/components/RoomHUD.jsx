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
    role,
    brightness,
    setBrightness,
    isMuted,
    toggleMute,
    enableSkeletonVoice,
    toggleSkeletonVoice,
    focusedObject,
    interactFocusedObject,
    warmth
  } = useGameStore()

  const [showDrawer, setShowDrawer] = useState(false)
  const [showPauseMenu, setShowPauseMenu] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Track mouse coordinates for realistic carried candle swaying
  useEffect(() => {
    const handlePointerMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      })
    }
    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])

  // Escape key toggles pause menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        setShowPauseMenu((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Scare asset dictionary using the user's exact visual reference images
  const scareVisualMap = {
    door_slam: {
      image: '/assets/portrait_hallway.jpg',
      title: 'THE DOOR SLAMS SHUT',
      subtitle: 'The corridor echoes with hollow footsteps.'
    },
    ghost_face: {
      image: '/assets/ghost_character.jpg',
      title: 'A VEILED PHANTOM LUNGES',
      subtitle: 'The lady of the staircase whispers of dead code.'
    },
    lights_out: {
      image: '/assets/candle_extinguished.jpg',
      title: 'THE FLAME IS SNUFFED OUT',
      subtitle: 'Cold darkness engulfs your vision.'
    },
    skeleton_pop: {
      image: '/assets/skeleton_character.jpg',
      title: 'THE ROOT BEAST AWAKENS',
      subtitle: 'Rotting algorithmic tendrils surge forward.'
    },
    mirror_shatter: {
      image: '/assets/repo_frame_staircase.jpg',
      title: 'THE SHATTERED REFLECTION',
      subtitle: 'The cursed frame cracks down the center.'
    },
    eerie_laughter: {
      image: '/assets/reaper_character.jpg',
      title: 'THE SHADOW REAPER DESCENDS',
      subtitle: 'Tattered cowls billow through the mist.'
    }
  }

  const currentScareVisual = activeScare ? (scareVisualMap[activeScare] || scareVisualMap.lights_out) : null

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 20,
      fontFamily: 'Inter, sans-serif',
      color: '#e5e7eb'
    }}>

      {/* ========================================================
          1. TOP NAVIGATION & STATUS BAR
      ======================================================== */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        zIndex: 22
      }}>
        {/* Left: Return to Map & Chamber Identification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', pointerEvents: 'auto' }}>
          <button
            onClick={returnToMap}
            style={{
              background: 'rgba(12, 10, 18, 0.92)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '1px'
            }}
          >
            ← RETURN TO BLUEPRINT
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
                fontSize: '9px',
                padding: '2px 8px',
                borderRadius: '2px',
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                fontWeight: 800
              }}>
                {role}
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', color: '#9ca3af', fontSize: '11px' }}>
              {roomData?.description || 'Search the chamber for corrupted relics.'}
            </p>
          </div>
        </div>

        {/* Right: Visits, Real Image Candle Lifelines, Score, Controls */}
        <div style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'rgba(12, 10, 18, 0.94)',
          padding: '6px 18px',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)'
        }}>
          {/* Lantern Infiltrations */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>VISITS:</span>
            {[0, 1, 2, 3].map((idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 900,
                  color: idx < lanternVisitsLeft ? '#f59e0b' : '#334155',
                  padding: '2px 5px',
                  background: idx < lanternVisitsLeft ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.02)',
                  borderRadius: '2px'
                }}
              >
                {idx + 1}
              </span>
            ))}
          </div>

          {/* Candle Lifelines (Exact Reference Images 11 & 10) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '12px' }}>
            <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>CANDLES:</span>
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                style={{
                  width: '16px',
                  height: '24px',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  opacity: idx < lifelines ? 1 : 0.25,
                  filter: idx < lifelines ? 'drop-shadow(0 0 4px #fbbf24)' : 'grayscale(1)',
                  transition: 'all 0.3s'
                }}
              >
                <img
                  src={idx < lifelines ? '/assets/candle_returns.jpg' : '/assets/candle_extinguished.jpg'}
                  alt="Candle Lifeline"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
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
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700
            }}
          >
            RELICS: {foundRelics.length}
          </button>

          {/* Score */}
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '10px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>SCORE: </span>
            <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
              {score}
            </span>
          </div>

          {/* Skeleton Voice Toggle */}
          <button
            onClick={toggleSkeletonVoice}
            style={{
              background: enableSkeletonVoice ? '#7c2d12' : '#1e1b2e',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {enableSkeletonVoice ? 'VOICE: ON' : 'VOICE: OFF'}
          </button>

          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            style={{
              background: isMuted ? '#991b1b' : '#1e1b2e',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {isMuted ? 'MUTED' : 'AUDIO'}
          </button>

          {/* Brightness Adjuster */}
          <button
            onClick={() => setBrightness(brightness >= 1.6 ? 0.9 : brightness + 0.3)}
            style={{
              background: '#1e1b2e',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            LIGHT: {brightness.toFixed(1)}x
          </button>

          {/* Scare Intensity Toggle */}
          <button
            onClick={toggleReduceScares}
            style={{
              background: reduceScares ? '#065f46' : '#1e1b2e',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {reduceScares ? 'MILD HORROR' : 'FULL HORROR'}
          </button>

          {/* Perf Quality Toggle */}
          <button
            onClick={toggleQuality}
            style={{
              background: lowQuality ? '#78350f' : '#1e1b2e',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {lowQuality ? 'PERF: 60FPS' : 'PERF: HIGH'}
          </button>
        </div>
      </header>

      {/* ========================================================
          2. PERMANENT WALL RIDDLE BANNER
      ======================================================== */}
      {roomData?.riddle && (
        <div style={{
          position: 'absolute',
          top: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(12, 10, 18, 0.92)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '4px',
          padding: '8px 24px',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.85)'
        }}>
          <span style={{ color: '#ef4444', fontSize: '10px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, letterSpacing: '2px' }}>
            [CRYPTIC INSCRIPTION ON MASONRY]
          </span>
          <p style={{ margin: '4px 0 0 0', color: '#fca5a5', fontSize: '13px', fontStyle: 'italic' }}>
            "{roomData.riddle}"
          </p>
        </div>
      )}

      {/* ========================================================
          CLICK TO ENTER 3D CHAMBER (FIRST-PERSON LOCK OVERLAY)
      ======================================================== */}
      {!isPointerLocked && !isGameOver && !showPauseMenu && (
        <div
          onClick={() => {
            const canvas = document.querySelector('canvas')
            canvas?.requestPointerLock?.()
            AudioEngine.unlock()
          }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(4, 3, 6, 0.55)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 32
          }}
        >
          <div style={{
            background: 'rgba(12, 10, 18, 0.96)',
            border: '2px solid rgba(239, 68, 68, 0.7)',
            borderRadius: '10px',
            padding: '28px 42px',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(0,0,0,0.95), 0 0 30px rgba(239, 68, 68, 0.35)',
            animation: 'pulseBox 2s ease-in-out infinite alternate'
          }}>
            <h3 style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '24px',
              color: '#fca5a5',
              margin: '0 0 10px 0',
              letterSpacing: '2px'
            }}>
              CLICK TO TAKE CONTROL
            </h3>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: '#cbd5e1',
              margin: '0 0 18px 0',
              lineHeight: 1.5
            }}>
              WASD: Walk • Mouse: 360° Free Look • Left Click / [E]: Inspect Code Anomaly • [ESC]: Pause
            </p>
            <div style={{
              display: 'inline-block',
              padding: '10px 28px',
              background: '#dc2626',
              color: '#fff',
              borderRadius: '4px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.7)'
            }}>
              CLICK TO ENTER 3D CHAMBER →
            </div>
          </div>
          <style>{`
            @keyframes pulseBox {
              0% { transform: scale(0.98); box-shadow: 0 0 40px rgba(0,0,0,0.9); }
              100% { transform: scale(1.02); box-shadow: 0 0 60px rgba(239, 68, 68, 0.45); }
            }
          `}</style>
        </div>
      )}

      {/* ========================================================
          HEARTBEAT PROXIMITY RADAR WIDGET (Bottom-Left)
      ======================================================== */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '24px',
        background: 'rgba(12, 10, 18, 0.92)',
        border: `1px solid ${warmth > 0.5 ? '#ef4444' : warmth > 0.2 ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '6px',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: warmth > 0.5 ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 4px 16px rgba(0,0,0,0.8)',
        zIndex: 22,
        pointerEvents: 'auto',
        transition: 'all 0.3s ease'
      }}>
        {/* Pulsing EKG Heart Icon */}
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: warmth > 0.6 ? '#ef4444' : warmth > 0.2 ? '#f59e0b' : '#38bdf8',
          boxShadow: `0 0 12px ${warmth > 0.6 ? '#ef4444' : '#38bdf8'}`,
          animation: `pulseHeart ${Math.max(0.4, 1.3 - (warmth || 0) * 0.85)}s infinite ease-in-out`
        }} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
              HEARTBEAT RADAR:
            </span>
            <span style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              color: warmth > 0.6 ? '#ef4444' : warmth > 0.2 ? '#f59e0b' : '#38bdf8'
            }}>
              {72 + Math.round((warmth || 0) * 88)} BPM
            </span>
          </div>
          <span style={{
            fontSize: '9px',
            fontFamily: 'JetBrains Mono, monospace',
            color: warmth > 0.6 ? '#fca5a5' : '#6b7280',
            letterSpacing: '1px'
          }}>
            {warmth > 0.7 ? 'CRITICAL PROXIMITY • RELIC NEARBY' : warmth > 0.35 ? 'WARM • ENTITY DETECTED' : 'FAINT CHILL'}
          </span>
        </div>

        <style>{`
          @keyframes pulseHeart {
            0% { transform: scale(0.85); opacity: 0.6; }
            50% { transform: scale(1.25); opacity: 1; }
            100% { transform: scale(0.85); opacity: 0.6; }
          }
        `}</style>
      </div>

      {/* ========================================================
          3. DYNAMIC RETICLE / CROSSHAIR
      ======================================================== */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: focusedObject ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 25,
          cursor: focusedObject ? 'pointer' : 'default'
        }}
        onClick={() => {
          if (focusedObject) interactFocusedObject()
        }}
      >
        <div style={{
          width: focusedObject ? '42px' : '10px',
          height: focusedObject ? '42px' : '10px',
          border: `2px solid ${focusedObject ? '#ef4444' : 'rgba(255, 255, 255, 0.45)'}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease-out',
          boxShadow: focusedObject ? '0 0 24px #ef4444' : 'none',
          background: focusedObject ? 'rgba(239, 68, 68, 0.12)' : 'transparent'
        }}>
          {focusedObject ? (
            <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }} />
          ) : (
            <div style={{ width: '2px', height: '2px', background: '#fff', borderRadius: '50%' }} />
          )}
        </div>

        {/* Hover Prompt */}
        {focusedObject && (
          <div style={{
            marginTop: '14px',
            background: 'rgba(12, 10, 18, 0.96)',
            border: '2px solid #ef4444',
            borderRadius: '6px',
            padding: '8px 18px',
            boxShadow: '0 6px 25px rgba(0,0,0,0.95), 0 0 20px rgba(239, 68, 68, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'promptPop 0.2s ease-out'
          }}>
            <span style={{
              background: '#dc2626',
              color: '#fff',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: '3px'
            }}>
              LEFT CLICK / E
            </span>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
              EXAMINE {focusedObject.display_name || focusedObject.filename}
            </span>
          </div>
        )}
      </div>

      {/* ========================================================
          4. CARRIED CANDLE FOREGROUND (Exact Reference Image 9)
      ======================================================== */}
      <div style={{
        position: 'absolute',
        bottom: '-25px',
        right: '8%',
        width: '320px',
        height: '420px',
        pointerEvents: 'none',
        zIndex: 18,
        filter: lifelines > 0 ? 'drop-shadow(0 0 50px rgba(245, 158, 11, 0.45))' : 'grayscale(1) opacity(0.3)'
      }}>
        <img
          src={lifelines > 0 ? "/assets/candle_carried.jpg" : "/assets/candle_extinguished.jpg"}
          alt="Handheld Candle Flame"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            maskImage: 'radial-gradient(circle at 50% 60%, black 50%, transparent 95%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 60%, black 50%, transparent 95%)'
          }}
        />
      </div>

      {/* ========================================================
          5. BOTTOM CONTROLS HINT FOOTER
      ======================================================== */}
      <footer style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'rgba(12, 10, 18, 0.92)',
        padding: '8px 22px',
        borderRadius: '4px',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '11px',
        color: '#9ca3af',
        fontFamily: 'JetBrains Mono, monospace',
        zIndex: 22,
        pointerEvents: 'auto'
      }}>
        <span><strong style={{ color: '#fff' }}>[W, A, S, D]</strong> Walk</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
        <span style={{ color: '#38bdf8' }}>[MOUSE] Look 360°</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
        <span><strong style={{ color: '#f59e0b' }}>[LEFT CLICK / E]</strong> Inspect Relic</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
        <button
          onClick={() => setShowPauseMenu(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
            textDecoration: 'underline'
          }}
        >
          [ESC] Pause
        </button>
      </footer>

      {/* ========================================================
          6. IN-GAME PAUSE MENU OVERLAY (ESC)
      ======================================================== */}
      {showPauseMenu && !isGameOver && !activeRelicModal && !activeScare && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(4, 3, 6, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 35,
          pointerEvents: 'auto'
        }}>
          <div style={{
            background: 'rgba(12, 10, 18, 0.96)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            padding: '36px 44px',
            textAlign: 'center',
            maxWidth: '460px',
            width: '90%',
            boxShadow: '0 0 50px rgba(0,0,0,0.95)'
          }}>
            <div style={{
              width: '48px',
              height: '68px',
              margin: '0 auto 16px auto',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
            }}>
              <img src="/assets/candle_returns.jpg" alt="Lit Candle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h3 style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '22px',
              color: '#ef4444',
              margin: '0 0 8px 0',
              letterSpacing: '1px'
            }}>
              INVESTIGATION PAUSED
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Your candle flickers in the eerie quiet of {roomData?.title || currentRoom}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => setShowPauseMenu(false)}
                style={{
                  padding: '12px',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                RESUME INVESTIGATION
              </button>

              <button
                onClick={() => {
                  setShowPauseMenu(false)
                  returnToMap()
                }}
                style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#e5e7eb',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                RETURN TO CURSED BLUEPRINT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          7. JUMP SCARE MODAL (Exact Visual Artworks, Zero Emojis)
      ======================================================== */}
      {activeScare && currentScareVisual && (
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
            background: 'radial-gradient(circle, rgba(185,28,28,0.92) 0%, rgba(4,3,6,0.98) 75%)',
            animation: reduceScares ? 'none' : 'shakeScreen 0.15s infinite'
          }}
        >
          {/* Exact Artwork Asset Display */}
          <div style={{
            width: '260px',
            height: '260px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '3px solid #ef4444',
            marginBottom: '20px',
            boxShadow: '0 0 50px rgba(239, 68, 68, 0.8)',
            transform: 'scale(1.05)'
          }}>
            <img
              src={currentScareVisual.image}
              alt="Nightmare Apparition"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h1 style={{
            fontFamily: 'Creepster, cursive',
            fontSize: '48px',
            color: '#fff',
            letterSpacing: '3px',
            textShadow: '0 0 24px #ef4444',
            margin: 0,
            textAlign: 'center'
          }}>
            {currentScareVisual.title}
          </h1>
          <p style={{ color: '#fca5a5', fontSize: '15px', marginTop: '10px', textAlign: 'center' }}>
            DECOY TRIGGERED! 1 candle was snuffed out ({lifelines} flame{lifelines === 1 ? '' : 's'} remaining).
          </p>
          <span style={{ color: '#9ca3af', fontSize: '11px', marginTop: '16px', fontFamily: 'JetBrains Mono, monospace' }}>
            [CLICK SCREEN TO DISMISS]
          </span>
        </div>
      )}

      {/* ========================================================
          8. RELIC DISCOVERED MODAL
      ======================================================== */}
      {activeRelicModal && (
        <div
          onClick={clearRelicModal}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'rgba(4, 3, 6, 0.88)',
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
              background: '#090d16',
              border: '2px solid #38bdf8',
              borderRadius: '8px',
              padding: '30px',
              maxWidth: '580px',
              width: '90%',
              boxShadow: '0 0 40px rgba(56, 189, 248, 0.4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(56, 189, 248, 0.2)', paddingBottom: '14px' }}>
              <div style={{
                width: '36px',
                height: '48px',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <img src="/assets/candle_returns.jpg" alt="Relic Cleansed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Cinzel Decorative, serif', fontSize: '18px', color: '#38bdf8', letterSpacing: '1px' }}>
                  CORRUPTED RELIC PURGED (+100 PTS)
                </h3>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                  {activeRelicModal.file}:{activeRelicModal.line} • {activeRelicModal.type}
                </span>
              </div>
            </div>

            {/* Code Snippet */}
            <div style={{
              margin: '18px 0',
              background: '#020617',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              padding: '12px 16px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: '#f87171'
            }}>
              <code>{activeRelicModal.snippet}</code>
            </div>

            {/* Explanation & Fix */}
            <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, margin: '0 0 10px 0' }}>
              <strong style={{ color: '#ef4444' }}>Vulnerability:</strong> {activeRelicModal.explanation}
            </p>
            <p style={{ color: '#86efac', fontSize: '13px', margin: 0 }}>
              <strong style={{ color: '#4ade80' }}>Remediation:</strong> {activeRelicModal.suggestion}
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
                borderRadius: '4px',
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              RESUME CODE HUNT
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          9. GAME OVER / EXTINCTION SCREEN
      ======================================================== */}
      {isGameOver && (
        <div
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(30,10,10,0.98) 0%, rgba(4,3,6,0.99) 90%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 60
          }}
        >
          {/* Large Extinguished Candle Art */}
          <div style={{
            width: '180px',
            height: '240px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #ef4444',
            marginBottom: '20px',
            boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)'
          }}>
            <img src="/assets/candle_extinguished.jpg" alt="Snuffed Candle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

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
          <p style={{ color: '#d1d5db', fontSize: '15px', marginTop: '10px', maxWidth: '480px', textAlign: 'center' }}>
            {lifelines <= 0
              ? 'All four candle flames were snuffed out by decoys in the dark.'
              : 'Lantern oil depleted! No visits remaining to enter the chambers.'}
          </p>

          <div style={{
            margin: '24px 0',
            background: 'rgba(12, 10, 18, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            padding: '14px 28px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>
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
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '1px',
                cursor: 'pointer'
              }}
            >
              RE-LIGHT CANDLES & RETRY
            </button>
            <button
              onClick={fetchReport}
              style={{
                padding: '12px 28px',
                background: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer'
              }}
            >
              VIEW HAUNTING REPORT
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          10. FOUND RELICS DRAWER
      ======================================================== */}
      {showDrawer && (
        <div
          onClick={() => setShowDrawer(false)}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
              <h3 style={{ margin: 0, color: '#38bdf8', fontFamily: 'Cinzel Decorative, serif', fontSize: '18px', letterSpacing: '1px' }}>
                CLEANSED RELICS ({foundRelics.length})
              </h3>
              <button
                onClick={() => setShowDrawer(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '14px', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }}
              >
                [CLOSE]
              </button>
            </div>

            {foundRelics.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '13px', fontStyle: 'italic' }}>
                No relics discovered yet. Explore the chamber and inspect suspicious objects.
              </p>
            ) : (
              foundRelics.map((r, i) => (
                <div key={i} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '4px',
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

      {/* ========================================================
          11. HAUNTING REPORT MODAL
      ======================================================== */}
      {showReport && hauntingReport && (
        <div
          onClick={closeReport}
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            inset: 0,
            background: 'rgba(4, 3, 6, 0.94)',
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
              borderRadius: '8px',
              padding: '36px',
              maxWidth: '680px',
              width: '90%',
              maxHeight: '85vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '84px',
                margin: '0 auto 12px auto',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <img src="/assets/candle_returns.jpg" alt="Manor Seal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h2 style={{ margin: '8px 0 0 0', fontFamily: 'Cinzel Decorative, serif', color: '#ef4444', fontSize: '24px', letterSpacing: '2px' }}>
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
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>TOTAL RELICS</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#38bdf8' }}>{hauntingReport.total_relics_in_mansion}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>CLEANSED</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#4ade80' }}>{hauntingReport.relics_found_count}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>FINAL SCORE</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#fbbf24' }}>{hauntingReport.score}</div>
              </div>
            </div>

            {/* Revealed Missed Relics */}
            {hauntingReport.is_game_finished && hauntingReport.relics_missed && hauntingReport.relics_missed.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#f87171', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px' }}>
                  UNRESOLVED ANOMALIES IN THE REPOSITORY ({hauntingReport.relics_missed.length}):
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {hauntingReport.relics_missed.map((m, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '4px',
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
                marginTop: '24px',
                padding: '12px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 800,
                letterSpacing: '1px',
                cursor: 'pointer'
              }}
            >
              CLOSE REPORT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
