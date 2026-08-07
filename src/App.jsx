import React, { useState, useEffect } from 'react';
import {
  UserCheck, Package, DollarSign, Smartphone, TrendingUp,
  Calendar, Truck, FileCheck, Users, MessageSquare, Activity,
  Sun, Moon, Clock, LogOut, Menu, X, ShieldCheck, UserPlus, Lock, Mail, User, Landmark, RefreshCw, Layers, Globe, History, Key
} from 'lucide-react';

import {
  INITIAL_SPECIALISTS, INITIAL_PATIENTS, INITIAL_INVENTORY,
  INITIAL_PROCEDURES, INITIAL_CASHEA_TRANSACTIONS, INITIAL_TRANSACTIONS_LOG,
  INITIAL_CONSULTORY_RENTALS, INITIAL_EXTRAMURAL_LAB_ORDERS, INITIAL_PAYROLL,
  CLINIC_INFO
} from './mockData';

import {
  fetchPatients, fetchInventory, fetchProcedures, fetchSpecialists,
  fetchCashTransactions, fetchCasheaTransactions, fetchConsultoryRentals,
  fetchExtramuralLabOrders, fetchPayroll, fetchAppointmentsApi, executeProcedureApi, createCashTransactionApi, registerApi
} from './api';

import LoginScreen from './components/LoginScreen';
import PatientsModule from './components/PatientsModule';
import InventoryModule from './components/InventoryModule';
import BillingCashModule from './components/BillingCashModule';
import CasheaModule from './components/CasheaModule';
import ProfitabilityDashboard from './components/ProfitabilityDashboard';
import ConsultoryRentModule from './components/ConsultoryRentModule';
import ExtramuralLabModule from './components/ExtramuralLabModule';
import SpecialistSettlementModule from './components/SpecialistSettlementModule';
import PayrollModule from './components/PayrollModule';
import WhatsAppNotificationsModule from './components/WhatsAppNotificationsModule';
import AppointmentsModule from './components/AppointmentsModule';

import ServicesBaremoModule from './components/ServicesBaremoModule';
import ScheduleCoverageModule from './components/ScheduleCoverageModule';
import PublicPatientPortal from './components/PublicPatientPortal';
import AuditRolesPortalModule from './components/AuditRolesPortalModule';

