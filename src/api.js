import { supabase } from './supabaseClient';

const API_BASE = 'http://localhost:3001/api';

// Helper para resguardo local de usuarios creados
function getLocalUsers() {
  try {
    const saved = localStorage.getItem('cmo_local_users');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalUsers(usersList) {
  try {
    localStorage.setItem('cmo_local_users', JSON.stringify(usersList));
  } catch (e) {}
}

// 0. AUTHENTICATION & LOGIN
export async function loginApi(email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  let userFoundInSupabase = false;

  // 1. Intentar autenticar contra Supabase si está disponible
  if (supabase) {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail);

      if (!error && Array.isArray(users) && users.length > 0) {
        userFoundInSupabase = true;
        // Buscar coincidencia flexible por contraseña comparando password_hash o password
        const matchedUser = users.find(u => {
          const pass1 = String(u.password || '').trim();
          const pass2 = String(u.password_hash || '').trim();
          return (pass1 && pass1 === cleanPassword) || (pass2 && pass2 === cleanPassword);
        });

        if (matchedUser) {
          return {
            success: true,
            user: {
              id: matchedUser.id,
              name: matchedUser.name,
              email: matchedUser.email,
              role: matchedUser.role || 'Administrador',
              token: `token-${matchedUser.id}-${Date.now()}`
            }
          };
        }
      }
    } catch (err) {
      console.warn("⚠️ Error al autenticar con Supabase:", err);
    }
  }

  // 2. Intentar autenticar contra usuarios guardados localmente (cmo_local_users)
  const localUsers = getLocalUsers();
  const matchedLocalUser = localUsers.find(u => {
    const uEmail = String(u.email || '').trim().toLowerCase();
    const uPass = String(u.password || u.password_hash || '').trim();
    return uEmail === cleanEmail && uPass === cleanPassword;
  });

  if (matchedLocalUser) {
    return {
      success: true,
      user: {
        id: matchedLocalUser.id,
        name: matchedLocalUser.name,
        email: matchedLocalUser.email,
        role: matchedLocalUser.role || 'Administrador',
        token: `token-local-${matchedLocalUser.id}-${Date.now()}`
      }
    };
  }

  // 3. Fallback de Administrador predeterminado demo
  const isAdminEmail = (cleanEmail === 'admin@vidasana.com' || cleanEmail === 'admin@vidasanacmo.com' || cleanEmail === 'admin');
  if (isAdminEmail && cleanPassword === 'admin123') {
    return {
      success: true,
      user: {
        id: 1,
        name: 'Administrador Principal',
        email: cleanEmail.includes('@') ? cleanEmail : 'admin@vidasanacmo.com',
        role: 'Administrador',
        token: 'token-admin-demo'
      }
    };
  }

  // 4. Si el usuario existe en Supabase pero la contraseña no coincidió
  if (userFoundInSupabase) {
    throw new Error('Contraseña incorrecta. Verifique sus datos.');
  }

  throw new Error('Credenciales inválidas. Verifique su correo y contraseña.');
}

export async function registerApi(name, email, password) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  return createUserApi({
    name,
    email: cleanEmail,
    password: cleanPassword,
    role: 'Administrador'
  });
}

// 0.1 USER MANAGEMENT CRUD (SUPABASE + LOCAL STORAGE SYNC)
export async function fetchUsersApi() {
  let cloudUsers = [];
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
      if (!error && Array.isArray(data)) cloudUsers = data;
    } catch (e) {}
  }
  const localUsers = getLocalUsers();
  
  // Combinar usuarios de Supabase con usuarios locales evitando duplicados por email
  const combinedMap = new Map();
  cloudUsers.forEach(u => combinedMap.set(String(u.email || '').toLowerCase(), u));
  localUsers.forEach(u => {
    const emailKey = String(u.email || '').toLowerCase();
    if (!combinedMap.has(emailKey)) {
      combinedMap.set(emailKey, u);
    }
  });

  const merged = Array.from(combinedMap.values());

  if (merged.length === 0) {
    return [
      { id: 1, name: 'Administrador Principal', email: 'admin@vidasanacmo.com', role: 'Administrador', password_hash: 'admin123', password: 'admin123', created_at: new Date().toISOString() }
    ];
  }
  return merged;
}

