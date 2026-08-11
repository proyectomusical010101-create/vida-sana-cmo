import React, { useState } from 'react';
import { Users, DollarSign, Award, Printer, CheckCircle2, Clock, Calendar, UserPlus, Search, Edit3, Trash2, ShieldCheck, RefreshCw, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { createPayrollApi, updatePayrollApi, deletePayrollApi, payPayrollApi } from '../api';

export default function PayrollModule({ payroll = [], setPayroll, transactions = [], setTransactions, bcvRate = 755.90 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State para Agregar / Editar Empleado
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  // Form State para Empleado
  const [formId, setFormId] = useState('');
  const [formDocId, setFormDocId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('Community Manager');
  const [formStartDate, setFormStartDate] = useState('2026-01-15');
  const [formEndDate, setFormEndDate] = useState('2026-12-31');
  const [formMonthlySalary, setFormMonthlySalary] = useState('400');
  const [formWorkedDays, setFormWorkedDays] = useState('15');
  const [formExtraDays, setFormExtraDays] = useState('0');
  const [formExtraHours, setFormExtraHours] = useState('0');
  const [formHourlyRate, setFormHourlyRate] = useState('3.50');
  const [formCustomBonus, setFormCustomBonus] = useState('20');
  const [formStatus, setFormStatus] = useState('Pendiente Quincena 1');

  // Cálculo de Antigüedad Dinámica
  const calculateTenure = (hireDateStr) => {
    if (!hireDateStr) return '1 Año';
    const hire = new Date(hireDateStr);
    const today = new Date();
    let years = today.getFullYear() - hire.getFullYear();
    let months = today.getMonth() - hire.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years <= 0 && months <= 0) return 'Nuevo Ingreso';
    if (years === 0) return `${months} Meses`;
    return `${years} Años, ${months} Meses`;
  };

  // Abrir Modal de Creación
  const handleOpenCreateModal = () => {
    setEditingEmp(null);
    setFormId(`EMP-${String(payroll.length + 1).padStart(2, '0')}`);
    setFormDocId('V-28.540.120');
    setFormName('');
    setFormPosition('Community Manager');
    setFormStartDate('2026-01-15');
    setFormEndDate('Indefinido');
    setFormMonthlySalary('400');
    setFormWorkedDays('15');
    setFormExtraDays('0');
    setFormExtraHours('0');
    setFormHourlyRate('3.50');
    setFormCustomBonus('20');
    setFormStatus('Pendiente Quincena 1');
    setShowModal(true);
  };

  // Abrir Modal de Edición
  const handleOpenEditModal = (emp) => {
    setEditingEmp(emp);
    setFormId(emp.id);
    setFormDocId(emp.documentId || 'V-20.111.222');
    setFormName(emp.name || '');
    setFormPosition(emp.position || 'Recepción');
    setFormStartDate(emp.hireDate || '2025-01-01');
    setFormEndDate(emp.endDate || 'Indefinido');
    setFormMonthlySalary((emp.monthlySalary || emp.baseSalary * 2 || 400).toString());
    setFormWorkedDays((emp.workedDays || 15).toString());
    setFormExtraDays((emp.extraDays || 0).toString());
    setFormExtraHours((emp.extraHours || 0).toString());
    setFormHourlyRate((emp.hourlyRate || 3.50).toString());
    setFormCustomBonus((emp.customBonus || emp.appointmentBonus || 0).toString());
    setFormStatus(emp.status || 'Pendiente Quincena 1');
    setShowModal(true);
  };

  // Cambiar Bonificación Personalizada directamente en la tabla (Inline Input)
  const handleInlineBonusChange = (id, newBonusValue) => {
    const bonusNum = parseFloat(newBonusValue) || 0;
    setPayroll(payroll.map(emp => {
      if (emp.id === id) {
        const monthly = emp.monthlySalary || (emp.baseSalary ? emp.baseSalary * 2 : 400);
        const workedDays = emp.workedDays || 15;
        const dailyRate = monthly / 30;
        const quincenal = dailyRate * workedDays;
        const extraDaysVal = (emp.extraDays || 0) * dailyRate;
        const extraHoursVal = (emp.extraHours || 0) * (emp.hourlyRate || 3.50);
        const totalPay = quincenal + extraDaysVal + extraHoursVal + bonusNum;

        return {
          ...emp,
          customBonus: bonusNum,
          appointmentBonus: bonusNum,
          totalPeriod: totalPay
        };
      }
      return emp;
    }));
  };

  // Guardar Empleado (Submit Modal)
  const handleSaveEmployeeSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      Swal.fire('Atención', 'Por favor ingresa los nombres y apellidos del empleado.', 'warning');
      return;
    }

    const monthlySalary = parseFloat(formMonthlySalary) || 0;
    const workedDays = parseFloat(formWorkedDays) || 15;
    const extraDays = parseFloat(formExtraDays) || 0;
    const extraHours = parseFloat(formExtraHours) || 0;
    const hourlyRate = parseFloat(formHourlyRate) || 3.50;
    const customBonus = parseFloat(formCustomBonus) || 0;

    const dailySalary = monthlySalary / 30;
    const quincenalSalary = dailySalary * workedDays;
    const extraDaysVal = extraDays * dailySalary;
    const extraHoursVal = extraHours * hourlyRate;
    const totalExtras = extraDaysVal + extraHoursVal;
    const totalPeriod = quincenalSalary + totalExtras + customBonus;

    const empData = {
      id: formId,
      documentId: formDocId,
      name: formName,
      position: formPosition,
      hireDate: formStartDate,
      endDate: formEndDate,
      monthlySalary,
      baseSalary: quincenalSalary,
      workedDays,
      dailySalary,
      quincenalSalary,
      extraDays,
      extraDaysVal,
      extraHours,
      extraHoursVal,
      hourlyRate,
      totalExtras,
      customBonus,
      appointmentBonus: customBonus,
      totalPeriod,
      status: formStatus
    };

    if (editingEmp) {
      setPayroll(payroll.map(p => p.id === editingEmp.id ? empData : p));
      await updatePayrollApi(editingEmp.id, empData);
      Swal.fire('Empleado Actualizado', `Se guardaron las modificaciones de ${formName}.`, 'success');
    } else {
      setPayroll([empData, ...payroll]);
      await createPayrollApi(empData);
      Swal.fire('Empleado Registrado', `Se agregó a ${formName} (${formPosition}) a la nómina oficial.`, 'success');
    }

    setShowModal(false);
  };

  // Eliminar Empleado
  const handleDeleteEmployee = (emp) => {
    Swal.fire({
      title: `¿Eliminar a ${emp.name}?`,
      text: 'Esta acción removerá al empleado de la plantilla de nómina.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Eliminar Empleado',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        setPayroll(payroll.filter(p => p.id !== emp.id));
        await deletePayrollApi(emp.id);
        Swal.fire('Eliminado', 'El empleado ha sido removido.', 'success');
      }
    });
  };

  // Procesar Pago de Nómina (Integrado automáticamente con Flujo de Caja & Gastos)
  const handlePayPayroll = async (emp) => {
    const monthly = emp.monthlySalary || (emp.baseSalary ? emp.baseSalary * 2 : 400);
    const workedDays = emp.workedDays || 15;
    const dailyRate = monthly / 30;
    const quincenal = dailyRate * workedDays;
    const extraDaysVal = (emp.extraDays || 0) * dailyRate;
    const extraHoursVal = (emp.extraHours || 0) * (emp.hourlyRate || 3.50);
    const bonus = emp.customBonus ?? emp.appointmentBonus ?? 0;
    const totalUsd = quincenal + extraDaysVal + extraHoursVal + bonus;
    const totalBsVal = totalUsd * bcvRate;

    Swal.fire({
      title: `¿Procesar Pago de Nómina?`,
      html: `
        <div className="text-left text-xs font-bold space-y-2 p-3 bg-slate-50 dark:bg-[#0d162f] rounded-xl border border-slate-200">
          <p>👤 <strong>Empleado:</strong> ${emp.name}</p>
          <p>💼 <strong>Cargo:</strong> ${emp.position}</p>
          <p>💵 <strong>Sueldo Quincenal:</strong> $${quincenal.toFixed(2)} USD</p>
          <p>🎁 <strong>Bonificación Personalizada:</strong> $${bonus.toFixed(2)} USD</p>
          <p className="text-teal-600 font-extrabold text-sm">Total a Pagar: $${totalUsd.toFixed(2)} USD (${totalBsVal.toFixed(2)} Bs BCV)</p>
          <p className="text-[10px] text-slate-500 font-normal">Este egreso se registrará automáticamente en la sección de Gastos y Flujo de Caja.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0d9488',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Pagar & Registrar en Caja',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        // 1. Actualizar estatus de nómina
        setPayroll(payroll.map(p => p.id === emp.id ? { ...p, status: 'Pagado Quincena' } : p));
        await payPayrollApi(emp.id);

        // 2. Registrar automáticamente el egreso en Flujo de Caja (Módulo 4: BillingCashModule)
        if (setTransactions && Array.isArray(transactions)) {
          const expenseTx = {
            id: `EXP-NOM-${Date.now().toString().slice(-4)}`,
            type: 'EXPENSE',
            category: 'Nómina y Honorarios',
            description: `Pago de Nómina / Honorarios - ${emp.name} (${emp.position}) [Quincena + Bonificación $${bonus}]`,
            amount: totalUsd,
            amountBs: totalBsVal,
            paymentMethod: 'Pago Móvil (Bs)',
            date: new Date().toISOString().split('T')[0],
            bcvRate: bcvRate
          };
          setTransactions([expenseTx, ...transactions]);
        }

        Swal.fire({
          title: '¡Pago de Nómina Exitoso!',
          text: `Se procesó el pago de $${totalUsd.toFixed(2)} USD para ${emp.name} y se estipuló el gasto en el Flujo de Caja.`,
          icon: 'success',
          confirmButtonColor: '#0d9488'
        });
      }
    });
  };

  // Filtrado de Empleados
  const filteredPayroll = payroll.filter(emp => {
    const nameStr = String(emp.name || '').toLowerCase();
    const posStr = String(emp.position || '').toLowerCase();
    const docStr = String(emp.documentId || emp.id || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = nameStr.includes(term) || posStr.includes(term) || docStr.includes(term);
    const matchesStatus = statusFilter === 'ALL' ||
                          (statusFilter === 'PAID' && emp.status.includes('Pagado')) ||
                          (statusFilter === 'PENDING' && !emp.status.includes('Pagado'));

    return matchesSearch && matchesStatus;
  });

  // Métricas de Nómina
  const totalPayrollUsd = payroll.reduce((acc, emp) => {
    const monthly = emp.monthlySalary || (emp.baseSalary ? emp.baseSalary * 2 : 400);
    const workedDays = emp.workedDays || 15;
    const dailyRate = monthly / 30;
    const quincenal = dailyRate * workedDays;
    const extraDaysVal = (emp.extraDays || 0) * dailyRate;
    const extraHoursVal = (emp.extraHours || 0) * (emp.hourlyRate || 3.50);
    const bonus = emp.customBonus ?? emp.appointmentBonus ?? 0;
    return acc + (quincenal + extraDaysVal + extraHoursVal + bonus);
  }, 0);

  const paidPayrollUsd = payroll.filter(e => e.status.includes('Pagado')).reduce((acc, emp) => {
    const monthly = emp.monthlySalary || (emp.baseSalary ? emp.baseSalary * 2 : 400);
    const workedDays = emp.workedDays || 15;
    const dailyRate = monthly / 30;
    const quincenal = dailyRate * workedDays;
    const extraDaysVal = (emp.extraDays || 0) * dailyRate;
    const extraHoursVal = (emp.extraHours || 0) * (emp.hourlyRate || 3.50);
    const bonus = emp.customBonus ?? emp.appointmentBonus ?? 0;
    return acc + (quincenal + extraDaysVal + extraHoursVal + bonus);
  }, 0);

  const pendingPayrollUsd = totalPayrollUsd - paidPayrollUsd;
  const totalPayrollBs = totalPayrollUsd * bcvRate;

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">

      {/* Header Banner */}
      <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
            Módulo 9 • Recursos Humanos & Gastos
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <Users className="text-teal-600 w-7 h-7" />
            Nómina, Bonificaciones Personalizadas & Antigüedad
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Gestión completa de personal, salarios base, horas extras, bonificaciones personalizadas e integración directa con Flujo de Caja.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4" /> + Registrar Nuevo Empleado
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-teal-400" /> Imprimir Planilla Nómina
          </button>
        </div>
      </div>

      {/* KPI Cards Resumen de Nómina */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 block">Total Planilla Nómina ($):</span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">${totalPayrollUsd.toFixed(2)} USD</div>
          <span className="text-[10px] font-mono text-teal-600 font-bold">Equivalente BCV: {totalPayrollBs.toFixed(2)} Bs</span>
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block">Pagado Quincena ($):</span>
          <div className="text-2xl font-black font-mono text-emerald-950 dark:text-emerald-100">${paidPayrollUsd.toFixed(2)} USD</div>
          <span className="text-[10px] font-bold text-emerald-700">Registrado en Flujo de Caja</span>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block">Pendiente por Pagar ($):</span>
          <div className="text-2xl font-black font-mono text-amber-950 dark:text-amber-100">${pendingPayrollUsd.toFixed(2)} USD</div>
          <span className="text-[10px] font-bold text-amber-700">Listo para desembolso</span>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 block">Tasa BCV Aplicada:</span>
          <div className="text-2xl font-black font-mono text-blue-950 dark:text-blue-100">{bcvRate.toFixed(2)} Bs</div>
          <span className="text-[10px] text-slate-500 font-medium">Conversión Oficial BCV</span>
        </div>
      </div>

      {/* Tabla de Empleados y Bonificaciones */}
      <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
        
        {/* Barra de Búsqueda y Filtros */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200 dark:border-[#1e2d5a]">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Plantilla de Personal & Asignación de Bonos
          </h3>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por Nombre, Cédula o Cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
            >
              <option value="ALL">Todos los Estatus</option>
              <option value="PENDING">Pendientes por Pagar</option>
              <option value="PAID">Pagados</option>
            </select>
          </div>
        </div>

        {/* Tabla de Nómina */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1e2d5a]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-[#0d162f] text-slate-800 dark:text-slate-200 font-extrabold border-b border-slate-300 dark:border-[#1e2d5a]">
              <tr>
                <th className="p-3">ID / Cédula</th>
                <th className="p-3">Empleado & Cargo</th>
                <th className="p-3">Antigüedad</th>
                <th className="p-3 text-right">Sueldo Quincenal ($)</th>
                <th className="p-3 text-right">Extras ($)</th>
                <th className="p-3 text-center">Bonificación Personalizada ($)</th>
                <th className="p-3 text-right">Total a Pagar ($ USD)</th>
                <th className="p-3 text-right">Conversión BCV (Bs)</th>
                <th className="p-3 text-center">Estatus</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#1e2d5a] text-slate-900 dark:text-slate-100 font-bold">
              {filteredPayroll.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-6 text-center text-slate-500 font-medium">
                    No se encontraron empleados en la plantilla de nómina.
                  </td>
                </tr>
              ) : (
                filteredPayroll.map(emp => {
                  const monthly = emp.monthlySalary || (emp.baseSalary ? emp.baseSalary * 2 : 400);
                  const workedDays = emp.workedDays || 15;
                  const dailyRate = monthly / 30;
                  const quincenal = dailyRate * workedDays;
                  const extraDaysVal = (emp.extraDays || 0) * dailyRate;
                  const extraHoursVal = (emp.extraHours || 0) * (emp.hourlyRate || 3.50);
                  const totalExtras = extraDaysVal + extraHoursVal;
                  const bonus = emp.customBonus ?? emp.appointmentBonus ?? 0;
                  const totalUsd = quincenal + totalExtras + bonus;
                  const totalBsVal = totalUsd * bcvRate;
                  const isPaid = String(emp.status || '').includes('Pagado');

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-mono">
                        <span className="text-teal-600 font-black block">{emp.id}</span>
                        <span className="text-[10px] text-slate-500">{emp.documentId || 'V-0000000'}</span>
                      </td>

                      <td className="p-3">
                        <div className="font-black text-slate-900 dark:text-white">{emp.name}</div>
                        <div className="text-[10px] text-teal-700 dark:text-teal-300 font-extrabold">{emp.position}</div>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-300 border border-blue-300 font-mono font-bold">
                          {calculateTenure(emp.hireDate)}
                        </span>
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                        ${quincenal.toFixed(2)}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                        +${totalExtras.toFixed(2)}
                      </td>

                      {/* CUADRO EDITABLE DE BONIFICACIÓN PERSONALIZADA (INLINE INPUT) */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-mono text-teal-600 font-black text-xs">$</span>
                          <input
                            type="number"
                            step="1"
                            value={bonus}
                            onChange={(e) => handleInlineBonusChange(emp.id, e.target.value)}
                            className="w-20 px-2 py-1 bg-teal-50 dark:bg-teal-900/30 border border-teal-300 dark:border-teal-700 rounded-lg text-center font-mono font-black text-teal-950 dark:text-teal-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-500"
                            placeholder="0"
                            title="Ingresa la bonificación personalizada en dólares ($)"
                          />
                        </div>
                      </td>

                      <td className="p-3 text-right font-mono font-black text-emerald-900 dark:text-emerald-400 text-sm">
                        ${totalUsd.toFixed(2)}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">
                        {totalBsVal.toFixed(2)} Bs
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          isPaid
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border-amber-300'
                        }`}>
                          {emp.status || 'Pendiente'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {!isPaid && (
                            <button
                              onClick={() => handlePayPayroll(emp)}
                              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg text-[11px] shadow-sm transition-all flex items-center gap-1"
                              title="Pagar nómina y registrar en Flujo de Caja"
                            >
                              <DollarSign className="w-3.5 h-3.5" /> Pagar
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 transition-all"
                            title="Editar Datos del Empleado"
                          >
                            <Edit3 className="w-4 h-4 text-teal-600" />
                          </button>

                          <button
                            onClick={() => handleDeleteEmployee(emp)}
                            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded text-rose-600 transition-all"
                            title="Eliminar Empleado"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REGISTRAR / EDITAR EMPLEADO */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-[#1e2d5a]">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                {editingEmp ? 'Modificar Ficha de Empleado' : 'Registrar Nuevo Empleado en Nómina'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployeeSubmit} className="space-y-4 text-xs font-bold">
              
              {/* FILA 1: ID, Cédula y Cargo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">NRO / ID Correlativo</label>
                  <input
                    type="text"
                    required
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Cédula de Identidad</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: V-24.123.456"
                    value={formDocId}
                    onChange={(e) => setFormDocId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Cargo / Función</label>
                  <select
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Community Manager">Community Manager</option>
                    <option value="Recepción & Atención al Cliente">Recepción & Atención al Cliente</option>
                    <option value="Asistente Dental Principal">Asistente Dental Principal</option>
                    <option value="Administradora & Contador">Administradora & Contador</option>
                    <option value="Mantenimiento & Servicios Generales">Mantenimiento & Servicios Generales</option>
                    <option value="Seguridad & Logística">Seguridad & Logística</option>
                  </select>
                </div>
              </div>

              {/* FILA 2: Nombres y Apellidos */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombres y Apellidos Completos</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Alberto Mendoza"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              {/* FILA 3: Fechas Contrato y Salario Mensual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Inicio de Contrato</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Fin de Contrato</label>
                  <input
                    type="text"
                    placeholder="Indefinido o AAAA-MM-DD"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Salario Mensual ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="400"
                    value={formMonthlySalary}
                    onChange={(e) => setFormMonthlySalary(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono font-black"
                  />
                </div>
              </div>

              {/* FILA 4: Días Trabajados, Horas/Días Extras y Bonificación Inicial */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Días Trabajados</label>
                  <input
                    type="number"
                    value={formWorkedDays}
                    onChange={(e) => setFormWorkedDays(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Días Extras</label>
                  <input
                    type="number"
                    value={formExtraDays}
                    onChange={(e) => setFormExtraDays(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Horas Extras</label>
                  <input
                    type="number"
                    value={formExtraHours}
                    onChange={(e) => setFormExtraHours(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Bono Inicial ($)</label>
                  <input
                    type="number"
                    value={formCustomBonus}
                    onChange={(e) => setFormCustomBonus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-black"
                  />
                </div>
              </div>

              {/* RESUMEN DE CÁLCULO DE PERCEPCIONES */}
              <div className="p-3 bg-teal-50 dark:bg-teal-900/30 border border-teal-300 dark:border-teal-700 rounded-xl space-y-1 text-teal-950 dark:text-teal-200">
                <div className="flex justify-between items-center font-bold">
                  <span>Sueldo Quincenal Estimado:</span>
                  <span className="font-mono text-sm font-black">${((parseFloat(formMonthlySalary)||0)/2).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span>Total Estimado a Pagar (Sueldo + Extras + Bono):</span>
                  <span className="font-mono font-black text-teal-700 dark:text-teal-300">
                    ${(((parseFloat(formMonthlySalary)||0)/2) + (parseFloat(formCustomBonus)||0)).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* BOTONES DE ACCION */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#1e2d5a]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  {editingEmp ? 'Guardar Cambios' : 'Registrar Empleado'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
