import React, { useState } from 'react';
import { User, UserCheck, Phone, Mail, Calendar, FileText, Plus, Search, Stethoscope, CheckCircle, Clock, ShieldCheck, Printer, Send, AlertCircle, Edit, Loader2, Trash2, Download } from 'lucide-react';
import Swal from 'sweetalert2';
import { createPatientApi, updatePatientApi, deletePatientApi } from '../api';

export default function PatientsModule({ patients = [], setPatients, specialists = [], setSpecialists, procedures = [], onRegisterProcedure }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('100-01');
  const [activeSubTab, setActiveSubTab] = useState('history');

  // Estado controlado para Recipe Imprimible & Solicitud de Exámenes
  const [medsText, setMedsText] = useState('1. Amoxicilina + Ácido Clavulánico 875mg (1 tab c/12h x 7 días)\n2. Ibuprofeno 600mg (1 tab c/8h si hay dolor)');
  const [medsNotes, setMedsNotes] = useState('Dieta blanda y fría las primeras 24 horas. Evitar enjuagues bucales enérgicos y mantener buena higiene bucal.');
  const [selectedExams, setSelectedExams] = useState(['Radiografía Panorámica', 'Periapical Seriada']);

  // Modal para agregar paciente
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [docId, setDocId] = useState('');
  const [repDocId, setRepDocId] = useState('');
  const [repName, setRepName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('1995-06-15');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientCategory, setPatientCategory] = useState('Privado');
  const [patientSpecialist, setPatientSpecialist] = useState('Dr. Carlos Mendoza');
  const [isSaving, setIsSaving] = useState(false);

  // Modal y estado para EDITAR Paciente
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editPatientForm, setEditPatientForm] = useState({
    name: '',
    documentId: '',
    phone: '',
    email: '',
    category: 'Privado',
    assignedSpecialist: '',
    birthDate: ''
  });

  // Odontograma Estado Pieza
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothStatus, setToothStatus] = useState('Sano');
  const [toothNotes, setToothNotes] = useState('');

  // Presupuesto Unificado - Baremos Seleccionados
  const [quoteProcedures, setQuoteProcedures] = useState([]);
  const [selectedProcToQuote, setSelectedProcToQuote] = useState('PROC-01');
  const [photoTermsAccepted, setPhotoTermsAccepted] = useState(false);

  const safePatients = Array.isArray(patients) && patients.length > 0 ? patients : [
    {
      id: '100-01',
      name: 'Ana Sofía Rodríguez',
      documentId: 'V-25.148.963',
      birthDate: '1992-05-14',
      phone: '+584123456789',
      age: 32,
      category: 'Privado',
      treatmentStartDate: '2026-06-15',
      lastControlDate: '2026-07-28',
      history: [
        { date: '2026-07-28', procedure: 'Resina Fotocurada Superior', doctor: 'Dr. Carlos Mendoza', cost: 45.00, status: 'Completado' },
        { date: '2026-06-15', procedure: 'Profilaxis Profunda', doctor: 'Dr. Carlos Mendoza', cost: 25.00, status: 'Completado' }
      ]
    }
  ];

  const activePatient = safePatients.find(p => p && String(p.id) === String(selectedPatientId)) || safePatients[0] || safePatients[0];

  // Normalizador de Paciente (Soporta camelCase o DB snake_case)
  const pName = String(activePatient?.name || activePatient?.full_name || 'Ana Sofía Rodríguez');
  const pDoc = String(activePatient?.documentId || activePatient?.document_id || activePatient?.rif || 'V-25.148.963');
  const pPhone = String(activePatient?.phone || activePatient?.phone_number || activePatient?.telefono || '+584123456789');
  const pBirthDate = String(activePatient?.birthDate || activePatient?.birth_date || '1992-05-14');
  const pCategory = String(activePatient?.category || 'Privado');
  const pStartDate = String(activePatient?.treatmentStartDate || activePatient?.treatment_start_date || '2026-06-15');
  const pLastControl = String(activePatient?.lastControlDate || activePatient?.last_control_date || '2026-07-28');
  const pHistory = Array.isArray(activePatient?.history) ? activePatient.history : [
    { date: '2026-07-28', procedure: 'Resina Fotocurada Superior', doctor: 'Dr. Carlos Mendoza', cost: 45.00, status: 'Completado' }
  ];

  // Cálculo Dinámico de Edad
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return 30;
    try {
      const today = new Date();
      const birth = new Date(birthDateString);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return (isNaN(age) || age < 0) ? 30 : age;
    } catch (e) {
      return 30;
    }
  };

  // Cálculo de Tiempo Activo en Tratamiento
  const calculateActiveTime = (startDateStr) => {
    if (!startDateStr) return '2 Meses';
    try {
      const start = new Date(startDateStr);
      const today = new Date();
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (isNaN(diffDays) || diffDays < 30) return `${isNaN(diffDays)?30:diffDays} Días`;
      const months = Math.floor(diffDays / 30);
      if (months < 12) return `${months} Meses`;
      const years = (months / 12).toFixed(1);
      return `${years} Años`;
    } catch (e) {
      return '2 Meses';
    }
  };

  // Guardar nuevo paciente
  const handleSavePatientSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const computedAge = calculateAge(patientBirthDate);

    const patientId = `100-${Date.now().toString().slice(-4)}`;

    const patientPayload = {
      id: patientId,
      name: patientName,
      document_id: isMinor ? `V-Menor (${repDocId || 'N/A'})` : docId,
      is_minor: isMinor,
      representative_id: isMinor ? repDocId : '',
      representative_name: isMinor ? repName : '',
      birth_date: patientBirthDate,
      phone: patientPhone,
      email: patientEmail,
      category: patientCategory,
      assigned_specialist: patientSpecialist,
      treatment_start_date: new Date().toISOString().slice(0, 10),
      last_control_date: new Date().toISOString().slice(0, 10)
    };

    try {
      // 1. Guardar en Base de Datos (Supabase)
      const savedPatient = await createPatientApi(patientPayload);
      
      // Mapeos adicionales para compatibilidad local de la interfaz
      const uiPatient = {
        ...savedPatient,
        documentId: savedPatient.document_id || savedPatient.documentId,
        isMinor: savedPatient.is_minor || savedPatient.isMinor,
        birthDate: savedPatient.birth_date || savedPatient.birthDate,
        history: []
      };

      // 2. Actualizar UI Local
      setPatients([uiPatient, ...safePatients]);
      setSelectedPatientId(uiPatient.id);
      setShowAddPatientModal(false);
      
      if (savedPatient.isLocalFallback) {
        Swal.fire({
          title: 'Registro Temporal',
          text: `El expediente se guardó localmente en esta pantalla. (Respuesta de red: ${savedPatient.supabaseErrorMsg || 'Sin conexión'}).`,
          icon: 'warning',
          confirmButtonColor: '#d97706',
          confirmButtonText: 'Entendido'
        });
      } else {
        Swal.fire({
          title: '¡Expediente Guardado!',
          text: `El expediente clínico del paciente ${savedPatient.name || savedPatient.full_name} ha sido registrado exitosamente.`,
          icon: 'success',
          confirmButtonColor: '#0d9488',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error al Guardar',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Abrir Modal Editar Paciente
  const handleOpenEditModal = () => {
    if (!activePatient) return;
    setEditPatientForm({
      name: activePatient.name || activePatient.full_name || '',
      documentId: activePatient.documentId || activePatient.document_id || '',
      phone: activePatient.phone || '',
      email: activePatient.email || '',
      category: activePatient.category || 'Privado',
      assignedSpecialist: activePatient.assignedSpecialist || activePatient.assigned_specialist || 'Dr. Carlos Mendoza',
      birthDate: activePatient.birthDate || activePatient.birth_date || '1995-06-15'
    });
    setShowEditPatientModal(true);
  };

  // Guardar Cambios Editar Paciente
  const handleUpdatePatientSubmit = async (e) => {
    e.preventDefault();
    if (!activePatient) return;
    setIsSaving(true);

    const updatePayload = {
      name: editPatientForm.name,
      document_id: editPatientForm.documentId,
      phone: editPatientForm.phone,
      email: editPatientForm.email,
      category: editPatientForm.category,
      assigned_specialist: editPatientForm.assignedSpecialist,
      birth_date: editPatientForm.birthDate
    };

    try {
      await updatePatientApi(activePatient.id, updatePayload);

      const updatedPatients = safePatients.map(p => {
        if (String(p.id) === String(activePatient.id)) {
          return {
            ...p,
            ...updatePayload,
            documentId: editPatientForm.documentId,
            birthDate: editPatientForm.birthDate,
            assignedSpecialist: editPatientForm.assignedSpecialist
          };
        }
        return p;
      });

      setPatients(updatedPatients);
      setShowEditPatientModal(false);

      Swal.fire({
        title: '¡Expediente Actualizado!',
        text: `Se modificaron exitosamente los datos del paciente ${editPatientForm.name}.`,
        icon: 'success',
        confirmButtonColor: '#0d9488'
      });
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ELIMINAR PACIENTE PERMANENTEMENTE
  const handleDeletePatient = async () => {
    if (!activePatient) return;

    const nameDisplay = activePatient.name || activePatient.full_name || 'este paciente';

    const confirm = await Swal.fire({
      title: '¿Eliminar Expediente Médico?',
      text: `¿Estás seguro de que deseas eliminar permanentemente el expediente de "${nameDisplay}"? Esta acción se borrará de la nube y no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Borrar Expediente',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await deletePatientApi(activePatient.id);
        const remaining = safePatients.filter(p => String(p.id) !== String(activePatient.id));
        setPatients(remaining);

        if (remaining.length > 0) {
          setSelectedPatientId(remaining[0].id);
        }

        Swal.fire({
          title: 'Expediente Borrado',
          text: `El expediente de ${nameDisplay} ha sido eliminado con éxito.`,
          icon: 'success',
          confirmButtonColor: '#0d9488'
        });
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  const filteredPatients = safePatients.filter(p => {
    if (!p) return false;
    const matchesCategory = selectedCategory === 'ALL' || (p.category || 'Privado') === selectedCategory;
    const nameStr = String(p.name || p.full_name || '');
    const docStr = String(p.documentId || p.document_id || '');
    const idStr = String(p.id || '');
    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          docStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          idStr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProcToQuote = () => {
    const proc = (procedures||[]).find(pr => pr.id === selectedProcToQuote);
    if (proc) {
      setQuoteProcedures([...quoteProcedures, proc]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="text-teal-600 w-7 h-7" />
            Módulo de Pacientes & Expedientes Clínicos
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
            Expedientes integrados con soporte para menores de edad, Odontograma 2D y Presupuesto Digital Unificado.
          </p>
        </div>

        <button
          onClick={() => setShowAddPatientModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          +Paciente
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Columna Izquierda: Buscador & Lista de Pacientes */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-5 rounded-2xl space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Nombre, Cédula o Expediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white dark:text-white focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {['ALL', 'Privado', 'Funcionario', 'Convenio', 'Asegurado'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredPatients.map(p => {
              const isSelected = String(p.id) === String(activePatient?.id);
              const nameDisplay = String(p.name || p.full_name || 'Paciente');
              const docDisplay = String(p.documentId || p.document_id || 'N/A');
              const ageDisplay = calculateAge(p.birthDate || p.birth_date);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#17254d] dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded">
                      #{p.id}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700">
                      {p.category || 'Privado'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{nameDisplay}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                    CI: {docDisplay} • {ageDisplay} años
                  </p>
                  {p.isMinor && (
                    <span className="mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 block w-max">
                      👶 Menor de Edad
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Detalle del Expediente Clínico */}
        <div className="lg:col-span-8 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-6">

          {/* Cabecera Ficha Paciente */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1e2d5a]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
                {pName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{pName}</h3>
                  <span className="font-mono text-xs font-bold text-slate-500">Cod: {activePatient?.id || '100-01'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                  Cédula: {pDoc} • Edad: {calculateAge(pBirthDate)} Años • {pCategory}
                </p>
                {activePatient?.isMinor && (
                  <p className="text-xs text-amber-900 font-bold mt-0.5">
                    Representante Legal: {activePatient.representativeName} (CI: {activePatient.representativeId})
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {pPhone && (
                <a
                  href={`https://wa.me/${pPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" /> WhatsApp
                </a>
              )}

              <button
                onClick={handleOpenEditModal}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 shadow-sm transition-all"
              >
                <Edit className="w-3.5 h-3.5 text-teal-600" /> Editar
              </button>

              <button
                onClick={handleDeletePatient}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-extrabold rounded-xl text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Borrar
              </button>
            </div>
          </div>

          {/* Indicadores Clínicos y Seguimiento (Métricas Cabecera) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">Inicio de Tratamiento:</span>
              <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                {pStartDate}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">Último Control / Consulta:</span>
              <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                {pLastControl}
              </span>
            </div>

            <div className="p-3.5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl">
              <span className="text-[11px] font-bold text-teal-900 dark:text-teal-300 block">Tiempo Activo en Tratamiento:</span>
              <span className="text-sm font-extrabold font-mono text-teal-950 dark:text-teal-100">
                {calculateActiveTime(pStartDate)}
              </span>
            </div>
          </div>

          {/* Sub-Navegación de Ficha */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1e2d5a] pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'history' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> 1. Historial & Evolución
            </button>

            <button
              onClick={() => setActiveSubTab('prescription')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'prescription' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" /> 2. Receta Médica & Indicaciones
            </button>

            <button
              onClick={() => setActiveSubTab('exams')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'exams' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-[#300] hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5" /> 3. Solicitud de Exámenes & Rayos X
            </button>
          </div>

          {/* TAB 1: HISTORIAL CLÍNICO */}
          {activeSubTab === 'history' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-[#0d162f] text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-[#1e2d5a]">
                    <tr>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Procedimiento Ejecutado</th>
                      <th className="p-3">Especialista</th>
                      <th className="p-3 text-right">Monto ($)</th>
                      <th className="p-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#1e2d5a] text-slate-900 dark:text-slate-300 font-medium">
                    {pHistory.map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#17254d]">
                        <td className="p-3 font-mono font-semibold">{String(h?.date || h?.created_at || '2026-07-28')}</td>
                        <td className="p-3 font-extrabold text-slate-900">{String(h?.procedure || h?.procedure_name || 'Consulta')}</td>
                        <td className="p-3 text-slate-700">{String(h?.doctor || h?.doctor_name || 'Dr. Carlos Mendoza')}</td>
                        <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${parseFloat(h?.cost || h?.amount || 45).toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            {String(h?.status || 'Completado')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: RECETA MÉDICA & INDICACIONES */}
          {activeSubTab === 'prescription' && (
            <div>
              {/* Formulario Web de Edición (Oculto en Impresión) */}
              <div className="web-only-form p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4 text-xs font-bold">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" /> Emisión de Recipe Médico & Tratamiento Farmacológico
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-slate-700 dark:text-slate-300">Medicamentos Prescritos</label>
                    <textarea
                      rows="3"
                      value={medsText}
                      onChange={(e) => setMedsText(e.target.value)}
                      placeholder="Ej: Amoxicilina 500mg cada 8 horas por 7 días."
                      className="w-full p-2.5 bg-white dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-700 dark:text-slate-300">Indicaciones Generales para el Paciente</label>
                    <textarea
                      rows="2"
                      value={medsNotes}
                      onChange={(e) => setMedsNotes(e.target.value)}
                      placeholder="Indicaciones post-tratamiento, dieta blanda, etc."
                      className="w-full p-2.5 bg-white dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-teal-400" /> Imprimir Recipe Digital
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        Swal.close();
                        window.print();
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Descargar PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* PLANTILLA DE IMPRESIÓN OFICIAL RÉCIPET MÉDICO (SOLO VISIBLE EN PDF / IMPRESIÓN) */}
              <div className="printable-paperwork hidden print:block bg-white text-slate-900 p-8 space-y-6 text-xs border border-slate-200">
                {/* Membrete de la Clínica */}
                <div className="flex justify-between items-start pb-4 border-b-2 border-slate-800">
                  <div>
                    <h1 className="text-lg font-black text-slate-900 uppercase">Centro Médico Odontológico Vida Sana, C.A.</h1>
                    <p className="text-[11px] font-extrabold text-slate-600">RIF: J-50781755-5 | Odontología Especializada & Medicina Integral</p>
                    <p className="text-[10px] text-slate-500 font-medium">Av. Principal, Edif. Vida Sana, Piso 1, Consultorio 102 | Teléfs: +58 412-1234567 / +58 212-9876543</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-teal-900 text-white font-black text-xs rounded uppercase">RÉCIPET MÉDICO</span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Fecha: {new Date().toLocaleDateString('es-VE')}</p>
                  </div>
                </div>

                {/* Datos del Paciente */}
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Paciente:</strong> {selectedPatientObj?.name || 'Paciente'}</div>
                  <div><strong>Cédula:</strong> {selectedPatientObj?.documentId || 'V-00000000'}</div>
                  <div><strong>Categoría:</strong> {selectedPatientObj?.category || 'Privado'}</div>
                  <div><strong>Especialista Tratante:</strong> {selectedPatientObj?.assignedSpecialist || 'Dr. Alejandro Peña'}</div>
                </div>

                {/* Prescripción Médica */}
                <div className="space-y-4 pt-2">
                  <div className="border-b pb-1 border-slate-400 font-extrabold text-sm uppercase text-slate-900">
                    💊 RP / Prescripción Médica:
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap font-mono text-xs font-bold leading-relaxed text-slate-900">
                    {medsText}
                  </div>

                  <div className="border-b pb-1 border-slate-400 font-extrabold text-xs uppercase text-slate-900 pt-2">
                    📋 Indicaciones Tratamiento:
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap font-sans text-xs text-slate-800">
                    {medsNotes}
                  </div>
                </div>

                {/* Firma y Sello Médico */}
                <div className="pt-16 grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="border-t border-slate-800 pt-1 font-bold">Firma del Médico Especialista</div>
                    <p className="text-[10px] text-slate-500">M.P.P.S. 84.920 | Colegio de Odontólogos N° 45.102</p>
                  </div>
                  <div>
                    <div className="border-t border-slate-800 pt-1 font-bold">Sello Oficial Clínica Vida Sana</div>
                    <p className="text-[10px] text-slate-500">Válido en cualquier farmacia a nivel nacional</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SOLICITUD DE EXÁMENES & RAYOS X */}
          {activeSubTab === 'exams' && (
            <div>
              {/* Formulario Web de Edición (Oculto en Impresión) */}
              <div className="web-only-form p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4 text-xs font-bold">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-teal-600" /> Solicitud de Exámenes de Laboratorio e Imagenología
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block mb-1 text-slate-700 dark:text-slate-300">Estudios Solicitados</label>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-white dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl">
                      {[
                        'Radiografía Panorámica',
                        'Periapical Seriada',
                        'Tomografía Cone Beam 3D',
                        'Perfil 20 Pre-operatorio',
                        'Ecografía Abdominal / Cuello',
                        'Cultivo & Antibiograma'
                      ].map(exam => (
                        <label key={exam} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedExams.includes(exam)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedExams([...selectedExams, exam]);
                              } else {
                                setSelectedExams(selectedExams.filter(x => x !== exam));
                              }
                            }}
                            className="w-4 h-4 text-teal-600 rounded"
                          />
                          <span>{exam}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4 text-teal-400" /> Imprimir Solicitud Médica
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        Swal.close();
                        window.print();
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" /> Descargar PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* PLANTILLA DE IMPRESIÓN OFICIAL SOLICITUD DE EXÁMENES (SOLO VISIBLE EN PDF / IMPRESIÓN) */}
              <div className="printable-paperwork hidden print:block bg-white text-slate-900 p-8 space-y-6 text-xs border border-slate-200">
                {/* Membrete de la Clínica */}
                <div className="flex justify-between items-start pb-4 border-b-2 border-slate-800">
                  <div>
                    <h1 className="text-lg font-black text-slate-900 uppercase">Centro Médico Odontológico Vida Sana, C.A.</h1>
                    <p className="text-[11px] font-extrabold text-slate-600">RIF: J-50781755-5 | Odontología Especializada & Medicina Integral</p>
                    <p className="text-[10px] text-slate-500 font-medium">Av. Principal, Edif. Vida Sana, Piso 1, Consultorio 102 | Teléfs: +58 412-1234567 / +58 212-9876543</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-slate-900 text-white font-black text-xs rounded uppercase">SOLICITUD MÉDICA</span>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Fecha: {new Date().toLocaleDateString('es-VE')}</p>
                  </div>
                </div>

                {/* Datos del Paciente */}
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Paciente:</strong> {selectedPatientObj?.name || 'Paciente'}</div>
                  <div><strong>Cédula:</strong> {selectedPatientObj?.documentId || 'V-00000000'}</div>
                  <div><strong>Categoría:</strong> {selectedPatientObj?.category || 'Privado'}</div>
                  <div><strong>Especialista Solicitante:</strong> {selectedPatientObj?.assignedSpecialist || 'Dr. Alejandro Peña'}</div>
                </div>

                {/* Estudios Solicitados */}
                <div className="space-y-3 pt-2">
                  <div className="border-b pb-1 border-slate-400 font-extrabold text-sm uppercase text-slate-900">
                    🔬 Estudios y Pruebas Solicitadas:
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 font-bold text-xs">
                    {selectedExams && selectedExams.length > 0 ? (
                      selectedExams.map(ex => (
                        <div key={ex} className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-slate-800 bg-slate-800 text-white text-[9px] flex items-center justify-center font-black">✓</span>
                          <span>{ex}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No se especificaron estudios adicionales.</p>
                    )}
                  </div>
                </div>

                {/* Firma y Sello Médico */}
                <div className="pt-16 grid grid-cols-2 gap-8 text-center">
                  <div>
                    <div className="border-t border-slate-800 pt-1 font-bold">Firma del Odontólogo / Médico Solicitante</div>
                    <p className="text-[10px] text-slate-500">M.P.P.S. 84.920 | Colegio de Odontólogos N° 45.102</p>
                  </div>
                  <div>
                    <div className="border-t border-slate-800 pt-1 font-bold">Sello Oficial Centro Médico Vida Sana</div>
                    <p className="text-[10px] text-slate-500">Documento de orden médica oficial</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modal Nuevo Expediente / Paciente */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200 dark:border-[#1e2d5a]">
              Registrar Nuevo Paciente (Expediente Clínico)
            </h3>

            <form onSubmit={handleSavePatientSubmit} className="space-y-3.5 text-xs">
              
              {/* Checkbox Menor de Edad */}
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                <span className="font-extrabold text-amber-950">¿Paciente Menor de Edad / Niño?</span>
                <input
                  type="checkbox"
                  checked={isMinor}
                  onChange={(e) => setIsMinor(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Nombre Completo del Paciente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Santiago Andrés Peña"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white dark:text-white"
                />
              </div>

              {!isMinor ? (
                <div>
                  <label className="block font-bold mb-1">Cédula de Identidad del Paciente</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: V-25.148.963"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div>
                    <label className="block font-bold mb-1">Cédula del Representante Legal</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: V-15.632.147"
                      value={repDocId}
                      onChange={(e) => setRepDocId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Nombre del Representante</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Marcos Antonio Peña"
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={patientBirthDate}
                    onChange={(e) => setPatientBirthDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Edad Calculada Dinámicamente</label>
                  <div className="w-full p-2.5 bg-slate-200 border border-slate-300 rounded-lg font-mono font-extrabold text-slate-900">
                    {calculateAge(patientBirthDate)} Años
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Teléfono (WhatsApp)</label>
                  <input
                    type="tel"
                    required
                    placeholder="+584123456789"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Categoría del Paciente</label>
                  <select
                    value={patientCategory}
                    onChange={(e) => setPatientCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white dark:text-white"
                  >
                    <option value="Privado">Privado</option>
                    <option value="Funcionario">Funcionario</option>
                    <option value="Convenio">Convenio</option>
                    <option value="Asegurado">Asegurado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSaving ? 'Guardando en la Nube...' : 'Guardar Expediente Oficial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PACIENTE */}
      {showEditPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Edit className="w-5 h-5 text-teal-600" />
              Editar Expediente Clínico #{activePatient?.id}
            </h3>

            <form onSubmit={handleUpdatePatientSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editPatientForm.name}
                  onChange={(e) => setEditPatientForm({ ...editPatientForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Cédula / Documento</label>
                  <input
                    type="text"
                    required
                    value={editPatientForm.documentId}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, documentId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={editPatientForm.birthDate}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Teléfono (WhatsApp)</label>
                  <input
                    type="text"
                    value={editPatientForm.phone}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
                  <select
                    value={editPatientForm.category}
                    onChange={(e) => setEditPatientForm({ ...editPatientForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-bold"
                  >
                    <option value="Privado">Privado</option>
                    <option value="Funcionario">Funcionario</option>
                    <option value="Convenio">Convenio Empresarial</option>
                    <option value="Asegurado">Asegurado (Póliza)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Especialista Asignado</label>
                <select
                  value={editPatientForm.assignedSpecialist}
                  onChange={(e) => setEditPatientForm({ ...editPatientForm, assignedSpecialist: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-bold"
                >
                  {specialists.length > 0 ? (
                    specialists.map(s => <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>)
                  ) : (
                    <>
                      <option value="Dr. Carlos Mendoza">Dr. Carlos Mendoza (Odontología General)</option>
                      <option value="Dra. Vanessa Rivas">Dra. Vanessa Rivas (Ortodoncia)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#1e2d5a]">
                <button
                  type="button"
                  onClick={() => setShowEditPatientModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
