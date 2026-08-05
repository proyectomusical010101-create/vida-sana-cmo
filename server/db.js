import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos SQLite:', err.message);
  } else {
    console.log('✅ Base de datos SQLite conectada con éxito en:', dbPath);
  }
});

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export function initDb() {
  db.serialize(async () => {
    // 0. Tabla de Usuarios / Administradores
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Administrador',
        created_at TEXT NOT NULL
      )
    `);

    // 1. Tablas Pacientes y Historial
    await dbRun(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        document_id TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        age INTEGER,
        category TEXT NOT NULL,
        assigned_specialist TEXT
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS patient_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        date TEXT NOT NULL,
        procedure_name TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        cost REAL NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);

    // Odontograma
    await dbRun(`
      CREATE TABLE IF NOT EXISTS patient_odontogram (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id TEXT NOT NULL,
        tooth_number INTEGER NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        UNIQUE(patient_id, tooth_number)
      )
    `);

    // Consentimientos Digitales
    await dbRun(`
      CREATE TABLE IF NOT EXISTS patient_consents (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        template_title TEXT NOT NULL,
        signed_at TEXT NOT NULL,
        signature_png TEXT NOT NULL
      )
    `);

    // Agenda de Citas
    await dbRun(`
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
      )
    `);

    // 2. Inventario y Procedimientos
    await dbRun(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        unit TEXT NOT NULL,
        unit_cost REAL NOT NULL,
        current_stock REAL NOT NULL,
        min_stock REAL NOT NULL,
        exp_date TEXT NOT NULL,
        category TEXT NOT NULL
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS procedures (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        materials_json TEXT NOT NULL
      )
    `);

    // 3. Especialistas
    await dbRun(`
      CREATE TABLE IF NOT EXISTS specialists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        commission_rates_json TEXT NOT NULL,
        rif TEXT NOT NULL
      )
    `);

    // 4. Cashea & Cobranza
    await dbRun(`
      CREATE TABLE IF NOT EXISTS cashea_transactions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        treatment TEXT NOT NULL,
        total_amount REAL NOT NULL,
        down_payment REAL NOT NULL,
        financed_amount REAL NOT NULL,
        mdr_rate REAL NOT NULL,
        mdr_fee REAL NOT NULL,
        iva_fee REAL NOT NULL,
        net_bank_income REAL NOT NULL,
        specialist_name TEXT NOT NULL,
        specialist_scheme TEXT NOT NULL,
        status TEXT NOT NULL,
        batch_code TEXT
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS cash_transactions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        patient_name TEXT NOT NULL,
        category TEXT NOT NULL,
        procedure_name TEXT NOT NULL,
        doctor_name TEXT NOT NULL,
        total REAL NOT NULL,
        payment_methods_json TEXT NOT NULL,
        shift TEXT NOT NULL,
        receiver TEXT NOT NULL
      )
    `);

    // 5. Alquiler Consultorios
    await dbRun(`
      CREATE TABLE IF NOT EXISTS consultory_rentals (
        id TEXT PRIMARY KEY,
        doctor_name TEXT NOT NULL,
        specialty TEXT NOT NULL,
        plan_type TEXT NOT NULL,
        total_turns INTEGER NOT NULL,
        used_turns INTEGER NOT NULL,
        monthly_fee REAL NOT NULL,
        payment_status TEXT NOT NULL
      )
    `);

    // 6. Laboratorio Extramuros
    await dbRun(`
      CREATE TABLE IF NOT EXISTS extramural_lab_orders (
        id TEXT PRIMARY KEY,
        patient_name TEXT NOT NULL,
        specialist_name TEXT NOT NULL,
        external_lab TEXT NOT NULL,
        work_type TEXT NOT NULL,
        sent_date TEXT NOT NULL,
        promised_date TEXT NOT NULL,
        status TEXT NOT NULL,
        lab_cost REAL NOT NULL,
        patient_price REAL NOT NULL,
        net_margin REAL NOT NULL
      )
    `);

    // 7. Nómina & SENIAT
    await dbRun(`
      CREATE TABLE IF NOT EXISTS seniat_invoices (
        id TEXT PRIMARY KEY,
        doctor_name TEXT NOT NULL,
        doctor_rif TEXT NOT NULL,
        invoice_number TEXT NOT NULL,
        billed_to TEXT NOT NULL,
        clinic_rif TEXT NOT NULL,
        invoice_amount REAL NOT NULL,
        expected_amount REAL NOT NULL,
        is_exact_match INTEGER NOT NULL,
        status TEXT NOT NULL
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS payroll (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        base_salary REAL NOT NULL,
        appointment_bonus REAL NOT NULL,
        total_period REAL NOT NULL,
        status TEXT NOT NULL
      )
    `);

    // Seed default admin user
    const countUsers = await dbGet(`SELECT COUNT(*) as cnt FROM users`);
    if (countUsers.cnt === 0) {
      console.log('🌱 Creando usuario Administrador inicial en SQLite...');
      const nowStr = new Date().toISOString();
      await dbRun(
        `INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)`,
        ['Administrador Principal', 'admin@vidasana.com', 'admin123', 'Administrador', nowStr]
      );
    }

    // Seed initial data if empty
    const countPatients = await dbGet(`SELECT COUNT(*) as cnt FROM patients`);
    if (countPatients.cnt === 0) {
      console.log('🌱 Inicializando datos semilla en SQLite...');

      await dbRun(`INSERT INTO specialists VALUES ('DOC-01', 'Dr. Carlos Mendoza', 'Odontología General', '{"Privado":50,"Funcionario":45,"Convenio":40,"Asegurado":45}', 'V-14589632-0')`);
      await dbRun(`INSERT INTO specialists VALUES ('DOC-02', 'Dra. Elena Rostova', 'Ortodoncia', '{"Privado":60,"Funcionario":50,"Convenio":45,"Asegurado":50}', 'V-18754210-5')`);
      await dbRun(`INSERT INTO specialists VALUES ('DOC-03', 'Dr. Roberto Gómez', 'Cirugía/Endodoncia', '{"Privado":55,"Funcionario":50,"Convenio":45,"Asegurado":50}', 'V-12345678-9')`);
      await dbRun(`INSERT INTO specialists VALUES ('DOC-04', 'Dra. María Patricia Silva', 'Ecografía', '{"Privado":50,"Funcionario":40,"Convenio":40,"Asegurado":45}', 'V-19876543-2')`);

      await dbRun(`INSERT INTO patients VALUES ('100-01', 'Ana Sofía Rodríguez', 'V-25.148.963', '+584123456789', 'ana.rodriguez@email.com', 32, 'Privado', 'Dr. Carlos Mendoza')`);
      await dbRun(`INSERT INTO patients VALUES ('100-02', 'José Luis Márquez', 'V-18.963.214', '+584149876543', 'jlmarquez@email.com', 45, 'Funcionario', 'Dra. Elena Rostova')`);
      await dbRun(`INSERT INTO patients VALUES ('100-03', 'Valeria Coromoto Diaz', 'V-28.741.025', '+584241239876', 'valeria.diaz@email.com', 27, 'Convenio', 'Dr. Roberto Gómez')`);
      await dbRun(`INSERT INTO patients VALUES ('100-04', 'Marcos Antonio Peña', 'V-15.632.147', '+584129998877', 'mpena@email.com', 51, 'Asegurado', 'Dra. María Patricia Silva')`);

      await dbRun(`INSERT INTO patient_history (patient_id, date, procedure_name, doctor_name, cost, status) VALUES ('100-01', '2026-07-28', 'Resina Fotocurada Superior', 'Dr. Carlos Mendoza', 45.00, 'Completado')`);
      await dbRun(`INSERT INTO patient_history (patient_id, date, procedure_name, doctor_name, cost, status) VALUES ('100-01', '2026-06-15', 'Profilaxis Profunda', 'Dr. Carlos Mendoza', 25.00, 'Completado')`);

      await dbRun(`INSERT INTO patient_odontogram (patient_id, tooth_number, status, notes) VALUES ('100-01', 16, 'Caries', 'Caries oclusal profunda')`);
      await dbRun(`INSERT INTO patient_odontogram (patient_id, tooth_number, status, notes) VALUES ('100-01', 21, 'Resina', 'Resina en ángulo mesial')`);
      await dbRun(`INSERT INTO patient_odontogram (patient_id, tooth_number, status, notes) VALUES ('100-01', 36, 'Endodoncia', 'Tratamiento de conducto previo')`);
      await dbRun(`INSERT INTO patient_odontogram (patient_id, tooth_number, status, notes) VALUES ('100-01', 48, 'Ausente', 'Exodoncia previa')`);

      const todayStr = new Date().toISOString().slice(0, 10);
      await dbRun(`INSERT INTO appointments VALUES ('APP-101', '${todayStr}', '09:00 AM', 'Ana Sofía Rodríguez', 'Dr. Carlos Mendoza', 'Consultorio 1 (Odontología)', 'Resina Fotocurada', 'Confirmada', 1)`);
      await dbRun(`INSERT INTO appointments VALUES ('APP-102', '${todayStr}', '10:30 AM', 'José Luis Márquez', 'Dra. Elena Rostova', 'Consultorio 2 (Ortodoncia)', 'Control Ortodoncia', 'Confirmada', 1)`);
      await dbRun(`INSERT INTO appointments VALUES ('APP-103', '${todayStr}', '02:00 PM', 'Valeria Coromoto Diaz', 'Dr. Roberto Gómez', 'Consultorio 1 (Odontología)', 'Evaluación Endodoncia', 'Pendiente', 0)`);

      await dbRun(`INSERT INTO inventory VALUES ('INV-001', 'Resina Fotocurada A2 (3M)', 'Tubo (jeringa)', 12.50, 24, 8, '2027-05-15', 'Odontología')`);
      await dbRun(`INSERT INTO inventory VALUES ('INV-002', 'Anestesia Lido-Epinefrina 2%', 'Cárpule', 0.85, 140, 50, '2026-11-30', 'Odontología')`);
      await dbRun(`INSERT INTO inventory VALUES ('INV-003', 'Guantes de Nitrilo M', 'Par', 0.30, 350, 100, '2028-01-10', 'Protección')`);
      await dbRun(`INSERT INTO inventory VALUES ('INV-004', 'Eyectores de Saliva Desechables', 'Unidad', 0.12, 280, 80, '2028-06-20', 'Odontología')`);
      await dbRun(`INSERT INTO inventory VALUES ('INV-005', 'Agujas Cortas Dentales 30G', 'Unidad', 0.25, 110, 40, '2027-09-12', 'Odontología')`);
      await dbRun(`INSERT INTO inventory VALUES ('INV-006', 'Gel Ecográfico Conductivo 5L', 'Litro', 4.50, 2, 3, '2026-09-01', 'Ecografía')`);
      await dbRun(`INSERT INTO inventory VALUES ('INV-007', 'Pasta Profiláctica Mentolada', 'Pote 100g', 6.00, 12, 4, '2026-08-20', 'Odontología')`);

      await dbRun(`INSERT INTO procedures VALUES ('PROC-01', 'Resina Fotocurada', 'Odontología General', 45.00, '[{"inventoryId":"INV-001","name":"Resina Fotocurada A2 (3M)","quantity":0.15},{"inventoryId":"INV-002","name":"Anestesia Lido-Epinefrina 2%","quantity":1},{"inventoryId":"INV-003","name":"Guantes de Nitrilo M","quantity":1},{"inventoryId":"INV-004","name":"Eyectores de Saliva Desechables","quantity":1}]')`);
      await dbRun(`INSERT INTO procedures VALUES ('PROC-02', 'Exodoncia Simple', 'Cirugía/Endodoncia', 60.00, '[{"inventoryId":"INV-002","name":"Anestesia Lido-Epinefrina 2%","quantity":2},{"inventoryId":"INV-003","name":"Guantes de Nitrilo M","quantity":2},{"inventoryId":"INV-004","name":"Eyectores de Saliva Desechables","quantity":1}]')`);

      await dbRun(`INSERT INTO cashea_transactions VALUES ('CSH-8801', '2026-08-04', 'Ana Sofía Rodríguez', 'Tratamiento Ortodoncia Inicial', 200.00, 60.00, 140.00, 8.0, 11.20, 1.79, 127.01, 'Dra. Elena Rostova', 'Opción A', 'Pendiente Por Banco', 'LOTE-20260804-A')`);

      await dbRun(`INSERT INTO consultory_rentals VALUES ('RENT-01', 'Dr. Gabriel Torrealba', 'Endodoncia Avanzada', 'Membresía Mensual (12 Turnos)', 12, 7, 300.00, 'Al Día')`);
      await dbRun(`INSERT INTO extramural_lab_orders VALUES ('LAB-501', 'Ramón Isidro Morales', 'Dr. Carlos Mendoza', 'Laboratorio Dental Master Art', 'Prótesis Valplast Superior', '2026-07-30', '2026-08-07', 'En Proceso', 65.00, 160.00, 95.00)`);
      await dbRun(`INSERT INTO payroll VALUES ('EMP-01', 'Laura Vanessa Parra', 'Recepción & Atención al Cliente', 280.00, 45.00, 325.00, 'Pagado Quincena 1')`);

      console.log('✅ Base de datos SQLite cargada con usuario Administrador semilla.');
    }
  });
}

export default db;
