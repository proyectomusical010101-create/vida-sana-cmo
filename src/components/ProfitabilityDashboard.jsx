import React, { useState } from 'react';
import { TrendingUp, DollarSign, PieChart, BarChart3, Calculator, ArrowUpRight, Plus, Calendar, ShieldCheck } from 'lucide-react';
import { INITIAL_EXPENSES } from '../mockData';

export default function ProfitabilityDashboard({ transactions, casheaTransactions, consultoryRentals, extramuralLabOrders }) {
  const [activeTab, setActiveTab] = useState('margins'); // 'margins' | 'expenses' | 'projections' | 'roi'

  // Gastos Estructurados
  const [expensesList, setExpensesList] = useState(INITIAL_EXPENSES);
  const [expCategory, setExpCategory] = useState('Servicios Públicos');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('150');

  // Calculadora ROI / Punto de Equilibrio
  const [fixedCostsMonthly, setFixedCostsMonthly] = useState('2500'); // Costos fijos mensuales USD
  const [avgServicePrice, setAvgServicePrice] = useState('45'); // Precio promedio por servicio USD
  const [avgMaterialCostPerService, setAvgMaterialCostPerService] = useState('8'); // Costo insumos por servicio

  const handleAddExpenseSubmit = (e) => {
    e.preventDefault();
    const newExp = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      category: expCategory,
      description: expDesc || 'Gasto Operativo',
      amount: parseFloat(expAmount) || 0,
      date: new Date().toISOString().slice(0, 10)
    };
    setExpensesList([newExp, ...expensesList]);
    setExpDesc('');
    setExpAmount('');
    alert('✅ ¡Gasto registrado en la contabilidad!');
  };

  const totalGrossIncome = transactions.reduce((acc, t) => acc + t.total, 0) +
                           casheaTransactions.reduce((acc, c) => acc + c.totalAmount, 0);

  const totalExpenses = expensesList.reduce((acc, e) => acc + e.amount, 0);
  const netUtility = totalGrossIncome - totalExpenses;

  // Cálculo de Punto de Equilibrio
  const fc = parseFloat(fixedCostsMonthly) || 0;
  const p = parseFloat(avgServicePrice) || 1;
  const vc = parseFloat(avgMaterialCostPerService) || 0;
  const marginPerUnit = Math.max(1, p - vc);
  const breakEvenPatientsMonthly = Math.ceil(fc / marginPerUnit);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <TrendingUp className="text-teal-600 w-7 h-7" />
            Dashboard de Rentabilidad, Proyecciones Financieras & Calculadora ROI
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Análisis de margen neto por especialidad, control de gastos estructurados y proyecciones a 10 años.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('margins')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'margins' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          1. Margen Neto por Especialidad
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'expenses' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          2. Gastos Estructurados & Flujo Caja
        </button>

        <button
          onClick={() => setActiveTab('projections')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'projections' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          3. Proyecciones (3 Meses a 10 Años)
        </button>

        <button
          onClick={() => setActiveTab('roi')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'roi' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          4. Calculadora ROI & Punto de Equilibrio
        </button>
      </div>

      {/* TAB 1: MARGEN NETO */}
      {activeTab === 'margins' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-600">Ingreso Bruto Total:</span>
              <div className="text-2xl font-extrabold font-mono text-slate-900">${totalGrossIncome.toFixed(2)} USD</div>
            </div>

            <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-600">Gastos Operativos Totales:</span>
              <div className="text-2xl font-extrabold font-mono text-rose-900">-${totalExpenses.toFixed(2)} USD</div>
            </div>

            <div className="p-5 bg-emerald-50 border border-emerald-300 shadow-sm rounded-2xl space-y-1">
              <span className="text-xs font-bold text-emerald-900">Utilidad Neta Real:</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-950">${netUtility.toFixed(2)} USD</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GASTOS ESTRUCTURADOS */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">
              Registrar Gasto Estructurado Operativo
            </h3>

            <form onSubmit={handleAddExpenseSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Categoría del Gasto</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                >
                  <option value="Servicios Públicos">Servicios Públicos (Luz/Agua/Internet)</option>
                  <option value="Alquileres">Alquileres de Sede</option>
                  <option value="Inversiones">Inversiones & Equipamiento</option>
                  <option value="Compras de Insumos">Compras de Insumos</option>
                  <option value="Gastos Administrativos">Gastos Administrativos</option>
                  <option value="Publicidad / Marketing">Publicidad / Marketing</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">Descripción del Gasto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Canon de arrendamiento local comercial"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Monto ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-sm"
                >
                  Guardar Gasto Estructurado
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Historial de Gastos Estructurados</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-3">ID Gasto</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Descripción</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3 text-right">Monto ($ USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
                  {expensesList.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{exp.id}</td>
                      <td className="p-3 font-extrabold text-slate-900">{exp.category}</td>
                      <td className="p-3 text-slate-700">{exp.description}</td>
                      <td className="p-3 font-mono text-slate-600">{exp.date}</td>
                      <td className="p-3 text-right font-mono font-extrabold text-rose-900">${exp.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROYECCIONES FINANCIERAS */}
      {activeTab === 'projections' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">
            Motor de Proyecciones Financieras de Flujo de Caja
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-600">Proyección a 3 Meses:</span>
              <div className="text-2xl font-extrabold font-mono text-teal-900">${(totalGrossIncome * 3).toFixed(2)} USD</div>
              <p className="text-[11px] text-slate-500 font-medium">Ingresos estimados para el próximo trimestre.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-600">Proyección a 12 Meses (1 Año):</span>
              <div className="text-2xl font-extrabold font-mono text-teal-900">${(totalGrossIncome * 12).toFixed(2)} USD</div>
              <p className="text-[11px] text-slate-500 font-medium">Flujo anual acumulado esperado.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-600">Proyección a 5 Años (Largo Plazo):</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-900">${(totalGrossIncome * 60).toFixed(2)} USD</div>
              <p className="text-[11px] text-slate-500 font-medium">Crecimiento estimado a 5 años de la clínica.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CALCULADORA ROI & PUNTO DE EQUILIBRIO */}
      {activeTab === 'roi' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-teal-600" />
            Calculadora de Punto de Equilibrio & Retorno de Inversión (ROI)
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Costos Fijos Mensuales ($ USD)</label>
                <input
                  type="number"
                  value={fixedCostsMonthly}
                  onChange={(e) => setFixedCostsMonthly(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Precio Promedio por Servicio ($ USD)</label>
                <input
                  type="number"
                  value={avgServicePrice}
                  onChange={(e) => setAvgServicePrice(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Costo Estimado Insumos por Servicio ($ USD)</label>
                <input
                  type="number"
                  value={avgMaterialCostPerService}
                  onChange={(e) => setAvgMaterialCostPerService(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="lg:col-span-6 p-6 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-extrabold text-teal-900 uppercase tracking-wider block mb-1">
                  Resultado del Punto de Equilibrio
                </span>
                <div className="text-4xl font-extrabold text-teal-950 font-mono">
                  {breakEvenPatientsMonthly} Pacientes / Mes
                </div>
                <p className="text-xs text-teal-900 font-semibold mt-2">
                  Es la cantidad exacta de tratamientos que el Centro Médico Vida Sana debe realizar cada mes para cubrir el 100% de los costos fijos.
                </p>
              </div>

              <div className="pt-3 border-t border-teal-300 text-xs font-bold text-teal-950 flex justify-between">
                <span>Margen Neto Unitario por Servicio:</span>
                <span className="font-mono text-sm font-extrabold">${marginPerUnit.toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
