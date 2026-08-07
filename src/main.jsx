import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Crash:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-teal-500/20 border border-teal-500/40 rounded-2xl flex items-center justify-center mx-auto text-teal-400 font-extrabold text-2xl">
              VS
            </div>
            <h2 className="text-xl font-extrabold text-white">Vida Sana CMO v2.0</h2>
            <p className="text-xs text-slate-300">
              Hemos detectado un ajuste de actualización en tu navegador. Haz clic abajo para reiniciar la plataforma limpiamente.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-all"
            >
              🔄 Reiniciar Sistema & Abrir Login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)
