import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Plus, CheckCircle, MessageSquare, AlertCircle, Filter, User, Search, Stethoscope, Layers, ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { createAppointmentApi, deleteAppointmentApi } from '../api';

// Helper para obtener el nombre del día de la semana en español a partir de una fecha YYYY-MM-DD
function getDayNameInSpanish(dateStr) {
  if (!dateStr) return 'Lunes';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 'Lunes';
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const dayIndex = d.getDay(); // 0: Domingo, 1: Lunes, etc.
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dayNames[dayIndex] || 'Lunes';
}

export default function AppointmentsModule({ appointments = [], setAppointments, patients = [], specialists = [], procedures = [] }) {
  const [selectedConsultoryFilter, setSelectedConsultoryFilter] = useState('Todos');
  const [showNewModal, setShowNewModal] = useState(false);

  // Filtros de búsqueda en la modal
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const [selectedProcedureId, setSelectedProcedureId] = useState('');
  const [selectedSpecialistId, setSelectedSpecialistId] = useState('');

  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formTime, setFormTime] = useState('09:00 AM');
  const [formConsultory, setFormConsultory] = useState('Consultorio 1 (Odontología)');

  const consultories = ['Todos', 'Consultorio 1 (Odontología)', 'Consultorio 2 (Ortodoncia)', 'Consultorio 3 (Cirugía & Implantes)', 'Sala Ecografía / Rayos X'];
  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  // Citas filtradas por consultorio
  const filteredAppointments = useMemo(() => {
    return (appointments || []).filter(a => {
      if (!a) return false;
      return selectedConsultoryFilter === 'Todos' || a.consultory === selectedConsultoryFilter;
    });
  }, [appointments, selectedConsultoryFilter]);

  // Paciente seleccionado objeto
  const selectedPatientObj = useMemo(() => {
    return patients.find(p => String(p.id) === String(selectedPatientId) || p.name === selectedPatientId);
  }, [patients, selectedPatientId]);

  // Procedimiento seleccionado objeto
  const selectedProcedureObj = useMemo(() => {
    return procedures.find(pr => String(pr.id) === String(selectedProcedureId) || pr.name === selectedProcedureId);
  }, [procedures, selectedProcedureId]);

  // Especialista seleccionado objeto
  const selectedSpecialistObj = useMemo(() => {
    return specialists.find(sp => String(sp.id) === String(selectedSpecialistId) || sp.name === selectedSpecialistId);
  }, [specialists, selectedSpecialistId]);

  // Pacientes filtrados por búsqueda
  const searchedPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter(p => {
      const pName = String(p.name || '').toLowerCase();
      const pDoc = String(p.documentId || p.document_id || '').toLowerCase();
      return pName.includes(query) || pDoc.includes(query);
    });
  }, [patients, patientSearch]);

  // Al seleccionar paciente, auto-sugerir el Especialista Asignado si existe
  const handleSelectPatient = (patientObj) => {
    setSelectedPatientId(patientObj.id);
    const assignedSpecName = patientObj.assignedSpecialist || patientObj.assigned_specialist;
    if (assignedSpecName) {
      const specMatch = specialists.find(s => s.name === assignedSpecName || String(s.id) === String(assignedSpecName));
      if (specMatch) {
        setSelectedSpecialistId(specMatch.id);
      }
    }
  };

  // Abrir Modal de Agendamiento
  const handleOpenModal = () => {
    const initialPatient = patients[0];
    const initialProc = procedures[0];
    const initialSpec = specialists[0];

    setSelectedPatientId(initialPatient ? initialPatient.id : '');
    setSelectedProcedureId(initialProc ? initialProc.id : '');
    setSelectedSpecialistId(initialSpec ? initialSpec.id : '');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTime('09:00 AM');
    setPatientSearch('');
    setShowNewModal(true);

    if (initialPatient && (initialPatient.assignedSpecialist || initialPatient.assigned_specialist)) {
      handleSelectPatient(initialPatient);
    }
  };

  // MATRIZ DE CRUCE DE INFORMACIÓN (DISPONIBILIDAD EN TIEMPO REAL)
  const crossCheckAnalysis = useMemo(() => {
    const dayName = getDayNameInSpanish(formDate);
    const warnings = [];
    const okPoints = [];

    // 1. Verificar disponibilidad del Servicio en el día de la semana
    if (selectedProcedureObj) {
      const serviceDays = selectedProcedureObj.availableDays || selectedProcedureObj.available_days || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      const isServiceAvailableDay = serviceDays.some(d => String(d).toLowerCase() === dayName.toLowerCase());

      if (!isServiceAvailableDay) {
        warnings.push(`El servicio "${selectedProcedureObj.name}" solo se atiende los días: ${serviceDays.join(', ')}. (Día seleccionado: ${dayName})`);
      } else {
        okPoints.push(`Servicio "${selectedProcedureObj.name}" disponible los ${dayName}s.`);
      }
    }

    // 2. Verificar disponibilidad del Especialista en el día de la semana
    if (selectedSpecialistObj) {
      const specDays = selectedSpecialistObj.days || selectedSpecialistObj.available_days || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
      const isSpecAvailableDay = Array.isArray(specDays)
        ? specDays.some(d => String(d).toLowerCase() === dayName.toLowerCase())
        : true;

      if (!isSpecAvailableDay) {
        warnings.push(`El especialista "${selectedSpecialistObj.name}" no labora los días ${dayName}s.`);
      } else {
        okPoints.push(`Especialista "${selectedSpecialistObj.name}" labora los días ${dayName}s.`);
      }

      // 3. Verificar si el especialista ya posee una cita agendada en la misma fecha y hora
      const existingAppt = (appointments || []).find(a => {
        if (!a) return false;
        const matchDate = a.date === formDate;
        const matchTime = a.time === formTime;
        const matchSpec = a.specialistName === selectedSpecialistObj.name || a.specialist_name === selectedSpecialistObj.name;
        return matchDate && matchTime && matchSpec;
      });

      if (existingAppt) {
        warnings.push(`El especialista "${selectedSpecialistObj.name}" ya posee la cita #${existingAppt.id} agendada el ${formDate} a las ${formTime} con el paciente "${existingAppt.patientName}".`);
      }
    }

    const isFullyAvailable = warnings.length === 0;
    return { dayName, warnings, okPoints, isFullyAvailable };
  }, [formDate, formTime, selectedProcedureObj, selectedSpecialistObj, appointments]);

  // Guardar Cita Submit
  const handleCreateAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientObj) {
      Swal.fire('Atención', 'Por favor selecciona un paciente de la base de datos.', 'warning');
      return;
    }
    if (!selectedProcedureObj) {
      Swal.fire('Atención', 'Por favor selecciona un servicio o procedimiento del baremo.', 'warning');
      return;
    }
    if (!selectedSpecialistObj) {
      Swal.fire('Atención', 'Por favor selecciona un especialista médico.', 'warning');
      return;
    }

    if (crossCheckAnalysis.warnings.length > 0) {
      const confirmOverride = await Swal.fire({
        title: '⚠️ Advertencia de Incompatibilidad',
        html: `
          <div class="text-left text-xs space-y-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-bold">
            <p>Se detectaron los siguientes conflictos en la agenda:</p>
            <ul class="list-disc pl-4 space-y-1">
              ${crossCheckAnalysis.warnings.map(w => `<li>${w}</li>`).join('')}
            </ul>
            <p class="mt-2 text-rose-700">¿Desea forzar el agendamiento de todas formas?</p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0d9488',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, Agendar De Todas Formas',
        cancelButtonText: 'Revisar Fecha / Horario'
      });

      if (!confirmOverride.isConfirmed) return;
    }

    const apptData = {
      date: formDate,
      time: formTime,
      patientName: selectedPatientObj.name,
      specialistName: selectedSpecialistObj.name,
      consultory: formConsultory,
      procedureName: selectedProcedureObj.name,
      status: 'Confirmada',
      whatsappSent: 1
    };

    try {
      const created = await createAppointmentApi(apptData);
      setAppointments([created, ...(appointments || []).filter(a => a.id !== created.id)]);

      Swal.fire({
        title: '¡Cita Agendada Con Éxito!',
        html: `
          <div class="text-left text-xs space-y-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
            <p>👤 <strong>Paciente:</strong> ${created.patientName}</p>
            <p>🩺 <strong>Procedimiento:</strong> ${created.procedureName}</p>
            <p>👨‍⚕️ <strong>Especialista:</strong> ${created.specialistName}</p>
            <p>📅 <strong>Fecha & Hora:</strong> ${created.date} (${crossCheckAnalysis.dayName}) - ${created.time}</p>
            <p>🏢 <strong>Consultorio:</strong> ${created.consultory}</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#0d9488'
      });

      setShowNewModal(false);
    } catch (err) {
      Swal.fire('Error al Agendar', err.message || 'No se pudo registrar la cita en la base de datos.', 'error');
    }
  };

  // Eliminar Cita
  const handleDeleteAppointment = async (appt) => {
    const confirm = await Swal.fire({
      title: '¿Cancelar / Eliminar Cita?',
      text: `¿Estás seguro de eliminar la cita de "${appt.patientName}" agendada a las ${appt.time}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Eliminar Cita',
      cancelButtonText: 'Conservar Cita'
    });

    if (confirm.isConfirmed) {
      await deleteAppointmentApi(appt.id);
      setAppointments((appointments || []).filter(a => a.id !== appt.id));
      Swal.fire('Cita Eliminada', 'La cita fue cancelada exitosamente.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="text-teal-600 w-7 h-7" />
            Agenda de Citas & Ocupación de Consultorios
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Programación en tiempo real cruzando disponibilidad de Especialistas, Baremos y Consultorios.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md text-xs transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          + Agendar Nueva Cita
        </button>
      </div>

      {/* Filter Tabs por Consultorio */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-xs font-bold text-slate-600 mr-2">Filtrar por Consultorio:</span>
        {consultories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedConsultoryFilter(c)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              selectedConsultoryFilter === c
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid de Citas por Bloques Horarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeSlots.map(slot => {
          const slotApps = filteredAppointments.filter(a => a.time === slot);
          return (
            <div key={slot} className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-mono font-extrabold text-sm text-teal-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  {slot}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {slotApps.length} cita(s)
                </span>
              </div>

              {slotApps.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  Disponible para agendamiento
                </div>
              ) : (
                slotApps.map(app => (
                  <div key={app.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative group">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-slate-900 text-xs">{app.patientName}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {app.status || 'Confirmada'}
                        </span>
                        <button
                          onClick={() => handleDeleteAppointment(app)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                          title="Cancelar Cita"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div><strong className="text-slate-800">🩺 {app.procedureName}</strong></div>
                      <div>👨‍⚕️ {app.specialistName}</div>
                      <div className="font-mono text-[10px] text-teal-700 font-bold">🏢 {app.consultory}</div>
                      <div className="font-mono text-[10px] text-slate-500">📅 {app.date}</div>
                    </div>

                    <a
                      href={`https://wa.me/?text=Hola%20${encodeURIComponent(app.patientName)},%20le%20recordamos%20su%20cita%20de%20${encodeURIComponent(app.procedureName)}%20el%20día%20${encodeURIComponent(app.date)}%20a%20las%20${encodeURIComponent(app.time)}%20en%20Vida%20Sana%20CMO.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-extrabold text-[10px] flex items-center justify-center gap-1 transition-all shadow-sm"
                    >
                      <MessageSquare className="w-3 h-3" /> Recordar por WhatsApp
                    </a>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL INTELIGENTE DE AGENDAMIENTO CON CRUCE DE DISPONIBILIDAD EN TIEMPO REAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 w-full max-w-2xl p-6 rounded-3xl border border-slate-200 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-extrabold flex items-center gap-2 text-slate-900">
                <Calendar className="w-6 h-6 text-teal-600" />
                Agendamiento Inteligente de Cita Médica
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointmentSubmit} className="space-y-4 text-xs">
              
              {/* 1. SELECCIÓN DE PACIENTE DE LA BASE DE DATOS */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  1. Buscar & Seleccionar Paciente Creado
                </label>
                
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Filtrar por nombre o cédula..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    const match = patients.find(p => String(p.id) === e.target.value);
                    if (match) handleSelectPatient(match);
                    else setSelectedPatientId(e.target.value);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-extrabold text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {searchedPatients.length === 0 ? (
                    <option value="">No se encontraron pacientes</option>
                  ) : (
                    searchedPatients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.documentId || p.document_id || 'Sin Cédula'}) - Categ: {p.category || 'Privado'}
                      </option>
                    ))
                  )}
                </select>

                {selectedPatientObj && (selectedPatientObj.assignedSpecialist || selectedPatientObj.assigned_specialist) && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-[11px] font-bold">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Especialista Asignado al Paciente: <strong>{selectedPatientObj.assignedSpecialist || selectedPatientObj.assigned_specialist}</strong></span>
                  </div>
                )}
              </div>

              {/* 2. SELECCIÓN DEL SERVICIO / PROCEDIMIENTO DEL BAREMO */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-600" />
                  2. Servicio / Baremo Requerido
                </label>

                <select
                  value={selectedProcedureId}
                  onChange={(e) => setSelectedProcedureId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-extrabold text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {procedures.map(pr => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name} — Div: {pr.division || 'MEDICINA'} — Cat: {pr.category || 'General'} (${pr.price})
                    </option>
                  ))}
                </select>

                {selectedProcedureObj && (
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 font-medium">
                    <div className="flex justify-between">
                      <span>División / Categoría: <strong>{selectedProcedureObj.division} / {selectedProcedureObj.category}</strong></span>
                      <span className="font-mono font-black text-teal-700">${selectedProcedureObj.price} USD</span>
                    </div>
                    <div>
                      Días Atendidos: <strong className="text-slate-800">{(selectedProcedureObj.availableDays || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']).join(', ')}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. SELECCIÓN DE ESPECIALISTA */}
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  3. Especialista Médico Asignado
                </label>

                <select
                  value={selectedSpecialistId}
                  onChange={(e) => setSelectedSpecialistId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-extrabold text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {specialists.map(sp => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} — ({sp.specialty || 'Especialista'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. FECHA, HORA Y CONSULTORIO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-bold mb-1 text-slate-800">Fecha Cita</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-teal-700 font-extrabold block mt-1">Día: {crossCheckAnalysis.dayName}</span>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800">Hora Cita</label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-xs"
                  >
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800">Consultorio</label>
                  <select
                    value={formConsultory}
                    onChange={(e) => setFormConsultory(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-xs"
                  >
                    <option value="Consultorio 1 (Odontología)">Consultorio 1 (Odontología)</option>
                    <option value="Consultorio 2 (Ortodoncia)">Consultorio 2 (Ortodoncia)</option>
                    <option value="Consultorio 3 (Cirugía & Implantes)">Consultorio 3 (Cirugía & Implantes)</option>
                    <option value="Sala Ecografía / Rayos X">Sala Ecografía / Rayos X</option>
                  </select>
                </div>
              </div>

              {/* 5. BANNER DE CRUCE DE INFORMACIÓN Y DISPONIBILIDAD EN TIEMPO REAL */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                crossCheckAnalysis.isFullyAvailable
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center gap-2 font-extrabold text-xs">
                  {crossCheckAnalysis.isFullyAvailable ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>🟢 Disponibilidad Confirmada (Servicio + Especialista + Horario)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>⚠️ Advertencia de Incompatibilidad en Agenda</span>
                    </>
                  )}
                </div>

                {crossCheckAnalysis.okPoints.length > 0 && (
                  <ul className="text-[11px] font-medium space-y-1 list-disc pl-5 text-emerald-800">
                    {crossCheckAnalysis.okPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                  </ul>
                )}

                {crossCheckAnalysis.warnings.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-amber-200">
                    <p className="text-[11px] font-bold text-amber-900">Conflictos detectados:</p>
                    <ul className="text-[11px] font-bold text-rose-700 space-y-1 list-disc pl-5">
                      {crossCheckAnalysis.warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-all text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md transition-all text-xs active:scale-[0.98]"
                >
                  Confirmar y Guardar Cita
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
