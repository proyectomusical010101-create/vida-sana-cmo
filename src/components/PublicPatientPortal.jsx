import React, { useState } from 'react';
import { Globe, Link as LinkIcon, Check, Copy, Eye, EyeOff, Calendar, ShieldCheck, Clock, Phone, MapPin } from 'lucide-react';
import { CLINIC_INFO } from '../mockData';

export default function PublicPatientPortal({ procedures, specialists, onAddAppointment }) {
  const [publicUrl, setPublicUrl] = useState('https://vidasana.com/agendar/cmo');
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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="text-teal-600 w-7 h-7" />
            Portal del Paciente & Agendamiento Público (Tipo Calendly)
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Permite a tus pacientes agendar citas en línea desde cualquier smartphone seleccionando servicios y turnos libres.
          </p>
        </div>

        {/* Generador de Enlace Público */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 p-2 rounded-xl">
          <LinkIcon className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          <input
            type="text"
            value={publicUrl}
            onChange={(e) => setPublicUrl(e.target.value)}
            className="bg-transparent font-mono text-xs font-bold text-slate-900 focus:outline-none w-56 truncate"
          />
          <button
            onClick={handleCopyUrl}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '¡Copiado!' : 'Copiar Enlace'}
          </button>
        </div>
      </div>

      {/* Controles Globales del Administrador */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          Controles Globales de Visibilidad del Administrador
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-extrabold text-xs text-slate-900">Visibilidad del Catálogo Público</div>
              <div className="text-[11px] text-slate-600 font-medium">Muestra el listado de servicios en el enlace público.</div>
            </div>
            <button
              onClick={() => setShowCatalogPublicly(!showCatalogPublicly)}
              className={`p-2 rounded-xl transition-all ${
                showCatalogPublicly ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {showCatalogPublicly ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-extrabold text-xs text-slate-900">Visibilidad de Precios Públicos</div>
              <div className="text-[11px] text-slate-600 font-medium">Muestra las tarifas oficiales ($ USD) al paciente.</div>
            </div>
            <button
              onClick={() => setShowPricesPublicly(!showPricesPublicly)}
              className={`p-2 rounded-xl transition-all ${
                showPricesPublicly ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {showPricesPublicly ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Vista Previa en Vivo de la Interfaz del Paciente */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-extrabold text-lg">
              VS
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white leading-tight">{CLINIC_INFO.name}</h3>
              <p className="text-xs text-slate-400">Portal Web Oficial de Agendamiento de Citas</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-xs font-bold">
            Vista Previa Paciente
          </span>
        </div>

        {submittedSuccess ? (
          <div className="p-8 bg-teal-950/80 border border-teal-500/40 rounded-2xl text-center space-y-3">
            <Check className="w-12 h-12 text-teal-400 mx-auto" />
            <h4 className="text-xl font-extrabold text-white">¡Cita Agendada con Éxito!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Hemos registrado su cita en el sistema de **{CLINIC_INFO.name}**. Recibirá una confirmación por WhatsApp en unos momentos.
            </p>
            <button
              onClick={() => setSubmittedSuccess(false)}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs mt-2"
            >
              Agendar Otra Cita
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lado Izquierdo: Catálogo de Servicios */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="font-extrabold text-sm text-teal-400 uppercase tracking-wider">
                1. Seleccione el Servicio Médico u Odontológico
              </h4>

              {showCatalogPublicly ? (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {procedures.map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProcId(p.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedProcId === p.id
                          ? 'bg-teal-600/30 border-teal-400 text-white'
                          : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-xs">{p.name}</div>
                        <div className="text-[11px] text-slate-400">{p.category || 'Consulta'}</div>
                      </div>
                      {showPricesPublicly && (
                        <div className="font-mono font-extrabold text-teal-300 text-sm">
                          ${(p.price||0).toFixed(2)} USD
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-800 rounded-xl text-xs text-slate-400 italic">
                  El administrador ha ocultado la vista pública del catálogo completo.
                </div>
              )}
            </div>

            {/* Lado Derecho: Formulario de Cita */}
            <form onSubmit={handlePublicAppointmentSubmit} className="lg:col-span-6 space-y-3 bg-slate-800/60 p-5 rounded-2xl border border-slate-700 text-xs">
              <h4 className="font-extrabold text-sm text-teal-400 uppercase tracking-wider mb-2">
                2. Complete sus Datos y Horario Deseado
              </h4>

              <div>
                <label className="block font-bold mb-1 text-slate-300">Nombre Completo del Paciente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ana María Gutiérrez"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-300">Teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  required
                  placeholder="+58 412 1234567"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-300">Especialista Tratante</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-teal-400"
                >
                  {specialists.map(sp => (
                    <option key={sp.id} value={sp.name}>{sp.name} ({sp.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-300">Fecha Deseada</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-300">Hora / Turno</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-teal-400"
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
                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold rounded-xl shadow-lg text-sm mt-3 transition-all"
              >
                Confirmar & Reservar Mi Cita Ahora
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
