import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen w-full bg-[#f4f5f7] flex items-center justify-center p-0 font-sans relative overflow-hidden">
      
      {/* ===== ESCRITORIO (LG+) BANNER EXACTO ===== */}
      <div className="hidden lg:flex w-full max-w-5xl h-[560px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
        
        {/* Lado Izquierdo: Verde Gradiente con Logo Central Blanco */}
        <div className="w-1/2 bg-gradient-to-b from-[#76b82a] via-[#65a31f] to-[#558c17] p-10 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Marca de agua sutil bambú al fondo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none"></div>
          
          {/* Tarjeta Logo Blanco Enmarcado */}
          <div className="bg-white px-8 py-5 rounded-2xl shadow-xl flex items-center justify-center z-10 border border-white/40">
            <img
              src={logoImg}
              alt="VidaSana Centro Médico Odontológico"
              className="h-20 w-auto object-contain"
            />
          </div>
        </div>

        {/* Lado Derecho: Fondo Claro con Ilustración Bambú & Formulario Flotante */}
        <div className="w-1/2 bg-[#fafbfc] p-10 flex items-center justify-center relative">
          
          {/* Marca de Agua Bambú al Fondo Derecho */}
          <div className="absolute right-0 bottom-0 top-0 w-64 opacity-20 pointer-events-none overflow-hidden flex items-center justify-end">
            <svg viewBox="0 0 200 400" className="h-full w-auto text-[#65a31f] fill-current">
              <path d="M120 40 Q160 80 140 160 Q180 100 190 40 Z" />
              <path d="M100 120 Q150 180 130 280 Q170 200 180 120 Z" />
              <rect x="150" y="0" width="8" height="400" rx="4" />
            </svg>
          </div>

          {/* Tarjeta Flotante Blanca EXACTA */}
          <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-slate-100 z-10 space-y-5">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              
              {/* Campo Correo Electronico */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 text-xs">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#65a31f] rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#65a31f]/30 text-sm"
                />
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 text-xs">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border-2 border-slate-300 focus:border-[#65a31f] rounded-xl text-slate-800 font-bold focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65a31f] hover:text-[#558c17]"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              {/* Boton Iniciar Sesion Verde solido redondeado */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#65a31f] hover:bg-[#558c17] text-white font-extrabold rounded-xl shadow-md text-sm transition-all mt-2 flex items-center justify-center cursor-pointer active:scale-[0.98]"
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

              {/* Enlaces Olvide mi contraseña / Crear cuenta */}
              <div className="text-center pt-2 space-y-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => alert('Por favor contacte al Administrador de Sistemas para restablecer su clave.')}
                  className="block w-full text-slate-600 hover:text-slate-900 font-bold transition-colors"
                >
                  Olvidé mi contraseña
                </button>

                <button
                  type="button"
                  onClick={() => alert('La creación de nuevas cuentas de acceso debe ser procesada por Gerencia.')}
                  className="block w-full text-slate-600 hover:text-slate-900 font-bold transition-colors"
                >
                  Crear cuenta
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

      {/* ===== VERSION MOVIL EXACTA ===== */}
      <div className="lg:hidden w-full min-h-screen bg-gradient-to-b from-[#76b82a] via-[#65a31f] to-[#558c17] flex flex-col items-center justify-between p-6 relative">
        
        {/* Banner Superior Verde con Logo Central */}
        <div className="w-full flex-1 flex flex-col items-center justify-center py-8">
          <div className="bg-white px-7 py-4 rounded-2xl shadow-xl border border-white/40 mb-2">
            <img
              src={logoImg}
              alt="VidaSana"
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        {/* Tarjeta Flotante Inferior Blanca EXACTA */}
        <div className="w-full max-w-sm bg-white p-7 rounded-3xl shadow-2xl space-y-5 mb-4 z-10 border border-slate-100">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-medium">
            
            {/* Campo Correo Electronico */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 text-xs">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-3 bg-white border-2 border-[#65a31f] rounded-xl text-slate-800 font-bold focus:outline-none text-base"
              />
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 text-xs">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-3 bg-white border-2 border-slate-300 focus:border-[#65a31f] rounded-xl text-slate-800 font-bold focus:outline-none text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#65a31f]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Boton Iniciar Sesion Verde solido */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#65a31f] hover:bg-[#558c17] text-white font-extrabold rounded-xl shadow-md text-sm transition-all mt-2 flex items-center justify-center cursor-pointer"
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

            {/* Enlaces Olvide mi contraseña / Crear cuenta */}
            <div className="text-center pt-2 space-y-2 text-xs">
              <button
                type="button"
                onClick={() => alert('Por favor contacte al Administrador de Sistemas para restablecer su clave.')}
                className="block w-full text-slate-600 font-bold"
              >
                Olvidé mi contraseña
              </button>

              <button
                type="button"
                onClick={() => alert('La creación de nuevas cuentas de acceso debe ser procesada por Gerencia.')}
                className="block w-full text-slate-600 font-bold"
              >
                Crear cuenta
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
