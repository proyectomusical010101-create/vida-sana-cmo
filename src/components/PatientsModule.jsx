import React, { useState } from 'react';
import { User, UserCheck, Phone, Mail, Calendar, FileText, Plus, Search, Stethoscope, CheckCircle, Clock, ShieldCheck, Printer, Send, AlertCircle, Edit, Loader2, Trash2, Download, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import { fetchPatients, createPatientApi, updatePatientApi, deletePatientApi } from '../api';

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
  const [modalTab, setModalTab] = useState('filiation'); // 'filiation' | 'anamnesis' | 'exam'
  const [isMinor, setIsMinor] = useState(false);
  const [docId, setDocId] = useState('');
  const [repDocId, setRepDocId] = useState('');
  const [repName, setRepName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientBirthDate, setPatientBirthDate] = useState('1995-06-15');
  const [patientGender, setPatientGender] = useState('F'); // 'F' | 'M'
  const [patientAddress, setPatientAddress] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientLocalPhone, setPatientLocalPhone] = useState('');
  const [patientWorkPhone, setPatientWorkPhone] = useState('');
  const [patientOccupation, setPatientOccupation] = useState('');
  const [consultReason, setConsultReason] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientCategory, setPatientCategory] = useState('Privado');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isEditCustomCategory, setIsEditCustomCategory] = useState(false);

  // GESTOR TOTAL DE CATEGORÍAS Y ETIQUETAS
  const [managedCategoriesList, setManagedCategoriesList] = useState(['Privado', 'Funcionario', 'Convenio', 'Asegurado']);
  const [customCategoriesList, setCustomCategoriesList] = useState([]);
  const [showCategoryManagerModal, setShowCategoryManagerModal] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  const [patientSpecialist, setPatientSpecialist] = useState('Dr. Carlos Mendoza');
  const [isSaving, setIsSaving] = useState(false);

  // ANAMNESIS (Historia Médica Completa)
  const [medTreatment, setMedTreatment] = useState({ has: 'NO', details: '' });
  const [childDiseases, setChildDiseases] = useState({ has: 'NO', details: '' });
  const [allergies, setAllergies] = useState({ has: 'NO', details: '' });
  const [surgeries, setSurgeries] = useState('');
  const [excessiveBleeding, setExcessiveBleeding] = useState('NO');
  const [respiratory, setRespiratory] = useState({ adenoids: false, tonsils: false, details: '' });
  const [anesthesiaReaction, setAnesthesiaReaction] = useState({ has: 'NO', details: '' });
  const [penicillinAllergy, setPenicillinAllergy] = useState({ has: 'NO', details: '' });
  const [heartProblems, setHeartProblems] = useState({ has: 'NO', details: '' });

  // EXAMEN INTEGRAL Y EXTRAORAL
  const [oralTissues, setOralTissues] = useState({
    hardPalate: 'Normal',
    softPalate: 'Normal',
    mouthFloor: 'Normal',
    cheeks: 'Normal',
    tongue: 'Normal',
    frenulum: 'Normal'
  });

  const [oralHabits, setOralHabits] = useState({
    abnormalSwallowing: 'NO',
    nailBiting: 'NO',
    thumbSucking: 'NO',
    thumbWhich: '',
    mouthBreather: 'NO',
    frequency: '',
    intensity: '',
    others: ''
  });

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

  const safePatients = Array.isArray(patients) ? patients : [];
  const activePatient = safePatients.find(p => p && String(p.id) === String(selectedPatientId)) || safePatients[0] || null;

  // Normalizador de Paciente (Soporta camelCase o DB snake_case)
  const pName = String(activePatient?.name || activePatient?.full_name || 'Seleccione Paciente');
  const pDoc = String(activePatient?.documentId || activePatient?.document_id || activePatient?.rif || 'N/A');
  const pPhone = String(activePatient?.phone || activePatient?.phone_number || activePatient?.telefono || 'N/A');
  const pBirthDate = String(activePatient?.birthDate || activePatient?.birth_date || '1995-01-01');
  const pCategory = String(activePatient?.category || 'Privado');
  const pStartDate = String(activePatient?.treatmentStartDate || activePatient?.treatment_start_date || new Date().toISOString().slice(0, 10));
  const pLastControl = String(activePatient?.lastControlDate || activePatient?.last_control_date || new Date().toISOString().slice(0, 10));
  const pHistory = Array.isArray(activePatient?.history) ? activePatient.history : [];

  // Función para insertar Paciente Demo Completo directamente en Supabase
  const handleSeedDemoPatientToSupabase = async () => {
    setIsSaving(true);
    const demoPayload = {
      name: 'Santiago Andrés Peña',
      document_id: 'V-25.148.963',
      gender: 'M',
      is_minor: false,
      birth_date: '1995-06-15',
      phone: '+58 412-1234567',
      local_phone: '0212-9876543',
      work_phone: '0212-5554321',
      address: 'Av. Principal de Las Mercedes, Edif. Torre B, Apto 4-B, Caracas',
      occupation: 'Ingeniero de Sistemas',
      consult_reason: 'Evaluación Odontológica General, Dolor en Pieza #17 y Blanqueamiento Estético',
      email: 'santiago.pena@email.com',
      category: 'Privado',
      assigned_specialist: 'Dr. Carlos Mendoza',
      treatment_start_date: '2026-06-15',
      last_control_date: new Date().toISOString().slice(0, 10),
      anamnesis: {
        medTreatment: { has: 'SI', details: 'Tratamiento antihipertensivo leve con Losartán 50mg' },
        childDiseases: { has: 'SI', details: 'Varicela a los 8 años' },
        allergies: { has: 'SI', details: 'Alergia estacional al polen y AINEs (Ketoprofeno)' },
        surgeries: 'Apendicectomía Laparoscópica (2018)',
        excessiveBleeding: 'NO',
        respiratory: { adenoids: false, tonsils: true, details: 'Amigdalitis recurrente en la infancia' },
        anesthesiaReaction: { has: 'NO', details: 'Ninguna' },
        penicillinAllergy: { has: 'NO', details: 'Tolerancia normal' },
        heartProblems: { has: 'NO', details: 'Evaluación cardiovascular normal' }
      },
      extraoral_exam: {
        oralTissues: {
          hardPalate: 'Normal',
          softPalate: 'Normal / Ligera hiperemia',
          mouthFloor: 'Normal',
          cheeks: 'Integridad mucosa conservada',
          tongue: 'Normoglosa / Saburral leve',
          frenulum: 'Inserción lingual normal'
        },
        oralHabits: {
          abnormalSwallowing: 'NO',
          nailBiting: 'SI (Onicofagia leve por estrés)',
          thumbSucking: 'NO',
          thumbWhich: '',
          mouthBreather: 'NO',
          frequency: '',
          intensity: '',
          others: 'Bruxismo nocturno leve'
        }
      },
      history: [
        { date: new Date().toISOString().slice(0, 10), procedure: 'Diagnóstico & Tratamiento de Conducto Multirradicular', doctor: 'Dr. Carlos Mendoza', cost: 180.00, status: 'Completado' }
      ]
    };

    try {
      const created = await createPatientApi(demoPayload);
      const freshList = await fetchPatients();
      if (freshList && setPatients) setPatients(freshList);
      Swal.fire({
        title: '¡Paciente Guardado en Supabase!',
        text: `El expediente completo de Santiago Andrés Peña fue registrado directamente en la base de datos Supabase (ID: ${created?.id || 'OK'}).`,
        icon: 'success',
        confirmButtonColor: '#0d9488'
      });
    } catch (err) {
      Swal.fire('Error al Guardar en Supabase', err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

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
      gender: patientGender,
      address: patientAddress,
      phone: patientPhone,
      local_phone: patientLocalPhone,
      work_phone: patientWorkPhone,
      occupation: patientOccupation,
      consult_reason: consultReason,
      email: patientEmail,
      category: patientCategory,
      assigned_specialist: patientSpecialist,
      treatment_start_date: new Date().toISOString().slice(0, 10),
      last_control_date: new Date().toISOString().slice(0, 10),
      anamnesis: {
        medTreatment,
        childDiseases,
        allergies,
        surgeries,
        excessiveBleeding,
        respiratory,
        anesthesiaReaction,
        penicillinAllergy,
        heartProblems
      },
      extraoral_exam: {
        oralTissues,
        oralHabits
      }
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

  const allCategoriesList = Array.from(
    new Set([
      ...(Array.isArray(managedCategoriesList) ? managedCategoriesList : ['Privado', 'Funcionario', 'Convenio', 'Asegurado']),
      ...(Array.isArray(customCategoriesList) ? customCategoriesList : []),
      ...safePatients.map(p => p?.category).filter(Boolean)
    ])
  );

  // Crear categoría nueva independiente (sin crear paciente)
  const handleAddNewCategoryStandalone = (e) => {
    e.preventDefault();
    const trimmed = newCatInput.trim();
    if (!trimmed) return;
    if (allCategoriesList.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      Swal.fire('Categoría Existente', `La categoría "${trimmed}" ya existe en el sistema.`, 'warning');
      return;
    }
    setCustomCategoriesList([...customCategoriesList, trimmed]);
    setNewCatInput('');
    Swal.fire({
      title: '¡Categoría Guardada!',
      text: `La etiqueta "${trimmed}" fue creada independientemente y ya está disponible para el filtro y para cualquier expediente.`,
      icon: 'success',
      timer: 1800,
      showConfirmButton: false
    });
  };

  // Renombrar categoría existente (cualquiera excepto 'ALL')
  const handleRenameCategory = (oldName) => {
    if (oldName === 'ALL') return;

    Swal.fire({
      title: `Renombrar categoría "${oldName}"`,
      input: 'text',
      inputValue: oldName,
      showCancelButton: true,
      confirmButtonText: 'Guardar Nombre',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d9488',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Debes escribir un nombre válido para la categoría';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newName = result.value.trim();
        setManagedCategoriesList((prev) => (prev || []).map(c => c === oldName ? newName : c));
        setCustomCategoriesList((prev) => (prev || []).map(c => c === oldName ? newName : c));
        const updatedPatients = safePatients.map(p => p?.category === oldName ? { ...p, category: newName } : p);
        if (typeof setPatients === 'function') {
          setPatients(updatedPatients);
        }
        if (selectedCategory === oldName) setSelectedCategory(newName);
        Swal.fire('¡Categoría Renombrada!', `Se actualizó a "${newName}" en todos los expedientes asociadas.`, 'success');
      }
    });
  };

  // Eliminar Categoría / Etiqueta (cualquiera excepto 'ALL')
  const handleDeleteCategory = (catToDelete) => {
    if (catToDelete === 'ALL') return;

    const count = safePatients.filter(p => p?.category === catToDelete).length;

    Swal.fire({
      title: `¿Eliminar etiqueta "${catToDelete}"?`,
      text: count > 0 
        ? `Hay ${count} paciente(s) asignados a esta etiqueta. Si la eliminas, pasarán automáticamente a la categoría "Privado".` 
        : `La etiqueta "${catToDelete}" será eliminada de la lista y del sistema.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar etiqueta',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        setManagedCategoriesList((prev) => (prev || []).filter(c => c !== catToDelete));
        setCustomCategoriesList((prev) => (prev || []).filter(c => c !== catToDelete));
        const updatedPatients = safePatients.map(p => p?.category === catToDelete ? { ...p, category: 'Privado' } : p);
        if (typeof setPatients === 'function') {
          setPatients(updatedPatients);
        }
        if (selectedCategory === catToDelete) {
          setSelectedCategory('ALL');
        }
        Swal.fire('¡Etiqueta Eliminada!', `La categoría "${catToDelete}" ha sido eliminada con éxito.`, 'success');
      }
    });
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

  // Descargar Plantilla Oficial Excel / CSV para Pacientes
  const handleDownloadPatientsTemplate = () => {
    const headers = "Cedula_Identidad;Nombres_y_Apellidos;Telefono_Movil;Correo_Electronico;Fecha_Nacimiento_YYYY_MM_DD;Genero_F_M;Categoria_Paciente;Alergias;Direccion\n";
    const sampleRows = [
      "V-18923456;María Alejandra Pérez;04141234567;maria.perez@email.com;1995-06-15;F;Privado;Penicilina;Av. Principal Caracas",
      "V-15432109;Carlos Eduardo Gómez;04129876543;carlos.gomez@email.com;1988-11-20;M;Seguro;Polen y AINEs;Calle 4 Barquisimeto"
    ].join("\n");

    const blob = new Blob(["\uFEFF" + headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Plantilla_Oficial_Pacientes_VidaSana.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parser de Carga Masiva de Pacientes
  const handlePatientsFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        let text = evt.target.result || '';
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.substring(1);
        }

        const lines = text.split(/\r\n|\n/);
        if (lines.length <= 1) {
          Swal.fire('Atención', 'El archivo está vacío o no contiene datos.', 'warning');
          return;
        }

        const newPatients = [...safePatients];
        let addedCount = 0;
        let updatedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const delimiter = line.includes(';') ? ';' : ',';
          const cols = line.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());

          if (cols.length < 2) continue;

          const docIdVal = cols[0] || `V-SF-${i}`;
          const nameVal = cols[1] || 'Paciente Sin Nombre';
          const phoneVal = cols[2] || '';
          const emailVal = cols[3] || '';
          const birthVal = cols[4] || '1995-01-01';
          const genderVal = (cols[5] || 'F').toUpperCase().startsWith('M') ? 'M' : 'F';
          const categoryVal = cols[6] || 'Privado';
          const allergyVal = cols[7] || 'Ninguna';
          const addressVal = cols[8] || '';

          const existingIdx = newPatients.findIndex(p => 
            (p.documentId && p.documentId === docIdVal) || 
            (p.name && p.name.toLowerCase() === nameVal.toLowerCase())
          );

          const patientObj = {
            id: existingIdx >= 0 ? newPatients[existingIdx].id : `100-${Date.now().toString().slice(-4)}-${i}`,
            name: nameVal,
            documentId: docIdVal,
            document_id: docIdVal,
            phone: phoneVal,
            email: emailVal,
            birthDate: birthVal,
            gender: genderVal,
            category: categoryVal,
            address: addressVal,
            assignedSpecialist: 'Dr. Carlos Mendoza',
            treatment_start_date: new Date().toISOString().slice(0, 10),
            last_control_date: new Date().toISOString().slice(0, 10),
            anamnesis: {
              allergies: { has: allergyVal !== 'Ninguna' ? 'SI' : 'NO', details: allergyVal }
            },
            history: []
          };

          if (existingIdx >= 0) {
            newPatients[existingIdx] = { ...newPatients[existingIdx], ...patientObj };
            updatedCount++;
          } else {
            newPatients.push(patientObj);
            addedCount++;
          }
        }

        setPatients(newPatients);
        Swal.fire({
          title: '¡Pacientes Importados!',
          text: `Se agregaron ${addedCount} pacientes nuevos y se actualizaron ${updatedCount} existentes.`,
          icon: 'success'
        });
      } catch (err) {
        Swal.fire('Error al Cargar Pacientes', err.message, 'error');
      }
    };
    reader.readAsText(file);
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
            Expedientes integrados con soporte para menores de edad, Odontodiagrama 2D y Presupuesto Digital Unificado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Descargar Plantilla */}
          <button
            onClick={handleDownloadPatientsTemplate}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300 rounded-xl text-xs transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Plantilla Excel
          </button>

          {/* Importar Pacientes */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            Importar Pacientes
            <input type="file" accept=".csv, .txt, .xlsx" onChange={handlePatientsFileUpload} className="hidden" />
          </label>

          <button
            onClick={() => setShowAddPatientModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            + Paciente
          </button>
        </div>
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

          <div className="flex flex-wrap gap-1 items-center">
            {['ALL', ...allCategoriesList].map(cat => {
              const isProtected = cat === 'ALL';
              const isActive = selectedCategory === cat;
              return (
                <div key={cat} className="inline-flex items-center">
                  <button
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat === 'ALL' ? 'Todos' : cat}
                  </button>

                  {!isProtected && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat);
                      }}
                      className="ml-0.5 px-1 py-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded transition-all text-[10px] cursor-pointer"
                      title={`Eliminar etiqueta "${cat}"`}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setShowCategoryManagerModal(true)}
              className="px-2 py-1 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-xs ml-auto"
              title="Gestor Independiente de Categorías y Etiquetas"
            >
              <span>⚙️</span>
              <span>Categorías</span>
            </button>
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
                activeSubTab === 'exams' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5" /> 3. Solicitud de Exámenes
            </button>

            <button
              onClick={() => setActiveSubTab('clinical-history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'clinical-history' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> 4. Historia Clínica Completa
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
                  <div><strong>Paciente:</strong> {pName}</div>
                  <div><strong>Cédula:</strong> {pDoc}</div>
                  <div><strong>Categoría:</strong> {pCategory}</div>
                  <div><strong>Especialista Tratante:</strong> {activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza'}</div>
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

          {/* TAB 4: HISTORIA CLINICA ADULTOS E INFANTIL DETALLADA */}
          {activeSubTab === 'clinical-history' && (
            <div className="space-y-6 text-xs">
              
              {/* FILIACIÓN Y DATOS DE CONTACTO */}
              <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl space-y-3">
                <h4 className="text-xs font-black uppercase text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                  📋 FILIACIÓN Y DATOS PERSONALES DEL PACIENTE
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-semibold">
                  <div><span className="text-slate-500 block text-[10px]">Nombre:</span> {pName}</div>
                  <div><span className="text-slate-500 block text-[10px]">Cédula:</span> {pDoc}</div>
                  <div><span className="text-slate-500 block text-[10px]">Sexo:</span> {activePatient?.gender === 'M' ? 'Masculino' : 'Femenino'}</div>
                  <div><span className="text-slate-500 block text-[10px]">Edad:</span> {calculateAge(pBirthDate)} Años ({pBirthDate})</div>
                  <div><span className="text-slate-500 block text-[10px]">Teléfono Celular:</span> {pPhone}</div>
                  <div><span className="text-slate-500 block text-[10px]">Teléfono Local:</span> {activePatient?.localPhone || activePatient?.local_phone || 'N/A'}</div>
                  <div><span className="text-slate-500 block text-[10px]">Teléfono Trabajo:</span> {activePatient?.workPhone || activePatient?.work_phone || 'N/A'}</div>
                  <div><span className="text-slate-500 block text-[10px]">Profesión / Ocupación:</span> {activePatient?.occupation || 'N/A'}</div>
                  <div><span className="text-slate-500 block text-[10px]">Categoría:</span> {pCategory}</div>
                  <div className="col-span-2 sm:col-span-3"><span className="text-slate-500 block text-[10px]">Dirección de Habitación:</span> {activePatient?.address || 'No registrada'}</div>
                  <div className="col-span-2 sm:col-span-3"><span className="text-slate-500 block text-[10px]">Motivo de Consulta:</span> <span className="font-bold text-teal-800 dark:text-teal-300">{activePatient?.consultReason || activePatient?.consult_reason || 'Evaluación Odontológica General'}</span></div>
                </div>
              </div>

              {/* ANAMNESIS / ANTECEDENTES */}
              <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl space-y-3">
                <h4 className="text-xs font-black uppercase text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                  🩺 ANAMNESIS Y ANTECEDENTES MÉDICOS
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800 dark:text-slate-200">
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Tratamiento Médico:</strong> {activePatient?.anamnesis?.medTreatment?.has || 'NO'} ({activePatient?.anamnesis?.medTreatment?.details || 'Ninguno'})</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Enfermedades Niñez:</strong> {activePatient?.anamnesis?.childDiseases?.has || 'NO'} ({activePatient?.anamnesis?.childDiseases?.details || 'Ninguna'})</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Alergias Conocidas:</strong> {activePatient?.anamnesis?.allergies?.has || 'NO'} ({activePatient?.anamnesis?.allergies?.details || 'Ninguna'})</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Intervenciones Quirúrgicas:</strong> {activePatient?.anamnesis?.surgeries || 'Ninguna'}</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>¿Sangrado Excesivo al cortarse?:</strong> {activePatient?.anamnesis?.excessiveBleeding || 'NO'}</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Reacción Anormal Anestesia:</strong> {activePatient?.anamnesis?.anesthesiaReaction?.has || 'NO'}</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Alérgico Penicilina:</strong> {activePatient?.anamnesis?.penicillinAllergy?.has || 'NO'}</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Problemas Cardíacos:</strong> {activePatient?.anamnesis?.heartProblems?.has || 'NO'}</div>
                </div>
              </div>

              {/* EXAMEN INTEGRAL & EXTRAORAL */}
              <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl space-y-3">
                <h4 className="text-xs font-black uppercase text-teal-700 dark:text-teal-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                  🦷 EXAMEN INTEGRAL Y TEJIDOS BUCALES
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Paladar Duro:</strong> {activePatient?.extraoral_exam?.oralTissues?.hardPalate || 'Normal'}</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Paladar Blando:</strong> {activePatient?.extraoral_exam?.oralTissues?.softPalate || 'Normal'}</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Piso de Boca:</strong> {activePatient?.extraoral_exam?.oralTissues?.mouthFloor || 'Normal'}</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Mejillas:</strong> {activePatient?.extraoral_exam?.oralTissues?.cheeks || 'Normal'}</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Lengua:</strong> {activePatient?.extraoral_exam?.oralTissues?.tongue || 'Normal'}</div>
                  <div className="p-2 bg-white dark:bg-slate-900 border rounded-lg"><strong>Frenillo:</strong> {activePatient?.extraoral_exam?.oralTissues?.frenulum || 'Normal'}</div>
                </div>
              </div>
            </div>
          )}
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
                  <div><strong>Paciente:</strong> {pName}</div>
                  <div><strong>Cédula:</strong> {pDoc}</div>
                  <div><strong>Categoría:</strong> {pCategory}</div>
                  <div><strong>Especialista Solicitante:</strong> {activePatient?.assignedSpecialist || 'Dr. Carlos Mendoza'}</div>
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

      {/* MODAL REGISTRAR NUEVO PACIENTE (HISTORIA CLÍNICA ADULTOS E INFANTIL COMPLETA) */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] text-slate-900 dark:text-white w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-[#1e2d5a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal con Título & Tabs */}
            <div className="p-4 bg-slate-50 dark:bg-[#0d162f] border-b border-slate-200 dark:border-[#1e2d5a] space-y-3 shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  Registrar Nuevo Paciente (Historia Clínica Adultos e Infantil)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Pestañas de la Historia Clínica */}
              <div className="flex gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setModalTab('filiation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    modalTab === 'filiation'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  📄 1. Filiación & Datos
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('anamnesis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    modalTab === 'anamnesis'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  🩺 2. Anamnesis (Historia Médica)
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('exam')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    modalTab === 'exam'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  🦷 3. Examen Integral & Extraoral
                </button>
              </div>
            </div>

            {/* Formulario Modal Scrollable */}
            <form onSubmit={handleSavePatientSubmit} className="p-5 overflow-y-auto space-y-4 text-xs font-bold flex-1 custom-scrollbar">
              
              {/* PESTAÑA 1: FILIACIÓN Y DATOS DE CONTACTO */}
              {modalTab === 'filiation' && (
                <div className="space-y-3.5">
                  {/* Checkbox Menor de Edad */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-amber-950 dark:text-amber-200">¿Paciente Menor de Edad / Niño?</span>
                    <input
                      type="checkbox"
                      checked={isMinor}
                      onChange={(e) => setIsMinor(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre Completo del Paciente *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Santiago Andrés Peña"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  {!isMinor ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-1">Cédula de Identidad *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: V-25.148.963"
                          value={docId}
                          onChange={(e) => setDocId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-1">Sexo *</label>
                        <select
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white"
                        >
                          <option value="F">Femenino (F)</option>
                          <option value="M">Masculino (M)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-1">Cédula Representante *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: V-15.632.147"
                          value={repDocId}
                          onChange={(e) => setRepDocId(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-[#0d162f] border border-slate-300 rounded-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-1">Nombre Representante *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Marcos Antonio Peña"
                          value={repName}
                          onChange={(e) => setRepName(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-[#0d162f] border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 mb-1">Sexo *</label>
                        <select
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-[#0d162f] border border-slate-300 rounded-lg"
                        >
                          <option value="F">Femenino (F)</option>
                          <option value="M">Masculino (M)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">Fecha de Nacimiento *</label>
                      <input
                        type="date"
                        required
                        value={patientBirthDate}
                        onChange={(e) => setPatientBirthDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">Edad Calculada</label>
                      <div className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-extrabold text-slate-900 dark:text-white">
                        {calculateAge(patientBirthDate)} Años
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Dirección de Habitación</label>
                    <input
                      type="text"
                      placeholder="Ej: Av. Principal de Las Mercedes, Edif. Torre B, Apto 4"
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">Telf. Celular (WhatsApp) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+584123456789"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">Telf. Local</label>
                      <input
                        type="tel"
                        placeholder="02129876543"
                        value={patientLocalPhone}
                        onChange={(e) => setPatientLocalPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">Telf. Trabajo</label>
                      <input
                        type="tel"
                        placeholder="02125554321"
                        value={patientWorkPhone}
                        onChange={(e) => setPatientWorkPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1">Profesión u Ocupación</label>
                      <input
                        type="text"
                        placeholder="Ej: Odontólogo / Ingeniero"
                        value={patientOccupation}
                        onChange={(e) => setPatientOccupation(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-slate-700 dark:text-slate-300">Categoría del Paciente</label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !isCustomCategory;
                            setIsCustomCategory(nextState);
                            if (nextState) setPatientCategory('');
                            else setPatientCategory('Privado');
                          }}
                          className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold hover:underline cursor-pointer"
                        >
                          {isCustomCategory ? '📋 Elegir de la lista' : '➕ Crear nueva categoría'}
                        </button>
                      </div>

                      {isCustomCategory ? (
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Escriba la nueva categoría (ej. VIP, Jubilado...)"
                            value={patientCategory}
                            onChange={(e) => setPatientCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[#0d162f] border border-teal-500 rounded-xl font-bold text-slate-900 dark:text-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomCategory(false);
                              setPatientCategory('Privado');
                            }}
                            className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-bold"
                            title="Volver a la lista"
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <select
                          value={patientCategory}
                          onChange={(e) => {
                            if (e.target.value === 'CUSTOM_NEW') {
                              setIsCustomCategory(true);
                              setPatientCategory('');
                            } else {
                              setPatientCategory(e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl font-bold text-slate-900 dark:text-white"
                        >
                          {allCategoriesList.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="CUSTOM_NEW">➕ + Crear Nueva Categoría...</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">Motivo de Consulta *</label>
                    <textarea
                      rows="2"
                      required
                      placeholder="Ej: Dolor en molar superior derecho / Limpieza y blanqueamiento..."
                      value={consultReason}
                      onChange={(e) => setConsultReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* PESTAÑA 2: ANAMNESIS (HISTORIA MÉDICA COMPLETA DE LA IMAGEN 2) */}
              {modalTab === 'anamnesis' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Responda las preguntas de antecedentes clínicos requeridas en la historia física:
                  </p>

                  <div className="p-3 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">1. Historia Médica: ¿Está bajo tratamiento médico?</span>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1"><input type="radio" name="medTreatment" checked={medTreatment.has === 'SI'} onChange={() => setMedTreatment({ ...medTreatment, has: 'SI' })} /> SI</label>
                        <label className="flex items-center gap-1"><input type="radio" name="medTreatment" checked={medTreatment.has === 'NO'} onChange={() => setMedTreatment({ ...medTreatment, has: 'NO' })} /> NO</label>
                      </div>
                    </div>
                    {medTreatment.has === 'SI' && (
                      <input type="text" placeholder="¿Algo que mencionar sobre el tratamiento?" value={medTreatment.details} onChange={(e) => setMedTreatment({ ...medTreatment, details: e.target.value })} className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg" />
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">2. Enfermedades de la Niñez:</span>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1"><input type="radio" name="childDiseases" checked={childDiseases.has === 'SI'} onChange={() => setChildDiseases({ ...childDiseases, has: 'SI' })} /> SI</label>
                        <label className="flex items-center gap-1"><input type="radio" name="childDiseases" checked={childDiseases.has === 'NO'} onChange={() => setChildDiseases({ ...childDiseases, has: 'NO' })} /> NO</label>
                      </div>
                    </div>
                    {childDiseases.has === 'SI' && (
                      <input type="text" placeholder="Varicela, Sarampión, Parotiditis, etc." value={childDiseases.details} onChange={(e) => setChildDiseases({ ...childDiseases, details: e.target.value })} className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg" />
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">3. Alergias Conocidas:</span>
                      <div className="flex gap-2">
                        <label className="flex items-center gap-1"><input type="radio" name="allergies" checked={allergies.has === 'SI'} onChange={() => setAllergies({ ...allergies, has: 'SI' })} /> SI</label>
                        <label className="flex items-center gap-1"><input type="radio" name="allergies" checked={allergies.has === 'NO'} onChange={() => setAllergies({ ...allergies, has: 'NO' })} /> NO</label>
                      </div>
                    </div>
                    {allergies.has === 'SI' && (
                      <input type="text" placeholder="Medicamentos, polen, alimentos, AINEs..." value={allergies.details} onChange={(e) => setAllergies({ ...allergies, details: e.target.value })} className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg" />
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1">4. Intervenciones Quirúrgicas (Cirugías Previas)</label>
                    <input type="text" placeholder="Apendicectomía, amigdalectomía, etc." value={surgeries} onChange={(e) => setSurgeries(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl" />
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl flex items-center justify-between">
                    <span className="font-bold">5. ¿Sangra mucho cuando se corta?</span>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1"><input type="radio" name="excessiveBleeding" checked={excessiveBleeding === 'SI'} onChange={() => setExcessiveBleeding('SI')} /> SI</label>
                      <label className="flex items-center gap-1"><input type="radio" name="excessiveBleeding" checked={excessiveBleeding === 'NO'} onChange={() => setExcessiveBleeding('NO')} /> NO</label>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl space-y-2">
                    <span className="font-bold block">6. Trastornos Respiratorios:</span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1"><input type="checkbox" checked={respiratory.adenoids} onChange={(e) => setRespiratory({ ...respiratory, adenoids: e.target.checked })} /> Adenoides</label>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={respiratory.tonsils} onChange={(e) => setRespiratory({ ...respiratory, tonsils: e.target.checked })} /> Amígdalas</label>
                    </div>
                    <input type="text" placeholder="¿Algo que mencionar sobre problemas respiratorios?" value={respiratory.details} onChange={(e) => setRespiratory({ ...respiratory, details: e.target.value })} className="w-full p-2 bg-white dark:bg-slate-900 border rounded-lg" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-[#0d162f] border rounded-xl space-y-1">
                      <span className="font-bold block">7. Reacción Anormal a Anestesia</span>
                      <div className="flex gap-2">
                        <label><input type="radio" name="anesthesiaReaction" checked={anesthesiaReaction.has === 'SI'} onChange={() => setAnesthesiaReaction({ ...anesthesiaReaction, has: 'SI' })} /> SI</label>
                        <label><input type="radio" name="anesthesiaReaction" checked={anesthesiaReaction.has === 'NO'} onChange={() => setAnesthesiaReaction({ ...anesthesiaReaction, has: 'NO' })} /> NO</label>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-[#0d162f] border rounded-xl space-y-1">
                      <span className="font-bold block">8. Alérgico a la Penicilina</span>
                      <div className="flex gap-2">
                        <label><input type="radio" name="penicillinAllergy" checked={penicillinAllergy.has === 'SI'} onChange={() => setPenicillinAllergy({ ...penicillinAllergy, has: 'SI' })} /> SI</label>
                        <label><input type="radio" name="penicillinAllergy" checked={penicillinAllergy.has === 'NO'} onChange={() => setPenicillinAllergy({ ...penicillinAllergy, has: 'NO' })} /> NO</label>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-[#0d162f] border rounded-xl space-y-1">
                    <span className="font-bold block">9. Problemas del Corazón (Cardiopatías)</span>
                    <div className="flex gap-2">
                      <label><input type="radio" name="heartProblems" checked={heartProblems.has === 'SI'} onChange={() => setHeartProblems({ ...heartProblems, has: 'SI' })} /> SI</label>
                      <label><input type="radio" name="heartProblems" checked={heartProblems.has === 'NO'} onChange={() => setHeartProblems({ ...heartProblems, has: 'NO' })} /> NO</label>
                    </div>
                  </div>
                </div>
              )}

              {/* PESTAÑA 3: EXAMEN INTEGRAL Y EXTRAORAL */}
              {modalTab === 'exam' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-[11px] border-b pb-1">
                      1. Condición de Tejidos Bucales:
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Paladar Duro:</label>
                        <input type="text" value={oralTissues.hardPalate} onChange={(e) => setOralTissues({ ...oralTissues, hardPalate: e.target.value })} className="w-full p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg" />
                      </div>
                      <div>
                        <label className="block mb-1">Paladar Blando:</label>
                        <input type="text" value={oralTissues.softPalate} onChange={(e) => setOralTissues({ ...oralTissues, softPalate: e.target.value })} className="w-full p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg" />
                      </div>
                      <div>
                        <label className="block mb-1">Piso de Boca:</label>
                        <input type="text" value={oralTissues.mouthFloor} onChange={(e) => setOralTissues({ ...oralTissues, mouthFloor: e.target.value })} className="w-full p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg" />
                      </div>
                      <div>
                        <label className="block mb-1">Mejillas:</label>
                        <input type="text" value={oralTissues.cheeks} onChange={(e) => setOralTissues({ ...oralTissues, cheeks: e.target.value })} className="w-full p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg" />
                      </div>
                      <div>
                        <label className="block mb-1">Lengua:</label>
                        <input type="text" value={oralTissues.tongue} onChange={(e) => setOralTissues({ ...oralTissues, tongue: e.target.value })} className="w-full p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg" />
                      </div>
                      <div>
                        <label className="block mb-1">Frenillo:</label>
                        <input type="text" value={oralTissues.frenulum} onChange={(e) => setOralTissues({ ...oralTissues, frenulum: e.target.value })} className="w-full p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="font-extrabold text-slate-900 dark:text-white uppercase text-[11px] border-b pb-1">
                      2. Hábitos Bucales:
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg">
                        <span>Deglución Anormal:</span>
                        <div className="flex gap-2">
                          <label><input type="radio" name="abnormalSwallowing" checked={oralHabits.abnormalSwallowing === 'SI'} onChange={() => setOralHabits({ ...oralHabits, abnormalSwallowing: 'SI' })} /> SI</label>
                          <label><input type="radio" name="abnormalSwallowing" checked={oralHabits.abnormalSwallowing === 'NO'} onChange={() => setOralHabits({ ...oralHabits, abnormalSwallowing: 'NO' })} /> NO</label>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg">
                        <span>Onicofagia (Morderse Uñas):</span>
                        <div className="flex gap-2">
                          <label><input type="radio" name="nailBiting" checked={oralHabits.nailBiting === 'SI'} onChange={() => setOralHabits({ ...oralHabits, nailBiting: 'SI' })} /> SI</label>
                          <label><input type="radio" name="nailBiting" checked={oralHabits.nailBiting === 'NO'} onChange={() => setOralHabits({ ...oralHabits, nailBiting: 'NO' })} /> NO</label>
                        </div>
                      </div>

                      <div className="p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Succión Dedo:</span>
                          <div className="flex gap-2">
                            <label><input type="radio" name="thumbSucking" checked={oralHabits.thumbSucking === 'SI'} onChange={() => setOralHabits({ ...oralHabits, thumbSucking: 'SI' })} /> SI</label>
                            <label><input type="radio" name="thumbSucking" checked={oralHabits.thumbSucking === 'NO'} onChange={() => setOralHabits({ ...oralHabits, thumbSucking: 'NO' })} /> NO</label>
                          </div>
                        </div>
                        {oralHabits.thumbSucking === 'SI' && (
                          <input type="text" placeholder="¿Cuál dedo?" value={oralHabits.thumbWhich} onChange={(e) => setOralHabits({ ...oralHabits, thumbWhich: e.target.value })} className="w-full p-1.5 bg-white dark:bg-slate-900 border rounded" />
                        )}
                      </div>

                      <div className="p-2 bg-slate-50 dark:bg-[#0d162f] border rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Respirador Bucal:</span>
                          <div className="flex gap-2">
                            <label><input type="radio" name="mouthBreather" checked={oralHabits.mouthBreather === 'SI'} onChange={() => setOralHabits({ ...oralHabits, mouthBreather: 'SI' })} /> SI</label>
                            <label><input type="radio" name="mouthBreather" checked={oralHabits.mouthBreather === 'NO'} onChange={() => setOralHabits({ ...oralHabits, mouthBreather: 'NO' })} /> NO</label>
                          </div>
                        </div>
                        {oralHabits.mouthBreather === 'SI' && (
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Frecuencia" value={oralHabits.frequency} onChange={(e) => setOralHabits({ ...oralHabits, frequency: e.target.value })} className="p-1.5 bg-white dark:bg-slate-900 border rounded" />
                            <input type="text" placeholder="Intensidad" value={oralHabits.intensity} onChange={(e) => setOralHabits({ ...oralHabits, intensity: e.target.value })} className="p-1.5 bg-white dark:bg-slate-900 border rounded" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Botones Modal */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-[#1e2d5a] shrink-0">
                <span className="text-[10px] text-slate-500">Pestaña {modalTab === 'filiation' ? '1/3' : modalTab === 'anamnesis' ? '2/3' : '3/3'}</span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPatientModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-300 font-bold rounded-xl"
                  >
                    Cancelar
                  </button>
                  
                  {modalTab !== 'exam' ? (
                    <button
                      type="button"
                      onClick={() => setModalTab(modalTab === 'filiation' ? 'anamnesis' : 'exam')}
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl transition-all shadow-md"
                    >
                      Siguiente ➔
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isSaving ? 'Guardando en la Nube...' : 'Guardar Expediente Oficial'}
                    </button>
                  )}
                </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 dark:text-slate-300">Categoría</label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isEditCustomCategory;
                        setIsEditCustomCategory(nextState);
                        if (nextState) setEditPatientForm({ ...editPatientForm, category: '' });
                        else setEditPatientForm({ ...editPatientForm, category: 'Privado' });
                      }}
                      className="text-[10px] text-teal-600 dark:text-teal-400 font-extrabold hover:underline cursor-pointer"
                    >
                      {isEditCustomCategory ? '📋 Elegir de la lista' : '➕ Crear nueva categoría'}
                    </button>
                  </div>

                  {isEditCustomCategory ? (
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Escriba la nueva categoría..."
                        value={editPatientForm.category}
                        onChange={(e) => setEditPatientForm({ ...editPatientForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-[#0d162f] border border-teal-500 rounded-xl font-bold text-slate-900 dark:text-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditCustomCategory(false);
                          setEditPatientForm({ ...editPatientForm, category: 'Privado' });
                        }}
                        className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-xl text-xs font-bold"
                        title="Volver a la lista"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <select
                      value={editPatientForm.category}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM_NEW') {
                          setIsEditCustomCategory(true);
                          setEditPatientForm({ ...editPatientForm, category: '' });
                        } else {
                          setEditPatientForm({ ...editPatientForm, category: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-600 font-bold"
                    >
                      {allCategoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="CUSTOM_NEW">➕ + Crear Nueva Categoría...</option>
                    </select>
                  )}
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

      {/* MODAL GESTOR INDEPENDIENTE DE CATEGORÍAS */}
      {showCategoryManagerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-[#1e2d5a]">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                Gestión Independiente de Categorías & Etiquetas
              </h3>
              <button
                onClick={() => setShowCategoryManagerModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Formular de Crear Categoría Aislada */}
            <form onSubmit={handleAddNewCategoryStandalone} className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Crear Nueva Categoría (Sin registrar paciente)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Ej: VIP, Jubilado, Convenio PDVSA..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#0d162f] border border-slate-300 dark:border-[#1e2d5a] rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-black rounded-xl shadow-md transition-all shrink-0"
                >
                  + Crear
                </button>
              </div>
            </form>

            {/* Lista de Categorías Existentes */}
            <div className="space-y-2 pt-2">
              <span className="block text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Categorías Disponibles en el Sistema:
              </span>
              
              <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                {allCategoriesList.map(cat => {
                  const isProtected = cat === 'ALL';
                  const patientCount = safePatients.filter(p => (p?.category || 'Privado') === cat).length;
                  return (
                    <div
                      key={cat}
                      className="p-2.5 bg-slate-50 dark:bg-[#0d162f] border border-slate-200 dark:border-[#1e2d5a] rounded-xl flex items-center justify-between text-xs font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white">{cat}</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({patientCount} pacientes)
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {!isProtected && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRenameCategory(cat)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Renombrar categoría"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Eliminar categoría"
                            >
                              🗑️ Borrar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-[#1e2d5a] flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryManagerModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
