import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import ProceduralRoom from './components/ProceduralRoom'
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
    fetchMansionMap
  } = useGameStore()

  // 1. Initial Health Check
  useEffect(() => {
    checkBackendHealth()
  }, [checkBackendHealth])

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
  // 3. Dynamic Fog Calculation - High-fidelity depth preserving Gothic walls and architecture
  // Ensures walls at 7m-11m and floor flagstones are clearly visible rather than drowned in pitch black
  const candleFogFactor = Math.max(0.6, lifelines / 4)
  const relicClarity = foundRelics.length * 0.5
  const fogNear = Math.max(5.0, 6.0 * candleFogFactor + relicClarity * 0.2)
  const fogFar = Math.max(22.0, 26.0 * candleFogFactor + relicClarity * 1.5)

  const objects = roomData?.objects || []
  const themeColor = roomData?.theme_color || '#38bdf8'
  const ambientIntensity = (lowQuality ? 0.7 : 0.58) * (brightness || 1.2)

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

      {/* Shared Global Overlays & Post-Processing */}
      <HorrorPostProcessing />
      <HorrorCinematicEffects />
      <SubtitlesOverlay />
      <CandleLightRelicAnimation />
      <HauntingReportModal />
    </div>
  )
}
