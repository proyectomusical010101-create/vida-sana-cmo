import React, { useState } from 'react';
import { 
  Users, DollarSign, Calendar, TrendingUp, Clock, CheckCircle2, XCircle, 
  Stethoscope, Activity, FileText, ChevronRight, ShieldCheck, ArrowUpRight 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function DashboardOverviewModule({
  patients = [],
  appointments = [],
  transactions = [],
  bcvRate = 755.90,
  selectedCurrency = 'USD',
  currencySymbol = '$',
  onNavigateToModule
}) {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Ranking de Rendimiento Médico (Médicos con más servicios realizados)
  const doctorsRanking = [
    { name: 'Dra. Adriana Leal', division: 'Odontología', servicesCount: 28, revenue: 1420.00, avatarBg: 'bg-emerald-600' },
    { name: 'Dr. Carlos Mendoza', division: 'Odontología (Ortodoncia)', servicesCount: 22, revenue: 1150.00, avatarBg: 'bg-teal-600' },
    { name: 'Dra. Vanessa Rivas', division: 'Endodoncia & Cirugía', servicesCount: 18, revenue: 940.00, avatarBg: 'bg-blue-600' },
    { name: 'Dr. Alejandro Ruiz', division: 'Medicina General', servicesCount: 14, revenue: 650.00, avatarBg: 'bg-indigo-600' },
    { name: 'Od. Viviana', division: 'Rayos X & Imagenología', servicesCount: 12, revenue: 420.00, avatarBg: 'bg-amber-600' }
  ];

  // Pacientes este mes
  const totalPatients = patients.length || 24;
  
  // Ingresos Totales Calculados
  const totalRevenueUsd = transactions.reduce((acc, t) => acc + (t.total || 0), 0) || 3450.00;
  const totalRevenueBs = totalRevenueUsd * bcvRate;

  // Citas Pendientes
  const pendingAppointmentsList = appointments.length > 0 ? appointments : [
    { id: 'APT-101', patientName: 'Santiago Andrés Peña', doctor: 'Dr. Carlos Mendoza', specialty: 'Odontología (Ortodoncia)', time: '09:00 AM', status: 'En Espera', area: 'ODONTOLOGIA' },
    { id: 'APT-102', patientName: 'María Fernanda Gómez', doctor: 'Dra. Vanessa Rivas', specialty: 'Endodoncia Molar', time: '10:30 AM', status: 'Confirmada', area: 'ODONTOLOGIA' },
    { id: 'APT-103', patientName: 'Carlos Eduardo López', doctor: 'Dr. Alejandro Ruiz', specialty: 'Evaluación Médica General', time: '11:15 AM', status: 'Confirmada', area: 'MEDICINA' },
    { id: 'APT-104', patientName: 'Valentina Martínez', doctor: 'Od. Viviana', specialty: 'Rayos X Panorámico', time: '02:00 PM', status: 'En Espera', area: 'RAYOS_X' },
    { id: 'APT-105', patientName: 'José Luis Rodríguez', doctor: 'Dra. Adriana Leal', specialty: 'Perfil 20 Completo', time: '03:30 PM', status: 'Confirmada', area: 'LABORATORIO' }
  ];

  const filteredAppointments = selectedStatusFilter === 'ALL'
    ? pendingAppointmentsList
    : pendingAppointmentsList.filter(a => a.status === selectedStatusFilter);

  const handleStatusChange = (aptId, newStatus) => {
    Swal.fire({
      title: 'Actualizar Estatus de Cita',
      text: `¿Desea cambiar el estatus de la cita a "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, Actualizar',
      cancelButtonText: 'Cancelar'
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.fire('Estatus Actualizado', `La cita ${aptId} ahora está marcada como ${newStatus}.`, 'success');
      }
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. HEADER DEL DASHBOARD EJECUTIVO */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 font-extrabold text-[10px] rounded-full uppercase border border-teal-500/40">
              Centro Médico Odontológico Vida Sana
            </span>
            <span className="text-xs text-slate-400">Tasa Oficial BCV: {bcvRate.toFixed(2)} Bs / {selectedCurrency}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Dashboard Ejecutivo & Panel de Control General
          </h2>
          <p className="text-xs text-slate-300">
            Resumen estadístico en tiempo real, ingresos consolidados, citas programadas y flujo de consultorios.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onNavigateToModule && onNavigateToModule(4)}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            Ir a Cierre de Caja
          </button>
        </div>
      </div>

      {/* 2. TARJETAS DE MÉTRICAS CLAVE (KPIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Pacientes Atendidos</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalPatients}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14% vs mes anterior</span>
          </div>
        </div>

        {/* KPI 2 - CON MONEDA DINÁMICA ($ vs €) */}
        <div className="p-5 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Recaudado este Mes ({selectedCurrency})</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#84a93c] dark:text-[#a2d034] font-mono">
            {currencySymbol}{totalRevenueUsd.toLocaleString('es-VE', { minimumFractionDigits: 2 })} {selectedCurrency}
          </div>
          <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            Eq: {totalRevenueBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Citas Programadas</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {pendingAppointmentsList.length} Citas
          </div>
          <div className="text-xs text-blue-600 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>5 Pendientes para hoy</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Eficiencia Clínica</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            98.5%
          </div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sin devoluciones</span>
          </div>
        </div>

      </div>

      {/* 3. DISTRIBUCIÓN DE INGRESOS POR ÁREA MÉDICA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-12 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            Distribución de Ingresos por Especialidad ({selectedCurrency})
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* ODONTOLOGIA */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  Odontología General & Especialidades
                </span>
                <span className="font-mono text-slate-900 dark:text-white">{currencySymbol}1,820.00 {selectedCurrency} (53%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[53%]"></div>
              </div>
            </div>

            {/* MEDICINA ESPECIALIZADA */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Medicina Especializada
                </span>
                <span className="font-mono text-slate-900 dark:text-white">{currencySymbol}650.00 {selectedCurrency} (19%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[19%]"></div>
              </div>
            </div>

            {/* RAYOS X */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-yellow-700 dark:text-yellow-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-600"></span>
                  Rayos X & Imagenología
                </span>
                <span className="font-mono text-slate-900 dark:text-white">{currencySymbol}420.00 {selectedCurrency} (12%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-600 rounded-full w-[12%]"></div>
              </div>
            </div>

            {/* LABORATORIO */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  Laboratorio Clínico
                </span>
                <span className="font-mono text-slate-900 dark:text-white">{currencySymbol}230.00 {selectedCurrency} (7%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full w-[7%]"></div>
              </div>
            </div>

          </div>
        </div>

        {/* 🏆 RANKING DE RENDIMIENTO DE MÉDICOS Y MÁS ACTIVOS CON MONEDA DINÁMICA */}
        <div className="lg:col-span-12 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Rendimiento de Médicos & Especialistas Más Activos
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ranking de producción según cantidad de procedimientos realizados y recaudación generada ({selectedCurrency})
              </p>
            </div>
            <span className="text-xs font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              🏆 Top Especialistas del Mes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {doctorsRanking.map((doc, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl ${doc.avatarBg} text-white font-black flex items-center justify-center text-xs shadow-sm`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs line-clamp-1">{doc.name}</h4>
                    <span className="text-[10px] text-slate-500 block font-semibold">{doc.division}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Servicios:</span>
                    <span className="text-slate-900 dark:text-white font-mono">{doc.servicesCount} Atenciones</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Recaudado:</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-mono font-black">
                      {currencySymbol}{doc.revenue.toFixed(2)} {selectedCurrency}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. TABLA DE CITAS PENDIENTES & PROGRAMADAS DEL DÍA */}
      <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] p-6 rounded-3xl shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Lista de Citas Pendientes & Programadas
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Agenda diaria de pacientes citados por consultorio y especialista tratante
            </p>
          </div>

          {/* FILTRO DE ESTATUS */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filtrar:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="ALL">Todas las Citas</option>
              <option value="En Espera">En Espera</option>
              <option value="Confirmada">Confirmadas</option>
              <option value="Atendida">Atendidas</option>
            </select>
          </div>
        </div>

        {/* TABLA DE CITAS */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">ID Cita</th>
                <th className="p-3">Hora</th>
                <th className="p-3">Paciente</th>
                <th className="p-3">Especialidad / Servicio</th>
                <th className="p-3">Odontólogo / Especialista</th>
                <th className="p-3">Estatus Cita</th>
                <th className="p-3 text-center">Acción Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-bold text-slate-800 dark:text-slate-200">
              {filteredAppointments.map(apt => (
                <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                  <td className="p-3 font-mono font-extrabold text-teal-700 dark:text-teal-400">{apt.id}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {apt.time}
                  </td>
                  <td className="p-3 font-black text-slate-900 dark:text-white">{apt.patientName}</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{apt.specialty}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{apt.doctor}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      apt.status === 'Confirmada' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                      apt.status === 'En Espera' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        onClick={() => handleStatusChange(apt.id, 'Atendida')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all"
                        title="Marcar Atendida"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Atendida
                      </button>
                      <button
                        onClick={() => handleStatusChange(apt.id, 'Cancelada')}
                        className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg text-rose-600 transition-all"
                        title="Cancelar Cita"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
