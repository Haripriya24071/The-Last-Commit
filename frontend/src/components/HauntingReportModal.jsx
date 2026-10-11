import React from 'react'
import { useGameStore } from '../store/gameStore'

export default function HauntingReportModal() {
  const {
    showReport,
    hauntingReport,
    closeReport,
    playerName,
    resetGame,
    startNewRepo,
    foundRelics
  } = useGameStore()

  if (!showReport || !hauntingReport) return null

  const relicsList = hauntingReport.relics_found && hauntingReport.relics_found.length > 0
    ? hauntingReport.relics_found
    : foundRelics

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'radial-gradient(circle at 50% 50%, #151022 0%, #06040a 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        padding: '24px',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          background: 'rgba(18, 14, 28, 0.95)',
          border: '2px solid #ef4444',
          borderRadius: '20px',
          padding: '36px',
          maxWidth: '820px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 0 60px rgba(239, 68, 68, 0.4)',
          backdropFilter: 'blur(20px)',
          position: 'relative'
        }}
      >
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '44px',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <img src="/assets/candle_returns.jpg" alt="Purified Seal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <h2 style={{ margin: 0, fontFamily: 'Cinzel Decorative, serif', color: '#ef4444', fontSize: '24px', letterSpacing: '2px' }}>
                HAUNTING REPORT
              </h2>
            </div>
            <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px', display: 'block' }}>
              INVESTIGATOR: {playerName.toUpperCase()} • {hauntingReport.repo || 'Repository'}
            </span>
          </div>

          <button
            onClick={closeReport}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer'
            }}
          >
            [CLOSE]
          </button>
        </div>

        {/* Rank & Evaluation */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '12px',
          padding: '16px 20px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#fbbf24', fontSize: '20px', margin: '0 0 4px 0', fontFamily: 'Cinzel Decorative, serif' }}>
            RANK: {hauntingReport.rank_title}
          </h3>
          <p style={{ color: '#fca5a5', fontSize: '13px', margin: 0 }}>
            {hauntingReport.rank_description}
          </p>
        </div>

        {/* 3 Metric Summary Boxes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          marginBottom: '28px',
          textAlign: 'center'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>TOTAL RELICS</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
              {hauntingReport.total_relics_in_mansion}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>CLEANSED</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#4ade80', marginTop: '2px' }}>
              {hauntingReport.relics_found_count}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }}>FINAL SCORE</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
              {hauntingReport.score}
            </div>
          </div>
        </div>

        {/* 1. Cleansed Relics List */}
        <div style={{ marginBottom: '28px' }}>
          <h4 style={{ color: '#4ade80', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 12px 0', letterSpacing: '1px' }}>
            CLEANSED CORRUPTED RELICS ({relicsList.length}):
          </h4>
          {relicsList.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '12px', fontStyle: 'italic', margin: 0 }}>
              No relics cleansed yet. Explore the mansion rooms to locate hidden defects.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px', overflowY: 'auto' }}>
              {relicsList.map((r, idx) => (
                <div key={idx} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(74, 222, 128, 0.25)',
                  borderRadius: '8px',
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                      {r.file}:{r.line}
                    </span>
                    <span style={{ fontSize: '11px', color: '#a7f3d0', fontFamily: 'JetBrains Mono, monospace' }}>
                      {r.type}
                    </span>
                  </div>

                  {r.snippet && (
                    <div style={{
                      background: '#020617',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#f87171',
                      fontFamily: 'JetBrains Mono, monospace',
                      margin: '6px 0'
                    }}>
                      <code>{r.snippet}</code>
                    </div>
                  )}

                  <p style={{ color: '#cbd5e1', fontSize: '12px', margin: '4px 0' }}>
                    <strong>Why:</strong> {r.explanation}
                  </p>
                  <p style={{ color: '#86efac', fontSize: '12px', margin: '2px 0 0 0' }}>
                    <strong>Fix:</strong> {r.suggestion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Revealed Missed Relics (Only after game is finished) */}
        {hauntingReport.is_game_finished && hauntingReport.relics_missed && hauntingReport.relics_missed.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ color: '#f87171', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 12px 0', letterSpacing: '1px' }}>
              UNRESOLVED ANOMALIES IN THE REPOSITORY ({hauntingReport.relics_missed.length}):
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
              {hauntingReport.relics_missed.map((m, idx) => (
                <div key={idx} style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '8px',
                  padding: '10px 14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'JetBrains Mono, monospace' }}>
                      {m.file}:{m.line}
                    </span>
                    <span style={{ fontSize: '11px', color: '#f87171', fontFamily: 'JetBrains Mono, monospace' }}>
                      {m.type}
                    </span>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '11px', margin: '4px 0 0 0' }}>
                    {m.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons: Play Again, New Repo, Close */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={resetGame}
            style={{
              flex: 1,
              padding: '12px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            RE-ENTER MANOR (RESET SCORE)
          </button>

          <button
            onClick={startNewRepo}
            style={{
              flex: 1,
              padding: '12px',
              background: '#1e293b',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            NEW REPOSITORY
          </button>

          <button
            onClick={closeReport}
            style={{
              padding: '12px 20px',
              background: 'transparent',
              color: '#9ca3af',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
