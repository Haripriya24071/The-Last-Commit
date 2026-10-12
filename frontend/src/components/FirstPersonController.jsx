import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { AudioEngine } from './AudioEngine'
import { activeHouse } from './world/House'

export default function FirstPersonController() {
  const { camera, scene, gl } = useThree()
  const isGameOver = useGameStore((state) => state.isGameOver)
  const lifelines = useGameStore((state) => state.lifelines)
  const currentRoom = useGameStore((state) => state.currentRoom)
  const setFocusedObject = useGameStore((state) => state.setFocusedObject)
  const interactFocusedObject = useGameStore((state) => state.interactFocusedObject)
  const setPointerLocked = useGameStore((state) => state.setPointerLocked)

  // Camera orientation angles
  const yaw = useRef(0)
  const pitch = useRef(0)
  const isLocked = useRef(false)

  // Set spawn position based on entered room zone
  useEffect(() => {
    const SPAWN_POINTS = {
      study: [-6.5, 1.6, -3.5],
      library: [-6.5, 1.6, 3.5],
      chapel: [5.5, 1.6, 3.5],
      attic: [-0.6, 1.6, -3.5],
      cellar: [5.5, 1.6, -3.5],
    }
    const spawn = SPAWN_POINTS[currentRoom] || [0, 1.6, 4.5]
    camera.position.set(spawn[0], spawn[1], spawn[2])
    yaw.current = 0
    pitch.current = 0
  }, [currentRoom, camera])

  // WASD movement state
  const moveState = useRef({ forward: false, backward: false, left: false, right: false })
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const lastFootstepTime = useRef(0)

  // Lights & Raycaster
  const spotlightRef = useRef()
  const candleLightRef = useRef()
  const raycaster = useRef(new THREE.Raycaster())
  const lastWarmthCheck = useRef(0)
  const lastHeartbeatAudio = useRef(0)

  useEffect(() => {
    // 1. Pointer Lock Event Handlers
    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === gl.domElement
      isLocked.current = locked
      setPointerLocked(locked)
      if (locked) {
        AudioEngine.unlock()
      }
    }

    const onPointerLockError = () => {
      isLocked.current = false
      setPointerLocked(false)
    }

    document.addEventListener('pointerlockchange', onPointerLockChange)
    document.addEventListener('pointerlockerror', onPointerLockError)

    // 2. Mouse Look Handler (Standard FPS 360° Camera Look)
    const handleMouseMove = (e) => {
      if (!isLocked.current) return

      const sensitivity = 0.0022
      yaw.current -= e.movementX * sensitivity
      pitch.current -= e.movementY * sensitivity

      // Clamp pitch between -85° and +85°
      pitch.current = Math.max(-1.48, Math.min(1.48, pitch.current))
    }

    // 3. Left Click / E to Interact with Aimed Object
    const handleMouseDown = (e) => {
      if (isGameOver) return
      // If user clicked left mouse button and has an aimed/focused object, interact immediately
      if (e.button === 0) {
        const curFocused = useGameStore.getState().focusedObject
        if (curFocused) {
          interactFocusedObject()
        }
      }
      // Ensure pointer lock is maintained
      if (!isLocked.current) {
        gl.domElement.requestPointerLock?.()
      }
    }

    // 4. Keyboard Navigation (WASD + E/Space)
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
          if (!isGameOver) interactFocusedObject()
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

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      document.removeEventListener('pointerlockerror', onPointerLockError)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (document.pointerLockElement) {
        document.exitPointerLock?.()
      }
    }
  }, [gl.domElement, interactFocusedObject, isGameOver, setPointerLocked])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const dt = Math.min(0.05, delta)

    // 1. Apply FPS Camera Rotation
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ')

    // 2. WASD Movement Dynamics
    velocity.current.x -= velocity.current.x * 10.0 * dt
    velocity.current.z -= velocity.current.z * 10.0 * dt

    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward)
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left)
    direction.current.normalize()

    const moveSpeed = 30.0
    const isMoving = moveState.current.forward || moveState.current.backward || moveState.current.left || moveState.current.right

    if (moveState.current.forward || moveState.current.backward) {
      velocity.current.z -= direction.current.z * moveSpeed * dt
    }
    if (moveState.current.left || moveState.current.right) {
      velocity.current.x -= direction.current.x * moveSpeed * dt
    }

    // Direction vector relative to camera yaw
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, yaw.current, 0))
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, yaw.current, 0))

    const dx = forward.x * (-velocity.current.z * dt) + right.x * (-velocity.current.x * dt)
    const dz = forward.z * (-velocity.current.z * dt) + right.z * (-velocity.current.x * dt)

    const colliders = activeHouse ? activeHouse.getColliders() : []
    const playerRadius = 0.28

    // Test X-axis movement with wall/furniture sliding
    let nextX = THREE.MathUtils.clamp(camera.position.x + dx, -9.4, 9.4)
    let collideX = false
    for (const b of colliders) {
      if (
        nextX + playerRadius > b.minX &&
        nextX - playerRadius < b.maxX &&
        camera.position.z + playerRadius > b.minZ &&
        camera.position.z - playerRadius < b.maxZ
      ) {
        collideX = true
        break
      }
    }
    if (!collideX) camera.position.x = nextX

    // Test Z-axis movement with wall/furniture sliding
    let nextZ = THREE.MathUtils.clamp(camera.position.z + dz, -7.4, 7.4)
    let collideZ = false
    for (const b of colliders) {
      if (
        camera.position.x + playerRadius > b.minX &&
        camera.position.x - playerRadius < b.maxX &&
        nextZ + playerRadius > b.minZ &&
        nextZ - playerRadius < b.maxZ
      ) {
        collideZ = true
        break
      }
    }
    if (!collideZ) camera.position.z = nextZ

    // Walking Head-Bob & Footstep Audio
    if (isMoving) {
      const bob = Math.sin(time * 9.5) * 0.04
      camera.position.y = 1.6 + bob

      // Trigger footstep sound at bottom of bob
      if (time - lastFootstepTime.current > 0.38) {
        AudioEngine.playFootstep()
        lastFootstepTime.current = time
      }
    } else {
      camera.position.y = 1.6 + Math.sin(time * 1.5) * 0.01 // Subtle breathing
    }

    // 3. Dynamic Carried Candle Light
    if (spotlightRef.current && candleLightRef.current) {
      spotlightRef.current.position.copy(camera.position)
      candleLightRef.current.position.copy(camera.position)

      // Aim spotlight straight ahead where player is looking
      const lookDir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation)
      spotlightRef.current.target.position.copy(camera.position).addScaledVector(lookDir, 10.0)
      spotlightRef.current.target.updateMatrixWorld()

      // Flickering candle flame intensity
      const candleFactor = Math.max(0.5, lifelines / 4)
      const flicker = Math.sin(time * 14) * 0.25 + Math.cos(time * 24) * 0.15
      spotlightRef.current.intensity = (4.8 + flicker) * candleFactor
      candleLightRef.current.intensity = (2.4 + flicker * 0.5) * candleFactor
    }

    // 4. Center Crosshair Raycasting & Intelligent Proximity Aiming
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera)
    raycaster.current.far = 8.5

    const interactives = []
    scene.traverse((obj) => {
      if (obj.userData?.isInteractive) interactives.push(obj)
    })

    const hits = raycaster.current.intersectObjects(interactives, true)
    let detectedObj = null

    if (hits.length > 0) {
      let top = hits[0].object
      while (top && !top.userData?.objData && top.parent) {
        top = top.parent
      }
      if (top?.userData?.objData) {
        detectedObj = top.userData.objData
      }
    }

    // Proximity fallback: If no direct raycast hit, check if player is close (<= 3.0m) and looking towards an object
    if (!detectedObj && interactives.length > 0) {
      const camPos = camera.position
      const camDir = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation).normalize()
      let closestDist = 3.0
      for (const item of interactives) {
        const itemPos = new THREE.Vector3()
        item.getWorldPosition(itemPos)
        const dist = camPos.distanceTo(itemPos)
        if (dist <= closestDist) {
          const toItem = itemPos.clone().sub(camPos).normalize()
          const dot = camDir.dot(toItem)
          if (dot > 0.65) {
            closestDist = dist
            detectedObj = item.userData?.objData
          }
        }
      }
    }

    setFocusedObject(detectedObj)

    // 5. Heartbeat Radar Proximity Sync (Every 450ms)
    if (time - lastWarmthCheck.current > 0.45) {
      lastWarmthCheck.current = time
      useGameStore.getState().updateWarmth(camera.position.x, camera.position.y, camera.position.z)
    }

    // 6. Audio Heartbeat Pulse based on Warmth
    const warmth = useGameStore.getState().warmth || 0.0
    if (warmth > 0.08) {
      const beatInterval = Math.max(0.45, 1.3 - warmth * 0.85)
      if (time - lastHeartbeatAudio.current > beatInterval) {
        lastHeartbeatAudio.current = time
        AudioEngine.playHeartbeat(warmth)
      }
    }
  })

  return (
    <>
      {/* Handheld Candle Flashlight */}
      <spotLight
        ref={spotlightRef}
        color="#fbbf24"
        intensity={2.8}
        distance={18.0}
        angle={Math.PI / 4.0}
        penumbra={0.65}
        decay={1.8}
        castShadow
      />

      {/* Immediate Ambient Candle Glow */}
      <pointLight
        ref={candleLightRef}
        color="#fef08a"
        intensity={1.4}
        distance={8.0}
        decay={2.0}
      />
    </>
  )
}
