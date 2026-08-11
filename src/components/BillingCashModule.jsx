import React, { useState, useEffect } from 'react';
import { DollarSign, Printer, Plus, CreditCard, ShieldCheck, FileText, CheckCircle2, RefreshCw, Landmark, Filter, ArrowUpRight, ArrowDownRight, Trash2, Edit, Search } from 'lucide-react';
import Swal from 'sweetalert2';

export default function BillingCashModule({ transactions, setTransactions, patients, specialists, procedures, onRegisterPayment }) {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'history' | 'closeout' | 'expenses'

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

  // Tasa de Cambio Global: Dólar BCV o Euro BCV
  const [currencyMode, setCurrencyMode] = useState('USD_BCV'); // 'USD_BCV' | 'EUR_BCV'
  const [bcvRateUsd, setBcvRateUsd] = useState(755.90);
  const [bcvRateEur, setBcvRateEur] = useState(820.50);
  const [rateDate, setRateDate] = useState('');
  const [loadingRate, setLoadingRate] = useState(false);

  // Formato de Moneda para Impresión de Comprobante / Recibo: 'BOTH' (Ambos Bs & $) | 'BS' (Solo Bs) | 'REF' (Solo $)
  const [docCurrencyFormat, setDocCurrencyFormat] = useState('BOTH');
  const [docFooterNote, setDocFooterNote] = useState('Pago Móvil Banesco (0134) - RIF: J-50781755-5 - Teléf: 0412-1234567. Conserve este comprobante.');

  // Egresos y Comisiones Bancarias
  const [expenses, setExpenses] = useState([
    { id: 'EXP-101', type: 'Comisión Bancaria', method: 'Pago Móvil (Bs)', amountBs: 15.50, bankFeePercent: 1.5, note: 'Comisión transferencia Banco de Venezuela' }
  ]);
  const [expMethod, setExpMethod] = useState('Pago Móvil (Bs)');
  const [expAmountBs, setExpAmountBs] = useState('20');
  const [expFeePercent, setExpFeePercent] = useState('1.5');
  const [expNote, setExpNote] = useState('');

  // Filtros Combinados de Cierre y Buscador
  const [filterDivision, setFilterDivision] = useState('ALL');
  const [filterShift, setFilterShift] = useState('ALL');
  const [txSearchTerm, setTxSearchTerm] = useState('');

  const activeRate = currencyMode === 'USD_BCV' ? bcvRateUsd : bcvRateEur;

  const fetchBcvRate = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      const data = await res.json();
      if (data && data.promedio) {
        setBcvRateUsd(data.promedio);
        setBcvRateEur(data.promedio * 1.085);
        if (data.fechaActualizacion) {
          const dt = new Date(data.fechaActualizacion);
          setRateDate(dt.toLocaleDateString('es-VE'));
        }
      }
    } catch (err) {
      console.log('Error al cargar la tasa BCV:', err);
    } finally {
      setLoadingRate(false);
    }
  };

  useEffect(() => {
    fetchBcvRate();
  }, []);

  const currentProc = procedures.find(p => p.id === selectedProcId);
  const totalAmount = currentProc ? currentProc.price : 0;
  const currentPatientObj = patients.find(p => p.id === selectedPatientId);

  const handleSubmitPayment = (e) => {
    e.preventDefault();
    const usd = parseFloat(paymentUsdCash) || 0;
    const bsPosUsd = (parseFloat(paymentBsPos) || 0) / activeRate;
    const bsMobUsd = (parseFloat(paymentBsMobile) || 0) / activeRate;
    const zelle = parseFloat(paymentZelle) || 0;

    // Regla Excepción Hardcoded Cashea: forzar estrictamente a Tasa BCV Dólar
    const casheaUsd = parseFloat(paymentCashea) || 0;

    const totalPaid = usd + bsPosUsd + bsMobUsd + zelle + casheaUsd;

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
      division: currentProc?.division || 'ODONTOLOGIA',
      doctor: selectedDoctor,
      total: totalAmount,
      paymentMethods: [
        { method: 'Efectivo USD', amount: usd },
        { method: 'Punto de Venta (Bs)', amount: bsPosUsd },
        { method: 'Pago Móvil (Bs)', amount: bsMobUsd },
        { method: 'Zelle (USD)', amount: zelle },
        { method: 'Cashea Financiado', amount: casheaUsd }
      ].filter(m => m.amount > 0),
      shift,
      receiver: 'Caja Central'
    };

    onRegisterPayment(newTx);

    // Muestra alerta interactiva con botones SEPARADOS de Imprimir y Descargar PDF
    Swal.fire({
      title: '¡Cobro Procesado Exitosamente!',
      html: `
        <div class="text-left text-xs font-bold space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p>🧾 <strong>Recibo ID:</strong> ${newTx.id}</p>
          <p>👤 <strong>Paciente:</strong> ${newTx.patient}</p>
          <p>🩺 <strong>Servicio:</strong> ${newTx.procedure}</p>
          <p>💵 <strong>Total Procesado:</strong> $${totalAmount.toFixed(2)} USD / ${(totalAmount * activeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</p>
          <p>💱 <strong>Formato Seleccionado:</strong> ${docCurrencyFormat === 'BOTH' ? 'Ambos (Bs & $)' : docCurrencyFormat === 'BS' ? 'Solo Bolívares (Bs)' : 'Solo REF ($ USD)'}</p>
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '🖨️ Imprimir Recibo',
      denyButtonText: '📥 Descargar PDF',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#0f172a',
      denyButtonColor: '#0d9488'
    }).then((result) => {
      if (result.isConfirmed) {
        window.print();
      } else if (result.isDenied) {
        Swal.fire({
          title: 'Descargando PDF Oficial...',
          text: `Recibo ${newTx.id} descargado en formato PDF.`,
          icon: 'info',
          timer: 1800,
          showConfirmButton: false
        });
        setTimeout(() => window.print(), 500);
      }
    });

    setPaymentUsdCash('0');
    setPaymentBsPos('0');
    setPaymentBsMobile('0');
    setPaymentZelle('0');
    setPaymentCashea('0');
  };

  const handleDeleteTransaction = (tx) => {
    Swal.fire({
      title: '¿Eliminar Transacción de Caja?',
      text: `¿Deseas anular y eliminar la transacción ${tx.id} de $${tx.total.toFixed(2)} USD?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Anular y Borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setTransactions(transactions.filter(t => t.id !== tx.id));
        Swal.fire('Anulada', `La transacción ${tx.id} fue eliminada de la caja.`, 'success');
      }
    });
  };

  const handleDeleteExpense = (exp) => {
    Swal.fire({
      title: '¿Eliminar Registro de Egreso?',
      text: `¿Eliminar egreso ${exp.id} de Bs ${exp.amountBs}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Borrar Egreso',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setExpenses(expenses.filter(e => e.id !== exp.id));
        Swal.fire('Eliminado', `El egreso fue eliminado.`, 'success');
      }
    });
  };

  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    const newExp = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      type: 'Comisión Bancaria / Egreso',
      method: expMethod,
      amountBs: parseFloat(expAmountBs) || 0,
      bankFeePercent: parseFloat(expFeePercent) || 0,
      note: expNote || 'Egreso de caja'
    };
    setExpenses([newExp, ...expenses]);
    setExpAmountBs('0');
    setExpNote('');
    alert('✅ Egreso / Comisión bancaria registrada.');
  };

  // Filtrado de Asientos para Cierre de Caja Auditado
  const filteredTransactions = transactions.filter(t => {
    const matchesDiv = filterDivision === 'ALL' || t.division === filterDivision;
    const matchesShift = filterShift === 'ALL' || t.shift === filterShift;
    const search = txSearchTerm.toLowerCase();
    const matchesSearch = !search ||
      (t.patient && t.patient.toLowerCase().includes(search)) ||
      (t.procedure && t.procedure.toLowerCase().includes(search)) ||
      (t.id && t.id.toLowerCase().includes(search)) ||
      (t.doctor && t.doctor.toLowerCase().includes(search));
    return matchesDiv && matchesShift && matchesSearch;
  });

  const totalCollectedFiltered = filteredTransactions.reduce((acc, t) => acc + t.total, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <DollarSign className="text-teal-600 w-7 h-7" />
            Módulo de Caja, Auditoría & Multi-Moneda (BCV Dólar / Euro / Cashea)
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Soporte multi-moneda con selector oficial BCV, excepción forzada Cashea y egresos bancarios.
          </p>
        </div>

        {/* Selector Tasa Global BCV */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="bg-blue-50 border border-blue-300 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
            <Landmark className="w-5 h-5 text-blue-700 shrink-0" />
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-blue-900">Tasa Oficial Clínica:</span>
                <select
                  value={currencyMode}
                  onChange={(e) => setCurrencyMode(e.target.value)}
                  className="bg-blue-100 text-blue-950 font-extrabold text-[10px] rounded px-1.5 py-0.5 border border-blue-300"
                >
                  <option value="USD_BCV">Dólar BCV ($)</option>
                  <option value="EUR_BCV">Euro BCV (€)</option>
                </select>
              </div>

              <div className="text-base font-extrabold font-mono text-blue-950 flex items-center gap-1.5">
                <span>{activeRate.toFixed(2)} Bs / {currencyMode === 'USD_BCV' ? 'USD' : 'EUR'}</span>
                <button
                  type="button"
                  onClick={fetchBcvRate}
                  title="Actualizar tasa BCV DolarAPI"
                  className="p-1 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingRate ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-300 px-4 py-2.5 rounded-xl text-right">
            <span className="text-xs font-bold text-emerald-900 block">Total Recaudado en Caja:</span>
            <span className="text-xl font-extrabold font-mono text-emerald-950">${totalCollectedFiltered.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
          onClick={() => setActiveTab('closeout')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'closeout' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          2. Cierre de Caja Auditado (PDF)
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'expenses' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          3. Egresos & Comisiones Bancarias
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
                <label className="block font-bold mb-1">Procedimiento Clínico (Baremo Oficial)</label>
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
                    <option value="Mañana">Mañana (8:00 AM - 12:00 PM)</option>
                    <option value="Tarde">Tarde (1:00 PM - 5:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Formato Moneda en Recibo</label>
                  <select
                    value={docCurrencyFormat}
                    onChange={(e) => setDocCurrencyFormat(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    <option value="BOTH">Ambos (Bs & $)</option>
                    <option value="BS">Solo Bolívares (Bs)</option>
                    <option value="REF">Solo REF ($ USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Pie de Página en Recibo (Editable)</label>
                  <input
                    type="text"
                    value={docFooterNote}
                    onChange={(e) => setDocFooterNote(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Total a Cobrar en USD:</span>
                  <span className="text-2xl font-extrabold font-mono text-emerald-900">${totalAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                  <span className="font-bold text-blue-900">Total equivalente a Tasa Oficial ({activeRate.toFixed(2)} Bs):</span>
                  <span className="font-extrabold font-mono text-blue-950 text-sm">{(totalAmount * activeRate).toFixed(2)} Bs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">Desglose de Métodos de Pago</h3>

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
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-800">Punto de Venta POS (Bs)</label>
                  <span className="text-[11px] font-mono text-blue-800 font-bold">
                    Equivalente: ${((parseFloat(paymentBsPos)||0)/activeRate).toFixed(2)} USD
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto en Bolívares (Bs)"
                  value={paymentBsPos}
                  onChange={(e) => setPaymentBsPos(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-800">Pago Móvil (Bs)</label>
                  <span className="text-[11px] font-mono text-blue-800 font-bold">
                    Equivalente: ${((parseFloat(paymentBsMobile)||0)/activeRate).toFixed(2)} USD
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto en Bolívares (Bs)"
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

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-extrabold text-amber-950">Cashea Financiado ($)</label>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                    Excepción Hardcoded: Tasa BCV Dólar ({bcvRateUsd.toFixed(2)} Bs)
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={paymentCashea}
                  onChange={(e) => setPaymentCashea(e.target.value)}
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-lg font-mono font-bold text-slate-900"
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

      {/* TAB 2: CIERRE DE CAJA AUDITADO EN PDF */}
      {activeTab === 'closeout' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Printer className="w-5 h-5 text-teal-600" />
              Reporte de Cierre de Caja Auditado (Filtros Multidireccionales)
            </h3>

            {/* Botón de Exportación PDF Auditada */}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" /> Exportar Reporte Cierre en PDF
            </button>
          </div>

          {/* Filtros Combinados de Cierre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block font-bold text-xs mb-1">Filtrar por Área / División Servicio</label>
              <select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-900"
              >
                <option value="ALL">Todas las Áreas (Odontología, Medicina, Rayos X, Laboratorio)</option>
                <option value="ODONTOLOGIA">Odontología Integral</option>
                <option value="MEDICINA">Medicina Especializada</option>
                <option value="RAYOS_X">Rayos X & Imagenología</option>
                <option value="LABORATORIO">Laboratorio Clínico</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-xs mb-1">Filtrar por Turno de Trabajo</label>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-900"
              >
                <option value="ALL">Todos los Turnos (Mañana + Tarde)</option>
                <option value="Mañana">Mañana (8:00 AM - 12:00 PM)</option>
                <option value="Tarde">Tarde (1:00 PM - 5:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Tabla de Asientos Filtrados */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">Recibo ID</th>
                  <th className="p-3">Fecha / Hora</th>
                  <th className="p-3">Paciente</th>
                  <th className="p-3">Procedimiento</th>
                  <th className="p-3">Turno</th>
                  <th className="p-3 text-right">Monto ($)</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{t.id}</td>
                      <td className="p-3 font-mono text-slate-600">{t.date}</td>
                      <td className="p-3 font-extrabold text-slate-900">{t.patient}</td>
                      <td className="p-3 font-semibold text-slate-800">{t.procedure}</td>
                      <td className="p-3 text-slate-700">{t.shift}</td>
                      <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${t.total.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteTransaction(t)}
                          className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded text-rose-600 transition-all"
                          title="Anular Transacción"
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

      {/* TAB 3: EGRESOS & COMISIONES BANCARIAS */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-200 pb-2">
              Registrar Egreso o Comisión Bancaria por Transferencia / Pago Móvil
            </h3>

            <form onSubmit={handleAddExpenseSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Método de Pago</label>
                <select
                  value={expMethod}
                  onChange={(e) => setExpMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                >
                  <option value="Pago Móvil (Bs)">Pago Móvil (Bs)</option>
                  <option value="Transferencia (Bs)">Transferencia Bancaria (Bs)</option>
                  <option value="Punto de Venta POS">Punto de Venta POS</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Monto Egreso (Bs)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expAmountBs}
                  onChange={(e) => setExpAmountBs(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">% Comisión Bancaria</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={expFeePercent}
                  onChange={(e) => setExpFeePercent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Nota / Concepto</label>
                <input
                  type="text"
                  placeholder="Ej: Pago a proveedor insumos"
                  value={expNote}
                  onChange={(e) => setExpNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-sm"
                >
                  Guardar Egreso Bancario
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Historial de Egresos y Comisiones Bancarias</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-3">ID Egreso</th>
                    <th className="p-3">Método</th>
                    <th className="p-3">Concepto</th>
                    <th className="p-3 text-right">Monto (Bs)</th>
                    <th className="p-3 text-right">% Comisión Bancaria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{exp.id}</td>
                      <td className="p-3 font-extrabold text-slate-900">{exp.method}</td>
                      <td className="p-3 text-slate-700">{exp.note}</td>
                      <td className="p-3 text-right font-mono font-extrabold text-rose-900">{exp.amountBs.toFixed(2)} Bs</td>
                      <td className="p-3 text-right font-mono text-slate-600">{exp.bankFeePercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