export async function createUserApi(userData) {
  const cleanEmail = String(userData.email || '').trim().toLowerCase();
  const cleanPassword = String(userData.password || userData.password_hash || '123456').trim();
  const newUserRecord = {
    id: userData.id || `USR-${Date.now().toString().slice(-4)}`,
    name: String(userData.name || '').trim(),
    email: cleanEmail,
    password_hash: cleanPassword,
    password: cleanPassword,
    role: userData.role || 'Administrador',
    created_at: new Date().toISOString()
  };

  // 1. Guardar en localStorage siempre como respaldo de seguridad local
  const currentLocals = getLocalUsers();
  const existingIndex = currentLocals.findIndex(u => String(u.email || '').trim().toLowerCase() === cleanEmail);
  if (existingIndex >= 0) {
    currentLocals[existingIndex] = { ...currentLocals[existingIndex], ...newUserRecord };
  } else {
    currentLocals.push(newUserRecord);
  }
  saveLocalUsers(currentLocals);

  // 2. Intentar guardar en Supabase si está disponible
  if (supabase) {
    try {
      const { data, error } = await supabase.from('users').insert([{
        name: newUserRecord.name,
        email: newUserRecord.email,
        password_hash: cleanPassword,
        password: cleanPassword,
        role: newUserRecord.role
      }]).select();
      
      if (!error && data && data.length > 0) return data[0];
      if (error && (error.message.includes('unique') || error.message.includes('duplicate'))) {
        throw new Error('El correo ya se encuentra registrado en el sistema.');
      }
    } catch (e) {
      if (e.message && e.message.includes('registrado')) {
        throw e;
      }
      console.warn("⚠️ Supabase createUserApi aviso (usando copia local):", e.message || e);
    }
  }

  return newUserRecord;
}

export async function updateUserApi(id, userData) {
  const cleanEmail = String(userData.email || '').trim().toLowerCase();
  const cleanPass = userData.password ? String(userData.password).trim() : null;

  // Actualizar respaldo local
  const currentLocals = getLocalUsers();
  const updatedLocals = currentLocals.map(u => {
    if (String(u.id) === String(id) || String(u.email).toLowerCase() === cleanEmail) {
      return {
        ...u,
        name: userData.name || u.name,
        email: cleanEmail || u.email,
        role: userData.role || u.role,
        ...(cleanPass && { password: cleanPass, password_hash: cleanPass })
      };
    }
    return u;
  });
  saveLocalUsers(updatedLocals);

  if (supabase) {
    try {
      const updatePayload = {
        name: userData.name,
        email: cleanEmail,
        role: userData.role
      };
      if (cleanPass) {
        updatePayload.password_hash = cleanPass;
        updatePayload.password = cleanPass;
      }
      const { data, error } = await supabase.from('users').update(updatePayload).eq('id', id).select();
      if (!error && data && data.length > 0) return data[0];
    } catch (e) {
      console.warn("⚠️ Fallo en actualización Supabase:", e);
    }
  }
  return { ...userData, id };
}

export async function deleteUserApi(id) {
  const currentLocals = getLocalUsers();
  saveLocalUsers(currentLocals.filter(u => String(u.id) !== String(id)));

  if (supabase) {
    try {
      await supabase.from('users').delete().eq('id', id);
    } catch (e) {}
  }
  return true;
}

