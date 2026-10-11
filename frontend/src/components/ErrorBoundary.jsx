import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[The Last Commit] Uncaught React exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#050308',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: '#0c0714',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            padding: '36px',
            boxShadow: '0 0 35px rgba(239, 68, 68, 0.3)'
          }}>
            <div style={{
              width: '60px',
              height: '84px',
              margin: '0 auto 16px auto',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid #ef4444',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
            }}>
              <img src="/assets/candle_extinguished.jpg" alt="Extinguished Candle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2 style={{
              fontFamily: 'Nosifer, Creepster, cursive',
              color: '#ef4444',
              fontSize: '1.8rem',
              marginBottom: '12px'
            }}>
              A Fatal Curse Occurred
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
              The supernatural forces in the estate have severed your connection to reality.
            </p>
            <div style={{
              backgroundColor: '#000000',
              padding: '12px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: '#f87171',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '24px'
            }}>
              {this.state.error?.message || "Paranormal entity collision"}
            </div>
            <button
              id="reload-estate-btn"
              onClick={this.handleReload}
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              AWAKEN & RELOAD
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
