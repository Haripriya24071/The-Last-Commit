import React, { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function CandleLightRelicAnimation() {
  const { activeRelicModal } = useGameStore()
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (activeRelicModal) {
      setShowAnimation(true)
      const timer = setTimeout(() => {
        setShowAnimation(false)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [activeRelicModal])

  if (!showAnimation) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 55,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)'
    }}>
      {/* Ascending Glowing Relic Candle Flame */}
      <div style={{
        fontSize: '84px',
        animation: 'candleFlicker 0.4s infinite',
        filter: 'drop-shadow(0 0 35px #f59e0b) drop-shadow(0 0 60px #fbbf24)'
      }}>
        🕯️✨
      </div>
      <div style={{
        fontFamily: 'Cinzel Decorative, serif',
        fontSize: '24px',
        color: '#fbbf24',
        letterSpacing: '2px',
        marginTop: '12px',
        textShadow: '0 0 20px #f59e0b',
        fontWeight: 700
      }}>
        SANCTUARY FLAME IGNITED
      </div>
    </div>
  )
}
