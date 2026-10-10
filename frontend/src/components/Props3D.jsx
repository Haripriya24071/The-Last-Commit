import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

export function ChestProp({ isHovered, glowColor }) {
  return (
    <group>
      {/* Base Box */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.8, 0.8]} />
        <meshStandardMaterial color="#451a03" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Curved Lid */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 1.2, 16, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#78350f" roughness={0.6} />
      </mesh>
      {/* Metal Bands */}
      <mesh position={[0, 0.4, 0.41]}>
        <boxGeometry args={[0.16, 0.24, 0.05]} />
        <meshStandardMaterial color={isHovered ? glowColor : "#d97706"} emissive={isHovered ? glowColor : "#000"} emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

export function PortraitProp({ isHovered, glowColor }) {
  return (
    <group position={[0, 1.2, 0]}>
      {/* Frame */}
      <mesh castShadow>
        <boxGeometry args={[1.0, 1.4, 0.08]} />
        <meshStandardMaterial color="#292524" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Canvas */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.8, 1.2]} />
        <meshStandardMaterial
          color={isHovered ? "#991b1b" : "#450a0a"}
          emissive={isHovered ? glowColor : "#1e1b4b"}
          emissiveIntensity={isHovered ? 0.6 : 0.2}
        />
      </mesh>
    </group>
  )
}

export function MirrorProp({ isHovered, glowColor }) {
  return (
    <group position={[0, 1.1, 0]}>
      {/* Frame */}
      <mesh castShadow>
        <cylinderGeometry args={[0.65, 0.65, 0.08, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#44403c" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Glass */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[0.55, 24]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.1}
          metalness={0.9}
          emissive={isHovered ? glowColor : "#0284c7"}
          emissiveIntensity={isHovered ? 0.8 : 0.3}
        />
      </mesh>
    </group>
  )
}

export function ClockProp({ isHovered, glowColor }) {
  const pendulumRef = useRef()

  useFrame((state) => {
    if (pendulumRef.current) {
      pendulumRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.5) * 0.2
    }
  })

  return (
    <group position={[0, 1.2, 0]}>
      {/* Clock Body */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 2.2, 0.5]} />
        <meshStandardMaterial color="#312e81" roughness={0.6} />
      </mesh>
      {/* Dial */}
      <mesh position={[0, 0.6, 0.26]}>
        <circleGeometry args={[0.22, 16]} />
        <meshStandardMaterial color="#fef08a" emissive={isHovered ? glowColor : "#ca8a04"} emissiveIntensity={0.5} />
      </mesh>
      {/* Pendulum */}
      <group position={[0, 0.1, 0.15]} ref={pendulumRef}>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7, 8]} />
          <meshStandardMaterial color="#eab308" metalness={0.8} />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#eab308" metalness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

export function SkullProp({ isHovered, glowColor }) {
  return (
    <group position={[0, 0.6, 0]}>
      {/* Altar Pedestal */}
      <mesh position={[0, -0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.6, 16]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>
      {/* Skull Cranium */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#e7e5e4" roughness={0.5} emissive={isHovered ? glowColor : "#000"} emissiveIntensity={0.7} />
      </mesh>
      {/* Jaw */}
      <mesh position={[0, 0.02, 0.1]}>
        <boxGeometry args={[0.2, 0.16, 0.22]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.5} />
      </mesh>
      {/* Glowing Eye Sockets */}
      <mesh position={[-0.08, 0.2, 0.24]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={isHovered ? glowColor : "#ef4444"} />
      </mesh>
      <mesh position={[0.08, 0.2, 0.24]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={isHovered ? glowColor : "#ef4444"} />
      </mesh>
    </group>
  )
}

export function CauldronProp({ isHovered, glowColor }) {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Pot */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Liquid surface */}
      <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 16]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive={isHovered ? glowColor : "#15803d"}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

export function TomeProp({ isHovered, glowColor }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <group position={[0, 0.9, 0]}>
        {/* Book Spine */}
        <mesh castShadow rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.8, 1.0, 0.18]} />
          <meshStandardMaterial color="#581c87" roughness={0.6} emissive={isHovered ? glowColor : "#3b0764"} emissiveIntensity={0.5} />
        </mesh>
        {/* Pages */}
        <mesh position={[0, 0, 0.02]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.74, 0.94, 0.14]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.9} />
        </mesh>
      </group>
    </Float>
  )
}

export function ModelDispatcher({ modelType, isHovered, glowColor }) {
  switch (modelType) {
    case 'chest': return <ChestProp isHovered={isHovered} glowColor={glowColor} />
    case 'portrait': return <PortraitProp isHovered={isHovered} glowColor={glowColor} />
    case 'mirror': return <MirrorProp isHovered={isHovered} glowColor={glowColor} />
    case 'clock': return <ClockProp isHovered={isHovered} glowColor={glowColor} />
    case 'skull': return <SkullProp isHovered={isHovered} glowColor={glowColor} />
    case 'cauldron': return <CauldronProp isHovered={isHovered} glowColor={glowColor} />
    case 'tome':
    default: return <TomeProp isHovered={isHovered} glowColor={glowColor} />
  }
}
