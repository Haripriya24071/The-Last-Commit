import React from 'react'
import { useGameStore } from '../store/gameStore'

export default function RoleSelectScreen() {
  const {
    role,
    rolePresence,
    setRole,
    setScreen,
    fetchMansionMap,
    repoUrl
  } = useGameStore()

  // The 3 Entities directly based on User's Visual Reference PDF:
  // - Skeleton: Root-tendon creature in stone arch (Image 1)
  // - Reaper: Black mist wraith with clawed hands (Image 6)
  // - Ghost: Veiled spectral figure descending staircase (Image 7)
  const rolesConfig = [
    {
      id: 'ghost',
      title: 'THE VEILED GHOST',
      archetype: 'Spectral Lady of the Staircase',
      referenceTag: 'Reference Image 7',
      description: 'Ethereal veiled phantom descending the dark manor staircase. Senses abandoned logic, dead branches, bare exceptions, and forgotten functions.',
      themeColor: '#38bdf8',
      visualIcon: '👻',
      auraColor: 'rgba(56, 189, 248, 0.25)',
      borderColor: '#38bdf8',
      scent: 'Smells: Dead Code, Empty Catches, Unreachable Logic'
    },
    {
      id: 'reaper',
      title: 'THE SHADOW REAPER',
      archetype: 'Clawed Wraith of the Mist',
      referenceTag: 'Reference Image 6',
      description: 'Towering entity in tattered black cowls with reaching clawed talons and billowing smoke. Senses committed secrets, leaked API keys, and injection vulnerabilities.',
      themeColor: '#ef4444',
      visualIcon: '💀',
      auraColor: 'rgba(239, 68, 68, 0.3)',
      borderColor: '#ef4444',
      scent: 'Smells: Exposed .env Secrets, Hardcoded Keys, Eval Injections'
    },
    {
      id: 'skeleton',
      title: 'THE ROOT SKELETON',
      archetype: 'Emaciated Tendon Beast',
      referenceTag: 'Reference Image 1',
      description: 'Slender, horrifying creature woven from ancient roots, bare bone, and dark sinew standing in the stone arch. Senses rotting architectural complexity and massive bloated files.',
      themeColor: '#f59e0b',
      visualIcon: '🦴',
      auraColor: 'rgba(245, 158, 11, 0.25)',
      borderColor: '#f59e0b',
      scent: 'Smells: Cyclomatic Debt, Bloated Files, Unresolved TODOs'
    }
  ]

  const handleSelectRole = (selectedId) => {
    setRole(selectedId)
    // Moves to Screen 4: The Broken Frame Repo Input on the Staircase (Reference Image 14)
    setScreen('repo_input')
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 25%, #141b24 0%, #080a10 50%, #020204 100%)',
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
      {/* Background Gothic Gate Silhouette (Reference Image 17) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to bottom, rgba(5, 5, 8, 0.6), rgba(3, 2, 6, 0.95)),
          radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 70%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Estate Gates Header Bar */}
      <div style={{ textAlign: 'center', marginBottom: '28px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '9999px',
          fontSize: '11px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#fca5a5',
          marginBottom: '10px'
        }}>
          <span>🏰</span>
          <span>ESTATE GATES • CHOOSE YOUR MANIFESTATION</span>
        </div>

        <h2 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '32px',
          fontWeight: 900,
          color: '#f87171',
          margin: 0,
          letterSpacing: '2px',
          textShadow: '0 0 25px rgba(239, 68, 68, 0.5)'
        }}>
          WHICH SPECTRE WALKS WITH YOU?
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: '6px 0 0 0' }}>
          Each entity is tuned to detect different paranormal code flaws hiding inside the mansion.
        </p>
      </div>

      {/* The 3 Character Persona Cards (Matching Visual References 1, 6, 7) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        maxWidth: '1180px',
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
                background: 'rgba(16, 14, 26, 0.94)',
                border: `2px solid ${isCurrent ? r.borderColor : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '16px',
                padding: '28px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isCurrent ? `0 0 40px ${r.auraColor}` : '0 10px 30px rgba(0,0,0,0.8)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = r.borderColor
                e.currentTarget.style.boxShadow = `0 0 35px ${r.auraColor}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = isCurrent ? r.borderColor : 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.boxShadow = isCurrent ? `0 0 40px ${r.auraColor}` : '0 10px 30px rgba(0,0,0,0.8)'
              }}
            >
              {/* Top Persona Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    background: r.auraColor,
                    border: `1px solid ${r.borderColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '34px',
                    boxShadow: `0 0 20px ${r.auraColor}`
                  }}>
                    {r.visualIcon}
                  </div>

                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: presence === 'strong' ? '#065f46' : '#854d0e',
                    color: '#fff'
                  }}>
                    {presence.toUpperCase()} PRESENCE
                  </span>
                </div>

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
                  fontSize: '22px',
                  color: '#fff',
                  margin: '4px 0 10px 0'
                }}>
                  {r.title}
                </h3>

                <p style={{ color: '#9ca3af', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {r.description}
                </p>
              </div>

              {/* Scent & Selection Action */}
              <div>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#cbd5e1',
                  marginBottom: '18px'
                }}>
                  {r.scent}
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: isCurrent ? r.borderColor : 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: isCurrent ? `0 0 20px ${r.auraColor}` : 'none'
                  }}
                >
                  {isCurrent ? 'SELECTED PERSONA' : 'CHOOSE THIS SPECTRE'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