// 1. PACIENTES
export async function fetchPatients() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('patients').select('*').order('id', { ascending: false });
      if (!error && data) return data;
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/patients`);
    if (res.ok) return await res.json();
  } catch (err) {}
  return null;
}

export async function createPatientApi(patientData) {
  const currentUrl = (import.meta.env.VITE_SUPABASE_URL || 'URL_NO_DEFINIDA').trim();
  let lastError = `No se encontraron las llaves VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en Vercel (URL: ${currentUrl})`;
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('patients').insert([patientData]).select().single();
      if (!error && data) return data;
      lastError = error ? `${error.message || JSON.stringify(error)} (Intentando conectar a: ${currentUrl})` : 'Respuesta vacía de Supabase';
      console.warn("⚠️ Supabase devolvió un error:", lastError);
    } catch (e) {
      lastError = `${e?.message || String(e)} (URL: ${currentUrl})`;
      console.warn("⚠️ Fallo crítico de conexión a Supabase:", e);
    }
  }
  
  // Respaldo local si Supabase no está conectado o falla
  return { 
    ...patientData, 
    id: patientData.id || `100-${Math.floor(Math.random() * 1000).toString().padStart(2, '0')}`,
    isLocalFallback: true,
    supabaseErrorMsg: lastError
  };
}

export async function updatePatientApi(patientId, patientData) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('patients').update(patientData).eq('id', patientId).select().single();
      if (!error && data) return data;
      if (error) throw new Error(error.message);
    } catch (e) {
      console.warn("Error al actualizar paciente en Supabase:", e);
    }
  }
  return { ...patientData, id: patientId };
}

export async function deletePatientApi(patientId) {
  if (supabase) {
    try {
      const { error } = await supabase.from('patients').delete().eq('id', patientId);
      if (error) throw new Error(error.message);
      return true;
    } catch (e) {
      console.warn("Error al eliminar paciente en Supabase:", e);
    }
  }
  return true;
}

export async function executeProcedureApi(patientId, procId, doctorName) {
  try {
    const res = await fetch(`${API_BASE}/patients/${patientId}/execute-procedure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procId, doctorName })
    });
    return await res.json();
  } catch (e) {
    return { success: true };
  }
}

export async function fetchOdontogramApi(patientId) {
  if (supabase) {
    try {
      const { data } = await supabase.from('patient_odontogram').select('tooth_number, status, notes').eq('patient_id', patientId);
      if (data) return data.map(r => ({ toothNumber: r.tooth_number, status: r.status, notes: r.notes }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/patients/${patientId}/odontogram`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function saveOdontogramToothApi(patientId, toothNumber, status, notes) {
  if (supabase) {
    try {
      await supabase.from('patient_odontogram').upsert({
        patient_id: patientId,
        tooth_number: parseInt(toothNumber),
        status,
        notes: notes || ''
      });
      return { success: true };
    } catch (e) {}
  }
  const res = await fetch(`${API_BASE}/patients/${patientId}/odontogram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toothNumber, status, notes })
  });
  return await res.json();
}

export async function fetchConsentsApi(patientId) {
  if (supabase) {
    try {
      const { data } = await supabase.from('patient_consents').select('*').eq('patient_id', patientId).order('signed_at', { ascending: false });
      if (data) return data.map(c => ({ id: c.id, patientId: c.patient_id, patientName: c.patient_name, templateTitle: c.template_title, signedAt: c.signed_at, signaturePng: c.signature_png }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/patients/${patientId}/consents`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function saveConsentApi(patientId, patientName, templateTitle, signaturePng) {
  const consentId = `CNS-${Date.now().toString().slice(-4)}`;
  const signedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

  if (supabase) {
    try {
      await supabase.from('patient_consents').insert([{
        id: consentId,
        patient_id: patientId,
        patient_name: patientName,
        template_title: templateTitle,
        signed_at: signedAt,
        signature_png: signaturePng
      }]);
      return { id: consentId, patientId, patientName, templateTitle, signedAt, signaturePng };
    } catch (e) {}
  }

  const res = await fetch(`${API_BASE}/patients/${patientId}/consents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientName, templateTitle, signaturePng })
  });
  return await res.json();
}

