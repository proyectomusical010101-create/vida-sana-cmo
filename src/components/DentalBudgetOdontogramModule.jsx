import React, { useState, useRef, useEffect } from 'react';
import { Stethoscope, FileText, Send, Printer, CheckCircle2, User, Search, Plus, Trash2, Edit3, ShieldCheck, PenTool, RefreshCw, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';

export default function DentalBudgetOdontogramModule({
  patients = [],
  setPatients,
  procedures = [],
  specialists = [],
  bcvRate = 755.90,
  paperworkSettings,
  onRegisterPayment,
  setTransactions,
  activeBudgetDraft,
  setActiveBudgetDraft,
  savedBudgetsHistory = [],
  setSavedBudgetsHistory
}) {
  const safePatients = Array.isArray(patients) ? patients : [];

  // Pestaña Activa del Módulo: 'editor' | 'history'
  const [activeMainTab, setActiveMainTab] = useState('editor');

  // Estados de Consentimiento Informado, Observaciones Clínicas, Método de Pago y Descuento
  const [clinicalObservations, setClinicalObservations] = useState(activeBudgetDraft?.clinicalObservations || '');
  const [consentText, setConsentText] = useState(
    activeBudgetDraft?.consentText ||
    paperworkSettings?.consentTemplate ||
    'Declaro haber sido informado sobre los procedimientos clínicos descritos en este presupuesto y autorizo la ejecución de los tratamientos bajo la tasa oficial BCV de la clínica.'
  );

  // Formas de pago múltiples / mixtas
  const [paymentSplits, setPaymentSplits] = useState(
    Array.isArray(activeBudgetDraft?.paymentSplits) && activeBudgetDraft.paymentSplits.length > 0
      ? activeBudgetDraft.paymentSplits
      : [{ id: 1, method: 'Pago Móvil', amountUsd: 0 }]
  );

  const [discountPercent, setDiscountPercent] = useState(activeBudgetDraft?.discountPercent || '0');

  useEffect(() => {
    if (!consentText && paperworkSettings?.consentTemplate) {
      setConsentText(paperworkSettings.consentTemplate);
    }
  }, [paperworkSettings]);

  // SECCION 2 State: Paciente Seleccionado
  const [selectedPatientId, setSelectedPatientId] = useState(activeBudgetDraft?.selectedPatientId || safePatients[0]?.id || '');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  // SECCION 3 State: Odontodiagrama Anatómico 5 Caras por Pieza (Modos: 'red' | 'blue' | 'absence_blue' | 'extraction_red')
  const [activeMarkMode, setActiveMarkMode] = useState(activeBudgetDraft?.activeMarkMode || 'red');
  const [toothSurfaces, setToothSurfaces] = useState(
    activeBudgetDraft?.toothSurfaces || {}
  );

  // Modal de Selección de Tratamiento del Baremo por Cara Seleccionada
  const [selectedFaceModal, setSelectedFaceModal] = useState(null);
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

  // Formateador de Anamnesis y Patologías para la plantilla PDF
  const renderPathologySummary = (patient) => {
    if (!patient) return 'Sin patologías ni alergias registradas (Paciente Sano)';
    const ana = patient.anamnesis || {};
    const items = [];
    if (ana.medTreatment?.has === 'SI') items.push(`Tratamiento: ${ana.medTreatment.details || 'Sí'}`);
    if (ana.allergies?.has === 'SI') items.push(`Alergias: ${ana.allergies.details || 'Sí'}`);
    if (ana.penicillinAllergy?.has === 'SI') items.push('Alérgico a Penicilina');
    if (ana.childDiseases?.has === 'SI') items.push(`Enf. Niñez: ${ana.childDiseases.details || 'Sí'}`);
    if (ana.surgeries) items.push(`Cirugías: ${ana.surgeries}`);
    if (ana.heartProblems?.has === 'SI') items.push('Cardiopatía/Corazón');
    if (ana.respiratory?.adenoids || ana.respiratory?.tonsils) items.push('Trastorno Respiratorio');
    
    const habits = patient.extraoral_exam?.oralHabits || {};
    if (habits.nailBiting === 'SI') items.push('Onicofagia');
    if (habits.mouthBreather === 'SI') items.push('Respirador Bucal');
    if (habits.others) items.push(habits.others);

    return items.length > 0 ? items.join(' • ') : 'Sin patologías ni alergias registradas (Paciente Sano)';
  };

  const faceLabelMap = {
    top: 'Superior / Vestibular',
    bottom: 'Inferior / Lingual / Palatina',
    left: 'Mesial (Izquierda)',
    right: 'Distal (Derecha)',
    center: 'Oclusal / Incisal (Centro)'
  };

  const handleFaceClick = (toothNum, faceKey) => {
    // 1. MODO AUSENCIA (AZUL) -> Poner/Quitar X Azul en todo el diente
    if (activeMarkMode === 'absence_blue') {
      setToothSurfaces(prev => {
        const current = prev[toothNum] || {};
        const newCross = current.cross === 'blue' ? null : 'blue';
        return {
          ...prev,
          [toothNum]: {
            ...current,
            cross: newCross
          }
        };
      });
      return;
    }

    // 2. MODO EXTRACCIÓN (ROJO) -> Poner/Quitar X Roja en todo el diente
    if (activeMarkMode === 'extraction_red') {
      setToothSurfaces(prev => {
        const current = prev[toothNum] || {};
        const newCross = current.cross === 'red' ? null : 'red';
        return {
          ...prev,
          [toothNum]: {
            ...current,
            cross: newCross
          }
        };
      });
      return;
    }

    // 3. MODO ROJO (LESIÓN) / AZUL (SANO) -> Pintar cara individual
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

    // Si es Rojo (Lesión), abrir modal para asociar procedimiento del baremo
    if (activeMarkMode === 'red') {
      setSelectedFaceModal({
        toothNum,
        faceKey,
        faceLabel: faceLabelMap[faceKey] || 'Cara Dental'
      });
    }
  };

  const handleRightClickFace = (toothNum, faceKey) => {
    setToothSurfaces(prev => {
      const current = prev[toothNum] || {};
      const updated = { ...current };
      delete updated[faceKey];
      delete updated.cross;

      const nextSurfaces = { ...prev };
      if (Object.keys(updated).length === 0) {
        delete nextSurfaces[toothNum];
      } else {
        nextSurfaces[toothNum] = updated;
      }
      return nextSurfaces;
    });

    // Eliminar también las partidas asociadas a esa pieza en el presupuesto
    setBudgetItems(prev => prev.filter(item => String(item.tooth) !== String(toothNum)));
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
  const [budgetItems, setBudgetItems] = useState(
    Array.isArray(activeBudgetDraft?.budgetItems)
      ? activeBudgetDraft.budgetItems
      : []
  );
  const [customProcName, setCustomProcName] = useState('');
  const [customToothNum, setCustomToothNum] = useState('General');
  const [customProcPrice, setCustomProcPrice] = useState('40');

  // Sincronizar automáticamente TODO el borrador activo al padre App.jsx para persistencia al cambiar de pestaña
  useEffect(() => {
    if (typeof setActiveBudgetDraft === 'function') {
      setActiveBudgetDraft({
        selectedPatientId,
        toothSurfaces,
        budgetItems,
        clinicalObservations,
        consentText,
        discountPercent,
        paymentSplits,
        activeMarkMode
      });
    }
  }, [selectedPatientId, toothSurfaces, budgetItems, clinicalObservations, consentText, discountPercent, paymentSplits, activeMarkMode]);

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

  // Totales de Presupuesto con Descuento Manual
  const subtotalUsd = budgetItems.reduce((acc, item) => acc + (parseFloat(item.priceUsd) || 0), 0);
  const discPercentNum = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));
  const discountUsd = subtotalUsd * (discPercentNum / 100);
  const finalTotalUsd = subtotalUsd - discountUsd;
  const finalTotalBs = finalTotalUsd * bcvRate;
  const discountBs = discountUsd * bcvRate;

  // Plantilla de Mensaje de WhatsApp Personalizable con Link
  const [waMessageTemplate, setWaMessageTemplate] = useState(
    'Hola {PACIENTE}, le enviamos su Presupuesto Clínico Odontológico de {CLINICA}.\n\n📌 *Resumen de Propuesta Económica:*\n- Subtotal Ref.: ${SUBTOTAL_USD} USD\n- Descuento ({DESCUENTO_PCT}%): -${DESCUENTO_USD} USD\n- Total Ref. Final: ${TOTAL_USD} USD ({TOTAL_BS} Bs a Tasa BCV {TASA_BCV} Bs/$)\n- Método de Pago: {METODO_PAGO}\n\nPuedes consultar y descargar tu presupuesto en línea ingresando aquí:\n{LINK_PRESUPUESTO}\n\nQuedamos a su entera disposición.'
  );
  const [showWaCustomizer, setShowWaCustomizer] = useState(false);

  // Formateador dinámico del mensaje de WhatsApp
  const getFormattedWaMessage = () => {
    const pNameVal = activePatient?.name || activePatient?.full_name || 'Estimado Paciente';
    const clinicNameVal = paperworkSettings?.clinicName || 'Centro Médico Odontológico Vida Sana, C.A.';
    const subtotalUsdStr = subtotalUsd.toFixed(2);
    const discUsdStr = discountUsd.toFixed(2);
    const totalUsdStr = finalTotalUsd.toFixed(2);
    const totalBsStr = finalTotalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const bcvRateStr = (parseFloat(bcvRate) || 755.90).toFixed(2);
    const pIdVal = activePatient?.id || '100-01';
    const linkVal = `${window.location.origin}/?pdf=1&patientId=${encodeURIComponent(pIdVal)}`;

    const paymentMethodsSummary = (paymentSplits && paymentSplits.length > 0)
      ? paymentSplits.map(s => `${s.method}: $${(parseFloat(s.amountUsd) || 0).toFixed(2)} USD`).join(' + ')
      : 'Pago Móvil / Efectivo';

    return waMessageTemplate
      .replace(/{PACIENTE}/g, pNameVal)
      .replace(/{CLINICA}/g, clinicNameVal)
      .replace(/{SUBTOTAL_USD}/g, subtotalUsdStr)
      .replace(/{DESCUENTO_PCT}/g, discPercentNum.toString())
      .replace(/{DESCUENTO_USD}/g, discUsdStr)
      .replace(/{TOTAL_USD}/g, totalUsdStr)
      .replace(/{TOTAL_BS}/g, totalBsStr)
      .replace(/{METODO_PAGO}/g, paymentMethodsSummary)
      .replace(/{TASA_BCV}/g, bcvRateStr)
      .replace(/{LINK_PRESUPUESTO}/g, linkVal);
  };

  // Construcción garantizada del enlace directo a WhatsApp (sin bloqueador de popups)
  const getWaHref = () => {
    let rawPhone = String(activePatient?.phone || activePatient?.phone_number || activePatient?.telefonos || '').replace(/[^0-9]/g, '');
    if (rawPhone.startsWith('04')) {
      rawPhone = '58' + rawPhone.slice(1);
    } else if (rawPhone.length === 10 && !rawPhone.startsWith('58')) {
      rawPhone = '58' + rawPhone;
    }

    const messageText = encodeURIComponent(getFormattedWaMessage());
    if (rawPhone && rawPhone.length >= 8) {
      return `https://api.whatsapp.com/send?phone=${rawPhone}&text=${messageText}`;
    }
    return `https://api.whatsapp.com/send?text=${messageText}`;
  };

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

  // Agregar partida manual al presupuesto (Sincronizada con el Odontodiagrama arriba)
  const handleAddCustomBudgetItem = (e) => {
    e.preventDefault();
    if (!customProcName) return;

    const price = parseFloat(customProcPrice) || 0;
    const toothVal = customToothNum || 'General';
    const newItem = {
      id: `ITEM-${Date.now().toString().slice(-4)}`,
      tooth: toothVal,
      procedure: customProcName,
      doctor: activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza',
      priceUsd: price
    };

    setBudgetItems(prev => [...prev, newItem]);

    // Reflejar arriba en el odontodiagrama si se especificó número de pieza
    const parsedTooth = parseInt(toothVal);
    if (!isNaN(parsedTooth)) {
      setToothSurfaces(prev => ({
        ...prev,
        [parsedTooth]: {
          ...(prev[parsedTooth] || {}),
          center: 'red'
        }
      }));
    }

    setCustomProcName('');
    setCustomProcPrice('40');

    Swal.fire({
      title: 'Tratamiento Añadido',
      text: `Se agregó "${customProcName}" al presupuesto y se reflejó en el Odontodiagrama.`,
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });
  };

  // Eliminar partida de presupuesto (Sincronizada hacia arriba en Odontodiagrama)
  const handleDeleteBudgetItem = (id) => {
    const itemToDelete = budgetItems.find(item => item.id === id);
    const updatedItems = budgetItems.filter(item => item.id !== id);
    setBudgetItems(updatedItems);

    if (itemToDelete && itemToDelete.tooth && itemToDelete.tooth !== 'General') {
      const toothNum = itemToDelete.tooth;
      const remainingForTooth = updatedItems.some(i => String(i.tooth) === String(toothNum));
      if (!remainingForTooth) {
        setToothSurfaces(prev => {
          const nextSurfaces = { ...prev };
          delete nextSurfaces[toothNum];
          return nextSurfaces;
        });
      }
    }
  };

  // Generar / Guardar Presupuesto Final Certificado e Histórico Permanente
  const handleCertifyBudget = () => {
    if (!patientSigned || !doctorSigned) {
      Swal.fire('Firmas Pendientes', 'Por favor capture la Firma del Paciente y la Firma del Odontólogo antes de certificar.', 'warning');
      return;
    }

    const paymentMethodsSummary = paymentSplits
      .map(s => `${s.method}: $${(parseFloat(s.amountUsd) || 0).toFixed(2)} USD`)
      .join(' + ');

    const newTx = {
      id: `TX-BDG-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().slice(0, 10),
      patientId: activePatient?.id || '100-01',
      patientName: activePatient?.name || activePatient?.full_name || 'Paciente',
      doctor: activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza',
      procedure: `Presupuesto Odontológico (${budgetItems.length} ítems)`,
      subtotal: subtotalUsd,
      discountPercent: discPercentNum,
      discountAmount: discountUsd,
      total: finalTotalUsd,
      amount: finalTotalUsd,
      paymentMethod: paymentMethodsSummary || 'Pago Móvil',
      status: 'Completado',
      notes: discPercentNum > 0
        ? `Presupuesto Certificado con ${discPercentNum}% descuento. Formas de pago: ${paymentMethodsSummary}`
        : `Presupuesto Certificado. Formas de pago: ${paymentMethodsSummary}`,
      area: 'ODONTOLOGIA'
    };

    // 1. Guardar en Transacciones de Flujo de Caja
    if (typeof onRegisterPayment === 'function') {
      onRegisterPayment(newTx);
    }

    // 2. Guardar permanentemente en el Histórico Global de Presupuestos
    const budgetRecord = {
      id: `BDG-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().slice(0, 10),
      patientId: activePatient?.id || '100-01',
      patientName: activePatient?.name || activePatient?.full_name || 'Paciente',
      doctor: activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza',
      items: [...budgetItems],
      subtotalUsd,
      discountPercent: discPercentNum,
      discountUsd,
      finalTotalUsd,
      finalTotalBs,
      bcvRate,
      paymentSplits: [...paymentSplits],
      observations: clinicalObservations,
      consentText: consentText
    };

    if (typeof setSavedBudgetsHistory === 'function') {
      setSavedBudgetsHistory(prev => [budgetRecord, ...(prev || [])]);
    }

    // 3. Registrar entrada permanente en la Historia Clínica del Paciente
    if (activePatient && typeof setPatients === 'function') {
      const updatedHistoryEntry = {
        date: new Date().toISOString().slice(0, 10),
        procedure: `Presupuesto Certificado #${budgetRecord.id} (${budgetItems.length} ítems)`,
        doctor: activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza',
        cost: finalTotalUsd,
        status: 'Completado'
      };
      const updatedPatients = safePatients.map(p => p.id === activePatient.id ? {
        ...p,
        history: [updatedHistoryEntry, ...(Array.isArray(p.history) ? p.history : [])]
      } : p);
      setPatients(updatedPatients);
    }

    // 4. Reiniciar borrador activo a cero una vez guardado
    setToothSurfaces({});
    setBudgetItems([]);
    setClinicalObservations('');
    setDiscountPercent('0');
    setPaymentSplits([{ id: 1, method: 'Pago Móvil', amountUsd: 0 }]);
    if (typeof setActiveBudgetDraft === 'function') {
      setActiveBudgetDraft({
        selectedPatientId: '',
        toothSurfaces: {},
        budgetItems: [],
        clinicalObservations: '',
        consentText: paperworkSettings?.consentTemplate || '',
        discountPercent: '0',
        paymentSplits: [{ id: 1, method: 'Pago Móvil', amountUsd: 0 }],
        activeMarkMode: 'red'
      });
    }

    Swal.fire({
      title: '¡Presupuesto Certificado & Guardado!',
      text: `El presupuesto de $${finalTotalUsd.toFixed(2)} USD (${finalTotalBs.toFixed(2)} Bs) para ${activePatient?.name || 'el paciente'} ha sido registrado permanentemente en su Historia Clínica y en el Histórico de Presupuestos.`,
      icon: 'success',
      confirmButtonColor: '#0d9488'
    });
  };

  // Función para Limpiar Borrador a cero manualmente
  const handleResetDraft = () => {
    Swal.fire({
      title: '¿Limpiar todo el Odontograma y Borrador?',
      text: 'Se restablecerán las piezas marcadas, procedimientos y montos a cero para iniciar un nuevo presupuesto desde el principio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Limpiar a Cero',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        setToothSurfaces({});
        setBudgetItems([]);
        setClinicalObservations('');
        setDiscountPercent('0');
        setPaymentSplits([{ id: 1, method: 'Pago Móvil', amountUsd: 0 }]);
        setActiveMarkMode('red');
        if (typeof setActiveBudgetDraft === 'function') {
          setActiveBudgetDraft({
            selectedPatientId: safePatients[0]?.id || '',
            toothSurfaces: {},
            budgetItems: [],
            clinicalObservations: '',
            consentText: paperworkSettings?.consentTemplate || '',
            discountPercent: '0',
            paymentSplits: [{ id: 1, method: 'Pago Móvil', amountUsd: 0 }],
            activeMarkMode: 'red'
          });
        }
        Swal.fire('Borrador Limpio', 'El odontodiagrama y presupuesto están listos desde cero.', 'success');
      }
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

            {/* SVG Diente 5 Caras con Soporte de X Cruzada */}
            <div 
              className={`${isCompact ? 'w-6 h-6' : 'w-10 h-10'} relative bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 shadow-xs cursor-pointer select-none`}
              onClick={() => {
                if (!isCompact && (activeMarkMode === 'absence_blue' || activeMarkMode === 'extraction_red')) {
                  handleFaceClick(toothNum, 'center');
                }
              }}
            >
              <svg viewBox="0 0 40 40" className="w-full h-full">
                {/* Cuadro exterior */}
                <rect x="0" y="0" width="40" height="40" fill="none" stroke="#cbd5e1" strokeWidth="1" />

                {/* Cara Top (Vestibular / Superior) */}
                <polygon
                  points="0,0 40,0 28,12 12,12"
                  fill={getFaceColorHex(faces.top)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCompact) handleFaceClick(toothNum, 'top');
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isCompact) handleRightClickFace(toothNum, 'top');
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                {/* Cara Right (Distal / Derecha) */}
                <polygon
                  points="40,0 40,40 28,28 28,12"
                  fill={getFaceColorHex(faces.right)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCompact) handleFaceClick(toothNum, 'right');
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isCompact) handleRightClickFace(toothNum, 'right');
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                {/* Cara Bottom (Lingual / Inferior) */}
                <polygon
                  points="40,40 0,40 12,28 28,28"
                  fill={getFaceColorHex(faces.bottom)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCompact) handleFaceClick(toothNum, 'bottom');
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isCompact) handleRightClickFace(toothNum, 'bottom');
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                {/* Cara Left (Mesial / Izquierda) */}
                <polygon
                  points="0,40 0,0 12,12 12,28"
                  fill={getFaceColorHex(faces.left)}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCompact) handleFaceClick(toothNum, 'left');
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isCompact) handleRightClickFace(toothNum, 'left');
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCompact) handleFaceClick(toothNum, 'center');
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isCompact) handleRightClickFace(toothNum, 'center');
                  }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />

                {/* Gran 'X' para Ausencia (Azul) o Extracción (Roja) sobre todo el diente */}
                {faces.cross && (
                  <g pointerEvents="none">
                    <line
                      x1="3"
                      y1="3"
                      x2="37"
                      y2="37"
                      stroke={faces.cross === 'red' ? '#ef4444' : '#2563eb'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="37"
                      y1="3"
                      x2="3"
                      y2="37"
                      stroke={faces.cross === 'red' ? '#ef4444' : '#2563eb'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </g>
                )}
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
      <div className="web-only-form space-y-6">

        {/* Pestañas Principales: Editor de Presupuesto vs Histórico Permanente */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] p-3 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMainTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'editor'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              📝 1. Elaborar Presupuesto & Odontodiagrama
            </button>

            <button
              onClick={() => setActiveMainTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                activeMainTab === 'history'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              📋 2. Histórico de Presupuestos ({savedBudgetsHistory.length})
            </button>
          </div>

          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
            ✓ Guardado Automático & Histórico Integrado
          </span>
        </div>

        {activeMainTab === 'history' ? (
          <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1e2d5a]">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Histórico Permanente de Presupuestos Emitidos
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Registro permanente e inalterable de todos los presupuestos cotizados y certificados en la clínica.
                </p>
              </div>
            </div>

            {savedBudgetsHistory.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-[#0d162f] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                <span className="text-3xl block">📋</span>
                <h4 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No hay presupuestos certificados guardados aún</h4>
                <p className="text-xs text-slate-500">Al elaborar y certificar un presupuesto en el editor, aparecerá aquí permanentemente.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedBudgetsHistory.map((b) => (
                  <div key={b.id} className="p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-[#1e2d5a] pb-2 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-teal-600 text-white rounded font-mono text-[10px] font-black">{b.id}</span>
                        <span className="text-slate-900 dark:text-white font-extrabold">{b.patientName}</span>
                        <span className="text-slate-400">({b.date})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-teal-700 dark:text-teal-400 font-black text-sm">${(b.finalTotalUsd || 0).toFixed(2)} USD</span>
                        <span className="font-mono text-blue-700 dark:text-blue-400 font-bold text-xs">({(b.finalTotalBs || 0).toFixed(2)} Bs)</span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Procedimientos ({b.items?.length || 0}):</span>
                      <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 font-medium">
                        {(b.items || []).map((item, idx) => (
                          <li key={idx}>Pieza #{item.tooth}: {item.procedure} (${item.priceUsd})</li>
                        ))}
                      </ul>
                    </div>

                    {Array.isArray(b.paymentSplits) && b.paymentSplits.length > 0 && (
                      <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        <span>Formas de Pago: </span>
                        {b.paymentSplits.map(s => `${s.method}: $${(parseFloat(s.amountUsd) || 0).toFixed(2)} USD`).join(' • ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>

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
              Flujo clínico completo: selecciona el paciente, marca hallazgos en el odontodiagrama, genera la propuesta económica y certifica con firma digital.
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

            <button
              onClick={() => setShowWaCustomizer(!showWaCustomizer)}
              className="px-3 py-2.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-700 hover:bg-teal-100 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <Edit3 className="w-4 h-4" />
              {showWaCustomizer ? 'Ocultar Edición Mensaje' : 'Personalizar Mensaje WhatsApp'}
            </button>

            <a
              href={getWaHref()}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all inline-flex items-center"
            >
              <Send className="w-4 h-4" />
              Enviar por WhatsApp
            </a>
          </div>
        </div>

        {/* PANEL EDITABLE Y PERSONALIZABLE DE MENSAJE WHATSAPP */}
        {showWaCustomizer && (
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-4 text-xs transition-all">
            <div className="flex justify-between items-center border-b border-emerald-200 dark:border-emerald-800 pb-2">
              <h4 className="font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                💬 Personalizador de Plantilla de Mensaje WhatsApp
              </h4>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                Edita la plantilla y usa las etiquetas automáticas
              </span>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200">
                Plantilla del Texto a Enviar (Puedes escribir el mensaje que desees):
              </label>
              <textarea
                rows={4}
                value={waMessageTemplate}
                onChange={(e) => setWaMessageTemplate(e.target.value)}
                className="w-full p-3 bg-white dark:bg-[#0d162f] border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Etiquetas Dinámicas rápidas */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Clic para insertar variable dinámica:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '{PACIENTE}', label: 'Nombre Paciente' },
                  { tag: '{CLINICA}', label: 'Nombre Clínica' },
                  { tag: '{TOTAL_USD}', label: 'Total USD' },
                  { tag: '{TOTAL_BS}', label: 'Total Bolívares' },
                  { tag: '{TASA_BCV}', label: 'Tasa BCV' },
                  { tag: '{LINK_PRESUPUESTO}', label: 'Link Web Presupuesto' }
                ].map(item => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setWaMessageTemplate(prev => prev + ' ' + item.tag)}
                    className="px-2.5 py-1 bg-white dark:bg-[#111c3a] border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-lg text-[10px] font-mono font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all"
                  >
                    + {item.tag} ({item.label})
                  </button>
                ))}
              </div>
            </div>

            {/* Vista previa en tiempo real */}
            <div className="p-3 bg-white dark:bg-[#0d162f] border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                👁️ Vista Previa en Vivo del Mensaje (Como lo recibirá el paciente {activePatient?.name || activePatient?.full_name}):
              </span>
              <p className="font-sans whitespace-pre-wrap text-xs leading-relaxed font-semibold text-slate-800 dark:text-slate-200 p-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg">
                {getFormattedWaMessage()}
              </p>
            </div>
          </div>
        )}

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
              Odontodiagrama 2D Clínico (Estructura FDI Regulada)
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
            {/* 1. Rojo: Lesión */}
            <button
              type="button"
              onClick={() => setActiveMarkMode('red')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-extrabold cursor-pointer ${
                activeMarkMode === 'red'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-rose-400'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border border-white"></span>
              <span>Rojo: Lesión</span>
            </button>

            {/* 2. Azul: Sano */}
            <button
              type="button"
              onClick={() => setActiveMarkMode('blue')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-extrabold cursor-pointer ${
                activeMarkMode === 'blue'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white"></span>
              <span>Azul: Sano</span>
            </button>

            {/* 3. Ausencia (Azul) */}
            <button
              type="button"
              onClick={() => setActiveMarkMode('absence_blue')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-extrabold cursor-pointer ${
                activeMarkMode === 'absence_blue'
                  ? 'bg-blue-700 text-white shadow-md ring-2 ring-blue-400 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-blue-400'
              }`}
              title="Marcar 'X' Azul en todo el diente para ausencia dental"
            >
              <span className="font-black text-sm text-blue-500 bg-blue-100 dark:bg-blue-950 px-1 rounded leading-none">✕</span>
              <span>Ausencia (Azul)</span>
            </button>

            {/* 4. Extracción (Rojo) */}
            <button
              type="button"
              onClick={() => setActiveMarkMode('extraction_red')}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all font-extrabold cursor-pointer ${
                activeMarkMode === 'extraction_red'
                  ? 'bg-rose-700 text-white shadow-md ring-2 ring-rose-400 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-rose-400'
              }`}
              title="Marcar 'X' Roja en todo el diente para indicación de extracción"
            >
              <span className="font-black text-sm text-rose-500 bg-rose-100 dark:bg-rose-950 px-1 rounded leading-none">✕</span>
              <span>Extracción (Rojo)</span>
            </button>

            {/* Botón para Limpiar Todo el Borrador */}
            <button
              type="button"
              onClick={handleResetDraft}
              className="px-3 py-2 bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-rose-950 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold cursor-pointer border border-slate-300 dark:border-slate-700"
              title="Limpiar todo el odontograma y borrador a cero"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Borrador</span>
            </button>
          </div>
        </div>

        {/* CONTENEDOR DEL ODONTODIAGRAMA */}
        
        {/* VISTA ESCRITORIO (4 Cuadrantes Clínicos Regulados en Cruz con Líneas Divisorias) */}
        <div className="hidden lg:block p-6 bg-slate-50/50 dark:bg-[#0d162f]/40 border border-slate-200 dark:border-[#1e2d5a] rounded-2xl relative shadow-xs">
          
          {/* Título de Odontodiagrama Impreso/Clínico */}
          <div className="text-center pb-4 mb-2">
            <span className="text-sm font-black tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b-2 border-slate-800 dark:border-slate-300 pb-0.5">
              ODONTODIAGRAMA
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
                    No hay ítems en el presupuesto. Marca piezas en el odontodiagrama o agrega tratamientos manuales.
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
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 font-mono font-black">
                          <span className="text-emerald-700 dark:text-emerald-400">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.priceUsd}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setBudgetItems(budgetItems.map(b => b.id === item.id ? { ...b, priceUsd: val } : b));
                            }}
                            className="w-24 p-1 text-right bg-white dark:bg-[#0d162f] border border-teal-400 dark:border-teal-700 rounded text-xs font-black font-mono text-emerald-950 dark:text-emerald-200 focus:ring-2 focus:ring-teal-500"
                            title="Haz clic para modificar el precio especial del convenio o servicio"
                          />
                          <span className="text-[10px] text-slate-500">USD</span>
                        </div>
                      </td>
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

        {/* Descuento Manual & Método de Pago Asignado */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl text-xs font-bold">
          
          {/* Porcentaje de Descuento Manual */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="block text-slate-800 dark:text-slate-200 font-extrabold text-xs">
              🏷️ Descuento Manual (%):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-black text-slate-900 dark:text-white"
                placeholder="0"
              />
              <span className="font-mono font-black text-teal-700 dark:text-teal-300 text-sm">%</span>
            </div>
            {discPercentNum > 0 && (
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-extrabold block">
                Monto Descuento: -${discountUsd.toFixed(2)} USD (-{discountBs.toFixed(2)} Bs)
              </span>
            )}
          </div>

          {/* Selector de Forma(s) de Pago Múltiples y Mixtas */}
          <div className="md:col-span-8 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-800 dark:text-slate-200 font-extrabold text-xs">
                💳 Forma(s) de Pago Asignada(s) (Soporta Pago Mixto / Múltiple):
              </label>
              <button
                type="button"
                onClick={() => {
                  const currentSum = paymentSplits.reduce((acc, p) => acc + (parseFloat(p.amountUsd) || 0), 0);
                  const remaining = Math.max(0, finalTotalUsd - currentSum);
                  setPaymentSplits([...paymentSplits, { id: Date.now(), method: 'Pago Móvil', amountUsd: remaining }]);
                }}
                className="text-[11px] bg-teal-600 hover:bg-teal-700 text-white font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> + Agregar Otro Método
              </button>
            </div>

            <div className="space-y-2">
              {paymentSplits.map((split, index) => (
                <div key={split.id || index} className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-[#0d162f] p-2.5 rounded-xl border border-slate-200 dark:border-[#1e2d5a]">
                  <select
                    value={split.method}
                    onChange={(e) => {
                      const nextSplits = paymentSplits.map((s, i) => i === index ? { ...s, method: e.target.value } : s);
                      setPaymentSplits(nextSplits);
                    }}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-black text-slate-900 dark:text-white"
                  >
                    <option value="Pago Móvil">📱 Pago Móvil</option>
                    <option value="Efectivo">💵 Efectivo</option>
                    <option value="Zelle">🏦 Zelle</option>
                    <option value="Binance">🪙 Binance</option>
                    <option value="Cashea">📱 Cashea (Cta. por Cobrar)</option>
                  </select>

                  <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                    <span className="text-xs font-bold text-slate-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={split.amountUsd}
                      onChange={(e) => {
                        const nextSplits = paymentSplits.map((s, i) => i === index ? { ...s, amountUsd: parseFloat(e.target.value) || 0 } : s);
                        setPaymentSplits(nextSplits);
                      }}
                      placeholder="Monto en USD"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                      ({((parseFloat(split.amountUsd) || 0) * bcvRate).toFixed(2)} Bs)
                    </span>
                  </div>

                  {paymentSplits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPaymentSplits(paymentSplits.filter((_, i) => i !== index))}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg text-xs cursor-pointer"
                      title="Quitar este método de pago"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Resumen Total con Descuento */}
        <div className="flex flex-col sm:flex-row justify-end items-end gap-6 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-300 dark:border-teal-800 rounded-xl text-right">
          {discPercentNum > 0 && (
            <div className="pr-4 border-r border-teal-300 dark:border-teal-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Subtotal Bruto:</span>
              <span className="text-lg font-black font-mono text-slate-700 dark:text-slate-300 line-through">${subtotalUsd.toFixed(2)} USD</span>
            </div>
          )}

          <div>
            <span className="text-xs font-bold text-teal-900 dark:text-teal-300 block">Total Final en Dólares ($):</span>
            <span className="text-2xl font-black font-mono text-teal-950 dark:text-white">${finalTotalUsd.toFixed(2)} USD</span>
          </div>

          <div className="border-l border-teal-300 dark:border-teal-700 pl-4">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 block">Total Final en Bolívares (Tasa BCV {bcvRate.toFixed(2)}):</span>
            <span className="text-2xl font-black font-mono text-blue-950 dark:text-blue-200">{finalTotalBs.toFixed(2)} Bs</span>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* SECCION 5: CONSENTIMIENTO INFORMADO, OBSERVACIONES CLINICAS & FIRMAS DIGITALES */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] shadow-sm p-6 rounded-2xl space-y-6">
        <div>
          <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 font-black text-[10px] rounded uppercase tracking-wider">
            Sección 5 • Certificación Legal & Firmas
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-teal-600" />
            Observaciones Clínicas, Consentimiento Informado & Firmas Digitales
          </h3>
        </div>

        {/* 1. OBSERVACIONES CLINICAS (NOTAS DEL MEDICO) - JUSTO ARRIBA DEL CONSENTIMIENTO */}
        <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl">
          <label className="block text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-teal-600" />
            Observaciones Clínicas (Notas del Médico para este Presupuesto)
          </label>
          <textarea
            rows="2"
            value={clinicalObservations}
            onChange={(e) => setClinicalObservations(e.target.value)}
            placeholder="Escriba aquí las observaciones clínicas específicas, recomendaciones o detalles médicos del presupuesto..."
            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
          />
          <span className="text-[10px] text-slate-500 font-medium block">
            Estas notas clínicas aparecerán en la propuesta impresa y comprobante enviado al paciente.
          </span>
        </div>

        {/* 2. CONSENTIMIENTO INFORMADO (EDITABLE EN VIVO / PREDETERMINADO DESDE PAPELERIA) - JUSTO ABAJO DE OBSERVACIONES */}
        <div className="space-y-1.5 p-4 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 rounded-xl">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-black text-teal-900 dark:text-teal-300 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Consentimiento Informado (Editable en Vivo)
            </label>
            <span className="text-[10px] text-teal-700 dark:text-teal-400 font-extrabold">
              ✓ Cargado desde la plantilla predeterminada de Papelería
            </span>
          </div>
          <textarea
            rows="3"
            value={consentText}
            onChange={(e) => setConsentText(e.target.value)}
            className="w-full p-3 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-[10px] text-slate-500 font-medium block">
            Puedes modificar o ajustar el texto del consentimiento informado exclusivamente para este presupuesto.
          </span>
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
                  Guardar en Odontodiagrama
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
      </>
      )}
      </div>

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
              PRESUPUESTO CLÍNICO / ODONTODIAGRAMA
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

        {/* 2. FICHA COMPACTA DEL PACIENTE (TODOS LOS DATOS REQUERIDOS REGISTRADOS + PATOLOGÍAS) */}
        <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-[10px] font-bold">
          <div><strong className="text-slate-900">Paciente:</strong> {activePatient?.name || activePatient?.full_name || 'Santiago Andrés Peña'}</div>
          <div><strong className="text-slate-900">Cédula:</strong> {activePatient?.documentId || activePatient?.document_id || 'V-25.148.963'}</div>
          <div><strong className="text-slate-900">Edad / Sexo:</strong> {calculateAge(activePatient?.birthDate || activePatient?.birth_date || '1995-06-15')} Años ({activePatient?.gender === 'M' ? 'Masculino' : 'Femenino'})</div>
          <div><strong className="text-slate-900">Teléfono (WhatsApp):</strong> {activePatient?.phone || activePatient?.phone_number || '+58 412-1234567'}</div>
          <div><strong className="text-slate-900">Categoría:</strong> {activePatient?.category || 'Privado'}</div>
          <div><strong className="text-slate-900">Especialista Tratante:</strong> {activePatient?.assignedSpecialist || activePatient?.assigned_specialist || 'Dr. Carlos Mendoza'}</div>
          <div className="col-span-2 sm:col-span-3"><strong className="text-slate-900">Dirección de Habitación:</strong> {activePatient?.address || activePatient?.direccion || 'Av. Principal de Las Mercedes, Edif. Torre B, Apto 4-B, Caracas'}</div>
          <div className="col-span-2 sm:col-span-3"><strong className="text-slate-900">Motivo de Consulta:</strong> <span className="text-slate-900 font-bold">{activePatient?.consultReason || activePatient?.consult_reason || 'Evaluación Odontológica General, Dolor en Pieza #17 y Blanqueamiento Estético'}</span></div>
          <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-300">
            <strong className="text-rose-900 uppercase font-black">Antecedentes Médicos & Patologías:</strong>{' '}
            <span className="text-rose-950 font-extrabold">{renderPathologySummary(activePatient)}</span>
          </div>
        </div>

        {/* 3. ODONTODIAGRAMA CLINICO ANATÓMICO COMPACTO */}
        <div className="p-2.5 border border-slate-300 rounded-xl space-y-1">
          <div className="text-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5">
              ODONTODIAGRAMA
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

          <div className="flex flex-wrap justify-between items-center gap-4 pt-1.5 font-mono text-[10px] font-black border-t border-slate-800">
            <div>
              <span className="text-slate-600">Método de Pago Asignado: </span>
              <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-bold">
                {(paymentSplits && paymentSplits.length > 0)
                  ? paymentSplits.map(s => `${s.method}: $${(parseFloat(s.amountUsd) || 0).toFixed(2)}`).join(' + ')
                  : 'Pago Móvil / Efectivo'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-right">
              {discPercentNum > 0 && (
                <>
                  <span className="text-slate-500">Subtotal: ${subtotalUsd.toFixed(2)}</span>
                  <span className="text-rose-700 font-bold">Desc. ({discPercentNum}%): -${discountUsd.toFixed(2)}</span>
                </>
              )}
              <span className="text-slate-900 text-xs font-black">TOTAL REF: ${finalTotalUsd.toFixed(2)} USD</span>
              <span className="text-teal-900 text-xs font-black">TOTAL BOLÍVARES: {finalTotalBs.toFixed(2)} Bs</span>
            </div>
          </div>
        </div>

        {/* 5. OBSERVACIONES CLINICAS (ARRIBA) & CONSENTIMIENTO INFORMADO (ABAJO) */}
        <div className="space-y-2 pt-1 border-t border-slate-300 text-[10px]">
          {clinicalObservations && (
            <div className="p-2 bg-slate-50 border border-slate-300 rounded-lg">
              <strong className="text-slate-900 uppercase block font-black mb-0.5">🩺 OBSERVACIONES CLÍNICAS:</strong>
              <p className="text-slate-800 font-medium whitespace-pre-wrap">{clinicalObservations}</p>
            </div>
          )}

          <div className="p-2 bg-teal-50/40 border border-teal-200 rounded-lg">
            <strong className="text-teal-950 uppercase block font-black mb-0.5">⚖️ CONSENTIMIENTO INFORMADO:</strong>
            <p className="text-slate-800 font-bold italic leading-relaxed">{consentText}</p>
          </div>
        </div>

        {/* 6. FIRMAS DIGITALES */}
        <div className="pt-3 grid grid-cols-2 gap-8 text-center text-[10px] font-bold">
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
