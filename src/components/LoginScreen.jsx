import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Activity, CheckCircle2, ArrowRight, Stethoscope, Building2 } from 'lucide-react';
import { loginApi } from '../api';

export default function LoginScreen({ onLoginSuccess }) {
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const data = await loginApi(email, password);
      setSuccessMsg('¡Autenticación exitosa! Ingresando a la plataforma...');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* Background Decorative Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl"></div>
      </div>

      {/* Main Container Split View */}
      <div className="relative z-10 w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Medical Hero Section */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/80 p-12 flex-col justify-between border-r border-slate-800/80 relative overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-teal-500/20">
                VS
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">Centro Médico Odontológico</h1>
                <span className="text-xs font-mono text-teal-400 font-bold">Vida Sana CMO, C.A. • RIF: J-50781755-5</span>
              </div>
            </div>

            <div className="space-y-4 pt-12">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30 inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Acceso Seguro a la Plataforma Médica
              </span>
              <h2 className="text-4xl font-extrabold text-white leading-tight">
                Control Administrativo & Odontológico Integral
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg font-medium">
                Plataforma centralizada para la administración de expedientes digitales, odontogramas 2D, caja multi-moneda, financiamiento Cashea y liquidación de honorarios médicos.
              </p>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-2 gap-4 pt-6 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <Activity className="w-4 h-4 text-teal-400" />
                <span>Odontograma 2D</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Caja Multi-moneda</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Conciliación Cashea</span>
              </div>
              <div className="flex items-center gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <Stethoscope className="w-4 h-4 text-blue-400" />
                <span>Liquidación SENIAT</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono flex items-center justify-between border-t border-slate-800/80 pt-6">
            <span>© 2026 Vida Sana CMO v1.0</span>
            <span className="text-teal-400 font-semibold">Servidor SQLite Activo</span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form ONLY */}
        <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6">
            
            {/* Mobile Header Logo */}
            <div className="lg:hidden text-center space-y-2 mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                VS
              </div>
              <h2 className="text-xl font-extrabold text-white">Vida Sana CMO, C.A.</h2>
              <span className="text-xs font-mono text-teal-400 block font-bold">Plataforma Administrativa</span>
            </div>

            {/* Form Card Container */}
            <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6">
              
              {/* Title Header */}
              <div>
                <h3 className="text-2xl font-extrabold text-white">
                  Iniciar Sesión
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Ingrese sus credenciales de Administrador para acceder al sistema.
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold animate-fadeIn">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold animate-fadeIn flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* FORM: INICIAR SESION SOLAMENTE */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Correo Electrónico Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="admin@vidasana.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-teal-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-300">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-teal-500 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 mt-6"
                >
                  {loading ? (
                    <span>Autenticando...</span>
                  ) : (
                    <>
                      <span>Ingresar a la Plataforma</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
