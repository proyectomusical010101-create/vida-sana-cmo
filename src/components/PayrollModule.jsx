import React, { useState } from 'react';
import { Users, DollarSign, Award, CheckCircle, FileText, Download, Printer } from 'lucide-react';

export default function PayrollModule({ payroll, setPayroll }) {
  const [selectedEmp, setSelectedEmp] = useState(null);

  const handlePay = (id) => {
    const updated = payroll.map(p => {
      if (p.id === id) {
        return { ...p, status: 'Pagado Quincena 2' };
      }
      return p;
    });
    setPayroll(updated);
  };

  const handlePrintSlip = (emp) => {
    setSelectedEmp(emp);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const totalBase = payroll.reduce((acc, p) => acc + p.baseSalary, 0);
  const totalBonuses = payroll.reduce((acc, p) => acc + p.appointmentBonus, 0);
  const totalPayroll = payroll.reduce((acc, p) => acc + p.totalPeriod, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="text-teal-700 w-7 h-7" />
            Módulo de Nómina & Bonificaciones por Agendamiento
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Control de salarios fijos del personal administrativo, recepcionistas y asistentes dentales + comisiones por agendamiento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] font-bold text-emerald-800 block">Total Nómina Quincenal:</span>
            <span className="text-lg font-extrabold font-mono text-emerald-900">${totalPayroll.toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Total Salarios Base:</span>
          <div className="text-xl font-extrabold font-mono text-slate-900">${totalBase.toFixed(2)}</div>
          <span className="text-[11px] text-slate-400">Sueldo fijo garantizado</span>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Total Bonos por Agendamiento:</span>
          <div className="text-xl font-extrabold font-mono text-emerald-800">+${totalBonuses.toFixed(2)}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Incentivo por atención eficiente</span>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Personal Activo:</span>
          <div className="text-xl font-extrabold text-teal-800">{payroll.length} Colaboradores</div>
          <span className="text-[11px] text-slate-400">Recepción, Asistencia & Administración</span>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden space-y-4 p-6">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="font-extrabold text-slate-900 text-base">Personal Administrativo & Asistentes Dentales</h3>
          <span className="text-xs font-bold text-slate-500">Bono Automático por Agendamiento Incluido</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3">Colaborador / Empleado</th>
                <th className="p-3">Cargo / Función</th>
                <th className="p-3 text-right">Salario Base ($)</th>
                <th className="p-3 text-right">Bono Agendamientos ($)</th>
                <th className="p-3 text-right">Total Quincena ($)</th>
                <th className="p-3 text-center">Estado Comprobante</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900">
              {payroll.map((emp) => {
                const isPaid = emp.status.startsWith('Pagado');
                return (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900 text-sm">{emp.name}</div>
                      <div className="text-[10px] font-mono text-slate-500 font-bold">ID: {emp.id}</div>
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{emp.position}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">${emp.baseSalary.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-emerald-800">
                      +${emp.appointmentBonus.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-emerald-900 text-sm">
                      ${emp.totalPeriod.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                        isPaid 
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => handlePrintSlip(emp)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-700" />
                        Emitir Recibo
                      </button>

                      {!isPaid && (
                        <button
                          onClick={() => handlePay(emp.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm"
                        >
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recibo Printable View */}
      {selectedEmp && (
        <div className="hidden print:block fixed inset-0 bg-white p-8 space-y-6">
          <div className="flex justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold">COMPROBANTE DE PAGO DE NÓMINA</h2>
              <p className="text-xs">Centro Médico Odontológico Vida Sana CMO, C.A. • RIF: J-50781755-5</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold">FECHA: {new Date().toLocaleDateString('es-VE')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded">
            <div><strong>Colaborador:</strong> {selectedEmp.name}</div>
            <div><strong>Cargo:</strong> {selectedEmp.position}</div>
            <div><strong>Cédula ID:</strong> {selectedEmp.id}</div>
            <div><strong>Período:</strong> Segunda Quincena de Agosto 2026</div>
          </div>

          <table className="w-full text-left text-sm border">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-2 border">Concepto</th>
                <th className="p-2 border text-right">Monto ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">Salario Quincenal Base</td>
                <td className="p-2 border text-right font-mono">${selectedEmp.baseSalary.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="p-2 border">Incentivo / Bono por Citas Agendadas</td>
                <td className="p-2 border text-right font-mono">${selectedEmp.appointmentBonus.toFixed(2)}</td>
              </tr>
              <tr className="font-bold bg-slate-50">
                <td className="p-2 border">NETO A COBRAR</td>
                <td className="p-2 border text-right font-mono text-emerald-800">${selectedEmp.totalPeriod.toFixed(2)} USD</td>
              </tr>
            </tbody>
          </table>

          <div className="pt-16 grid grid-cols-2 gap-12 text-center text-xs">
            <div className="border-t pt-2">Firma Empresa (Vida Sana CMO)</div>
            <div className="border-t pt-2">Firma de Conformidad del Empleado</div>
          </div>
        </div>
      )}

    </div>
  );
}
