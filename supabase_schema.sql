-- ==============================================================================
-- SCRIPT DE BASE DE DATOS PARA SUPABASE (POSTGRESQL)
-- CENTRO MÉDICO ODONTOLÓGICO VIDA SANA CMO, C.A. (RIF: J-50781755-5)
-- Copie y pegue todo este script en el "SQL Editor" de su proyecto en Supabase
-- ==============================================================================

-- 0. TABLA DE USUARIOS / ADMINISTRADORES
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Administrador',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar usuario Administrador por defecto
INSERT INTO users (name, email, password_hash, role)
VALUES ('Administrador Principal', 'admin@vidasana.com', 'admin123', 'Administrador')
ON CONFLICT (email) DO NOTHING;

-- 1. TABLA DE PACIENTES & EXPEDIENTES
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  document_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  age INTEGER,
  category TEXT NOT NULL,
  assigned_specialist TEXT
);

CREATE TABLE IF NOT EXISTS patient_history (
  id BIGSERIAL PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  cost NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_odontogram (
  id BIGSERIAL PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tooth_number INTEGER NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  UNIQUE(patient_id, tooth_number)
);

CREATE TABLE IF NOT EXISTS patient_consents (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  template_title TEXT NOT NULL,
  signed_at TEXT NOT NULL,
  signature_png TEXT NOT NULL
);

-- 2. AGENDA DE CITAS
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  specialist_name TEXT NOT NULL,
  consultory TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  status TEXT NOT NULL,
  whatsapp_sent INTEGER DEFAULT 0
);

-- 3. INVENTARIO & RECETAS
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(10, 2) NOT NULL,
  current_stock NUMERIC(10, 2) NOT NULL,
  min_stock NUMERIC(10, 2) NOT NULL,
  exp_date TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS procedures (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  materials_json JSONB NOT NULL
);

-- 4. ESPECIALISTAS
CREATE TABLE IF NOT EXISTS specialists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  commission_rates_json JSONB NOT NULL,
  rif TEXT NOT NULL
);

-- 5. CASHEA & CAJA MULTI-MONEDA
CREATE TABLE IF NOT EXISTS cashea_transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  treatment TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  down_payment NUMERIC(10, 2) NOT NULL,
  financed_amount NUMERIC(10, 2) NOT NULL,
  mdr_rate NUMERIC(5, 2) NOT NULL,
  mdr_fee NUMERIC(10, 2) NOT NULL,
  iva_fee NUMERIC(10, 2) NOT NULL,
  net_bank_income NUMERIC(10, 2) NOT NULL,
  specialist_name TEXT NOT NULL,
  specialist_scheme TEXT NOT NULL,
  status TEXT NOT NULL,
  batch_code TEXT
);

CREATE TABLE IF NOT EXISTS cash_transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  category TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  payment_methods_json JSONB NOT NULL,
  shift TEXT NOT NULL,
  receiver TEXT NOT NULL
);

