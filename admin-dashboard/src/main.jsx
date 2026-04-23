import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: '2rem', color: '#fca5a5', fontFamily: 'monospace', background: '#0f0505', minHeight: '100vh' }}>
        <h2 style={{ color: '#f87171' }}>Crash: {this.state.error.message}</h2>
        <pre style={{ fontSize: 12, marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{this.state.error.stack}</pre>
      </div>
    );
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