// Helper ultra-seguro para convertir cualquier número sin riesgo de crash
const safeNum = (val, fallback = 0) => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState('patients');
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tasa de cambio BCV / DolarAPI
  const [bcvRate, setBcvRate] = useState(755.90);

  const fetchGlobalBcvRate = async () => {
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      const data = await res.json();
      if (data && data.promedio) {
        setBcvRate(safeNum(data.promedio, 755.90));
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchGlobalBcvRate();
  }, []);

  // Modal para registrar nuevo Administrador DENTRO del sistema
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminRegisterLoading, setAdminRegisterLoading] = useState(false);

  const [specialists, setSpecialists] = useState(INITIAL_SPECIALISTS);
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [procedures, setProcedures] = useState(INITIAL_PROCEDURES);
  const [casheaTransactions, setCasheaTransactions] = useState(INITIAL_CASHEA_TRANSACTIONS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS_LOG);
  const [consultoryRentals, setConsultoryRentals] = useState(INITIAL_CONSULTORY_RENTALS);
  const [extramuralLabOrders, setExtramuralLabOrders] = useState(INITIAL_EXTRAMURAL_LAB_ORDERS);
  const [payroll, setPayroll] = useState(INITIAL_PAYROLL);
  const [appointments, setAppointments] = useState([]);

  const loadDbData = async () => {
    try {
      const p = await fetchPatients();
      if (Array.isArray(p) && p.length > 0) setPatients(p);

      const inv = await fetchInventory();
      if (Array.isArray(inv) && inv.length > 0) setInventory(inv);

      const procs = await fetchProcedures();
      if (Array.isArray(procs) && procs.length > 0) setProcedures(procs);

      const specs = await fetchSpecialists();
      if (Array.isArray(specs) && specs.length > 0) setSpecialists(specs);

      const txs = await fetchCashTransactions();
      if (Array.isArray(txs) && txs.length > 0) setTransactions(txs);

      const csh = await fetchCasheaTransactions();
      if (Array.isArray(csh) && csh.length > 0) setCasheaTransactions(csh);

      const r = await fetchConsultoryRentals();
      if (Array.isArray(r) && r.length > 0) setConsultoryRentals(r);

      const l = await fetchExtramuralLabOrders();
      if (Array.isArray(l) && l.length > 0) setExtramuralLabOrders(l);

      const pay = await fetchPayroll();
      if (Array.isArray(pay) && pay.length > 0) setPayroll(pay);

      const appts = await fetchAppointmentsApi();
      if (Array.isArray(appts) && appts.length > 0) setAppointments(appts);
    } catch (err) {
      console.log('Cargando datos');
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDbData();
    }
  }, [currentUser]);

  const handleLoginSuccess = (userObj) => {
    const validUser = userObj || { name: 'Administrador Principal', role: 'Administrador' };
    setCurrentUser(validUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateNewAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminRegisterLoading(true);
    try {
      await registerApi(newAdminName, newAdminEmail, newAdminPassword);
      alert(`✅ ¡Nuevo Administrador "${newAdminName}" registrado con éxito!`);
      setShowAdminModal(false);
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
    } catch (err) {
      alert(`⚠️ Error: ${err.message}`);
    } finally {
      setAdminRegisterLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleRegisterProcedure = async (patientId, procObj, doctorName) => {
    try {
      await executeProcedureApi(patientId, procObj.id, doctorName);
      await loadDbData();
      alert(`✅ ¡Procedimiento "${procObj?.name}" ejecutado! Insumos descontados y datos guardados de forma permanente.`);
    } catch (err) {
      const updatedInventory = [...inventory];
      if (procObj?.materials) {
        procObj.materials.forEach(mat => {
          const invItem = updatedInventory.find(i => i.id === mat.inventoryId || i.name === mat.name);
          if (invItem) {
            invItem.currentStock = Math.max(0, safeNum(invItem.currentStock - mat.quantity));
          }
        });
      }
      setInventory(updatedInventory);

      const todayStr = new Date().toISOString().slice(0, 10);
      const updatedPatients = (Array.isArray(patients) ? patients : []).map(p => {
        if (p.id === patientId) {
          return {
            ...p,
            history: [
              { date: todayStr, procedure: procObj?.name, doctor: doctorName, cost: safeNum(procObj?.price), status: 'Completado' },
              ...(Array.isArray(p.history) ? p.history : [])
            ]
          };
        }
        return p;
      });
      setPatients(updatedPatients);

      alert(`✅ ¡Procedimiento "${procObj?.name}" registrado localmente!`);
    }
  };

  const handleRegisterPayment = async (newTx) => {
    try {
      await createCashTransactionApi(newTx);
      await loadDbData();
    } catch (err) {
      setTransactions([newTx, ...(Array.isArray(transactions) ? transactions : [])]);
    }
  };

  const safeTransactions = Array.isArray(transactions) ? transactions : INITIAL_TRANSACTIONS_LOG;
  const safePatients = Array.isArray(patients) ? patients : INITIAL_PATIENTS;
  const safeSpecialists = Array.isArray(specialists) ? specialists : INITIAL_SPECIALISTS;
  const safeProcedures = Array.isArray(procedures) ? procedures : INITIAL_PROCEDURES;
  const safeCashea = Array.isArray(casheaTransactions) ? casheaTransactions : INITIAL_CASHEA_TRANSACTIONS;
  const safeRentals = Array.isArray(consultoryRentals) ? consultoryRentals : INITIAL_CONSULTORY_RENTALS;
  const safeLabOrders = Array.isArray(extramuralLabOrders) ? extramuralLabOrders : INITIAL_EXTRAMURAL_LAB_ORDERS;
  const safePayroll = Array.isArray(payroll) ? payroll : INITIAL_PAYROLL;

  const totalTodayIncome = safeTransactions.reduce((s, t) => s + safeNum(t?.total || t?.amount), 0);

  const navItems = [
    { id: 'patients', name: '1. Pacientes & Niños (Expediente)', icon: UserCheck },
    { id: 'baremos', name: '2. Baremos & Carga Excel', icon: Layers, badge: 'v2.0' },
    { id: 'schedules', name: '3. Horarios & Sustitutos', icon: Calendar, badge: 'v2.0' },
    { id: 'billing', name: '4. Caja, BCV & Euro', icon: DollarSign },
    { id: 'cashea', name: '5. Módulo Cashea', icon: Smartphone },
    { id: 'patient-portal', name: '6. Portal Citas Público', icon: Globe, badge: 'v2.0' },
    { id: 'roles-audit', name: '7. Roles, Portal Médico & Audit', icon: ShieldCheck, badge: 'v2.0' },
    { id: 'seniat', name: '8. Retenciones 1% & SENIAT', icon: FileCheck },
    { id: 'payroll', name: '9. Nómina & Antigüedad', icon: Users },
    { id: 'profitability', name: '10. Rentabilidad, ROI & 10 Años', icon: TrendingUp },
    { id: 'inventory', name: '11. Inventario & O.C.', icon: Package },
    { id: 'whatsapp', name: '12. WhatsApp & Cumpleaños', icon: MessageSquare }
  ];

  // SI NO HAY SESION ACTIVA -> MUESTRA SIEMPRE LA PANTALLA DE LOGIN
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isLight ? 'light-theme bg-slate-100 text-slate-900' : 'dark-theme bg-[#0b1329] text-slate-100'}`}>
      
      {/* Top Navbar */}
      <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#111c3a] border-[#1e2d5a]'
      }`}>
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
            VS
          </div>
          <div>
            <h1 className={`font-extrabold text-sm sm:text-base leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{CLINIC_INFO.name}</h1>
            <span className={`text-[11px] font-mono font-semibold hidden sm:block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>RIF: {CLINIC_INFO.rif}</span>
          </div>
        </div>

        {/* User Admin Badge + BCV Rate Badge + Global Info Pills + Theme Toggle + Logout */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          
          {/* Live BCV DolarAPI Pill */}
          <div className={`hidden md:flex px-3 py-1.5 rounded-xl border items-center gap-2 font-bold ${
            isLight ? 'bg-blue-50 border-blue-200 text-blue-950' : 'bg-[#0d1b3e] border-[#1e346b] text-blue-200'
          }`}>
            <Landmark className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span className="text-[11px] font-sans">BCV (DolarAPI):</span>
            <span className="font-mono font-extrabold text-blue-900 dark:text-blue-300 text-xs">{safeNum(bcvRate, 755.90).toFixed(2)} Bs</span>
          </div>

          <div className={`hidden lg:flex px-3.5 py-1.5 rounded-xl border items-center gap-2 font-bold ${
            isLight ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-[#0d162f] border-[#1e2d5a]'
          }`}>
            <Activity className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>Ingresos Hoy:</span>
            <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
              ${safeNum(totalTodayIncome, 0).toFixed(2)}
            </span>
          </div>

          {/* Botón Registrar Nuevo Administrador */}
          <button
            onClick={() => setShowAdminModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 font-extrabold rounded-xl border border-teal-300 text-xs shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4 text-teal-700" />
            <span className="hidden md:inline">+ Registrar Administrador</span>
          </button>

          {/* Logged User Badge */}
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl text-teal-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <div className="text-left hidden sm:block">
              <div className="text-xs leading-none font-extrabold text-slate-900">{currentUser?.name || 'Administrador Principal'}</div>
              <div className="text-[10px] text-teal-700 font-semibold">{currentUser?.role || 'Administrador'}</div>
            </div>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                : 'bg-[#17254d] hover:bg-[#1e2d5a] text-amber-300 border-[#23376e]'
            }`}
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-slate-800" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-extrabold text-xs shadow-sm transition-all"
          >
            <LogOut className="w-4 h-4 text-rose-700" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className={`w-64 border-r p-4 space-y-4 flex flex-col justify-between hidden lg:flex transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#111c3a] border-[#1e2d5a]'
        }`}>
          <div className="space-y-1">
            <div className={`text-[11px] font-extrabold uppercase tracking-wider px-3 mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Módulos del Sistema v2.0
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md'
                      : isLight
                        ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-[#17254d] font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 border-amber-500'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0d162f] border-[#1e2d5a] text-slate-300'
          }`}>
            <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Vida Sana CMO v2.0</div>
            <p className="text-[10px] text-teal-700 font-semibold">Sistema Multidisciplinario</p>
          </div>
        </aside>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden flex">
            <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 space-y-4 border-r border-slate-200 shadow-2xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">Módulos del Sistema</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500 hover:text-slate-800">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[75vh] custom-scrollbar">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveModule(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Module Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {activeModule === 'patients' && (
            <PatientsModule
              patients={safePatients}
              setPatients={setPatients}
              specialists={safeSpecialists}
              setSpecialists={setSpecialists}
              procedures={safeProcedures}
              onRegisterProcedure={handleRegisterProcedure}
            />
          )}

          {activeModule === 'baremos' && (
            <ServicesBaremoModule
              procedures={safeProcedures}
              setProcedures={setProcedures}
            />
          )}

          {activeModule === 'schedules' && (
            <ScheduleCoverageModule
              specialists={safeSpecialists}
            />
          )}

          {activeModule === 'billing' && (
            <BillingCashModule
              transactions={safeTransactions}
              setTransactions={setTransactions}
              patients={safePatients}
              specialists={safeSpecialists}
              procedures={safeProcedures}
              onRegisterPayment={handleRegisterPayment}
            />
          )}

          {activeModule === 'cashea' && (
            <CasheaModule
              casheaTransactions={safeCashea}
              setCasheaTransactions={setCasheaTransactions}
              specialists={safeSpecialists}
            />
          )}

          {activeModule === 'patient-portal' && (
            <PublicPatientPortal
              procedures={safeProcedures}
              specialists={safeSpecialists}
              onAddAppointment={(appt) => setAppointments([appt, ...appointments])}
            />
          )}

          {activeModule === 'roles-audit' && (
            <AuditRolesPortalModule
              patients={safePatients}
              transactions={safeTransactions}
              currentUser={currentUser}
            />
          )}

          {activeModule === 'seniat' && (
            <SpecialistSettlementModule
              specialists={safeSpecialists}
              transactions={safeTransactions}
            />
          )}

          {activeModule === 'payroll' && (
            <PayrollModule
              payroll={safePayroll}
              setPayroll={setPayroll}
            />
          )}

          {activeModule === 'profitability' && (
            <ProfitabilityDashboard
              transactions={safeTransactions}
              casheaTransactions={safeCashea}
              consultoryRentals={safeRentals}
              extramuralLabOrders={safeLabOrders}
            />
          )}

          {activeModule === 'inventory' && (
            <InventoryModule
              inventory={inventory}
              setInventory={setInventory}
              procedures={safeProcedures}
              setProcedures={setProcedures}
            />
          )}

          {activeModule === 'whatsapp' && (
            <WhatsAppNotificationsModule
              patients={safePatients}
              extramuralLabOrders={safeLabOrders}
            />
          )}
        </main>

      </div>

      {/* MODAL CREAR NUEVO ADMINISTRADOR */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                Registrar Nuevo Usuario Administrador
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg text-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewAdminSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700">Nombre Completo del Administrador</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lic. Carlos Andrés Peña"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Correo Electrónico Corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="nuevo.admin@vidasana.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">Contraseña de Acceso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                <span className="text-teal-900 font-bold">Rol Asignado:</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
                  Administrador Principal
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adminRegisterLoading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg shadow-sm"
                >
                  {adminRegisterLoading ? 'Guardando en DB...' : 'Guardar Administrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
