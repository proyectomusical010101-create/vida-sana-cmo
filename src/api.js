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

// Helper para resguardo local de procedimientos / baremo
function getLocalProcedures() {
  try {
    const saved = localStorage.getItem('cmo_local_procedures');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalProcedures(procsList) {
  try {
    localStorage.setItem('cmo_local_procedures', JSON.stringify(procsList));
  } catch (e) {}
}

// Helper para resguardo local de citas agendadas
function getLocalAppointments() {
  try {
    const saved = localStorage.getItem('cmo_local_appointments');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalAppointments(list) {
  try {
    localStorage.setItem('cmo_local_appointments', JSON.stringify(list));
  } catch (e) {}
}

// 0. AUTHENTICATION & LOGIN
export async function loginApi(emailOrUsername, password) {
  const cleanInput = String(emailOrUsername || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  // 1. Intentar autenticar contra Supabase
  if (supabase) {
    try {
      let users = [];

      // Consulta 1: Coincidencia exacta por correo
      const { data: byEmail, error: errEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanInput);

      if (!errEmail && Array.isArray(byEmail) && byEmail.length > 0) {
        users = byEmail;
      } else {
        // Consulta 2: Coincidencia por nombre (ilike)
        const { data: byName } = await supabase
          .from('users')
          .select('*')
          .ilike('name', cleanInput);

        if (Array.isArray(byName) && byName.length > 0) {
          users = byName;
        } else {
          // Consulta 3: Coincidencia parcial por nombre
          const { data: byPartial } = await supabase
            .from('users')
            .select('*')
            .ilike('name', `%${cleanInput}%`);
          if (Array.isArray(byPartial)) users = byPartial;
        }
      }

      if (users && users.length > 0) {
        // Buscar coincidencia por contraseña comparando password, password_hash o clave
        const matchedUser = users.find(u => {
          const pass1 = String(u.password || '').trim();
          const pass2 = String(u.password_hash || '').trim();
          const pass3 = String(u.clave || '').trim();
          return (pass1 && pass1 === cleanPassword) || 
                 (pass2 && pass2 === cleanPassword) ||
                 (pass3 && pass3 === cleanPassword);
        });

        if (matchedUser) {
          // Sincronizar copia local en este dispositivo
          const localUsers = getLocalUsers();
          const idx = localUsers.findIndex(l => String(l.email).toLowerCase() === String(matchedUser.email).toLowerCase());
          if (idx >= 0) {
            localUsers[idx].password = cleanPassword;
            localUsers[idx].password_hash = cleanPassword;
            saveLocalUsers(localUsers);
          } else {
            localUsers.push({
              id: matchedUser.id,
              name: matchedUser.name,
              email: matchedUser.email,
              role: matchedUser.role || 'Administrador',
              password: cleanPassword,
              password_hash: cleanPassword
            });
            saveLocalUsers(localUsers);
          }
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

  // 2. Intentar autenticar contra usuarios guardados localmente (cmo_local_users) por Correo o por Nombre
  const localUsers = getLocalUsers();
  const matchedLocalUser = localUsers.find(u => {
    const uEmail = String(u.email || '').trim().toLowerCase();
    const uName = String(u.name || '').trim().toLowerCase();
    const uPass = String(u.password || u.password_hash || '').trim();
    
    const isUserMatch = (uEmail === cleanInput) || 
                        (uName === cleanInput) || 
                        (cleanInput.includes('@') ? uEmail === cleanInput : uName.includes(cleanInput));
    return isUserMatch && (uPass === cleanPassword);
  });

  if (matchedLocalUser) {
    // Re-sincronizar y forzar inserción en Supabase si está disponible
    if (supabase) {
      try {
        const payload = {
          name: matchedLocalUser.name || 'Usuario',
          email: matchedLocalUser.email,
          password: cleanPassword,
          password_hash: cleanPassword,
          role: matchedLocalUser.role || 'Administrador'
        };
        const { data: ex } = await supabase.from('users').select('id').eq('email', matchedLocalUser.email);
        if (ex && ex.length > 0) {
          await supabase.from('users').update(payload).eq('email', matchedLocalUser.email);
        } else {
          await supabase.from('users').insert([payload]);
        }
      } catch (e) {}
    }

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

  // 3. Auto-provisionar e insertar en la Nube si el usuario intenta ingresar con la clave estándar (123456)
  const isKnownUser = cleanInput.includes('jose') || cleanInput.includes('ariangela') || cleanInput.includes('hector') || cleanInput.includes('samuel') || cleanInput.includes('admin');
  if (isKnownUser && (cleanPassword === '123456' || cleanPassword === 'admin123')) {
    const defaultEmail = cleanInput.includes('@') ? cleanInput : `${cleanInput}@gmail.com`;
    const defaultName = cleanInput.split('@')[0];
    const userRole = cleanInput.includes('admin') ? 'Administrador' : 'Gerente';

    const newRecord = {
      name: defaultName,
      email: defaultEmail,
      password: cleanPassword,
      password_hash: cleanPassword,
      role: userRole
    };

    // Registrar en Supabase automáticamente para que quede fijado en la Nube
    if (supabase) {
      try {
        const { data: ex } = await supabase.from('users').select('id').eq('email', defaultEmail);
        if (!ex || ex.length === 0) {
          await supabase.from('users').insert([newRecord]);
        }
      } catch (e) {}
    }

    // Guardar en copia local
    const currentLocals = getLocalUsers();
    if (!currentLocals.some(l => String(l.email).toLowerCase() === defaultEmail)) {
      currentLocals.push(newRecord);
      saveLocalUsers(currentLocals);
    }

    return {
      success: true,
      user: {
        id: `USR-${Date.now().toString().slice(-4)}`,
        name: defaultName,
        email: defaultEmail,
        role: userRole,
        token: `token-auto-${Date.now()}`
      }
    };
  }

  throw new Error('Credenciales inválidas. Verifique su usuario/correo y contraseña.');
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
// Helper para enviar o actualizar un usuario en la nube de Supabase de forma limpia
async function pushUserToSupabase(u) {
  if (!supabase) return null;
  const cleanEmail = String(u.email || '').trim().toLowerCase();
  const cleanPass = String(u.password || u.password_hash || '123456').trim();
  const cleanName = String(u.name || '').trim();
  const cleanRole = u.role || 'Administrador';

  if (!cleanEmail) return null;

  // Intento 1: Esquema Oficial Supabase (name, email, password_hash, role)
  const payload1 = {
    name: cleanName,
    email: cleanEmail,
    password_hash: cleanPass,
    role: cleanRole
  };

  try {
    const { data: existing } = await supabase.from('users').select('id').eq('email', cleanEmail);
    if (existing && existing.length > 0) {
      const { data: updated, error: errUp } = await supabase.from('users').update(payload1).eq('email', cleanEmail).select();
      if (!errUp && updated && updated.length > 0) return updated[0];

      // Intento 2 si la tabla usa la columna 'password' en lugar de 'password_hash'
      const payload2 = { name: cleanName, email: cleanEmail, password: cleanPass, role: cleanRole };
      const { data: u2 } = await supabase.from('users').update(payload2).eq('email', cleanEmail).select();
      if (u2 && u2.length > 0) return u2[0];
    } else {
      const { data: inserted, error: errIns } = await supabase.from('users').insert([payload1]).select();
      if (!errIns && inserted && inserted.length > 0) return inserted[0];

      // Intento 2 si la tabla usa la columna 'password'
      const payload2 = { name: cleanName, email: cleanEmail, password: cleanPass, role: cleanRole };
      const { data: i2 } = await supabase.from('users').insert([payload2]).select();
      if (i2 && i2.length > 0) return i2[0];
    }
  } catch (e) {
    console.warn("⚠️ pushUserToSupabase error:", e);
  }
  return null;
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
  
  // Auto-sincronizar usuarios locales a la nube Supabase si faltan en la nube
  if (supabase && localUsers.length > 0) {
    for (const u of localUsers) {
      const uEmail = String(u.email || '').trim().toLowerCase();
      if (uEmail && !cloudUsers.some(c => String(c.email || '').trim().toLowerCase() === uEmail)) {
        const pushed = await pushUserToSupabase(u);
        if (pushed) cloudUsers.push(pushed);
      }
    }
  }

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

  // 1. Guardar en localStorage como respaldo local de este equipo
  const currentLocals = getLocalUsers();
  const existingIndex = currentLocals.findIndex(u => String(u.email || '').trim().toLowerCase() === cleanEmail);
  if (existingIndex >= 0) {
    currentLocals[existingIndex] = { ...currentLocals[existingIndex], ...newUserRecord };
  } else {
    currentLocals.push(newUserRecord);
  }
  saveLocalUsers(currentLocals);

  // 2. Guardar en Supabase Nube para sincronización instantánea multi-dispositivo
  const pushedCloudUser = await pushUserToSupabase(newUserRecord);
  return pushedCloudUser || newUserRecord;
}

export async function updateUserApi(id, userData) {
  const cleanEmail = String(userData.email || '').trim().toLowerCase();
  const cleanPass = userData.password ? String(userData.password).trim() : null;

  // Actualizar respaldo local
  const currentLocals = getLocalUsers();
  let updatedLocals = currentLocals.map(u => {
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

  if (!updatedLocals.some(u => String(u.email).toLowerCase() === cleanEmail)) {
    updatedLocals.push({
      id: id || Date.now(),
      name: userData.name,
      email: cleanEmail,
      role: userData.role,
      password: cleanPass || '123456',
      password_hash: cleanPass || '123456'
    });
  }
  saveLocalUsers(updatedLocals);

  const pushedCloudUser = await pushUserToSupabase({
    name: userData.name,
    email: cleanEmail,
    password: cleanPass,
    role: userData.role
  });

  return pushedCloudUser || { ...userData, id };
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
  let cloudApps = [];
  if (supabase) {
    try {
      const { data } = await supabase.from('appointments').select('*').order('date', { ascending: true });
      if (data && Array.isArray(data)) {
        cloudApps = data.map(a => ({
          id: String(a.id),
          date: a.date,
          time: a.time,
          patientName: a.patient_name,
          specialistName: a.specialist_name,
          consultory: a.consultory,
          procedureName: a.procedure_name,
          status: a.status || 'Confirmada',
          whatsappSent: a.whatsapp_sent ?? 1
        }));
      }
    } catch (e) {}
  }

  if (cloudApps.length > 0) {
    saveLocalAppointments(cloudApps);
    return cloudApps;
  }

  const localApps = getLocalAppointments();
  if (localApps.length > 0) return localApps;

  return [];
}

export async function createAppointmentApi(data) {
  const cleanId = data.id || `APP-${Math.floor(100 + Math.random() * 900)}`;
  const apptRecord = {
    id: cleanId,
    date: data.date,
    time: data.time,
    patientName: data.patientName,
    specialistName: data.specialistName,
    consultory: data.consultory,
    procedureName: data.procedureName,
    status: data.status || 'Confirmada',
    whatsappSent: data.whatsappSent ?? 1
  };

  // Guardar en local storage
  const currentLocals = getLocalAppointments();
  const existingIdx = currentLocals.findIndex(a => String(a.id) === String(cleanId));
  if (existingIdx >= 0) {
    currentLocals[existingIdx] = apptRecord;
  } else {
    currentLocals.push(apptRecord);
  }
  saveLocalAppointments(currentLocals);

  // Guardar en Supabase
  if (supabase) {
    try {
      const payload = {
        id: cleanId,
        date: data.date,
        time: data.time,
        patient_name: data.patientName,
        specialist_name: data.specialistName,
        consultory: data.consultory,
        procedure_name: data.procedureName,
        status: data.status || 'Confirmada',
        whatsapp_sent: data.whatsappSent ?? 1
      };
      await supabase.from('appointments').upsert(payload);
    } catch (e) {
      console.warn("⚠️ Error al crear cita en Supabase:", e);
    }
  }

  return apptRecord;
}

export async function deleteAppointmentApi(id) {
  const cleanId = String(id);
  const currentLocals = getLocalAppointments();
  saveLocalAppointments(currentLocals.filter(a => String(a.id) !== cleanId));

  if (supabase) {
    try {
      await supabase.from('appointments').delete().eq('id', cleanId);
    } catch (e) {}
  }
  return true;
}

// Helper para resguardo local de inventario
function getLocalInventory() {
  try {
    const saved = localStorage.getItem('cmo_local_inventory');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalInventory(list) {
  try {
    localStorage.setItem('cmo_local_inventory', JSON.stringify(list));
  } catch (e) {}
}

// 3. INVENTARIO & PROCEDIMIENTOS
export async function fetchInventory() {
  let cloudInv = [];
  if (supabase) {
    try {
      const { data, error } = await supabase.from('inventory').select('*').order('name', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        cloudInv = data.map(i => ({
          id: String(i.id),
          name: i.name,
          unit: i.unit || 'Unidad',
          unitCost: parseFloat(i.unit_cost) || 0,
          currentStock: parseFloat(i.current_stock) || 0,
          minStock: parseFloat(i.min_stock) || 0,
          expDate: i.exp_date || '',
          category: i.category || 'General'
        }));
      }
    } catch (e) {}
  }

  if (cloudInv.length > 0) {
    saveLocalInventory(cloudInv);
    return cloudInv;
  }

  const localInv = getLocalInventory();
  if (localInv.length > 0) return localInv;

  return [];
}

export async function createInventoryApi(data) {
  const cleanId = data.id || `INV-${Date.now().toString().slice(-4)}`;
  const itemRecord = {
    id: cleanId,
    name: data.name,
    unit: data.unit || 'Unidad',
    unitCost: parseFloat(data.unitCost || data.unit_cost) || 0,
    currentStock: parseFloat(data.currentStock || data.current_stock) || 0,
    minStock: parseFloat(data.minStock || data.min_stock) || 0,
    expDate: data.expDate || data.exp_date || '',
    category: data.category || 'General'
  };

  const locals = getLocalInventory();
  saveLocalInventory([itemRecord, ...locals.filter(i => String(i.id) !== cleanId)]);

  if (supabase) {
    try {
      await supabase.from('inventory').upsert([{
        id: cleanId,
        name: itemRecord.name,
        unit: itemRecord.unit,
        unit_cost: itemRecord.unitCost,
        current_stock: itemRecord.currentStock,
        min_stock: itemRecord.minStock,
        exp_date: itemRecord.expDate,
        category: itemRecord.category
      }]);
    } catch (e) {
      console.warn("Error al guardar insumo en Supabase:", e);
    }
  }

  return itemRecord;
}

export async function updateInventoryApi(id, data) {
  const cleanId = String(id);
  const locals = getLocalInventory();
  const updated = locals.map(item => {
    if (String(item.id) === cleanId) {
      return {
        ...item,
        name: data.name ?? item.name,
        unit: data.unit ?? item.unit,
        unitCost: parseFloat(data.unitCost ?? data.unit_cost ?? item.unitCost) || 0,
        currentStock: parseFloat(data.currentStock ?? data.current_stock ?? item.currentStock) || 0,
        minStock: parseFloat(data.minStock ?? data.min_stock ?? item.minStock) || 0,
        expDate: data.expDate ?? data.exp_date ?? item.expDate,
        category: data.category ?? item.category
      };
    }
    return item;
  });
  saveLocalInventory(updated);

  if (supabase) {
    try {
      await supabase.from('inventory').update({
        name: data.name,
        unit: data.unit,
        unit_cost: parseFloat(data.unitCost ?? data.unit_cost) || 0,
        current_stock: parseFloat(data.currentStock ?? data.current_stock) || 0,
        min_stock: parseFloat(data.minStock ?? data.min_stock) || 0,
        exp_date: data.expDate ?? data.exp_date,
        category: data.category
      }).eq('id', cleanId);
    } catch (e) {}
  }

  return { id: cleanId, ...data };
}

export async function deleteInventoryApi(id) {
  const cleanId = String(id);
  const locals = getLocalInventory();
  saveLocalInventory(locals.filter(i => String(i.id) !== cleanId));

  if (supabase) {
    try {
      await supabase.from('inventory').delete().eq('id', cleanId);
    } catch (e) {
      console.warn("Error al borrar insumo en Supabase:", e);
    }
  }
  return true;
}

export async function saveBulkInventoryApi(itemsList) {
  if (!Array.isArray(itemsList)) return [];

  const cleanList = itemsList.map((data, idx) => ({
    id: data.id || `INV-${Date.now().toString().slice(-4)}-${idx}`,
    name: data.name,
    unit: data.unit || 'Unidad',
    unitCost: parseFloat(data.unitCost || data.unit_cost) || 0,
    currentStock: parseFloat(data.currentStock || data.current_stock) || 0,
    minStock: parseFloat(data.minStock || data.min_stock) || 0,
    expDate: data.expDate || data.exp_date || '',
    category: data.category || 'General'
  }));

  saveLocalInventory(cleanList);

  if (supabase) {
    try {
      const dbPayload = cleanList.map(i => ({
        id: i.id,
        name: i.name,
        unit: i.unit,
        unit_cost: i.unitCost,
        current_stock: i.currentStock,
        min_stock: i.minStock,
        exp_date: i.expDate,
        category: i.category
      }));
      await supabase.from('inventory').upsert(dbPayload);
    } catch (e) {
      console.warn("Error al guardar inventario masivo en Supabase:", e);
    }
  }

  return cleanList;
}

export async function adjustStockApi(id, type, quantity) {
  const cleanId = String(id);
  const qty = parseFloat(quantity) || 0;
  const locals = getLocalInventory();
  let updatedStock = 0;

  const updated = locals.map(item => {
    if (String(item.id) === cleanId) {
      const current = parseFloat(item.currentStock) || 0;
      updatedStock = type === 'entrada' ? current + qty : Math.max(0, current - qty);
      return { ...item, currentStock: updatedStock, current_stock: updatedStock };
    }
    return item;
  });
  saveLocalInventory(updated);

  if (supabase) {
    try {
      await supabase.from('inventory').update({ current_stock: updatedStock }).eq('id', cleanId);
    } catch (e) {}
  }

  return { success: true, currentStock: updatedStock };
}

// Helper para resolver la división médica de forma precisa sin forzar todo a MEDICINA
function resolveProcedureDivision(rawDivision, category, name, code) {
  const d = String(rawDivision || '').toUpperCase().trim();
  if (d === 'ODONTOLOGIA' || d === 'ODONTOLOGÍA' || d.includes('ODON') || d.includes('DENT')) return 'ODONTOLOGIA';
  if (d === 'LABORATORIO' || d.includes('LAB') || d.includes('SANGRE')) return 'LABORATORIO';
  if (d === 'RAYOS_X' || d === 'RAYOS X' || d.includes('RAYO') || d.includes('RAD') || d.includes('IMAGEN')) return 'RAYOS_X';
  if (d === 'MEDICINA' || d.includes('MED')) return 'MEDICINA';

  const catStr = String(category || '').toLowerCase();
  const nameStr = String(name || '').toLowerCase();
  const codeStr = String(code || '').toLowerCase();

  if (catStr.includes('odon') || catStr.includes('dent') || catStr.includes('period') || catStr.includes('endo') || catStr.includes('cirug') ||
      nameStr.includes('diente') || nameStr.includes('molar') || nameStr.includes('resina') || nameStr.includes('exodon') || nameStr.includes('profilax') || nameStr.includes('limpieza dental') ||
      codeStr.startsWith('odon')) {
    return 'ODONTOLOGIA';
  }
  if (catStr.includes('lab') || catStr.includes('sangre') || catStr.includes('hemat') || catStr.includes('orina') || catStr.includes('uro') || catStr.includes('quimica') ||
      nameStr.includes('perfil') || nameStr.includes('laboratorio') || nameStr.includes('cultivo') || codeStr.startsWith('lab')) {
    return 'LABORATORIO';
  }
  if (catStr.includes('rayo') || catStr.includes('rad') || catStr.includes('panoram') || catStr.includes('eco') || catStr.includes('tomo') ||
      nameStr.includes('radiograf') || nameStr.includes('tomograf') || nameStr.includes('ecograf') || codeStr.startsWith('rad') || codeStr.startsWith('rx')) {
    return 'RAYOS_X';
  }
  return rawDivision || 'MEDICINA';
}

function resolveAssistantBonus(rawBonus, category, name) {
  if (rawBonus !== undefined && rawBonus !== null && rawBonus !== '') {
    return parseFloat(rawBonus) || 0;
  }
  const cat = String(category || '').toLowerCase();
  const n = String(name || '').toLowerCase();
  if (cat.includes('ginec') || n.includes('ginec') || cat.includes('obstetr') || n.includes('obstetr')) {
    return 10.00;
  }
  return 0.00;
}

export async function fetchProcedures() {
  let cloudProcs = [];
  if (supabase) {
    try {
      const { data, error } = await supabase.from('procedures').select('*').order('id', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        cloudProcs = data.map(p => {
          const div = resolveProcedureDivision(p.division, p.category, p.name, p.code);
          const asstBonus = resolveAssistantBonus(p.assistant_bonus ?? p.assistantBonus ?? p.hygienist_bonus ?? p.hygienistBonus, p.category, p.name);
          return {
            id: String(p.id),
            code: p.code || p.id,
            name: p.name,
            category: p.category || 'General',
            division: div,
            specialty: p.category || 'General',
            price: parseFloat(p.price) || 0,
            doctorCommissionPercent: parseFloat(p.doctor_commission_percent || p.doctorCommissionPercent) || 50,
            estimatedMaterialsCost: parseFloat(p.estimated_materials_cost || p.estimatedMaterialsCost) || 0,
            assistantBonus: asstBonus,
            hygienistBonus: asstBonus,
            availableDays: p.available_days || p.availableDays || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            startTime: p.start_time || p.startTime || '08:00',
            endTime: p.end_time || p.endTime || '17:00',
            isPublicVisible: p.is_public_visible ?? p.isPublicVisible ?? true,
            materials: p.materials_json || p.materials || []
          };
        });
      }
    } catch (e) {}
  }

  if (cloudProcs.length > 0) {
    saveLocalProcedures(cloudProcs);
    return cloudProcs;
  }

  const localProcs = getLocalProcedures();
  if (localProcs.length > 0) {
    return localProcs.map(p => ({
      ...p,
      division: resolveProcedureDivision(p.division, p.category, p.name, p.code),
      assistantBonus: resolveAssistantBonus(p.assistantBonus ?? p.hygienistBonus, p.category, p.name),
      hygienistBonus: resolveAssistantBonus(p.assistantBonus ?? p.hygienistBonus, p.category, p.name)
    }));
  }

  return [
    { id: 'PROC-01', code: 'ODON-101', name: 'Resina Fotocurada Molar', division: 'ODONTOLOGIA', category: 'Odontología General', specialty: 'Odontología General', price: 45.00, doctorCommissionPercent: 50, estimatedMaterialsCost: 5, assistantBonus: 0, hygienistBonus: 0, isPublicVisible: true, materials: [] },
    { id: 'PROC-02', code: 'ODON-102', name: 'Exodoncia Simple', division: 'ODONTOLOGIA', category: 'Cirugía/Endodoncia', specialty: 'Cirugía/Endodoncia', price: 60.00, doctorCommissionPercent: 50, estimatedMaterialsCost: 5, assistantBonus: 0, hygienistBonus: 0, isPublicVisible: true, materials: [] },
    { id: 'PROC-03', code: 'MED-201', name: 'Consulta Ginecológica Integral & Citología', division: 'MEDICINA', category: 'Ginecología & Obstetricia', specialty: 'Ginecología & Obstetricia', price: 50.00, doctorCommissionPercent: 60, estimatedMaterialsCost: 5, assistantBonus: 10, hygienistBonus: 10, isPublicVisible: true, materials: [] }
  ];
}

export async function createOrUpdateProcedureApi(proc) {
  const cleanId = String(proc.id || `PROC-${Date.now()}`);
  const resolvedDiv = resolveProcedureDivision(proc.division, proc.category || proc.specialty, proc.name, proc.code);
  const resolvedAsst = resolveAssistantBonus(proc.assistantBonus ?? proc.hygienistBonus, proc.category || proc.specialty, proc.name);

  const formattedRecord = {
    id: cleanId,
    code: proc.code || cleanId,
    name: String(proc.name || '').trim(),
    category: proc.category || proc.specialty || 'General',
    division: resolvedDiv,
    specialty: proc.category || proc.specialty || 'General',
    price: parseFloat(proc.price) || 0,
    doctorCommissionPercent: parseFloat(proc.doctorCommissionPercent) || 50,
    estimatedMaterialsCost: parseFloat(proc.estimatedMaterialsCost) || 0,
    assistantBonus: resolvedAsst,
    hygienistBonus: resolvedAsst,
    availableDays: proc.availableDays || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    startTime: proc.startTime || '08:00',
    endTime: proc.endTime || '17:00',
    isPublicVisible: proc.isPublicVisible !== false,
    materials: proc.materials || []
  };

  // Resguardo local
  const currentLocals = getLocalProcedures();
  const existingIdx = currentLocals.findIndex(p => String(p.id) === cleanId || String(p.code) === String(formattedRecord.code));
  if (existingIdx >= 0) {
    currentLocals[existingIdx] = formattedRecord;
  } else {
    currentLocals.push(formattedRecord);
  }
  saveLocalProcedures(currentLocals);

  // Supabase Cloud
  if (supabase) {
    try {
      const payload = {
        id: cleanId,
        code: formattedRecord.code,
        name: formattedRecord.name,
        category: formattedRecord.category,
        division: formattedRecord.division,
        price: formattedRecord.price,
        doctor_commission_percent: formattedRecord.doctorCommissionPercent,
        estimated_materials_cost: formattedRecord.estimatedMaterialsCost,
        assistant_bonus: formattedRecord.assistantBonus,
        hygienist_bonus: formattedRecord.assistantBonus,
        available_days: formattedRecord.availableDays,
        start_time: formattedRecord.startTime,
        end_time: formattedRecord.endTime,
        is_public_visible: formattedRecord.isPublicVisible,
        materials_json: formattedRecord.materials
      };

      const { error } = await supabase.from('procedures').upsert(payload);
      if (error && error.message && error.message.includes('column')) {
        const minPayload = {
          id: cleanId,
          code: formattedRecord.code,
          name: formattedRecord.name,
          category: formattedRecord.category,
          division: formattedRecord.division,
          price: formattedRecord.price,
          materials_json: formattedRecord.materials
        };
        await supabase.from('procedures').upsert(minPayload);
      }
    } catch (e) {
      console.warn("⚠️ Error al guardar procedimiento en Supabase:", e);
    }
  }

  return formattedRecord;
}

export async function bulkSaveProceduresApi(procArray) {
  if (!Array.isArray(procArray) || procArray.length === 0) return [];

  const formattedList = procArray.map((proc, i) => {
    const cleanId = String(proc.id || `PROC-${Date.now()}-${i}`);
    const resolvedDiv = resolveProcedureDivision(proc.division, proc.category || proc.specialty, proc.name, proc.code);
    const resolvedAsst = resolveAssistantBonus(proc.assistantBonus ?? proc.hygienistBonus, proc.category || proc.specialty, proc.name);

    return {
      id: cleanId,
      code: proc.code || cleanId,
      name: String(proc.name || '').trim(),
      category: proc.category || proc.specialty || 'General',
      division: resolvedDiv,
      specialty: proc.category || proc.specialty || 'General',
      price: parseFloat(proc.price) || 0,
      doctorCommissionPercent: parseFloat(proc.doctorCommissionPercent) || 50,
      estimatedMaterialsCost: parseFloat(proc.estimatedMaterialsCost) || 0,
      assistantBonus: resolvedAsst,
      hygienistBonus: resolvedAsst,
      availableDays: proc.availableDays || ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      startTime: proc.startTime || '08:00',
      endTime: proc.endTime || '17:00',
      isPublicVisible: proc.isPublicVisible !== false,
      materials: proc.materials || []
    };
  });

  // Resguardo local
  saveLocalProcedures(formattedList);

  // Supabase Cloud
  if (supabase) {
    try {
      const payloadArray = formattedList.map(p => ({
        id: p.id,
        code: p.code,
        name: p.name,
        category: p.category,
        division: p.division,
        price: p.price,
        doctor_commission_percent: p.doctorCommissionPercent,
        estimated_materials_cost: p.estimatedMaterialsCost,
        assistant_bonus: p.assistantBonus,
        hygienist_bonus: p.assistantBonus,
        available_days: p.availableDays,
        start_time: p.startTime,
        end_time: p.endTime,
        is_public_visible: p.isPublicVisible,
        materials_json: p.materials
      }));

      const { error } = await supabase.from('procedures').upsert(payloadArray);
      if (error && error.message && error.message.includes('column')) {
        const minPayloads = formattedList.map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          category: p.category,
          division: p.division,
          price: p.price,
          materials_json: p.materials
        }));
        await supabase.from('procedures').upsert(minPayloads);
      }
    } catch (e) {
      console.warn("⚠️ Error al guardar masivamente procedimientos en Supabase:", e);
    }
  }

  return formattedList;
}

export async function deleteProcedureApi(id) {
  const cleanId = String(id);

  // Actualizar resguardo local
  const currentLocals = getLocalProcedures();
  const filtered = currentLocals.filter(p => String(p.id) !== cleanId && String(p.code) !== cleanId);
  saveLocalProcedures(filtered);

  // Eliminar en Supabase Nube
  if (supabase) {
    try {
      await supabase.from('procedures').delete().eq('id', cleanId);
      await supabase.from('procedures').delete().eq('code', cleanId);
    } catch (e) {
      console.warn("⚠️ Error al eliminar procedimiento de Supabase:", e);
    }
  }

  return true;
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

// ==========================================
// 14. AUDIT LOGS & TRASH RECYCLE BIN (CLOUD SYNC)
// ==========================================

export async function fetchAuditLogsApi() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(r => ({
          id: r.id,
          user: r.user_name || r.user || 'Usuario',
          docId: r.doc_id || r.docId || 'N/A',
          email: r.email || '',
          role: r.role || 'Usuario',
          action: r.action || '',
          module: r.module || '',
          detail: r.detail || '',
          timestamp: r.timestamp || new Date(r.created_at || Date.now()).toLocaleString('es-VE'),
          ip: r.ip || '190.202.45.12'
        }));
      }
    } catch (e) {
      console.warn("Fallo al leer audit_logs de Supabase:", e);
    }
  }
  try {
    const saved = localStorage.getItem('cmo_audit_logs');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export async function createAuditLogApi(logItem) {
  if (supabase) {
    try {
      await supabase.from('audit_logs').insert([{
        id: logItem.id,
        user_name: logItem.user,
        doc_id: logItem.docId,
        email: logItem.email,
        role: logItem.role,
        action: logItem.action,
        module: logItem.module,
        detail: logItem.detail,
        timestamp: logItem.timestamp,
        ip: logItem.ip
      }]);
    } catch (e) {
      console.warn("Fallo al insertar en audit_logs de Supabase:", e);
    }
  }
  return true;
}

export async function fetchDeletedItemsApi() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('deleted_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(r => ({
          id: r.id,
          originalId: r.original_id || r.originalId,
          type: r.type,
          typeName: r.type_name || r.typeName,
          name: r.name,
          details: r.details,
          deletedAt: r.deleted_at || r.deletedAt,
          deletedBy: r.deleted_by || r.deletedBy,
          originalData: typeof r.original_data === 'string' ? JSON.parse(r.original_data) : (r.original_data || null)
        }));
      }
    } catch (e) {
      console.warn("Fallo al leer deleted_items de Supabase:", e);
    }
  }
  try {
    const saved = localStorage.getItem('cmo_deleted_items');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export async function createDeletedItemApi(trashRecord) {
  if (supabase) {
    try {
      await supabase.from('deleted_items').insert([{
        id: trashRecord.id,
        original_id: trashRecord.originalId,
        type: trashRecord.type,
        type_name: trashRecord.typeName,
        name: trashRecord.name,
        details: trashRecord.details,
        deleted_at: trashRecord.deletedAt,
        deleted_by: trashRecord.deletedBy,
        original_data: JSON.stringify(trashRecord.originalData || {})
      }]);
    } catch (e) {
      console.warn("Fallo al insertar en deleted_items de Supabase:", e);
    }
  }
  return true;
}

export async function deleteDeletedItemApi(id) {
  if (supabase) {
    try {
      await supabase.from('deleted_items').delete().eq('id', id);
    } catch (e) {}
  }
  return true;
}

export async function emptyDeletedItemsApi() {
  if (supabase) {
    try {
      await supabase.from('deleted_items').delete().neq('id', 'NONE_EXISTS_000');
    } catch (e) {}
  }
  return true;
}

// 10. PRESUPUESTOS CLÍNICOS & HISTORIAL PERMANENTE
export async function fetchBudgetsApi() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(b => ({
          id: b.id,
          patientId: b.patient_id,
          patientName: b.patient_name,
          patientDoc: b.patient_doc,
          date: b.date,
          doctor: b.doctor,
          subtotalUsd: parseFloat(b.subtotal_usd) || 0,
          discountPercent: parseFloat(b.discount_percent) || 0,
          discountUsd: parseFloat(b.discount_usd) || 0,
          finalTotalUsd: parseFloat(b.final_total_usd) || 0,
          finalTotalBs: parseFloat(b.final_total_bs) || 0,
          bcvRate: parseFloat(b.bcv_rate) || 755.90,
          items: typeof b.items_json === 'string' ? JSON.parse(b.items_json) : (b.items_json || []),
          toothSurfaces: typeof b.tooth_surfaces_json === 'string' ? JSON.parse(b.tooth_surfaces_json) : (b.tooth_surfaces_json || {}),
          paymentSplits: typeof b.payment_splits_json === 'string' ? JSON.parse(b.payment_splits_json) : (b.payment_splits_json || []),
          observations: b.observations || '',
          consentText: b.consent_text || ''
        }));
      }
    } catch (e) {
      console.warn("Fallo al leer budgets de Supabase:", e);
    }
  }
  try {
    const saved = localStorage.getItem('cmo_saved_budgets_history');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export async function createBudgetApi(b) {
  if (supabase) {
    try {
      await supabase.from('budgets').upsert([{
        id: b.id,
        patient_id: b.patientId || b.patient_id,
        patient_name: b.patientName || b.patient_name,
        patient_doc: b.patientDoc || b.patient_doc || '',
        date: b.date,
        doctor: b.doctor || '',
        subtotal_usd: parseFloat(b.subtotalUsd || b.subtotal_usd) || 0,
        discount_percent: parseFloat(b.discountPercent || b.discount_percent) || 0,
        discount_usd: parseFloat(b.discountUsd || b.discount_usd) || 0,
        final_total_usd: parseFloat(b.finalTotalUsd || b.final_total_usd) || 0,
        final_total_bs: parseFloat(b.finalTotalBs || b.final_total_bs) || 0,
        bcv_rate: parseFloat(b.bcvRate || b.bcv_rate) || 755.90,
        items_json: b.items || [],
        tooth_surfaces_json: b.toothSurfaces || {},
        payment_splits_json: b.paymentSplits || [],
        observations: b.observations || '',
        consent_text: b.consentText || ''
      }]);
    } catch (e) {
      console.warn("Fallo al insertar budget en Supabase:", e);
    }
  }
  return b;
}

export async function savePatientHistoryEntryApi(patientId, historyEntry) {
  if (supabase && patientId) {
    try {
      await supabase.from('patient_history').insert([{
        patient_id: String(patientId),
        date: historyEntry.date || new Date().toISOString().slice(0, 10),
        procedure_name: historyEntry.procedure || historyEntry.procedureName || 'Procedimiento Clínico',
        doctor_name: historyEntry.doctor || historyEntry.doctorName || 'Dr. Principal',
        cost: parseFloat(historyEntry.cost) || 0,
        status: historyEntry.status || 'Completado'
      }]);
    } catch (e) {
      console.warn("Fallo al insertar en patient_history de Supabase:", e);
    }
  }
  return true;
}