// 2. CITAS
export async function fetchAppointmentsApi() {
  if (supabase) {
    try {
      const { data } = await supabase.from('appointments').select('*').order('date', { ascending: true });
      if (data) return data.map(a => ({ id: a.id, date: a.date, time: a.time, patientName: a.patient_name, specialistName: a.specialist_name, consultory: a.consultory, procedureName: a.procedure_name, status: a.status, whatsappSent: a.whatsapp_sent }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/appointments`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createAppointmentApi(data) {
  const apptData = {
    id: `APP-${Math.floor(100 + Math.random() * 900)}`,
    date: data.date,
    time: data.time,
    patient_name: data.patientName,
    specialist_name: data.specialistName,
    consultory: data.consultory,
    procedure_name: data.procedureName,
    status: 'Confirmada',
    whatsapp_sent: 1
  };

  if (supabase) {
    try {
      await supabase.from('appointments').insert([apptData]);
      return { ...data, id: apptData.id, status: 'Confirmada', whatsappSent: 1 };
    } catch (e) {}
  }

  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

// 3. INVENTARIO & PROCEDIMIENTOS
export async function fetchInventory() {
  if (supabase) {
    try {
      const { data } = await supabase.from('inventory').select('*').order('id', { ascending: true });
      if (data) return data.map(i => ({ id: i.id, name: i.name, unit: i.unit, unitCost: i.unit_cost, currentStock: i.current_stock, minStock: i.min_stock, expDate: i.exp_date, category: i.category }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/inventory`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createInventoryApi(data) {
  if (supabase) {
    try {
      const { data: result } = await supabase.from('inventory').insert([{
        id: `INV-${Date.now().toString().slice(-4)}`,
        name: data.name,
        unit: data.unit,
        unit_cost: parseFloat(data.unitCost)||0,
        current_stock: parseFloat(data.currentStock)||0,
        min_stock: parseFloat(data.minStock)||0,
        exp_date: data.expDate,
        category: data.category
      }]).select().single();
      if (result) return result;
    } catch (e) {}
  }
  const res = await fetch(`${API_BASE}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function adjustStockApi(id, type, quantity) {
  try {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, quantity })
    });
    return await res.json();
  } catch (e) {
    return { success: true };
  }
}

export async function fetchProcedures() {
  if (supabase) {
    try {
      const { data } = await supabase.from('procedures').select('*');
      if (data) return data.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price, materials: p.materials_json }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/procedures`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

// 4. ESPECIALISTAS & COBRANZA
export async function fetchSpecialists() {
  if (supabase) {
    try {
      const { data } = await supabase.from('specialists').select('*');
      if (data) return data.map(s => ({ id: s.id, name: s.name, specialty: s.specialty, commissionRates: s.commission_rates_json, rIF: s.rif }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/specialists`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createSpecialistApi(data) {
  const specData = {
    id: `DOC-${Date.now().toString().slice(-4)}`,
    name: data.name,
    specialty: data.specialty,
    commission_rates_json: data.commissionRates || { Privado: 50, Funcionario: 45, Convenio: 40, Asegurado: 45 },
    rif: data.rIF || 'V-00000000-0'
  };
  if (supabase) {
    try {
      await supabase.from('specialists').insert([specData]);
      return { id: specData.id, name: data.name, specialty: data.specialty, commissionRates: specData.commission_rates_json, rIF: specData.rif };
    } catch (e) {}
  }
  const res = await fetch(`${API_BASE}/specialists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function fetchCashTransactions() {
  if (supabase) {
    try {
      const { data } = await supabase.from('cash_transactions').select('*').order('date', { ascending: false });
      if (data) return data.map(t => ({ id: t.id, date: t.date, patient: t.patient_name, category: t.category, procedure: t.procedure_name, doctor: t.doctor_name, total: t.total, paymentMethods: t.payment_methods_json, shift: t.shift, receiver: t.receiver }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/cash-transactions`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createCashTransactionApi(txData) {
  const txObj = {
    id: txData.id || `TX-${Date.now().toString().slice(-4)}`,
    date: txData.date || new Date().toISOString().replace('T', ' ').slice(0, 16),
    patient_name: txData.patient,
    category: txData.category,
    procedure_name: txData.procedure,
    doctor_name: txData.doctor,
    total: txData.total,
    payment_methods_json: txData.paymentMethods,
    shift: txData.shift || 'Mañana',
    receiver: txData.receiver || 'Caja Central'
  };

  if (supabase) {
    try {
      await supabase.from('cash_transactions').insert([txObj]);
      return txData;
    } catch (e) {}
  }

  const res = await fetch(`${API_BASE}/cash-transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData)
  });
  return await res.json();
}

export async function fetchCasheaTransactions() {
  if (supabase) {
    try {
      const { data } = await supabase.from('cashea_transactions').select('*').order('date', { ascending: false });
      if (data) return data.map(r => ({ id: r.id, date: r.date, patientName: r.patient_name, treatment: r.treatment, totalAmount: r.total_amount, downPayment: r.down_payment, financedAmount: r.financed_amount, mdrRate: r.mdr_rate, mdrFee: r.mdr_fee, ivaFee: r.iva_fee, netBankIncome: r.net_bank_income, specialistName: r.specialist_name, specialistScheme: r.specialist_scheme, status: r.status, batchCode: r.batch_code }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/cashea`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function reconcileCasheaApi(batchIds) {
  if (supabase) {
    try {
      await supabase.from('cashea_transactions').update({ status: 'Conciliado' }).in('id', batchIds);
      return { success: true };
    } catch (e) {}
  }
  const res = await fetch(`${API_BASE}/cashea/reconcile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchIds })
  });
  return await res.json();
}

export async function fetchConsultoryRentals() {
  if (supabase) {
    try {
      const { data } = await supabase.from('consultory_rentals').select('*');
      if (data) return data.map(r => ({ id: r.id, doctorName: r.doctor_name, specialty: r.specialty, planType: r.plan_type, totalTurns: r.total_turns, usedTurns: r.used_turns, monthlyFee: r.monthly_fee, paymentStatus: r.payment_status }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/rentals`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchExtramuralLabOrders() {
  if (supabase) {
    try {
      const { data } = await supabase.from('extramural_lab_orders').select('*');
      if (data) return data.map(o => ({ id: o.id, patientName: o.patient_name, specialistName: o.specialist_name, externalLab: o.external_lab, workType: o.work_type, sentDate: o.sent_date, promisedDate: o.promised_date, status: o.status, labCost: o.lab_cost, patientPrice: o.patient_price, netMargin: o.net_margin }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/lab-orders`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function updateLabOrderStatusApi(id, status) {
  if (supabase) {
    try {
      await supabase.from('extramural_lab_orders').update({ status }).eq('id', id);
      return { success: true };
    } catch (e) {}
  }
  const res = await fetch(`${API_BASE}/lab-orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

export async function createSeniatInvoiceApi(data) {
  if (supabase) {
    try {
      const { data: resData } = await supabase.from('seniat_invoices').insert([{
        id: `INV-SENIAT-${Math.floor(1000 + Math.random() * 9000)}`,
        doctor_name: data.doctorName,
        doctor_rif: data.doctorRIF,
        invoice_number: data.invoiceNumber,
        billed_to: data.billedTo,
        clinic_rif: data.clinicRIF,
        invoice_amount: parseFloat(data.invoiceAmount),
        expected_amount: parseFloat(data.expectedAmount),
        is_exact_match: data.isExactMatch ? 1 : 0,
        status: data.status
      }]).select().single();
      if (resData) return resData;
    } catch (e) {}
  }
  const res = await fetch(`${API_BASE}/seniat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function fetchPayroll() {
  if (supabase) {
    try {
      const { data } = await supabase.from('payroll').select('*');
      if (data) return data.map(p => ({ id: p.id, name: p.name, position: p.position, baseSalary: p.base_salary, appointmentBonus: p.appointment_bonus, totalPeriod: p.total_period, status: p.status }));
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/payroll`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function payPayrollApi(id) {
  if (supabase) {
    try {
      await supabase.from('payroll').update({ status: 'Pagado & Firmado' }).eq('id', id);
      return { success: true };
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/payroll/${id}/pay`, { method: 'PUT' });
    return await res.json();
  } catch (err) {
    return { success: true };
  }
}

export async function createPayrollApi(empData) {
  if (supabase) {
    try {
      await supabase.from('payroll').insert([{
        id: empData.id,
        name: empData.name,
        position: empData.position,
        base_salary: empData.baseSalary,
        appointment_bonus: empData.customBonus || 0,
        total_period: empData.totalPeriod,
        status: empData.status || 'Pendiente Quincena'
      }]);
    } catch (e) {}
  }
  return { success: true };
}

export async function updatePayrollApi(id, empData) {
  if (supabase) {
    try {
      await supabase.from('payroll').update({
        name: empData.name,
        position: empData.position,
        base_salary: empData.baseSalary,
        appointment_bonus: empData.customBonus || 0,
        total_period: empData.totalPeriod,
        status: empData.status
      }).eq('id', id);
    } catch (e) {}
  }
  return { success: true };
}

export async function deletePayrollApi(id) {
  if (supabase) {
    try {
      await supabase.from('payroll').delete().eq('id', id);
    } catch (e) {}
  }
  return { success: true };
}
