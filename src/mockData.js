export const INITIAL_SPECIALISTS = [
  { id: 'DOC-01', name: 'Dr. Carlos Mendoza', specialty: 'Odontología General', commissionRates: { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 }, rIF: 'V-14589632-0' },
  { id: 'DOC-02', name: 'Dra. Elena Rostova', specialty: 'Ortodoncia', commissionRates: { Privado: 60, Funcionario: 50, Convenio: 45, Asegurado: 50 }, rIF: 'V-18754210-5' },
  { id: 'DOC-03', name: 'Dr. Roberto Gómez', specialty: 'Cirugía/Endodoncia', commissionRates: { Privado: 55, Funcionario: 50, Convenio: 45, Asegurado: 50 }, rIF: 'V-12345678-9' },
  { id: 'DOC-04', name: 'Dra. María Patricia Silva', specialty: 'Ecografía', commissionRates: { Privado: 50, Funcionario: 40, Convenio: 40, Asegurado: 45 }, rIF: 'V-19876543-2' },
];

export const INITIAL_PATIENTS = [
  {
    id: '100-01',
    name: 'Ana Sofía Rodríguez',
    documentId: 'V-25.148.963',
    phone: '+584123456789',
    email: 'ana.rodriguez@email.com',
    age: 32,
    category: 'Privado',
    assignedSpecialist: 'Dr. Carlos Mendoza',
    history: [
      { date: '2026-07-28', procedure: 'Resina Fotocurada Superior', doctor: 'Dr. Carlos Mendoza', cost: 45.00, status: 'Completado' },
      { date: '2026-06-15', procedure: 'Profilaxis Profunda', doctor: 'Dr. Carlos Mendoza', cost: 25.00, status: 'Completado' }
    ]
  },
  {
    id: '100-02',
    name: 'José Luis Márquez',
    documentId: 'V-18.963.214',
    phone: '+584149876543',
    email: 'jlmarquez@email.com',
    age: 45,
    category: 'Funcionario',
    assignedSpecialist: 'Dra. Elena Rostova',
    history: [
      { date: '2026-08-01', procedure: 'Control Ortodoncia Mensual', doctor: 'Dra. Elena Rostova', cost: 35.00, status: 'Completado' }
    ]
  },
  {
    id: '100-03',
    name: 'Valeria Coromoto Diaz',
    documentId: 'V-28.741.025',
    phone: '+584241239876',
    email: 'valeria.diaz@email.com',
    age: 27,
    category: 'Convenio',
    assignedSpecialist: 'Dr. Roberto Gómez',
    history: [
      { date: '2026-08-02', procedure: 'Exodoncia de Cordal', doctor: 'Dr. Roberto Gómez', cost: 80.00, status: 'Completado' }
    ]
  },
  {
    id: '100-04',
    name: 'Marcos Antonio Peña',
    documentId: 'V-15.632.147',
    phone: '+584129998877',
    email: 'mpena@email.com',
    age: 51,
    category: 'Asegurado',
    assignedSpecialist: 'Dra. María Patricia Silva',
    history: [
      { date: '2026-08-04', procedure: 'Ecografía Abdominal y Pélvica', doctor: 'Dra. María Patricia Silva', cost: 60.00, status: 'Completado' }
    ]
  }
];

export const INITIAL_INVENTORY = [
  { id: 'INV-001', name: 'Resina Fotocurada A2 (3M)', unit: 'Tubo (jeringa)', unitCost: 12.50, currentStock: 24, minStock: 8, expDate: '2027-05-15', category: 'Odontología' },
  { id: 'INV-002', name: 'Anestesia Lido-Epinefrina 2%', unit: 'Cárpule', unitCost: 0.85, currentStock: 140, minStock: 50, expDate: '2026-11-30', category: 'Odontología' },
  { id: 'INV-003', name: 'Guantes de Nitrilo M', unit: 'Par', unitCost: 0.30, currentStock: 350, minStock: 100, expDate: '2028-01-10', category: 'Protección' },
  { id: 'INV-004', name: 'Eyectores de Saliva Desechables', unit: 'Unidad', unitCost: 0.12, currentStock: 280, minStock: 80, expDate: '2028-06-20', category: 'Odontología' },
  { id: 'INV-005', name: 'Agujas Cortas Dentales 30G', unit: 'Unidad', unitCost: 0.25, currentStock: 110, minStock: 40, expDate: '2027-09-12', category: 'Odontología' },
  { id: 'INV-006', name: 'Gel Ecográfico Conductivo 5L', unit: 'Litro', unitCost: 4.50, currentStock: 2, minStock: 3, expDate: '2026-09-01', category: 'Ecografía' }, // Alerta stock bajo
  { id: 'INV-007', name: 'Pasta Profiláctica Mentolada', unit: 'Pote 100g', unitCost: 6.00, currentStock: 12, minStock: 4, expDate: '2026-08-20', category: 'Odontología' } // Alerta vencimiento próximo
];

