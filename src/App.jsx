import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  UserCheck, Package, DollarSign, Smartphone, TrendingUp,
  Calendar, Truck, FileCheck, Users, MessageSquare, Activity,
  Sun, Moon, Clock, LogOut, Menu, X, ShieldCheck, UserPlus, Lock, Mail, User, Landmark, RefreshCw, Layers, Globe, History, Key, Stethoscope, CheckSquare, Square, Phone, Eye, EyeOff
} from 'lucide-react';

import {
  INITIAL_SPECIALISTS, INITIAL_PATIENTS, INITIAL_INVENTORY,
  INITIAL_PROCEDURES, INITIAL_CASHEA_TRANSACTIONS, INITIAL_TRANSACTIONS_LOG,
  INITIAL_CONSULTORY_RENTALS, INITIAL_EXTRAMURAL_LAB_ORDERS, INITIAL_PAYROLL,
  CLINIC_INFO
} from './mockData';

import {
  fetchPatients,
  fetchProcedures,
  fetchSpecialists,
  fetchCashTransactions,
  fetchCasheaTransactions,
  fetchConsultoryRentals,
  fetchExtramuralLabOrders,
  fetchPayroll,
  fetchInventory,
  fetchAppointmentsApi,
  createUserApi
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
import DentalBudgetOdontogramModule from './components/DentalBudgetOdontogramModule';

// Helper ultra-seguro para convertir cualquier número sin riesgo de crash
const safeNum = (val, fallback = 0) => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
};

class ModuleBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Module Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl space-y-4">
          <h3 className="text-lg font-extrabold text-rose-900 flex items-center gap-2">
            ⚠️ Error Crítico en Módulo
          </h3>
          <p className="text-sm text-rose-700 font-medium">
            Se ha producido un error al cargar este módulo. Por favor toma captura de pantalla de este código:
          </p>
          <pre className="p-4 bg-rose-950 text-rose-200 rounded-xl text-xs overflow-auto font-mono">
            {String(this.state.error)}
            {"\n\n"}
            {String(this.state.errorInfo?.componentStack)}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-sm transition-all"
          >
            Intentar Recargar Módulo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeModule, setActiveModule] = useState('patients');
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tasa de cambio BCV / DolarAPI (USD & EUR)
  const [bcvRateUsd, setBcvRateUsd] = useState(755.90);
  const [bcvRateEur, setBcvRateEur] = useState(879.35);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const fetchGlobalBcvRate = async () => {
    try {
      const [resUsd, resEur] = await Promise.all([
        fetch('https://ve.dolarapi.com/v1/dolares/oficial').then(r => r.json()).catch(() => null),
        fetch('https://ve.dolarapi.com/v1/euros/oficial').then(r => r.json()).catch(() => null)
      ]);
      if (resUsd && resUsd.promedio) {
        setBcvRateUsd(safeNum(resUsd.promedio, 755.90));
      }
      if (resEur && resEur.promedio) {
        setBcvRateEur(safeNum(resEur.promedio, 879.35));
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchGlobalBcvRate();
  }, []);

  const bcvRate = selectedCurrency === 'USD' ? bcvRateUsd : bcvRateEur;

  // Sincronizar el tema en el elemento html para Tailwind darkMode: 'class'
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Modal para Crear Usuario con Permisos en el menú izquierdo
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserDocId, setNewUserDocId] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('123456');
  const [showUserPasswordText, setShowUserPasswordText] = useState(false);
  const [newUserRole, setNewUserRole] = useState('Administrador');
  const [newUserPermissions, setNewUserPermissions] = useState({
    patients: true, baremos: true, schedules: true, billing: true, cashea: true,
    'patient-portal': true, 'roles-audit': true, seniat: true, payroll: true,
    profitability: true, inventory: true, whatsapp: true, 'odontogram-budget': true
  });
  const [userRegisterLoading, setUserRegisterLoading] = useState(false);

  const [specialists, setSpecialists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [casheaTransactions, setCasheaTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [consultoryRentals, setConsultoryRentals] = useState([]);
  const [extramuralLabOrders, setExtramuralLabOrders] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [appointments, setAppointments] = useState([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Cargar datos reales de Supabase (o mockData si falla la conexión)
  const loadDatabaseData = async () => {
    setIsLoadingData(true);
    try {
      const [
        pts, procs, specs, cash, cashea,
        rentals, lab, pay, inv, appts
      ] = await Promise.all([
        fetchPatients().catch(() => INITIAL_PATIENTS),
        fetchProcedures().catch(() => INITIAL_PROCEDURES),
        fetchSpecialists().catch(() => INITIAL_SPECIALISTS),
        fetchCashTransactions().catch(() => INITIAL_TRANSACTIONS_LOG),
        fetchCasheaTransactions().catch(() => INITIAL_CASHEA_TRANSACTIONS),
        fetchConsultoryRentals().catch(() => INITIAL_CONSULTORY_RENTALS),
        fetchExtramuralLabOrders().catch(() => INITIAL_EXTRAMURAL_LAB_ORDERS),
        fetchPayroll().catch(() => INITIAL_PAYROLL),
        fetchInventory().catch(() => INITIAL_INVENTORY),
        fetchAppointmentsApi().catch(() => [])
      ]);

      setPatients(pts || INITIAL_PATIENTS);
      setProcedures(procs || INITIAL_PROCEDURES);
      setSpecialists(specs || INITIAL_SPECIALISTS);
      setTransactions(cash || INITIAL_TRANSACTIONS_LOG);
      setCasheaTransactions(cashea || INITIAL_CASHEA_TRANSACTIONS);
      setConsultoryRentals(rentals || INITIAL_CONSULTORY_RENTALS);
      setExtramuralLabOrders(lab || INITIAL_EXTRAMURAL_LAB_ORDERS);
      setPayroll(pay || INITIAL_PAYROLL);
      setInventory(inv || INITIAL_INVENTORY);
      setAppointments(appts || []);
    } catch (e) {
      console.error("Error cargando base de datos:", e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDatabaseData();
    }
  }, [currentUser]);

  const handleLoginSuccess = (userObj) => {
    const validUser = userObj || { name: 'Administrador Principal', role: 'Administrador' };
    setCurrentUser(validUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      Swal.fire('Atención', 'Por favor ingresa el nombre y correo del usuario.', 'warning');
      return;
    }
    setUserRegisterLoading(true);

    const newUserObj = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: newUserName,
      documentId: newUserDocId,
      phone: newUserPhone,
      email: newUserEmail,
      password: newUserPassword || '123456',
      role: newUserRole,
      permissions: newUserPermissions
    };

    try {
      await createUserApi(newUserObj);
    } catch (err) {}

    setUserRegisterLoading(false);
    setShowUserModal(false);

    Swal.fire({
      title: '¡Usuario Creado Con Éxito!',
      html: `
        <div class="text-left text-xs font-bold space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p>👤 <strong>Usuario:</strong> ${newUserName}</p>
          <p>📧 <strong>Correo:</strong> ${newUserEmail}</p>
          <p>🔑 <strong>Contraseña:</strong> ${newUserPassword || '123456'}</p>
          <p>💼 <strong>Rol:</strong> ${newUserRole}</p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });

    setNewUserName('');
    setNewUserDocId('');
    setNewUserPhone('');
    setNewUserEmail('');
    setNewUserPassword('123456');
    setNewUserRole('Administrador');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleRegisterProcedure = (patientId, procObj, doctorName) => {
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
            { date: todayStr, procedure: procObj?.name || 'Procedimiento', doctor: doctorName || 'Especialista', cost: safeNum(procObj?.price), status: 'Completado' },
            ...(Array.isArray(p.history) ? p.history : [])
          ]
        };
      }
      return p;
    });
    setPatients(updatedPatients);

    alert(`✅ ¡Procedimiento "${procObj?.name}" registrado de forma instantánea!`);
  };

  const handleRegisterPayment = (newTx) => {
    setTransactions([newTx, ...(Array.isArray(transactions) ? transactions : [])]);
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
    { id: 'whatsapp', name: '12. WhatsApp & Cumpleaños', icon: MessageSquare },
    { id: 'odontogram-budget', name: '13. Odontograma, Presupuesto & Firma', icon: Stethoscope, badge: 'EXCLUSIVO' }
  ];

  // Renderizado seguro por módulo
  const renderActiveModule = () => {
    try {
      switch (activeModule) {
        case 'patients':
          return (
            <PatientsModule
              patients={safePatients}
              setPatients={setPatients}
              specialists={safeSpecialists}
              setSpecialists={setSpecialists}
              procedures={safeProcedures}
              onRegisterProcedure={handleRegisterProcedure}
            />
          );
        case 'baremos':
          return <ServicesBaremoModule procedures={safeProcedures} setProcedures={setProcedures} />;
        case 'schedules':
          return <ScheduleCoverageModule specialists={safeSpecialists} />;
        case 'billing':
          return (
            <BillingCashModule
              transactions={safeTransactions}
              setTransactions={setTransactions}
              patients={safePatients}
              specialists={safeSpecialists}
              procedures={safeProcedures}
              onRegisterPayment={handleRegisterPayment}
            />
          );
        case 'cashea':
          return <CasheaModule casheaTransactions={safeCashea} setCasheaTransactions={setCasheaTransactions} specialists={safeSpecialists} />;
        case 'patient-portal':
          return <PublicPatientPortal procedures={safeProcedures} specialists={safeSpecialists} onAddAppointment={(appt) => setAppointments([appt, ...appointments])} />;
        case 'roles-audit':
          return (
            <AuditRolesPortalModule
              patients={safePatients}
              transactions={safeTransactions}
              currentUser={currentUser}
              onOpenCreateUser={() => setShowUserModal(true)}
            />
          );
        case 'seniat':
          return <SpecialistSettlementModule specialists={safeSpecialists} transactions={safeTransactions} />;
        case 'payroll':
          return (
            <PayrollModule
              payroll={safePayroll}
              setPayroll={setPayroll}
              transactions={safeTransactions}
              setTransactions={setTransactions}
              bcvRate={safeNum(bcvRate, 755.90)}
            />
          );
        case 'profitability':
          return <ProfitabilityDashboard transactions={safeTransactions} casheaTransactions={safeCashea} consultoryRentals={safeRentals} extramuralLabOrders={safeLabOrders} />;
        case 'inventory':
          return <InventoryModule inventory={inventory} setInventory={setInventory} procedures={safeProcedures} setProcedures={setProcedures} />;
        case 'whatsapp':
          return <WhatsAppNotificationsModule patients={safePatients} extramuralLabOrders={safeLabOrders} />;
        case 'odontogram-budget':
          return (
            <DentalBudgetOdontogramModule
              patients={safePatients}
              procedures={safeProcedures}
              specialists={safeSpecialists}
              bcvRate={safeNum(bcvRate, 755.90)}
            />
          );
        default:
          return (
            <PatientsModule
              patients={safePatients}
              setPatients={setPatients}
              specialists={safeSpecialists}
              setSpecialists={setSpecialists}
              procedures={safeProcedures}
              onRegisterProcedure={handleRegisterProcedure}
            />
          );
      }
    } catch (e) {
      return (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-2">
          <h3 className="text-base font-extrabold text-slate-900">Módulo Seleccionado</h3>
          <p className="text-xs text-slate-600">Haz clic en cualquiera de los 12 módulos del menú lateral para continuar navegando.</p>
        </div>
      );
    }
  };

  // SI NO HAY SESIÓN ACTIVA -> MUESTRA LA PANTALLA DE LOGIN
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isLight ? 'light-theme bg-slate-100 text-slate-900' : 'dark-theme bg-[#0b1329] text-slate-100'}`}>
      
      {/* Top Navbar */}
      <header className={`px-4 sm:px-6 py-3 border-b flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors z-30 relative ${isLight ? 'bg-white border-slate-200' : 'bg-[#111c3a] border-[#1e2d5a]'}`}>
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20 shrink-0">
              VS
            </div>
            <div>
              <h1 className={`font-extrabold text-sm sm:text-base leading-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{CLINIC_INFO.name}</h1>
              <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>RIF: {CLINIC_INFO.rif}</span>
            </div>
          </div>
        </div>

        {/* ACCIONES EXCLUSIVAS DEL HEADER: La Tasa, +Cita, +Paciente, +Presupuesto + Theme & Logout */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          
          {isLoadingData && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-400 text-xs font-bold">
              <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              Sincronizando Base de Datos...
            </div>
          )}
          
          {/* 1. LA TASA BCV (USD / EUR) */}
          <div className={`flex px-3 py-1.5 rounded-xl border items-center gap-1.5 font-bold ${
            isLight ? 'bg-blue-50 border-blue-200 text-blue-950' : 'bg-[#0d1b3e] border-[#1e346b] text-blue-200'
          }`}>
            <Landmark className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
            <span className="text-[11px] font-sans">BCV:</span>

            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-blue-100/80 dark:bg-blue-900/60 font-black text-xs text-blue-900 dark:text-blue-200 rounded-lg px-1.5 py-0.5 border border-blue-300 dark:border-blue-700 outline-none cursor-pointer hover:bg-blue-200/80 transition-all"
              title="Cambiar Moneda Oficial (USD Dólar / EUR Euro)"
            >
              <option value="USD" className="bg-white dark:bg-[#111c3a] text-slate-900 dark:text-white">USD ($)</option>
              <option value="EUR" className="bg-white dark:bg-[#111c3a] text-slate-900 dark:text-white">EUR (€)</option>
            </select>

            <span className="font-mono font-black text-blue-900 dark:text-blue-300 text-xs">
              {(selectedCurrency === 'USD' ? safeNum(bcvRateUsd, 755.90) : safeNum(bcvRateEur, 879.35)).toFixed(2)} Bs
            </span>
          </div>

          {/* 2. +Cita */}
          <button
            onClick={() => setActiveModule('patient-portal')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs shadow-md transition-all shrink-0"
            title="Ir a Agendamiento de Citas"
          >
            <Calendar className="w-4 h-4" />
            <span>+Cita</span>
          </button>

          {/* 3. +Paciente */}
          <button
            onClick={() => setActiveModule('patients')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-all shrink-0"
            title="Ir al Registro de Pacientes"
          >
            <UserPlus className="w-4 h-4" />
            <span>+Paciente</span>
          </button>

          {/* 4. +Presupuesto */}
          <button
            onClick={() => setActiveModule('odontogram-budget')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl text-xs shadow-md transition-all shrink-0"
            title="Ir a Odontograma & Presupuesto"
          >
            <Stethoscope className="w-4 h-4" />
            <span>+Presupuesto</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border font-bold transition-all ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                : 'bg-[#17254d] hover:bg-[#1e2d5a] text-amber-300 border-[#23376e]'
            }`}
            title="Cambiar Modo Claro / Oscuro"
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-800" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className="p-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-extrabold text-xs shadow-sm transition-all"
          >
            <LogOut className="w-4 h-4 text-rose-700" />
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

          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-[#1e2d5a]">
            {/* BOTÓN CREAR USUARIO AL FINAL DEL MENÚ IZQUIERDO */}
            <button
              onClick={() => setShowUserModal(true)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-white" />
                <span>Crear usuario</span>
              </div>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">+</span>
            </button>

            <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0d162f] border-[#1e2d5a] text-slate-300'
            }`}>
              <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Vida Sana CMO v2.0</div>
              <p className="text-[10px] text-teal-700 font-semibold">Sistema Multidisciplinario</p>
            </div>
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
          <ModuleBoundary key={activeModule}>
            {renderActiveModule()}
          </ModuleBoundary>
        </main>

      </div>

      {/* MODAL CREAR USUARIO CON PERMISOS INDIVIDUALES */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] text-slate-900 dark:text-white w-full max-w-xl p-6 rounded-2xl border border-slate-200 dark:border-[#1e2d5a] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e2d5a]">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                Registrar Nuevo Usuario del Sistema
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg text-xs"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs font-bold">
              
              {/* Nombres y Apellidos */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre y Apellido</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ana María Gutiérrez"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Cédula y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Cédula de Identidad</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: V-19.876.543"
                    value={newUserDocId}
                    onChange={(e) => setNewUserDocId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Teléfono (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+58 412 1234567"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Correo, Contraseña y Rol */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="usuario@vidasanacmo.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Contraseña de Acceso</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showUserPasswordText ? "text" : "password"}
                      required
                      placeholder="123456"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPasswordText(!showUserPasswordText)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showUserPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Rol de Usuario</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Administrador">Administrador Principal</option>
                    <option value="Gerente">Gerente Administrativo</option>
                    <option value="Coordinador">Coordinador de Clínica</option>
                    <option value="Analista">Analista de Sistemas / Finanzas</option>
                    <option value="Recepción">Recepción & Atención</option>
                    <option value="Odontólogo">Odontólogo / Especialista</option>
                    <option value="Asistente Dental">Asistente Dental</option>
                  </select>
                </div>
              </div>

              {/* MATRIZ SELECCIONABLE DE FUNCIONES / MODULOS DEL SISTEMA */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#1e2d5a]">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Funciones y Módulos Autorizados
                  </label>
                  <span className="text-[10px] text-slate-500 font-normal">Marca las casillas que puede usar</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl max-h-48 overflow-y-auto custom-scrollbar">
                  {[
                    { id: 'patients', name: '1. Pacientes & Niños (Expediente)' },
                    { id: 'baremos', name: '2. Baremos & Carga Excel' },
                    { id: 'schedules', name: '3. Horarios & Sustitutos' },
                    { id: 'billing', name: '4. Caja, BCV & Euro' },
                    { id: 'cashea', name: '5. Módulo Cashea' },
                    { id: 'patient-portal', name: '6. Portal Citas Público' },
                    { id: 'roles-audit', name: '7. Roles, Portal Médico & Audit' },
                    { id: 'seniat', name: '8. Retenciones 1% & SENIAT' },
                    { id: 'payroll', name: '9. Nómina & Antigüedad' },
                    { id: 'profitability', name: '10. Rentabilidad, ROI & 10 Años' },
                    { id: 'inventory', name: '11. Inventario & O.C.' },
                    { id: 'whatsapp', name: '12. WhatsApp & Cumpleaños' },
                    { id: 'odontogram-budget', name: '13. Odontograma & Presupuesto' }
                  ].map(mod => (
                    <label key={mod.id} className="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200 text-[11px]">
                      <input
                        type="checkbox"
                        checked={!!newUserPermissions[mod.id]}
                        onChange={(e) => setNewUserPermissions({ ...newUserPermissions, [mod.id]: e.target.checked })}
                        className="w-4 h-4 text-teal-600 rounded"
                      />
                      <span className="truncate">{mod.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* BOTONES DE ACCION */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1e2d5a]">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={userRegisterLoading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  {userRegisterLoading ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
