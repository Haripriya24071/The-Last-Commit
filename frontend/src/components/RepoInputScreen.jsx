import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export default function RepoInputScreen() {
  const {
    repoUrl,
    setRepoUrl,
    setScreen
  } = useGameStore()

  const [inputUrl, setInputUrl] = useState(repoUrl === 'sample' ? '' : repoUrl)
  const [validationError, setValidationError] = useState(null)

  const validateUrl = (url) => {
    if (!url || url.toLowerCase() === 'sample' || url.toLowerCase() === 'cursed') return true
    const regex = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)(?:\.git)?(?:\/.*)?$/
    return regex.test(url.trim())
  }

  const handleProceed = (urlToUse) => {
    setValidationError(null)
    const target = urlToUse !== undefined ? urlToUse : inputUrl.trim()

    if (!target) {
      setRepoUrl('sample')
      setScreen('role_select')
      return
    }

    if (!validateUrl(target)) {
      setValidationError("Invalid URL. Expected format: 'https://github.com/owner/repository'")
      return
    }

    setRepoUrl(target)
    // Moves to Step 5: Character / Role Selection (no loop!)
    setScreen('role_select')
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
      {/* Heavy Dark Atmospheric Gradient for depth */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(4, 3, 6, 0.65) 0%, rgba(4, 3, 6, 0.95) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Back button to re-edit name if desired */}
      <button
        onClick={() => setScreen('landing')}
        style={{
          position: 'absolute',
          top: '24px',
          left: '28px',
          background: 'rgba(10, 8, 14, 0.7)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#9ca3af',
          padding: '8px 16px',
          borderRadius: '4px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          letterSpacing: '1px',
          cursor: 'pointer',
          zIndex: 20
        }}
      >
        ← BACK TO CLUE
      </button>

      {/* ========================================================
          ORNATE ANTIQUE VICTORIAN PICTURE FRAME (PHOTOFRAME)
          Multi-tiered sculpted gold leaf & aged mahogany frame moulding
      ======================================================== */}
      <div style={{
        position: 'relative',
        maxWidth: '680px',
        width: '100%',
        zIndex: 10,
        animation: 'frameFadeIn 0.8s ease-out'
      }}>
        {/* Outer Heavy Baroque Carved Molding */}
        <div style={{
          background: 'linear-gradient(135deg, #2b1810 0%, #150b07 40%, #3e2216 70%, #170c08 100%)',
          padding: '18px',
          borderRadius: '14px',
          boxShadow: `
            0 35px 100px rgba(0, 0, 0, 0.98),
            0 0 60px rgba(0, 0, 0, 0.9),
            0 0 40px rgba(245, 158, 11, 0.25),
            inset 0 0 20px rgba(0,0,0,0.9)
          `,
          border: '3px solid #78350f',
          position: 'relative'
        }}>
          {/* 4 Antique Gilded Baroque Corner Ornaments (Filigree Accents) */}
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '8px',
            fontSize: '22px',
            color: '#fbbf24',
            filter: 'drop-shadow(0 0 6px #d97706)',
            pointerEvents: 'none',
            userSelect: 'none'
          }}>⚜</div>
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            fontSize: '22px',
            color: '#fbbf24',
            filter: 'drop-shadow(0 0 6px #d97706)',
            pointerEvents: 'none',
            userSelect: 'none'
          }}>⚜</div>
          <div style={{
            position: 'absolute',
            bottom: '6px',
            left: '8px',
            fontSize: '22px',
            color: '#fbbf24',
            filter: 'drop-shadow(0 0 6px #d97706)',
            pointerEvents: 'none',
            userSelect: 'none'
          }}>⚜</div>
          <div style={{
            position: 'absolute',
            bottom: '6px',
            right: '8px',
            fontSize: '22px',
            color: '#fbbf24',
            filter: 'drop-shadow(0 0 6px #d97706)',
            pointerEvents: 'none',
            userSelect: 'none'
          }}>⚜</div>

          {/* Gold Leaf Inner Bevel Trim */}
          <div style={{
            border: '3px solid #d97706',
            borderRadius: '8px',
            padding: '4px',
            background: 'linear-gradient(to right, #92400e, #d97706, #78350f, #d97706, #92400e)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.7)'
          }}>
            {/* Deep Canvas Mount & Inner Shadow (Portrait Well) */}
            <div style={{
              background: 'radial-gradient(circle at 50% 30%, #140d18 0%, #08060c 100%)',
              borderRadius: '6px',
              padding: '36px 38px',
              boxShadow: 'inset 0 0 50px rgba(0,0,0,0.95)',
              border: '2px solid rgba(0,0,0,0.9)',
              position: 'relative'
            }}>

              {/* Antique Engraved Brass Plaque at Top of Canvas */}
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{
                  padding: '3px 18px',
                  background: 'linear-gradient(to bottom, #78350f 0%, #451a03 100%)',
                  border: '1px solid #d97706',
                  borderRadius: '3px',
                  color: '#fef3c7',
                  fontSize: '9px',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  marginBottom: '10px'
                }}>
                  ✦ SHATTERED PORTRAIT VESSEL ✦
                </div>

                <h2 style={{
                  fontFamily: 'Cinzel Decorative, serif',
                  fontSize: '28px',
                  fontWeight: 900,
                  color: '#fca5a5',
                  margin: '0 0 8px 0',
                  letterSpacing: '2px',
                  textShadow: '0 0 25px rgba(239, 68, 68, 0.6)'
                }}>
                  FEED THE REPOSITORY
                </h2>

                <p style={{
                  color: '#9ca3af',
                  fontSize: '13px',
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: '500px'
                }}>
                  Inscribe your target GitHub repository into the frame. The AST scanner will rebuild its architecture into the haunted estate.
                </p>
              </div>

              {/* Input Field Inside the Frame */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  background: 'rgba(5, 4, 8, 0.95)',
                  border: '2px solid rgba(239, 68, 68, 0.65)',
                  borderRadius: '6px',
                  padding: '6px',
                  boxShadow: 'inset 0 4px 14px rgba(0,0,0,0.95), 0 0 20px rgba(239, 68, 68, 0.25)'
                }}>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleProceed()
                    }}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '13px',
                      padding: '12px 14px',
                      outline: 'none'
                    }}
                  />

                  <button
                    onClick={() => handleProceed()}
                    style={{
                      padding: '12px 28px',
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 800,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      boxShadow: '0 0 25px rgba(220, 38, 38, 0.7)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    INSCRIBE →
                  </button>
                </div>

                {validationError && (
                  <p style={{
                    color: '#f87171',
                    fontSize: '11px',
                    margin: '8px 0 0 6px',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    ERROR: {validationError}
                  </p>
                )}
              </div>

              {/* Cursed Sample House Alternative */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                paddingTop: '20px'
              }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'JetBrains Mono, monospace' }}>
                  OR
                </span>

                <button
                  onClick={() => handleProceed('sample')}
                  style={{
                    background: 'rgba(28, 20, 32, 0.85)',
                    border: '1px solid rgba(245, 158, 11, 0.45)',
                    color: '#fde68a',
                    padding: '10px 22px',
                    borderRadius: '6px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ENTER THE CURSED SAMPLE ESTATE (Offline Safe)
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes frameFadeIn {
          from { opacity: 0; transform: scale(0.96) translateY(15px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
