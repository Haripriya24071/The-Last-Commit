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

  const rolesConfig = [
    {
      id: 'ghost',
      title: 'THE GHOST',
      icon: '👻',
      subtitle: 'Spirit of Abandoned Logic',
      description: 'Hunts dead functions, bare exceptions, mutable defaults, unreachable code, and unused imports.',
      noneExplanation: 'No dead functions, bare exceptions, or unused imports detected in this repository.',
      themeColor: '#38bdf8',
      bgGlow: 'rgba(56, 189, 248, 0.12)',
      border: 'rgba(56, 189, 248, 0.4)',
      targets: ['Dead Code & Vulture AST', 'Bare Exceptions (`except:`)', 'Mutable Default Args', 'Unreachable Branches']
    },
    {
      id: 'reaper',
      title: 'THE REAPER',
      icon: '💀',
      subtitle: 'Executioner of Breached Secrets',
      description: 'Hunts exposed API keys, committed .env files, dangerous eval(), shell=True injections, and SQL concatenation.',
      noneExplanation: 'No exposed API tokens, committed .env files, or unsafe execution patterns detected.',
      themeColor: '#ef4444',
      bgGlow: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      targets: ['Committed Secrets & .env', 'Hardcoded API Keys', 'eval() & shell=True Injections', 'SQL String Concat']
    },
    {
      id: 'skeleton',
      title: 'THE SKELETON',
      icon: '🦴',
      subtitle: 'Architect of Rotting Complexity',
      description: 'Hunts forgotten TODO/FIXME comments, oversized source files, cyclomatic complexity (>10), and missing tests.',
      noneExplanation: 'No high-complexity functions or unresolved TODO/FIXME comments detected.',
      themeColor: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.4)',
      targets: ['TODO & FIXME Comments', 'High Complexity (>10)', 'Oversized Source Files', 'Weak Git Commits']
    }
  ]

  const handleSelectRole = async (selectedId) => {
    setRole(selectedId)
    await fetchMansionMap(repoUrl || 'sample')
    setScreen('map')
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at 50% 50%, #171026 0%, #050308 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e5e7eb',
      fontFamily: 'Inter, sans-serif',
      padding: '24px',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <span style={{ fontSize: '36px' }}>👑🕯️</span>
        <h2 style={{
          fontFamily: 'Cinzel Decorative, serif',
          fontSize: '28px',
          color: '#ef4444',
          margin: '8px 0 4px 0',
          letterSpacing: '2px',
          textShadow: '0 0 18px rgba(239, 68, 68, 0.5)'
        }}>
          SELECT YOUR INVESTIGATOR ROLE
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
          Presence indicators reveal which entities have manifested in this codebase.
        </p>
      </div>

      {/* 3 Role Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        maxWidth: '1100px',
        width: '100%'
      }}>
        {rolesConfig.map((r) => {
          const presence = rolePresence[r.id] || 'faint'
          const isSelected = role === r.id
          const isNone = presence === 'none'

          return (
            <div
              key={r.id}
              role="button"
              tabIndex={0}
              aria-label={`Select Role ${r.title}: ${r.subtitle}. Presence is ${presence}.`}
              onClick={() => handleSelectRole(r.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSelectRole(r.id)
                }
              }}
              style={{
                background: isSelected ? r.bgGlow : 'rgba(18, 14, 28, 0.9)',
                border: `2px solid ${isSelected ? r.themeColor : isNone ? 'rgba(255,255,255,0.06)' : r.border}`,
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                opacity: isNone ? 0.6 : 1.0,
                boxShadow: isSelected ? `0 0 30px ${r.bgGlow}` : '0 8px 24px rgba(0,0,0,0.7)',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s, opacity 0.2s',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                outline: 'none'
              }}
            >

              <div>
                {/* Icon & Presence Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <span style={{ fontSize: '42px', filter: `drop-shadow(0 0 12px ${r.themeColor})` }}>
                    {r.icon}
                  </span>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: presence === 'strong' ? '#065f46' : presence === 'faint' ? '#854d0e' : '#374151',
                    color: presence === 'strong' ? '#6ee7b7' : presence === 'faint' ? '#fde68a' : '#9ca3af',
                    border: `1px solid ${presence === 'strong' ? '#10b981' : presence === 'faint' ? '#f59e0b' : '#6b7280'}`
                  }}>
                    {presence === 'strong' ? '🔥 STRONG PRESENCE' : presence === 'faint' ? '🕯️ FAINT PRESENCE' : '🌫️ NO PRESENCE'}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'Cinzel Decorative, serif',
                  fontSize: '20px',
                  color: r.themeColor,
                  margin: '0 0 4px 0',
                  letterSpacing: '1px'
                }}>
                  {r.title}
                </h3>
                <h4 style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  margin: '0 0 12px 0',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {r.subtitle}
                </h4>

                <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  {r.description}
                </p>

                {/* Single line explanation when presence is NONE */}
                {isNone && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px dashed rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    marginBottom: '12px',
                    fontSize: '11px',
                    color: '#fca5a5',
                    fontStyle: 'italic'
                  }}>
                    {r.noneExplanation}
                  </div>
                )}

                {/* Hunt Targets */}
                <div style={{
                  background: 'rgba(9, 6, 15, 0.7)',
                  borderRadius: '8px',
                  padding: '12px',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}>
                  <div style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: '6px' }}>
                    HAUNTED ARTIFACTS:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', color: '#94a3b8', fontSize: '11px', lineHeight: 1.5 }}>
                    {r.targets.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Select Button */}
              <button
                style={{
                  marginTop: '20px',
                  width: '100%',
                  padding: '12px',
                  background: isSelected ? r.themeColor : isNone ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                  color: isSelected ? '#000' : isNone ? '#6b7280' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '1px'
                }}
              >
                {isSelected ? '✓ CHOSEN ROLE — ENTER MANSION' : isNone ? 'ENTER ANYWAY →' : 'SELECT THIS ROLE →'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Back to Repo Selection */}
      <div style={{ marginTop: '28px' }}>
        <button
          onClick={() => setScreen('repo_input')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#9ca3af',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          ← CHANGE REPOSITORY
        </button>
      </div>
    </div>
  )
}
