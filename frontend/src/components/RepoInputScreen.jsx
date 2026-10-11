import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function RepoInputScreen() {
  const {
    repoUrl,
    setRepoUrl,
    isScanning,
    scanProgressMessage,
    runScanRitual
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
      background: '#040306',
      backgroundImage: 'url(/assets/repo_frame_staircase.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
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
      {/* Heavy Dark Atmospheric Gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(4, 3, 6, 0.78) 0%, rgba(4, 3, 6, 0.94) 100%)',
        pointerEvents: 'none'
      }} />

      {/* The Broken Picture Frame Attachment Box (Exact Reference Image 14 aesthetic) */}
      <div style={{
        maxWidth: '640px',
        width: '100%',
        background: 'rgba(12, 10, 16, 0.94)',
        border: '3px solid #78350f',
        borderRadius: '8px',
        padding: '36px 40px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.98), inset 0 0 35px rgba(0,0,0,0.9)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{
            fontSize: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            color: '#f59e0b',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 800
          }}>
            SHATTERED PORTRAIT VESSEL
          </span>
          <h2 style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '28px',
            color: '#f87171',
            margin: '6px 0 8px 0',
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
          }}>
            FEED THE REPOSITORY
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>
            Inscribe your target GitHub repository into the frame. The AST scanner will rebuild its architecture into the haunted mansion.
          </p>
        </div>

        {/* Input Bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            background: 'rgba(5, 4, 8, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '6px',
            padding: '6px',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.9)'
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
                padding: '10px 24px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: isScanning ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)'
              }}
            >
              INSCRIBE
            </button>
          </div>

          {validationError && (
            <p style={{ color: '#f87171', fontSize: '11px', margin: '8px 0 0 6px', fontFamily: 'JetBrains Mono, monospace' }}>
              ERROR: {validationError}
            </p>
          )}
          {scanError && (
            <p style={{ color: '#ef4444', fontSize: '11px', margin: '8px 0 0 6px', fontFamily: 'JetBrains Mono, monospace' }}>
              ERROR: {scanError}
            </p>
          )}
        </div>

        {/* Cursed Sample House Option */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '18px'
        }}>
          <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>OR</span>
          <button
            onClick={() => handleScan('sample')}
            disabled={isScanning}
            style={{
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fde68a',
              padding: '10px 20px',
              borderRadius: '6px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isScanning ? 'not-allowed' : 'pointer'
            }}
          >
            ENTER THE CURSED SAMPLE ESTATE (Offline Safe)
          </button>
        </div>
      </div>

      {/* Scanning Ritual Animation Overlay */}
      {isScanning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(4, 3, 6, 0.96)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 90
        }}>
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
