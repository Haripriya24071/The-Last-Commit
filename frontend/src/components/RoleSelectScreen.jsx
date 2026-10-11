import React from 'react'
import { useGameStore } from '../store/gameStore'

export default function RoleSelectScreen() {
  const {
    role,
    rolePresence,
    setRole,
    setScreen,
    repoUrl
  } = useGameStore()

  // The 3 Entities using the EXACT images from the reference PDF:
  // - Skeleton: Reference Image 1 (skeleton_character.jpg)
  // - Reaper: Reference Image 6 (reaper_character.jpg)
  // - Ghost: Reference Image 7 (ghost_character.jpg)
  const rolesConfig = [
    {
      id: 'ghost',
      title: 'THE GHOST',
      archetype: 'Spectral Lady of the Staircase',
      image: '/assets/ghost_character.jpg',
      description: 'Veiled phantom descending the manor stairs. Senses abandoned logic, dead branches, bare exceptions, and forgotten functions.',
      themeColor: '#38bdf8',
      borderColor: '#38bdf8',
      scent: 'TARGETS: Dead Functions • Bare Exceptions • Unused Imports'
    },
    {
      id: 'reaper',
      title: 'THE REAPER',
      archetype: 'Shadow Wraith of the Mist',
      image: '/assets/reaper_character.jpg',
      description: 'Towering entity in tattered cowls with clawed talons and billowing smoke. Senses committed secrets, leaked API keys, and injection holes.',
      themeColor: '#ef4444',
      borderColor: '#ef4444',
      scent: 'TARGETS: Exposed .env • Hardcoded Tokens • Dangerous Eval'
    },
    {
      id: 'skeleton',
      title: 'THE SKELETON',
      archetype: 'Root Tendon Beast',
      image: '/assets/skeleton_character.jpg',
      description: 'Slender, horrifying creature woven from roots, bone, and dark sinew in the stone arch. Senses rotting complexity and bloated files.',
      themeColor: '#f59e0b',
      borderColor: '#f59e0b',
      scent: 'TARGETS: High Complexity • Bloated Files • Unresolved Debt'
    }
  ]

  const handleSelectRole = (selectedId) => {
    setRole(selectedId)
    setScreen('repo_input')
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#040306',
      backgroundImage: 'url(/assets/mansion_exterior_gates.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px 36px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Heavy Dark Fog & Vignette Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(4, 3, 6, 0.85) 0%, rgba(4, 3, 6, 0.92) 100%)',
        pointerEvents: 'none'
      }} />

      {/* Header Bar */}
      <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
        <span style={{
          fontSize: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#f87171',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontWeight: 800
        }}>
          ESTATE GATES • CHOOSE YOUR MANIFESTATION
        </span>

        <h2 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '32px',
          fontWeight: 900,
          color: '#fca5a5',
          margin: '4px 0 0 0',
          letterSpacing: '2px',
          textShadow: '0 0 25px rgba(239, 68, 68, 0.6)'
        }}>
          WHICH SPECTRE WALKS WITH YOU?
        </h2>
      </div>

      {/* The 3 Character Persona Cards using Exact PDF Images */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        maxWidth: '1120px',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        {rolesConfig.map((r) => {
          const presence = rolePresence[r.id] || 'strong'
          const isCurrent = role === r.id

          return (
            <div
              key={r.id}
              onClick={() => handleSelectRole(r.id)}
              style={{
                background: 'rgba(10, 8, 14, 0.95)',
                border: `2px solid ${isCurrent ? r.borderColor : 'rgba(255, 255, 255, 0.12)'}`,
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isCurrent ? `0 0 35px ${r.borderColor}` : '0 10px 40px rgba(0,0,0,0.9)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = r.borderColor
                e.currentTarget.style.boxShadow = `0 0 35px ${r.borderColor}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = isCurrent ? r.borderColor : 'rgba(255, 255, 255, 0.12)'
                e.currentTarget.style.boxShadow = isCurrent ? `0 0 35px ${r.borderColor}` : '0 10px 40px rgba(0,0,0,0.9)'
              }}
            >
              {/* Exact Character Image from PDF */}
              <div style={{
                width: '100%',
                height: '240px',
                overflow: 'hidden',
                position: 'relative',
                background: '#000'
              }}>
                <img
                  src={r.image}
                  alt={r.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    filter: 'contrast(1.1) brightness(0.95)',
                    display: 'block'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(10, 8, 14, 1) 0%, transparent 60%)'
                }} />

                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontSize: '9px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: presence === 'strong' ? '#065f46' : '#854d0e',
                  color: '#fff',
                  letterSpacing: '1px'
                }}>
                  {presence.toUpperCase()}
                </span>
              </div>

              {/* Persona Description */}
              <div style={{ padding: '0 20px 20px 20px' }}>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: r.themeColor,
                  fontWeight: 800,
                  letterSpacing: '1px'
                }}>
                  {r.archetype.toUpperCase()}
                </span>

                <h3 style={{
                  fontFamily: 'Cinzel Decorative, serif',
                  fontSize: '20px',
                  color: '#fff',
                  margin: '4px 0 8px 0'
                }}>
                  {r.title}
                </h3>

                <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: 1.4, margin: '0 0 14px 0' }}>
                  {r.description}
                </p>

                <div style={{
                  padding: '6px 10px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#cbd5e1',
                  marginBottom: '16px'
                }}>
                  {r.scent}
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: isCurrent ? r.borderColor : 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  {isCurrent ? 'ACTIVE ENTITY' : 'CHOOSE SPECTRE'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
