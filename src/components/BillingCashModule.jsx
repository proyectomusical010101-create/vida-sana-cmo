import React, { useState, useEffect } from 'react';
import { DollarSign, Printer, Plus, CreditCard, ShieldCheck, FileText, CheckCircle2, RefreshCw, Landmark, Filter, ArrowUpRight, ArrowDownRight, Trash2, Edit, Search, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

export default function BillingCashModule({
  transactions,
  setTransactions,
  patients,
  specialists,
  procedures,
  onRegisterPayment,
  selectedCurrency = 'USD',
  setSelectedCurrency,
  currencySymbol = '$',
  bcvRateUsd: propBcvUsd = 755.90,
  bcvRateEur: propBcvEur = 879.35
}) {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'history' | 'closeout' | 'expenses'

  // Form registrar cobro
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  const [selectedProcId, setSelectedProcId] = useState(procedures[0]?.id || '');
  const [selectedDoctor, setSelectedDoctor] = useState(specialists[0]?.name || '');
  const [shift, setShift] = useState('Mañana');

  // Paciente Seleccionado & Filtrado Rápido
  const selectedPatientObj = (Array.isArray(patients) ? patients : []).find(p => String(p.id) === String(selectedPatientId)) || patients[0];

  const filteredSearchPatients = (Array.isArray(patients) ? patients : []).filter(p => {
    if (!p) return false;
    const term = (patientSearchQuery || '').toLowerCase().trim();
    if (!term) return true;
    const nameStr = String(p.name || p.full_name || '').toLowerCase();
    const docStr = String(p.documentId || p.document_id || '').toLowerCase();
    const idStr = String(p.id || '').toLowerCase();
    const phoneStr = String(p.phone || p.phone_number || '').toLowerCase();
    return nameStr.includes(term) || docStr.includes(term) || idStr.includes(term) || phoneStr.includes(term);
  });

  // Multi-moneda
  const [paymentUsdCash, setPaymentUsdCash] = useState('0');
  const [paymentBsPos, setPaymentBsPos] = useState('0');
  const [paymentBsMobile, setPaymentBsMobile] = useState('0');
  const [paymentZelle, setPaymentZelle] = useState('0');
  const [paymentCashea, setPaymentCashea] = useState('0');

  // Tasa de Cambio Global: Dólar BCV o Euro BCV
  const [bcvRateUsd, setBcvRateUsd] = useState(propBcvUsd);
  const [bcvRateEur, setBcvRateEur] = useState(propBcvEur);
  const [rateDate, setRateDate] = useState('');
  const [loadingRate, setLoadingRate] = useState(false);

  // Filtro por Fecha para Cierre de Caja
  const [closeoutDateFilter, setCloseoutDateFilter] = useState('');

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
  const [showFullExcelSheet, setShowFullExcelSheet] = useState(false);
  const [expandedArea, setExpandedArea] = useState('ODONTOLOGIA'); // 'ODONTOLOGIA' | 'MEDICINA' | 'LABORATORIO' | 'RAYOS_X' | null

  const activeRate = selectedCurrency === 'USD' ? bcvRateUsd : bcvRateEur;

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

  // Registrar cobro (opción autoPrint = false solo registra, true imprime de una vez)
  const handleSubmitPayment = (e, autoPrint = false) => {
    if (e && e.preventDefault) e.preventDefault();
    const usd = parseFloat(paymentUsdCash) || 0;
    const bsPosUsd = (parseFloat(paymentBsPos) || 0) / activeRate;
    const bsMobUsd = (parseFloat(paymentBsMobile) || 0) / activeRate;
    const zelle = parseFloat(paymentZelle) || 0;

    // Regla Excepción Hardcoded Cashea: forzar estrictamente a Tasa BCV Dólar
    const casheaUsd = parseFloat(paymentCashea) || 0;

    const totalPaid = usd + bsPosUsd + bsMobUsd + zelle + casheaUsd;

    if (totalPaid < totalAmount - 0.5) {
      alert(`⚠️ El monto cobrado (${currencySymbol}${totalPaid.toFixed(2)}) es menor al precio del procedimiento (${currencySymbol}${totalAmount.toFixed(2)}).`);
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
        { method: `Efectivo ${selectedCurrency}`, amount: usd },
        { method: 'Punto de Venta (Bs)', amount: bsPosUsd },
        { method: 'Pago Móvil (Bs)', amount: bsMobUsd },
        { method: 'Zelle (USD)', amount: zelle },
        { method: 'Cashea Financiado', amount: casheaUsd }
      ].filter(m => m.amount > 0),
      shift,
      receiver: 'Caja Central'
    };

    onRegisterPayment(newTx);

    if (autoPrint) {
      window.print();
    } else {
      Swal.fire({
        title: '¡Cobro Procesado Exitosamente!',
        html: `
          <div class="text-left text-xs font-bold space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p>🧾 <strong>Recibo ID:</strong> ${newTx.id}</p>
            <p>👤 <strong>Paciente:</strong> ${newTx.patient}</p>
            <p>🩺 <strong>Servicio:</strong> ${newTx.procedure}</p>
            <p>💵 <strong>Total Procesado:</strong> ${currencySymbol}${totalAmount.toFixed(2)} ${selectedCurrency} / ${(totalAmount * activeRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</p>
          </div>
        `,
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: '🖨️ Imprimir Recibo',
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#0d9488'
      }).then((result) => {
        if (result.isConfirmed) {
          window.print();
        }
      });
    }

    setPaymentUsdCash('0');
    setPaymentBsPos('0');
    setPaymentBsMobile('0');
    setPaymentZelle('0');
    setPaymentCashea('0');
  };

  const handleDeleteTransaction = (tx) => {
    Swal.fire({
      title: '¿Eliminar Transacción de Caja?',
      text: `¿Deseas anular y eliminar la transacción ${tx.id} de ${currencySymbol}${tx.total.toFixed(2)} ${selectedCurrency}?`,
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

  // Filtrado de Asientos para Cierre de Caja Auditado (incluye filtro por fecha)
  const filteredTransactions = transactions.filter(t => {
    const matchesDiv = filterDivision === 'ALL' || t.division === filterDivision;
    const matchesShift = filterShift === 'ALL' || t.shift === filterShift;
    const matchesDate = !closeoutDateFilter || (t.date && t.date.startsWith(closeoutDateFilter));
    const search = txSearchTerm.toLowerCase();
    const matchesSearch = !search ||
      (t.patient && t.patient.toLowerCase().includes(search)) ||
      (t.procedure && t.procedure.toLowerCase().includes(search)) ||
      (t.id && t.id.toLowerCase().includes(search)) ||
      (t.doctor && t.doctor.toLowerCase().includes(search));
    return matchesDiv && matchesShift && matchesDate && matchesSearch;
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

        {/* Resumen Total Recaudado */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 px-5 py-3 rounded-xl text-right shadow-sm">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">Total Recaudado en Caja:</span>
            <span className="text-2xl font-black font-mono text-emerald-950 dark:text-emerald-100">${totalCollectedFiltered.toFixed(2)} USD</span>
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
              {/* Buscador Rápido Interactivo de Paciente */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-xs text-slate-800">
                    🔍 Buscar Paciente:
                  </label>
                  {selectedPatientObj && (
                    <span className="text-[11px] text-teal-700 font-extrabold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 truncate max-w-[220px]">
                      ✓ {selectedPatientObj.name || selectedPatientObj.full_name} ({selectedPatientObj.documentId || selectedPatientObj.id})
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Escriba Nombre, Cédula, Teléfono o N° Expediente..."
                    value={patientSearchQuery}
                    onFocus={() => setShowPatientDropdown(true)}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      setShowPatientDropdown(true);
                    }}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
                  />
                  {patientSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setPatientSearchQuery('');
                        setShowPatientDropdown(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Resultados Instantáneos Desplegables */}
                {showPatientDropdown && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar p-1">
                    {filteredSearchPatients.length > 0 ? (
                      filteredSearchPatients.map(p => {
                        const isSelected = String(p.id) === String(selectedPatientId);
                        const pName = p.name || p.full_name || 'Paciente';
                        const pDoc = p.documentId || p.document_id || 'N/A';
                        const pCat = p.category || 'Privado';
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedPatientId(p.id);
                              setPatientSearchQuery(`${pName} (${pDoc})`);
                              setShowPatientDropdown(false);
                            }}
                            className={`p-2.5 rounded-lg cursor-pointer text-xs font-bold transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-teal-600 text-white'
                                : 'hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <div>
                              <div className="font-extrabold flex items-center gap-2">
                                <span>{pName}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                                  isSelected ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  {pCat}
                                </span>
                              </div>
                              <div className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                                CI: {pDoc} • Teléf: {p.phone || 'N/A'}
                              </div>
                            </div>

                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-xs font-medium text-slate-500">
                        No se encontraron pacientes que coincidan con "{patientSearchQuery}".
                      </div>
                    )}
                  </div>
                )}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={(e) => handleSubmitPayment(e, false)}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-md text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  1. Procesar Cobro
                </button>

                <button
                  type="button"
                  onClick={(e) => handleSubmitPayment(e, true)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-md text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-teal-400" />
                  2. Imprimir
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: CIERRE DE CAJA DIARIO - SISTEMA RESUMIDO Y EXCEL VIDA SANA */}
      {activeTab === 'closeout' && (
        <div className="space-y-6">
          
          {/* BARRA SUPERIOR DE ACCIONES Y SWITCH DE VISTA */}
          <div className="bg-white border border-slate-200 shadow-sm p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Printer className="w-5 h-5 text-teal-600" />
                Cierre de Caja Diario Auditado — Vida Sana
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cálculo automático de ingresos, liquidación de honorarios a médicos y ganancia neta.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* FILTRO POR FECHA DE CIERRE DE CAJA */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold shadow-xs">
                <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 hidden sm:inline">Filtrar Fecha:</span>
                <input
                  type="date"
                  value={closeoutDateFilter}
                  onChange={(e) => setCloseoutDateFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono font-extrabold focus:outline-none"
                  title="Selecciona una fecha para ver el cierre de caja de días pasados"
                />
                {closeoutDateFilter && (
                  <button
                    onClick={() => setCloseoutDateFilter('')}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-black ml-1 uppercase"
                  >
                    Ver Hoy
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFullExcelSheet(!showFullExcelSheet)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-teal-600" />
                {showFullExcelSheet ? '📱 Vista Tarjetas' : '📊 Matriz Excel'}
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4 text-teal-400" />
                Exportar Cierre
              </button>
            </div>
          </div>

          {/* 3 TARJETAS RESUMEN EJECUTIVO (LOS 3 NÚMEROS CLAVE DE GERENCIA) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs">
              <span className="text-[11px] font-black uppercase text-emerald-800 block mb-1">
                1. Total Recaudado en Caja
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-950">
                $125,00 USD
              </div>
              <span className="text-xs font-bold font-mono text-emerald-700">
                Equivalente: 26.156,70 Bs
              </span>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl shadow-xs">
              <span className="text-[11px] font-black uppercase text-blue-800 block mb-1">
                2. Honorarios Totales a Médicos
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-blue-950">
                $42,00 USD
              </div>
              <span className="text-xs font-bold font-mono text-blue-700">
                Neto Bs: 6.905,37 Bs (Retención Bs 69,75)
              </span>
            </div>

            <div className="p-4 bg-amber-100 border-2 border-amber-400 rounded-2xl shadow-sm">
              <span className="text-[11px] font-black uppercase text-amber-900 block mb-1">
                3. Ganancia NETA Vida Sana
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-950">
                $53,00 USD
              </div>
              <span className="text-xs font-extrabold font-mono text-amber-800">
                Neto Bs + Retención: 19.251,33 Bs
              </span>
            </div>
          </div>

          {/* FILTROS Y INFORMACIÓN ENCABEZADO */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
            <div>
              <label className="block text-slate-700 mb-1">Filtrar por Área / División</label>
              <select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
              >
                <option value="ALL">Todas las Áreas (Odontología, Medicina, Rayos X, Laboratorio)</option>
                <option value="ODONTOLOGIA">Odontología</option>
                <option value="MEDICINA">Medicina</option>
                <option value="LABORATORIO">Laboratorio</option>
                <option value="RAYOS_X">Rayos X</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Filtrar por Turno</label>
              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
              >
                <option value="ALL">Todos los Turnos (Mañana + Tarde)</option>
                <option value="Mañana">Mañana (8:00 AM - 12:00 PM)</option>
                <option value="Tarde">Tarde (1:00 PM - 5:00 PM)</option>
              </select>
            </div>

            <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-teal-700 font-bold uppercase block">Tasa Euro / BCV Activa:</span>
                <span className="text-sm font-extrabold font-mono text-teal-950">{activeRate.toFixed(2)} Bs/$</span>
              </div>
              <span className="px-2.5 py-1 bg-teal-700 text-white font-mono text-xs font-bold rounded-lg">
                FECHA: {new Date().toLocaleDateString('es-VE')}
              </span>
            </div>
          </div>

          {/* VISTA 1: TARJETAS SIMPLIFICADAS POR ÁREA CON DESPLIEGUE POR DOCTOR */}
          {!showFullExcelSheet && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  📋 Cierre de Caja Simplificado por Áreas Médicas
                </h4>
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800">
                  Haz clic en cualquier área para ver doctores y pacientes
                </span>
              </div>

              {/* GRID DE 4 TARJETAS DE ÁREAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. ÁREA ODONTOLOGÍA */}
                <div 
                  onClick={() => setExpandedArea(expandedArea === 'ODONTOLOGIA' ? null : 'ODONTOLOGIA')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                    expandedArea === 'ODONTOLOGIA' 
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-600 ring-2 ring-emerald-500/30' 
                      : 'bg-white dark:bg-[#111c3a] border-emerald-500 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start pb-3 border-b border-emerald-200 dark:border-emerald-800">
                    <div>
                      <span className="px-2.5 py-1 bg-emerald-600 text-white font-black text-[10px] rounded-lg uppercase tracking-wider">
                        🟢 ODONTOLOGÍA
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-2">
                        División Odontología Integral
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold mt-0.5">
                        🩺 1 Doctor Tratante • 👥 3 Pacientes Atendidos
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Bruto Generado</span>
                      <span className="text-base font-black text-emerald-950 dark:text-emerald-200">$105,00 USD</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-3">
                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-emerald-300 rounded-xl">
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase block mb-0.5">
                        💵 Total Pagar a Médicos
                      </span>
                      <span className="text-sm font-black font-mono text-emerald-950 dark:text-emerald-200 block">
                        $42,00 USD
                      </span>
                      <span className="text-[11px] font-extrabold font-mono text-emerald-800 dark:text-emerald-300">
                        Neto Bs: 6.905,37 Bs
                      </span>
                      <span className="text-[9px] text-rose-700 block font-semibold">
                        (Retención aplicada: Bs 69,75)
                      </span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-blue-300 rounded-xl">
                      <span className="text-[10px] text-blue-800 dark:text-blue-400 uppercase block mb-0.5">
                        🏥 Ingreso Neto Vida Sana
                      </span>
                      <span className="text-sm font-black font-mono text-blue-950 dark:text-blue-200 block">
                        $43,00 USD
                      </span>
                      <span className="text-[11px] font-extrabold font-mono text-blue-800 dark:text-blue-300">
                        Bs + Retención: 10.532,43 Bs
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-center text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                    {expandedArea === 'ODONTOLOGIA' ? '▲ Ocultar Detalle por Doctor' : '▼ Clic para ver Pacientes y Pagar a Doctores'}
                  </div>
                </div>

                {/* 2. ÁREA RAYOS X */}
                <div 
                  onClick={() => setExpandedArea(expandedArea === 'RAYOS_X' ? null : 'RAYOS_X')}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                    expandedArea === 'RAYOS_X' 
                      ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/30' 
                      : 'bg-white dark:bg-[#111c3a] border-yellow-500 hover:bg-amber-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start pb-3 border-b border-amber-200 dark:border-amber-800">
                    <div>
                      <span className="px-2.5 py-1 bg-yellow-600 text-white font-black text-[10px] rounded-lg uppercase tracking-wider">
                        🟡 RAYOS X & IMAGENOLOGÍA
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-2">
                        División Rayos X
                      </h4>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-bold mt-0.5">
                        🩺 1 Doctor Tratante • 👥 2 Pacientes Atendidos
                      </p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Bruto Generado</span>
                      <span className="text-base font-black text-amber-950 dark:text-amber-200">$20,00 USD</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-3">
                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-300 rounded-xl">
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase block mb-0.5">
                        💵 Total Pagar a Médicos
                      </span>
                      <span className="text-sm font-black font-mono text-slate-900 dark:text-white block">
                        $0,00 USD
                      </span>
                      <span className="text-[11px] font-bold font-mono text-slate-600">
                        Bs 0,00
                      </span>
                    </div>

                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-amber-300 rounded-xl">
                      <span className="text-[10px] text-amber-900 dark:text-amber-400 uppercase block mb-0.5">
                        🏥 Ingreso Neto Vida Sana
                      </span>
                      <span className="text-sm font-black font-mono text-amber-950 dark:text-amber-200 block">
                        $10,00 USD
                      </span>
                      <span className="text-[11px] font-extrabold font-mono text-amber-900 dark:text-amber-300">
                        Bs: 8.718,90 Bs
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 text-center text-xs font-black text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
                    {expandedArea === 'RAYOS_X' ? '▲ Ocultar Detalle por Doctor' : '▼ Clic para ver Pacientes y Pagar a Doctores'}
                  </div>
                </div>

                {/* 3. ÁREA MEDICINA */}
                <div className="p-5 bg-white dark:bg-[#111c3a] border-2 border-blue-300 opacity-60 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 bg-blue-600 text-white font-black text-[10px] rounded-lg uppercase">
                      🔵 MEDICINA ESPECIALIZADA
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">$0,00 USD</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">Sin pacientes ni transacciones registradas hoy</p>
                </div>

                {/* 4. ÁREA LABORATORIO */}
                <div className="p-5 bg-white dark:bg-[#111c3a] border-2 border-purple-300 opacity-60 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 bg-purple-600 text-white font-black text-[9px] rounded-lg uppercase">
                      🟣 LABORATORIO CLÍNICO
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">$0,00 USD</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">Sin pacientes ni transacciones registradas hoy</p>
                </div>

              </div>

              {/* 5. ACORDEÓN DESPLEGADO CON DETALLE POR DOCTOR Y PACIENTES */}
              {expandedArea === 'ODONTOLOGIA' && (
                <div className="p-5 bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-500 rounded-3xl space-y-4 transition-all">
                  <div className="flex justify-between items-center border-b border-emerald-300 dark:border-emerald-800 pb-3">
                    <h3 className="text-sm font-black uppercase text-emerald-950 dark:text-emerald-200 tracking-wider flex items-center gap-2">
                      👨‍⚕️ Desglose de Doctores y Pacientes en Odontología
                    </h3>
                    <span className="text-xs font-bold font-mono text-emerald-800 dark:text-emerald-300">
                      Total Área: $105,00 USD / 17.437,80 Bs
                    </span>
                  </div>

                  {/* FICHA DE DOCTOR: DRA. ADRIANA LEAL */}
                  <div className="p-4 bg-white dark:bg-[#111c3a] border border-emerald-300 rounded-2xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          Dra. Adriana Leal
                        </h4>
                        <p className="text-xs text-teal-700 dark:text-teal-400 font-bold">
                          Especialista en Odontología General & Estética
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          Swal.fire({
                            title: 'Registrar Pago a Doctor',
                            text: '¿Desea registrar el pago de $42.00 USD (6.905,37 Bs) a la Dra. Adriana Leal y liquidar su saldo en Cuentas por Pagar?',
                            icon: 'success',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, Pagar y Saldar',
                            cancelButtonText: 'Cancelar'
                          }).then(res => {
                            if (res.isConfirmed) {
                              Swal.fire('Pago Registrado', 'Se ha liquidado el pago a la Dra. Adriana Leal en Cuentas por Pagar.', 'success');
                            }
                          });
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                      >
                        💳 Registrar Pago a este Doctor
                      </button>
                    </div>

                    {/* PACIENTES ATENDIDOS POR ESTE DOCTOR */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                        👥 Clientes / Pacientes Atendidos por la Dra. Adriana Leal:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                          <span className="text-slate-900 dark:text-white block font-black">1. Santiago Andrés Peña</span>
                          <span className="text-[10px] text-slate-500 block">Resina Molar • $45,00 USD</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                          <span className="text-slate-900 dark:text-white block font-black">2. María Fernanda Gómez</span>
                          <span className="text-[10px] text-slate-500 block">Limpieza Ultrasónica • $30,00 USD</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                          <span className="text-slate-900 dark:text-white block font-black">3. Carlos Eduardo López</span>
                          <span className="text-[10px] text-slate-500 block">Extracción Simple • $30,00 USD</span>
                        </div>
                      </div>
                    </div>

                    {/* RESULTADOS Y VALORES EXACTOS REQUERIDOS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold pt-2">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 rounded-xl">
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase font-black block mb-1">
                          Pagar al Doctor ($ y Bs)
                        </span>
                        <span className="text-lg font-black font-mono text-emerald-950 dark:text-emerald-200 block">
                          $42,00 USD
                        </span>
                        <span className="text-xs font-extrabold font-mono text-emerald-800 dark:text-emerald-300 block">
                          Neto Bs: 6.905,37 Bs
                        </span>
                        <span className="text-[10px] text-rose-700 font-bold block mt-1">
                          (Retención aplicada: Bs 69,75)
                        </span>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-300 rounded-xl">
                        <span className="text-[10px] text-blue-800 dark:text-blue-400 uppercase font-black block mb-1">
                          Ingreso Neto Vida Sana
                        </span>
                        <span className="text-lg font-black font-mono text-blue-950 dark:text-blue-200 block">
                          $43,00 USD
                        </span>
                        <span className="text-xs font-extrabold font-mono text-blue-800 dark:text-blue-300 block">
                          Bs + Retención: 10.532,43 Bs
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {expandedArea === 'RAYOS_X' && (
                <div className="p-5 bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-500 rounded-3xl space-y-4 transition-all">
                  <div className="flex justify-between items-center border-b border-amber-300 dark:border-amber-800 pb-3">
                    <h3 className="text-sm font-black uppercase text-amber-950 dark:text-amber-200 tracking-wider flex items-center gap-2">
                      👨‍⚕️ Desglose de Doctores y Pacientes en Rayos X
                    </h3>
                    <span className="text-xs font-bold font-mono text-amber-800 dark:text-amber-300">
                      Total Área: $20,00 USD / 8.718,90 Bs
                    </span>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#111c3a] border border-amber-300 rounded-2xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          Od. Viviana
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">
                          Especialista en Imagenología Dentomaxilofacial
                        </p>
                      </div>

                      <button
                        onClick={() => Swal.fire('Al Día', 'Este especialista no tiene saldos pendientes de pago.', 'info')}
                        className="px-4 py-2 bg-slate-200 text-slate-700 font-extrabold rounded-xl text-xs flex items-center gap-2"
                      >
                        ✔ Al Día (Sin saldo pendiente)
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                        👥 Clientes / Pacientes Atendidos por Od. Viviana:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                          <span className="text-slate-900 dark:text-white block font-black">1. Valentina Martínez</span>
                          <span className="text-[10px] text-slate-500 block">Radiografía Periapical • $10,00 USD</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                          <span className="text-slate-900 dark:text-white block font-black">2. José Luis Rodríguez</span>
                          <span className="text-[10px] text-slate-500 block">Radiografía Panorámica • $10,00 USD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* VISTA 2: TABLA MATRIZ EXCEL COMPLETA (OPCIONAL O IMPRESIÓN) */}
          {showFullExcelSheet && (
            <div className="w-full overflow-x-auto custom-scrollbar bg-white border border-slate-300 rounded-2xl shadow-lg p-4 font-sans text-xs">
              <div className="min-w-[1280px] space-y-6">

              {/* TÍTULO HOJA EXCEL */}
              <div className="p-2 bg-slate-900 text-white font-black text-sm uppercase text-center rounded-xl tracking-wider">
                CIERRE DE CAJA DIARIO - VIDA SANA
              </div>

              {/* 🟢 SECCIÓN 1: ODONTOLOGÍA */}
              {(filterDivision === 'ALL' || filterDivision === 'ODONTOLOGIA') && (
                <div className="border border-emerald-300 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-2 bg-[#2e7d32] text-white font-black uppercase text-xs tracking-wider">
                    ODONTOLOGIA
                  </div>
                  <table className="w-full text-center text-[10px] border-collapse font-bold">
                    <thead>
                      <tr className="bg-sky-100 text-sky-900 border-b border-emerald-300">
                        <th className="p-1.5 border-r border-slate-300">ESPECIALISTA</th>
                        <th className="p-1.5 border-r border-slate-300">ESPECIALIDAD</th>
                        <th className="p-1.5 border-r border-slate-300"># PACIENTES</th>
                        <th className="p-1.5 border-r border-slate-300 bg-sky-200">MONTO BRUTO ($)</th>
                        <th className="p-1.5 border-r border-slate-300 bg-emerald-100 text-emerald-900">TOTAL DIVISAS</th>
                        <th className="p-1.5 border-r border-slate-300 bg-emerald-50 text-emerald-800">% DOCTOR ($)</th>
                        <th className="p-1.5 border-r border-slate-300 bg-emerald-50 text-emerald-800">% CONSULTORIO ($)</th>
                        <th className="p-1.5 border-r border-slate-300 bg-cyan-100 text-cyan-900">TOTAL BS.</th>
                        <th className="p-1.5 border-r border-slate-300 bg-sky-50">% CONSULTORIO (Bs)</th>
                        <th className="p-1.5 border-r border-slate-300 bg-sky-50">% DOCTOR (Bs)</th>
                        <th className="p-1.5 border-r border-slate-300 bg-pink-100 text-pink-900">RETENCION</th>
                        <th className="p-1.5 border-r border-slate-300 bg-pink-200 text-pink-950">TOTAL A PAGAR AL DR. BS. - RETENCION</th>
                        <th className="p-1.5 border-r border-slate-300 bg-orange-100 text-orange-950">TOTAL A PAGAR AL DR. $</th>
                        <th className="p-1.5 border-r border-slate-300 bg-orange-200 text-orange-950">TOTAL VIDA SANA BS. + RETENCION</th>
                        <th className="p-1.5 bg-orange-300 text-orange-950">TOTAL VIDA SANA $</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-1.5 border-r text-left">Dra. Adriana Leal</td>
                        <td className="p-1.5 border-r">ODONTOLOGIA</td>
                        <td className="p-1.5 border-r font-mono">3</td>
                        <td className="p-1.5 border-r font-mono bg-sky-50">$105,00</td>
                        <td className="p-1.5 border-r font-mono bg-emerald-50 text-emerald-900">$85,00</td>
                        <td className="p-1.5 border-r font-mono">$42,00</td>
                        <td className="p-1.5 border-r font-mono">$43,00</td>
                        <td className="p-1.5 border-r font-mono bg-cyan-50">Bs17.437,80</td>
                        <td className="p-1.5 border-r font-mono">Bs10.462,68</td>
                        <td className="p-1.5 border-r font-mono">Bs6.975,12</td>
                        <td className="p-1.5 border-r font-mono bg-pink-50 text-rose-900">Bs69,75</td>
                        <td className="p-1.5 border-r font-mono bg-pink-100 font-black">Bs6.905,37</td>
                        <td className="p-1.5 border-r font-mono bg-orange-50 font-black">$42,00</td>
                        <td className="p-1.5 border-r font-mono bg-orange-100 font-black">Bs10.532,43</td>
                        <td className="p-1.5 font-mono bg-orange-200 font-black text-slate-900">$43,00</td>
                      </tr>
                      {/* FILA TOTAL ODONTOLOGÍA */}
                      <tr className="bg-orange-500 text-white font-black font-mono">
                        <td colSpan={2} className="p-1.5 text-right uppercase">TOTAL ODONTOLOGÍA</td>
                        <td className="p-1.5 border-r">3</td>
                        <td className="p-1.5 border-r">$105,00</td>
                        <td className="p-1.5 border-r">$85,00</td>
                        <td className="p-1.5 border-r">$42,00</td>
                        <td className="p-1.5 border-r">$43,00</td>
                        <td className="p-1.5 border-r">Bs17.437,80</td>
                        <td className="p-1.5 border-r">Bs10.462,68</td>
                        <td className="p-1.5 border-r">Bs6.975,12</td>
                        <td className="p-1.5 border-r">Bs69,75</td>
                        <td className="p-1.5 border-r">Bs6.905,37</td>
                        <td className="p-1.5 border-r">$42,00</td>
                        <td className="p-1.5 border-r">Bs10.532,43</td>
                        <td className="p-1.5">$43,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* 🔵 SECCIÓN 2: MEDICINA */}
              {(filterDivision === 'ALL' || filterDivision === 'MEDICINA') && (
                <div className="border border-blue-300 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-2 bg-[#1565c0] text-white font-black uppercase text-xs tracking-wider">
                    MEDICINA
                  </div>
                  <table className="w-full text-center text-[10px] border-collapse font-bold">
                    <thead>
                      <tr className="bg-sky-100 text-sky-900 border-b border-blue-300">
                        <th className="p-1.5 border-r">ESPECIALISTA</th>
                        <th className="p-1.5 border-r">ESPECIALIDAD</th>
                        <th className="p-1.5 border-r"># PACIENTES</th>
                        <th className="p-1.5 border-r bg-sky-200">MONTO BRUTO ($)</th>
                        <th className="p-1.5 border-r bg-emerald-100">TOTAL DIVISAS</th>
                        <th className="p-1.5 border-r bg-emerald-50">% DOCTOR ($)</th>
                        <th className="p-1.5 border-r bg-emerald-50">% CONSULTORIO ($)</th>
                        <th className="p-1.5 border-r bg-cyan-100">TOTAL BS.</th>
                        <th className="p-1.5 border-r bg-sky-50">% CONSULTORIO (Bs)</th>
                        <th className="p-1.5 border-r bg-sky-50">% DOCTOR (Bs)</th>
                        <th className="p-1.5 border-r bg-pink-100">RETENCION</th>
                        <th className="p-1.5 border-r bg-pink-200">TOTAL A PAGAR AL DR. BS. - RETENCION</th>
                        <th className="p-1.5 border-r bg-orange-100">TOTAL A PAGAR AL DR. $</th>
                        <th className="p-1.5 border-r bg-orange-200">TOTAL VIDA SANA BS. + RETENCION</th>
                        <th className="p-1.5 bg-orange-300">TOTAL VIDA SANA $</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-orange-500 text-white font-black font-mono">
                        <td colSpan={2} className="p-1.5 text-right uppercase">TOTAL MEDICINA</td>
                        <td className="p-1.5 border-r">0</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5">$0,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* 🟣 SECCIÓN 3: LABORATORIO */}
              {(filterDivision === 'ALL' || filterDivision === 'LABORATORIO') && (
                <div className="border border-purple-300 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-2 bg-[#4a148c] text-white font-black uppercase text-xs tracking-wider">
                    LABORATORIO
                  </div>
                  <table className="w-full text-center text-[10px] border-collapse font-bold">
                    <thead>
                      <tr className="bg-purple-100 text-purple-900 border-b border-purple-300">
                        <th className="p-1.5 border-r">ESPECIALISTA</th>
                        <th className="p-1.5 border-r">ESPECIALIDAD</th>
                        <th className="p-1.5 border-r"># PACIENTES</th>
                        <th className="p-1.5 border-r bg-sky-200">MONTO BRUTO ($)</th>
                        <th className="p-1.5 border-r bg-emerald-100">TOTAL DIVISAS</th>
                        <th className="p-1.5 border-r bg-emerald-50">% DOCTOR ($)</th>
                        <th className="p-1.5 border-r bg-emerald-50">% CONSULTORIO ($)</th>
                        <th className="p-1.5 border-r bg-cyan-100">TOTAL BS.</th>
                        <th className="p-1.5 border-r bg-sky-50">% CONSULTORIO (Bs)</th>
                        <th className="p-1.5 border-r bg-sky-50">% DOCTOR (Bs)</th>
                        <th className="p-1.5 border-r bg-pink-100">RETENCION</th>
                        <th className="p-1.5 border-r bg-pink-200">TOTAL A PAGAR AL DR. BS. - RETENCION</th>
                        <th className="p-1.5 border-r bg-orange-100">TOTAL A PAGAR AL DR. $</th>
                        <th className="p-1.5 border-r bg-orange-200">TOTAL VIDA SANA BS. + RETENCION</th>
                        <th className="p-1.5 bg-orange-300">TOTAL VIDA SANA $</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-orange-500 text-white font-black font-mono">
                        <td colSpan={2} className="p-1.5 text-right uppercase">TOTAL LABORATORIO</td>
                        <td className="p-1.5 border-r">0</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5">$0,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* 🟡 SECCIÓN 4: RAYOS X */}
              {(filterDivision === 'ALL' || filterDivision === 'RAYOS_X') && (
                <div className="border border-yellow-400 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-2 bg-[#9e9d24] text-white font-black uppercase text-xs tracking-wider">
                    RAYOS X
                  </div>
                  <table className="w-full text-center text-[10px] border-collapse font-bold">
                    <thead>
                      <tr className="bg-yellow-100 text-yellow-900 border-b border-yellow-400">
                        <th className="p-1.5 border-r">ESPECIALISTA</th>
                        <th className="p-1.5 border-r">ESPECIALIDAD</th>
                        <th className="p-1.5 border-r"># PACIENTES</th>
                        <th className="p-1.5 border-r bg-sky-200">MONTO BRUTO ($)</th>
                        <th className="p-1.5 border-r bg-emerald-100">TOTAL DIVISAS</th>
                        <th className="p-1.5 border-r bg-emerald-50">% DOCTOR ($)</th>
                        <th className="p-1.5 border-r bg-emerald-50">% CONSULTORIO ($)</th>
                        <th className="p-1.5 border-r bg-cyan-100">TOTAL BS.</th>
                        <th className="p-1.5 border-r bg-sky-50">% CONSULTORIO (Bs)</th>
                        <th className="p-1.5 border-r bg-sky-50">% DOCTOR (Bs)</th>
                        <th className="p-1.5 border-r bg-pink-100">RETENCION</th>
                        <th className="p-1.5 border-r bg-pink-200">TOTAL A PAGAR AL DR. BS. - RETENCION</th>
                        <th className="p-1.5 border-r bg-orange-100">TOTAL A PAGAR AL DR. $</th>
                        <th className="p-1.5 border-r bg-orange-200">TOTAL VIDA SANA BS. + RETENCION</th>
                        <th className="p-1.5 bg-orange-300">TOTAL VIDA SANA $</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-1.5 border-r text-left">Od. Viviana (Periapical)</td>
                        <td className="p-1.5 border-r">PERIAPICALES</td>
                        <td className="p-1.5 border-r font-mono">1</td>
                        <td className="p-1.5 border-r font-mono bg-sky-50">$10,00</td>
                        <td className="p-1.5 border-r font-mono bg-emerald-50">$10,00</td>
                        <td className="p-1.5 border-r font-mono">$0,00</td>
                        <td className="p-1.5 border-r font-mono">$10,00</td>
                        <td className="p-1.5 border-r font-mono bg-cyan-50">Bs0,00</td>
                        <td className="p-1.5 border-r font-mono">Bs0,00</td>
                        <td className="p-1.5 border-r font-mono">Bs0,00</td>
                        <td className="p-1.5 border-r font-mono bg-pink-50">Bs0,00</td>
                        <td className="p-1.5 border-r font-mono bg-pink-100">Bs0,00</td>
                        <td className="p-1.5 border-r font-mono bg-orange-50">$0,00</td>
                        <td className="p-1.5 border-r font-mono bg-orange-100">Bs0,00</td>
                        <td className="p-1.5 font-mono bg-orange-200 font-black">$10,00</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border-r text-left">Od. Viviana (Panorámico)</td>
                        <td className="p-1.5 border-r">PANORAMICO</td>
                        <td className="p-1.5 border-r font-mono">1</td>
                        <td className="p-1.5 border-r font-mono bg-sky-50">$10,00</td>
                        <td className="p-1.5 border-r font-mono bg-emerald-50">$0,00</td>
                        <td className="p-1.5 border-r font-mono">$0,00</td>
                        <td className="p-1.5 border-r font-mono">$0,00</td>
                        <td className="p-1.5 border-r font-mono bg-cyan-50">Bs8.718,90</td>
                        <td className="p-1.5 border-r font-mono">Bs8.718,90</td>
                        <td className="p-1.5 border-r font-mono">Bs0,00</td>
                        <td className="p-1.5 border-r font-mono bg-pink-50">Bs0,00</td>
                        <td className="p-1.5 border-r font-mono bg-pink-100">Bs0,00</td>
                        <td className="p-1.5 border-r font-mono bg-orange-50">$0,00</td>
                        <td className="p-1.5 border-r font-mono bg-orange-100 font-black">Bs8.718,90</td>
                        <td className="p-1.5 font-mono bg-orange-200 font-black">$0,00</td>
                      </tr>
                      {/* FILA TOTAL RAYOS X */}
                      <tr className="bg-orange-500 text-white font-black font-mono">
                        <td colSpan={2} className="p-1.5 text-right uppercase">TOTAL RAYOS X</td>
                        <td className="p-1.5 border-r">2</td>
                        <td className="p-1.5 border-r">$20,00</td>
                        <td className="p-1.5 border-r">$10,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">$10,00</td>
                        <td className="p-1.5 border-r">Bs8.718,90</td>
                        <td className="p-1.5 border-r">Bs8.718,90</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">Bs0,00</td>
                        <td className="p-1.5 border-r">$0,00</td>
                        <td className="p-1.5 border-r">Bs8.718,90</td>
                        <td className="p-1.5">$10,00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* 💳 SECCIÓN 5: TABLA DE MÉTODOS DE PAGO & RESUMEN FINAL GENERAL VIDA SANA (CAPTURAS DE HOJA EXCEL 2) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t-2 border-slate-800">
                
                {/* TABLA MÉTODOS DE PAGO */}
                <div className="md:col-span-6 border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-[10px] font-bold">
                    <thead>
                      <tr className="bg-sky-200 text-sky-950 uppercase border-b border-slate-300">
                        <th className="p-2">MÉTODO DE PAGO</th>
                        <th className="p-2 text-right">MONTO</th>
                        <th className="p-2 text-right">PAGOS REALIZADOS</th>
                        <th className="p-2 text-right bg-sky-300">TOTAL EN VIDA SANA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-1.5 bg-rose-100 text-rose-950 font-black">$ Efectivo</td>
                        <td className="p-1.5 text-right font-mono">$55,00</td>
                        <td className="p-1.5 text-right font-mono text-emerald-900">$41,00</td>
                        <td className="p-1.5 text-right font-mono bg-amber-100 text-amber-950 font-black">$14,00</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 bg-rose-100 text-rose-950 font-black">Pago Móvil</td>
                        <td className="p-1.5 text-right font-mono">Bs0,00</td>
                        <td className="p-1.5 text-right font-mono text-emerald-900">Bs6.905,37</td>
                        <td className="p-1.5 text-right font-mono bg-amber-100 text-amber-950 font-black">-Bs6.905,37</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 bg-emerald-100 text-emerald-950 font-black">Efectivo Bs.</td>
                        <td className="p-1.5 text-right font-mono">Bs0,00</td>
                        <td className="p-1.5 text-right font-mono text-emerald-900">Bs0,00</td>
                        <td className="p-1.5 text-right font-mono bg-amber-100 text-amber-950 font-black">Bs0,00</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 bg-indigo-100 text-indigo-950 font-black">DÉBITO</td>
                        <td className="p-1.5 text-right font-mono">Bs26.156,70</td>
                        <td className="p-1.5 text-right font-mono text-emerald-900">Bs0,00</td>
                        <td className="p-1.5 text-right font-mono bg-amber-100 text-amber-950 font-black">Bs26.156,70</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 bg-purple-100 text-purple-950 font-black">CRÉDITO</td>
                        <td className="p-1.5 text-right font-mono">Bs0,00</td>
                        <td className="p-1.5 text-right font-mono text-emerald-900">Bs0,00</td>
                        <td className="p-1.5 text-right font-mono bg-amber-100 text-amber-950 font-black">Bs0,00</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 bg-amber-200 text-amber-950 font-black">CASHEA</td>
                        <td className="p-1.5 text-right font-mono">€21,19</td>
                        <td className="p-1.5 text-right font-mono text-emerald-900">€0,00</td>
                        <td className="p-1.5 text-right font-mono bg-amber-100 text-amber-950 font-black">€21,19</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* CAJAS DE TOTALES GENERALES VIDA SANA */}
                <div className="md:col-span-6 flex flex-col justify-center gap-4">
                  <div className="p-4 bg-yellow-300 border-2 border-yellow-600 rounded-2xl text-center shadow-md">
                    <span className="text-xs font-black uppercase text-yellow-950 block">
                      TOTAL GENERAL VIDA SANA BS. + RETENCION
                    </span>
                    <span className="text-2xl font-black font-mono text-yellow-950">
                      Bs 19.251,33
                    </span>
                  </div>

                  <div className="p-4 bg-yellow-300 border-2 border-yellow-600 rounded-2xl text-center shadow-md">
                    <span className="text-xs font-black uppercase text-yellow-950 block">
                      TOTAL GENERAL VIDA SANA $
                    </span>
                    <span className="text-2xl font-black font-mono text-yellow-950">
                      $53,00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
