import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Plus, Check } from 'lucide-react';

export default function ConsultoryRentModule({ consultoryRentals, setConsultoryRentals }) {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' | 'grid'

  const shifts = [
    { id: 'shift-1', time: 'Mañana (8am - 12pm)', chair1: 'Dr. Gabriel Torrealba', chair2: 'Dra. Patricia Lucena', status: 'Ocupado' },
    { id: 'shift-2', time: 'Tarde (1pm - 5pm)', chair1: 'Dr. Javier Villasmil', chair2: 'Disponible', status: 'Parcial' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="text-teal-700 w-7 h-7" />
            Módulo de Alquiler de Consultorios & Control de Turnos
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Gestión de turnos (Mañana 8am-12pm / Tarde 1pm-5pm) y mensualidades de odontólogos externos.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-300 px-4 py-2.5 rounded-xl text-right">
          <span className="text-xs font-bold text-emerald-900 block">Recaudación Alquileres:</span>
          <span className="text-xl font-extrabold font-mono text-emerald-950">
            ${consultoryRentals.reduce((acc, r) => acc + r.monthlyFee, 0).toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'plans' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          1. Odontólogos Inquilinos & Membresías
        </button>

        <button
          onClick={() => setActiveTab('grid')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'grid' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          2. Matriz Visual de Ocupación por Turno
        </button>
      </div>

      {/* TAB 1: PLANES & INQUILINOS */}
      {activeTab === 'plans' && (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Directorio de Médicos Inquilinos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">Médico Inquilino</th>
                  <th className="p-3">Especialidad</th>
                  <th className="p-3">Plan / Membresía Contratada</th>
                  <th className="p-3 text-center">Turnos Consumidos</th>
                  <th className="p-3 text-right">Canon Mensual ($)</th>
                  <th className="p-3 text-center">Estado Solo Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900">
                {consultoryRentals.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-extrabold text-slate-900 text-sm">{r.doctorName}</td>
                    <td className="p-3 font-semibold text-slate-700">{r.specialty}</td>
                    <td className="p-3 font-bold text-teal-800">{r.planType}</td>
                    <td className="p-3 text-center font-mono font-extrabold text-slate-900">{r.usedTurns} / {r.totalTurns}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${r.monthlyFee.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        r.paymentStatus.startsWith('Al Día')
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}>
                        {r.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ DE OCUPACION */}
      {activeTab === 'grid' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Matriz Visual de Ocupación Diaria de Consultorios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shifts.map(s => (
              <div key={s.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-mono font-extrabold text-sm text-teal-800">{s.time}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
                    {s.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-medium">
                  <div className="flex justify-between bg-white p-2.5 rounded border border-slate-200">
                    <span className="font-bold text-slate-800">Silla 1 (Odontología):</span>
                    <span className="font-extrabold text-teal-900">{s.chair1}</span>
                  </div>

                  <div className="flex justify-between bg-white p-2.5 rounded border border-slate-200">
                    <span className="font-bold text-slate-800">Silla 2 (Odontología/Ecografía):</span>
                    <span className="font-extrabold text-emerald-900">{s.chair2}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
