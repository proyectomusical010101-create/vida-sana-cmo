import React, { useState } from 'react';
import { Settings, ShieldCheck, Building, Image, Mail, Key, Upload, Check, User, Lock, AlertTriangle, Sparkles, Sun, Moon } from 'lucide-react';
import Swal from 'sweetalert2';
import AuditRolesPortalModule from './AuditRolesPortalModule';
import { CLINIC_INFO } from '../mockData';

export default function SettingsModule({ 
  currentUser, 
  patients = [], 
  transactions = [], 
  logoImg, 
  setLogoImg, 
  theme = 'light',
  setTheme,
  onOpenCreateUser,
  onUpdateCurrentUser
}) {
  const [activeTab, setActiveTab] = useState('company-profile'); // 'users-roles' | 'company-profile'

  // Ajustes de Empresa / Perfil
  const [companyEmail, setCompanyEmail] = useState(() => currentUser?.email || 'admin@vidasana-cmo.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Cambiar Logo
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Archivo No Válido', 'Por favor seleccione una imagen en formato JPG, PNG o WebP.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result;
      if (dataUrl && typeof setLogoImg === 'function') {
        setLogoImg(dataUrl);
        Swal.fire({
          title: '¡Logo Actualizado!',
          text: 'El nuevo logotipo de la clínica ha sido aplicado en toda la aplicación y reportes.',
          icon: 'success',
          confirmButtonColor: '#0d9488'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Guardar Cambios de Perfil (Correo & Contraseña)
  const handleSaveProfileSettings = (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      Swal.fire('Contraseñas No Coinciden', 'La nueva contraseña y la confirmación no coinciden.', 'error');
      return;
    }

    if (typeof onUpdateCurrentUser === 'function') {
      onUpdateCurrentUser({
        ...currentUser,
        email: companyEmail
      });
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    Swal.fire({
      title: '¡Ajustes Guardados!',
      text: 'Los cambios de perfil y correo electrónico han sido actualizados con éxito.',
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      {/* Banner Principal de Configuraciones */}
      <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
            Panel Global de Administración
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Settings className="text-teal-600 w-7 h-7" />
            Configuraciones del Sistema
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Gestión centralizada de usuarios, permisos, roles, auditorías y personalización de marca de la clínica.
          </p>
        </div>

        {/* Pestañas Conmutadoras del Módulo */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('company-profile')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'company-profile'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Building className="w-4 h-4" />
            Ajustes de Empresa & Perfil
          </button>

          <button
            onClick={() => setActiveTab('users-roles')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users-roles'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Usuarios, Roles & Auditorías
          </button>
        </div>
      </div>

      {/* CONTENIDO 1: AJUSTES DE EMPRESA Y PERFIL */}
      {activeTab === 'company-profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Columna Izquierda: Logo & Apariencia de Tema */}
          <div className="lg:col-span-5 space-y-6">

            {/* Tarjeta 1: Personalización de Marca (Logo) */}
            <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-[#1e2d5a] pb-3">
                <Image className="w-5 h-5 text-teal-600" />
                Logo Oficial de la Clínica
              </h3>

              <div className="p-6 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-white p-3 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md flex items-center justify-center">
                  <img src={logoImg} alt="Logo de la Clínica" className="max-h-full max-w-full object-contain" />
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{CLINIC_INFO.name}</h4>
                  <p className="text-xs text-slate-500 font-mono">RIF: {CLINIC_INFO.rif}</p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md transition-all active:scale-95">
                  <Upload className="w-4 h-4" />
                  Subir / Cambiar Nuevo Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Tarjeta 2: Apariencia & Tema Visual (Claro / Oscuro) */}
            <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-[#1e2d5a] pb-3">
                <Sun className="w-5 h-5 text-amber-500" />
                Apariencia & Tema del Sistema
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => typeof setTheme === 'function' && setTheme('light')}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    theme === 'light'
                      ? 'bg-amber-50 border-amber-400 text-amber-900 font-black shadow-md ring-2 ring-amber-400/50'
                      : 'bg-slate-50 dark:bg-[#0d162f] border-slate-200 dark:border-[#1e2d5a] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="text-xs">☀️ Modo Claro</span>
                </button>

                <button
                  type="button"
                  onClick={() => typeof setTheme === 'function' && setTheme('dark')}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-teal-500 text-teal-300 font-black shadow-md ring-2 ring-teal-500/50'
                      : 'bg-slate-50 dark:bg-[#0d162f] border-slate-200 dark:border-[#1e2d5a] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span className="text-xs">🌙 Modo Oscuro</span>
                </button>
              </div>
            </div>

          </div>

          {/* Tarjeta 2: Perfil de Usuario & Credenciales */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-[#1e2d5a] pb-3">
              <User className="w-5 h-5 text-teal-600" />
              Perfil de Administrador & Credenciales
            </h3>

            <form onSubmit={handleSaveProfileSettings} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre Completo del Usuario</label>
                <input
                  type="text"
                  readOnly
                  value={currentUser?.name || 'Administrador Principal'}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white cursor-not-allowed opacity-80"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico de Acceso</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-[#1e2d5a] space-y-3">
                <span className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-teal-600" />
                  Cambiar Contraseña
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      placeholder="Escriba nueva clave..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      placeholder="Repita nueva clave..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  Guardar Ajustes de Perfil
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* CONTENIDO 2: GESTIÓN COMPLETA DE USUARIOS, ROLES & AUDITORÍAS */}
      {activeTab === 'users-roles' && (
        <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl">
          <AuditRolesPortalModule
            patients={patients}
            transactions={transactions}
            currentUser={currentUser}
            onOpenCreateUser={onOpenCreateUser}
          />
        </div>
      )}

    </div>
  );
}
