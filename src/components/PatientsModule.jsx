import React, { useState, useRef } from 'react';
import { User, Phone, Mail, Calendar, FileText, Plus, Search, Stethoscope, CheckCircle, Clock, ShieldCheck, Printer, Send, MessageSquare, AlertCircle, Edit, Trash2 } from 'lucide-react';

export default function PatientsModule({ patients = [], setPatients, specialists = [], setSpecialists, procedures = [], onRegisterProcedure }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState('history');

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
  const [patientSpecialist, setPatientSpecialist] = useState(specialists[0]?.name || '');

  // Odontograma Estado Pieza
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [toothStatus, setToothStatus] = useState('Sano');
  const [toothNotes, setToothNotes] = useState('');

  // Presupuesto Unificado - Baremos Seleccionados
  const [quoteProcedures, setQuoteProcedures] = useState([]);
  const [selectedProcToQuote, setSelectedProcToQuote] = useState(procedures[0]?.id || '');
  const [photoTermsAccepted, setPhotoTermsAccepted] = useState(false);

  const safePatients = Array.isArray(patients) ? patients : [];
  const activePatient = safePatients.find(p => p.id === selectedPatientId) || safePatients[0] || null;

  // Cálculo Dinámico de Edad
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return activePatient?.age || 30;
    try {
      const today = new Date();
      const birth = new Date(birthDateString);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return (isNaN(age) || age < 0) ? 0 : age;
    } catch (e) {
      return 30;
    }
  };

  // Cálculo de Tiempo Activo en Tratamiento
  const calculateActiveTime = (startDateStr) => {
    if (!startDateStr) return 'Reciente';
    try {
      const start = new Date(startDateStr);
      const today = new Date();
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (isNaN(diffDays) || diffDays < 30) return `${isNaN(diffDays)?0:diffDays} Días`;
      const months = Math.floor(diffDays / 30);
      if (months < 12) return `${months} Meses`;
      const years = (months / 12).toFixed(1);
      return `${years} Años`;
    } catch (e) {
      return 'Reciente';
    }
  };

  // Guardar nuevo paciente
  const handleSavePatientSubmit = (e) => {
    e.preventDefault();
    const computedAge = calculateAge(patientBirthDate);

    const newPatient = {
      id: `100-${(safePatients.length + 1).toString().padStart(2, '0')}`,
      name: patientName,
      documentId: isMinor ? `V-Menor (${repDocId || 'N/A'})` : docId,
      isMinor,
      representativeId: isMinor ? repDocId : '',
      representativeName: isMinor ? repName : '',
      birthDate: patientBirthDate,
      phone: patientPhone,
      email: patientEmail,
      age: computedAge,
      category: patientCategory,
      assignedSpecialist: patientSpecialist,
      treatmentStartDate: new Date().toISOString().slice(0, 10),
      lastControlDate: new Date().toISOString().slice(0, 10),
      history: []
    };

    setPatients([newPatient, ...safePatients]);
    setSelectedPatientId(newPatient.id);
    setShowAddPatientModal(false);
    alert(`✅ ¡Paciente ${newPatient.name} registrado con éxito!`);
  };

  const filteredPatients = safePatients.filter(p => {
    if (!p) return false;
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const pName = p.name || '';
    const pDoc = p.documentId || '';
    const pId = p.id || '';
    const matchesSearch = pName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pDoc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProcToQuote = () => {
    const proc = procedures.find(pr => pr.id === selectedProcToQuote);
    if (proc) {
      setQuoteProcedures([...quoteProcedures, proc]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <UserCheck className="text-teal-600 w-7 h-7" />
            Módulo de Pacientes & Expedientes Clínicos
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Expedientes integrados con soporte para menores de edad, Odontograma 2D y Presupuesto Digital Unificado.
          </p>
        </div>

        <button
          onClick={() => setShowAddPatientModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          + Nuevo Expediente
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Columna Izquierda: Buscador & Lista de Pacientes */}
        <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Nombre, Cédula o Expediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
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
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'Todos' : cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredPatients.map(p => {
              const isSelected = p.id === activePatient?.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-50 border-teal-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded">
                      #{p.id}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                      {p.category || 'Privado'}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-slate-900 truncate">{p.name}</h4>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    CI: {p.documentId || 'N/A'} • {calculateAge(p.birthDate)} años
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
        {activePatient ? (
          <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-6">

            {/* Cabecera Ficha Paciente */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
                  {(activePatient.name || 'PA').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900">{activePatient.name}</h3>
                    <span className="font-mono text-xs font-bold text-slate-500">Cod: {activePatient.id}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    Cédula: {activePatient.documentId || 'N/A'} • Edad: {calculateAge(activePatient.birthDate)} Años • {activePatient.category}
                  </p>
                  {activePatient.isMinor && (
                    <p className="text-xs text-amber-900 font-bold mt-0.5">
                      Representante Legal: {activePatient.representativeName} (CI: {activePatient.representativeId})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activePatient.phone && (
                  <a
                    href={`https://wa.me/${(activePatient.phone||'').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> WhatsApp Directo
                  </a>
                )}
              </div>
            </div>

            {/* Indicadores Clínicos y Seguimiento (Métricas Cabecera) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-600 block">Inicio de Tratamiento:</span>
                <span className="text-sm font-extrabold font-mono text-slate-900">
                  {activePatient.treatmentStartDate || '2026-06-15'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-600 block">Último Control / Consulta:</span>
                <span className="text-sm font-extrabold font-mono text-slate-900">
                  {activePatient.lastControlDate || '2026-07-28'}
                </span>
              </div>

              <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl">
                <span className="text-[11px] font-bold text-teal-900 block">Tiempo Activo en Tratamiento:</span>
                <span className="text-sm font-extrabold font-mono text-teal-950">
                  {calculateActiveTime(activePatient.treatmentStartDate)}
                </span>
              </div>
            </div>

            {/* Sub-Navegación de Ficha */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveSubTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'history' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> 1. Historial Clínico
              </button>

              <button
                onClick={() => setActiveSubTab('odontogram')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'odontogram' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" /> 2. Odontograma 2D
              </button>

              <button
                onClick={() => setActiveSubTab('unified-quote')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeSubTab === 'unified-quote' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5" /> 3. Presupuesto & Firma Digital
              </button>
            </div>

            {/* TAB 1: HISTORIAL CLÍNICO */}
            {activeSubTab === 'history' && (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-slate-200">
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
                    <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
                      {(activePatient.history || []).map((h, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-semibold">{h.date}</td>
                          <td className="p-3 font-extrabold text-slate-900">{h.procedure}</td>
                          <td className="p-3 text-slate-700">{h.doctor}</td>
                          <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${(h.cost||0).toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              {h.status || 'Completado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: ODONTOGRAMA 2D INTERACTIVO */}
            {activeSubTab === 'odontogram' && (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900">Odontograma 2D Interactivo por Diente</h4>
                <div className="grid grid-cols-8 gap-2">
                  {[18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28].map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTooth(t)}
                      className={`p-3 rounded-xl border text-center font-mono font-bold transition-all ${
                        selectedTooth === t ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-800 hover:bg-slate-100 border-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {selectedTooth && (
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 text-xs">
                    <span className="font-bold text-slate-900">Pieza Dental Seleccionada: #{selectedTooth}</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold mb-1">Estado de la Pieza</label>
                        <select
                          value={toothStatus}
                          onChange={(e) => setToothStatus(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                        >
                          <option value="Sano">Sano / Sin Afección</option>
                          <option value="Caries">Caries Activa</option>
                          <option value="Endodoncia">Endodoncia / Requerida</option>
                          <option value="Exodoncia">Exodoncia Recomendada</option>
                          <option value="Corona">Corona / Prótesis</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">Observaciones</label>
                        <input
                          type="text"
                          placeholder="Ej: Caries oclusal leve"
                          value={toothNotes}
                          onChange={(e) => setToothNotes(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PRESUPUESTO Y FIRMA DIGITAL UNIFICADA */}
            {activeSubTab === 'unified-quote' && (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-6">
                <h4 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-200">
                  Generación de Presupuesto Clínico & Firma Digital Unificada
                </h4>

                {/* Seleccionar Baremos */}
                <div className="space-y-3 text-xs">
                  <span className="font-bold text-slate-800">1. Adición de Servicios desde Baremo Oficial</span>
                  <div className="flex gap-2">
                    <select
                      value={selectedProcToQuote}
                      onChange={(e) => setSelectedProcToQuote(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900"
                    >
                      {procedures.map(pr => (
                        <option key={pr.id} value={pr.id}>{pr.name} - ${(pr.price||0).toFixed(2)} USD</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddProcToQuote}
                      className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shrink-0"
                    >
                      + Agregar
                    </button>
                  </div>

                  {quoteProcedures.length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                      {quoteProcedures.map((qp, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-900 font-bold">
                          <span>{qp.name}</span>
                          <span className="font-mono text-emerald-900">${(qp.price||0).toFixed(2)} USD</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 font-extrabold text-sm">
                        <span>Total Presupuesto:</span>
                        <span className="font-mono text-emerald-900">
                          ${quoteProcedures.reduce((s, p) => s + (p.price||0), 0).toFixed(2)} USD
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Checkbox Aceptación de Términos Fotográficos */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="photoTerms"
                    checked={photoTermsAccepted}
                    onChange={(e) => setPhotoTermsAccepted(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                  <label htmlFor="photoTerms" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Autorizo el uso de registros fotográficos y radiográficos durante mi tratamiento clínico en Vida Sana CMO.
                  </label>
                </div>

                {/* Canvas de Firma Digital (Médico & Paciente) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-xs text-slate-800 block">Firma del Médico Tratante</span>
                    <div className="h-28 border border-slate-300 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-mono text-xs">
                      [ Canvas Firma Médico ]
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                    <span className="font-bold text-xs text-slate-800 block">Firma del Paciente / Representante</span>
                    <div className="h-28 border border-slate-300 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-mono text-xs">
                      [ Canvas Firma Paciente ]
                    </div>
                  </div>
                </div>

                {/* Acciones Independientes */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> Imprimir Recibo / PDF
                  </button>

                  {activePatient.phone && (
                    <a
                      href={`https://wa.me/${(activePatient.phone||'').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-4 h-4" /> Enviar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl text-center text-slate-500 font-bold text-xs">
            Seleccione un paciente de la lista de la izquierda para ver su expediente.
          </div>
        )}

      </div>

      {/* Modal Nuevo Expediente / Paciente */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <label className="block font-bold mb-1">Cédula del Representante Legal</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: V-15.632.147"
                      value={repDocId}
                      onChange={(e) => setRepDocId(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
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
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Categoría del Paciente</label>
                  <select
                    value={patientCategory}
                    onChange={(e) => setPatientCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg shadow-sm"
                >
                  Guardar Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
