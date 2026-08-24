import React, { useState } from 'react';
import { Landmark, TrendingUp, DollarSign, Smartphone, FileCheck, Truck } from 'lucide-react';
import BillingCashModule from './BillingCashModule';
import CasheaModule from './CasheaModule';
import SpecialistSettlementModule from './SpecialistSettlementModule';
import ConsultoryRentModule from './ConsultoryRentModule';
import ProfitabilityDashboard from './ProfitabilityDashboard';

export default function FinancesConsolidatedModule({
  transactions,
  setTransactions,
  patients,
  specialists,
  procedures,
  casheaTransactions,
  setCasheaTransactions,
  consultoryRentals,
  setConsultoryRentals,
  extramuralLabOrders,
  setExtramuralLabOrders,
  selectedCurrency,
  setSelectedCurrency,
  currencySymbol,
  bcvRateUsd,
  bcvRateEur
}) {
  const [financeTab, setFinanceTab] = useState('cashflow');

  return (
    <div className="space-y-6">
      {/* Header Finanzas */}
      <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="text-teal-600 w-7 h-7" />
            Módulo Consolidado de Finanzas & Contabilidad
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
            Gestión centralizada de balances contables, flujo de caja, liquidación a médicos, cuentas por pagar y proyecciones.
          </p>
        </div>

        {/* Pestanamiento Superior de Finanzas */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-[#0d162f] p-1.5 rounded-xl border border-slate-200 dark:border-[#1e2d5a]">
          <button
            onClick={() => setFinanceTab('cashflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              financeTab === 'cashflow'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            1. Flujo de Caja & Cierre
          </button>

          <button
            onClick={() => setFinanceTab('cashea')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              financeTab === 'cashea'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            2. Cta. por Cobrar (Cashea)
          </button>

          <button
            onClick={() => setFinanceTab('settlements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              financeTab === 'settlements'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            3. Liquidación Médica
          </button>

          <button
            onClick={() => setFinanceTab('rentals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              financeTab === 'rentals'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            4. Alquiler Consultorios
          </button>

          <button
            onClick={() => setFinanceTab('projections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
              financeTab === 'projections'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            5. Proyecciones
          </button>
        </div>
      </div>

      {/* Renderizado de Sub-módulo según Pestaña Financiera */}
      {financeTab === 'cashflow' && (
        <BillingCashModule
          transactions={transactions}
          setTransactions={setTransactions}
          patients={patients}
          specialists={specialists}
          procedures={procedures}
          selectedCurrency={selectedCurrency}
          setSelectedCurrency={setSelectedCurrency}
          currencySymbol={currencySymbol}
          bcvRateUsd={bcvRateUsd}
          bcvRateEur={bcvRateEur}
        />
      )}

      {financeTab === 'cashea' && (
        <CasheaModule
          casheaTransactions={casheaTransactions}
          setCasheaTransactions={setCasheaTransactions}
          specialists={specialists}
        />
      )}

      {financeTab === 'settlements' && (
        <SpecialistSettlementModule
          specialists={specialists}
          transactions={transactions}
          selectedCurrency={selectedCurrency}
          currencySymbol={currencySymbol}
        />
      )}

      {financeTab === 'rentals' && (
        <ConsultoryRentModule
          consultoryRentals={consultoryRentals}
          setConsultoryRentals={setConsultoryRentals}
          specialists={specialists}
          selectedCurrency={selectedCurrency}
          currencySymbol={currencySymbol}
        />
      )}

      {financeTab === 'projections' && (
        <ProfitabilityDashboard
          transactions={transactions}
          casheaTransactions={casheaTransactions}
          consultoryRentals={consultoryRentals}
          extramuralLabOrders={extramuralLabOrders}
          selectedCurrency={selectedCurrency}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
}
