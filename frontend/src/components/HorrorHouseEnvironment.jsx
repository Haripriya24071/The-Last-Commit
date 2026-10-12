import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { House, activeHouse } from './world/House'
import { useGameStore } from '../store/gameStore'

export default function HorrorHouseEnvironment() {
  const groupRef = useRef()
  const houseRef = useRef(null)
  const activeScare = useGameStore((state) => state.activeScare)

  useEffect(() => {
    if (!groupRef.current) return
    const house = new House(groupRef.current)
    houseRef.current = house

    return () => {
      house.destroy()
      houseRef.current = null
    }
  }, [])

  // React to in-game jump scares dynamically
  useEffect(() => {
    const house = houseRef.current
    if (!house) return

    if (activeScare) {
      if (activeScare.type === 'lights_out') {
        house.setBlackout(true)
        const t = setTimeout(() => {
          house.setBlackout(false)
        }, 2200)
        return () => clearTimeout(t)
      } else {
        house.flickerAll(2.2)
        house.lightningFlash()
      }
    }
  }, [activeScare])

  useFrame((state, delta) => {
    if (houseRef.current) {
      houseRef.current.update(delta, state.clock.elapsedTime)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Base soft ambient floor fill */}
      <hemisphereLight args={['#242d42', '#08080c', 0.4]} />
    </group>
  )
}
export { activeHouse }
