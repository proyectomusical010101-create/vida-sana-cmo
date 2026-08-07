import React, { useState } from 'react';
import { ShieldCheck, Smartphone, History, Search, Key, UserCheck, CheckSquare, Lock, Eye, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

export default function AuditRolesPortalModule({ patients = [], transactions = [], currentUser }) {
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'doctor-portal' | 'audit'

  // Matriz de Roles
  const [roles, setRoles] = useState([
    {
      id: 'ROLE-01',
      name: 'Dueño (SuperAdmin)',
      permissions: { pacientes: true, citas: true, inventario: true, caja: true, cashea: true, rentabilidad: true, alquileres: true, laboratorio: true, seniat: true, nomina: true, auditoria: true }
    },
    {
      id: 'ROLE-02',
      name: 'Gerente Administrativo',
      permissions: { pacientes: true, citas: true, inventario: true, caja: true, cashea: true, rentabilidad: true, alquileres: true, laboratorio: true, seniat: true, nomina: true, auditoria: true }
    },
    {
      id: 'ROLE-03',
      name: 'Recepción & Atencion',
      permissions: { pacientes: true, citas: true, inventario: false, caja: true, cashea: true, rentabilidad: false, alquileres: false, laboratorio: true, seniat: false, nomina: false, auditoria: false }
    },
    {
      id: 'ROLE-04',
      name: 'Médico Especialista',
      permissions: { pacientes: true, citas: true, inventario: false, caja: false, cashea: false, rentabilidad: false, alquileres: false, laboratorio: true, seniat: false, nomina: false, auditoria: false }
    }
  ]);

  // Buscador Portal Móvil del Médico por Cédula
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
      alert('⚠️ No se encontró ningún paciente con la Cédula introducida.');
      setFoundPatient(null);
    }
  };

  // Historial de Acciones (Audit Trail) Mock
  const [auditLogs, setAuditLogs] = useState([
    { id: 'LOG-8801', user: 'admin@vidasana.com', role: 'SuperAdmin', action: 'Inició sesión en el sistema', module: 'Autenticación', timestamp: '2026-08-07 10:14:22', ip: '190.202.45.12' },
    { id: 'LOG-8802', user: 'admin@vidasana.com', role: 'SuperAdmin', action: 'Ejecutó cobro de consulta $45.00 USD', module: 'Caja Multi-moneda', timestamp: '2026-08-07 10:20:15', ip: '190.202.45.12' },
    { id: 'LOG-8803', user: 'admin@vidasana.com', role: 'SuperAdmin', action: 'Registró nuevo paciente menor sin cédula', module: 'Pacientes & Expedientes', timestamp: '2026-08-07 11:05:01', ip: '190.202.45.12' },
    { id: 'LOG-8804', user: 'admin@vidasana.com', role: 'SuperAdmin', action: 'Cargó baremo masivo vía Excel', module: 'Servicios & Baremos', timestamp: '2026-08-07 11:40:19', ip: '190.202.45.12' }
  ]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-teal-600 w-7 h-7" />
            Matriz de Roles, Portal Móvil Médico & Audit Trail
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Control de permisos por rol, consulta rápida de expedientes para médicos por cédula e historial de acciones de seguridad.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'roles' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          1. Matriz Jerárquica de Roles & Permisos
        </button>

        <button
          onClick={() => setActiveTab('doctor-portal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'doctor-portal' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-100 border border-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          2. Portal Móvil del Médico (Por Cédula)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          3. Auditoría de Acciones (Audit Trail)
        </button>
      </div>

      {/* TAB 1: MATRIZ DE ROLES */}
      {activeTab === 'roles' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">
            Matriz de Permisos por Rol Jerárquico
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
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
              <tbody className="divide-y divide-slate-200 font-bold text-slate-900">
                {roles.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-slate-900">{r.name}</td>
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

      {/* TAB 2: PORTAL MÓVIL DEL MÉDICO */}
      {activeTab === 'doctor-portal' && (
        <div className="space-y-6">
          {/* Dashboard Resumido del Médico */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-600">Pacientes Atendidos:</span>
              <div className="text-2xl font-extrabold text-slate-900">28 Pacientes</div>
            </div>

            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-600">Honorarios Cobrados Acumulados:</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-900">$1,450.00 USD</div>
            </div>

            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-600">Retenciones Ley (1% Pagos Bs):</span>
              <div className="text-2xl font-extrabold font-mono text-blue-900">$14.50 USD</div>
            </div>
          </div>

          {/* Búsqueda Responsive por Cédula del Paciente */}
          <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-teal-600" />
              Consulta Rápida de Expediente (Únicamente por Cédula)
            </h3>

            <form onSubmit={handleSearchDoctorPatient} className="flex gap-2 max-w-md">
              <input
                type="text"
                required
                placeholder="Introduzca la Cédula (Ej: V-25.148.963)..."
                value={searchDocId}
                onChange={(e) => setSearchDocId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-sm shrink-0"
              >
                <Search className="w-4 h-4" /> Buscar
              </button>
            </form>

            {foundPatient && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{foundPatient.name || foundPatient.full_name}</h4>
                    <p className="text-slate-600 font-mono">Cédula: {foundPatient.documentId || foundPatient.document_id} | Edad: {foundPatient.age || 30} Años</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-900 font-extrabold text-xs">
                    {foundPatient.category || 'Privado'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h5 className="font-extrabold text-slate-800">Historial Clínico Resumido:</h5>
                  <div className="space-y-1.5">
                    {(foundPatient.history || []).map((h, i) => (
                      <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">{h.procedure || h.procedure_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{h.date} - Tratante: {h.doctor || h.doctor_name}</div>
                        </div>
                        <span className="font-mono font-extrabold text-emerald-900 text-sm">${(h.cost || h.amount || 0).toFixed(2)} USD</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            Registro de Auditoría de Acciones (Audit Trail Global)
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">ID Log</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Acción Efectuada</th>
                  <th className="p-3">Módulo</th>
                  <th className="p-3 font-mono">Fecha / Hora</th>
                  <th className="p-3 font-mono text-right">Dirección IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{log.id}</td>
                    <td className="p-3 font-bold text-slate-900">{log.user}</td>
                    <td className="p-3 text-slate-700">{log.role}</td>
                    <td className="p-3 font-semibold text-slate-800">{log.action}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{log.timestamp}</td>
                    <td className="p-3 font-mono text-right text-slate-500">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
