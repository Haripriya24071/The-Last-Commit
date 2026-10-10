import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import ProceduralRoom from './components/ProceduralRoom'
import InteractiveObject from './components/InteractiveObject'
import FirstPersonController from './components/FirstPersonController'
import RoomHUD from './components/RoomHUD'
import MansionMap from './components/MansionMap'
import { useGameStore } from './store/gameStore'

export default function App() {
  const {
    currentView,
    currentRoom,
    roomData,
    lowQuality,
    fetchMansionMap,
    scanId,
    showReport,
    hauntingReport,
    closeReport
  } = useGameStore()

  // Auto-initialize mansion map on mount if not yet initialized
  useEffect(() => {
    if (!scanId) {
      fetchMansionMap('sample')
    }
  }, [scanId, fetchMansionMap])

  const objects = roomData?.objects || []
  const themeColor = roomData?.theme_color || '#38bdf8'

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#050508',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {/* 1. 2D Cursed Mansion Blueprint Map View */}
      {currentView === 'map' && <MansionMap />}

      {/* 2. 3D First-Person Haunted Room View */}
      {currentView === 'room' && (
        <>
          <RoomHUD />
          <Canvas
            camera={{ position: [0, 1.6, 4], fov: 65 }}
            shadows={!lowQuality}
            gl={{ antialias: !lowQuality, powerPreference: 'high-performance' }}
          >
            {/* Atmospheric Horror Volumetric Fog */}
            <fog attach="fog" args={['#050508', 2.5, 14]} />

            {/* Ambient Dark Light */}
            <ambientLight intensity={lowQuality ? 0.4 : 0.25} />

            {/* Procedural 3D Room Architecture (Floor, Walls, Torches, Ceiling) */}
            <ProceduralRoom roomThemeColor={themeColor} />

            {/* Interactive 3D Objects Placed via /api/room Coordinates */}
            {objects.map((obj) => (
              <InteractiveObject key={obj.id} objData={obj} />
            ))}

            {/* First Person WASD + Mouse Look Controller */}
            <FirstPersonController />
          </Canvas>
        </>
      )}

      {/* Shared Global Haunting Report Modal (when opened from Map or Room) */}
      {showReport && hauntingReport && currentView === 'map' && (
        <div
          onClick={closeReport}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 5, 8, 0.94)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100
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