export const INITIAL_PROCEDURES = [
  {
    id: 'PROC-01',
    name: 'Resina Fotocurada',
    category: 'Odontología General',
    price: 45.00,
    materials: [
      { inventoryId: 'INV-001', name: 'Resina Fotocurada A2 (3M)', quantity: 0.15 },
      { inventoryId: 'INV-002', name: 'Anestesia Lido-Epinefrina 2%', quantity: 1 },
      { inventoryId: 'INV-003', name: 'Guantes de Nitrilo M', quantity: 1 },
      { inventoryId: 'INV-004', name: 'Eyectores de Saliva Desechables', quantity: 1 },
      { inventoryId: 'INV-005', name: 'Agujas Cortas Dentales 30G', quantity: 1 }
    ]
  },
  {
    id: 'PROC-02',
    name: 'Exodoncia Simple',
    category: 'Cirugía/Endodoncia',
    price: 60.00,
    materials: [
      { inventoryId: 'INV-002', name: 'Anestesia Lido-Epinefrina 2%', quantity: 2 },
      { inventoryId: 'INV-003', name: 'Guantes de Nitrilo M', quantity: 2 },
      { inventoryId: 'INV-004', name: 'Eyectores de Saliva Desechables', quantity: 1 },
      { inventoryId: 'INV-005', name: 'Agujas Cortas Dentales 30G', quantity: 2 }
    ]
  },
  {
    id: 'PROC-03',
    name: 'Profilaxis Dental Profunda',
    category: 'Odontología General',
    price: 25.00,
    materials: [
      { inventoryId: 'INV-003', name: 'Guantes de Nitrilo M', quantity: 1 },
      { inventoryId: 'INV-004', name: 'Eyectores de Saliva Desechables', quantity: 1 },
      { inventoryId: 'INV-007', name: 'Pasta Profiláctica Mentolada', quantity: 0.05 }
    ]
  },
  {
    id: 'PROC-04',
    name: 'Ecografía Abdominal',
    category: 'Ecografía',
    price: 50.00,
    materials: [
      { inventoryId: 'INV-006', name: 'Gel Ecográfico Conductivo 5L', quantity: 0.1 },
      { inventoryId: 'INV-003', name: 'Guantes de Nitrilo M', quantity: 1 }
    ]
  }
];

export const INITIAL_CASHEA_TRANSACTIONS = [
  {
    id: 'CSH-8801',
    date: '2026-08-04',
    patientName: 'Ana Sofía Rodríguez',
    treatment: 'Tratamiento Ortodoncia Inicial',
    totalAmount: 200.00,
    downPayment: 60.00, // 30% inicial en clínica (Caja física)
    financedAmount: 140.00, // 70% Cashea financiado (Cuentas por Cobrar Lote Cashea)
    mdrRate: 8.0, // 8% comisión plataforma
    mdrFee: 11.20, // 140 * 8%
    ivaFee: 1.79, // 16% IVA sobre comisión = 11.20 * 0.16
    netBankIncome: 127.01, // 140 - 11.20 - 1.79
    specialistId: 'DOC-02',
    specialistName: 'Dra. Elena Rostova',
    specialistScheme: 'Opción A', // Opción A: Diferir la parte financiada / Opción B: Descontar MDR antes de %
    status: 'Pendiente Por Banco',
    batchCode: 'LOTE-20260804-A'
  },
  {
    id: 'CSH-8802',
    date: '2026-08-03',
    patientName: 'Carlos Eduardo Plaza',
    treatment: 'Prótesis Parcial + Resinas',
    totalAmount: 350.00,
    downPayment: 105.00,
    financedAmount: 245.00,
    mdrRate: 8.0,
    mdrFee: 19.60,
    ivaFee: 3.14,
    netBankIncome: 222.26,
    specialistId: 'DOC-01',
    specialistName: 'Dr. Carlos Mendoza',
    specialistScheme: 'Opción B',
    status: 'Conciliado',
    batchCode: 'LOTE-20260803-B'
  }
];

