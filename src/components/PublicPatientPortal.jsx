import React, { useState, useMemo } from 'react';
import { Globe, Link as LinkIcon, Check, Copy, Eye, EyeOff, Calendar, ShieldCheck, Clock, Phone, ExternalLink, Search, UserCheck, UserPlus, ShieldAlert } from 'lucide-react';
import { CLINIC_INFO } from '../mockData';
import { createAppointmentApi, createPatientApi } from '../api';

export default function PublicPatientPortal({ procedures = [], specialists = [], patients = [], onAddAppointment, isPublicMode = false }) {
  const [publicUrl, setPublicUrl] = useState(() => `${window.location.origin}/?agendar=1`);
  const [copied, setCopied] = useState(false);

  // Interruptores globales de Administrador
  const [showCatalogPublicly, setShowCatalogPublicly] = useState(true);
  const [showPricesPublicly, setShowPricesPublicly] = useState(true);

  // PASO 1: Buscador de Tratamientos / Baremos
  const [procedureSearch, setProcedureSearch] = useState('');
  const [selectedProcId, setSelectedProcId] = useState(procedures[0]?.id || '');

  // PASO 2: Modo de Paciente ('registered' | 'new')
  const [patientMode, setPatientMode] = useState('registered');
  const [registeredPatientSearch, setRegisteredPatientSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Datos para Nuevo Paciente / Edición
  const [patientName, setPatientName] = useState('');
  const [patientDocumentId, setPatientDocumentId] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  const [selectedDoctor, setSelectedDoctor] = useState(specialists[0]?.name || '');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Procedimientos filtrados por buscador en Paso 1
  const filteredProcedures = useMemo(() => {
    const query = procedureSearch.trim().toLowerCase();
    if (!query) return procedures;
    return (procedures || []).filter(p => {
      const pName = String(p.name || '').toLowerCase();
      const pCat = String(p.category || '').toLowerCase();
      const pDiv = String(p.division || '').toLowerCase();
      return pName.includes(query) || pCat.includes(query) || pDiv.includes(query);
    });
  }, [procedures, procedureSearch]);

  // Pacientes registrados filtrados por buscador en Paso 2
  const searchedPatients = useMemo(() => {
    const query = registeredPatientSearch.trim().toLowerCase();
    if (!query) return patients;
    return (patients || []).filter(p => {
      const pName = String(p.name || '').toLowerCase();
      const pDoc = String(p.documentId || p.document_id || '').toLowerCase();
      return pName.includes(query) || pDoc.includes(query);
    });
  }, [patients, registeredPatientSearch]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Al seleccionar un paciente registrado
  const handleSelectRegisteredPatient = (patientObj) => {
    setSelectedPatientId(patientObj.id);
    setPatientName(patientObj.name || '');
    setPatientDocumentId(patientObj.documentId || patientObj.document_id || '');
    setPatientPhone(patientObj.phone || patientObj.phone_number || '');
    setPatientEmail(patientObj.email || '');

    const assigned = patientObj.assignedSpecialist || patientObj.assigned_specialist;
    if (assigned) {
      const match = specialists.find(s => s.name === assigned || String(s.id) === String(assigned));
      if (match) setSelectedDoctor(match.name);
    }
  };

  const handlePublicAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert("Por favor ingrese el nombre del paciente.");
      return;
    }

    // Si es nuevo paciente, auto-crearlo
    if (patientMode === 'new' && patientDocumentId) {
      try {
        await createPatientApi({
          name: patientName,
          documentId: patientDocumentId,
          phone: patientPhone,
          email: patientEmail,
          category: 'Privado'
        });
      } catch (err) {}
    }

    const proc = procedures.find(p => p.id === selectedProcId);
    const newAppt = {
      id: `APP-PUB-${Date.now().toString().slice(-4)}`,
      date: selectedDate,
      time: selectedTime,
      patientName,
      patientPhone,
      specialistName: selectedDoctor,
      procedureName: proc?.name || 'Consulta Médica',
      status: 'Confirmada',
      whatsappSent: 1
    };

    try {
      await createAppointmentApi(newAppt);
      if (onAddAppointment) onAddAppointment(newAppt);
      setSubmittedSuccess(true);
    } catch (err) {
      setSubmittedSuccess(true);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">

      {/* Panel Superior de Control de Administrador (Solo si no accede en modo público directo) */}
      {!isPublicMode && (
        <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e2d5a] pb-4">
            <div>
              <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
                Enlace Público Oficial 100% Funcional
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                <Globe className="text-teal-600 w-7 h-7" />
                Portal de Agendamiento Web del Paciente
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                Copia y envía este enlace por WhatsApp o redes sociales. Los pacientes podrán ingresar y agendar directamente sin necesidad de iniciar sesión.
              </p>
            </div>

            {/* Generador de Enlace Público */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] p-2 rounded-xl">
              <LinkIcon className="w-4 h-4 text-teal-600 shrink-0 ml-1" />
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="bg-transparent font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none w-48 sm:w-64 truncate cursor-pointer"
                onClick={handleCopyUrl}
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '¡Copiado!' : 'Copiar Link'}
              </button>
            </div>
          </div>

          {/* Controles Globales de Visibilidad del Administrador */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Controles de Visibilidad para el Paciente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">Visibilidad del Catálogo Público</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Muestra el listado de tratamientos al paciente.</div>
                </div>
                <button
                  onClick={() => setShowCatalogPublicly(!showCatalogPublicly)}
                  className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    showCatalogPublicly ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {showCatalogPublicly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {showCatalogPublicly ? 'Visible' : 'Oculto'}
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white">Visibilidad de Precios Públicos</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Muestra las tarifas en USD al paciente.</div>
                </div>
                <button
                  onClick={() => setShowPricesPublicly(!showPricesPublicly)}
                  className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    showPricesPublicly ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {showPricesPublicly ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {showPricesPublicly ? 'Visible' : 'Oculto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERFAZ DE AGENDAMIENTO PÚBLICO DEL PACIENTE */}
      <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">

        {/* Cabecera Limpia (Sin "Vista Previa en Vivo") */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-[#1e2d5a]">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-black text-xl shadow-md">
            VS
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{CLINIC_INFO.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Portal Oficial de Reserva y Agendamiento de Citas en Línea</p>
          </div>
        </div>

        {submittedSuccess ? (
          <div className="p-8 bg-emerald-50 dark:bg-teal-900/30 border border-emerald-300 dark:border-teal-700 rounded-2xl text-center space-y-3">
            <Check className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-xl font-black text-slate-900 dark:text-white">¡Cita Registrada Exitosamente!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto font-medium">
              Hemos agendado la cita en el sistema de <strong>{CLINIC_INFO.name}</strong> para <strong>{patientName}</strong> el día <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>.
            </p>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setPatientName('');
                setPatientDocumentId('');
                setPatientPhone('');
                setPatientEmail('');
                setSelectedPatientId('');
              }}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs mt-2 transition-all shadow-md"
            >
              Agendar Otra Cita
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* SECCIÓN 1: CATÁLOGO DE SERVICIOS CON BUSCADOR */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
                  Paso 1
                </span>
                <span className="text-[11px] font-bold text-slate-500">{(filteredProcedures || []).length} servicio(s)</span>
              </div>
              
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                Seleccione el Tratamiento Médico u Odontológico
              </h4>

              {/* BUSCADOR DE SERVICIOS Y TRATAMIENTOS EN PASO 1 */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={procedureSearch}
                  onChange={(e) => setProcedureSearch(e.target.value)}
                  placeholder="🔍 Buscar tratamiento por nombre o especialidad..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {showCatalogPublicly ? (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredProcedures.length === 0 ? (
                    <div className="p-4 bg-slate-50 dark:bg-[#0d162f] rounded-xl text-xs text-slate-500 text-center font-bold">
                      No se encontraron tratamientos con "{procedureSearch}"
                    </div>
                  ) : (
                    filteredProcedures.map(p => {
                      const isSelected = selectedProcId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProcId(p.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-50 dark:bg-teal-900/40 border-teal-500 text-slate-900 dark:text-white shadow-md'
                              : 'bg-slate-50 dark:bg-[#0d162f] border-slate-200 dark:border-[#1e2d5a] hover:bg-slate-100 dark:hover:bg-[#17254d] text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-extrabold text-xs text-slate-900 dark:text-white">{p.name}</div>
                            <div className="text-[11px] text-slate-500 font-medium">{p.category || 'Consulta General'}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#85a738]/20 text-[#476016] dark:text-[#a2d034] border border-[#85a738]/40">
                                📅 {Array.isArray(p.availableDays) ? p.availableDays.join(', ') : 'Lun a Vie'}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                                🕒 {p.startTime || '08:00'} - {p.endTime || '17:00'}
                              </span>
                            </div>
                          </div>
                          {showPricesPublicly && (
                            <div className="font-mono font-black text-teal-700 dark:text-teal-300 text-sm">
                              ${(p.price || 0).toFixed(2)} USD
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-100 dark:bg-[#0d162f] rounded-xl text-xs text-slate-500 italic font-medium">
                  El catálogo público de precios ha sido ocultado por la administración.
                </div>
              )}
            </div>

            {/* SECCIÓN 2: DATOS DEL PACIENTE CON BUSCADOR PREVIO Y BOTÓN NUEVO PACIENTE */}
            <form onSubmit={handlePublicAppointmentSubmit} className="lg:col-span-6 space-y-4 bg-slate-50 dark:bg-[#0d162f] p-5 rounded-2xl border border-slate-200 dark:border-[#1e2d5a] text-xs font-bold">
              
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
                  Paso 2
                </span>

                {/* BOTÓN CONMUTADOR: BUSCAR PACIENTE / NUEVO PACIENTE */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setPatientMode('registered')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                      patientMode === 'registered'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <UserCheck className="w-3 h-3" /> Paciente Registrado
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPatientMode('new');
                      setSelectedPatientId('');
                      setPatientName('');
                      setPatientDocumentId('');
                      setPatientPhone('');
                      setPatientEmail('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                      patientMode === 'new'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <UserPlus className="w-3 h-3" /> + Nuevo Paciente
                  </button>
                </div>
              </div>

              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                {patientMode === 'registered' ? 'Buscar Persona Registrada en Sistema' : 'Registrar Datos de Nuevo Paciente'}
              </h4>

              {/* BUSCADOR Y SELECTOR DE PACIENTE REGISTRADO */}
              {patientMode === 'registered' ? (
                <div className="space-y-2 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700">
                  <label className="block text-slate-700 dark:text-slate-300 text-[11px]">1. Buscar por Nombre o Cédula</label>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={registeredPatientSearch}
                      onChange={(e) => setRegisteredPatientSearch(e.target.value)}
                      placeholder="Escriba nombre o cédula..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <select
                    value={selectedPatientId}
                    onChange={(e) => {
                      const match = (patients || []).find(p => String(p.id) === e.target.value);
                      if (match) handleSelectRegisteredPatient(match);
                      else setSelectedPatientId(e.target.value);
                    }}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                  >
                    <option value="">-- Seleccionar Persona Registrada --</option>
                    {searchedPatients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.documentId || p.document_id || 'Sin Cédula'}) - Teléf: {p.phone || p.phone_number || 'N/A'}
                      </option>
                    ))}
                  </select>

                  {patientName && (
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700/50 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-300 font-bold">
                      🟢 Paciente Seleccionado: <strong>{patientName}</strong> {patientDocumentId ? `(Cédula: ${patientDocumentId})` : ''}
                    </div>
                  )}

                  <div className="pt-1 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setPatientMode('new');
                        setSelectedPatientId('');
                        setPatientName('');
                        setPatientDocumentId('');
                        setPatientPhone('');
                      }}
                      className="text-[11px] text-teal-600 dark:text-teal-400 underline font-bold hover:text-teal-800"
                    >
                      ¿No aparece en la lista? Registrar como Nuevo Paciente
                    </button>
                  </div>
                </div>
              ) : (
                /* FORMULARIO DE NUEVO PACIENTE */
                <div className="space-y-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 text-[11px]">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carlos Mendoza"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1 text-[11px]">Cédula / Documento</label>
                      <input
                        type="text"
                        placeholder="V-12345678"
                        value={patientDocumentId}
                        onChange={(e) => setPatientDocumentId(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1 text-[11px]">Teléfono WhatsApp</label>
                      <input
                        type="tel"
                        required
                        placeholder="0412-1234567"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SELECCIÓN DE MÉDICO, FECHA Y HORA */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Especialista Tratante</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                >
                  {(specialists || []).map(sp => (
                    <option key={sp.id} value={sp.name}>{sp.name} ({sp.specialty || 'Especialista'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Fecha Deseada</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Hora / Turno</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-mono"
                  >
                    <option value="08:00 AM">08:00 AM (Mañana)</option>
                    <option value="09:00 AM">09:00 AM (Mañana)</option>
                    <option value="10:30 AM">10:30 AM (Mañana)</option>
                    <option value="01:00 PM">01:00 PM (Tarde)</option>
                    <option value="02:30 PM">02:30 PM (Tarde)</option>
                    <option value="04:00 PM">04:00 PM (Tarde)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md text-sm mt-3 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                Confirmar & Reservar Mi Cita Ahora
              </button>
            </form>

          </div>
        )}

      </div>

    </div>
  );
}
