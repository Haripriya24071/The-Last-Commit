import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

export default function FirstPersonController() {
  const { camera, scene, gl } = useThree()
  const updateWarmth = useGameStore((state) => state.warmth)
  const setFocusedObject = useGameStore((state) => state.setFocusedObject)
  const interactFocusedObject = useGameStore((state) => state.interactFocusedObject)
  const isGameOver = useGameStore((state) => state.isGameOver)
  const lifelines = useGameStore((state) => state.lifelines)

  // 180° Free Cursor Flashlight Look State (Inspired by tech lead engine but with candle physics)
  const pn = useRef({ x: 0, y: 0 })
  const angles = useRef({ yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 })
  const spotlightRef = useRef()
  const candleLightRef = useRef()
  const raycaster = useRef(new THREE.Raycaster())
  const lastWarmthCheck = useRef(0)

  // WASD movement within Victorian chamber
  const moveState = useRef({ forward: false, backward: false, left: false, right: false })
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())

  useEffect(() => {
    // Ensure mouse cursor is visible and free
    document.body.style.cursor = 'default'
    if (document.pointerLockElement) {
      document.exitPointerLock?.()
    }

    // Free Cursor flashlight aiming + 180° screen-edge turning
    const handlePointerMove = (e) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 2
      const dy = (e.clientY / window.innerHeight - 0.5) * 2
      const edgeThreshold = (v, k) => Math.sign(v) * Math.max(0, Math.abs(v) - k) / (1 - k)

      pn.current.x = dx
      pn.current.y = -dy

      // Smooth 180° edge panning (turns camera when mouse pushes near borders)
      angles.current.targetYaw = -(edgeThreshold(dx, 0.42) * 1.35 + dx * 0.12)
      angles.current.targetPitch = -(edgeThreshold(dy, 0.52) * 0.45 + dy * 0.05)
    }

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

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [interactFocusedObject, isGameOver])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const dt = Math.min(0.05, delta)

    // 1. Smooth 180° camera rotation interpolation
    angles.current.yaw += (angles.current.targetYaw - angles.current.yaw) * Math.min(1, dt * 5.0)
    angles.current.pitch += (angles.current.targetPitch - angles.current.pitch) * Math.min(1, dt * 5.0)

    // Subtle breathing camera bobbing
    camera.rotation.set(
      angles.current.pitch + Math.sin(time * 1.2) * 0.006,
      angles.current.yaw + Math.cos(time * 0.8) * 0.005,
      Math.sin(time * 0.9) * 0.004,
      'YXZ'
    )

    // 2. WASD Movement in the Victorian Room
    velocity.current.x -= velocity.current.x * 10.0 * dt
    velocity.current.z -= velocity.current.z * 10.0 * dt

    direction.current.z = Number(moveState.current.forward) - Number(moveState.current.backward)
    direction.current.x = Number(moveState.current.right) - Number(moveState.current.left)
    direction.current.normalize()

    const moveSpeed = 28.0
    if (moveState.current.forward || moveState.current.backward) {
      velocity.current.z -= direction.current.z * moveSpeed * dt
    }
    if (moveState.current.left || moveState.current.right) {
      velocity.current.x -= direction.current.x * moveSpeed * dt
    }

    // Move forward/back along camera yaw orientation
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(0, camera.rotation.y, 0))
    const right = new THREE.Vector3(1, 0, 0).applyEuler(new THREE.Euler(0, camera.rotation.y, 0))

    camera.position.addScaledVector(forward, -velocity.current.z * dt)
    camera.position.addScaledVector(right, -velocity.current.x * dt)

    // Clamp inside Victorian room boundaries (-5.6m to +5.6m)
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -5.6, 5.6)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.6, 5.6)
    camera.position.y = 1.6 // Eye height

    // 3. Dynamic Carried Candle Light (Follows mouse cursor in real-time 3D space!)
    if (spotlightRef.current && candleLightRef.current) {
      // Light origin right at camera position
      spotlightRef.current.position.copy(camera.position)
      candleLightRef.current.position.copy(camera.position)

      // Unproject mouse direction to point candlelight beam directly at cursor
      const mouseRay = new THREE.Vector3(pn.current.x, pn.current.y, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize()

      spotlightRef.current.target.position.copy(camera.position).addScaledVector(mouseRay, 10.0)
      spotlightRef.current.target.updateMatrixWorld()

      // Flickering candle flame intensity (dimmer as lifelines die)
      const candlePowerFactor = Math.max(0.4, lifelines / 4)
      const flicker = Math.sin(time * 16) * 0.15 + Math.cos(time * 28) * 0.08
      spotlightRef.current.intensity = (2.2 + flicker) * candlePowerFactor
      candleLightRef.current.intensity = (1.2 + flicker * 0.5) * candlePowerFactor
    }

    // 4. Cursor Raycasting for Interactive Anomaly Inspection
    const mouseNorm = new THREE.Vector2(pn.current.x, pn.current.y)
    raycaster.current.setFromCamera(mouseNorm, camera)
    raycaster.current.far = 7.5

    const interactives = []
    scene.traverse((obj) => {
      if (obj.userData?.isInteractive) interactives.push(obj)
    })

    const hits = raycaster.current.intersectObjects(interactives, true)
    if (hits.length > 0) {
      let top = hits[0].object
      while (top && !top.userData?.objData && top.parent) {
        top = top.parent
      }
      if (top?.userData?.objData) {
        setFocusedObject(top.userData.objData)
      } else {
        setFocusedObject(null)
      }
    } else {
      setFocusedObject(null)
    }
  })

  return (
    <>
      {/* Carried Candle Spotlight Aimed by Cursor */}
      <spotLight
        ref={spotlightRef}
        color="#fbbf24"
        intensity={2.4}
        distance={16.0}
        angle={Math.PI / 4.2}
        penumbra={0.7}
        decay={1.8}
        castShadow
      />

      {/* Immediate Ambient Candle Glow */}
      <pointLight
        ref={candleLightRef}
        color="#fef08a"
        intensity={1.2}
        distance={7.0}
        decay={2.2}
      />
    </>
  )
}
