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

      {/* Floating Filename Tag with High Readability */}
      <Html position={[0, 2.3, 0]} center distanceFactor={7}>
        <div style={{
          padding: '6px 14px',
          background: hovered ? 'rgba(220, 38, 38, 0.95)' : 'rgba(10, 14, 26, 0.92)',
          border: `2px solid ${hovered ? '#ef4444' : glowColor}`,
          borderRadius: '8px',
          color: '#fff',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: hovered ? `0 0 18px ${glowColor}` : '0 4px 14px rgba(0,0,0,0.85)',
          transition: 'all 0.15s ease-out',
          transform: hovered ? 'scale(1.15)' : 'scale(1.0)'
        }}>
          📜 {objData.display_name || objData.filename}
        </div>
      </Html>

      {/* Ground Spotlight underneath object */}
      {hovered && (
        <pointLight
          position={[0, 0.5, 0]}
          color={glowColor}
          intensity={2.2}
          distance={4.0}
        />
      )}
    </group>
  )
}
