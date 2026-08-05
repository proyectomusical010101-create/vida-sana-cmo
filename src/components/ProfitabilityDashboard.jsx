import React from 'react';
import { TrendingUp, DollarSign, Award, Percent, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export default function ProfitabilityDashboard({ transactions, casheaTransactions, consultoryRentals, extramuralLabOrders }) {
  
  const totalGrossIncome = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalConsultoryRentals = consultoryRentals.reduce((acc, r) => acc + r.monthlyFee, 0);
  const totalLabRevenue = extramuralLabOrders.reduce((acc, l) => acc + l.patientPrice, 0);
  const totalLabCosts = extramuralLabOrders.reduce((acc, l) => acc + l.labCost, 0);

  const grandTotalRevenue = totalGrossIncome + totalConsultoryRentals + totalLabRevenue;

  // Honorarios Médicos promedio (50%)
  const estimatedSpecialistHonorariums = totalGrossIncome * 0.50;

  // Insumos promedio (15%)
  const estimatedMaterialCosts = totalGrossIncome * 0.15;

  // Utilidad Neta Real
  const netRealProfit = grandTotalRevenue - estimatedSpecialistHonorariums - estimatedMaterialCosts - totalLabCosts;

  const chartData = [
    { name: 'Procedimientos', IngresoBruto: totalGrossIncome, HonorariosMedicos: estimatedSpecialistHonorariums, CostoInsumos: estimatedMaterialCosts, UtilidadNeta: totalGrossIncome * 0.35 },
    { name: 'Alquiler Consultorios', IngresoBruto: totalConsultoryRentals, HonorariosMedicos: 0, CostoInsumos: totalConsultoryRentals * 0.10, UtilidadNeta: totalConsultoryRentals * 0.90 },
    { name: 'Lab Extramuros', IngresoBruto: totalLabRevenue, HonorariosMedicos: 0, CostoInsumos: totalLabCosts, UtilidadNeta: totalLabRevenue - totalLabCosts },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-teal-700 w-7 h-7" />
            Dashboard de Rentabilidad Real & Análisis Margen Neto
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Desglose comparativo de Ingreso Bruto vs Honorarios vs Costos de Materiales vs Utilidad Neta Real.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-300 px-4 py-2.5 rounded-xl text-right">
          <span className="text-xs font-bold text-emerald-900 block">Utilidad Neta Real Clínica:</span>
          <span className="text-xl font-extrabold font-mono text-emerald-950">${netRealProfit.toFixed(2)} USD</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Ingreso Bruto Total:</span>
          <div className="text-xl font-extrabold font-mono text-slate-900">${grandTotalRevenue.toFixed(2)}</div>
          <span className="text-[11px] text-slate-400">Sumatoria general clínica</span>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Honorarios Médicos (50% Est.):</span>
          <div className="text-xl font-extrabold font-mono text-blue-900">-${estimatedSpecialistHonorariums.toFixed(2)}</div>
          <span className="text-[11px] text-blue-700 font-medium">Liquidaciones especialistas</span>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Costo Insumos + Laboratorio:</span>
          <div className="text-xl font-extrabold font-mono text-rose-800">-${(estimatedMaterialCosts + totalLabCosts).toFixed(2)}</div>
          <span className="text-[11px] text-rose-700 font-medium">Descargo stock + prótesis</span>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-1">
          <span className="text-xs text-slate-500 font-bold">Margen de Ganancia Neto:</span>
          <div className="text-xl font-extrabold font-mono text-emerald-900">
            {((netRealProfit / (grandTotalRevenue || 1)) * 100).toFixed(1)}%
          </div>
          <span className="text-[11px] text-emerald-800 font-bold">Rendimiento sobre ingresos</span>
        </div>
      </div>

      {/* Recharts Graphical Analysis */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-700" />
          Análisis Comparativo Financiero por Módulo
        </h3>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#334155" />
              <YAxis stroke="#334155" />
              <Tooltip formatter={(val) => `$${val.toFixed(2)} USD`} />
              <Legend />
              <Bar dataKey="IngresoBruto" name="Ingreso Bruto ($)" fill="#0d9488" />
              <Bar dataKey="HonorariosMedicos" name="Honorarios Médicos ($)" fill="#1d4ed8" />
              <Bar dataKey="CostoInsumos" name="Costo Insumos / Lab ($)" fill="#e11d48" />
              <Bar dataKey="UtilidadNeta" name="Utilidad Neta ($)" fill="#059669" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
