import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Activity, CheckCircle2, ArrowRight, Stethoscope, Building2, Loader2, Sparkles } from 'lucide-react';
import { loginApi } from '../api';
import logoImg from '../assets/logo.jpeg';

export default function LoginScreen({ onLoginSuccess }) {
  // Login State
  const [email, setEmail] = useState('admin@vidasanacmo.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    // Validación con API Backend / Supabase
    setTimeout(async () => {
      try {
        const response = await loginApi(email, password);
        if (response && response.success) {
          onLoginSuccess(response.user);
        }
      } catch (error) {
        setErrorMsg(error.message || 'Credenciales inválidas. Por favor verifique su correo y contraseña.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#161a1d] text-slate-100 font-sans overflow-hidden">
      
      {/* Background Decorative Lighting in Brand Colors (#84a93c & #2b3036) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#84a93c]/20 blur-[120px]"></div>
        <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] rounded-full bg-[#94c120]/15 blur-[100px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-[#84a93c]/15 blur-[140px]"></div>
      </div>

      {/* Main Container Split View */}
      <div className="relative z-10 w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Medical Hero Section with Official Logo */}
        <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#121619] via-[#1a1f23] to-[#121619] p-12 flex-col justify-between border-r border-[#2b3036]/60 relative overflow-hidden">
          <div className="space-y-8">
            
            {/* Header with Brand Logo */}
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 inline-block max-w-sm">
              <img
                src={logoImg}
                alt="VidaSana Centro Médico Odontológico"
                className="h-16 w-auto object-contain"
              />
            </div>

            <div className="space-y-4 pt-6">
              <span className="px-4 py-1.5 rounded-full text-xs font-black bg-[#84a93c]/15 text-[#a2d034] border border-[#84a93c]/40 inline-flex items-center gap-2 tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4 text-[#84a93c]" />
                Acceso Plataforma Médica Oficial
              </span>
              
              <h2 className="text-4xl font-black text-white leading-tight">
                Control Administrativo & Odontológico Integral
              </h2>
              
              <p className="text-slate-300 text-sm leading-relaxed max-w-lg font-medium">
                Plataforma centralizada para la gestión de expedientes digitales, odontogramas 2D, caja multi-moneda, financiamiento Cashea y liquidación de honorarios médicos.
              </p>
            </div>

            {/* Feature List in Brand Colors */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-bold text-slate-200">
              <div className="flex items-center gap-3 bg-[#24292e]/80 p-3.5 rounded-2xl border border-[#343b42] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[#84a93c]/20 flex items-center justify-center text-[#94c120]">
                  <Activity className="w-4 h-4" />
                </div>
                <span>Odontograma 2D</span>
              </div>
              <div className="flex items-center gap-3 bg-[#24292e]/80 p-3.5 rounded-2xl border border-[#343b42] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[#94c120]/20 flex items-center justify-center text-[#a2d034]">
                  <Building2 className="w-4 h-4" />
                </div>
                <span>Caja Multi-moneda</span>
              </div>
              <div className="flex items-center gap-3 bg-[#24292e]/80 p-3.5 rounded-2xl border border-[#343b42] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[#84a93c]/20 flex items-center justify-center text-[#94c120]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Conciliación Cashea</span>
              </div>
              <div className="flex items-center gap-3 bg-[#24292e]/80 p-3.5 rounded-2xl border border-[#343b42] shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[#94c120]/20 flex items-center justify-center text-[#a2d034]">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <span>Honorarios Médicos</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center justify-between border-t border-[#2b3036] pt-6">
            <span>© 2026 Vida Sana CMO v2.0 • RIF: J-50781755-5</span>
            <span className="text-[#a2d034] font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#84a93c] animate-pulse"></span>
              Sistema Activo
            </span>
          </div>
        </div>

        {/* Right Side: Interactive Login Form ONLY */}
        <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6">
            
            {/* Mobile Header Logo */}
            <div className="lg:hidden text-center space-y-3 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-xl inline-block">
                <img
                  src={logoImg}
                  alt="VidaSana Logo"
                  className="h-14 w-auto mx-auto object-contain"
                />
              </div>
              <span className="text-xs font-mono text-[#a2d034] block font-extrabold uppercase tracking-wider">
                Plataforma Administrativa v2.0
              </span>
            </div>

            {/* Form Card Container */}
            <div className="bg-[#1f2428]/90 border border-[#343b42] backdrop-blur-xl p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#84a93c] via-[#94c120] to-[#a2d034]"></div>
              
              {/* Title Header */}
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  Iniciar Sesión
                  <Sparkles className="w-5 h-5 text-[#94c120]" />
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

              {/* FORM: INICIAR SESIÓN CON INDICADOR DINÁMICO */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-extrabold mb-1.5 text-slate-300">Correo Electrónico Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="admin@vidasanacmo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#121619] border border-[#343b42] rounded-xl text-white font-medium focus:outline-none focus:border-[#84a93c] focus:ring-1 focus:ring-[#84a93c] text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold mb-1.5 text-slate-300">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 bg-[#121619] border border-[#343b42] rounded-xl text-white font-medium focus:outline-none focus:border-[#84a93c] focus:ring-1 focus:ring-[#84a93c] text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 text-[#121619] font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer ${
                    loading
                      ? 'bg-[#84a93c] opacity-90 cursor-wait'
                      : 'bg-gradient-to-r from-[#84a93c] via-[#94c120] to-[#a2d034] hover:from-[#759733] hover:to-[#8cb81c] shadow-[#84a93c]/25 active:scale-[0.99]'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#121619]" />
                      <span>Ingresando al Sistema...</span>
                    </>
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
