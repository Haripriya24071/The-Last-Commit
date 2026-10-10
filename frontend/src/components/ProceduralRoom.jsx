import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'

export default function ProceduralRoom({ roomThemeColor = '#38bdf8' }) {
  const torchLight1 = useRef()
  const torchLight2 = useRef()
  const lowQuality = useGameStore((state) => state.lowQuality)

  useFrame((state) => {
    // Subtle flickering flame animation
    const time = state.clock.elapsedTime
    if (torchLight1.current) {
      torchLight1.current.intensity = 1.6 + Math.sin(time * 12) * 0.3 + Math.cos(time * 24) * 0.15
    }
    if (torchLight2.current) {
      torchLight2.current.intensity = 1.6 + Math.cos(time * 10) * 0.3 + Math.sin(time * 20) * 0.15
    }
  })

  return (
    <group>
      {/* 1. Stone Floor (14m x 14m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={!lowQuality}>
        <planeGeometry args={[14, 14, 8, 8]} />
        <meshStandardMaterial
          color="#18181b"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Floor Grid Accents */}
      <gridHelper args={[14, 14, '#3f3f46', '#27272a']} position={[0, 0.001, 0]} />

      {/* 2. Stone Walls */}
      {/* North Wall */}
      <mesh position={[0, 3, -7]} receiveShadow={!lowQuality}>
        <boxGeometry args={[14, 6, 0.4]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, 3, 7]} receiveShadow={!lowQuality}>
        <boxGeometry args={[14, 6, 0.4]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} />
      </mesh>
      {/* West Wall */}
      <mesh position={[-7, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow={!lowQuality}>
        <boxGeometry args={[14, 6, 0.4]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} />
      </mesh>
      {/* East Wall */}
      <mesh position={[7, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow={!lowQuality}>
        <boxGeometry args={[14, 6, 0.4]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} />
      </mesh>

      {/* 3. Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#050508" roughness={0.95} />
      </mesh>

      {/* 4. Arched Doorway (Entrance Arch on North Wall) */}
      <group position={[0, 0, -6.8]}>
        <mesh position={[-1.2, 1.8, 0]}>
          <boxGeometry args={[0.4, 3.6, 0.5]} />
          <meshStandardMaterial color="#27272a" roughness={0.6} />
        </mesh>
        <mesh position={[1.2, 1.8, 0]}>
          <boxGeometry args={[0.4, 3.6, 0.5]} />
          <meshStandardMaterial color="#27272a" roughness={0.6} />
        </mesh>
        <mesh position={[0, 3.7, 0]}>
          <boxGeometry args={[2.8, 0.4, 0.5]} />
          <meshStandardMaterial color="#27272a" roughness={0.6} />
        </mesh>
      </group>

      {/* 5. Flickering Wall Sconces & Torches */}
      {/* Torch 1 (West Wall) */}
      <group position={[-6.7, 2.5, -2]}>
        <mesh>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <pointLight
          ref={torchLight1}
          color="#f97316"
          intensity={1.8}
          distance={8}
          decay={2}
          castShadow={!lowQuality}
        />
      </group>

      {/* Torch 2 (East Wall) */}
      <group position={[6.7, 2.5, 2]}>
        <mesh>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <pointLight
          ref={torchLight2}
          color="#f97316"
          intensity={1.8}
          distance={8}
          decay={2}
          castShadow={!lowQuality}
        />
      </group>

      {/* Atmospheric Overhead Theme Fill Light */}
      <pointLight position={[0, 4.5, 0]} color={roomThemeColor} intensity={0.9} distance={12} />
    </group>
  )
}
