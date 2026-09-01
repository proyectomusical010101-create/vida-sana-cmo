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

// LISTAS LIMPIAS PARA INICIO DE PRODUCCIÓN REAL (SIN DATOS DE PRUEBA)
export const INITIAL_SPECIALISTS = [];
export const INITIAL_PATIENTS = [];
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
