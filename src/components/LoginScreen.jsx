import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Database, WifiOff } from 'lucide-react';
import { loginApi } from '../api';
import { supabase } from '../supabaseClient';
import logoImg from '../assets/logo.jpeg';
import bambooBg from '../assets/bamboo-bg.jpeg';

export default function LoginScreen({ onLoginSuccess }) {
  // Login State
  const [email, setEmail] = useState('admin@vidasanacmo.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isCloudConnected = Boolean(supabase);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(async () => {
      try {
        const response = await loginApi(email, password);
        if (response && response.success) {
          onLoginSuccess(response.user);
        }
      } catch (error) {
        setErrorMsg(error.message || 'Credenciales inválidas. Por favor verifique sus datos.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#eaf5d6] via-[#dcebbd] to-[#cbe0a3] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* ========================================================================= */}
      {/* VISTA ESCRITORIO (LG+) - CON "Inicio de Sesión" Y LOGO SIN RECUADRO */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex w-full max-w-4xl h-[520px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white/60 relative">
        
        {/* Lado Izquierdo (50%): Imagen 11.jpeg (Bambú) + Logo Centrado Transparente */}
        <div 
          className="w-1/2 relative flex items-center justify-center p-8 bg-cover bg-left bg-no-repeat"
          style={{ backgroundImage: `url(${bambooBg})` }}
        >
          {/* Logo Oficial VidaSana Centrado con Blend Transparente Impoluto */}
          <div className="z-10 p-2 flex items-center justify-center">
            <img
              src={logoImg}
              alt="VidaSana Centro Médico Odontológico"
              className="h-24 w-auto object-contain mix-blend-multiply"
            />
          </div>
        </div>

        {/* Lado Derecho (50%): Formulario Fondo Blanco Impoluto */}
        <div className="w-1/2 bg-white p-10 flex flex-col items-center justify-center relative">
          
          <h2 className="text-2xl font-extrabold text-[#384148] mb-6 tracking-wide">
            Inicio de Sesión
          </h2>

          {errorMsg && (
            <div className="w-full max-w-xs p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="w-full max-w-xs space-y-5">
            
            {/* Campo Usuario */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#384148] ml-1">Usuario / Correo</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuario o Correo"
                className="w-full px-5 py-3 rounded-full bg-[#384148] text-white placeholder-slate-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#85a738] transition-all"
              />
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#384148] ml-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full pl-5 pr-10 py-3 rounded-full bg-[#384148] text-white placeholder-slate-400 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#85a738] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botón Único: Iniciar Sesión */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#85a738] hover:bg-[#74952e] text-white font-extrabold rounded-full text-xs shadow-md transition-all mt-6 flex items-center justify-center cursor-pointer active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Iniciando...</span>
                </div>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>

          </form>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VISTA MÓVIL (LG:HIDDEN) - IMPOLUTA */}
      {/* ========================================================================= */}
      <div className="lg:hidden w-full max-w-sm bg-white rounded-[32px] shadow-2xl p-8 relative overflow-hidden border border-white/80 flex flex-col items-center">
        
        {/* Logo Oficial Centrado Limpio */}
        <div className="mb-4 pt-2 flex items-center justify-center">
          <img
            src={logoImg}
            alt="VidaSana Logo"
            className="h-16 w-auto object-contain mix-blend-multiply"
          />
        </div>

        {errorMsg && (
          <div className="w-full p-3 mb-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
          
          {/* Campo Usuario */}
          <div className="space-y-1">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Usuario o Correo"
              className="w-full px-5 py-3.5 rounded-full bg-[#384148] text-white placeholder-slate-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#85a738] transition-all"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-1">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full pl-5 pr-10 py-3.5 rounded-full bg-[#384148] text-white placeholder-slate-400 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#85a738] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón Único Iniciar Sesión Ovalado Verde */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#85a738] hover:bg-[#74952e] text-white font-extrabold rounded-full text-sm shadow-md transition-all mt-4 flex items-center justify-center cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Iniciando...</span>
              </div>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>

        </form>

      </div>

    </div>
  );
}
