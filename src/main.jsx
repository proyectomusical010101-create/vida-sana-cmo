import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center text-2xl font-extrabold mb-4">
            VS
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Centro Médico Vida Sana CMO, C.A.</h1>
          <p className="text-slate-300 text-xs max-w-md mb-6 leading-relaxed">
            Se ha detectado una desincronización en la sesión o memoria caché local. Haz clic abajo para restablecer de forma segura y acceder a la plataforma.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold rounded-xl shadow-lg text-xs transition-all"
          >
            🔄 Restablecer Memoria Caché & Iniciar Sesión
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
