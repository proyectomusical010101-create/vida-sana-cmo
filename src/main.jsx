import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class DebugBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '20px', background: 'red', color: 'white', fontFamily: 'monospace' }}>
          <h2>CRASH DETECTED</h2>
          <pre>{this.state.error.toString()}</pre>
          <pre>{this.state.errorInfo.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DebugBoundary>
      <App />
    </DebugBoundary>
  </React.StrictMode>,
)
