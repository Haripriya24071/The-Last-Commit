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
      background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)'
    }}>
      {/* Ascending Glowing Relic Candle Flame from User Reference Image */}
      <div style={{
        width: '110px',
        height: '150px',
        borderRadius: '6px',
        overflow: 'hidden',
        border: '2px solid #fbbf24',
        boxShadow: '0 0 50px #f59e0b, 0 0 90px #fbbf24',
        animation: 'candleFlicker 0.4s infinite'
      }}>
        <img
          src="/assets/candle_returns.jpg"
          alt="Relic Ignited"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{
        fontFamily: 'Cinzel Decorative, serif',
        fontSize: '24px',
        color: '#fbbf24',
        letterSpacing: '2px',
        marginTop: '16px',
        textShadow: '0 0 20px #f59e0b',
        fontWeight: 700
      }}>
        SANCTUARY FLAME IGNITED
      </div>
    </div>
  )
}
