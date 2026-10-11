import React from 'react'

/**
 * Placeholder Dashboard component.
 * Receives an `onEnter` callback prop to transition into the game or other views.
 * Designed to be replaced or customized.
 */
export default function Dashboard({ onEnter }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #120e1e 0%, #050308 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: 'rgba(18, 14, 28, 0.92)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '16px',
        padding: '36px',
        textAlign: 'center',
        boxShadow: '0 10px 35px rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{
          width: '54px',
          height: '76px',
          margin: '0 auto 16px auto',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <img src="/assets/candle_returns.jpg" alt="Estate Seal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <h2 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '26px',
          color: '#ef4444',
          margin: '0 0 8px 0',
          letterSpacing: '2px'
        }}>
          INVESTIGATOR DASHBOARD
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          Customizable dashboard view. Review prior haunted expeditions, check detection plugin metrics, or enter the mansion.
        </p>

        <button
          onClick={() => onEnter && onEnter()}
          style={{
            padding: '14px 28px',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)'
          }}
        >
          ENTER THE CURSED MANSION →
        </button>
      </div>
    </div>
  )
}
