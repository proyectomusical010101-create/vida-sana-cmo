export const MEDICAL_DIVISIONS = [
  {
    id: 'MEDICINA',
    name: '1. Medicina Especializada',
    specialties: [
      'Anestesiología', 'Cardiología', 'Cardiovascular', 'Cirugía Cardiovascular',
      'Coloproctología', 'Dermatología', 'Endocrinología', 'Ginecología & Obstetricia',
      'Inmunoalergia', 'Medicina General', 'Nefrología', 'Neurocirugía', 'Neurología',
      'Nutrición', 'Otorrinolaringología', 'Pediatría', 'Psiquiatría',
      'Tiroides', 'Traumatología', 'Urología'
    ]
  },
  {
    id: 'ODONTOLOGIA',
    name: '2. Odontología Integral & Especialidades',
    specialties: [
      'Odontología General', 'Endodoncia', 'Periodoncia', 'Cirugía Maxilofacial', 'Odontopediatría'
    ]
  },
  {
    id: 'LABORATORIO',
    name: '3. Laboratorio Clínico',
    specialties: [
      'Bionalista / Pruebas de Sangre', 'Hematología', 'Química Sanguínea', 'Uroanálisis'
    ]
  },
  {
    id: 'RAYOS_X',
    name: '4. Rayos X & Imagenología',
    specialties: [
      'Radiología Dental 3D / Panorámica', 'Ecografía General', 'Rayos X Torácicos', 'Tomografía'
    ]
  }
];

// ESPECIALISTAS REALES DE LA CLÍNICA REGISTRADOS EN HISTORIAS
export const INITIAL_SPECIALISTS = [
  { id: 'SPEC-01', name: 'Dr. Alex Hernández', specialty: 'Ortodoncia & Periodoncia', rIF: 'V-18456789-0', commissionRates: { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 } },
  { id: 'SPEC-02', name: 'Dr. Rodrigo Navas', specialty: 'Odontología General & Especialidades', rIF: 'V-16234567-0', commissionRates: { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 } },
  { id: 'SPEC-03', name: 'Dra. Emiliervis Ananguren', specialty: 'Odontología General & Endodoncia', rIF: 'V-20123456-0', commissionRates: { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 } },
  { id: 'SPEC-04', name: 'Dra. Mariangel Martínez Bonillo', specialty: 'Odontología General', rIF: 'V-22345678-0', commissionRates: { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 } },
  { id: 'SPEC-05', name: 'Dra. Lucía (Dra. Lu)', specialty: 'Cirugía Bucal & Odontología', rIF: 'V-15678901-0', commissionRates: { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 } },
  { id: 'SPEC-06', name: 'Dra. Kumana Lara', specialty: 'Odontología Estética', rIF: 'V-21456789-0', commissionRates: { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 } },
  { id: 'SPEC-07', name: 'Dr. Sylhovan C.', specialty: 'Ortodoncia', rIF: 'V-19876543-0', commissionRates: { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 } }
];

