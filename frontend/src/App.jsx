import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import ProceduralRoom from './components/ProceduralRoom'
import InteractiveObject from './components/InteractiveObject'
import FirstPersonController from './components/FirstPersonController'
import RoomHUD from './components/RoomHUD'
import { useGameStore } from './store/gameStore'

export default function App() {
  const { currentRoom, roomData, lowQuality, fetchRoom, scanId } = useGameStore()

  // Auto-fetch room on mount (loads Library from sample scan by default)
  useEffect(() => {
    fetchRoom(scanId, currentRoom)
  }, [])

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
      {/* 2D HUD & Interactive Overlays */}
      <RoomHUD />

      {/* 3D First-Person Haunted Room Canvas */}
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
    </div>
  )
}
