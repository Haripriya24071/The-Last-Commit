import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { AudioEngine } from './AudioEngine'

export default function FirstPersonController() {
  const { camera, scene, gl } = useThree()
  const controlsRef = useRef()
  const setPointerLocked = useGameStore((state) => state.setPointerLocked)
  const isPointerLocked = useGameStore((state) => state.isPointerLocked)
  const unlockAudio = useGameStore((state) => state.unlockAudio)
  const updateWarmth = useGameStore((state) => state.updateWarmth)
  const setFocusedObject = useGameStore((state) => state.setFocusedObject)
  const interactFocusedObject = useGameStore((state) => state.interactFocusedObject)
  const isGameOver = useGameStore((state) => state.isGameOver)

  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false
  })

  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const lastWarmthCheck = useRef(0)
  const raycaster = useRef(new THREE.Raycaster())
  const lanternLightRef = useRef()
  const lanternSpotRef = useRef()

  // Free-cursor drag look state (when pointer is NOT locked)
  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))

  useEffect(() => {
    // Initial camera orientation
    euler.current.setFromQuaternion(camera.quaternion)

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
        case 'KeyE':
        case 'Space':
          if (!isGameOver) {
            interactFocusedObject()
          }
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

    // Drag-to-look when pointer is not locked
    const dom = gl.domElement
    const handleMouseDown = (e) => {
      if (e.target === dom && !controlsRef.current?.isLocked) {
        isDragging.current = true
        lastMousePos.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseMove = (e) => {
      if (isDragging.current && !controlsRef.current?.isLocked) {
        const dx = e.clientX - lastMousePos.current.x
        const dy = e.clientY - lastMousePos.current.y
        lastMousePos.current = { x: e.clientX, y: e.clientY }

        euler.current.setFromQuaternion(camera.quaternion)
        euler.current.y -= dx * 0.003
        euler.current.x -= dy * 0.003
        euler.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.current.x))
        camera.quaternion.setFromEuler(euler.current)
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    dom.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      dom.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [camera, gl, interactFocusedObject, isGameOver])

  useFrame((state, delta) => {
    // 1. WASD Movement (Runs smoothly in both PointerLock and Free Cursor modes!)
    const isMoving = moveState.current.forward || moveState.current.backward || moveState.current.left || moveState.current.right

    velocity.current.x -= velocity.current.x * 10.0 * delta
    velocity.current.z -= velocity.current.z * 10.0 * delta

    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward)
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left)
    direction.current.normalize()

    const moveSpeed = 38.0
    if (moveState.current.forward || moveState.current.backward) {
      velocity.current.z -= direction.current.z * moveSpeed * delta
    }
    if (moveState.current.left || moveState.current.right) {
      velocity.current.x -= direction.current.x * moveSpeed * delta
    }

    // Move relative to camera yaw
    if (controlsRef.current?.isLocked) {
      controlsRef.current.moveRight(-velocity.current.x * delta)
      controlsRef.current.moveForward(-velocity.current.z * delta)
    } else {
      // Manual vector move when unlocked
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
      forward.y = 0
      forward.normalize()
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
      right.y = 0
      right.normalize()

      camera.position.addScaledVector(forward, -velocity.current.z * delta)
      camera.position.addScaledVector(right, -velocity.current.x * delta)
    }

    if (isMoving) {
      AudioEngine.playFootstep()
    }

    // Keep player inside Victorian room (-5.8m to +5.8m)
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.8, 5.8)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.8, 5.8)
    camera.position.y = 1.6 // Eye height

    // 2. Handheld Lantern Follows Camera
    if (lanternLightRef.current && lanternSpotRef.current) {
      lanternLightRef.current.position.copy(camera.position)
      lanternSpotRef.current.position.copy(camera.position)

      const lookTarget = new THREE.Vector3(0, 0, -5).applyQuaternion(camera.quaternion).add(camera.position)
      lanternSpotRef.current.target.position.copy(lookTarget)
      lanternSpotRef.current.target.updateMatrixWorld()

      // Flickering lantern intensity
      const time = state.clock.elapsedTime
      lanternLightRef.current.intensity = 1.4 + Math.sin(time * 14) * 0.15 + Math.cos(time * 7) * 0.1
    }

    // 3. Center Crosshair Raycasting (Finds anomalies in front of player)
    const center = new THREE.Vector2(0, 0)
    raycaster.current.setFromCamera(center, camera)
    raycaster.current.far = 6.2

    // Find interactive objects in the scene
    const interactives = []
    scene.traverse((obj) => {
      if (obj.userData?.isInteractive) {
        interactives.push(obj)
      }
    })

    const hits = raycaster.current.intersectObjects(interactives, true)
    if (hits.length > 0) {
      let topHit = hits[0].object
      while (topHit && !topHit.userData?.objData && topHit.parent) {
        topHit = topHit.parent
      }
      if (topHit?.userData?.objData) {
        setFocusedObject(topHit.userData.objData)
      } else {
        setFocusedObject(null)
      }
    } else {
      setFocusedObject(null)
    }

    // 4. Throttle /api/warmth calls to 400ms
    const now = performance.now()
    if (now - lastWarmthCheck.current > 400) {
      lastWarmthCheck.current = now
      updateWarmth(camera.position.x, camera.position.y, camera.position.z)
    }
  })

  return (
    <>
      {/* Handheld Player Lantern Lights */}
      <pointLight
        ref={lanternLightRef}
        color="#fbbf24"
        intensity={1.5}
        distance={9.0}
        decay={2}
      />
      <spotLight
        ref={lanternSpotRef}
        color="#fef08a"
        intensity={2.2}
        distance={14.0}
        angle={Math.PI / 4.5}
        penumbra={0.6}
        decay={1.8}
      />

      <PointerLockControls
        ref={controlsRef}
        onLock={() => {
          setPointerLocked(true)
          unlockAudio()
          AudioEngine.unlock?.()
        }}
        onUnlock={() => {
          setPointerLocked(false)
        }}
      />
    </>
  )
}
