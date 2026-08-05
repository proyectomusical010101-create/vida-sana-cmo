import React, { useState } from 'react';
import { DollarSign, Printer, Plus, CreditCard, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function BillingCashModule({ transactions, setTransactions, patients, specialists, procedures, onRegisterPayment }) {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'history' | 'closeout'

  // Form registrar cobro
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedProcId, setSelectedProcId] = useState(procedures[0]?.id || '');
  const [selectedDoctor, setSelectedDoctor] = useState(specialists[0]?.name || '');
  const [shift, setShift] = useState('Mañana');

  // Multi-moneda
  const [paymentUsdCash, setPaymentUsdCash] = useState('0');
  const [paymentBsPos, setPaymentBsPos] = useState('0');
  const [paymentBsMobile, setPaymentBsMobile] = useState('0');
  const [paymentZelle, setPaymentZelle] = useState('0');
  const [paymentCashea, setPaymentCashea] = useState('0');

  const bcvRate = 42.50; // Tasa BCV de referencia

  const currentProc = procedures.find(p => p.id === selectedProcId);
  const totalAmount = currentProc ? currentProc.price : 0;

  const currentPatientObj = patients.find(p => p.id === selectedPatientId);

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    const usd = parseFloat(paymentUsdCash) || 0;
    const bsPosUsd = (parseFloat(paymentBsPos) || 0) / bcvRate;
    const bsMobUsd = (parseFloat(paymentBsMobile) || 0) / bcvRate;
    const zelle = parseFloat(paymentZelle) || 0;
    const cashea = parseFloat(paymentCashea) || 0;

    const totalPaid = usd + bsPosUsd + bsMobUsd + zelle + cashea;

    if (totalPaid < totalAmount - 0.5) {
      alert(`⚠️ El monto cobrado ($${totalPaid.toFixed(2)}) es menor al precio del procedimiento ($${totalAmount.toFixed(2)} USD).`);
      return;
    }

    const newTx = {
      id: `TX-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      patient: currentPatientObj?.name || 'Paciente',
      category: currentPatientObj?.category || 'Privado',
      procedure: currentProc?.name || 'Procedimiento',
      doctor: selectedDoctor,
      total: totalAmount,
      paymentMethods: [
        { method: 'Efectivo USD', amount: usd },
        { method: 'Punto de Venta (Bs)', amount: bsPosUsd },
        { method: 'Pago Móvil (Bs)', amount: bsMobUsd },
        { method: 'Zelle (USD)', amount: zelle },
        { method: 'Cashea Financiado', amount: cashea }
      ].filter(m => m.amount > 0),
      shift,
      receiver: 'Caja Central'
    };

    onRegisterPayment(newTx);
    alert('✅ ¡Cobro registrado con éxito en SQLite!');
    setPaymentUsdCash('0');
    setPaymentBsPos('0');
    setPaymentBsMobile('0');
    setPaymentZelle('0');
    setPaymentCashea('0');
  };

  const totalCollectedToday = transactions.reduce((acc, t) => acc + t.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="text-teal-700 w-7 h-7" />
            Módulo de Caja, Cobranza Multi-Moneda & Presupuestos
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Cobro en Efectivo USD, Puntos de Venta Bs (Tasa BCV 42.50 Bs/$), Zelle, Pago Móvil y Cashea.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-300 px-4 py-2.5 rounded-xl text-right">
          <span className="text-xs font-bold text-emerald-900 block">Total Recaudado en Caja:</span>
          <span className="text-xl font-extrabold font-mono text-emerald-950">${totalCollectedToday.toFixed(2)} USD</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'register' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          1. Registrar Cobro Multi-moneda
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          2. Historial Asientos de Caja ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('closeout')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'closeout' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          3. Cierre Diario por Turno
        </button>
      </div>

      {/* TAB 1: REGISTRAR COBRO */}
      {activeTab === 'register' && (
        <form onSubmit={handleSubmitPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">Datos de la Facturación / Recibo</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Paciente</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category} - {p.documentId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Procedimiento Clinico</label>
                <select
                  value={selectedProcId}
                  onChange={(e) => setSelectedProcId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                >
                  {procedures.map(pr => (
                    <option key={pr.id} value={pr.id}>{pr.name} - ${pr.price.toFixed(2)} USD</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Especialista Tratante</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900"
                  >
                    {specialists.map(sp => (
                      <option key={sp.id} value={sp.name}>{sp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Turno de Atención</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    <option value="Mañana">Mañana (8am - 12pm)</option>
                    <option value="Tarde">Tarde (1pm - 5pm)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total a Cobrar:</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-900">${totalAmount.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">Desglose de Formas de Pago</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-800">Efectivo USD ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentUsdCash}
                  onChange={(e) => setPaymentUsdCash(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800">Punto de Venta Bs (Tasa BCV {bcvRate} Bs/$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentBsPos}
                  onChange={(e) => setPaymentBsPos(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800">Pago Móvil Bs (Tasa BCV {bcvRate} Bs/$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentBsMobile}
                  onChange={(e) => setPaymentBsMobile(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800">Zelle USD ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentZelle}
                  onChange={(e) => setPaymentZelle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800">Cashea Financiado ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentCashea}
                  onChange={(e) => setPaymentCashea(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md text-sm mt-4 transition-all"
              >
                Procesar Cobro e Imprimir Recibo
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: HISTORIAL ASIENTOS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Asientos Registrados en Caja</h3>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3">Recibo ID</th>
                <th className="p-3">Fecha / Hora</th>
                <th className="p-3">Paciente</th>
                <th className="p-3">Procedimiento</th>
                <th className="p-3">Médico</th>
                <th className="p-3 text-right">Monto ($)</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-700">{t.id}</td>
                  <td className="p-3 font-mono text-slate-600">{t.date}</td>
                  <td className="p-3 font-extrabold text-slate-900">{t.patient}</td>
                  <td className="p-3 font-semibold text-slate-800">{t.procedure}</td>
                  <td className="p-3 text-slate-700">{t.doctor}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${t.total.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded font-bold text-[11px] inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" /> Imprimir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CIERRE DIARIO */}
      {activeTab === 'closeout' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base">Cierre Diario Resumido por Turno</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm">Turno Mañana (08:00 AM - 12:00 PM)</h4>
              <div className="text-xl font-extrabold font-mono text-emerald-900">
                ${transactions.filter(t => t.shift === 'Mañana').reduce((a, b) => a + b.total, 0).toFixed(2)} USD
              </div>
              <p className="text-xs text-slate-600 font-medium">Recaudado en turno matutino.</p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm">Turno Tarde (01:00 PM - 05:00 PM)</h4>
              <div className="text-xl font-extrabold font-mono text-emerald-900">
                ${transactions.filter(t => t.shift === 'Tarde').reduce((a, b) => a + b.total, 0).toFixed(2)} USD
              </div>
              <p className="text-xs text-slate-600 font-medium">Recaudado en turno vespertino.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
