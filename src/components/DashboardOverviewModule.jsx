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

  // Estado para Modal y Filtro de Clientes Atendidos
  const todayStr = new Date().toISOString().slice(0, 10);
  const [showAttendedModal, setShowAttendedModal] = useState(false);
  const [attendedDateFilter, setAttendedDateFilter] = useState(todayStr);

  // Helper para agrupar pacientes atendidos desde transacciones, citas e historias clínicas
  const getAttendedPatients = (dateFilter) => {
    const list = [];
    const seenMap = new Set();

    // 1. Transacciones registradas
    (transactions || []).forEach((t, idx) => {
      const txDate = (t.date || '').slice(0, 10);
      if (dateFilter === 'ALL' || txDate === dateFilter) {
        const patientMatch = (patients || []).find(p => 
          (p.name || p.full_name || '').toLowerCase() === (t.patient || t.patient_name || '').toLowerCase()
        ) || { name: t.patient || t.patient_name || 'Paciente Registrado' };

        const key = `tx-${t.id || idx}-${patientMatch.name}-${t.procedure || t.procedure_name || ''}`;
        if (!seenMap.has(key)) {
          seenMap.add(key);
          list.push({
            patient: patientMatch,
            date: txDate || dateFilter,
            procedure: t.procedure || t.procedure_name || 'Consulta / Tratamiento',
            doctor: t.doctor || t.doctor_name || 'Especialista',
            total: parseFloat(t.total || t.amount || 0)
          });
        }
      }
    });

    // 2. Citas marcadas como Atendida o Completada
    (appointments || []).forEach(a => {
      if (a.status === 'Atendida' || a.status === 'Completada') {
        const apptDate = (a.date || '').slice(0, 10);
        if (dateFilter === 'ALL' || apptDate === dateFilter) {
          const patientMatch = (patients || []).find(p => 
            (p.name || p.full_name || '').toLowerCase() === (a.patientName || '').toLowerCase()
          ) || { name: a.patientName || 'Paciente Citado' };

          const key = `appt-${a.id}-${patientMatch.name}`;
          if (!seenMap.has(key)) {
            seenMap.add(key);
            list.push({
              patient: patientMatch,
              date: apptDate || dateFilter,
              procedure: a.procedureName || a.specialty || 'Atención Odontológica',
              doctor: a.specialistName || a.doctor || 'Especialista',
              total: 0
            });
          }
        }
      }
    });

    // 3. Historias Clínicas en pacientes
    (patients || []).forEach(p => {
      if (Array.isArray(p.history)) {
        p.history.forEach(h => {
          const hDate = (h.date || '').slice(0, 10);
          if (dateFilter === 'ALL' || hDate === dateFilter) {
            const key = `hist-${p.id}-${h.procedure}-${hDate}`;
            if (!seenMap.has(key)) {
              seenMap.add(key);
              list.push({
                patient: p,
                date: hDate,
                procedure: h.procedure || 'Consulta Médica',
                doctor: h.doctor || 'Especialista',
                total: parseFloat(h.cost || 0)
              });
            }
          }
        });
      }
    });

    return list;
  };

  const attendedTodayList = getAttendedPatients(todayStr);
  const attendedFilteredList = getAttendedPatients(attendedDateFilter);

  // Pacientes este mes (Real)
  const totalPatients = patients.length;
  
  // Ingresos Totales Calculados (Real)
  const totalRevenueUsd = transactions.reduce((acc, t) => acc + (parseFloat(t.total || t.amount) || 0), 0);
  const totalRevenueBs = totalRevenueUsd * bcvRate;

  // Citas Pendientes (Real)
  const pendingAppointmentsList = appointments || [];

  // Ranking Dinámico de Médicos según Transacciones Reales
  const doctorsMap = {};
  transactions.forEach(t => {
    const docName = t.doctor || 'Especialista General';
    if (!doctorsMap[docName]) {
      doctorsMap[docName] = { name: docName, division: t.specialty || 'General', servicesCount: 0, revenue: 0, avatarBg: 'bg-teal-600' };
    }
    doctorsMap[docName].servicesCount += 1;
    doctorsMap[docName].revenue += parseFloat(t.total || t.amount) || 0;
  });

  const doctorsRanking = Object.values(doctorsMap).sort((a, b) => b.revenue - a.revenue);

  // Distribución Real de Ingresos por Área
  const revenueByDivision = { ODONTOLOGIA: 0, MEDICINA: 0, RAYOS_X: 0, LABORATORIO: 0 };
  transactions.forEach(t => {
    const div = t.area || t.division || 'ODONTOLOGIA';
    if (revenueByDivision[div] !== undefined) {
      revenueByDivision[div] += parseFloat(t.total || t.amount) || 0;
    } else {
      revenueByDivision.ODONTOLOGIA += parseFloat(t.total || t.amount) || 0;
    }
  });

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
        
        {/* KPI 1 - PACIENTES ATENDIDOS HOY (CLICKABLE CON MODAL Y FILTRO POR FECHA) */}
        <div
          onClick={() => setShowAttendedModal(true)}
          className="p-5 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-sm hover:shadow-md hover:border-teal-500 dark:hover:border-teal-500 transition-all space-y-2 cursor-pointer group"
        >
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider group-hover:text-teal-600 transition-colors">
              Clientes Atendidos Hoy
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 font-black group-hover:bg-teal-600 group-hover:text-white transition-all">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-baseline gap-2">
            <span>{attendedTodayList.length}</span>
            <span className="text-xs text-slate-500 font-sans font-bold">paciente(s) hoy</span>
          </div>
          <div className="flex items-center justify-between text-xs text-teal-600 dark:text-teal-400 font-extrabold pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>👁️ Ver lista & filtrar fechas</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            <span>{pendingAppointmentsList.filter(a => a.status !== 'Atendida' && a.status !== 'Cancelada').length} Pendientes para hoy</span>
          </div>
        </div>

        {/* KPI 4 - EFICIENCIA CLÍNICA DINÁMICA */}
        <div className="p-5 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-sm hover:shadow-md transition-all space-y-2">
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="text-xs font-black uppercase tracking-wider">Eficiencia Clínica</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {pendingAppointmentsList.length > 0
              ? `${(((pendingAppointmentsList.length - pendingAppointmentsList.filter(a => a.status === 'Cancelada').length) / pendingAppointmentsList.length) * 100).toFixed(1)}%`
              : '100.0%'}
          </div>
          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {pendingAppointmentsList.filter(a => a.status === 'Cancelada').length === 0
                ? 'Sin cancelaciones ni devoluciones'
                : `${pendingAppointmentsList.filter(a => a.status === 'Cancelada').length} cita(s) cancelada(s)`}
            </span>
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
                <span className="font-mono text-slate-900 dark:text-white">
                  {currencySymbol}{(revenueByDivision.ODONTOLOGIA || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} {selectedCurrency} ({totalRevenueUsd > 0 ? Math.round(((revenueByDivision.ODONTOLOGIA || 0) / totalRevenueUsd) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${totalRevenueUsd > 0 ? Math.round(((revenueByDivision.ODONTOLOGIA || 0) / totalRevenueUsd) * 100) : 0}%` }}></div>
              </div>
            </div>

            {/* MEDICINA ESPECIALIZADA */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Medicina Especializada
                </span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {currencySymbol}{(revenueByDivision.MEDICINA || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} {selectedCurrency} ({totalRevenueUsd > 0 ? Math.round(((revenueByDivision.MEDICINA || 0) / totalRevenueUsd) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${totalRevenueUsd > 0 ? Math.round(((revenueByDivision.MEDICINA || 0) / totalRevenueUsd) * 100) : 0}%` }}></div>
              </div>
            </div>

            {/* RAYOS X */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-yellow-700 dark:text-yellow-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-600"></span>
                  Rayos X & Imagenología
                </span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {currencySymbol}{(revenueByDivision.RAYOS_X || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} {selectedCurrency} ({totalRevenueUsd > 0 ? Math.round(((revenueByDivision.RAYOS_X || 0) / totalRevenueUsd) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-600 rounded-full" style={{ width: `${totalRevenueUsd > 0 ? Math.round(((revenueByDivision.RAYOS_X || 0) / totalRevenueUsd) * 100) : 0}%` }}></div>
              </div>
            </div>

            {/* LABORATORIO */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  Laboratorio Clínico
                </span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {currencySymbol}{(revenueByDivision.LABORATORIO || 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} {selectedCurrency} ({totalRevenueUsd > 0 ? Math.round(((revenueByDivision.LABORATORIO || 0) / totalRevenueUsd) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${totalRevenueUsd > 0 ? Math.round(((revenueByDivision.LABORATORIO || 0) / totalRevenueUsd) * 100) : 0}%` }}></div>
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

          {doctorsRanking.length > 0 ? (
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
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1">
              <span className="text-xs font-bold text-slate-500 block">Sin recaudaciones registradas en este período</span>
              <p className="text-[11px] text-slate-400">A medida que registres atenciones en Caja, aparecerá aquí el ranking de producción de tus especialistas.</p>
            </div>
          )}
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

      {/* MODAL DE PACIENTES ATENDIDOS CON FILTRO DE FECHAS */}
      {showAttendedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] text-slate-900 dark:text-white w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-[#1e2d5a] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header Modal */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  Lista de Clientes Atendidos
                </h3>
                <p className="text-xs text-slate-300">
                  Consulte los pacientes atendidos hoy o seleccione cualquier fecha pasada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAttendedModal(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-xl transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Barra de Filtro de Fecha */}
            <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border-b border-slate-200 dark:border-[#1e2d5a] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <label className="font-extrabold text-slate-700 dark:text-slate-300">Seleccionar Fecha:</label>
                <input
                  type="date"
                  value={attendedDateFilter === 'ALL' ? '' : attendedDateFilter}
                  onChange={(e) => setAttendedDateFilter(e.target.value || 'ALL')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAttendedDateFilter(todayStr)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    attendedDateFilter === todayStr
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-teal-500'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setAttendedDateFilter(yesterday.toISOString().slice(0, 10));
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-extrabold text-slate-700 dark:text-slate-300 hover:border-teal-500 cursor-pointer"
                >
                  Ayer
                </button>
                <button
                  type="button"
                  onClick={() => setAttendedDateFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    attendedDateFilter === 'ALL'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-teal-500'
                  }`}
                >
                  Ver Todos los Registros
                </button>
              </div>
            </div>

            {/* Contenido / Lista de Atendidos */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-1">
                <span>Mostrando {attendedFilteredList.length} paciente(s) atendido(s)</span>
                <span>{attendedDateFilter === 'ALL' ? 'Histórico Completo' : `Fecha: ${attendedDateFilter}`}</span>
              </div>

              {attendedFilteredList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#0d162f] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                  <span className="text-3xl block">📋</span>
                  <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No hay registros de atención para esta fecha</h4>
                  <p className="text-xs text-slate-500">Pruebe seleccionando otra fecha o presione "Ver Todos los Registros".</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {attendedFilteredList.map((item, index) => {
                    const p = item.patient || {};
                    const pName = p.name || p.full_name || 'Paciente sin nombre';
                    const pDoc = p.documentId || p.document_id || 'Sin Documento';
                    const pPhone = p.phone || p.phone_number || p.telefonos || 'Sin Teléfono';

                    return (
                      <div key={index} className="p-3.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900 dark:text-white">{pName}</span>
                            <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 text-[10px] font-mono font-black rounded">{pDoc}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                            <span>🩺 {item.procedure}</span>
                            <span>•</span>
                            <span>👨‍⚕️ {item.doctor}</span>
                          </p>
                          <span className="text-[10px] text-slate-400 font-bold">📞 {pPhone} • Fecha: {item.date}</span>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {item.total > 0 && (
                            <span className="font-mono text-teal-700 dark:text-teal-400 font-black text-sm">${item.total.toFixed(2)} USD</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttendedModal(false);
                              if (onNavigateToModule) onNavigateToModule(1);
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span>Expediente</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
