import React, { useState } from 'react';
import { Truck, CheckCircle2, Clock, DollarSign, Plus } from 'lucide-react';
import { updateLabOrderStatusApi } from '../api';

export default function ExtramuralLabModule({ extramuralLabOrders, setExtramuralLabOrders, patients, specialists }) {
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateLabOrderStatusApi(id, newStatus);
    } catch (err) {}

    const updated = extramuralLabOrders.map(o => {
      if (o.id === id) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    setExtramuralLabOrders(updated);
  };

  const totalLabCosts = extramuralLabOrders.reduce((acc, o) => acc + o.labCost, 0);
  const totalPatientPrice = extramuralLabOrders.reduce((acc, o) => acc + o.patientPrice, 0);
  const totalMargin = totalPatientPrice - totalLabCosts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Truck className="text-teal-700 w-7 h-7" />
            Módulo de Laboratorio Extramuros & Prótesis
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Trazabilidad de trabajos en laboratorios externos en 4 estados + margen neto financiero.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-300 px-4 py-2.5 rounded-xl text-right">
          <span className="text-xs font-bold text-emerald-900 block">Ganancia Neta Laboratorios:</span>
          <span className="text-xl font-extrabold font-mono text-emerald-950">${totalMargin.toFixed(2)} USD</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Total Facturado al Paciente:</span>
          <div className="text-xl font-extrabold font-mono text-slate-900">${totalPatientPrice.toFixed(2)}</div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Costo Cobrado por el Laboratorio:</span>
          <div className="text-xl font-extrabold font-mono text-rose-800">-${totalLabCosts.toFixed(2)}</div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Margen de Ganancia Porcentaje:</span>
          <div className="text-xl font-extrabold font-mono text-emerald-900">
            {((totalMargin / (totalPatientPrice || 1)) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Ordenes de Trabajo Extramuros Activas</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3">Orden ID</th>
                <th className="p-3">Paciente</th>
                <th className="p-3">Médico Tratante</th>
                <th className="p-3">Laboratorio Externo</th>
                <th className="p-3">Trabajo Solicitado</th>
                <th className="p-3 font-mono">Prometido</th>
                <th className="p-3 text-right">Costo Lab ($)</th>
                <th className="p-3 text-right">Precio Paciente ($)</th>
                <th className="p-3 text-center">Estado Trazabilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900">
              {extramuralLabOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-700">{o.id}</td>
                  <td className="p-3 font-extrabold text-slate-900">{o.patientName}</td>
                  <td className="p-3 text-slate-700 font-semibold">{o.specialistName}</td>
                  <td className="p-3 text-teal-800 font-bold">{o.externalLab}</td>
                  <td className="p-3 font-bold text-slate-800">{o.workType}</td>
                  <td className="p-3 font-mono text-slate-600">{o.promisedDate}</td>
                  <td className="p-3 text-right font-mono font-bold text-rose-800">${o.labCost.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${o.patientPrice.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                      className={`p-1.5 rounded-lg text-xs font-bold text-slate-900 ${
                        o.status === 'Instalado Paciente' ? 'bg-emerald-100 border border-emerald-300' :
                        o.status === 'Recibido en Clínica' ? 'bg-blue-100 border border-blue-300' :
                        'bg-amber-100 border border-amber-300'
                      }`}
                    >
                      <option value="En Proceso">En Proceso</option>
                      <option value="Recibido en Clínica">Recibido en Clínica</option>
                      <option value="Instalado Paciente">Instalado Paciente</option>
                      <option value="Ajuste / Prueba">Ajuste / Prueba</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
