import React, { useState } from 'react';
import { FileCheck, DollarSign, ShieldCheck, Printer, Percent, Calculator, UserCheck, Calendar } from 'lucide-react';

export default function SpecialistSettlementModule({ specialists, transactions }) {
  const [selectedDoctorName, setSelectedDoctorName] = useState(specialists[0]?.name || '');
  const [retencionFiscalPercent, setRetencionFiscalPercent] = useState(1.0); // Retención del 1% en pagos Bs

  const selectedDoctorObj = specialists.find(s => s.name === selectedDoctorName) || specialists[0];
  const doctorTransactions = transactions.filter(t => t.doctor === selectedDoctorName);

  const totalGross = doctorTransactions.reduce((acc, t) => acc + t.total, 0);
  const doctorCommissionRate = selectedDoctorObj?.commissionRates?.Privado || 50;
  const rawDoctorShare = (totalGross * doctorCommissionRate) / 100;

  // Retención Fiscal del 1% para cobros en Bolívares (Bs)
  const bsTransactionsCount = doctorTransactions.filter(t => t.paymentMethods.some(m => m.method.includes('Bs'))).length;
  const retencionMonto = (rawDoctorShare * retencionFiscalPercent) / 100;
  const netDoctorShare = rawDoctorShare - retencionMonto;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck className="text-teal-600 w-7 h-7" />
            Liquidación a Especialistas, SENIAT & Retenciones Fiscales (1%)
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Generación automática del estado de cuenta médico, retención de ley del 1% en pagos en Bs. y cotejo fiscal.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Printer className="w-4 h-4" /> Imprimir Estado de Cuenta
        </button>
      </div>

      {/* Selector de Médico & Resumen Liquidación */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <label className="block font-extrabold text-xs mb-1 text-slate-700">Seleccionar Médico Especialista</label>
            <select
              value={selectedDoctorName}
              onChange={(e) => setSelectedDoctorName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900"
            >
              {specialists.map(sp => (
                <option key={sp.id} value={sp.name}>{sp.name} ({sp.specialty})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
            <span>RIF Médico: <strong className="font-mono text-slate-900">{selectedDoctorObj?.rIF}</strong></span>
            <span>•</span>
            <span>% Honorario Base: <strong className="font-mono text-teal-800">{doctorCommissionRate}%</strong></span>
          </div>
        </div>

        {/* Tarjetas de Métricas de Liquidación */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-bold text-slate-600 block">Total Bruto Facturado:</span>
            <span className="text-xl font-extrabold font-mono text-slate-900">${totalGross.toFixed(2)} USD</span>
          </div>

          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <span className="text-[11px] font-bold text-teal-900 block">Honorario Bruto Médico ({doctorCommissionRate}%):</span>
            <span className="text-xl font-extrabold font-mono text-teal-950">${rawDoctorShare.toFixed(2)} USD</span>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <span className="text-[11px] font-bold text-rose-900 block">Retención Fiscal (1% Ley SENIAT):</span>
            <span className="text-xl font-extrabold font-mono text-rose-950">-${retencionMonto.toFixed(2)} USD</span>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-900 block">Monto Neto Final a Pagar:</span>
            <span className="text-2xl font-extrabold font-mono text-emerald-950">${netDoctorShare.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {/* Vista Acumulativa de Servicios Cobrados Frente a Pendientes */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">
          Vista Acumulativa de Servicios Tratados por {selectedDoctorName}
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3">Recibo ID</th>
                <th className="p-3">Fecha / Hora</th>
                <th className="p-3">Paciente</th>
                <th className="p-3">Procedimiento</th>
                <th className="p-3 text-right">Monto Total ($)</th>
                <th className="p-3 text-right">Honorario Médico (50%)</th>
                <th className="p-3 text-right">Retención 1% (Bs)</th>
                <th className="p-3 text-right">Neto a Pagar ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
              {doctorTransactions.map(t => {
                const hBruto = t.total * (doctorCommissionRate / 100);
                const ret = hBruto * 0.01;
                const hNeto = hBruto - ret;
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{t.id}</td>
                    <td className="p-3 font-mono text-slate-600">{t.date}</td>
                    <td className="p-3 font-extrabold text-slate-900">{t.patient}</td>
                    <td className="p-3 font-semibold text-slate-800">{t.procedure}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">${t.total.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-teal-800">${hBruto.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-rose-800 font-bold">-${ret.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${hNeto.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
