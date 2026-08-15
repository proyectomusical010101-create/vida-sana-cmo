import React, { useState } from 'react';
import { Smartphone, ShieldCheck, CheckCircle2, Calculator, AlertCircle, RefreshCw, Trash2, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import { reconcileCasheaApi } from '../api';

export default function CasheaModule({ casheaTransactions, setCasheaTransactions, specialists }) {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'reconciliation' | 'simulator'
  const [selectedBatchCode, setSelectedBatchCode] = useState('LOTE-20260804-A');

  // Simulator State
  const [simAmount, setSimAmount] = useState('200');
  const [simScheme, setSimScheme] = useState('Opción A'); // Opción A (Clínica asume MDR) | Opción B (Especialista asume MDR)
  const [simCommissionRate, setSimCommissionRate] = useState('50');

  // Buscador de Transacciones Cashea
  const [casheaSearchTerm, setCasheaSearchTerm] = useState('');

  const handleReconcileBatch = async () => {
    const pendingInBatch = casheaTransactions.filter(t => t.batchCode === selectedBatchCode && t.status === 'Pendiente Por Banco');
    if (pendingInBatch.length === 0) {
      alert('⚠️ No hay transacciones pendientes en este lote.');
      return;
    }

    const idsToReconcile = pendingInBatch.map(t => t.id);

    try {
      await reconcileCasheaApi(idsToReconcile);
    } catch (err) {}

    const updated = casheaTransactions.map(t => {
      if (idsToReconcile.includes(t.id)) {
        return { ...t, status: 'Conciliado' };
      }
      return t;
    });

    setCasheaTransactions(updated);
    Swal.fire('¡Lote Conciliado!', `Se conciliaron masivamente las transacciones del lote ${selectedBatchCode}.`, 'success');
  };

  const handleDeleteCasheaTx = (tx) => {
    Swal.fire({
      title: '¿Eliminar Transacción Cashea?',
      text: `¿Estás seguro de que deseas anular el contrato de Cashea ${tx.id} de "${tx.patientName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Eliminar Registro',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setCasheaTransactions(casheaTransactions.filter(item => item.id !== tx.id));
        Swal.fire('Eliminado', `La transacción de Cashea ${tx.id} fue eliminada.`, 'success');
      }
    });
  };

  // Calculations for Simulator
  const totalSim = parseFloat(simAmount) || 0;
  const initialPayment = totalSim * 0.30;
  const financedAmount = totalSim * 0.70;
  const mdrRate = 0.08;
  const mdrFee = financedAmount * mdrRate;
  const ivaFee = mdrFee * 0.16;
  const netBankIncome = financedAmount - mdrFee - ivaFee;

  const specialistRateDecimal = (parseFloat(simCommissionRate) || 50) / 100;
  
  let specialistHonorarium = 0;
  let clinicIncome = 0;

  if (simScheme === 'Opción A') {
    // Opción A: La clínica asume el 100% de los costos MDR e IVA
    specialistHonorarium = totalSim * specialistRateDecimal;
    clinicIncome = (initialPayment + netBankIncome) - specialistHonorarium;
  } else {
    // Opción B: El costo MDR se deduce del honorario bruto del especialista
    const grossSpecialist = totalSim * specialistRateDecimal;
    specialistHonorarium = grossSpecialist - mdrFee - ivaFee;
    clinicIncome = (initialPayment + netBankIncome) - specialistHonorarium;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Smartphone className="text-amber-700 w-7 h-7" />
            Módulo Especializado Cashea (Doble Registro & Conciliación)
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Manejo de inicial en caja + financiado bancario (8% MDR + IVA) y simulador de esquemas A y B.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-3 py-2 rounded-xl text-right">
            <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 block uppercase">
              Moneda Cashea: FIJA EN USD ($)
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              Cashea opera en Dólares ($)
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-300 px-4 py-2.5 rounded-xl text-right">
            <span className="text-xs font-bold text-amber-900 block">Cashea Pendiente por Banco:</span>
            <span className="text-xl font-extrabold font-mono text-amber-950">
              ${casheaTransactions.filter(t=>t.status==='Pendiente Por Banco').reduce((s,t)=>s+t.financedAmount,0).toFixed(2)} USD
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transactions' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          1. Transacciones Cashea Registradas
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reconciliation' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          2. Conciliación Masiva de Lotes Bancarios
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'simulator' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          3. Simulador de Comisiones (Esquemas A / B)
        </button>
      </div>

      {/* TAB 1: TRANSACCIONES */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base">Registro Doble Cashea (Inicial + Financiado)</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente o tratamiento..."
                value={casheaSearchTerm}
                onChange={(e) => setCasheaSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">ID Cashea</th>
                  <th className="p-3">Paciente</th>
                  <th className="p-3">Tratamiento</th>
                  <th className="p-3 text-right">Total ($)</th>
                  <th className="p-3 text-right">Inicial (30%)</th>
                  <th className="p-3 text-right">Financiado (70%)</th>
                  <th className="p-3 text-right">MDR (8%) + IVA</th>
                  <th className="p-3 text-right">Neto Banco ($)</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900">
                {casheaTransactions
                  .filter(t => {
                    const search = casheaSearchTerm.toLowerCase();
                    return !search ||
                      (t.patientName && t.patientName.toLowerCase().includes(search)) ||
                      (t.treatment && t.treatment.toLowerCase().includes(search)) ||
                      (t.id && t.id.toLowerCase().includes(search));
                  })
                  .map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-700">{t.id}</td>
                    <td className="p-3 font-extrabold text-slate-900">{t.patientName}</td>
                    <td className="p-3 font-semibold text-slate-800">{t.treatment}</td>
                    <td className="p-3 text-right font-mono font-bold">${t.totalAmount.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${t.downPayment.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-amber-900">${t.financedAmount.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-rose-700">-${(t.mdrFee + t.ivaFee).toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-black text-slate-900">${t.netBankIncome.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        t.status === 'Conciliado'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteCasheaTx(t)}
                        className="p-1 hover:bg-rose-100 rounded text-rose-600 transition-all"
                        title="Eliminar Registro Cashea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONCILIACIÓN */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Conciliación de Lotes Cashea contra Extracto Bancario</h3>
              <p className="text-xs text-slate-600 font-medium">Cierre masivo de lotes una vez liquidados en la cuenta bancaria de Vida Sana CMO.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedBatchCode}
                onChange={(e) => setSelectedBatchCode(e.target.value)}
                className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
              >
                <option value="LOTE-20260804-A">LOTE-20260804-A</option>
                <option value="LOTE-20260803-B">LOTE-20260803-B</option>
              </select>

              <button
                onClick={handleReconcileBatch}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Conciliar Lote Seleccionado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SIMULADOR ESQUEMAS A / B */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">Parámetros de Simulación Cashea</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Monto Total Tratamiento ($)</label>
                <input
                  type="number"
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Esquema de Distribución MDR</label>
                <select
                  value={simScheme}
                  onChange={(e) => setSimScheme(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                >
                  <option value="Opción A">Opción A: Clínica asume el 100% de la comisión MDR (8% + IVA)</option>
                  <option value="Opción B">Opción B: El Médico Especialista asume la comisión MDR</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">% Honorario Médico Especialista</label>
                <input
                  type="number"
                  value={simCommissionRate}
                  onChange={(e) => setSimCommissionRate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">Resultado Financiero Estimado</h3>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-sans font-bold text-slate-600">Monto Inicial (30% en Caja):</span>
                <div className="text-base font-extrabold text-emerald-900">${initialPayment.toFixed(2)} USD</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-sans font-bold text-slate-600">Financiado Cashea (70%):</span>
                <div className="text-base font-extrabold text-amber-900">${financedAmount.toFixed(2)} USD</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-sans font-bold text-rose-700">Comisión MDR (8%) + IVA (16%):</span>
                <div className="text-base font-extrabold text-rose-800">-${(mdrFee + ivaFee).toFixed(2)} USD</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-sans font-bold text-slate-600">Ingreso Neto Banco:</span>
                <div className="text-base font-extrabold text-slate-900">${netBankIncome.toFixed(2)} USD</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-right">
                <span className="text-xs font-sans font-bold text-emerald-900 block">Honorario Neto Médico:</span>
                <span className="text-lg font-black font-mono text-emerald-950">${specialistHonorarium.toFixed(2)} USD</span>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-300 text-right">
                <span className="text-xs font-sans font-bold text-blue-900 block">Margen Neto Clínica Vida Sana:</span>
                <span className="text-lg font-black font-mono text-blue-950">${clinicIncome.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