-- 6. ALQUILER CONSULTORIOS & LAB EXTRAMUROS
CREATE TABLE IF NOT EXISTS consultory_rentals (
  id TEXT PRIMARY KEY,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  total_turns INTEGER NOT NULL,
  used_turns INTEGER NOT NULL,
  monthly_fee NUMERIC(10, 2) NOT NULL,
  payment_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS extramural_lab_orders (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  specialist_name TEXT NOT NULL,
  external_lab TEXT NOT NULL,
  work_type TEXT NOT NULL,
  sent_date TEXT NOT NULL,
  promised_date TEXT NOT NULL,
  status TEXT NOT NULL,
  lab_cost NUMERIC(10, 2) NOT NULL,
  patient_price NUMERIC(10, 2) NOT NULL,
  net_margin NUMERIC(10, 2) NOT NULL
);

-- 7. SENIAT & NÓMINA
CREATE TABLE IF NOT EXISTS seniat_invoices (
  id TEXT PRIMARY KEY,
  doctor_name TEXT NOT NULL,
  doctor_rif TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  billed_to TEXT NOT NULL,
  clinic_rif TEXT NOT NULL,
  invoice_amount NUMERIC(10, 2) NOT NULL,
  expected_amount NUMERIC(10, 2) NOT NULL,
  is_exact_match INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payroll (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  base_salary NUMERIC(10, 2) NOT NULL,
  appointment_bonus NUMERIC(10, 2) NOT NULL,
  total_period NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL
);

-- INSERTAR DATOS INICIALES DE PRUEBA
INSERT INTO specialists (id, name, specialty, commission_rates_json, rif) VALUES 
('DOC-01', 'Dr. Carlos Mendoza', 'Odontología General', '{"Privado":50,"Funcionario":45,"Convenio":40,"Asegurado":45}', 'V-14589632-0'),
('DOC-02', 'Dra. Elena Rostova', 'Ortodoncia', '{"Privado":60,"Funcionario":50,"Convenio":45,"Asegurado":50}', 'V-18754210-5'),
('DOC-03', 'Dr. Roberto Gómez', 'Cirugía/Endodoncia', '{"Privado":55,"Funcionario":50,"Convenio":45,"Asegurado":50}', 'V-12345678-9'),
('DOC-04', 'Dra. María Patricia Silva', 'Ecografía', '{"Privado":50,"Funcionario":40,"Convenio":40,"Asegurado":45}', 'V-19876543-2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (id, name, document_id, phone, email, age, category, assigned_specialist) VALUES
('100-01', 'Ana Sofía Rodríguez', 'V-25.148.963', '+584123456789', 'ana.rodriguez@email.com', 32, 'Privado', 'Dr. Carlos Mendoza'),
('100-02', 'José Luis Márquez', 'V-18.963.214', '+584149876543', 'jlmarquez@email.com', 45, 'Funcionario', 'Dra. Elena Rostova'),
('100-03', 'Valeria Coromoto Diaz', 'V-28.741.025', '+584241239876', 'valeria.diaz@email.com', 27, 'Convenio', 'Dr. Roberto Gómez'),
('100-04', 'Marcos Antonio Peña', 'V-15.632.147', '+584129998877', 'mpena@email.com', 51, 'Asegurado', 'Dra. María Patricia Silva')
ON CONFLICT (id) DO NOTHING;

INSERT INTO inventory (id, name, unit, unit_cost, current_stock, min_stock, exp_date, category) VALUES
('INV-001', 'Resina Fotocurada A2 (3M)', 'Tubo (jeringa)', 12.50, 24, 8, '2027-05-15', 'Odontología'),
('INV-002', 'Anestesia Lido-Epinefrina 2%', 'Cárpule', 0.85, 140, 50, '2026-11-30', 'Odontología'),
('INV-003', 'Guantes de Nitrilo M', 'Par', 0.30, 350, 100, '2028-01-10', 'Protección'),
('INV-004', 'Eyectores de Saliva Desechables', 'Unidad', 0.12, 280, 80, '2028-06-20', 'Odontología'),
('INV-005', 'Agujas Cortas Dentales 30G', 'Unidad', 0.25, 110, 40, '2027-09-12', 'Odontología'),
('INV-006', 'Gel Ecográfico Conductivo 5L', 'Litro', 4.50, 2, 3, '2026-09-01', 'Ecografía'),
('INV-007', 'Pasta Profiláctica Mentolada', 'Pote 100g', 6.00, 12, 4, '2026-08-20', 'Odontología')
ON CONFLICT (id) DO NOTHING;

INSERT INTO procedures (id, name, category, price, materials_json) VALUES
('PROC-01', 'Resina Fotocurada', 'Odontología General', 45.00, '[{"inventoryId":"INV-001","name":"Resina Fotocurada A2 (3M)","quantity":0.15},{"inventoryId":"INV-002","name":"Anestesia Lido-Epinefrina 2%","quantity":1},{"inventoryId":"INV-003","name":"Guantes de Nitrilo M","quantity":1},{"inventoryId":"INV-004","name":"Eyectores de Saliva Desechables","quantity":1}]'),
('PROC-02', 'Exodoncia Simple', 'Cirugía/Endodoncia', 60.00, '[{"inventoryId":"INV-002","name":"Anestesia Lido-Epinefrina 2%","quantity":2},{"inventoryId":"INV-003","name":"Guantes de Nitrilo M","quantity":2},{"inventoryId":"INV-004","name":"Eyectores de Saliva Desechables","quantity":1}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO consultory_rentals VALUES 
('RENT-01', 'Dr. Gabriel Torrealba', 'Endodoncia Avanzada', 'Membresía Mensual (12 Turnos)', 12, 7, 300.00, 'Al Día')
ON CONFLICT (id) DO NOTHING;

INSERT INTO extramural_lab_orders VALUES
('LAB-501', 'Ramón Isidro Morales', 'Dr. Carlos Mendoza', 'Laboratorio Dental Master Art', 'Prótesis Valplast Superior', '2026-07-30', '2026-08-07', 'En Proceso', 65.00, 160.00, 95.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payroll VALUES 
('EMP-01', 'Laura Vanessa Parra', 'Recepción & Atención al Cliente', 280.00, 45.00, 325.00, 'Pagado Quincena 1')
ON CONFLICT (id) DO NOTHING;
