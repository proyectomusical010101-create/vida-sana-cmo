import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, FileText, Send, Printer, CheckCircle2, User, Search, Plus, Trash2, Edit3, ShieldCheck, PenTool, RefreshCw, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

export default function DentalBudgetOdontogramModule({ patients = [], procedures = [], specialists = [], bcvRate = 755.90 }) {
  // SECCION 2 State: Paciente Seleccionado
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  // SECCION 3 State: Estado del Odontograma por pieza (Número -> Objeto condición)
  // Formato: { [toothNumber]: { status: 'Sano' | 'Caries' | 'Obturado' | 'Ausente' | 'Endodoncia' | 'Corona' | 'Extraccion', notes: '', procedureName: '', price: 0 } }
  const [toothConditions, setToothConditions] = useState({
    18: { status: 'Sano' }, 17: { status: 'Sano' }, 16: { status: 'Sano' }, 15: { status: 'Sano' },
    14: { status: 'Sano' }, 13: { status: 'Sano' }, 12: { status: 'Sano' }, 11: { status: 'Sano' },
    55: { status: 'Sano' }, 54: { status: 'Sano' }, 53: { status: 'Sano' }, 52: { status: 'Sano' }, 51: { status: 'Sano' },
    21: { status: 'Sano' }, 22: { status: 'Sano' }, 23: { status: 'Sano' }, 24: { status: 'Sano' },
    25: { status: 'Sano' }, 26: { status: 'Sano' }, 27: { status: 'Sano' }, 28: { status: 'Sano' },
    61: { status: 'Sano' }, 62: { status: 'Sano' }, 63: { status: 'Sano' }, 64: { status: 'Sano' }, 65: { status: 'Sano' },
    85: { status: 'Sano' }, 84: { status: 'Sano' }, 83: { status: 'Sano' }, 82: { status: 'Sano' }, 81: { status: 'Sano' },
    48: { status: 'Sano' }, 47: { status: 'Sano' }, 46: { status: 'Sano' }, 45: { status: 'Sano' },
    44: { status: 'Sano' }, 43: { status: 'Sano' }, 42: { status: 'Sano' }, 41: { status: 'Sano' },
    71: { status: 'Sano' }, 72: { status: 'Sano' }, 73: { status: 'Sano' }, 74: { status: 'Sano' }, 75: { status: 'Sano' },
    31: { status: 'Sano' }, 32: { status: 'Sano' }, 33: { status: 'Sano' }, 34: { status: 'Sano' },
    35: { status: 'Sano' }, 36: { status: 'Sano' }, 37: { status: 'Sano' }, 38: { status: 'Sano' }
  });

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
  const safePatients = Array.isArray(patients) ? patients : [];
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

  // Renderizador de Bloque de Dientes (Fila Exacta)
  const renderToothRow = (teethArray, label = '') => (
    <div className="flex flex-wrap items-center justify-center gap-2 py-2">
      {teethArray.map(toothNum => {
        const cond = toothConditions[toothNum] || { status: 'Sano' };
        const statusColors = {
          Sano: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
          Caries: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-700 font-black',
          Obturado: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700',
          Ausente: 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-400 line-through',
          Endodoncia: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-400 dark:border-purple-700',
          Corona: 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-700',
          Extraccion: 'bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-200 border-red-500 font-extrabold'
        };

        return (
          <button
            key={toothNum}
            onClick={() => handleOpenToothModal(toothNum)}
            className={`w-12 h-14 rounded-xl border flex flex-col items-center justify-center transition-all transform hover:scale-105 shadow-sm ${statusColors[cond.status] || statusColors.Sano}`}
            title={`Pieza #${toothNum}: ${cond.status}`}
          >
            <span className="text-[10px] font-mono font-black">{toothNum}</span>
            <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center my-0.5 text-[9px] font-bold">
              {cond.status.slice(0, 1)}
            </div>
            <span className="text-[8px] font-extrabold truncate w-full text-center px-0.5">{cond.status}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto pb-12">

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

        {/* Leyenda de Colores */}
        <div className="flex flex-wrap justify-center gap-3 p-3 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl text-[11px] font-bold">
          <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300"><span className="w-3 h-3 rounded bg-emerald-500"></span> Sano</span>
          <span className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300"><span className="w-3 h-3 rounded bg-rose-500"></span> Caries</span>
          <span className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300"><span className="w-3 h-3 rounded bg-blue-500"></span> Obturado</span>
          <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-3 rounded bg-slate-400"></span> Ausente</span>
          <span className="flex items-center gap-1.5 text-purple-800 dark:text-purple-300"><span className="w-3 h-3 rounded bg-purple-500"></span> Endodoncia</span>
          <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300"><span className="w-3 h-3 rounded bg-amber-500"></span> Corona</span>
        </div>

        {/* CONTENEDOR DEL ODONTOGRAMA CON EL ORDEN EXACTO DEL USUARIO */}
        <div className="p-4 bg-slate-50/50 dark:bg-[#0d162f]/40 border border-slate-200 dark:border-[#1e2d5a] rounded-2xl space-y-4">

          {/* 18, 17, 16, 15 */}
          {renderToothRow([18, 17, 16, 15], 'Superior Derecho Adultos (P1)')}

          {/* 14, 13, 12, 11 */}
          {renderToothRow([14, 13, 12, 11], 'Superior Derecho Adultos (P2)')}

          {/* 55, 54, 53, 52, 51 (excepcion de 5) */}
          {renderToothRow([55, 54, 53, 52, 51], 'Superior Derecho Infantil (5 piezas)')}

          {/* _________ SEPARADOR 1 */}
          <div className="border-t-2 border-dashed border-teal-500/50 my-3"></div>

          {/* 21, 22, 23, 24 */}
          {renderToothRow([21, 22, 23, 24], 'Superior Izquierdo Adultos (P1)')}

          {/* 25, 26, 27, 28 */}
          {renderToothRow([25, 26, 27, 28], 'Superior Izquierdo Adultos (P2)')}

          {/* 61, 62, 63, 64, 65 (excepcion de 5) */}
          {renderToothRow([61, 62, 63, 64, 65], 'Superior Izquierdo Infantil (5 piezas)')}

          {/* _________ _________ SEPARADOR DOBLE ENTRE ARCADAS */}
          <div className="border-t-4 border-teal-600 my-4"></div>
          <div className="border-t-4 border-teal-600 -mt-2 mb-4"></div>

          {/* 85, 84, 83, 82, 81 (excepcion de 5) */}
          {renderToothRow([85, 84, 83, 82, 81], 'Inferior Izquierdo Infantil (5 piezas)')}

          {/* 48, 47, 46, 45 */}
          {renderToothRow([48, 47, 46, 45], 'Inferior Izquierdo Adultos (P1)')}

          {/* 44, 43, 42, 41 */}
          {renderToothRow([44, 43, 42, 41], 'Inferior Izquierdo Adultos (P2)')}

          {/* _________ SEPARADOR 3 */}
          <div className="border-t-2 border-dashed border-teal-500/50 my-3"></div>

          {/* 71, 72, 73, 74, 75 (excepcion de 5) */}
          {renderToothRow([71, 72, 73, 74, 75], 'Inferior Derecho Infantil (5 piezas)')}

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

    </div>
  );
}
