import React, { useState } from 'react';
import { Users, DollarSign, Award, Printer, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function PayrollModule({ payroll, setPayroll }) {
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
    if (years === 0) return `${months} Meses`;
    return `${years} Años, ${months} Meses`;
  };

  const handlePayPayroll = (id) => {
    setPayroll(payroll.map(p => p.id === id ? { ...p, status: 'Pagado Quincena 2' } : p));
    alert('✅ ¡Recibo de nómina procesado y firmado digitalmente!');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="text-teal-600 w-7 h-7" />
            Módulo de Nómina, Bonificaciones & Antigüedad
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Gestión de salarios base, cálculo dinámico de antigüedad del personal y bonos por agendamiento.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Printer className="w-4 h-4" /> Imprimir Comprobantes de Pago
        </button>
      </div>

      {/* Tabla de Nómina */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">
          Personal Administrativo, Asistentes & Recepción
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3">ID Empleado</th>
                <th className="p-3">Nombre Completo</th>
                <th className="p-3">Cargo / Función</th>
                <th className="p-3">Antigüedad Computada</th>
                <th className="p-3 text-right">Sueldo Base ($)</th>
                <th className="p-3 text-right">Bonos Agendamiento ($)</th>
                <th className="p-3 text-right">Total Quincena ($)</th>
                <th className="p-3 text-center">Estado Pago</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
              {payroll.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-700">{emp.id}</td>
                  <td className="p-3 font-extrabold text-slate-900">{emp.name}</td>
                  <td className="p-3 text-slate-700">{emp.position}</td>
                  <td className="p-3 font-mono font-bold text-blue-900">{calculateTenure(emp.hireDate)}</td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">${emp.baseSalary.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-bold text-teal-800">+${emp.appointmentBonus.toFixed(2)}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${emp.totalPeriod.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${
                      emp.status.includes('Pagado')
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {!emp.status.includes('Pagado') && (
                      <button
                        onClick={() => handlePayPayroll(emp.id)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg text-[11px] shadow-sm"
                      >
                        Pagar & Firmar
                      </button>
                    )}
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
