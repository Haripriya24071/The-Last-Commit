import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import HorrorHouseEnvironment from './components/HorrorHouseEnvironment'
import InteractiveObject from './components/InteractiveObject'
import FirstPersonController from './components/FirstPersonController'
import RoomHUD from './components/RoomHUD'
import MansionMap from './components/MansionMap'
import LandingScreen from './components/LandingScreen'
import WelcomeScreen from './components/WelcomeScreen'
import RepoInputScreen from './components/RepoInputScreen'
import RoleSelectScreen from './components/RoleSelectScreen'
import HauntingReportModal from './components/HauntingReportModal'
import HorrorPostProcessing from './components/HorrorPostProcessing'
import SubtitlesOverlay from './components/SubtitlesOverlay'
import CandleLightRelicAnimation from './components/CandleLightRelicAnimation'
import HorrorCinematicEffects from './components/HorrorCinematicEffects'
import { AudioEngine } from './components/AudioEngine'
import { useGameStore } from './store/gameStore'

export default function App() {
  const {
    currentScreen,
    roomData,
    lowQuality,
    lifelines,
    foundRelics,
    brightness,
    healthError,
    checkBackendHealth,
    setScreen,
    fetchMansionMap,
    enterRoom,
    isDevMode
  } = useGameStore()

  // 1. Initial Health Check & Background Session Init
  useEffect(() => {
    checkBackendHealth()
    fetchMansionMap('sample').then((data) => {
      if (data?.scan_id) {
        enterRoom('library')
      }
    }).catch(() => {})
  }, [checkBackendHealth, fetchMansionMap, enterRoom])

  const handleJumpToRoom = async (roomName = 'library') => {
    let sId = useGameStore.getState().scanId
    if (!sId) {
      const data = await fetchMansionMap('sample')
      sId = data?.scan_id
    }
    await enterRoom(roomName)
  }

  // F2 key quickly jumps directly into the 3D chamber
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'F2') {
        e.preventDefault()
        handleJumpToRoom('library')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // 2. Audio Ambiance & Door Creak on Screen Transitions
  useEffect(() => {
    if (currentScreen === 'room') {
      AudioEngine.playDoorCreak()
      AudioEngine.startAmbientDrone()
    } else {
      AudioEngine.stopAmbientDrone()
    }
  }, [currentScreen])

  // 3. Dynamic Fog Calculation (Thicker as candles die, thinner as relics are found)
  // 3. Dynamic Fog Calculation - Clear room visibility preserving Gothic architecture
  const candleFogFactor = Math.max(0.7, lifelines / 4)
  const relicClarity = foundRelics.length * 0.5
  const fogNear = Math.max(7.0, 8.5 * candleFogFactor + relicClarity * 0.2)
  const fogFar = Math.max(26.0, 32.0 * candleFogFactor + relicClarity * 1.5)

  const objects = roomData?.objects || []
  const themeColor = roomData?.theme_color || '#38bdf8'
  const ambientIntensity = Math.max(0.75, (lowQuality ? 0.95 : 0.82) * (brightness || 1.2))

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#050508',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
      transition: 'opacity 0.3s ease-in-out'
    }}>
      {/* 1. Global Backend Error Screen if unreachable */}
      {healthError && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, #200808 0%, #050204 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200,
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #ef4444',
            marginBottom: '16px',
            boxShadow: '0 0 24px rgba(239, 68, 68, 0.4)'
          }}>
            <img
              src="/assets/skeleton_character.jpg"
              alt="Spectral Guardian"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <h2 style={{ fontFamily: 'Cinzel Decorative, serif', fontSize: '28px', color: '#ef4444', margin: '0 0 8px 0', letterSpacing: '2px' }}>
            THE SPIRITS ARE RESTLESS
          </h2>
          <p style={{ color: '#fca5a5', fontSize: '14px', maxWidth: '520px', lineHeight: 1.5, margin: '0 0 24px 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {healthError}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => checkBackendHealth()}
              style={{
                padding: '12px 24px',
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
              RETRY CONNECTION
            </button>
            <button
              onClick={() => {
                fetchMansionMap('sample')
                setScreen('map')
              }}
              style={{
                padding: '12px 24px',
                background: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '1px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              ENTER SAMPLE MANOR
            </button>
          </div>
        </div>
      )}

      {/* Dev Quick Jump Bar */}
      {isDevMode && currentScreen !== 'room' && (
        <div style={{
          position: 'fixed',
          top: '14px',
          right: '18px',
          zIndex: 9999,
          display: 'flex',
          gap: '8px',
          background: 'rgba(10, 8, 16, 0.92)',
          border: '1px solid rgba(239, 68, 68, 0.45)',
          borderRadius: '6px',
          padding: '6px 12px',
          boxShadow: '0 4px 25px rgba(0,0,0,0.9)'
        }}>
          <button
            onClick={() => handleJumpToRoom('library')}
            style={{
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.5px'
            }}
          >
            ⚡ 3D CHAMBER (F2)
          </button>
          <button
            onClick={async () => {
              if (!useGameStore.getState().scanId) {
                await fetchMansionMap('sample')
              }
              setScreen('map')
            }}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#e2e8f0',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px',
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            BLUEPRINT MAP
          </button>
        </div>
      )}

      {/* 2. Landing Screen */}
      {currentScreen === 'landing' && <LandingScreen />}

      {/* 3. Welcome / Lore Briefing Screen */}
      {currentScreen === 'welcome' && <WelcomeScreen />}

      {/* 4. Repo Selection & Animated Scanning Ritual */}
      {currentScreen === 'repo_input' && <RepoInputScreen />}

      {/* 5. Interactive 3-Card Role Selection */}
      {currentScreen === 'role_select' && <RoleSelectScreen />}

      {/* 6. 2D Cursed Mansion Blueprint Map View */}
      {currentScreen === 'map' && <MansionMap />}

      {/* 7. 3D First-Person Haunted Room Exploration */}
      {currentScreen === 'room' && (
        <>
          <RoomHUD />
          <Canvas
            camera={{ position: [0, 1.6, 4], fov: 65 }}
            shadows={!lowQuality}
            gl={{ antialias: !lowQuality, powerPreference: 'high-performance' }}
          >
            {/* Dynamic Volumetric Horror Fog */}
            <fog attach="fog" args={['#090710', fogNear, fogFar]} />

            {/* Adjustable Ambient Dark Light */}
            <ambientLight intensity={ambientIntensity} />

            {/* Procedural 3D Victorian Horror House Interior (Rooms, Furniture, Lighting, Dust) */}
            <HorrorHouseEnvironment />

            {/* Interactive 3D Objects Placed via /api/room Coordinates */}
            {objects.map((obj) => (
              <InteractiveObject key={obj.id} objData={obj} />
            ))}

            {/* First Person WASD + Mouse Look Controller */}
            <FirstPersonController />
          </Canvas>
        </>
      )}

      {/* Shared Global Overlays & Post-Processing */}
      <HorrorPostProcessing />
      <HorrorCinematicEffects />
      <SubtitlesOverlay />
      <CandleLightRelicAnimation />
      <HauntingReportModal />
    </div>
  )
}
