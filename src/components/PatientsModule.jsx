import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, Search, Phone, Mail, FileText, Calendar, Award, ShieldAlert, CheckCircle, ChevronRight, UserCheck, MessageSquare, UserCheck2, Activity, PenTool, FileSignature, RefreshCw, Users, Stethoscope } from 'lucide-react';
import { createSpecialistApi, fetchOdontogramApi, saveOdontogramToothApi, fetchConsentsApi, saveConsentApi } from '../api';

export default function PatientsModule({ patients, setPatients, specialists, setSpecialists, procedures, onRegisterProcedure }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todos');
  const [selectedPatient, setSelectedPatient] = useState(patients[0] || null);

  const [activeSubTab, setActiveSubTab] = useState('expediente'); // 'expediente' | 'odontogram' | 'consents'

  // Modal para ver Directorio de Médicos
  const [showDoctorDirectoryModal, setShowDoctorDirectoryModal] = useState(false);

  // Form para nuevo paciente
  const [showNewModal, setShowNewModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    documentId: '',
    phone: '',
    email: '',
    age: '',
    category: 'Privado',
    assignedSpecialist: specialists[0]?.name || ''
  });

  // Form para nuevo especialista
  const [showNewDoctorModal, setShowNewDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialty: 'Odontología General',
    rIF: 'V-20123456-0',
    privadoRate: '50',
    funcionarioRate: '45',
    convenioRate: '40',
    aseguradoRate: '45'
  });

  // Modal para ejecutar procedimiento
  const [showExecModal, setShowExecModal] = useState(false);
  const [selectedProcId, setSelectedProcId] = useState(procedures[0]?.id || '');
  const [execDoctor, setExecDoctor] = useState(specialists[0]?.name || '');

  // State Odontograma
  const [odontogramData, setOdontogramData] = useState({});
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothStatusInput, setToothStatusInput] = useState('Sano');
  const [toothNotesInput, setToothNotesInput] = useState('');

  // State Consentimientos con Firma
  const [patientConsents, setPatientConsents] = useState([]);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentTitle, setConsentTitle] = useState('Consentimiento Informado Odontología General & Cirugía');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const loadPatientSubdata = async (pId) => {
    if (!pId) return;
    const odRows = await fetchOdontogramApi(pId);
    const odMap = {};
    odRows.forEach(r => {
      odMap[r.toothNumber] = { status: r.status, notes: r.notes };
    });
    setOdontogramData(odMap);

    const cnsRows = await fetchConsentsApi(pId);
    setPatientConsents(cnsRows);
  };

  useEffect(() => {
    if (selectedPatient) {
      loadPatientSubdata(selectedPatient.id);
    }
  }, [selectedPatient]);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.documentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'Todos' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleAddPatient = (e) => {
    e.preventDefault();
    const nextNum = patients.length + 1;
    const newId = `100-${nextNum.toString().padStart(2, '0')}`;
    const created = {
      ...newPatient,
      id: newId,
      age: parseInt(newPatient.age) || 30,
      history: []
    };
    setPatients([created, ...patients]);
    setSelectedPatient(created);
    setShowNewModal(false);
    setNewPatient({ name: '', documentId: '', phone: '', email: '', age: '', category: 'Privado', assignedSpecialist: specialists[0]?.name || '' });
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    const docData = {
      name: newDoctor.name,
      specialty: newDoctor.specialty,
      rIF: newDoctor.rIF,
      commissionRates: {
        Privado: parseFloat(newDoctor.privadoRate) || 50,
        Funcionario: parseFloat(newDoctor.funcionarioRate) || 45,
        Convenio: parseFloat(newDoctor.convenioRate) || 40,
        Asegurado: parseFloat(newDoctor.aseguradoRate) || 45
      }
    };

    try {
      const created = await createSpecialistApi(docData);
      setSpecialists([...specialists, created]);
      alert(`✅ ¡Médico Especialista "${created.name}" registrado e integrado a la Base de Datos SQLite!`);
    } catch (err) {
      const nextId = `DOC-${(specialists.length + 1).toString().padStart(2, '0')}`;
      const created = { id: nextId, ...docData };
      setSpecialists([...specialists, created]);
    }
    setShowNewDoctorModal(false);
    setNewDoctor({ name: '', specialty: 'Odontología General', rIF: 'V-20123456-0', privadoRate: '50', funcionarioRate: '45', convenioRate: '40', aseguradoRate: '45' });
  };

  const handleExecuteProcedureSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const procObj = procedures.find(p => p.id === selectedProcId);
    if (!procObj) return;

    onRegisterProcedure(selectedPatient.id, procObj, execDoctor);
    setShowExecModal(false);
  };

  // Odontograma handlers
  const handleSaveTooth = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedTooth) return;
    await saveOdontogramToothApi(selectedPatient.id, selectedTooth, toothStatusInput, toothNotesInput);
    setOdontogramData(prev => ({
      ...prev,
      [selectedTooth]: { status: toothStatusInput, notes: toothNotesInput }
    }));
    setSelectedTooth(null);
  };

  // Signature Canvas Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveConsent = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedPatient) return;
    const signaturePng = canvas.toDataURL('image/png');
    const created = await saveConsentApi(selectedPatient.id, selectedPatient.name, consentTitle, signaturePng);
    setPatientConsents([created, ...patientConsents]);
    setShowConsentModal(false);
    alert('✅ Consentimiento firmado guardado exitosamente en SQLite.');
  };

  const activeDoctorObj = specialists.find(s => s.name === (selectedPatient?.assignedSpecialist || specialists[0]?.name));
  const currentCommission = activeDoctorObj ? (activeDoctorObj.commissionRates[selectedPatient?.category || 'Privado'] || 50) : 50;

  const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  const getToothColor = (st) => {
    switch (st) {
      case 'Caries': return 'bg-rose-500 text-white border-rose-600';
      case 'Resina': return 'bg-blue-600 text-white border-blue-700';
      case 'Endodoncia': return 'bg-purple-600 text-white border-purple-700';
      case 'Ausente': return 'bg-slate-300 text-slate-600 border-slate-400 line-through';
      case 'Corona': return 'bg-amber-500 text-white border-amber-600';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
    }
  };

  const calculateOdontogramBudget = () => {
    let total = 0;
    Object.values(odontogramData).forEach(item => {
      if (item.status === 'Caries') total += 45;
      if (item.status === 'Endodoncia') total += 120;
      if (item.status === 'Corona') total += 180;
    });
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="text-teal-600 w-7 h-7" />
            Módulo de Pacientes, Odontograma & Consentimientos Digitales
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Expedientes clínicos integrados con Odontograma 2D interactivo y firma digital de consentimientos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Ver Directorio de Médicos */}
          <button
            onClick={() => setShowDoctorDirectoryModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-xl border border-blue-200 text-xs shadow-sm transition-all"
          >
            <Stethoscope className="w-4 h-4 text-blue-700" />
            Directorio Médicos ({specialists.length})
          </button>

          <button
            onClick={() => setShowNewDoctorModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl border border-slate-300 text-xs shadow-sm transition-all"
          >
            <UserCheck2 className="w-4 h-4 text-teal-700" />
            + Registrar Médico
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Expediente
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Filters & List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por Nombre, Cédula o Expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {['Todos', 'Privado', 'Funcionario', 'Convenio', 'Asegurado'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategoryFilter === cat
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden divide-y divide-slate-200 max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredPatients.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No se encontraron expedientes con el criterio ingresado.
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = selectedPatient?.id === patient.id;
                return (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-teal-50 border-l-4 border-teal-600'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                          #{patient.id}
                        </span>
                        <span className="font-extrabold text-slate-900 text-sm">{patient.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                        <span>CI: {patient.documentId}</span>
                        <span>•</span>
                        <span>{patient.age} años</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        patient.category === 'Privado' ? 'bg-teal-100 text-teal-800 border border-teal-300' :
                        patient.category === 'Funcionario' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        patient.category === 'Convenio' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}>
                        {patient.category}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-teal-600 translate-x-0.5' : 'text-slate-400'}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Expediente + Tabs */}
        <div className="lg:col-span-8 space-y-4">
          {selectedPatient ? (
            <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                    {selectedPatient.name.split(' ').map(n=>n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-900">{selectedPatient.name}</h3>
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                        Cod: {selectedPatient.id}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mt-0.5 font-medium">
                      Cédula: <span className="text-slate-900 font-mono font-bold">{selectedPatient.documentId}</span> • {selectedPatient.age} Años • <span className="text-teal-700 font-bold">{selectedPatient.category}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${selectedPatient.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(selectedPatient.name)},%20le%20escribimos%20del%20Centro%20M%C3%A9dico%20Odontol%C3%B3gico%20Vida%20Sana%20CMO`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  WhatsApp Directo
                </a>
              </div>

              {/* Navigation Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setActiveSubTab('expediente')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeSubTab === 'expediente'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  1. Historial Clínico
                </button>

                <button
                  onClick={() => setActiveSubTab('odontogram')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeSubTab === 'odontogram'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  2. Odontograma 2D Interactivo
                </button>

                <button
                  onClick={() => setActiveSubTab('consents')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    activeSubTab === 'consents'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileSignature className="w-4 h-4" />
                  3. Consentimientos Firmados ({patientConsents.length})
                </button>
              </div>

              {/* TAB 1: HISTORIAL CLINICO */}
              {activeSubTab === 'expediente' && (
                <div className="space-y-6">
                  {/* Dynamic Honorarium & Category Banner */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-xs text-slate-600 font-bold">Categoría de Paciente:</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-teal-700">{selectedPatient.category}</span>
                        <span className="text-xs text-slate-500 font-medium">Tarifas personalizadas</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-xs text-slate-600 font-bold">Comisión Automática Especialista:</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-emerald-700">{currentCommission}% para el Médico</span>
                        <span className="text-xs text-slate-500 font-medium">{100 - currentCommission}% Vida Sana</span>
                      </div>
                    </div>
                  </div>

                  {/* History & Procedures Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600" />
                        Historial Cronológico de Procedimientos
                      </h4>
                      <button
                        onClick={() => setShowExecModal(true)}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        + Registrar Procedimiento
                      </button>
                    </div>

                    <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
                      {selectedPatient.history.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-xs">
                          No hay procedimientos registrados en el historial de este expediente.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                            <tr>
                              <th className="p-3">Fecha</th>
                              <th className="p-3">Procedimiento Ejecutado</th>
                              <th className="p-3">Especialista</th>
                              <th className="p-3 text-right">Monto ($)</th>
                              <th className="p-3 text-center">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 text-slate-900">
                            {selectedPatient.history.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-3 font-mono text-slate-600 font-medium">{item.date}</td>
                                <td className="p-3 font-bold text-slate-900">{item.procedure}</td>
                                <td className="p-3 text-slate-700 font-medium">{item.doctor}</td>
                                <td className="p-3 text-right font-mono font-extrabold text-emerald-700">${item.cost.toFixed(2)}</td>
                                <td className="p-3 text-center">
                                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-bold">
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ODONTOGRAMA */}
              {activeSubTab === 'odontogram' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-600" />
                        Mapa Anatómico Odontológico (Piezas 11 a 48)
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Haga clic sobre cualquier pieza dental para actualizar su estado de salud o tratamiento.
                      </p>
                    </div>

                    <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3.5 py-2 rounded-xl text-right">
                      <div className="text-[10px] font-bold text-emerald-700">Presupuesto Sugerido Odontograma:</div>
                      <div className="text-base font-extrabold font-mono text-emerald-800">${calculateOdontogramBudget().toFixed(2)} USD</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold bg-white p-3 rounded-lg border border-slate-200">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Sano</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Caries</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600"></span> Resina</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-600"></span> Endodoncia</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Corona</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400"></span> Ausente</span>
                  </div>

                  <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <div className="space-y-2">
                      <div className="text-center text-xs font-extrabold text-slate-600 uppercase tracking-wider">Arcada Superior (Maxilar)</div>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {upperTeeth.map(tNum => {
                          const item = odontogramData[tNum] || { status: 'Sano' };
                          return (
                            <button
                              key={tNum}
                              onClick={() => {
                                setSelectedTooth(tNum);
                                setToothStatusInput(item.status || 'Sano');
                                setToothNotesInput(item.notes || '');
                              }}
                              className={`w-10 h-14 rounded-xl border flex flex-col items-center justify-between p-1 transition-transform hover:scale-105 shadow-sm ${getToothColor(item.status)}`}
                            >
                              <span className="text-[10px] font-mono font-extrabold">{tNum}</span>
                              <span className="text-[9px] font-bold uppercase truncate max-w-full">{item.status.slice(0, 3)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-b border-dashed border-slate-300 w-full my-4"></div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {lowerTeeth.map(tNum => {
                          const item = odontogramData[tNum] || { status: 'Sano' };
                          return (
                            <button
                              key={tNum}
                              onClick={() => {
                                setSelectedTooth(tNum);
                                setToothStatusInput(item.status || 'Sano');
                                setToothNotesInput(item.notes || '');
                              }}
                              className={`w-10 h-14 rounded-xl border flex flex-col items-center justify-between p-1 transition-transform hover:scale-105 shadow-sm ${getToothColor(item.status)}`}
                            >
                              <span className="text-[9px] font-bold uppercase truncate max-w-full">{item.status.slice(0, 3)}</span>
                              <span className="text-[10px] font-mono font-extrabold">{tNum}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="text-center text-xs font-extrabold text-slate-600 uppercase tracking-wider pt-2">Arcada Inferior (Mandíbula)</div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: CONSENTIMIENTOS */}
              {activeSubTab === 'consents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <FileSignature className="w-4 h-4 text-teal-600" />
                        Consentimientos Informados Firmados por el Paciente
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">Documentación legal y firma táctil digital almacenada en SQLite.</p>
                    </div>

                    <button
                      onClick={() => setShowConsentModal(true)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <PenTool className="w-4 h-4" />
                      + Firmar Nuevo Consentimiento
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patientConsents.length === 0 ? (
                      <div className="col-span-2 p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                        No hay consentimientos informados firmados digitalmente para este expediente.
                      </div>
                    ) : (
                      patientConsents.map((c) => (
                        <div key={c.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">{c.id}</span>
                              <h5 className="font-extrabold text-slate-900 text-sm mt-1">{c.templateTitle}</h5>
                              <p className="text-[11px] text-slate-500 font-mono">Firmado: {c.signedAt}</p>
                            </div>
                          </div>

                          <div className="bg-white p-2 rounded-lg border border-slate-300">
                            <span className="text-[10px] text-slate-400 font-bold block mb-1">Firma Digital Registrada:</span>
                            <img src={c.signaturePng} alt="Firma Paciente" className="max-h-20 mx-auto object-contain" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-500 font-medium">
              Seleccione un paciente de la lista para ver su expediente completo.
            </div>
          )}
        </div>

      </div>

      {/* MODAL DIRECTORIO DE MÉDICOS ESPECIALISTAS */}
      {showDoctorDirectoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-3xl p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  Directorio General de Médicos Especialistas Registrados
                </h3>
                <p className="text-xs text-slate-500 font-medium">Lista oficial de especialistas y esquemas de comisiones médicas en SQLite.</p>
              </div>
              <button
                onClick={() => setShowDoctorDirectoryModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialists.map((doc) => (
                <div key={doc.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">{doc.id}</span>
                      <h4 className="font-extrabold text-slate-900 text-base mt-1">{doc.name}</h4>
                      <p className="text-xs text-teal-700 font-bold">{doc.specialty}</p>
                      <p className="text-xs text-slate-500 font-mono font-medium">RIF Fiscal: {doc.rIF || doc.rif || 'V-00000000-0'}</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700">Porcentajes de Comisión Acordados:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="flex justify-between bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-600 font-sans">Privado:</span>
                        <span className="font-bold text-emerald-700">{doc.commissionRates?.Privado || 50}%</span>
                      </div>
                      <div className="flex justify-between bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-600 font-sans">Funcionario:</span>
                        <span className="font-bold text-blue-700">{doc.commissionRates?.Funcionario || 45}%</span>
                      </div>
                      <div className="flex justify-between bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-600 font-sans">Convenio:</span>
                        <span className="font-bold text-amber-700">{doc.commissionRates?.Convenio || 40}%</span>
                      </div>
                      <div className="flex justify-between bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-600 font-sans">Asegurado:</span>
                        <span className="font-bold text-purple-700">{doc.commissionRates?.Asegurado || 45}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-bold">Total: {specialists.length} médicos activos</span>
              <button
                onClick={() => {
                  setShowDoctorDirectoryModal(false);
                  setShowNewDoctorModal(true);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm"
              >
                + Agregar Nuevo Médico al Directorio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Pieza Dental */}
      {selectedTooth && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold flex items-center justify-between">
              <span>Actualizar Pieza Dental #{selectedTooth}</span>
              <span className="text-xs font-mono text-teal-700 bg-teal-100 px-2 py-0.5 rounded">Odontograma</span>
            </h3>

            <form onSubmit={handleSaveTooth} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Estado de la Pieza Dental</label>
                <select
                  value={toothStatusInput}
                  onChange={(e) => setToothStatusInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-sm"
                >
                  <option value="Sano">💚 Sano (Sin novedad)</option>
                  <option value="Caries">🔴 Caries (Requiere Tratamiento)</option>
                  <option value="Resina">🟦 Resina Fotocurada (Tratado)</option>
                  <option value="Endodoncia">🟪 Tratamiento de Conducto</option>
                  <option value="Corona">🟨 Corona / Prótesis</option>
                  <option value="Ausente">⬜ Ausente / Extraído</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Observaciones / Detalles</label>
                <textarea
                  rows="2"
                  placeholder="Ej: Caries oclusal leve"
                  value={toothNotesInput}
                  onChange={(e) => setToothNotesInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTooth(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Guardar Pieza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Firmar Consentimiento Informado */}
      {showConsentModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <PenTool className="w-5 h-5 text-teal-600" />
              Firma Digital de Consentimiento Informado
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Seleccionar Tipo de Documento Legal</label>
                <select
                  value={consentTitle}
                  onChange={(e) => setConsentTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="Consentimiento Informado Odontología General & Cirugía">Consentimiento Informado Odontología General & Cirugía</option>
                  <option value="Consentimiento Tratamiento de Ortodoncia">Consentimiento Tratamiento de Ortodoncia</option>
                  <option value="Consentimiento Procedimientos de Endodoncia">Consentimiento Procedimientos de Endodoncia</option>
                  <option value="Consentimiento Estudios de Ecografía">Consentimiento Estudios de Ecografía</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-32 overflow-y-auto text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-900">Declaración del Paciente:</p>
                <p>Yo, <strong>{selectedPatient.name}</strong>, identificado con la Cédula <strong>{selectedPatient.documentId}</strong>, declaro haber recibido explicación detallada sobre el procedimiento clínico a realizar en el Centro Médico Odontológico Vida Sana CMO, C.A.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold">Firma del Paciente (Dibuje con el dedo o mouse):</label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[11px] text-rose-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" /> Limpiar Firma
                  </button>
                </div>

                <canvas
                  ref={canvasRef}
                  width={440}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full border-2 border-dashed border-slate-400 bg-slate-50 rounded-xl cursor-crosshair touch-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowConsentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveConsent}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md"
                >
                  Guardar Firma en SQLite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Paciente */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-600" />
              Nuevo Expediente Digital
            </h3>

            <form onSubmit={handleAddPatient} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombres y Apellidos Completos</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Maria de los Angeles Perez"
                  value={newPatient.name}
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Cédula / Pasaporte</label>
                  <input
                    type="text"
                    required
                    placeholder="V-20.123.456"
                    value={newPatient.documentId}
                    onChange={e => setNewPatient({ ...newPatient, documentId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Edad</label>
                  <input
                    type="number"
                    required
                    placeholder="28"
                    value={newPatient.age}
                    onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Teléfono (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    placeholder="+584121234567"
                    value={newPatient.phone}
                    onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Categoría</label>
                  <select
                    value={newPatient.category}
                    onChange={e => setNewPatient({ ...newPatient, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="Privado">Privado</option>
                    <option value="Funcionario">Funcionario</option>
                    <option value="Convenio">Convenio / Clínica</option>
                    <option value="Asegurado">Asegurado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="paciente@correo.com"
                  value={newPatient.email}
                  onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Especialista Asignado</label>
                <select
                  value={newPatient.assignedSpecialist}
                  onChange={e => setNewPatient({ ...newPatient, assignedSpecialist: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none"
                >
                  {specialists.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md"
                >
                  Crear Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Médico */}
      {showNewDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserCheck2 className="w-5 h-5 text-teal-600" />
              Registrar Nuevo Médico Especialista
            </h3>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Fernando Alarcón"
                  value={newDoctor.name}
                  onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Especialidad</label>
                  <input
                    type="text"
                    required
                    placeholder="Ortodoncia / Endodoncia"
                    value={newDoctor.specialty}
                    onChange={e => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">RIF Médico</label>
                  <input
                    type="text"
                    required
                    placeholder="V-20123456-0"
                    value={newDoctor.rIF}
                    onChange={e => setNewDoctor({ ...newDoctor, rIF: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800">Comisiones por Categoría de Paciente (% Médico):</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-600 font-medium">Privado (%):</label>
                    <input
                      type="number"
                      value={newDoctor.privadoRate}
                      onChange={e => setNewDoctor({ ...newDoctor, privadoRate: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium">Funcionario (%):</label>
                    <input
                      type="number"
                      value={newDoctor.funcionarioRate}
                      onChange={e => setNewDoctor({ ...newDoctor, funcionarioRate: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium">Convenio (%):</label>
                    <input
                      type="number"
                      value={newDoctor.convenioRate}
                      onChange={e => setNewDoctor({ ...newDoctor, convenioRate: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-medium">Asegurado (%):</label>
                    <input
                      type="number"
                      value={newDoctor.aseguradoRate}
                      onChange={e => setNewDoctor({ ...newDoctor, aseguradoRate: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewDoctorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md"
                >
                  Guardar Médico en DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Procedimiento */}
      {showExecModal && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                Registrar Ejecución de Procedimiento
              </h3>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100 px-2 py-1 rounded">
                Expediente: #{selectedPatient.id}
              </span>
            </div>

            <form onSubmit={handleExecuteProcedureSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900">
                <p className="font-bold">⚡ Descargo Automático de Inventario Activado</p>
                <p className="text-[11px] font-medium opacity-90 mt-0.5">
                  Los insumos asociados a este procedimiento se descontarán automáticamente del inventario.
                </p>
              </div>

              <div>
                <label className="block mb-1 font-bold">Seleccionar Procedimiento a Ejecutar</label>
                <select
                  value={selectedProcId}
                  onChange={(e) => setSelectedProcId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-bold text-sm focus:outline-none"
                >
                  {procedures.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)} ({p.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold">Médico / Especialista Tratante</label>
                <select
                  value={execDoctor}
                  onChange={(e) => setExecDoctor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:outline-none"
                >
                  {specialists.map(s => (
                    <option key={s.id} value={s.name}>{s.name} ({s.specialty})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowExecModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md"
                >
                  Confirmar y Descontar Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
