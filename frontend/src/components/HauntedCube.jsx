import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, MeshDistortMaterial } from '@react-three/drei'

export default function HauntedCube() {
  const meshRef = useRef()
  const glowRef = useRef()

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.4
      meshRef.current.rotation.y += delta * 0.6
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Ghostly floating animated cube */}
      <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
        <mesh ref={meshRef} castShadow receiveShadow>
          <boxGeometry args={[2, 2, 2]} />
          <MeshDistortMaterial
            color="#8b0000"
            emissive="#3b0764"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.8}
            distort={0.25}
            speed={2}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* Floating 3D text */}
      <Text
        position={[0, -2.2, 0]}
        fontSize={0.35}
        color="#fca5a5"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/cinzeldecorative/v16/daaCSScvJGqLYhG8nNt8KPPswUAPnh7U.woff"
      >
        THE LAST COMMIT — 3D PROOF
      </Text>
    </group>
  )
}
