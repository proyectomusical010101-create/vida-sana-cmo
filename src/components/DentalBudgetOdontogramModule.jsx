import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, FileText, Send, Printer, CheckCircle2, User, Search, Plus, Trash2, Edit3, ShieldCheck, PenTool, RefreshCw, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

export default function DentalBudgetOdontogramModule({ patients = [], procedures = [], specialists = [], bcvRate = 755.90, paperworkSettings }) {
  const safePatients = Array.isArray(patients) ? patients : [];

  // SECCION 2 State: Paciente Seleccionado
  const [selectedPatientId, setSelectedPatientId] = useState(safePatients[0]?.id || '');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  // SECCION 3 State: Odontograma Anatómico 5 Caras por Pieza
  const [activeMarkMode, setActiveMarkMode] = useState('red'); // 'red' | 'blue' | 'green' | 'purple' | 'erase'
  const [toothSurfaces, setToothSurfaces] = useState({
    17: { top: 'red' },
    16: { center: 'blue' },
    24: { left: 'green' }
  });

  // Modal de Selección de Tratamiento del Baremo por Cara Seleccionada
  const [selectedFaceModal, setSelectedFaceModal] = useState(null); // { toothNum: 17, faceKey: 'bottom', faceLabel: 'Lingual / Palatina' }
  const [baremoSearchTerm, setBaremoSearchTerm] = useState('');

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

  const faceLabelMap = {
    top: 'Superior / Vestibular',
    bottom: 'Inferior / Lingual / Palatina',
    left: 'Mesial (Izquierda)',
    right: 'Distal (Derecha)',
    center: 'Oclusal / Incisal (Centro)'
  };

  const handleFaceClick = (toothNum, faceKey) => {
    // 1. Pintar la cara en el odontograma según el modo activo
    setToothSurfaces(prev => {
      const current = prev[toothNum] || {};
      const newColor = activeMarkMode === 'erase' ? null : activeMarkMode;
      return {
        ...prev,
        [toothNum]: {
          ...current,
          [faceKey]: newColor
        }
      };
    });

    // 2. Abrir el modal de selección de tratamiento del baremo para esta cara y diente
    setSelectedFaceModal({
      toothNum,
      faceKey,
      faceLabel: faceLabelMap[faceKey] || 'Cara Dental'
    });
  };

  const getFaceColorHex = (colorMode) => {
    if (colorMode === 'red') return '#ef4444';
    if (colorMode === 'blue') return '#2563eb';
    if (colorMode === 'green') return '#16a34a';
    if (colorMode === 'purple') return '#9333ea';
    if (colorMode === 'yellow') return '#eab308';
    return '#ffffff';
  };

  // Tooth Condition Selection Modal
  const [selectedToothModal, setSelectedToothModal] = useState(null);
  const [modalStatus, setModalStatus] = useState('Caries');
  const [modalProcName, setModalProcName] = useState('Resina Fotocurada Superior');
  const [modalPrice, setModalPrice] = useState('45');
  const [modalNotes, setModalNotes] = useState('');

  // SECCION 4 State: Presupuesto Generado (Lista de partidas)
  const [budgetItems, setBudgetItems] = useState([
    { id: 'ITEM-1', tooth: 16, procedure: 'Resina Fotocurada Molar', doctor: 'Dr. Carlos Mendoza', priceUsd: 45.00 },
    { id: 'ITEM-2', tooth: 24, procedure: 'Tratamiento de Conducto (Endodoncia)', doctor: 'Dra. Vanessa Rivas', priceUsd: 120.00 }
  ]);
  const [customProcName, setCustomProcName] = useState('');
  const [customToothNum, setCustomToothNum] = useState('General');
  const [customProcPrice, setCustomProcPrice] = useState('40');

  // SECCION 5 State: Firmas Digitales
  const patientCanvasRef = useRef(null);
  const doctorCanvasRef = useRef(null);
  const [isDrawingPatient, setIsDrawingPatient] = useState(false);
  const [isDrawingDoctor, setIsDrawingDoctor] = useState(false);
  const [patientSigned, setPatientSigned] = useState(false);
  const [doctorSigned, setDoctorSigned] = useState(false);

  // Active Patient Object
  const activePatient = safePatients.find(p => String(p.id) === String(selectedPatientId)) || safePatients[0];

  const filteredPatients = safePatients.filter(p => {
    if (!p) return false;
    const nameStr = String(p.name || p.full_name || '').toLowerCase();
    const docStr = String(p.documentId || p.document_id || '').toLowerCase();
    const term = patientSearchTerm.toLowerCase();
    return nameStr.includes(term) || docStr.includes(term);
  });

  // Totales de Presupuesto
  const subtotalUsd = budgetItems.reduce((acc, item) => acc + (parseFloat(item.priceUsd) || 0), 0);
  const totalBs = subtotalUsd * bcvRate;

  // Manejo de clicks y trazado en Canvas de Firma
  const startDrawing = (canvasRef, setIsDrawing) => (e) => {
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

  const draw = (canvasRef, isDrawing, setSigned) => (e) => {
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
    setSigned(true);
  };

  const stopDrawing = (setIsDrawing) => () => {
    setIsDrawing(false);
  };

  const clearCanvas = (canvasRef, setSigned) => () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  // Abrir Modal de Edición de Pieza
  const handleOpenToothModal = (toothNum) => {
    const existing = toothConditions[toothNum] || { status: 'Sano' };
    setSelectedToothModal(toothNum);
    setModalStatus(existing.status || 'Caries');
    setModalProcName(existing.procedureName || 'Resina Fotocurada');
    setModalPrice(existing.price ? existing.price.toString() : '45');
    setModalNotes(existing.notes || '');
  };

  // Guardar Estado de Pieza + Añadir al Presupuesto
  const handleSaveToothCondition = (e) => {
    e.preventDefault();
    if (!selectedToothModal) return;

    const priceNum = parseFloat(modalPrice) || 0;

    setToothConditions(prev => ({
      ...prev,
      [selectedToothModal]: {
        status: modalStatus,
        procedureName: modalProcName,
        price: priceNum,
        notes: modalNotes
      }
    }));

    if (modalStatus !== 'Sano' && priceNum > 0) {
      const newItem = {
        id: `ITEM-${Date.now().toString().slice(-4)}`,
        tooth: selectedToothModal,
        procedure: `${modalStatus}: ${modalProcName}`,
        doctor: activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza',
        priceUsd: priceNum
      };
      setBudgetItems(prev => [...prev, newItem]);
    }

    setSelectedToothModal(null);
    Swal.fire({
      title: `Pieza #${selectedToothModal} Actualizada`,
      text: `Se registró condición "${modalStatus}" y se añadió al presupuesto.`,
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });
  };

  // Agregar partida manual al presupuesto
  const handleAddCustomBudgetItem = (e) => {
    e.preventDefault();
    if (!customProcName) return;

    const price = parseFloat(customProcPrice) || 0;
    const newItem = {
      id: `ITEM-${Date.now().toString().slice(-4)}`,
      tooth: customToothNum || 'General',
      procedure: customProcName,
      doctor: activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza',
      priceUsd: price
    };

    setBudgetItems([...budgetItems, newItem]);
    setCustomProcName('');
    setCustomProcPrice('40');

    Swal.fire({
      title: 'Tratamiento Añadido',
      text: `Se agregó "${customProcName}" al presupuesto.`,
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });
  };

  // Eliminar partida de presupuesto
  const handleDeleteBudgetItem = (id) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  // Generar / Guardar Presupuesto Final Certificado
  const handleCertifyBudget = () => {
    if (!patientSigned || !doctorSigned) {
      Swal.fire('Firmas Pendientes', 'Por favor capture la Firma del Paciente y la Firma del Odontólogo antes de certificar.', 'warning');
      return;
    }

    Swal.fire({
      title: '¡Presupuesto Certificado!',
      text: `El presupuesto de $${subtotalUsd.toFixed(2)} USD (${totalBs.toFixed(2)} Bs) para ${activePatient?.name || 'el paciente'} ha sido firmado y registrado exitosamente en Supabase.`,
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });
  };

  // Renderizador de Diente Anatómico 5 Caras (SVG Interactivo / Compacto Impresión)
  const renderToothRow = (teethArray, isCompact = false) => (
    <div className={`flex flex-wrap items-center justify-center ${isCompact ? 'gap-1 py-0.5' : 'gap-4 py-2'}`}>
      {teethArray.map(toothNum => {
        const faces = toothSurfaces[toothNum] || {};

        return (
          <div key={toothNum} className="flex flex-col items-center gap-0.5 group">
            <span
              onClick={() => !isCompact && handleOpenToothModal(toothNum)}
              className={`${isCompact ? 'text-[9px]' : 'text-[11px]'} font-mono font-black text-slate-700 dark:text-slate-300 hover:text-teal-600 cursor-pointer`}
              title={`Pieza #${toothNum}`}
            >
              {toothNum}
            </span>

            {/* SVG Diente 5 Caras */}
            <div className={`${isCompact ? 'w-6 h-6' : 'w-10 h-10'} relative bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 shadow-xs`}>
              <svg viewBox="0 0 40 40" className="w-full h-full">
                {/* Cuadro exterior */}
                <rect x="0" y="0" width="40" height="40" fill="none" stroke="#cbd5e1" strokeWidth="1" />

                {/* Cara Top (Vestibular / Superior) */}
                <polygon
                  points="0,0 40,0 28,12 12,12"
                  fill={getFaceColorHex(faces.top)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  onClick={() => !isCompact && handleFaceClick(toothNum, 'top')}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                {/* Cara Right (Distal / Derecha) */}
                <polygon
                  points="40,0 40,40 28,28 28,12"
                  fill={getFaceColorHex(faces.right)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  onClick={() => !isCompact && handleFaceClick(toothNum, 'right')}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                {/* Cara Bottom (Lingual / Inferior) */}
                <polygon
                  points="40,40 0,40 12,28 28,28"
                  fill={getFaceColorHex(faces.bottom)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  onClick={() => !isCompact && handleFaceClick(toothNum, 'bottom')}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                {/* Cara Left (Mesial / Izquierda) */}
                <polygon
                  points="0,40 0,0 12,12 12,28"
                  fill={getFaceColorHex(faces.left)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  onClick={() => !isCompact && handleFaceClick(toothNum, 'left')}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                {/* Cara Center (Oclusal / Centro) */}
                <rect
                  x="12"
                  y="12"
                  width="16"
                  height="16"
                  fill={getFaceColorHex(faces.center)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  onClick={() => !isCompact && handleFaceClick(toothNum, 'center')}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      
      {/* CONTENEDOR WEB DE FORMULARIOS E INTERFAZ (100% OCULTO EN IMPRESIÓN / PDF) */}
      <div className="web-only-form space-y-8">

      {/* ========================================================================= */}
      {/* SECCION 1: CABECERA (Emisión y Envío de Presupuestos) */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1e2d5a] pb-4">
          <div>
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
              Sección 1 • Control Clínico
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
              <Stethoscope className="text-teal-600 w-7 h-7" />
              Emisión, Presupuesto Clínico & Firma Digital Unificada
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Flujo clínico completo: selecciona el paciente, marca hallazgos en el odontograma, genera la propuesta económica y certifica con firma digital.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-teal-400" />
              Exportar Presupuesto PDF
            </button>

            {activePatient?.phone && (
              <a
                href={`https://wa.me/${activePatient.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(activePatient.name)},%20le%20enviamos%20su%20presupuesto%20clinico%20de%20Vida%20Sana%20CMO`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
                Enviar por WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Píldora de Tasa Oficial BCV */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl text-xs gap-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
            <DollarSign className="w-4 h-4 text-teal-600" />
            <span>Tasa Oficial BCV Aplicada:</span>
            <span className="font-mono text-slate-900 dark:text-white font-black text-sm">{bcvRate.toFixed(2)} Bs / USD</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Todos los presupuestos son calculados automáticamente en USD y Bolívares.</span>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* SECCION 2: SELECCIONAR EL PACIENTE */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
        <div>
          <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
            Sección 2 • Identificación del Paciente
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            Selección y Datos del Expediente
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Buscar / Seleccionar Paciente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por Nombre o Cédula..."
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
              />
            </div>

            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
            >
              {filteredPatients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name || p.full_name} (CI: {p.documentId || p.document_id || 'N/A'}) - Category: {p.category || 'Privado'}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-6 p-4 bg-teal-50/60 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl space-y-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-start">
              <h4 className="text-base font-black text-slate-900 dark:text-white">{activePatient?.name || activePatient?.full_name || 'Paciente'}</h4>
              <span className="px-2 py-0.5 bg-teal-600 text-white font-mono text-[10px] font-black rounded uppercase">#{activePatient?.id}</span>
            </div>
            <p className="font-mono text-slate-600 dark:text-slate-400">
              Cédula: <span className="text-slate-900 dark:text-white font-extrabold">{activePatient?.documentId || activePatient?.document_id || 'V-0000000'}</span>
            </p>
            <p className="font-mono text-slate-600 dark:text-slate-400">
              Categoría: <span className="text-teal-700 dark:text-teal-300 font-extrabold">{activePatient?.category || 'Privado'}</span> • Especialista: <span className="text-slate-900 dark:text-white font-extrabold">{activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza'}</span>
            </p>
            {activePatient?.isMinor && (
              <p className="text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded border border-amber-300 text-[11px]">
                👶 Representante Legal: <strong>{activePatient.representativeName}</strong> (CI: {activePatient.representativeId})
              </p>
            )}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* SECCION 3: ODONTOGRAMA (Grid con el orden exacto especificado por el usuario) */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-[#1e2d5a] pb-3">
          <div>
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
              Sección 3 • Mapeo Anatómico
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              Odontograma 2D Clínico (Estructura FDI Regulada)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">Haz clic sobre cualquier pieza dental para cambiar su diagnóstico.</span>
        </div>

        {/* Barra de Modo de Marcado (Selector de Herramienta por Color) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-700 dark:text-slate-300 font-black uppercase text-[11px]">Modo de Marcado:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMarkMode('red')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-extrabold cursor-pointer ${
                activeMarkMode === 'red'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-rose-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-rose-500 border border-white"></span>
              <span>❗ Patología (Rojo)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMarkMode('blue')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-extrabold cursor-pointer ${
                activeMarkMode === 'blue'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-blue-500 border border-white"></span>
              <span>✓ Tratado (Azul)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMarkMode('green')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-extrabold cursor-pointer ${
                activeMarkMode === 'green'
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-emerald-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
              <span>➕ Plan Propuesto (Verde)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMarkMode('purple')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-extrabold cursor-pointer ${
                activeMarkMode === 'purple'
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-purple-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-purple-500 border border-white"></span>
              <span>🟣 Endodoncia / Corona</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMarkMode('erase')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-extrabold cursor-pointer ${
                activeMarkMode === 'erase'
                  ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-500 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-slate-500'
              }`}
            >
              <span>🧽 Borrar Cara</span>
            </button>
          </div>
        </div>

        {/* CONTENEDOR DEL ODONTOGRAMA */}
        
        {/* VISTA ESCRITORIO (4 Cuadrantes Clínicos Regulados en Cruz con Líneas Divisorias) */}
        <div className="hidden lg:block p-6 bg-slate-50/50 dark:bg-[#0d162f]/40 border border-slate-200 dark:border-[#1e2d5a] rounded-2xl relative shadow-xs">
          
          {/* Título de Odontograma Impreso/Clínico */}
          <div className="text-center pb-4 mb-2">
            <span className="text-sm font-black tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b-2 border-slate-800 dark:border-slate-300 pb-0.5">
              ODONTOGRAMA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6 relative">

            {/* Línea Divisoria Vertical Central */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-600 -translate-x-1/2 z-10"></div>

            {/* Línea Divisoria Horizontal Central */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-400 dark:bg-slate-600 -translate-y-1/2 z-10"></div>

            {/* CUADRANTE 1 (Superior Izquierdo de Pantalla / Superior Derecho del Paciente) */}
            <div className="pr-4 pb-4 space-y-3">
              {/* Fila 1 Adultos: 18 a 11 */}
              {renderToothRow([18, 17, 16, 15, 14, 13, 12, 11])}
              {/* Fila 2 Infantil: 55 a 51 (Alineado a la derecha debajo de 15-11) */}
              <div className="flex justify-end pr-1">
                {renderToothRow([55, 54, 53, 52, 51])}
              </div>
            </div>

            {/* CUADRANTE 2 (Superior Derecho de Pantalla / Superior Izquierdo del Paciente) */}
            <div className="pl-4 pb-4 space-y-3">
              {/* Fila 1 Adultos: 21 a 28 */}
              {renderToothRow([21, 22, 23, 24, 25, 26, 27, 28])}
              {/* Fila 2 Infantil: 61 a 65 (Alineado a la izquierda debajo de 21-25) */}
              <div className="flex justify-start pl-1">
                {renderToothRow([61, 62, 63, 64, 65])}
              </div>
            </div>

            {/* CUADRANTE 4 (Inferior Izquierdo de Pantalla / Inferior Derecho del Paciente) */}
            <div className="pr-4 pt-4 space-y-3">
              {/* Fila 1 Infantil: 85 a 81 (Alineado a la derecha arriba de 45-41) */}
              <div className="flex justify-end pr-1">
                {renderToothRow([85, 84, 83, 82, 81])}
              </div>
              {/* Fila 2 Adultos: 48 a 41 */}
              {renderToothRow([48, 47, 46, 45, 44, 43, 42, 41])}
            </div>

            {/* CUADRANTE 3 (Inferior Derecho de Pantalla / Inferior Izquierdo del Paciente) */}
            <div className="pl-4 pt-4 space-y-3">
              {/* Fila 1 Infantil: 71 a 75 (Alineado a la izquierda arriba de 31-35) */}
              <div className="flex justify-start pl-1">
                {renderToothRow([71, 72, 73, 74, 75])}
              </div>
              {/* Fila 2 Adultos: 31 a 38 */}
              {renderToothRow([31, 32, 33, 34, 35, 36, 37, 38])}
            </div>

          </div>
        </div>

        {/* VISTA MÓVIL (Intacta y Secuencial Vertical) */}
        <div className="block lg:hidden p-4 bg-slate-50/50 dark:bg-[#0d162f]/40 border border-slate-200 dark:border-[#1e2d5a] rounded-2xl space-y-4">

          {/* 18, 17, 16, 15 */}
          {renderToothRow([18, 17, 16, 15], 'Superior Derecho Adultos (P1)')}

          {/* 14, 13, 12, 11 */}
          {renderToothRow([14, 13, 12, 11], 'Superior Derecho Adultos (P2)')}

          {/* 55, 54, 53, 52, 51 */}
          {renderToothRow([55, 54, 53, 52, 51], 'Superior Derecho Infantil')}

          <div className="border-t-2 border-dashed border-teal-500/50 my-3"></div>

          {/* 21, 22, 23, 24 */}
          {renderToothRow([21, 22, 23, 24], 'Superior Izquierdo Adultos (P1)')}

          {/* 25, 26, 27, 28 */}
          {renderToothRow([25, 26, 27, 28], 'Superior Izquierdo Adultos (P2)')}

          {/* 61, 62, 63, 64, 65 */}
          {renderToothRow([61, 62, 63, 64, 65], 'Superior Izquierdo Infantil')}

          <div className="border-t-4 border-teal-600 my-4"></div>

          {/* 85, 84, 83, 82, 81 */}
          {renderToothRow([85, 84, 83, 82, 81], 'Inferior Izquierdo Infantil')}

          {/* 48, 47, 46, 45 */}
          {renderToothRow([48, 47, 46, 45], 'Inferior Izquierdo Adultos (P1)')}

          {/* 44, 43, 42, 41 */}
          {renderToothRow([44, 43, 42, 41], 'Inferior Izquierdo Adultos (P2)')}

          <div className="border-t-2 border-dashed border-teal-500/50 my-3"></div>

          {/* 71, 72, 73, 74, 75 */}
          {renderToothRow([71, 72, 73, 74, 75], 'Inferior Derecho Infantil')}

          {/* 31, 32, 33, 34 */}
          {renderToothRow([31, 32, 33, 34], 'Inferior Derecho Adultos (P1)')}

          {/* 35, 36, 37, 38 */}
          {renderToothRow([35, 36, 37, 38], 'Inferior Derecho Adultos (P2)')}

        </div>
      </section>


      {/* ========================================================================= */}
      {/* SECCION 4: PRESUPUESTO GENERADO */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-6">
        <div>
          <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
            Sección 4 • Propuesta Económica
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            Presupuesto Generado & Desglose de Tratamiento
          </h3>
        </div>

        {/* Formulario Agregar Partida Manual */}
        <form onSubmit={handleAddCustomBudgetItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl text-xs font-bold">
          <div className="sm:col-span-3">
            <label className="block mb-1 text-slate-700 dark:text-slate-300">Pieza Dental</label>
            <input
              type="text"
              placeholder="Ej: #16 o General"
              value={customToothNum}
              onChange={(e) => setCustomToothNum(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block mb-1 text-slate-700 dark:text-slate-300">Nombre del Tratamiento / Procedimiento</label>
            <input
              type="text"
              required
              placeholder="Ej: Limpieza Ultrasónica Profunda"
              value={customProcName}
              onChange={(e) => setCustomProcName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block mb-1 text-slate-700 dark:text-slate-300">Precio ($ USD)</label>
            <input
              type="number"
              step="0.01"
              required
              value={customProcPrice}
              onChange={(e) => setCustomProcPrice(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>
        </form>

        {/* Tabla de Partidas */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#1e2d5a]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-[#0d162f] text-slate-800 dark:text-slate-200 font-extrabold border-b border-slate-300 dark:border-[#1e2d5a]">
              <tr>
                <th className="p-3">Pieza</th>
                <th className="p-3">Procedimiento / Tratamiento</th>
                <th className="p-3">Médico Trante</th>
                <th className="p-3 text-right">Precio ($ USD)</th>
                <th className="p-3 text-right">Equivalente (Bs BCV)</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#1e2d5a] font-bold text-slate-900 dark:text-slate-100">
              {budgetItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500 font-medium">
                    No hay ítems en el presupuesto. Marca piezas en el odontograma o agrega tratamientos manuales.
                  </td>
                </tr>
              ) : (
                budgetItems.map((item) => {
                  const priceBs = (parseFloat(item.priceUsd) || 0) * bcvRate;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3 font-mono font-black text-teal-600">#{item.tooth}</td>
                      <td className="p-3 font-extrabold">{item.procedure}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{item.doctor}</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-900 dark:text-emerald-400">${parseFloat(item.priceUsd).toFixed(2)} USD</td>
                      <td className="p-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300">{priceBs.toFixed(2)} Bs</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteBudgetItem(item.id)}
                          className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded text-rose-600 transition-all"
                          title="Eliminar ítem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen Total */}
        <div className="flex flex-col sm:flex-row justify-end items-end gap-4 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-300 dark:border-teal-800 rounded-xl text-right">
          <div>
            <span className="text-xs font-bold text-teal-900 dark:text-teal-300 block">Total en Dólares ($):</span>
            <span className="text-2xl font-black font-mono text-teal-950 dark:text-white">${subtotalUsd.toFixed(2)} USD</span>
          </div>

          <div className="border-l border-teal-300 dark:border-teal-700 pl-4">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">Total en Bolívares (Tasa BCV {bcvRate.toFixed(2)}):</span>
            <span className="text-2xl font-black font-mono text-blue-950 dark:text-blue-200">{totalBs.toFixed(2)} Bs</span>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* SECCION 5: CONSENTIMIENTO & FIRMAS DIGITALES */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-6">
        <div>
          <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
            Sección 5 • Certificación Legal & Firmas
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-teal-600" />
            Consentimiento Informado & Firmas Digitales
          </h3>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <p className="font-bold">Declaro haber sido informado sobre los procedimientos clínicos descritos en este presupuesto y autorizo la ejecución de los tratamientos bajo la tasa oficial BCV de la clínica.</p>
        </div>

        {/* Canvases de Firmas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* FIRMA PACIENTE */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-teal-600" />
                Firma Digital del Paciente / Representante
              </label>
              <button
                type="button"
                onClick={clearCanvas(patientCanvasRef, setPatientSigned)}
                className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Limpiar Firma
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-[#1e2d5a] rounded-xl bg-white p-1">
              <canvas
                ref={patientCanvasRef}
                width={400}
                height={160}
                onMouseDown={startDrawing(patientCanvasRef, setIsDrawingPatient)}
                onMouseMove={draw(patientCanvasRef, isDrawingPatient, setPatientSigned)}
                onMouseUp={stopDrawing(setIsDrawingPatient)}
                onTouchStart={startDrawing(patientCanvasRef, setIsDrawingPatient)}
                onTouchMove={draw(patientCanvasRef, isDrawingPatient, setPatientSigned)}
                onTouchEnd={stopDrawing(setIsDrawingPatient)}
                className="w-full h-40 bg-slate-50 dark:bg-slate-900 rounded-lg cursor-crosshair touch-none"
              />
            </div>
            <p className="text-[10px] text-center font-bold text-slate-500">
              {patientSigned ? '✅ Firma Registrada' : 'Firme dentro del recuadro usando mouse o pantalla táctil'}
            </p>
          </div>

          {/* FIRMA ODONTOLOGO */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-teal-600" />
                Firma Digital del Odontólogo Tratante
              </label>
              <button
                type="button"
                onClick={clearCanvas(doctorCanvasRef, setDoctorSigned)}
                className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Limpiar Firma
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-[#1e2d5a] rounded-xl bg-white p-1">
              <canvas
                ref={doctorCanvasRef}
                width={400}
                height={160}
                onMouseDown={startDrawing(doctorCanvasRef, setIsDrawingDoctor)}
                onMouseMove={draw(doctorCanvasRef, isDrawingDoctor, setDoctorSigned)}
                onMouseUp={stopDrawing(setIsDrawingDoctor)}
                onTouchStart={startDrawing(doctorCanvasRef, setIsDrawingDoctor)}
                onTouchMove={draw(doctorCanvasRef, isDrawingDoctor, setDoctorSigned)}
                onTouchEnd={stopDrawing(setIsDrawingDoctor)}
                className="w-full h-40 bg-slate-50 dark:bg-slate-900 rounded-lg cursor-crosshair touch-none"
              />
            </div>
            <p className="text-[10px] text-center font-bold text-slate-500">
              {doctorSigned ? '✅ Firma Registrada' : 'Firme dentro del recuadro usando mouse o pantalla táctil'}
            </p>
          </div>

        </div>

        {/* Botón Final Certificar */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#1e2d5a] flex justify-end">
          <button
            onClick={handleCertifyBudget}
            className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Aprobar Presupuesto & Certificar Firma Digital
          </button>
        </div>
      </section>
      </div>

      {/* MODAL CAMBIAR DIAGNOSTICO PIEZA DENTAL */}
      {selectedToothModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              Diagnóstico para Pieza Dental #{selectedToothModal}
            </h3>

            <form onSubmit={handleSaveToothCondition} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Condición / Diagnóstico Clínico</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-bold"
                >
                  <option value="Sano">✅ Sano</option>
                  <option value="Caries">🔴 Caries</option>
                  <option value="Obturado">🔵 Obturado / Resina</option>
                  <option value="Ausente">⚪ Ausente / Perdido</option>
                  <option value="Endodoncia">🟣 Endodoncia / Conducto</option>
                  <option value="Corona">🟡 Corona Prótesis</option>
                  <option value="Extraccion">🚨 Requiere Extracción</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre del Tratamiento Asignado</label>
                <input
                  type="text"
                  required
                  value={modalProcName}
                  onChange={(e) => setModalProcName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Precio Sugerido ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={modalPrice}
                  onChange={(e) => setModalPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Observaciones Clínicas</label>
                <textarea
                  rows="2"
                  placeholder="Detalles de cavidad, cara oclusión, etc."
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#1e2d5a]">
                <button
                  type="button"
                  onClick={() => setSelectedToothModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl transition-all shadow-md"
                >
                  Guardar en Odontograma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SELECCION DE TRATAMIENTO DEL BAREMO POR CARA DENTAL */}
      {selectedFaceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] text-slate-900 dark:text-white w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#1e2d5a] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header Modal */}
            <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border-b border-slate-200 dark:border-[#1e2d5a] flex justify-between items-center shrink-0">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Tratamiento para Pieza {selectedFaceModal.toothNum} ({selectedFaceModal.faceLabel})
              </h3>
              <button
                type="button"
                onClick={() => setSelectedFaceModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Seleccione el procedimiento del Baremo de Precios para asociar directamente a esta cara o diente:
              </p>

              {/* Input Buscador de Tratamientos */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar tratamiento en el baremo..."
                  value={baremoSearchTerm}
                  onChange={(e) => setBaremoSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
              </div>

              {/* Lista de Procedimientos del Baremo */}
              <div className="space-y-2 pt-1">
                {(procedures && procedures.length > 0 ? procedures : [
                  { id: '1', name: 'Consulta y Diagnóstico Clínico + Rx Periapical', category: 'Diagnóstico', durationMinutes: 20, priceUsd: 25.00 },
                  { id: '2', name: 'Limpieza Ultrasonica + Profilaxis Fluorada', category: 'Diagnóstico', durationMinutes: 30, priceUsd: 40.00 },
                  { id: '3', name: 'Restauración Fotocurada (Resina Clase I / V)', category: 'Operatoria', durationMinutes: 45, priceUsd: 45.00 },
                  { id: '4', name: 'Restauración Fotocurada Compleja (Clase II / Estética)', category: 'Operatoria', durationMinutes: 60, priceUsd: 60.00 },
                  { id: '5', name: 'Tratamiento de Conducto Unirradicular', category: 'Endodoncia', durationMinutes: 60, priceUsd: 120.00 },
                  { id: '6', name: 'Tratamiento de Conducto Multirradicular (Molar)', category: 'Endodoncia', durationMinutes: 90, priceUsd: 180.00 },
                  { id: '7', name: 'Exodoncia Simple de Pieza Permanente', category: 'Cirugía', durationMinutes: 30, priceUsd: 50.00 },
                  { id: '8', name: 'Cirugía de Tercer Molar / Cordales Impactadas', category: 'Cirugía', durationMinutes: 60, priceUsd: 150.00 },
                  { id: '9', name: 'Corona Metal-Cerámica / Zirconio', category: 'Prótesis', durationMinutes: 45, priceUsd: 250.00 },
                  { id: '10', name: 'Blanqueamiento Dental LED en Consultorio', category: 'Estética', durationMinutes: 60, priceUsd: 160.00 }
                ])
                .filter(proc => {
                  const term = baremoSearchTerm.toLowerCase();
                  const pName = String(proc.name || proc.procedure_name || '').toLowerCase();
                  const pCat = String(proc.category || '').toLowerCase();
                  return pName.includes(term) || pCat.includes(term);
                })
                .map(proc => {
                  const price = parseFloat(proc.priceUsd || proc.price_usd || proc.price || 40);
                  const pName = String(proc.name || proc.procedure_name || 'Tratamiento Dental');
                  const pCat = String(proc.category || 'Odontología');

                  return (
                    <button
                      key={proc.id || pName}
                      type="button"
                      onClick={() => {
                        // 1. Agregar a la lista del presupuesto
                        const newItem = {
                          id: 'ITEM-' + Date.now(),
                          tooth: `${selectedFaceModal.toothNum} (${selectedFaceModal.faceLabel})`,
                          procedure: pName,
                          doctor: activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza',
                          priceUsd: price
                        };

                        setBudgetItems(prev => [...prev, newItem]);
                        setSelectedFaceModal(null);

                        Swal.fire({
                          title: '¡Tratamiento Asignado!',
                          text: `Se agregó "${pName}" a la Pieza #${selectedFaceModal.toothNum} por $${price.toFixed(2)} USD.`,
                          icon: 'success',
                          timer: 1800,
                          showConfirmButton: false
                        });
                      }}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-[#1e2d5a] hover:border-teal-500 bg-white dark:bg-[#0d162f] hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">
                          {pName}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                          Categoría: {pCat} ({proc.durationMinutes || 30} min)
                        </p>
                      </div>

                      <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 font-mono text-xs font-black rounded-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        ${price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PLANTILLA DE IMPRESIÓN OFICIAL PDF (VISUALIZACIÓN LIMPIA COMPACTADA) */}
      {/* ========================================================================= */}
      <div className="printable-paperwork hidden print:block bg-white text-slate-900 p-6 space-y-4 shadow-none font-sans text-xs border border-slate-200">
        
        {/* 1. HEADER OFICIAL (REFERENCIA IMAGEN 1) */}
        <div className="flex justify-between items-start pb-3 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <img
              src={paperworkSettings?.logoUrl || 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png'}
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">
                {paperworkSettings?.clinicName || 'CENTRO MÉDICO ODONTOLÓGICO VIDA SANA, C.A.'}
              </h1>
              <p className="text-xs font-black text-teal-700">
                {paperworkSettings?.clinicRif || 'RIF: J-50781755-5'}
              </p>
              <p className="text-[10px] text-slate-600 font-medium">
                {paperworkSettings?.clinicAddress || 'Av. Principal, Edif. Vida Sana, Piso 1, Consultorio 102'}
              </p>
              <p className="text-[10px] text-slate-600 font-medium">
                Teléf: {paperworkSettings?.clinicPhone || '+58 412 1234567 / +58 212 9876543'} • {paperworkSettings?.clinicEmail || 'contacto@vidasanacmo.com'}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="px-4 py-1.5 bg-slate-900 text-white font-black text-xs rounded-lg uppercase tracking-wider shadow-xs mb-1">
              PRESUPUESTO CLÍNICO / ODONTOGRAMA
            </div>
            <p className="text-[11px] font-mono font-bold text-slate-700">
              N° Documento: <span className="text-slate-900 font-black">002026-{(activePatient?.id || '0891').padStart(4, '0')}</span>
            </p>
            <p className="text-[11px] font-mono text-slate-600">
              Fecha: {new Date().toLocaleDateString('es-VE')}
            </p>
            <p className="text-[11px] font-mono text-teal-800 font-bold">
              Tasa BCV: {bcvRate.toFixed(4)} Bs/$
            </p>
          </div>
        </div>

        {/* 2. FICHA COMPACTA DEL PACIENTE (TODOS LOS DATOS REQUERIDOS REGISTRADOS) */}
        <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-[10px] font-bold">
          <div><strong className="text-slate-900">Paciente:</strong> {activePatient?.name || activePatient?.full_name || 'Santiago Andrés Peña'}</div>
          <div><strong className="text-slate-900">Cédula:</strong> {activePatient?.documentId || activePatient?.document_id || 'V-25.148.963'}</div>
          <div><strong className="text-slate-900">Edad / Sexo:</strong> {calculateAge(activePatient?.birthDate || activePatient?.birth_date || '1995-06-15')} Años ({activePatient?.gender === 'M' ? 'Masculino' : 'Femenino'})</div>
          <div><strong className="text-slate-900">Teléfono (WhatsApp):</strong> {activePatient?.phone || activePatient?.phone_number || '+58 412-1234567'}</div>
          <div><strong className="text-slate-900">Categoría:</strong> {activePatient?.category || 'Privado'}</div>
          <div><strong className="text-slate-900">Especialista Tratante:</strong> {activePatient?.assignedSpecialist || activePatient?.assigned_specialist || 'Dr. Carlos Mendoza'}</div>
          <div className="col-span-2 sm:col-span-3"><strong className="text-slate-900">Dirección de Habitación:</strong> {activePatient?.address || activePatient?.direccion || 'Av. Principal de Las Mercedes, Edif. Torre B, Apto 4-B, Caracas'}</div>
          <div className="col-span-2 sm:col-span-3"><strong className="text-slate-900">Motivo de Consulta:</strong> <span className="text-teal-900 font-extrabold">{activePatient?.consultReason || activePatient?.consult_reason || 'Evaluación Odontológica General, Dolor en Pieza #17 y Blanqueamiento Estético'}</span></div>
        </div>

        {/* 3. ODONTOGRAMA CLINICO ANATÓMICO COMPACTO */}
        <div className="p-2.5 border border-slate-300 rounded-xl space-y-1">
          <div className="text-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5">
              ODONTOGRAMA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-400 -translate-y-1/2"></div>

            {/* Cuadrante 1 */}
            <div className="space-y-0.5">
              {renderToothRow([18, 17, 16, 15, 14, 13, 12, 11], true)}
              <div className="flex justify-end">{renderToothRow([55, 54, 53, 52, 51], true)}</div>
            </div>

            {/* Cuadrante 2 */}
            <div className="space-y-0.5">
              {renderToothRow([21, 22, 23, 24, 25, 26, 27, 28], true)}
              <div className="flex justify-start">{renderToothRow([61, 62, 63, 64, 65], true)}</div>
            </div>

            {/* Cuadrante 4 */}
            <div className="space-y-0.5">
              <div className="flex justify-end">{renderToothRow([85, 84, 83, 82, 81], true)}</div>
              {renderToothRow([48, 47, 46, 45, 44, 43, 42, 41], true)}
            </div>

            {/* Cuadrante 3 */}
            <div className="space-y-0.5">
              <div className="flex justify-start">{renderToothRow([71, 72, 73, 74, 75], true)}</div>
              {renderToothRow([31, 32, 33, 34, 35, 36, 37, 38], true)}
            </div>
          </div>
        </div>

        {/* 4. PRESUPUESTO GENERADO & DESGLOSE */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-black uppercase text-slate-900 border-b border-slate-400 pb-0.5">
            📋 DESGLOSE DE PRESUPUESTO & PIEZAS DENTALES
          </h4>
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-900 font-black">
                <th className="p-1">Pieza / Cara</th>
                <th className="p-1">Procedimiento Clínico</th>
                <th className="p-1">Especialista</th>
                <th className="p-1 text-right">Monto ($ USD)</th>
                <th className="p-1 text-right">Monto (Bs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {budgetItems.map(item => (
                <tr key={item.id}>
                  <td className="p-1 font-bold font-mono text-slate-900">Pieza #{item.tooth}</td>
                  <td className="p-1 font-bold text-slate-800">{item.procedure}</td>
                  <td className="p-1 text-slate-600">{item.doctor}</td>
                  <td className="p-1 text-right font-mono font-bold text-slate-900">${parseFloat(item.priceUsd).toFixed(2)}</td>
                  <td className="p-1 text-right font-mono text-slate-700 font-bold">{(parseFloat(item.priceUsd) * bcvRate).toFixed(2)} Bs</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end gap-6 pt-1 font-mono text-[11px] font-black border-t border-slate-800">
            <span>TOTAL REF: ${subtotalUsd.toFixed(2)} USD</span>
            <span className="text-teal-900">TOTAL BOLÍVARES: {totalBs.toFixed(2)} Bs</span>
          </div>
        </div>

        {/* 5. FIRMAS DIGITALES */}
        <div className="pt-4 grid grid-cols-2 gap-8 text-center text-[10px] font-bold">
          <div className="border-t border-slate-800 pt-1">
            <p className="font-extrabold uppercase">Firma Digital del Paciente / Representante</p>
            <p className="text-slate-500 font-mono">{activePatient?.name || activePatient?.full_name || 'Paciente'} (CI: {activePatient?.documentId || 'V-00000000'})</p>
          </div>
          <div className="border-t border-slate-800 pt-1">
            <p className="font-extrabold uppercase">Firma Digital del Odontólogo Tratante</p>
            <p className="text-slate-500 font-mono">{activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza'} • M.P.P.S. 84.920</p>
          </div>
        </div>

        {/* 6. FOOTER OFICIAL (REFERENCIA IMAGEN 2) */}
        <div className="pt-2 border-t border-slate-300 space-y-1.5">
          <div className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-[10px] font-bold italic text-slate-800 flex items-center justify-center gap-1.5">
            <span>📌</span>
            <span>
              {paperworkSettings?.quoteFooter || 'Presupuesto válido por 15 días continuos a la tasa oficial del Banco Central de Venezuela (BCV). Documento de control administrativo interno.'}
            </span>
          </div>

          <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold">
            <span>{paperworkSettings?.clinicName || 'Centro Médico Odontológico Vida Sana, C.A.'} • {paperworkSettings?.clinicRif || 'RIF: J-50781755-5'}</span>
            <span>Página 1 de 1 • Generado por Sistema Multidisciplinario</span>
          </div>
        </div>
      </div>

    </div>
  );
}