export const INITIAL_TRANSACTIONS_LOG = [
  { id: 'TX-1001', date: '2026-08-05 09:30', patient: 'Ana Sofía Rodríguez', category: 'Privado', procedure: 'Resina Fotocurada', doctor: 'Dr. Carlos Mendoza', total: 45.00, paymentMethods: [{ method: 'Efectivo USD', amount: 20.00 }, { method: 'Pago Móvil', amount: 25.00 }], shift: 'Mañana', receiver: 'Recepción A' },
  { id: 'TX-1002', date: '2026-08-05 10:15', patient: 'José Luis Márquez', category: 'Funcionario', procedure: 'Control Ortodoncia', doctor: 'Dra. Elena Rostova', total: 35.00, paymentMethods: [{ method: 'Zelle', amount: 35.00 }], shift: 'Mañana', receiver: 'Recepción A' },
  { id: 'TX-1003', date: '2026-08-05 11:00', patient: 'Valeria Coromoto Diaz', category: 'Convenio', procedure: 'Exodoncia de Cordal', doctor: 'Dr. Roberto Gómez', total: 80.00, paymentMethods: [{ method: 'Cashea', amount: 80.00, downPayment: 24.00, financed: 56.00 }], shift: 'Mañana', receiver: 'Recepción B' }
];

export const INITIAL_CONSULTORY_RENTALS = [
  { id: 'RENT-01', doctorName: 'Dr. Gabriel Torrealba', specialty: 'Endodoncia Avanzada', planType: 'Membresía Mensual (12 Turnos)', totalTurns: 12, usedTurns: 7, monthlyFee: 300.00, paymentStatus: 'Al Día' },
  { id: 'RENT-02', doctorName: 'Dra. Patricia Lucena', specialty: 'Odontopediatría', planType: 'Turno Día Completo', totalTurns: 4, usedTurns: 4, monthlyFee: 160.00, paymentStatus: 'Al Día' },
  { id: 'RENT-03', doctorName: 'Dr. Javier Villasmil', specialty: 'Estética Dental', planType: 'Consultorio Exclusivo (Mes Completo)', totalTurns: 40, usedTurns: 22, monthlyFee: 650.00, paymentStatus: 'En Mora (3 días)' }
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
    status: 'En Proceso', // Enviado -> En Proceso -> Recibido en Clínica -> Entregado/Instalado
    labCost: 65.00,
    patientPrice: 160.00,
    netMargin: 95.00
  },
  {
    id: 'LAB-502',
    patientName: 'Beatriz Salazar',
    specialistName: 'Dra. Elena Rostova',
    externalLab: 'OrtoLab Expres',
    workType: 'Retenedor Essix Estético',
    sentDate: '2026-08-01',
    promisedDate: '2026-08-05',
    status: 'Recibido en Clínica',
    labCost: 20.00,
    patientPrice: 50.00,
    netMargin: 30.00
  }
];

export const INITIAL_PAYROLL = [
  { id: 'EMP-01', name: 'Laura Vanessa Parra', position: 'Recepción & Atención al Cliente', baseSalary: 280.00, appointmentBonus: 45.00, totalPeriod: 325.00, status: 'Pagado Quincena 1' },
  { id: 'EMP-02', name: 'Carmen Alicia Bastidas', position: 'Asistente Dental Principal', baseSalary: 320.00, appointmentBonus: 30.00, totalPeriod: 350.00, status: 'Pendiente Quincena 2' },
  { id: 'EMP-03', name: 'Ingrid Josefina Colmenarez', position: 'Administradora & Contador', baseSalary: 450.00, appointmentBonus: 0.00, totalPeriod: 450.00, status: 'Pendiente Quincena 2' }
];

export const CLINIC_INFO = {
  name: 'Centro Médico Odontológico Vida Sana CMO, C.A.',
  rif: 'J-50781755-5',
  address: 'Av. Principal San José, Edif. Vida Sana, Piso 2, Caracas',
  phone: '+58 212 999 8877 / +58 412 100 2030',
  email: 'contacto@vidasanacmo.com'
};
