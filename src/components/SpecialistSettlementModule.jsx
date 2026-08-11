import React, { useState } from 'react';
import { FileCheck, DollarSign, ShieldCheck, Printer, Download, Percent, Calculator, UserCheck, Calendar, AlertTriangle, Plus, CheckCircle2, Clock, Zap, Wifi, Droplet, Building } from 'lucide-react';
import Swal from 'sweetalert2';

export default function SpecialistSettlementModule({ specialists = [], transactions = [], bcvRate = 755.90 }) {
  const [activeTab, setActiveTab] = useState('settlement'); // 'settlement' | 'accounts-payable'
  
  // Liquidación Médica
  const [selectedDoctorName, setSelectedDoctorName] = useState(specialists[0]?.name || '');
  const [retencionFiscalPercent, setRetencionFiscalPercent] = useState(1.0); // Retención del 1% en pagos Bs

  // Cuentas por Pagar / Servicios Contratados
  const [accountsPayable, setAccountsPayable] = useState([
    {
      id: 'CXP-101',
      provider: 'CORPOELEC - Electricidad de Caracas',
      serviceCategory: 'Servicio Eléctrico / Luz',
      contractNo: 'NIC-9048123',
      amountUsd: 45.00,
      frequency: 'Mensual',
      dueDate: '2026-08-15',
      status: 'PROXIMO_A_VENCER' // 'AL_DIA' | 'PROXIMO_A_VENCER' | 'VENCIDO' | 'PAGADO'
    },
    {
      id: 'CXP-102',
      provider: 'NetUno Fibra Óptica Dedicada',
      serviceCategory: 'Internet & Telecomunicaciones',
      contractNo: 'NET-40291',
      amountUsd: 60.00,
      frequency: 'Mensual',
      dueDate: '2026-08-20',
      status: 'AL_DIA'
    },
    {
      id: 'CXP-103',
      provider: 'Hidrocapital - Agua Potable',
      serviceCategory: 'Agua Potable & Aseo',
      contractNo: 'AGU-11029',
      amountUsd: 25.00,
      frequency: 'Mensual',
      dueDate: '2026-08-10',
      status: 'VENCIDO'
    },
    {
      id: 'CXP-104',
      provider: 'Inmobiliaria Centro Médico - Alquiler Consultorios',
      serviceCategory: 'Alquiler de Local / Sede',
      contractNo: 'ALQ-2026-01',
      amountUsd: 350.00,
      frequency: 'Mensual',
      dueDate: '2026-08-01',
      status: 'PAGADO'
    }
  ]);

  // Modal para Añadir/Editar Proveedor
  const [showPayableModal, setShowPayableModal] = useState(false);
  const [editingPayable, setEditingPayable] = useState(null);

  const [formProvider, setFormProvider] = useState('');
  const [formCategory, setFormCategory] = useState('Internet / Fibra Óptica');
  const [formContractNo, setFormContractNo] = useState('');
  const [formAmountUsd, setFormAmountUsd] = useState('45');
  const [formFrequency, setFormFrequency] = useState('Mensual');
  const [formDueDate, setFormDueDate] = useState('');
  const [formStatus, setFormStatus] = useState('PROXIMO_A_VENCER');

  const selectedDoctorObj = specialists.find(s => s.name === selectedDoctorName) || specialists[0];
  const doctorTransactions = transactions.filter(t => t.doctor === selectedDoctorName);

  const totalGross = doctorTransactions.reduce((acc, t) => acc + (t.total || 0), 0);
  const doctorCommissionRate = selectedDoctorObj?.commissionRates?.Privado || 50;
  const rawDoctorShare = (totalGross * doctorCommissionRate) / 100;

  // Retención Fiscal del 1% para cobros en Bolívares (Bs)
  const retencionMonto = (rawDoctorShare * retencionFiscalPercent) / 100;
  const netDoctorShare = rawDoctorShare - retencionMonto;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    Swal.fire({
      title: 'Generando PDF Oficial...',
      text: 'Se está preparando el archivo comprimido para descarga.',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleSavePayableSubmit = (e) => {
    e.preventDefault();
    const payableObj = {
      id: editingPayable ? editingPayable.id : `CXP-${Date.now().toString().slice(-4)}`,
      provider: formProvider,
      serviceCategory: formCategory,
      contractNo: formContractNo || `CNT-${Date.now().toString().slice(-4)}`,
      amountUsd: parseFloat(formAmountUsd) || 0,
      frequency: formFrequency,
      dueDate: formDueDate || new Date().toISOString().slice(0, 10),
      status: formStatus
    };

    if (editingPayable) {
      setAccountsPayable(accountsPayable.map(a => a.id === editingPayable.id ? payableObj : a));
      Swal.fire('¡Cuenta por Pagar Actualizada!', `Se modificaron los datos de "${payableObj.provider}".`, 'success');
    } else {
      setAccountsPayable([payableObj, ...accountsPayable]);
      Swal.fire('¡Proveedor Registrado!', `El servicio "${payableObj.provider}" fue añadido a Cuentas por Pagar.`, 'success');
    }

    setShowPayableModal(false);
    setEditingPayable(null);
  };

  const togglePayableStatus = (item) => {
    const nextStatus = item.status === 'PAGADO' ? 'AL_DIA' : 'PAGADO';
    setAccountsPayable(accountsPayable.map(a => a.id === item.id ? { ...a, status: nextStatus } : a));
    Swal.fire('Estatus Actualizado', `La cuenta de ${item.provider} ahora está en estatus "${nextStatus}".`, 'info');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VENCIDO':
        return <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 font-extrabold text-[10px] rounded-full border border-rose-300 flex items-center gap-1">🚨 VENCIDO (Pagar Ahora)</span>;
      case 'PROXIMO_A_VENCER':
        return <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-extrabold text-[10px] rounded-full border border-amber-300 flex items-center gap-1">⚠️ Próximo a Vencer</span>;
      case 'PAGADO':
        return <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-extrabold text-[10px] rounded-full border border-emerald-300 flex items-center gap-1">✅ PAGADO</span>;
      default:
        return <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-extrabold text-[10px] rounded-full border border-teal-300 flex items-center gap-1">🟢 Al Día</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="text-teal-600 w-7 h-7" />
            8. Cuentas por Pagar, SENIAT & Retenciones (1%)
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
            Control de servicios públicos/proveedores contratados con alertas de cobro + liquidación a médicos con retención del 1%.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Selector de Pestañas: Liquidación Médica vs Cuentas por Pagar */}
      <div className="flex border-b border-slate-200 dark:border-[#1e2d5a] gap-2">
        <button
          onClick={() => setActiveTab('settlement')}
          className={`pb-3 px-4 font-black text-xs transition-all border-b-2 ${
            activeTab === 'settlement'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🧾 Liquidaciones Médicas & SENIAT (1%)
        </button>
        <button
          onClick={() => setActiveTab('accounts-payable')}
          className={`pb-3 px-4 font-black text-xs transition-all border-b-2 ${
            activeTab === 'accounts-payable'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          ⚡ Cuentas por Pagar & Servicios Contratados ({accountsPayable.length})
        </button>
      </div>

      {/* PESTAÑA 1: LIQUIDACIÓN A MÉDICOS & SENIAT */}
      {activeTab === 'settlement' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-80">
                <label className="block font-extrabold text-xs mb-1 text-slate-700 dark:text-slate-300">Seleccionar Médico Especialista</label>
                <select
                  value={selectedDoctorName}
                  onChange={(e) => setSelectedDoctorName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-extrabold text-slate-900 dark:text-white"
                >
                  {specialists.map(sp => (
                    <option key={sp.id} value={sp.name}>{sp.name} ({sp.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>RIF Médico: <strong className="font-mono text-slate-900 dark:text-white">{selectedDoctorObj?.rIF}</strong></span>
                <span>•</span>
                <span>% Honorario Base: <strong className="font-mono text-teal-800 dark:text-teal-300">{doctorCommissionRate}%</strong></span>
              </div>
            </div>

            {/* Tarjetas de Métricas de Liquidación */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">Total Bruto Facturado:</span>
                <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">${totalGross.toFixed(2)} USD</span>
              </div>

              <div className="p-4 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-xl">
                <span className="text-[11px] font-bold text-teal-900 dark:text-teal-200 block">Honorario Bruto Médico ({doctorCommissionRate}%):</span>
                <span className="text-xl font-extrabold font-mono text-teal-950 dark:text-teal-100">${rawDoctorShare.toFixed(2)} USD</span>
              </div>

              <div className="p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl">
                <span className="text-[11px] font-bold text-rose-900 dark:text-rose-200 block">Retención Fiscal (1% Ley SENIAT):</span>
                <span className="text-xl font-extrabold font-mono text-rose-950 dark:text-rose-100">-${retencionMonto.toFixed(2)} USD</span>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 rounded-xl">
                <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block">Monto Neto Final a Pagar:</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-950 dark:text-emerald-100">${netDoctorShare.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CUENTAS POR PAGAR & SERVICIOS CONTRATADOS */}
      {activeTab === 'accounts-payable' && (
        <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-3 border-b border-slate-200 dark:border-[#1e2d5a]">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                ⚡ Registro de Cuentas por Pagar & Servicios Contratados
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Alertas automáticas para pago de luz (CORPOELEC), internet, agua potable, alquiler e insumos.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingPayable(null);
                setFormProvider('');
                setFormCategory('Internet / Fibra Óptica');
                setFormContractNo('');
                setFormAmountUsd('45');
                setFormFrequency('Mensual');
                setFormDueDate('');
                setFormStatus('PROXIMO_A_VENCER');
                setShowPayableModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> + Añadir Proveedor / Servicio
            </button>
          </div>

          {/* Tabla de Cuentas por Pagar */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1e2d5a]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-[#0d162f] text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-[#1e2d5a]">
                <tr>
                  <th className="p-3">ID / Contrato</th>
                  <th className="p-3">Proveedor / Servicio</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3 text-right">Monto ($ USD)</th>
                  <th className="p-3 text-right">Monto (Bs BCV)</th>
                  <th className="p-3">Fecha Vencimiento</th>
                  <th className="p-3 text-center">Estatus & Alerta</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e2d5a] text-slate-900 dark:text-slate-100 font-medium">
                {accountsPayable.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-600 dark:text-slate-400">{item.contractNo || item.id}</td>
                    <td className="p-3 font-extrabold text-slate-900 dark:text-white">{item.provider}</td>
                    <td className="p-3 font-bold text-slate-600 dark:text-slate-300">{item.serviceCategory}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-slate-900 dark:text-white">${item.amountUsd.toFixed(2)} USD</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-800 dark:text-emerald-300">
                      {(item.amountUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{item.dueDate}</td>
                    <td className="p-3 text-center flex justify-center">{getStatusBadge(item.status)}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => togglePayableStatus(item)}
                        className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-all border ${
                          item.status === 'PAGADO'
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        }`}
                      >
                        {item.status === 'PAGADO' ? 'Marcar Pendiente' : 'Marcar Pagado'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR PROVEEDOR / CUENTA POR PAGAR */}
      {showPayableModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] text-slate-900 dark:text-white w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-[#1e2d5a] shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-[#1e2d5a]">
              ⚡ Añadir Servicio Contratado / Cuenta por Pagar
            </h3>

            <form onSubmit={handleSavePayableSubmit} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre del Proveedor</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CORPOELEC / NetUno Fibra"
                  value={formProvider}
                  onChange={(e) => setFormProvider(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Categoría del Servicio</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Servicio Eléctrico / Luz">Servicio Eléctrico / Luz (CORPOELEC)</option>
                    <option value="Internet / Fibra Óptica">Internet / Fibra Óptica</option>
                    <option value="Agua Potable & Aseo">Agua Potable & Aseo</option>
                    <option value="Alquiler de Sede">Alquiler de Sede / Local</option>
                    <option value="Insumos Quirúrgicos">Insumos & Materiales</option>
                    <option value="Mantenimiento de Equipos">Mantenimiento de Equipos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">N° Cuenta / Contrato</label>
                  <input
                    type="text"
                    placeholder="Ej: NIC-9048123"
                    value={formContractNo}
                    onChange={(e) => setFormContractNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Monto Mensual ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="45.00"
                    value={formAmountUsd}
                    onChange={(e) => setFormAmountUsd(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1e2d5a]">
                <button
                  type="button"
                  onClick={() => setShowPayableModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-extrabold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md"
                >
                  Guardar Cuenta por Pagar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
