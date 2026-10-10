import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, ContactShadows } from '@react-three/drei'
import HauntedCube from './components/HauntedCube'

export default function App() {
  const [backendStatus, setBackendStatus] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    fetch('/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => setBackendStatus({ loading: false, data, error: null }))
      .catch((err) => setBackendStatus({ loading: false, data: null, error: err.message }))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050508', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header Overlay */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(5,5,8,0.9), transparent)',
        pointerEvents: 'none'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }} className="candle-glow">🕯️</span>
            <h1 style={{
              fontFamily: 'Cinzel Decorative, serif',
              fontSize: '24px',
              letterSpacing: '2px',
              color: '#f87171',
              margin: 0,
              textShadow: '0 0 12px rgba(239, 68, 68, 0.5)'
            }}>
              THE LAST COMMIT
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            A haunted-mansion hunt for the bugs hiding in your code.
          </p>
        </div>

        {/* Backend & Environment Status Pill */}
        <div style={{
          pointerEvents: 'auto',
          padding: '10px 18px',
          background: 'rgba(18, 16, 26, 0.85)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontFamily: 'JetBrains Mono, monospace',
          backdropFilter: 'blur(12px)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: backendStatus.data ? '#22c55e' : (backendStatus.error ? '#ef4444' : '#eab308'),
            boxShadow: backendStatus.data ? '0 0 8px #22c55e' : 'none'
          }} />
          <span>
            {backendStatus.loading && 'Connecting to Backend...'}
            {backendStatus.data && `Backend: ${backendStatus.data.status} ("${backendStatus.data.whisper}")`}
            {backendStatus.error && `Backend: Offline (Waiting on port 8000)`}
          </span>
        </div>
      </header>

      {/* 3D Three.js / React Three Fiber Viewport */}
      <div style={{ width: '100%', height: '100%', cursor: 'grab' }}>
        <Canvas camera={{ position: [0, 1.5, 6], fov: 50 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#ef4444" />
          <pointLight position={[-10, -5, -5]} intensity={0.8} color="#38bdf8" />
          <spotLight position={[0, 8, 4]} intensity={2} angle={0.6} penumbra={1} color="#fca5a5" castShadow />
          
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          
          <HauntedCube />
          
          <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={10} blur={2} far={4} color="#3b0764" />
          <OrbitControls enableZoom={true} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Bottom Info Banner */}
      <footer style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 32px',
        background: 'linear-gradient(to top, rgba(5,5,8,0.95), transparent)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        fontSize: '12px',
        color: '#6b7280',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        <span>🕹️ Phase 0 Verification: React 18 + Three.js + R3F + FastAPI</span>
        <span>The Turing Club | Tech Team Auditions 2026</span>
      </footer>
    </div>
  )
}
