import React, { useState } from 'react';
import { FileCheck, CheckCircle2, AlertTriangle, Printer, DollarSign } from 'lucide-react';
import { createSeniatInvoiceApi } from '../api';

export default function SpecialistSettlementModule({ specialists, transactions }) {
  const [selectedDoctorName, setSelectedDoctorName] = useState(specialists[0]?.name || '');

  // Form factura SENIAT
  const [invoiceNumber, setInvoiceNumber] = useState('000-01458');
  const [invoiceAmountInput, setInvoiceAmountInput] = useState('150.00');

  const selectedDoctorObj = specialists.find(s => s.name === selectedDoctorName);
  const doctorTransactions = transactions.filter(t => t.doctor === selectedDoctorName);

  const calculateDoctorCommissions = () => {
    let totalGross = 0;
    let totalCommissionDoc = 0;

    doctorTransactions.forEach(t => {
      totalGross += t.total;
      const rate = selectedDoctorObj?.commissionRates[t.category || 'Privado'] || 50;
      totalCommissionDoc += t.total * (rate / 100);
    });

    return { totalGross, totalCommissionDoc };
  };

  const { totalGross, totalCommissionDoc } = calculateDoctorCommissions();
  const clinicNetShare = totalGross - totalCommissionDoc;

  const handleRegisterInvoice = async (e) => {
    e.preventDefault();
    const invAmt = parseFloat(invoiceAmountInput) || 0;
    const isMatch = Math.abs(invAmt - totalCommissionDoc) < 0.5;

    try {
      await createSeniatInvoiceApi({
        doctorName: selectedDoctorName,
        doctorRIF: selectedDoctorObj?.rIF || 'V-14589632-0',
        invoiceNumber,
        billedTo: 'Centro Médico Odontológico Vida Sana CMO, C.A.',
        clinicRIF: 'J-50781755-5',
        invoiceAmount: invAmt,
        expectedAmount: totalCommissionDoc,
        isExactMatch: isMatch,
        status: isMatch ? 'Verificada SENIAT' : 'Diferencia en Monto'
      });
      alert(`✅ Factura ${invoiceNumber} cotejada en SQLite. Resultado: ${isMatch ? 'Monto Exacto Coincidente' : 'Diferencia Detectada'}`);
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileCheck className="text-teal-700 w-7 h-7" />
            Módulo de Liquidación de Honorarios & Cotejo SENIAT
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Estado de cuenta por especialista y verificación de facturas fiscales emitidas a favor del RIF J-50781755-5.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Seleccionar Médico:</label>
          <select
            value={selectedDoctorName}
            onChange={(e) => setSelectedDoctorName(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900"
          >
            {specialists.map(s => (
              <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Producción Bruta del Médico:</span>
          <div className="text-xl font-extrabold font-mono text-slate-900">${totalGross.toFixed(2)} USD</div>
        </div>

        <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-emerald-900 font-bold">Liquidación Pendiente al Médico:</span>
          <div className="text-2xl font-black font-mono text-emerald-950">${totalCommissionDoc.toFixed(2)} USD</div>
        </div>

        <div className="bg-blue-50 border border-blue-300 p-5 rounded-2xl space-y-1">
          <span className="text-xs text-blue-900 font-bold">Retención / Retorno Vida Sana CMO:</span>
          <div className="text-xl font-extrabold font-mono text-blue-950">${clinicNetShare.toFixed(2)} USD</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Estado de cuenta */}
        <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base">Estado de Cuenta: {selectedDoctorName}</h3>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-700" /> Imprimir Estado de Cuenta
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Paciente</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Procedimiento</th>
                <th className="p-3 text-right">Monto ($)</th>
                <th className="p-3 text-right">% Méd.</th>
                <th className="p-3 text-right">Honorario ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900">
              {doctorTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500">
                    No hay atenciones registradas para este médico en el período actual.
                  </td>
                </tr>
              ) : (
                doctorTransactions.map(t => {
                  const rate = selectedDoctorObj?.commissionRates[t.category || 'Privado'] || 50;
                  const docAmt = t.total * (rate / 100);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-600">{t.date.slice(0,10)}</td>
                      <td className="p-3 font-extrabold text-slate-900">{t.patient}</td>
                      <td className="p-3 font-bold text-teal-800">{t.category}</td>
                      <td className="p-3 font-medium text-slate-800">{t.procedure}</td>
                      <td className="p-3 text-right font-mono font-bold">${t.total.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono text-blue-900 font-extrabold">{rate}%</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-900">${docAmt.toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Right: Form Factura SENIAT */}
        <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base pb-2 border-b border-slate-200">Cotejo de Factura Fiscal SENIAT</h3>

          <form onSubmit={handleRegisterInvoice} className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-bold text-slate-700">Facturar A Favor De:</span>
              <div className="font-bold text-slate-900 text-xs">Centro Médico Odontológico Vida Sana CMO, C.A.</div>
              <div className="font-mono text-slate-600 font-bold">RIF: J-50781755-5</div>
            </div>

            <div>
              <label className="block font-bold mb-1">Número de Factura Fiscal Médico</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Monto de la Factura ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={invoiceAmountInput}
                onChange={(e) => setInvoiceAmountInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
              <span className="font-bold block">Monto Calculado por Sistema:</span>
              <span className="text-base font-extrabold font-mono text-amber-950">${totalCommissionDoc.toFixed(2)} USD</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md text-xs transition-all"
            >
              Verificar Factura en SENIAT & Validar Monto
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
