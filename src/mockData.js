export const MEDICAL_DIVISIONS = [
  {
    id: 'MEDICINA',
    name: '1. Medicina Especializada',
    specialties: [
      'Anestesiología', 'Cardiología', 'Cardiovascular', 'Cirugía Cardiovascular',
      'Coloproctología', 'Dermatología', 'Endocrinología', 'Inmunoalergia',
      'Medicina General', 'Nefrología', 'Neurocirugía', 'Neurología',
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

export const INITIAL_SPECIALISTS = [
  { id: 'DOC-01', name: 'Dr. Carlos Mendoza', specialty: 'Odontología General', division: 'ODONTOLOGIA', commissionRates: { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 }, rIF: 'V-14589632-0' },
  { id: 'DOC-02', name: 'Dra. Elena Rostova', specialty: 'Ortodoncia', division: 'ODONTOLOGIA', commissionRates: { Privado: 60, Funcionario: 50, Convenio: 45, Asegurado: 50 }, rIF: 'V-18754210-5' },
  { id: 'DOC-03', name: 'Dr. Roberto Gómez', specialty: 'Cirugía/Endodoncia', division: 'ODONTOLOGIA', commissionRates: { Privado: 55, Funcionario: 50, Convenio: 45, Asegurado: 50 }, rIF: 'V-12345678-9' },
  { id: 'DOC-04', name: 'Dra. María Patricia Silva', specialty: 'Ecografía General', division: 'RAYOS_X', commissionRates: { Privado: 50, Funcionario: 40, Convenio: 40, Asegurado: 45 }, rIF: 'V-19876543-2' },
  { id: 'DOC-05', name: 'Dr. Alejandro Benítez', specialty: 'Pediatría', division: 'MEDICINA', commissionRates: { Privado: 55, Funcionario: 50, Convenio: 45, Asegurado: 50 }, rIF: 'V-16234567-8' },
  { id: 'DOC-06', name: 'Lic. Carmen Briceño', specialty: 'Bionalista / Pruebas de Sangre', division: 'LABORATORIO', commissionRates: { Privado: 40, Funcionario: 35, Convenio: 35, Asegurado: 40 }, rIF: 'V-15987456-1' }
];

export const INITIAL_PATIENTS = [
  {
    id: '100-01',
    name: 'Santiago Andrés Peña',
    documentId: 'V-25.148.963',
    gender: 'M',
    isMinor: false,
    representativeId: '',
    representativeName: '',
    birthDate: '1995-06-15',
    phone: '+58 412-1234567',
    localPhone: '0212-9876543',
    workPhone: '0212-5554321',
    address: 'Av. Principal de Las Mercedes, Edif. Torre B, Apto 4-B, Caracas',
    occupation: 'Ingeniero de Sistemas',
    consultReason: 'Evaluación Odontológica General, Dolor en Pieza #17 y Blanqueamiento Estético',
    email: 'santiago.pena@email.com',
    age: 31,
    category: 'Privado',
    assignedSpecialist: 'Dr. Carlos Mendoza',
    treatmentStartDate: '2026-06-15',
    lastControlDate: '2026-08-11',
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
      { date: '2026-08-11', procedure: 'Diagnóstico & Tratamiento de Conducto Multirradicular', doctor: 'Dr. Carlos Mendoza', cost: 180.00, status: 'Completado' },
      { date: '2026-07-28', procedure: 'Restauración Resina Fotocurada Estética (#17)', doctor: 'Dr. Carlos Mendoza', cost: 45.00, status: 'Completado' },
      { date: '2026-06-15', procedure: 'Profilaxis Profunda Ultrasonido', doctor: 'Dr. Carlos Mendoza', cost: 40.00, status: 'Completado' }
    ]
  },
  {
    id: '100-02',
    name: 'José Luis Márquez',
    documentId: 'V-18.963.214',
    isMinor: false,
    representativeId: '',
    representativeName: '',
    birthDate: '1979-11-20',
    phone: '+584149876543',
    email: 'jlmarquez@email.com',
    age: 45,
    category: 'Funcionario',
    assignedSpecialist: 'Dra. Elena Rostova',
    treatmentStartDate: '2026-08-01',
    lastControlDate: '2026-08-01',
    history: [
      { date: '2026-08-01', procedure: 'Control Ortodoncia Mensual', doctor: 'Dra. Elena Rostova', cost: 35.00, status: 'Completado' }
    ]
  },
  {
    id: '100-03',
    name: 'Valeria Coromoto Diaz',
    documentId: 'V-28.741.025',
    isMinor: false,
    representativeId: '',
    representativeName: '',
    birthDate: '1997-03-08',
    phone: '+584241239876',
    email: 'valeria.diaz@email.com',
    age: 27,
    category: 'Convenio',
    assignedSpecialist: 'Dr. Roberto Gómez',
    treatmentStartDate: '2026-08-02',
    lastControlDate: '2026-08-02',
    history: [
      { date: '2026-08-02', procedure: 'Exodoncia de Cordal', doctor: 'Dr. Roberto Gómez', cost: 80.00, status: 'Completado' }
    ]
  },
  {
    id: '100-04',
    name: 'Santiago Andrés Peña (Niño)',
    documentId: 'V-Menor (N/A)',
    isMinor: true,
    representativeId: 'V-15.632.147',
    representativeName: 'Marcos Antonio Peña (Padre)',
    birthDate: '2019-09-10',
    phone: '+584129998877',
    email: 'mpena@email.com',
    age: 6,
    category: 'Asegurado',
    assignedSpecialist: 'Dr. Alejandro Benítez',
    treatmentStartDate: '2026-08-04',
    lastControlDate: '2026-08-04',
    history: [
      { date: '2026-08-04', procedure: 'Consulta Pediátrica Integral', doctor: 'Dr. Alejandro Benítez', cost: 40.00, status: 'Completado' }
    ]
  }
];

export const INITIAL_INVENTORY = [
  { id: 'INV-001', name: 'Resina Fotocurada A2 (3M)', unit: 'Tubo (jeringa)', unitCost: 12.50, currentStock: 24, minStock: 8, expDate: '2027-05-15', category: 'Odontología' },
  { id: 'INV-002', name: 'Anestesia Lido-Epinefrina 2%', unit: 'Cárpule', unitCost: 0.85, currentStock: 140, minStock: 50, expDate: '2026-11-30', category: 'Odontología' },
  { id: 'INV-003', name: 'Guantes de Nitrilo M', unit: 'Par', unitCost: 0.30, currentStock: 350, minStock: 100, expDate: '2028-01-10', category: 'Protección' },
  { id: 'INV-004', name: 'Eyectores de Saliva Desechables', unit: 'Unidad', unitCost: 0.12, currentStock: 280, minStock: 80, expDate: '2028-06-20', category: 'Odontología' },
  { id: 'INV-005', name: 'Agujas Cortas Dentales 30G', unit: 'Unidad', unitCost: 0.25, currentStock: 110, minStock: 40, expDate: '2027-09-12', category: 'Odontología' },
  { id: 'INV-006', name: 'Gel Ecográfico Conductivo 5L', unit: 'Litro', unitCost: 4.50, currentStock: 2, minStock: 3, expDate: '2026-09-01', category: 'Ecografía' },
  { id: 'INV-007', name: 'Pasta Profiláctica Mentolada', unit: 'Pote 100g', unitCost: 6.00, currentStock: 12, minStock: 4, expDate: '2026-08-20', category: 'Odontología' }
];

export const INITIAL_PROCEDURES = [
  {
    id: 'PROC-01',
    code: 'OD-101',
    name: 'Resina Fotocurada Superior',
    division: 'ODONTOLOGIA',
    category: 'Odontología General',
    specialty: 'Odontología General',
    price: 45.00,
    doctorCommissionPercent: 50,
    estimatedMaterialsCost: 5.50,
    materials: [
      { inventoryId: 'INV-001', name: 'Resina Fotocurada A2 (3M)', quantity: 0.15 },
      { inventoryId: 'INV-002', name: 'Anestesia Lido-Epinefrina 2%', quantity: 1 },
      { inventoryId: 'INV-003', name: 'Guantes de Nitrilo M', quantity: 1 }
    ]
  },
  {
    id: 'PROC-02',
    code: 'OD-102',
    name: 'Exodoncia de Cordal Simple',
    division: 'ODONTOLOGIA',
    category: 'Cirugía Maxilofacial',
    specialty: 'Cirugía/Endodoncia',
    price: 80.00,
    doctorCommissionPercent: 55,
    estimatedMaterialsCost: 8.00,
    materials: [
      { inventoryId: 'INV-002', name: 'Anestesia Lido-Epinefrina 2%', quantity: 2 },
      { inventoryId: 'INV-003', name: 'Guantes de Nitrilo M', quantity: 2 }
    ]
  },
  {
    id: 'PROC-03',
    code: 'MED-201',
    name: 'Consulta Pediátrica Integral',
    division: 'MEDICINA',
    category: 'Medicina Especializada',
    specialty: 'Pediatría',
    price: 40.00,
    doctorCommissionPercent: 50,
    estimatedMaterialsCost: 2.00,
    materials: []
  },
  {
    id: 'PROC-04',
    code: 'RX-301',
    name: 'Ecografía Abdominal y Pélvica',
    division: 'RAYOS_X',
    category: 'Imagenología',
    specialty: 'Ecografía General',
    price: 60.00,
    doctorCommissionPercent: 50,
    estimatedMaterialsCost: 4.50,
    materials: [
      { inventoryId: 'INV-006', name: 'Gel Ecográfico Conductivo 5L', quantity: 0.1 }
    ]
  },
  {
    id: 'PROC-05',
    code: 'LAB-401',
    name: 'Perfil 20 Completo (Sangre + Orina)',
    division: 'LABORATORIO',
    category: 'Laboratorio Clínico',
    specialty: 'Bionalista / Pruebas de Sangre',
    price: 35.00,
    doctorCommissionPercent: 40,
    estimatedMaterialsCost: 7.00,
    materials: []
  }
];

export const INITIAL_CASHEA_TRANSACTIONS = [
  {
    id: 'CSH-8801',
    date: '2026-08-04',
    patientName: 'Ana Sofía Rodríguez',
    treatment: 'Tratamiento Ortodoncia Inicial',
    totalAmount: 200.00,
    downPayment: 60.00,
    financedAmount: 140.00,
    mdrRate: 8.0,
    mdrFee: 11.20,
    ivaFee: 1.79,
    netBankIncome: 127.01,
    specialistId: 'DOC-02',
    specialistName: 'Dra. Elena Rostova',
    specialistScheme: 'Opción A',
    status: 'Pendiente Por Banco',
    batchCode: 'LOTE-20260804-A'
  }
];

export const INITIAL_TRANSACTIONS_LOG = [
  { id: 'TX-1001', date: '2026-08-05 09:30', patient: 'Ana Sofía Rodríguez', category: 'Privado', procedure: 'Resina Fotocurada', doctor: 'Dr. Carlos Mendoza', total: 45.00, paymentMethods: [{ method: 'Efectivo USD', amount: 20.00 }, { method: 'Pago Móvil', amount: 25.00 }], shift: 'Mañana', receiver: 'Recepción A' },
  { id: 'TX-1002', date: '2026-08-05 10:15', patient: 'José Luis Márquez', category: 'Funcionario', procedure: 'Control Ortodoncia', doctor: 'Dra. Elena Rostova', total: 35.00, paymentMethods: [{ method: 'Zelle', amount: 35.00 }], shift: 'Mañana', receiver: 'Recepción A' }
];

export const INITIAL_CONSULTORY_RENTALS = [
  { id: 'RENT-01', doctorName: 'Dr. Gabriel Torrealba', specialty: 'Endodoncia Avanzada', planType: 'Membresía Mensual (12 Turnos)', totalTurns: 12, usedTurns: 7, monthlyFee: 300.00, paymentStatus: 'Al Día' }
];

export const INITIAL_EXTRAMURAL_LAB_ORDERS = [
  {
    id: 'LAB-501',
    patientName: 'Ramón Isidro Morales',
    specialistName: 'Dr. Carlos Mendoza',
    externalLab: 'Laboratorio Dental Master Art',
    workType: 'Prótesis Valplast Superior',
    sentDate: '2026-07-30',
    promisedDate: '2026-08-07',
    status: 'En Proceso',
    labCost: 65.00,
    patientPrice: 160.00,
    netMargin: 95.00
  }
];

export const INITIAL_PAYROLL = [
  { id: 'EMP-01', name: 'Laura Vanessa Parra', position: 'Recepción & Atención al Cliente', hireDate: '2023-03-15', baseSalary: 280.00, appointmentBonus: 45.00, totalPeriod: 325.00, status: 'Pagado Quincena 1' },
  { id: 'EMP-02', name: 'Carmen Alicia Bastidas', position: 'Asistente Dental Principal', hireDate: '2022-06-01', baseSalary: 320.00, appointmentBonus: 30.00, totalPeriod: 350.00, status: 'Pendiente Quincena 2' },
  { id: 'EMP-03', name: 'Ingrid Josefina Colmenarez', position: 'Administradora & Contador', hireDate: '2021-01-10', baseSalary: 450.00, appointmentBonus: 0.00, totalPeriod: 450.00, status: 'Pendiente Quincena 2' }
];

export const INITIAL_EXPENSES = [
  { id: 'EXP-101', category: 'Servicios Públicos', description: 'Electricidad Corpoelec + Agua', amount: 180.00, date: '2026-08-01' },
  { id: 'EXP-102', category: 'Alquileres', description: 'Canon Arrendamiento Sede Principal', amount: 850.00, date: '2026-08-01' },
  { id: 'EXP-103', category: 'Publicidad / Marketing', description: 'Campaña Redes Sociales e Instagram Ads', amount: 250.00, date: '2026-08-03' },
  { id: 'EXP-104', category: 'Compras de Insumos', description: 'Reposición Insumos Médicos & Odontológicos', amount: 420.00, date: '2026-08-04' }
];

export const CLINIC_INFO = {
  name: 'Centro Médico Odontológico Vida Sana CMO, C.A.',
  rif: 'J-50781755-5',
  address: 'Av. Principal San José, Edif. Vida Sana, Piso 2, Caracas',
  phone: '+58 212 999 8877 / +58 412 100 2030',
  email: 'contacto@vidasanacmo.com'
};
