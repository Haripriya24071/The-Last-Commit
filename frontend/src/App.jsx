import React from 'react'
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
import { useGameStore } from './store/gameStore'

export default function App() {
  const {
    currentScreen,
    roomData,
    lowQuality
  } = useGameStore()

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
      {/* 1. Landing Screen (Title + Investigator Name + Audio Unlock) */}
      {currentScreen === 'landing' && <LandingScreen />}

      {/* 2. Welcome / Lore Briefing Screen */}
      {currentScreen === 'welcome' && <WelcomeScreen />}

      {/* 3. Repo Selection & Animated Scanning Ritual */}
      {currentScreen === 'repo_input' && <RepoInputScreen />}

      {/* 4. Interactive 3-Card Role Selection */}
      {currentScreen === 'role_select' && <RoleSelectScreen />}

      {/* 5. 2D Cursed Mansion Blueprint Map View */}
      {currentScreen === 'map' && <MansionMap />}

      {/* 6. 3D First-Person Haunted Room Exploration */}
      {currentScreen === 'room' && (
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

      {/* Shared Global Haunting Report Modal */}
      <HauntingReportModal />
    </div>
  )
}

