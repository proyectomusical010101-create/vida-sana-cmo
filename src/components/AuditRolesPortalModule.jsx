import React, { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, History, Search, Key, UserCheck, CheckSquare, Lock, Eye, EyeOff, Plus, Trash2, Edit, UserPlus, Users, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { fetchUsersApi, createUserApi, updateUserApi, deleteUserApi } from '../api';

export default function AuditRolesPortalModule({ patients = [], transactions = [], currentUser }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles' | 'doctor-portal' | 'audit'

  // Lista de Usuarios
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Modales de Usuario
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Formulario Usuario
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('Administrador');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [submittingUser, setSubmittingUser] = useState(false);

  // Cargar usuarios desde Supabase / API
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchUsersApi();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error al cargar usuarios:", e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('Administrador');
    setShowCreateModal(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (u) => {
    setSelectedUser(u);
    setFormName(u.name || '');
    setFormEmail(u.email || '');
    setFormPassword(''); // Vacio si no quiere cambiar clave
    setFormRole(u.role || 'Administrador');
    setShowEditModal(true);
  };

  // Crear Usuario Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formPassword) {
      Swal.fire('Campos Incompletos', 'Por favor ingrese Nombre, Correo y Contraseña.', 'warning');
      return;
    }

    setSubmittingUser(true);
    try {
      const created = await createUserApi({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole
      });

      setUsersList([created, ...usersList]);
      setShowCreateModal(false);
      
      Swal.fire({
        title: '¡Usuario Creado!',
        text: `El usuario "${created.name}" fue registrado exitosamente.`,
        icon: 'success',
        confirmButtonColor: '#0d9488'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error al Crear',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setSubmittingUser(false);
    }
  };

  // Editar Usuario Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmittingUser(true);
    try {
      const updated = await updateUserApi(selectedUser.id, {
        name: formName,
        email: formEmail,
        password: formPassword || undefined,
        role: formRole
      });

      setUsersList(usersList.map(u => u.id === selectedUser.id ? { ...u, ...updated } : u));
      setShowEditModal(false);

      Swal.fire({
        title: '¡Usuario Actualizado!',
        text: `Se modificaron los datos de "${formName}".`,
        icon: 'success',
        confirmButtonColor: '#0d9488'
      });
    } catch (error) {
      Swal.fire({
        title: 'Error al Actualizar',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setSubmittingUser(false);
    }
  };

  // Eliminar Usuario
  const handleDeleteUser = async (u) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar Usuario?',
      text: `¿Estás seguro de que deseas revocar el acceso a "${u.name}" (${u.email})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Eliminar Acceso',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await deleteUserApi(u.id);
        setUsersList(usersList.filter(item => item.id !== u.id));
        
        Swal.fire({
          title: 'Eliminado',
          text: `El usuario "${u.name}" ha sido eliminado del sistema.`,
          icon: 'success',
          confirmButtonColor: '#0d9488'
        });
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (!u) return false;
    const nameStr = String(u.name || '').toLowerCase();
    const emailStr = String(u.email || '').toLowerCase();
    const roleStr = String(u.role || '').toLowerCase();
    const term = userSearchTerm.toLowerCase();
    return nameStr.includes(term) || emailStr.includes(term) || roleStr.includes(term);
  });

  // Roles Matriz
  const [roles] = useState([
    { id: 'ROLE-01', name: 'Administrador (SuperAdmin)', permissions: { pacientes: true, citas: true, inventario: true, caja: true, cashea: true, rentabilidad: true, alquileres: true, laboratorio: true, seniat: true, nomina: true, auditoria: true } },
    { id: 'ROLE-02', name: 'Gerente Administrativo', permissions: { pacientes: true, citas: true, inventario: true, caja: true, cashea: true, rentabilidad: true, alquileres: true, laboratorio: true, seniat: true, nomina: true, auditoria: true } },
    { id: 'ROLE-03', name: 'Recepción & Atención', permissions: { pacientes: true, citas: true, inventario: false, caja: true, cashea: true, rentabilidad: false, alquileres: false, laboratorio: true, seniat: false, nomina: false, auditoria: false } },
    { id: 'ROLE-04', name: 'Asistente Dental', permissions: { pacientes: true, citas: true, inventario: true, caja: true, cashea: false, rentabilidad: false, alquileres: false, laboratorio: true, seniat: false, nomina: false, auditoria: false } },
    { id: 'ROLE-05', name: 'Médico Especialista / Odontólogo', permissions: { pacientes: true, citas: true, inventario: false, caja: false, cashea: false, rentabilidad: false, alquileres: false, laboratorio: true, seniat: false, nomina: false, auditoria: false } }
  ]);

  // Buscador Portal Móvil
  const [searchDocId, setSearchDocId] = useState('');
  const [foundPatient, setFoundPatient] = useState(null);
  const safePatients = Array.isArray(patients) ? patients : [];

  const handleSearchDoctorPatient = (e) => {
    e.preventDefault();
    const cleanId = searchDocId.trim().toLowerCase();
    const match = safePatients.find(p => {
      const docStr = (p?.documentId || p?.document_id || '').toLowerCase();
      const nameStr = (p?.name || p?.full_name || '').toLowerCase();
      return docStr.includes(cleanId) || nameStr.includes(cleanId);
    });

    if (match) {
      setFoundPatient(match);
    } else {
      Swal.fire('No Encontrado', 'No se encontró ningún paciente con la Cédula introducida.', 'info');
      setFoundPatient(null);
    }
  };

  // Logs Auditoría
  const [auditLogs] = useState([
    { id: 'LOG-8801', user: 'admin@vidasanacmo.com', role: 'SuperAdmin', action: 'Inició sesión en la plataforma', module: 'Autenticación', timestamp: '2026-08-07 10:14:22', ip: '190.202.45.12' },
    { id: 'LOG-8802', user: 'admin@vidasanacmo.com', role: 'SuperAdmin', action: 'Ejecutó cobro de consulta $45.00 USD', module: 'Caja Multi-moneda', timestamp: '2026-08-07 10:20:15', ip: '190.202.45.12' },
    { id: 'LOG-8803', user: 'admin@vidasanacmo.com', role: 'SuperAdmin', action: 'Registró nuevo expediente médico en Supabase', module: 'Pacientes & Expedientes', timestamp: '2026-08-07 11:05:01', ip: '190.202.45.12' },
    { id: 'LOG-8804', user: 'admin@vidasanacmo.com', role: 'SuperAdmin', action: 'Actualizó permisos de usuarios en la nube', module: 'Gestión de Usuarios', timestamp: '2026-08-07 11:40:19', ip: '190.202.45.12' }
  ]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-teal-600 w-7 h-7" />
            Gestión Completa de Usuarios, Roles & Auditoría
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
            Panel oficial de administración: registra nuevos usuarios, edita claves/roles, revoca accesos e inspecciona registros de seguridad.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          + Registrar Nuevo Usuario
        </button>
      </div>

      {/* Tabs Nav */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1e2d5a] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white dark:bg-[#111c3a] text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-[#1e2d5a]'
          }`}
        >
          <Users className="w-4 h-4" />
          1. Directorio de Usuarios ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'roles' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white dark:bg-[#111c3a] text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-[#1e2d5a]'
          }`}
        >
          <Key className="w-4 h-4" />
          2. Permisos por Rol
        </button>

        <button
          onClick={() => setActiveTab('doctor-portal')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'doctor-portal' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white dark:bg-[#111c3a] text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-[#1e2d5a]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          3. Portal Móvil Médico (Por Cédula)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white dark:bg-[#111c3a] text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-[#1e2d5a]'
          }`}
        >
          <History className="w-4 h-4" />
          4. Auditoría de Seguridad
        </button>
      </div>

      {/* TAB 1: GESTIÓN DE USUARIOS */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-200 dark:border-[#1e2d5a]">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Usuarios Registrados en la Plataforma
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Administra cuentas, roles y credenciales de acceso en tiempo real.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar usuario, correo o rol..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Cargando usuarios desde Supabase...</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1e2d5a]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-[#0d162f] text-slate-800 dark:text-slate-200 font-extrabold border-b border-slate-300 dark:border-[#1e2d5a]">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nombre Completo</th>
                    <th className="p-3">Correo Electrónico</th>
                    <th className="p-3">Rol Asignado</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#1e2d5a] font-bold text-slate-900 dark:text-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-slate-500 font-medium">
                        No se encontraron usuarios registrados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-mono text-slate-500 font-extrabold">#{u.id}</td>
                        <td className="p-3 font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {String(u.name || 'U').slice(0, 1).toUpperCase()}
                          </div>
                          {u.name || 'Sin Nombre'}
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                            u.role === 'Administrador' || u.role?.includes('SuperAdmin')
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                              : u.role === 'Gerente Administrativo'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                              : 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                          }`}>
                            {u.role || 'Administrador'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            ● Activo
                          </span>
                        </td>
                        <td className="p-3 text-center space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 transition-all inline-flex items-center gap-1 text-[11px] font-bold"
                            title="Editar Usuario"
                          >
                            <Edit className="w-3.5 h-3.5 text-teal-600" />
                            Editar
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800 transition-all inline-flex items-center gap-1 text-[11px] font-bold"
                            title="Eliminar Acceso"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MATRIZ DE ROLES */}
      {activeTab === 'roles' && (
        <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-[#1e2d5a]">
            Matriz Jerárquica de Permisos por Rol
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1e2d5a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-[#0d162f] text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-[#1e2d5a]">
                <tr>
                  <th className="p-3">Rol Jerárquico</th>
                  <th className="p-3 text-center">Pacientes</th>
                  <th className="p-3 text-center">Citas</th>
                  <th className="p-3 text-center">Inventario</th>
                  <th className="p-3 text-center">Caja & Cobros</th>
                  <th className="p-3 text-center">Cashea</th>
                  <th className="p-3 text-center">Rentabilidad</th>
                  <th className="p-3 text-center">SENIAT / Nómina</th>
                  <th className="p-3 text-center">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e2d5a] font-bold text-slate-900 dark:text-slate-100">
                {roles.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-extrabold">{r.name}</td>
                    <td className="p-3 text-center">{r.permissions.pacientes ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{r.permissions.citas ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{r.permissions.inventario ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{r.permissions.caja ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{r.permissions.cashea ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{r.permissions.rentabilidad ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{r.permissions.seniat ? '✅' : '❌'}</td>
                    <td className="p-3 text-center">{r.permissions.auditoria ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PORTAL MEDICO POR CEDULA */}
      {activeTab === 'doctor-portal' && (
        <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-600" />
              Consulta Rápida del Médico Especialista
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Ingresa la cédula del paciente para visualizar instantáneamente su historial clínico completo.</p>
          </div>

          <form onSubmit={handleSearchDoctorPatient} className="flex gap-3 max-w-lg">
            <input
              type="text"
              placeholder="Ej: V-14.850.320 o Nombre..."
              value={searchDocId}
              onChange={(e) => setSearchDocId(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar Ficha
            </button>
          </form>

          {foundPatient && (
            <div className="p-5 bg-teal-50 dark:bg-teal-900/20 border border-teal-300 dark:border-teal-700/50 rounded-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 bg-teal-600 text-white text-[10px] font-black rounded uppercase">Expediente Encontrado</span>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">{foundPatient.name || foundPatient.full_name}</h4>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-300">Cédula: {foundPatient.documentId || foundPatient.document_id} • Categoria: {foundPatient.category || 'Privado'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            Registro Inmutable de Auditoría de Seguridad (Audit Trail)
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1e2d5a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-[#0d162f] text-slate-800 dark:text-slate-200 font-extrabold border-b border-slate-300 dark:border-[#1e2d5a]">
                <tr>
                  <th className="p-3">Código Evento</th>
                  <th className="p-3">Usuario Operador</th>
                  <th className="p-3">Acción Registrada</th>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Fecha & Hora</th>
                  <th className="p-3 text-right">Dirección IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e2d5a] font-mono text-slate-800 dark:text-slate-200">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-teal-600">{log.id}</td>
                    <td className="p-3 font-sans font-bold">{log.user}</td>
                    <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{log.action}</td>
                    <td className="p-3 font-sans font-medium">{log.module}</td>
                    <td className="p-3 text-slate-500">{log.timestamp}</td>
                    <td className="p-3 text-right font-bold">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CREAR USUARIO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              Registrar Nuevo Usuario del Sistema
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre Completo del Usuario</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Dra. María Alejandra Gómez"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico de Acceso</label>
                <input
                  type="email"
                  required
                  placeholder="usuario@vidasanacmo.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Contraseña de Seguridad</label>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Rol Jerárquico Asignado</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-bold"
                >
                  <option value="Administrador">Administrador Principal (Acceso Total)</option>
                  <option value="Gerente Administrativo">Gerente Administrativo</option>
                  <option value="Recepción & Atención">Recepción & Atención al Cliente</option>
                  <option value="Asistente Dental">Asistente Dental</option>
                  <option value="Médico Especialista">Médico Especialista / Odontólogo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#1e2d5a]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {submittingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submittingUser ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-teal-600" />
              Editar Usuario #{selectedUser.id}
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Cambiar Contraseña (Opcional)</label>
                <input
                  type="password"
                  placeholder="Dejar en blanco para conservar la contraseña actual"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Rol Jerárquico Asignado</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-bold"
                >
                  <option value="Administrador">Administrador Principal (Acceso Total)</option>
                  <option value="Gerente Administrativo">Gerente Administrativo</option>
                  <option value="Recepción & Atención">Recepción & Atención al Cliente</option>
                  <option value="Asistente Dental">Asistente Dental</option>
                  <option value="Médico Especialista">Médico Especialista / Odontólogo</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#1e2d5a]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {submittingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submittingUser ? 'Actualizando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