// PACIENTES REALES DIGITALIZADOS DESDE EXPEDIENTES FÍSICOS
export const INITIAL_PATIENTS = [
  {
    id: '100-31',
    name: 'Wilmer La Madrid',
    documentId: 'V-17.692.383',
    document_id: 'V-17.692.383',
    age: 36,
    birthDate: '1985-03-30',
    birth_date: '1985-03-30',
    gender: 'M',
    phone: '0414-2401306',
    local_phone: '',
    work_phone: '',
    occupation: 'Ingeniero',
    address: 'Monparez, Res. Venezuela, EDF. LARA, Caracas',
    category: 'Privado',
    assigned_specialist: 'Dra. Emiliervis Ananguren',
    consult_reason: 'Evaluación odontológica general, dolor en pieza 16 y diagnóstico protésico',
    allergies_text: 'Ninguna',
    medicines_text: 'Ninguno',
    anamnesis: {
      medTreatment: { has: 'NO', details: '' },
      childDiseases: { has: 'NO', details: '' },
      allergies: { has: 'NO', details: 'Ninguna conocida' },
      surgeries: 'Ninguna',
      excessiveBleeding: 'NO',
      respiratory: { adenoids: false, tonsils: false, details: '' },
      anesthesiaReaction: { has: 'NO', details: '' },
      penicillinAllergy: { has: 'NO', details: '' },
      heartProblems: { has: 'NO', details: '' }
    },
    extraoral_exam: {
      oralTissues: { hardPalate: 'Normal', softPalate: 'Normal', mouthFloor: 'Normal', cheeks: 'Normal', tongue: 'Normal', frenulum: 'Normal' },
      oralHabits: { abnormalSwallowing: 'NO', nailBiting: 'NO', thumbSucking: 'NO', mouthBreather: 'NO' }
    },
    history: [
      { date: '2021-06-15', procedure: 'Evolución General y Diagnóstico Integral', doctor: 'Dra. Emiliervis Ananguren', cost: 20.00, status: 'Completado' },
      { date: '2021-06-15', procedure: 'Toma Rx Periapical U.D 1.6', doctor: 'Dra. Emiliervis Ananguren', cost: 10.00, status: 'Completado' },
      { date: '2021-06-15', procedure: 'Referencia a Especialidad de Endodoncia (Pieza 16)', doctor: 'Dra. Emiliervis Ananguren', cost: 0.00, status: 'Completado' }
    ]
  },
  {
    id: '100-01',
    name: 'Génesis Pereira',
    documentId: 'V-22.764.960',
    document_id: 'V-22.764.960',
    age: 26,
    birthDate: '1995-08-12',
    birth_date: '1995-08-12',
    gender: 'F',
    phone: '0412-5517621',
    local_phone: '',
    work_phone: '',
    occupation: 'Abogada',
    address: 'Bellas Artes, Caracas',
    category: 'Privado',
    assigned_specialist: 'Dr. Rodrigo Navas',
    consult_reason: 'Evaluación Odontológica y Consulta de Ortodoncia',
    allergies_text: 'Ninguna',
    medicines_text: 'Ninguno',
    anamnesis: {
      medTreatment: { has: 'NO', details: '' },
      childDiseases: { has: 'NO', details: '' },
      allergies: { has: 'NO', details: 'Ninguna' },
      surgeries: 'Ninguna',
      excessiveBleeding: 'NO',
      respiratory: { adenoids: false, tonsils: false, details: '' },
      anesthesiaReaction: { has: 'NO', details: '' },
      penicillinAllergy: { has: 'NO', details: '' },
      heartProblems: { has: 'NO', details: 'Abuelo Paterno con Hipertensión. Abuela Paterna con Cáncer de Colon. Padece de cálculos en los riñones.' }
    },
    extraoral_exam: {
      oralTissues: { hardPalate: 'Normal', softPalate: 'Normal', mouthFloor: 'Normal', cheeks: 'Normal', tongue: 'Normal', frenulum: 'Normal' },
      oralHabits: { abnormalSwallowing: 'NO', nailBiting: 'NO', thumbSucking: 'NO', mouthBreather: 'NO' }
    },
    history: [
      { date: '2021-08-12', procedure: 'Consulta Odontológica General', doctor: 'Dr. Rodrigo Navas', cost: 10.00, status: 'Completado' },
      { date: '2021-08-12', procedure: 'Consulta de Ortodoncia Especializada', doctor: 'Dr. Rodrigo Navas', cost: 10.00, status: 'Completado' }
    ]
  },
  {
    id: '100-03',
    name: 'Pebles Sequera',
    documentId: 'V-11.937.066',
    document_id: 'V-11.937.066',
    age: 46,
    birthDate: '1975-05-10',
    birth_date: '1975-05-10',
    gender: 'F',
    phone: '0412-5302299',
    local_phone: '0212-7826387',
    work_phone: '',
    occupation: 'Comerciante',
    address: 'Av. Las Acacias, La Florida, Res. Valka, Caracas',
    category: 'Privado',
    assigned_specialist: 'Dra. Lucía (Dra. Lu)',
    consult_reason: 'Fractura coronaria en molar ("Se me partió una muela") y limpieza',
    allergies_text: 'Ninguna',
    medicines_text: 'Tratamiento para el Asma',
    anamnesis: {
      medTreatment: { has: 'SI', details: 'Tratamiento de control para Asma' },
      childDiseases: { has: 'NO', details: '' },
      allergies: { has: 'NO', details: 'Ninguna' },
      surgeries: 'Ninguna',
      excessiveBleeding: 'NO',
      respiratory: { adenoids: false, tonsils: false, details: 'Asma bronquial' },
      anesthesiaReaction: { has: 'NO', details: '' },
      penicillinAllergy: { has: 'NO', details: '' },
      heartProblems: { has: 'NO', details: '' }
    },
    extraoral_exam: {
      oralTissues: { hardPalate: 'Normal', softPalate: 'Normal', mouthFloor: 'Normal', cheeks: 'Normal', tongue: 'Normal', frenulum: 'Normal' },
      oralHabits: { abnormalSwallowing: 'NO', nailBiting: 'NO', thumbSucking: 'NO', mouthBreather: 'NO' }
    },
    history: [
      { date: '2021-05-12', procedure: 'Consulta de Emergencia y Diagnóstico', doctor: 'Dra. Lucía (Dra. Lu)', cost: 5.00, status: 'Completado' },
      { date: '2021-05-12', procedure: 'Extracción Quirúrgica Simple U.D 47', doctor: 'Dra. Lucía (Dra. Lu)', cost: 25.00, status: 'Completado' }
    ]
  },
  {
    id: '100-02',
    name: 'Andreina Milla',
    documentId: 'V-26.470.666',
    document_id: 'V-26.470.666',
    age: 26,
    birthDate: '1997-07-27',
    birth_date: '1997-07-27',
    gender: 'F',
    phone: '0412-3759475',
    local_phone: '',
    work_phone: '',
    occupation: 'TSU Comercio Exterior',
    address: 'Minas de Baruta, Caracas',
    category: 'Privado',
    assigned_specialist: 'Dr. Rodrigo Navas',
    consult_reason: 'Evaluación odontológica general, limpieza profunda y restauración estética',
    allergies_text: 'Ninguna',
    medicines_text: 'Ninguno',
    anamnesis: {
      medTreatment: { has: 'NO', details: '' },
      childDiseases: { has: 'NO', details: '' },
      allergies: { has: 'NO', details: 'Ninguna' },
      surgeries: 'Ninguna',
      excessiveBleeding: 'NO',
      respiratory: { adenoids: false, tonsils: false, details: '' },
      anesthesiaReaction: { has: 'NO', details: '' },
      penicillinAllergy: { has: 'NO', details: '' },
      heartProblems: { has: 'NO', details: '' }
    },
    extraoral_exam: {
      oralTissues: { hardPalate: 'Normal', softPalate: 'Normal', mouthFloor: 'Normal', cheeks: 'Normal', tongue: 'Normal', frenulum: 'Normal' },
      oralHabits: { abnormalSwallowing: 'NO', nailBiting: 'NO', thumbSucking: 'NO', mouthBreather: 'NO' }
    },
    history: [
      { date: '2021-05-20', procedure: '2 Resinas Medianas (UD 24 Vestibular/Mesio-Oclusal y UD 34 Vestibular)', doctor: 'Dr. Rodrigo Navas', cost: 40.00, status: 'Completado' },
      { date: '2022-09-19', procedure: 'Restauración Clase II (Pieza 26) + Restauración Clase I (Pieza 22)', doctor: 'Dra. Kumana Lara', cost: 45.00, status: 'Completado' }
    ]
  },
  {
    id: '100-04',
    name: 'Rosliannys Carvajal',
    documentId: 'V-20.310.784',
    document_id: 'V-20.310.784',
    age: 29,
    birthDate: '1992-04-19',
    birth_date: '1992-04-19',
    gender: 'F',
    phone: '0412-9441081',
    local_phone: '0426-4903544',
    work_phone: '',
    occupation: 'Coordinadora de Investigación y Desarrollo',
    address: 'El Llanito, Calle Los Caribes, Caracas',
    category: 'Privado',
    assigned_specialist: 'Dr. Alex Hernández',
    consult_reason: 'Evaluación y tratamiento integral de Ortodoncia y Periodoncia',
    allergies_text: 'Ninguna',
    medicines_text: 'Ninguno',
    anamnesis: {
      medTreatment: { has: 'NO', details: '' },
      childDiseases: { has: 'NO', details: '' },
      allergies: { has: 'NO', details: 'Ninguna reportada' },
      surgeries: 'Ninguna',
      excessiveBleeding: 'NO',
      respiratory: { adenoids: false, tonsils: false, details: '' },
      anesthesiaReaction: { has: 'NO', details: '' },
      penicillinAllergy: { has: 'NO', details: '' },
      heartProblems: { has: 'NO', details: 'Antecedentes Familiares: Padre con Hipertensión, Abuela con Diabetes.' }
    },
    extraoral_exam: {
      oralTissues: { hardPalate: 'Normal', softPalate: 'Normal', mouthFloor: 'Normal', cheeks: 'Normal', tongue: 'Normal', frenulum: 'Normal' },
      oralHabits: { abnormalSwallowing: 'NO', nailBiting: 'NO', thumbSucking: 'NO', mouthBreather: 'NO' }
    },
    history: [
      { date: '2021-02-18', procedure: 'Evaluación de Ortodoncia y Periodoncia Inicial', doctor: 'Dr. Alex Hernández', cost: 10.00, status: 'Completado' },
      { date: '2021-02-22', procedure: 'Raspado y Alisado Radicular (RAR) Cuadrante I', doctor: 'Dr. Alex Hernández', cost: 20.00, status: 'Completado' },
      { date: '2021-02-27', procedure: 'Resina Fotocurada Estética Pieza 12', doctor: 'Dr. Alex Hernández', cost: 15.00, status: 'Completado' },
      { date: '2021-03-13', procedure: 'Instalación de Brackets Arco Superior', doctor: 'Dr. Alex Hernández', cost: 45.00, status: 'Completado' },
      { date: '2021-04-10', procedure: 'Control de Ortodoncia + Tubos 6T', doctor: 'Dr. Alex Hernández', cost: 18.00, status: 'Completado' },
      { date: '2021-05-04', procedure: 'Control de Ortodoncia + Tubo en Pieza 16', doctor: 'Dr. Alex Hernández', cost: 23.00, status: 'Completado' },
      { date: '2021-05-26', procedure: 'Raspado y Alisado Radicular (RAR) Cuadrantes III y IV', doctor: 'Dr. Alex Hernández', cost: 50.00, status: 'Completado' },
      { date: '2021-06-05', procedure: 'Instalación de Brackets Arco Inferior + 2 Tubos', doctor: 'Dr. Alex Hernández', cost: 70.00, status: 'Completado' },
      { date: '2021-08-03', procedure: 'Reevaluación Periodontal + Tartrectomía Ultrasónica y Pulido', doctor: 'Dr. Alex Hernández', cost: 20.00, status: 'Completado' },
      { date: '2021-09-17', procedure: 'Control de Ortodoncia + Recementado de Bracket Pieza 12 + Ligadura Metálica', doctor: 'Dr. Alex Hernández', cost: 25.00, status: 'Completado' },
      { date: '2021-10-15', procedure: 'Resina Vestibular Pieza 12 + Control + Recementado Bracket', doctor: 'Dr. Alex Hernández', cost: 56.00, status: 'Completado' },
      { date: '2021-11-07', procedure: 'Tartrectomía Ultrasónica y Manual', doctor: 'Dr. Alex Hernández', cost: 20.00, status: 'Completado' },
      { date: '2021-11-11', procedure: 'Control de Ortodoncia + 2 Arcos + Separadores', doctor: 'Dr. Alex Hernández', cost: 37.00, status: 'Completado' },
      { date: '2021-12-09', procedure: 'Control + Bandas en 36 y 44 + Tubo en 16', doctor: 'Dr. Alex Hernández', cost: 30.00, status: 'Completado' },
      { date: '2022-01-13', procedure: 'Control Ortodoncia + Tartrectomía Ultrasónica y Manual', doctor: 'Dr. Alex Hernández', cost: 25.00, status: 'Completado' },
      { date: '2022-02-17', procedure: 'Control Ortodoncia + Cadeneta x 2', doctor: 'Dr. Alex Hernández', cost: 25.00, status: 'Completado' },
      { date: '2022-04-22', procedure: 'Resina Fotocurada Pieza 34', doctor: 'Dr. Alex Hernández', cost: 25.00, status: 'Completado' },
      { date: '2022-05-04', procedure: 'Resina Compuesta + Vidrio Ionomérico Pieza 17 + Tartrectomía Ultrasónica', doctor: 'Dr. Alex Hernández', cost: 60.00, status: 'Completado' },
      { date: '2022-09-01', procedure: 'Instalación de Retenedores Fijos Superior e Inferior', doctor: 'Dr. Alex Hernández', cost: 140.00, status: 'Completado' },
      { date: '2022-09-07', procedure: '2 Resinas Fotocuradas + Remoción de Brackets + Limpieza + Consulta Periodoncia', doctor: 'Dr. Alex Hernández', cost: 290.00, status: 'Completado' },
      { date: '2022-10-13', procedure: 'Resina Clase II + Base + Toma de Impresión Termoplástica', doctor: 'Dr. Sylhovan C.', cost: 120.00, status: 'Completado' },
      { date: '2023-01-20', procedure: 'Mantenimiento Periodontal + Tartrectomía Ultrasónica', doctor: 'Dr. Alex Hernández', cost: 30.00, status: 'Completado' },
      { date: '2023-11-17', procedure: 'Control + Retenedor Fijo Inferior + 3 Pulidos de Resina', doctor: 'Dr. Alex Hernández', cost: 80.00, status: 'Completado' },
      { date: '2024-02-17', procedure: '2 Resinas Fotocuradas + 1 Rx Periapical', doctor: 'Dra. Mariangel Martínez Bonillo', cost: 120.00, status: 'Completado' },
      { date: '2024-05-02', procedure: 'Restauración Clase II Pieza 24 + Clase II con Base Pieza 25 + Impresión Alginato', doctor: 'Dra. Mariangel Martínez Bonillo', cost: 105.00, status: 'Completado' },
      { date: '2025-04-19', procedure: 'Reconstrucción de Resina Pieza 46 + Indicación Incrustación Cerámica ($270) y Férula ($40)', doctor: 'Dr. Alex Hernández', cost: 105.00, status: 'Completado' },
      { date: '2025-04-25', procedure: '2 Puntos de Resina Fluida en 31 y 41 (Retenedor)', doctor: 'Dr. Alex Hernández', cost: 70.00, status: 'Completado' }
    ]
  }
];
export const INITIAL_INVENTORY = [];
export const INITIAL_PROCEDURES = [];
export const INITIAL_CASHEA_TRANSACTIONS = [];
export const INITIAL_TRANSACTIONS_LOG = [];
export const INITIAL_CONSULTORY_RENTALS = [];
export const INITIAL_EXTRAMURAL_LAB_ORDERS = [];
export const INITIAL_PAYROLL = [];
export const INITIAL_EXPENSES = [];

export const CLINIC_INFO = {
  name: 'Centro Médico Odontológico Vida Sana CMO, C.A.',
  rif: 'J-50781755-5',
  address: 'Av. Principal San José, Edif. Vida Sana, Piso 2, Caracas',
  phone: '+58 212 999 8877 / +58 412 100 2030',
  email: 'contacto@vidasanacmo.com'
};
