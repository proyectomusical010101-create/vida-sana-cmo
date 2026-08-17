import React, { useState } from 'react';
import { Globe, Link as LinkIcon, Check, Copy, Eye, EyeOff, Calendar, ShieldCheck, Clock, Phone, ExternalLink, Sparkles } from 'lucide-react';
import { CLINIC_INFO } from '../mockData';

export default function PublicPatientPortal({ procedures = [], specialists = [], onAddAppointment }) {
  const [publicUrl, setPublicUrl] = useState('https://vidasana-cmo.vercel.app/agendar');
  const [copied, setCopied] = useState(false);

  // Interruptores globales de Administrador
  const [showCatalogPublicly, setShowCatalogPublicly] = useState(true);
  const [showPricesPublicly, setShowPricesPublicly] = useState(true);

  // Formulario de agendamiento público demo (Vista Paciente)
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedProcId, setSelectedProcId] = useState(procedures[0]?.id || '');
  const [selectedDoctor, setSelectedDoctor] = useState(specialists[0]?.name || '');
  const [selectedDate, setSelectedDate] = useState('2026-08-10');
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublicAppointmentSubmit = (e) => {
    e.preventDefault();
    const proc = procedures.find(p => p.id === selectedProcId);
    const newAppt = {
      id: `APP-PUB-${Date.now().toString().slice(-4)}`,
      date: selectedDate,
      time: selectedTime,
      patientName,
      patientPhone,
      specialistName: selectedDoctor,
      procedureName: proc?.name || 'Consulta Médica',
      status: 'Confirmada (Público)',
      whatsappSent: 1
    };

    if (onAddAppointment) onAddAppointment(newAppt);
    setSubmittedSuccess(true);
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-12">

      {/* Header Banner - Generador de Enlace */}
      <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e2d5a] pb-4">
          <div>
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
              Enlace Público Oficial
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
              <Globe className="text-teal-600 w-7 h-7" />
              Portal de Agendamiento Web del Paciente
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Comparte este enlace en tus redes sociales (Instagram, WhatsApp, TikTok) para que tus pacientes agenden citas solos 24/7.
            </p>
          </div>

          {/* Generador de Enlace Público */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] p-2 rounded-xl">
            <LinkIcon className="w-4 h-4 text-teal-600 shrink-0 ml-1" />
            <input
              type="text"
              value={publicUrl}
              onChange={(e) => setPublicUrl(e.target.value)}
              className="bg-transparent font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none w-48 sm:w-56 truncate"
            />
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '¡Copiado!' : 'Copiar'}
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

      {/* VISTA PREVIA EN VIVO DE LA INTERFAZ DEL PACIENTE (DISEÑO CLARO Y ULTRA-PULIDO) */}
      <div className="bg-white dark:bg-[#111c3a] border-2 border-teal-500/40 shadow-xl rounded-2xl p-6 sm:p-8 space-y-6">

        {/* Cabecera de la Vista Previa */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1e2d5a]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20">
              VS
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">{CLINIC_INFO.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Portal Oficial de Agendamiento Online</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700 rounded-full text-xs font-black flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Vista Previa En Vivo del Paciente
          </span>
        </div>

        {submittedSuccess ? (
          <div className="p-8 bg-teal-50 dark:bg-teal-900/30 border border-teal-300 dark:border-teal-700 rounded-2xl text-center space-y-3">
            <Check className="w-12 h-12 text-teal-600 mx-auto" />
            <h4 className="text-xl font-black text-slate-900 dark:text-white">¡Cita Registrada Exitosamente!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto font-medium">
              Hemos agendado tu cita en el sistema de <strong>{CLINIC_INFO.name}</strong>. Recibirás un mensaje de confirmación por WhatsApp.
            </p>
            <button
              onClick={() => setSubmittedSuccess(false)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs mt-2 transition-all shadow-md"
            >
              Agendar Otra Cita
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* SECCION 1: CATALOGO DE SERVICIOS */}
            <div className="lg:col-span-6 space-y-3">
              <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
                Paso 1
              </span>
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                Seleccione el Tratamiento Médico u Odontológico
              </h4>

              {showCatalogPublicly ? (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {(procedures || []).map(p => {
                    const isSelected = selectedProcId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProcId(p.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-900/40 border-teal-500 text-slate-900 dark:text-white shadow-sm'
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
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-100 dark:bg-[#0d162f] rounded-xl text-xs text-slate-500 italic font-medium">
                  El catálogo público de precios ha sido ocultado por la administración.
                </div>
              )}
            </div>

            {/* SECCION 2: FORMULARIO DE AGENDAMIENTO */}
            <form onSubmit={handlePublicAppointmentSubmit} className="lg:col-span-6 space-y-3 bg-slate-50 dark:bg-[#0d162f] p-5 rounded-2xl border border-slate-200 dark:border-[#1e2d5a] text-xs font-bold">
              <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
                Paso 2
              </span>
              <h4 className="font-black text-sm text-slate-900 dark:text-white mb-2">
                Ingrese sus Datos y Seleccione el Horario
              </h4>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre Completo del Paciente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ana María Gutiérrez"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  placeholder="+58 412 1234567"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Especialista Tratante</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                >
                  {(specialists || []).map(sp => (
                    <option key={sp.id} value={sp.name}>{sp.name} ({sp.specialty})</option>
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
                    <option value="09:00 AM">09:00 AM (Mañana)</option>
                    <option value="10:30 AM">10:30 AM (Mañana)</option>
                    <option value="02:00 PM">02:00 PM (Tarde)</option>
                    <option value="03:30 PM">03:30 PM (Tarde)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md text-sm mt-3 transition-all flex items-center justify-center gap-2"
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
