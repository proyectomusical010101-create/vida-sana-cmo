import React, { useState } from 'react';
import { MessageSquare, Send, Bell, Cake, RefreshCcw, CheckCircle, Calendar, UserCheck } from 'lucide-react';

export default function WhatsAppNotificationsModule({ patients, extramuralLabOrders }) {
  const [activeTab, setActiveTab] = useState('birthday'); // 'birthday' | 'recurrence' | 'reminders'

  // Cumpleañeros del Día Mock / Escaneo BD
  const todayBirthdayPatients = patients.filter(p => {
    if (!p.birthDate) return false;
    const bMonth = p.birthDate.slice(5, 7);
    const todayMonth = new Date().toISOString().slice(5, 7);
    return bMonth === todayMonth;
  });

  // Alertas de Control Semestral (Fidelización por Recurrencia)
  const recurrenceAlerts = [
    { patientName: 'Ana Sofía Rodríguez', phone: '+584123456789', lastService: 'Profilaxis Dental Profunda', monthsAgo: 6, suggestedService: 'Control Odontológico Semestral' },
    { patientName: 'José Luis Márquez', phone: '+584149876543', lastService: 'Consulta Ginecología / Ecografía', monthsAgo: 6, suggestedService: 'Chequeo Preventivo Anual' },
    { patientName: 'Valeria Coromoto Diaz', phone: '+584241239876', lastService: 'Control Ortodoncia Mensual', monthsAgo: 1, suggestedService: 'Ajuste Brackets Mensual' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="text-teal-600 w-7 h-7" />
            Notificaciones Automáticas, Cumpleaños & Fidelización WhatsApp
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Fidelización de pacientes mediante mensajes programados de cumpleaños y campañas de seguimiento por recurrencia a 6 meses.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('birthday')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'birthday' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Cake className="w-4 h-4" />
          1. Felicitaciones de Cumpleaños ({todayBirthdayPatients.length})
        </button>

        <button
          onClick={() => setActiveTab('recurrence')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'recurrence' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <RefreshCcw className="w-4 h-4" />
          2. Campañas de Fidelización (Recurrencia 6 Meses)
        </button>
      </div>

      {/* TAB 1: CUMPLEAÑOS */}
      {activeTab === 'birthday' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
            <Cake className="w-5 h-5 text-amber-500" />
            Pacientes Cumpleañeros (Mensajes Automáticos Diarios)
          </h3>

          <div className="space-y-3">
            {todayBirthdayPatients.map(p => (
              <div key={p.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">{p.name} 🎉</div>
                  <div className="text-slate-600 font-mono">Teléfono: {p.phone} | Cédula: {p.documentId}</div>
                  <p className="text-[11px] text-teal-800 font-semibold mt-1">
                    "¡Feliz Cumpleaños de parte del equipo del Centro Médico Vida Sana CMO! Le deseamos salud y bienestar."
                  </p>
                </div>

                <a
                  href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`¡Hola ${p.name}! 🎉 De parte de todo el equipo de Centro Médico Vida Sana CMO, C.A., le deseamos un muy Feliz Cumpleaños y un año lleno de salud.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar Felicitación WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RECURRENCIA */}
      {activeTab === 'recurrence' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-teal-600" />
            Recordatorios de Control Periódico (Fidelización a 6 Meses)
          </h3>

          <div className="space-y-3">
            {recurrenceAlerts.map((rec, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">{rec.patientName}</div>
                  <div className="text-slate-600 font-medium">Último Tratamiento: <strong>{rec.lastService}</strong> ({rec.monthsAgo} meses transcurridos)</div>
                  <div className="text-[11px] text-teal-900 font-bold mt-0.5">Sugerencia: {rec.suggestedService}</div>
                </div>

                <a
                  href={`https://wa.me/${rec.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Estimado/a ${rec.patientName}, le saludamos de Centro Médico Vida Sana CMO. Ha transcurrido el tiempo sugerido para su ${rec.suggestedService}. ¿Desea agendar su cita esta semana?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Agendar Control por WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
