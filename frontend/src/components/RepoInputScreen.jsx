import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function RepoInputScreen() {
  const {
    repoUrl,
    setRepoUrl,
    isScanning,
    scanProgressMessage,
    runScanRitual,
    setScreen,
    fallbackReason
  } = useGameStore()

  const [inputUrl, setInputUrl] = useState(repoUrl === 'sample' ? '' : repoUrl)
  const [validationError, setValidationError] = useState(null)
  const [scanError, setScanError] = useState(null)

  const validateUrl = (url) => {
    if (!url || url.toLowerCase() === 'sample' || url.toLowerCase() === 'cursed') return true
    const regex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)(?:\.git)?(?:\/.*)?$/
    return regex.test(url.trim())
  }

  const handleScan = async (urlToScan) => {
    setValidationError(null)
    setScanError(null)

    const target = urlToScan !== undefined ? urlToScan : inputUrl.trim()
    if (!target) {
      setRepoUrl('sample')
      runScanRitual('sample')
      return
    }

    if (!validateUrl(target)) {
      setValidationError("Invalid URL. Expected format: 'https://github.com/owner/repository'")
      return
    }

    setRepoUrl(target)
    try {
      const res = await runScanRitual(target)
      if (!res) {
        setScanError("Scan timed out or encountered an error reaching GitHub.")
      }
    } catch (err) {
      setScanError("Failed to communicate with the backend scanner.")
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 30%, #161c28 0%, #0a0e16 50%, #020306 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Grand Staircase & Cracked Walls (Reference Image 14) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to bottom, rgba(8, 6, 14, 0.7), rgba(2, 2, 4, 0.96)),
          radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.05) 0%, transparent 60%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Hanging Iron Chandelier Silhouette */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        fontSize: '48px',
        opacity: 0.35,
        filter: 'drop-shadow(0 0 20px #f59e0b)',
        pointerEvents: 'none'
      }}>
        🕯️
      </div>

      {/* The Spooky Broken Photo Frame (Reference Image 14) */}
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: '#0c0a14',
        backgroundImage: 'radial-gradient(circle at 50% 50%, #181224 0%, #0c0a14 100%)',
        border: '8px solid #332014',
        outline: '3px solid #78350f',
        borderRadius: '12px',
        padding: '36px 44px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.95), inset 0 0 40px rgba(0,0,0,0.9), 0 0 35px rgba(120, 53, 15, 0.4)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Cracked Glass Overlays across the frame */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: '40px',
          width: '2px',
          height: '70px',
          background: 'rgba(255,255,255,0.15)',
          transform: 'rotate(25deg)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '60px',
          width: '2px',
          height: '90px',
          background: 'rgba(255,255,255,0.12)',
          transform: 'rotate(-35deg)',
          pointerEvents: 'none'
        }} />

        {/* Frame Plaque Header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <span style={{
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#f59e0b',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 800
          }}>
            VESSEL OF THE CURSED REPOSITORY
          </span>
          <h2 style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '28px',
            color: '#f87171',
            margin: '6px 0 8px 0',
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
          }}>
            FEED THE HOUSE
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Inscribe a GitHub repository URL into the shattered portrait to rebuild its architecture into the haunted estate.
          </p>
        </div>

        {/* Input Bar inside Frame */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            background: 'rgba(5, 5, 8, 0.9)',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            padding: '6px',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)'
          }}>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://github.com/owner/repository"
              disabled={isScanning}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleScan()
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                padding: '10px 14px',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleScan()}
              disabled={isScanning}
              style={{
                padding: '10px 22px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                fontWeight: 800,
                cursor: isScanning ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 15px rgba(220, 38, 38, 0.6)'
              }}
            >
              <span>🕯️</span>
              <span>INSCRIBE</span>
            </button>
          </div>

          {validationError && (
            <p style={{ color: '#f87171', fontSize: '11px', margin: '8px 0 0 6px', fontFamily: 'JetBrains Mono, monospace' }}>
              ⚠️ {validationError}
            </p>
          )}
          {scanError && (
            <p style={{ color: '#ef4444', fontSize: '11px', margin: '8px 0 0 6px', fontFamily: 'JetBrains Mono, monospace' }}>
              ❌ {scanError}
            </p>
          )}
        </div>

        {/* Or Cursed Built-in House */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '20px'
        }}>
          <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>OR</span>
          <button
            onClick={() => handleScan('sample')}
            disabled={isScanning}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fde68a',
              padding: '10px 20px',
              borderRadius: '8px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isScanning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🏚️</span>
            <span>ENTER THE CURSED SAMPLE ESTATE (Offline Safe)</span>
          </button>
        </div>
      </div>

      {/* Scanning Ritual Animation Overlay */}
      {isScanning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 5, 8, 0.95)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 90
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px',
            animation: 'candleFlicker 1s infinite'
          }}>
            🕯️👁️
          </div>
          <h3 style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '26px',
            color: '#ef4444',
            margin: '0 0 8px 0',
            letterSpacing: '2px'
          }}>
            RECONSTRUCTING ESTATE FROM AST...
          </h3>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            color: '#fca5a5',
            margin: 0
          }}>
            {scanProgressMessage || 'Binding AST detectors to Victorian chambers...'}
          </p>
        </div>
      )}
    </div>
  )
}
