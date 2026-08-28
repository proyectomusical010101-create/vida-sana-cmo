import React, { useState } from 'react';
import { 
  Settings, ShieldCheck, Building, Image, Mail, Key, Upload, Check, 
  User, Lock, AlertTriangle, Sparkles, Sun, Moon, Trash2, RotateCcw, 
  Search, Filter, Layers, FileText, DollarSign, UserCheck, Package, Stethoscope,
  History, Eye, ShieldAlert, CheckCircle2, Clock, Globe
} from 'lucide-react';
import Swal from 'sweetalert2';
import AuditRolesPortalModule from './AuditRolesPortalModule';
import { CLINIC_INFO } from '../mockData';

export default function SettingsModule({ 
  currentUser, 
  patients = [], 
  transactions = [], 
  auditLogs = [],
  deletedItems = [],
  onRestoreItem,
  onPermanentDeleteItem,
  onEmptyTrashBin,
  logoImg, 
  setLogoImg, 
  theme = 'light',
  setTheme,
  onOpenCreateUser,
  onUpdateCurrentUser
}) {
  const [activeTab, setActiveTab] = useState('company-profile'); // 'company-profile' | 'users-roles' | 'audit-log' | 'trash'

  // Verificar si el usuario actual es Administrador o Gerente
  const userRoleStr = String(currentUser?.role || '').toLowerCase();
  const isAdminOrManager = userRoleStr.includes('admin') || 
                           userRoleStr.includes('gerente') || 
                           userRoleStr.includes('super');

  // Filtros de Auditoría
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditUserFilter, setAuditUserFilter] = useState('ALL');
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');

  // Filtros de Papelera
  const [trashSearchTerm, setTrashSearchTerm] = useState('');
  const [trashTypeFilter, setTrashTypeFilter] = useState('ALL');

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

  // Leer historial y papelera desde props o sincronizar dinámicamente con localStorage
  const getStoredItems = (key) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const effectiveAuditLogs = (Array.isArray(auditLogs) && auditLogs.length > 0) 
    ? auditLogs 
    : getStoredItems('cmo_audit_logs');

  const effectiveDeletedItems = (Array.isArray(deletedItems) && deletedItems.length > 0) 
    ? deletedItems 
    : getStoredItems('cmo_deleted_items');

  // Filtrar Historial de Auditoría
  const filteredAuditLogs = effectiveAuditLogs.filter(log => {
    if (!log) return false;
    const term = auditSearchTerm.toLowerCase();
    const matchesSearch = (log.user || '').toLowerCase().includes(term) ||
                          (log.action || '').toLowerCase().includes(term) ||
                          (log.module || '').toLowerCase().includes(term) ||
                          (log.detail || '').toLowerCase().includes(term) ||
                          (log.email || '').toLowerCase().includes(term);
    const matchesUser = auditUserFilter === 'ALL' || log.user === auditUserFilter;
    const matchesModule = auditModuleFilter === 'ALL' || log.module === auditModuleFilter;
    return matchesSearch && matchesUser && matchesModule;
  });

  // Lista única de usuarios auditados
  const uniqueAuditUsers = Array.from(new Set(effectiveAuditLogs.map(l => l?.user).filter(Boolean)));
  const uniqueAuditModules = Array.from(new Set(effectiveAuditLogs.map(l => l?.module).filter(Boolean)));

  // Filtrar elementos de la papelera
  const filteredTrashItems = effectiveDeletedItems.filter(item => {
    if (!item) return false;
    const term = trashSearchTerm.toLowerCase();
    const matchesSearch = (item.name || '').toLowerCase().includes(term) || 
                          (item.details || '').toLowerCase().includes(term) ||
                          (item.typeName || '').toLowerCase().includes(term);
    return matchesSearch && matchesType;
  });

  // Icono por Tipo de Elemento
  const getItemIcon = (type) => {
    switch (type) {
      case 'patient': return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case 'budget': return <Stethoscope className="w-4 h-4 text-amber-600" />;
      case 'transaction': return <DollarSign className="w-4 h-4 text-teal-600" />;
      case 'procedure': return <Layers className="w-4 h-4 text-purple-600" />;
      case 'inventory': return <Package className="w-4 h-4 text-blue-600" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12 font-sans">
      {/* Banner Principal de Configuraciones */}
      <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
            Panel Global de Administración
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Settings className="text-teal-600 w-7 h-7" />
            Configuraciones del Sistema
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Gestión centralizada de usuarios, permisos, auditoría inmutable de acciones, papelera de reciclaje y marca.
          </p>
        </div>

        {/* Pestañas Conmutadoras del Módulo */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('company-profile')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'company-profile'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Building className="w-4 h-4" />
            Empresa & Perfil
          </button>

          <button
            onClick={() => setActiveTab('users-roles')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users-roles'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Usuarios & Permisos
          </button>

          <button
            onClick={() => setActiveTab('audit-log')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'audit-log'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <History className="w-4 h-4 text-amber-300" />
            Historial de Acciones
            <span className="bg-amber-800/40 text-amber-200 text-[9px] px-1.5 py-0.2 rounded font-mono">🔒</span>
          </button>

          <button
            onClick={() => setActiveTab('trash')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'trash'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Papelera
            {deletedItems.length > 0 && (
              <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                {deletedItems.length}
              </span>
            )}
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

      {/* CONTENIDO 3: HISTORIAL DE ACCIONES & AUDITORÍA INMUTABLE (SOLO ADMIN & GERENTE) */}
      {activeTab === 'audit-log' && (
        <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-6">
          {!isAdminOrManager ? (
            <div className="p-10 text-center bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl space-y-3">
              <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
              <h3 className="text-base font-black text-rose-900 dark:text-rose-200">🔒 Acceso Restringido por Seguridad</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto font-medium">
                Únicamente los usuarios con rol de <strong>Administrador Principal</strong> o <strong>Gerente Administrativo</strong> tienen autorización para consultar el Historial Inmutable de Auditoría de Acciones.
              </p>
            </div>
          ) : (
            <>
              {/* Encabezado e Indicador de Inmutabilidad */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e2d5a] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-amber-500" />
                      Historial Inmutable de Acciones & Auditoría
                    </h3>
                    <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 font-extrabold text-[10px] rounded border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> No Modificable
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Registro legal inalterable de absolutamente todas las actividades ejecutadas por cada usuario en el sistema.
                  </p>
                </div>

                <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Auditoría Activa</span>
                </div>
              </div>

              {/* Banner de Garantía Legal de Inmutabilidad */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                  <strong>Protección Anti-Alteración:</strong> Los registros listados a continuación son 100% inmutables. <strong>Ningún usuario (incluyendo administradores) puede borrar o editar estas acciones</strong> por exigencias de trazabilidad y auditoría forense del centro médico.
                </p>
              </div>

              {/* Buscador & Filtros de Auditoría */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por usuario, correo, acción realizada o detalle..."
                    value={auditSearchTerm}
                    onChange={(e) => setAuditSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={auditUserFilter}
                    onChange={(e) => setAuditUserFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="ALL">Todos los Usuarios</option>
                    {uniqueAuditUsers.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>

                  <select
                    value={auditModuleFilter}
                    onChange={(e) => setAuditModuleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="ALL">Todos los Módulos</option>
                    {uniqueAuditModules.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tabla Inmutable de Auditoría */}
              <div className="overflow-x-auto border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-[#0d162f] text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-[#1e2d5a]">
                      <th className="py-3 px-4">Log ID</th>
                      <th className="py-3 px-4">Usuario & Rol</th>
                      <th className="py-3 px-4">Acción Ejecutada</th>
                      <th className="py-3 px-4">Módulo Afectado</th>
                      <th className="py-3 px-4">Detalle / Datos</th>
                      <th className="py-3 px-4">Fecha & Hora</th>
                      <th className="py-3 px-4">IP / Conexión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#1e2d5a] font-medium text-slate-800 dark:text-slate-200">
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-500">
                          No se encontraron registros de acciones con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-teal-600 dark:text-teal-400 shrink-0">
                            {log.id}
                          </td>

                          <td className="py-3.5 px-4 font-bold">
                            <span className="block text-slate-900 dark:text-white">{log.user}</span>
                            <span className="text-[10px] text-slate-500 font-normal">{log.email}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-extrabold uppercase text-slate-700 dark:text-slate-300 inline-block mt-0.5">
                              {log.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                            {log.action}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold text-[10px]">
                              {log.module}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px] max-w-xs truncate" title={log.detail}>
                            {log.detail || '—'}
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono shrink-0">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {log.timestamp}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3 text-slate-400" />
                              {log.ip || '190.202.45.12'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* CONTENIDO 4: PAPELERA DE RECICLAJE & RECUPERACIÓN DE DATOS */}
      {activeTab === 'trash' && (
        <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e2d5a] pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                Papelera de Reciclaje del Sistema
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Los registros eliminados se almacenan aquí de forma segura para permitir su restauración en cualquier momento.
              </p>
            </div>

            {deletedItems.length > 0 && (
              <button
                onClick={() => typeof onEmptyTrashBin === 'function' && onEmptyTrashBin()}
                className="px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/50 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Vaciar Papelera Definitivamente
              </button>
            )}
          </div>

          {/* Buscador & Filtro por Tipo */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en la papelera por nombre, tipo o detalle..."
                value={trashSearchTerm}
                onChange={(e) => setTrashSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-bold"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={trashTypeFilter}
                onChange={(e) => setTrashTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 w-full sm:w-auto"
              >
                <option value="ALL">Todos los Tipos ({deletedItems.length})</option>
                <option value="patient">Pacientes</option>
                <option value="budget">Presupuestos</option>
                <option value="transaction">Facturas / Caja</option>
                <option value="procedure">Servicios / Baremos</option>
                <option value="inventory">Insumos / Inventario</option>
              </select>
            </div>
          </div>

          {/* Lista / Tabla de Elementos Eliminados */}
          {filteredTrashItems.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl space-y-3">
              <Trash2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto stroke-1" />
              <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">La papelera está vacía</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No hay elementos eliminados en esta categoría. Cuando elimines un paciente, presupuesto, factura, servicio e insumo se conservará aquí para restaurarlo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#0d162f] text-slate-700 dark:text-slate-300 font-extrabold border-b border-slate-200 dark:border-[#1e2d5a]">
                    <th className="py-3 px-4">Tipo & Registro</th>
                    <th className="py-3 px-4">Detalles</th>
                    <th className="py-3 px-4">Eliminado Por</th>
                    <th className="py-3 px-4">Fecha Eliminación</th>
                    <th className="py-3 px-4 text-center">Acciones de Recuperación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1e2d5a] font-medium text-slate-800 dark:text-slate-200">
                  {filteredTrashItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                          {getItemIcon(item.type)}
                        </div>
                        <div>
                          <span className="block text-slate-900 dark:text-white font-extrabold text-xs">{item.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                            {item.typeName || item.type}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {item.details || 'Sin detalles adicionales'}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {item.deletedBy || 'Administrador'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                        {item.deletedAt ? new Date(item.deletedAt).toLocaleString('es-VE') : 'Reciente'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => typeof onRestoreItem === 'function' && onRestoreItem(item)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1 shadow-md transition-all cursor-pointer active:scale-95"
                            title="Restaurar registro de vuelta al sistema"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Restaurar
                          </button>

                          <button
                            onClick={() => typeof onPermanentDeleteItem === 'function' && onPermanentDeleteItem(item)}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 dark:text-rose-300 rounded-xl transition-all cursor-pointer"
                            title="Eliminar definitivamente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
