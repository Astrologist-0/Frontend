import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#0f0f1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#1a0a0a', border: '1px solid #7f1d1d', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '100%' }}>
            <h2 style={{ color: '#fca5a5', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Something went wrong</h2>
            <pre style={{ color: '#f87171', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#0f0505', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {this.state.error?.message}
            </pre>
            {this.state.info && (
              <details style={{ color: '#6b7280', fontSize: '11px' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Component stack</summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.info.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => this.setState({ error: null, info: null })}
              style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
