import React, { useState, useRef } from 'react'
import { ModelDispatcher } from './Props3D'
import { useGameStore } from '../store/gameStore'
import { AudioEngine } from './AudioEngine'

export default function InteractiveObject({ objData }) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef()
  const checkObject = useGameStore((state) => state.checkObject)
  const role = useGameStore((state) => state.role)
  const isGameOver = useGameStore((state) => state.isGameOver)
  const focusedObject = useGameStore((state) => state.focusedObject)

  const roleGlowMap = {
    ghost: '#38bdf8',
    reaper: '#ef4444',
    skeleton: '#fbbf24'
  }
  const glowColor = roleGlowMap[role] || '#fbbf24'
  const isAimedAt = focusedObject?.id === objData.id
  const isHighlighted = hovered || isAimedAt

  const handleClick = (e) => {
    e?.stopPropagation?.()
    if (isGameOver) return

    checkObject(objData.id).then((res) => {
      if (!res) return
      if (res.is_real) {
        AudioEngine.playRelicFound()
      } else {
        AudioEngine.playJumpScare(res.jump_scare_type)
      }
    })
  }

  // Determine if prop needs an altar pedestal or stands on the floor
  const isFloorStanding = objData.model_type === 'chest' || objData.model_type === 'clock'

  return (
    <group
      ref={groupRef}
      position={objData.position || [0, 0, 0]}
      userData={{ isInteractive: true, objData }}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => {
        setHovered(false)
      }}
    >
      {/* 1. Physical Carved Stone Altar Pedestal for tabletop artifacts */}
      {!isFloorStanding && (
        <group position={[0, -0.45, 0]}>
          {/* Gothic Octagonal Column Shaft */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.36, 0.44, 0.9, 8]} />
            <meshStandardMaterial color="#191522" roughness={0.85} metalness={0.2} />
          </mesh>
          {/* Ornate Tabletop Altar Slab */}
          <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.52, 0.52, 0.08, 8]} />
            <meshStandardMaterial color="#251d32" roughness={0.7} />
          </mesh>
          {/* Inlaid Ancient Runic Ring Glow when Focused */}
          {isHighlighted && (
            <mesh position={[0, 0.495, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.26, 0.48, 16]} />
              <meshBasicMaterial color={glowColor} transparent opacity={0.75} />
            </mesh>
          )}
        </group>
      )}

      {/* Floor Plinth for Large Furniture (Chest / Grandfather Clock) */}
      {isFloorStanding && (
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <boxGeometry args={[1.4, 0.08, 1.0]} />
          <meshStandardMaterial color="#161220" roughness={0.8} />
        </mesh>
      )}

      {/* 2. 3D Procedural Gothic Model */}
      <ModelDispatcher
        modelType={objData.model_type}
        isHovered={isHighlighted}
        glowColor={glowColor}
      />

      {/* 3. Dynamic Spectral Aura Light when Targeted */}
      {isHighlighted && (
        <pointLight
          position={[0, 0.7, 0]}
          color={glowColor}
          intensity={2.8}
          distance={4.5}
        />
      )}
    </group>
  )
}
