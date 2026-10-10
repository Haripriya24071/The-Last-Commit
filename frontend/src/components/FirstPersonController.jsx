import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { AudioEngine } from './AudioEngine'

export default function FirstPersonController() {
  const { camera } = useThree()
  const controlsRef = useRef()
  const setPointerLocked = useGameStore((state) => state.setPointerLocked)
  const unlockAudio = useGameStore((state) => state.unlockAudio)

  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  })

  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = true
          break
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = true
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = true
          break
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = true
          break
      }
    }

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          moveState.current.forward = false
          break
        case 'KeyS':
        case 'ArrowDown':
          moveState.current.backward = false
          break
        case 'KeyA':
        case 'ArrowLeft':
          moveState.current.left = false
          break
        case 'KeyD':
        case 'ArrowRight':
          moveState.current.right = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (!controlsRef.current?.isLocked) return

    // Apply damping
    velocity.current.x -= velocity.current.x * 10.0 * delta
    velocity.current.z -= velocity.current.z * 10.0 * delta

    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward)
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left)
    direction.current.normalize()

    const moveSpeed = 40.0
    if (moveState.current.forward || moveState.current.backward) {
      velocity.current.z -= direction.current.z * moveSpeed * delta
    }
    if (moveState.current.left || moveState.current.right) {
      velocity.current.x -= direction.current.x * moveSpeed * delta
    }

    controlsRef.current.moveRight(-velocity.current.x * delta)
    controlsRef.current.moveForward(-velocity.current.z * delta)

    // Keep player within room bounding box (-6m to 6m)
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.8, 5.8)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.8, 5.8)
    camera.position.y = 1.6 // Eye height
  })

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={() => {
        setPointerLocked(true)
        unlockAudio()
        AudioEngine.unlock()
      }}
      onUnlock={() => {
        setPointerLocked(false)
      }}
    />
  )
}
