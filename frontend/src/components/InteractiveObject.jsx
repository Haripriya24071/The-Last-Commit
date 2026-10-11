import React, { useState, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
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

  // Gentle eerie floating animation
  useFrame((state) => {
    if (groupRef.current) {
      const baseY = (objData.position && objData.position[1]) || 0
      const floatOffset = Math.sin(state.clock.elapsedTime * 2.0 + (objData.position?.[0] || 0)) * 0.08
      groupRef.current.position.y = baseY + floatOffset
    }
  })

  return (
    <group
      ref={groupRef}
      position={objData.position || [0, 0, 0]}
      userData={{ isInteractive: true, objData }}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        AudioEngine.playHeartbeat(1.1)
      }}
      onPointerOut={() => {
        setHovered(false)
      }}
    >
      {/* 3D Procedural Gothic Model */}
      <ModelDispatcher
        modelType={objData.model_type}
        isHovered={isHighlighted}
        glowColor={glowColor}
      />

      {/* Floating Diegetic Tag with Gothic Badge */}
      <Html position={[0, 2.2, 0]} center distanceFactor={7}>
        <div
          onClick={handleClick}
          style={{
            padding: '6px 14px',
            background: isHighlighted ? 'rgba(220, 38, 38, 0.95)' : 'rgba(10, 14, 26, 0.9)',
            border: `2px solid ${isHighlighted ? '#ef4444' : glowColor}`,
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            boxShadow: isHighlighted ? `0 0 20px ${glowColor}` : '0 4px 14px rgba(0,0,0,0.85)',
            transition: 'all 0.15s ease-out',
            transform: isHighlighted ? 'scale(1.12)' : 'scale(1.0)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📜</span>
          <span>{objData.display_name || objData.filename}</span>
          {isHighlighted && (
            <span style={{
              background: '#ef4444',
              color: '#fff',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 900
            }}>
              [E / CLICK]
            </span>
          )}
        </div>
      </Html>

      {/* Spectral Aura Light when Targeted */}
      {isHighlighted && (
        <pointLight
          position={[0, 0.6, 0]}
          color={glowColor}
          intensity={2.8}
          distance={4.5}
        />
      )}
    </group>
  )
}
