import express from 'express';
import cors from 'cors';
import { dbAll, dbGet, dbRun, initDb } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

initDb();

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor API SQLite Vida Sana CMO activo', timestamp: new Date() });
});

// 0. AUTHENTICATION & USUARIOS ADMINISTRADORES
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor ingrese correo electrónico y contraseña.' });
    }

    const user = await dbGet(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [email.trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. El usuario no existe.' });
    }

    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Contraseña incorrecta. Verifique sus datos.' });
    }

    // Token simple de sesión
    const token = `token-${user.id}-${Date.now()}`;
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    };

    res.json({ success: true, user: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Por favor llene todos los campos requeridos.' });
    }

    const existing = await dbGet(`SELECT id FROM users WHERE LOWER(email) = LOWER(?)`, [email.trim()]);
    if (existing) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
    }

    const nowStr = new Date().toISOString();
    const result = await dbRun(
      `INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), password, 'Administrador', nowStr]
    );

    const newUser = {
      id: result.lastID,
      name: name.trim(),
      email: email.trim(),
      role: 'Administrador',
      token: `token-${result.lastID}-${Date.now()}`
    };

    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. PACIENTES & EXPEDIENTES
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await dbAll(`SELECT * FROM patients ORDER BY id DESC`);
    const result = await Promise.all(patients.map(async (p) => {
      const history = await dbAll(`SELECT date, procedure_name as procedure, doctor_name as doctor, cost, status FROM patient_history WHERE patient_id = ? ORDER BY id DESC`, [p.id]);
      return {
        id: p.id,
        name: p.name,
        documentId: p.document_id,
        phone: p.phone,
        email: p.email,
        age: p.age,
        category: p.category,
        assignedSpecialist: p.assigned_specialist,
        history
      };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const { name, documentId, phone, email, age, category, assignedSpecialist } = req.body;
    const count = await dbGet(`SELECT COUNT(*) as cnt FROM patients`);
    const newId = `100-${(count.cnt + 1).toString().padStart(2, '0')}`;
    
    await dbRun(
      `INSERT INTO patients VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newId, name, documentId, phone, email || '', parseInt(age) || 30, category, assignedSpecialist]
    );

    res.json({ id: newId, name, documentId, phone, email, age, category, assignedSpecialist, history: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients/:id/execute-procedure', async (req, res) => {
  try {
    const { id } = req.params;
    const { procId, doctorName } = req.body;

    const proc = await dbGet(`SELECT * FROM procedures WHERE id = ?`, [procId]);
    if (!proc) return res.status(404).json({ error: 'Procedimiento no encontrado' });

    const materials = JSON.parse(proc.materials_json);
    const todayStr = new Date().toISOString().slice(0, 10);

    for (const mat of materials) {
      await dbRun(
        `UPDATE inventory SET current_stock = MAX(0, current_stock - ?) WHERE id = ? OR name = ?`,
        [mat.quantity, mat.inventoryId || '', mat.name || '']
      );
    }

    await dbRun(
      `INSERT INTO patient_history (patient_id, date, procedure_name, doctor_name, cost, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, todayStr, proc.name, doctorName, proc.price, 'Completado']
    );

    const patient = await dbGet(`SELECT name, category FROM patients WHERE id = ?`, [id]);
    const txId = `TX-${Date.now().toString().slice(-4)}`;
    await dbRun(
      `INSERT INTO cash_transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [txId, new Date().toISOString().replace('T', ' ').slice(0, 16), patient?.name || 'Paciente', patient?.category || 'Privado', proc.name, doctorName, proc.price, JSON.stringify([{ method: 'Efectivo USD', amount: proc.price }]), 'Mañana', 'Caja Central']
    );

    res.json({ success: true, message: 'Procedimiento ejecutado y stock descontado en SQLite' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ODONTOGRAMA
app.get('/api/patients/:id/odontogram', async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await dbAll(`SELECT tooth_number as toothNumber, status, notes FROM patient_odontogram WHERE patient_id = ?`, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients/:id/odontogram', async (req, res) => {
  try {
    const { id } = req.params;
    const { toothNumber, status, notes } = req.body;
    await dbRun(
      `INSERT OR REPLACE INTO patient_odontogram (patient_id, tooth_number, status, notes) VALUES (?, ?, ?, ?)`,
      [id, parseInt(toothNumber), status, notes || '']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONSENTIMIENTOS
app.get('/api/patients/:id/consents', async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await dbAll(`SELECT id, patient_id as patientId, patient_name as patientName, template_title as templateTitle, signed_at as signedAt, signature_png as signaturePng FROM patient_consents WHERE patient_id = ? ORDER BY signed_at DESC`, [id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients/:id/consents', async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, templateTitle, signaturePng } = req.body;
    const consentId = `CNS-${Date.now().toString().slice(-4)}`;
    const signedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

    await dbRun(
      `INSERT INTO patient_consents VALUES (?, ?, ?, ?, ?, ?)`,
      [consentId, id, patientName, templateTitle, signedAt, signaturePng]
    );

    res.json({ id: consentId, patientId: id, patientName, templateTitle, signedAt, signaturePng });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CITAS
app.get('/api/appointments', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT id, date, time, patient_name as patientName, specialist_name as specialistName, consultory, procedure_name as procedureName, status, whatsapp_sent as whatsappSent FROM appointments ORDER BY date ASC, time ASC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { date, time, patientName, specialistName, consultory, procedureName } = req.body;
    const id = `APP-${Math.floor(100 + Math.random() * 900)}`;

    await dbRun(
      `INSERT INTO appointments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, date, time, patientName, specialistName, consultory, procedureName, 'Confirmada', 1]
    );

    res.json({ id, date, time, patientName, specialistName, consultory, procedureName, status: 'Confirmada', whatsappSent: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. INVENTARIO & PROCEDIMIENTOS
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await dbAll(`SELECT id, name, unit, unit_cost as unitCost, current_stock as currentStock, min_stock as minStock, exp_date as expDate, category FROM inventory ORDER BY id ASC`);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const { name, unit, unitCost, currentStock, minStock, expDate, category } = req.body;
    const count = await dbGet(`SELECT COUNT(*) as cnt FROM inventory`);
    const id = `INV-${(count.cnt + 1).toString().padStart(3, '0')}`;

    await dbRun(
      `INSERT INTO inventory VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, unit, parseFloat(unitCost)||0, parseFloat(currentStock)||0, parseFloat(minStock)||0, expDate, category]
    );
    res.json({ id, name, unit, unitCost, currentStock, minStock, expDate, category });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/adjust', async (req, res) => {
  try {
    const { id, type, quantity } = req.body;
    const delta = type === 'entrada' ? parseFloat(quantity) : -parseFloat(quantity);
    await dbRun(`UPDATE inventory SET current_stock = MAX(0, current_stock + ?) WHERE id = ?`, [delta, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/procedures', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM procedures`);
    const result = rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      price: r.price,
      materials: JSON.parse(r.materials_json)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. ESPECIALISTAS
app.get('/api/specialists', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM specialists`);
    const result = rows.map(r => ({
      id: r.id,
      name: r.name,
      specialty: r.specialty,
      commissionRates: JSON.parse(r.commission_rates_json),
      rIF: r.rif
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/specialists', async (req, res) => {
  try {
    const { name, specialty, commissionRates, rIF } = req.body;
    const count = await dbGet(`SELECT COUNT(*) as cnt FROM specialists`);
    const id = `DOC-${(count.cnt + 1).toString().padStart(2, '0')}`;

    await dbRun(
      `INSERT INTO specialists VALUES (?, ?, ?, ?, ?)`,
      [id, name, specialty, JSON.stringify(commissionRates || { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 }), rIF || 'V-00000000-0']
    );

    res.json({ id, name, specialty, commissionRates, rIF });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. COBRANZA & CASHEA
app.get('/api/cash-transactions', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM cash_transactions ORDER BY date DESC`);
    const result = rows.map(r => ({
      id: r.id,
      date: r.date,
      patient: r.patient_name,
      category: r.category,
      procedure: r.procedure_name,
      doctor: r.doctor_name,
      total: r.total,
      paymentMethods: JSON.parse(r.payment_methods_json),
      shift: r.shift,
      receiver: r.receiver
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cash-transactions', async (req, res) => {
  try {
    const { patient, category, procedure, doctor, total, paymentMethods, shift, receiver } = req.body;
    const txId = `TX-${Date.now().toString().slice(-4)}`;
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    
    await dbRun(
      `INSERT INTO cash_transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [txId, dateStr, patient, category, procedure, doctor, parseFloat(total), JSON.stringify(paymentMethods), shift || 'Mañana', receiver || 'Caja Central']
    );

    res.json({ id: txId, date: dateStr, patient, category, procedure, doctor, total, paymentMethods, shift, receiver });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cashea', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM cashea_transactions ORDER BY date DESC`);
    const result = rows.map(r => ({
      id: r.id,
      date: r.date,
      patientName: r.patient_name,
      treatment: r.treatment,
      totalAmount: r.total_amount,
      downPayment: r.down_payment,
      financedAmount: r.financed_amount,
      mdrRate: r.mdr_rate,
      mdrFee: r.mdr_fee,
      ivaFee: r.iva_fee,
      netBankIncome: r.net_bank_income,
      specialistName: r.specialist_name,
      specialistScheme: r.specialist_scheme,
      status: r.status,
      batchCode: r.batch_code
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cashea/reconcile', async (req, res) => {
  try {
    const { batchIds } = req.body;
    for (const id of batchIds) {
      await dbRun(`UPDATE cashea_transactions SET status = 'Conciliado' WHERE id = ?`, [id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. ALQUILER CONSULTORIOS
app.get('/api/rentals', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT id, doctor_name as doctorName, specialty, plan_type as planType, total_turns as totalTurns, used_turns as usedTurns, monthly_fee as monthlyFee, payment_status as paymentStatus FROM consultory_rentals`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. LABORATORIO EXTRAMUROS
app.get('/api/lab-orders', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT id, patient_name as patientName, specialist_name as specialistName, external_lab as externalLab, work_type as workType, sent_date as sentDate, promised_date as promisedDate, status, lab_cost as labCost, patient_price as patientPrice, net_margin as netMargin FROM extramural_lab_orders`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/lab-orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await dbRun(`UPDATE extramural_lab_orders SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. SENIAT & NÓMINA
app.get('/api/seniat', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT id, doctor_name as doctorName, doctor_rif as doctorRIF, invoice_number as invoiceNumber, billed_to as billedTo, clinic_rif as clinicRIF, invoice_amount as invoiceAmount, expected_amount as expectedAmount, is_exact_match as isExactMatch, status FROM seniat_invoices`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/seniat', async (req, res) => {
  try {
    const { doctorName, doctorRIF, invoiceNumber, billedTo, clinicRIF, invoiceAmount, expectedAmount, isExactMatch, status } = req.body;
    const id = `INV-SENIAT-${Math.floor(1000 + Math.random() * 9000)}`;
    await dbRun(
      `INSERT INTO seniat_invoices VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, doctorName, doctorRIF, invoiceNumber, billedTo, clinicRIF, parseFloat(invoiceAmount), parseFloat(expectedAmount), isExactMatch ? 1 : 0, status]
    );
    res.json({ id, doctorName, doctorRIF, invoiceNumber, billedTo, clinicRIF, invoiceAmount, expectedAmount, isExactMatch, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/payroll', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT id, name, position, base_salary as baseSalary, appointment_bonus as appointmentBonus, total_period as totalPeriod, status FROM payroll`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/payroll/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun(`UPDATE payroll SET status = 'Pagado & Firmado' WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend Express con SQLite corriendo en http://localhost:${PORT}`);
});
