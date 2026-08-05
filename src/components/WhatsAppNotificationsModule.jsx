import React, { useState } from 'react';
import { MessageSquare, Send, Copy, Check, ExternalLink } from 'lucide-react';

export default function WhatsAppNotificationsModule({ patients, extramuralLabOrders }) {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [templateType, setTemplateType] = useState('cita'); // 'cita' | 'laboratorio' | 'cashea'
  const [copied, setCopied] = useState(false);

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const getGeneratedMessage = () => {
    if (!currentPatient) return '';

    if (templateType === 'cita') {
      return `Hola ${currentPatient.name}, le saludamos cordialmente del Centro Médico Odontológico Vida Sana CMO, C.A. Le recordamos su cita programada para mañana a las 09:00 AM con su especialista asignado (${currentPatient.assignedSpecialist}). Por favor confirmar asistencia respondiendo este mensaje.`;
    }

    if (templateType === 'laboratorio') {
      return `Estimado(a) ${currentPatient.name}, le informamos que su trabajo de prótesis/laboratorio ya ha sido recibido en clínica por nuestro equipo. Puede comunicarse con nosotros para agendar la cita de instalación. Centro Médico Vida Sana.`;
    }

    return `Hola ${currentPatient.name}, su cuota de financiamiento Cashea para el tratamiento odontológico se encuentra al día. Agradecemos su preferencia por el Centro Médico Odontológico Vida Sana CMO, C.A.`;
  };

  const generatedMessage = getGeneratedMessage();

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = currentPatient ? currentPatient.phone.replace(/[^0-9]/g, '') : '';
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedMessage)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="text-emerald-700 w-7 h-7" />
            Módulo de Notificaciones Directas WhatsApp
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Generador dinámico de plantillas de mensajería directa sin intermediarios mediante api wa.me.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Configuration */}
        <div className="lg:col-span-6 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">Parámetros del Mensaje</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1">Seleccionar Paciente Destinatario</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Tipo de Notificación</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
              >
                <option value="cita">Recordatorio de Cita Médica / Consulta</option>
                <option value="laboratorio">Prótesis Recibida de Laboratorio Extramuros</option>
                <option value="cashea">Notificación Cuota / Financiamiento Cashea</option>
              </select>
            </div>

            {currentPatient && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-600 font-bold">Número de Teléfono Destino:</span>
                <div className="font-mono text-slate-900 font-bold text-sm">{currentPatient.phone}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Message Preview */}
        <div className="lg:col-span-6 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">Vista Previa Mensaje WhatsApp</h3>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-xs font-medium text-emerald-950 leading-relaxed shadow-sm">
            {generatedMessage}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-300 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4 text-slate-700" />}
              {copied ? '¡Copiado al Portapapeles!' : 'Copiar Texto'}
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Send className="w-4 h-4" />
              Enviar por WhatsApp Directo
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
