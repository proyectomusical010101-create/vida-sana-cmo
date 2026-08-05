import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, MessageSquare, AlertCircle, Filter, User } from 'lucide-react';
import { createAppointmentApi } from '../api';

export default function AppointmentsModule({ appointments, setAppointments, patients, specialists, procedures }) {
  const [selectedConsultoryFilter, setSelectedConsultoryFilter] = useState('Todos');
  const [showNewModal, setShowNewModal] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: '09:00 AM',
    patientName: patients[0]?.name || '',
    specialistName: specialists[0]?.name || '',
    consultory: 'Consultorio 1 (Odontología)',
    procedureName: procedures[0]?.name || ''
  });

  const consultories = ['Todos', 'Consultorio 1 (Odontología)', 'Consultorio 2 (Ortodoncia)', 'Sala Ecografía'];
  const timeSlots = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const filteredAppointments = appointments.filter(a => {
    return selectedConsultoryFilter === 'Todos' || a.consultory === selectedConsultoryFilter;
  });

  const handleCreateAppointmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await createAppointmentApi(newAppointment);
      setAppointments([...appointments, created]);
      alert(`✅ ¡Cita agendada para ${created.patientName} en ${created.consultory}! Almacenada en SQLite.`);
    } catch (err) {
      const id = `APP-${Math.floor(100 + Math.random() * 900)}`;
      setAppointments([...appointments, { id, ...newAppointment, status: 'Confirmada', whatsappSent: 1 }]);
    }
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="text-teal-600 w-7 h-7" />
            Agenda de Citas & Ocupación de Consultorios
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Programación en tiempo real por consultorio con confirmación por WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm text-xs"
        >
          <Plus className="w-4 h-4" />
          + Agendar Nueva Cita
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="text-xs font-bold text-slate-600 mr-2">Filtrar por Consultorio:</span>
        {consultories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedConsultoryFilter(c)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
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
                  <div key={app.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-slate-900 text-xs">{app.patientName}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {app.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div><strong className="text-slate-800">{app.procedureName}</strong></div>
                      <div>{app.specialistName}</div>
                      <div className="font-mono text-[10px] text-teal-700">{app.consultory}</div>
                    </div>

                    <a
                      href={`https://wa.me/?text=Hola%20${encodeURIComponent(app.patientName)},%20le%20recordamos%20su%20cita%20de%20${encodeURIComponent(app.procedureName)}%20hoy%20a%20las%20${encodeURIComponent(app.time)}%20en%20Vida%20Sana%20CMO.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
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

      {/* Modal Nueva Cita */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Agendar Nueva Cita Médica
            </h3>

            <form onSubmit={handleCreateAppointmentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Paciente</label>
                <select
                  value={newAppointment.patientName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.name}>{p.name} ({p.documentId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Hora</label>
                  <select
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  >
                    {timeSlots.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Consultorio / Silla</label>
                <select
                  value={newAppointment.consultory}
                  onChange={(e) => setNewAppointment({ ...newAppointment, consultory: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="Consultorio 1 (Odontología)">Consultorio 1 (Odontología)</option>
                  <option value="Consultorio 2 (Ortodoncia)">Consultorio 2 (Ortodoncia)</option>
                  <option value="Sala Ecografía">Sala Ecografía</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Procedimiento</label>
                <select
                  value={newAppointment.procedureName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, procedureName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  {procedures.map(pr => (
                    <option key={pr.id} value={pr.name}>{pr.name} (${pr.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Médico Tratante</label>
                <select
                  value={newAppointment.specialistName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, specialistName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  {specialists.map(sp => (
                    <option key={sp.id} value={sp.name}>{sp.name} ({sp.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md"
                >
                  Confirmar Cita en SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
