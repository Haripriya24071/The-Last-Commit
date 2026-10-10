import React, { useState, useRef } from 'react'
import { Html } from '@react-three/drei'
import { ModelDispatcher } from './Props3D'
import { useGameStore } from '../store/gameStore'
import { AudioEngine } from './AudioEngine'

export default function InteractiveObject({ objData }) {
  const [hovered, setHovered] = useState(false)
  const checkObject = useGameStore((state) => state.checkObject)
  const role = useGameStore((state) => state.role)
  const isGameOver = useGameStore((state) => state.isGameOver)

  const roleGlowMap = {
    ghost: '#38bdf8',
    reaper: '#ef4444',
    skeleton: '#fbbf24'
  }
  const glowColor = roleGlowMap[role] || '#fbbf24'

  const handleClick = (e) => {
    e.stopPropagation()
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

  return (
    <group
      position={objData.position || [0, 0, 0]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
        AudioEngine.playHeartbeat(1.2)
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'default'
      }}
    >
      {/* 3D Procedural Model */}
      <ModelDispatcher
        modelType={objData.model_type}
        isHovered={hovered}
        glowColor={glowColor}
      />

      {/* Floating Filename Tag */}
      <Html position={[0, 2.1, 0]} center distanceFactor={8}>
        <div style={{
          padding: '4px 10px',
          background: hovered ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.85)',
          border: `1px solid ${hovered ? '#f87171' : 'rgba(255, 255, 255, 0.15)'}`,
          borderRadius: '6px',
          color: '#fff',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: hovered ? `0 0 12px ${glowColor}` : '0 2px 8px rgba(0,0,0,0.6)',
          transition: 'all 0.15s ease-out',
          transform: hovered ? 'scale(1.1)' : 'scale(1.0)'
        }}>
          📄 {objData.display_name || objData.filename}
        </div>
      </Html>

      {/* Subtle Ground Spotlight underneath object */}
      {hovered && (
        <pointLight
          position={[0, 0.5, 0]}
          color={glowColor}
          intensity={1.5}
          distance={3.5}
        />
      )}
    </group>
  )
}
