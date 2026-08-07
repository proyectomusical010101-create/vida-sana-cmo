import React, { useState } from 'react';
import { Calendar, Clock, UserCheck, RefreshCw, AlertCircle, Check, Shield, FileText, UserPlus, DollarSign } from 'lucide-react';

export default function ScheduleCoverageModule({ specialists }) {
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Asignación de Horarios Predeterminados (Titulares)
  const [schedules, setSchedules] = useState([
    { doctorId: 'DOC-01', doctorName: 'Dr. Carlos Mendoza', day: 'Lunes', shift: 'Mañana', consultory: 'Consultorio 1 (Odontología)' },
    { doctorId: 'DOC-01', doctorName: 'Dr. Carlos Mendoza', day: 'Miércoles', shift: 'Tarde', consultory: 'Consultorio 1 (Odontología)' },
    { doctorId: 'DOC-02', doctorName: 'Dra. Elena Rostova', day: 'Martes', shift: 'Mañana', consultory: 'Consultorio 2 (Ortodoncia)' },
    { doctorId: 'DOC-02', doctorName: 'Dra. Elena Rostova', day: 'Jueves', shift: 'Tarde', consultory: 'Consultorio 2 (Ortodoncia)' },
    { doctorId: 'DOC-03', doctorName: 'Dr. Roberto Gómez', day: 'Viernes', shift: 'Mañana', consultory: 'Consultorio 3 (Cirugía)' },
    { doctorId: 'DOC-04', doctorName: 'Dra. María Patricia Silva', day: 'Viernes', shift: 'Tarde', consultory: 'Consultorio 4 (Ecografía)' },
  ]);

  // Médicos Sustitutos / Reemplazos Específicos
  const [substitutions, setSubstitutions] = useState([
    {
      id: 'SUB-101',
      date: '2026-08-07',
      day: 'Viernes',
      shift: 'Mañana',
      originalDoctorName: 'Dr. Roberto Gómez',
      substituteDoctorName: 'Dr. Fernando Salazar (Sustituto)',
      specialty: 'Cirugía Maxilofacial',
      splitPercent: 45, // % ganancia médico sustituto
      usedClinicMaterials: true // Insumos clínica vs propios $0
    }
  ]);

  // Modal Crear Reemplazo
  const [showSubModal, setShowSubModal] = useState(false);
  const [subDate, setSubDate] = useState('2026-08-08');
  const [subDay, setSubDay] = useState('Sábado');
  const [subShift, setSubShift] = useState('Mañana');
  const [subOriginalDoc, setSubOriginalDoc] = useState(specialists[0]?.name || 'Dr. Carlos Mendoza');
  const [subDocName, setSubDocName] = useState('');
  const [subSplit, setSubSplit] = useState('45');
  const [subUsedMaterials, setSubUsedMaterials] = useState(true);

  const handleAddSubstitutionSubmit = (e) => {
    e.preventDefault();
    if (!subDocName.trim()) {
      alert('⚠️ Ingrese el nombre del Médico Sustituto.');
      return;
    }

    const newSub = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      date: subDate,
      day: subDay,
      shift: subShift,
      originalDoctorName: subOriginalDoc,
      substituteDoctorName: subDocName,
      specialty: 'Reemplazo Contingencia',
      splitPercent: parseFloat(subSplit) || 45,
      usedClinicMaterials: subUsedMaterials
    };

    setSubstitutions([newSub, ...substitutions]);
    setShowSubModal(false);
    setSubDocName('');
    alert('✅ ¡Médico Sustituto asignado con éxito para la contingencia!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="text-teal-600 w-7 h-7" />
            Matriz Visual de Disponibilidad & Médicos Sustitutos
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Diagrama Gantt de horarios por médico y módulo de contingencias para reasignación de reemplazos.
          </p>
        </div>

        <button
          onClick={() => setShowSubModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          + Asignar Médico Sustituto
        </button>
      </div>

      {/* Diagrama de Gantt / Matriz Semanal de Disponibilidad */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          Matriz Semanal de Cobertura Médica (Mañana / Tarde)
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3 border-r border-slate-300">Turno / Horario</th>
                {daysOfWeek.map(day => (
                  <th key={day} className="p-3 border-r border-slate-300 text-center min-w-[140px]">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* TURNO MAÑANA */}
              <tr>
                <td className="p-3 bg-slate-50 font-extrabold text-slate-900 border-r border-slate-200">
                  <div className="text-sm">Turno Mañana</div>
                  <div className="text-[10px] font-mono text-slate-500">08:00 AM - 12:00 PM</div>
                </td>
                {daysOfWeek.map(day => {
                  const slots = schedules.filter(s => s.day === day && s.shift === 'Mañana');
                  const subSlot = substitutions.find(s => s.day === day && s.shift === 'Mañana');
                  return (
                    <td key={day} className="p-2 border-r border-slate-200 align-top">
                      {subSlot ? (
                        <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 font-bold space-y-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-200 text-amber-900 font-extrabold block w-max">
                            REEMPLAZO SUSTITUTO
                          </span>
                          <div className="font-extrabold text-xs">{subSlot.substituteDoctorName}</div>
                          <div className="text-[10px] text-slate-600">Reemplaza a: {subSlot.originalDoctorName}</div>
                          <div className="text-[10px] font-mono text-amber-900">Split: {subSlot.splitPercent}% | Insumos: {subSlot.usedClinicMaterials ? 'Clínica' : 'Propios ($0)'}</div>
                        </div>
                      ) : slots.length > 0 ? (
                        slots.map(s => (
                          <div key={s.doctorId + s.day} className="p-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-950 font-bold space-y-0.5 mb-1">
                            <div className="font-extrabold text-xs">{s.doctorName}</div>
                            <div className="text-[10px] text-teal-800">{s.consultory}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-center text-slate-400 font-medium italic text-[11px]">Disponible</div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* TURNO TARDE */}
              <tr>
                <td className="p-3 bg-slate-50 font-extrabold text-slate-900 border-r border-slate-200">
                  <div className="text-sm">Turno Tarde</div>
                  <div className="text-[10px] font-mono text-slate-500">01:00 PM - 05:00 PM</div>
                </td>
                {daysOfWeek.map(day => {
                  const slots = schedules.filter(s => s.day === day && s.shift === 'Tarde');
                  const subSlot = substitutions.find(s => s.day === day && s.shift === 'Tarde');
                  return (
                    <td key={day} className="p-2 border-r border-slate-200 align-top">
                      {subSlot ? (
                        <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-950 font-bold space-y-1">
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-200 text-amber-900 font-extrabold block w-max">
                            REEMPLAZO SUSTITUTO
                          </span>
                          <div className="font-extrabold text-xs">{subSlot.substituteDoctorName}</div>
                          <div className="text-[10px] text-slate-600">Reemplaza a: {subSlot.originalDoctorName}</div>
                          <div className="text-[10px] font-mono text-amber-900">Split: {subSlot.splitPercent}% | Insumos: {subSlot.usedClinicMaterials ? 'Clínica' : 'Propios ($0)'}</div>
                        </div>
                      ) : slots.length > 0 ? (
                        slots.map(s => (
                          <div key={s.doctorId + s.day} className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 font-bold space-y-0.5 mb-1">
                            <div className="font-extrabold text-xs">{s.doctorName}</div>
                            <div className="text-[10px] text-blue-800">{s.consultory}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-center text-slate-400 font-medium italic text-[11px]">Disponible</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de Médicos Sustitutos & Reemplazos */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">
          Registro de Médicos Sustitutos (Contingencias Activas)
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3">ID Reemplazo</th>
                <th className="p-3">Fecha / Día</th>
                <th className="p-3">Turno</th>
                <th className="p-3">Médico Titular</th>
                <th className="p-3">Médico Sustituto</th>
                <th className="p-3 text-right">Split Ganancia (%)</th>
                <th className="p-3 text-center">Insumos Utilizados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-900">
              {substitutions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-700">{sub.id}</td>
                  <td className="p-3 font-mono">{sub.date} ({sub.day})</td>
                  <td className="p-3 font-bold text-slate-800">{sub.shift}</td>
                  <td className="p-3 text-slate-600">{sub.originalDoctorName}</td>
                  <td className="p-3 font-extrabold text-amber-900">{sub.substituteDoctorName}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-teal-800">{sub.splitPercent}%</td>
                  <td className="p-3 text-center">
                    {sub.usedClinicMaterials ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                        De la Clínica
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Materiales Propios ($0)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Asignar Médico Sustituto */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">
              Asignar Médico Sustituto (Reemplazo Especifico)
            </h3>

            <form onSubmit={handleAddSubstitutionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Médico Titular a Reemplazar</label>
                <select
                  value={subOriginalDoc}
                  onChange={(e) => setSubOriginalDoc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                >
                  {specialists.map(sp => (
                    <option key={sp.id} value={sp.name}>{sp.name} ({sp.specialty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Nombre Completo del Médico Sustituto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Dr. Fernando Salazar"
                  value={subDocName}
                  onChange={(e) => setSubDocName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={subDate}
                    onChange={(e) => setSubDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Día</label>
                  <select
                    value={subDay}
                    onChange={(e) => setSubDay(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Turno</label>
                  <select
                    value={subShift}
                    onChange={(e) => setSubShift(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">% Split Ganancia Sustituto</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={subSplit}
                    onChange={(e) => setSubSplit(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Insumos Utilizados</label>
                  <select
                    value={subUsedMaterials ? 'CLINICA' : 'PROPIOS'}
                    onChange={(e) => setSubUsedMaterials(e.target.value === 'CLINICA')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    <option value="CLINICA">De la Clínica</option>
                    <option value="PROPIOS">Materiales Propios ($0)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg shadow-sm"
                >
                  Confirmar Reemplazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
