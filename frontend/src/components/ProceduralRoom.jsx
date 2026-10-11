import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export default function ProceduralRoom({ roomThemeColor = '#38bdf8' }) {
  const torchLight1 = useRef()
  const torchLight2 = useRef()
  const dustParticlesRef = useRef()
  const lowQuality = useGameStore((state) => state.lowQuality)

  // Atmospheric dust motes / spectral embers
  const particleCount = lowQuality ? 30 : 90
  const [positions, dustSpeeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    const speeds = new Float32Array(particleCount)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12
      pos[i * 3 + 1] = Math.random() * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12
      speeds[i] = 0.2 + Math.random() * 0.4
    }
    return [pos, speeds]
  }, [particleCount])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    if (torchLight1.current) {
      torchLight1.current.intensity = 1.8 + Math.sin(time * 12) * 0.35 + Math.cos(time * 26) * 0.15
    }
    if (torchLight2.current) {
      torchLight2.current.intensity = 1.8 + Math.cos(time * 11) * 0.35 + Math.sin(time * 21) * 0.15
    }

    // Drifting dust motes
    if (dustParticlesRef.current) {
      const posAttr = dustParticlesRef.current.geometry.attributes.position
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i) - delta * dustSpeeds[i] * 0.3
        if (y < 0.2) y = 4.8
        posAttr.setY(i, y)
      }
      posAttr.needsUpdate = true
    }
  })

  return (
    <group>
      {/* 1. Victorian Flagstone Floor (14m x 14m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={!lowQuality}>
        <planeGeometry args={[14, 14, 12, 12]} />
        <meshStandardMaterial
          color="#121118"
          roughness={0.75}
          metalness={0.2}
        />
      </mesh>

      {/* Decorative Stone Border Inlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[6.4, 6.8, 4]} />
        <meshStandardMaterial color="#2d2238" roughness={0.6} />
      </mesh>

      {/* 2. Gothic Stone Walls */}
      {/* North Wall */}
      <mesh position={[0, 3, -7]} receiveShadow={!lowQuality}>
        <boxGeometry args={[14, 6, 0.4]} />
        <meshStandardMaterial color="#0b0912" roughness={0.9} />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, 3, 7]} receiveShadow={!lowQuality}>
        <boxGeometry args={[14, 6, 0.4]} />
        <meshStandardMaterial color="#0b0912" roughness={0.9} />
      </mesh>
      {/* West Wall */}
      <mesh position={[-7, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow={!lowQuality}>
        <boxGeometry args={[14, 6, 0.4]} />
        <meshStandardMaterial color="#0b0912" roughness={0.9} />
      </mesh>
      {/* East Wall */}
      <mesh position={[7, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow={!lowQuality}>
        <boxGeometry args={[14, 6, 0.4]} />
        <meshStandardMaterial color="#0b0912" roughness={0.9} />
      </mesh>

      {/* 3. Wainscoting Wood Paneling Lower Trim */}
      <mesh position={[0, 0.8, -6.8]}>
        <boxGeometry args={[13.8, 1.6, 0.1]} />
        <meshStandardMaterial color="#1f1826" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.8, 6.8]}>
        <boxGeometry args={[13.8, 1.6, 0.1]} />
        <meshStandardMaterial color="#1f1826" roughness={0.6} />
      </mesh>
      <mesh position={[-6.8, 0.8, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[13.8, 1.6, 0.1]} />
        <meshStandardMaterial color="#1f1826" roughness={0.6} />
      </mesh>
      <mesh position={[6.8, 0.8, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[13.8, 1.6, 0.1]} />
        <meshStandardMaterial color="#1f1826" roughness={0.6} />
      </mesh>

      {/* 4. Four Gothic Stone Corner Columns */}
      {[[-6.6, -6.6], [6.6, -6.6], [-6.6, 6.6], [6.6, 6.6]].map(([cx, cz], idx) => (
        <mesh key={idx} position={[cx, 3, cz]}>
          <boxGeometry args={[0.9, 6, 0.9]} />
          <meshStandardMaterial color="#1a1622" roughness={0.8} />
        </mesh>
      ))}

      {/* 5. Ceiling with Wooden Beams */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#06050a" roughness={0.95} />
      </mesh>
      {[-4, -1.5, 1.5, 4].map((z, idx) => (
        <mesh key={idx} position={[0, 5.85, z]}>
          <boxGeometry args={[14, 0.3, 0.5]} />
          <meshStandardMaterial color="#17121c" roughness={0.7} />
        </mesh>
      ))}

      {/* 6. Arched Iron Doorway (North Wall Exit) */}
      <group position={[0, 0, -6.8]}>
        <mesh position={[-1.3, 1.8, 0]}>
          <boxGeometry args={[0.3, 3.6, 0.4]} />
          <meshStandardMaterial color="#2a2233" metalness={0.4} />
        </mesh>
        <mesh position={[1.3, 1.8, 0]}>
          <boxGeometry args={[0.3, 3.6, 0.4]} />
          <meshStandardMaterial color="#2a2233" metalness={0.4} />
        </mesh>
        <mesh position={[0, 3.6, 0]}>
          <boxGeometry args={[2.9, 0.3, 0.4]} />
          <meshStandardMaterial color="#2a2233" metalness={0.4} />
        </mesh>
        {/* Spectral Threshold Glow */}
        <mesh position={[0, 1.8, -0.05]}>
          <planeGeometry args={[2.3, 3.4]} />
          <meshBasicMaterial color="#ef4444" opacity={0.12} transparent />
        </mesh>
      </group>

      {/* 7. Flickering Wall Torches with Sconces */}
      {/* West Torch */}
      <group position={[-6.7, 2.7, -1.5]}>
        <mesh>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        <pointLight
          ref={torchLight1}
          color="#f97316"
          intensity={2.0}
          distance={10}
          decay={2}
          castShadow={!lowQuality}
        />
      </group>

      {/* East Torch */}
      <group position={[6.7, 2.7, 1.5]}>
        <mesh>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        <pointLight
          ref={torchLight2}
          color="#f97316"
          intensity={2.0}
          distance={10}
          decay={2}
          castShadow={!lowQuality}
        />
      </group>

      {/* 8. Atmospheric Drifting Dust / Spectral Embers */}
      <points ref={dustParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#fef08a"
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Overhead Atmospheric Tint */}
      <pointLight position={[0, 5, 0]} color={roomThemeColor} intensity={0.65} distance={14} />
    </group>
  )
}
