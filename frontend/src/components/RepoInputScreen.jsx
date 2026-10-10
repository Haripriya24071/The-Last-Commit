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
      // Default to sample if empty
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
      background: 'radial-gradient(circle at 50% 50%, #171025 0%, #050308 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      
      {/* 1. Main Repo Card */}
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: 'rgba(18, 14, 28, 0.92)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '20px',
        padding: '36px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '36px' }}>🕸️📜</span>
          <h2 style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '26px',
            color: '#ef4444',
            margin: '8px 0 4px 0',
            letterSpacing: '2px',
            textShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
          }}>
            CHOOSE YOUR TARGET CODEBASE
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
            Enter a public GitHub repository or take the cursed sample house.
          </p>
        </div>

        {/* Fallback Notification Banner if prior scan fell back */}
        {fallbackReason && (
          <div style={{
            background: 'rgba(120, 53, 15, 0.4)',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <div style={{ fontSize: '12px', color: '#fde68a' }}>
              <strong>FALLBACK TO SAMPLE:</strong> {fallbackReason}
            </div>
          </div>
        )}

        {/* Scan Error & Timeout Box */}
        {scanError && (
          <div style={{
            background: 'rgba(127, 29, 29, 0.5)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '18px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '13px', color: '#fca5a5', marginBottom: '10px' }}>
              ⚠️ {scanError}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => handleScan(inputUrl)}
                style={{
                  padding: '6px 14px',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🔄 Retry Scan
              </button>
              <button
                onClick={() => handleScan('sample')}
                style={{
                  padding: '6px 14px',
                  background: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🏚️ Use the Cursed House
              </button>
            </div>
          </div>
        )}

        {/* Instant Sample Repo Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => handleScan('sample')}
            disabled={isScanning}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(185, 28, 28, 0.35) 0%, rgba(127, 29, 29, 0.2) 100%)',
              border: '2px dashed #ef4444',
              borderRadius: '12px',
              color: '#fff',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'background 0.2s, transform 0.15s',
              textAlign: 'left'
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🏚️</span>
                <span>TAKE THE CURSED SAMPLE HOUSE</span>
                <span style={{ fontSize: '10px', background: '#dc2626', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                  INSTANT & GUARANTEED
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                Pre-planted haunted artifacts across Ghost, Reaper, and Skeleton roles with 100% offline security.
              </p>
            </div>
            <span style={{ fontSize: '20px', color: '#ef4444' }}>→</span>
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '18px 0',
          color: '#6b7280',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span>OR SCAN A LIVE GITHUB REPOSITORY</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* GitHub Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '11px',
            color: '#9ca3af',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '6px',
            letterSpacing: '1px'
          }}>
            GITHUB REPOSITORY URL:
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value)
                setValidationError(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="https://github.com/owner/repository"
              disabled={isScanning}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(9, 6, 15, 0.8)',
                border: `1px solid ${validationError ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleScan()}
              disabled={isScanning}
              style={{
                padding: '12px 24px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: isScanning ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                whiteSpace: 'nowrap'
              }}
            >
              ⚡ SCAN REPO
            </button>
          </div>

          {validationError && (
            <p style={{ margin: '6px 0 0 0', color: '#f87171', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>
              ⚠️ {validationError}
            </p>
          )}
        </div>

        {/* Verified Quick Demo Links */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>VERIFIED DEMOS:</span>
          {[
            { label: '🐍 pallets/click (Python)', url: 'https://github.com/pallets/click' },
            { label: '⚡ expressjs/express (JS)', url: 'https://github.com/expressjs/express' }
          ].map((demo) => (
            <button
              key={demo.url}
              onClick={() => {
                setInputUrl(demo.url)
                handleScan(demo.url)
              }}
              disabled={isScanning}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Back Button */}
        <div style={{ marginTop: '24px' }}>
          <button
            onClick={() => setScreen('welcome')}
            disabled={isScanning}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#9ca3af',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            ← BACK
          </button>
        </div>
      </div>

      {/* 2. Animated Ritual Scanning Overlay */}
      {isScanning && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 3, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 80
        }}>
          <div style={{
            fontSize: '68px',
            animation: 'candleFlicker 1.2s infinite',
            filter: 'drop-shadow(0 0 25px #ef4444)',
            marginBottom: '20px'
          }}>
            🔮✨
          </div>

          <h2 style={{
            fontFamily: 'Cinzel Decorative, serif',
            fontSize: '28px',
            color: '#ef4444',
            margin: 0,
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(239, 68, 68, 0.6)'
          }}>
            PERFORMING CODE RITUAL
          </h2>

          <p style={{
            color: '#fca5a5',
            fontSize: '14px',
            fontFamily: 'JetBrains Mono, monospace',
            margin: '12px 0 24px 0',
            textAlign: 'center'
          }}>
            {scanProgressMessage}
          </p>

          <div style={{
            width: '320px',
            height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '9999px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #dc2626, #f59e0b, #38bdf8)',
              animation: 'shakeScreen 1.5s infinite linear',
              borderRadius: '9999px'
            }} />
          </div>

          <span style={{
            fontSize: '11px',
            color: '#6b7280',
            marginTop: '16px',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            Phase: Cloning (--depth 50) ➡️ AST Parsing ➡️ 5-Room Balancing ➡️ Role Presence
          </span>
        </div>
      )}
    </div>
  )
}
