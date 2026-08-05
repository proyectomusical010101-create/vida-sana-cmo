const API_BASE = 'http://localhost:3001/api';

export async function loginApi(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }
  return data;
}

export async function registerApi(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al registrar usuario');
  }
  return data;
}

export async function fetchPatients() {
  try {
    const res = await fetch(`${API_BASE}/patients`);
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createPatientApi(patientData) {
  const res = await fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData)
  });
  return await res.json();
}

export async function executeProcedureApi(patientId, procId, doctorName) {
  const res = await fetch(`${API_BASE}/patients/${patientId}/execute-procedure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ procId, doctorName })
  });
  return await res.json();
}

export async function fetchOdontogramApi(patientId) {
  try {
    const res = await fetch(`${API_BASE}/patients/${patientId}/odontogram`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function saveOdontogramToothApi(patientId, toothNumber, status, notes) {
  const res = await fetch(`${API_BASE}/patients/${patientId}/odontogram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toothNumber, status, notes })
  });
  return await res.json();
}

export async function fetchConsentsApi(patientId) {
  try {
    const res = await fetch(`${API_BASE}/patients/${patientId}/consents`);
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function saveConsentApi(patientId, patientName, templateTitle, signaturePng) {
  const res = await fetch(`${API_BASE}/patients/${patientId}/consents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientName, templateTitle, signaturePng })
  });
  return await res.json();
}

export async function fetchAppointmentsApi() {
  try {
    const res = await fetch(`${API_BASE}/appointments`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createAppointmentApi(data) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function fetchInventory() {
  try {
    const res = await fetch(`${API_BASE}/inventory`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createInventoryApi(data) {
  const res = await fetch(`${API_BASE}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function adjustStockApi(id, type, quantity) {
  const res = await fetch(`${API_BASE}/inventory/adjust`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, type, quantity })
  });
  return await res.json();
}

export async function fetchProcedures() {
  try {
    const res = await fetch(`${API_BASE}/procedures`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchSpecialists() {
  try {
    const res = await fetch(`${API_BASE}/specialists`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createSpecialistApi(data) {
  const res = await fetch(`${API_BASE}/specialists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function fetchCashTransactions() {
  try {
    const res = await fetch(`${API_BASE}/cash-transactions`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createCashTransactionApi(txData) {
  const res = await fetch(`${API_BASE}/cash-transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txData)
  });
  return await res.json();
}

export async function fetchCasheaTransactions() {
  try {
    const res = await fetch(`${API_BASE}/cashea`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function reconcileCasheaApi(batchIds) {
  const res = await fetch(`${API_BASE}/cashea/reconcile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchIds })
  });
  return await res.json();
}

export async function fetchConsultoryRentals() {
  try {
    const res = await fetch(`${API_BASE}/rentals`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchExtramuralLabOrders() {
  try {
    const res = await fetch(`${API_BASE}/lab-orders`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function updateLabOrderStatusApi(id, status) {
  const res = await fetch(`${API_BASE}/lab-orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return await res.json();
}

export async function createSeniatInvoiceApi(data) {
  const res = await fetch(`${API_BASE}/seniat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
}

export async function fetchPayroll() {
  try {
    const res = await fetch(`${API_BASE}/payroll`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function payPayrollApi(id) {
  const res = await fetch(`${API_BASE}/payroll/${id}/pay`, {
    method: 'PUT'
  });
  return await res.json();
}
