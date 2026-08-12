import React, { useEffect } from 'react';
import { Printer, Download, Stethoscope, CheckCircle, Phone, Landmark } from 'lucide-react';
import { CLINIC_INFO, INITIAL_PATIENTS } from '../mockData';

export default function PublicPdfViewer({
  patients = [],
  bcvRate = 755.90,
  paperworkSettings = {}
}) {
  const urlParams = new URLSearchParams(window.location.search);
  const patientIdParam = urlParams.get('patientId') || urlParams.get('id') || '100-01';

  const activePatient = (Array.isArray(patients) && patients.length > 0)
    ? (patients.find(p => String(p.id) === String(patientIdParam)) || patients[0])
    : INITIAL_PATIENTS[0];

  const calculateAge = (birthDateStr) => {
    try {
      if (!birthDateStr) return 30;
      const birth = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return (isNaN(age) || age < 0) ? 30 : age;
    } catch (e) {
      return 30;
    }
  };

  const renderPathologySummary = (patient) => {
    if (!patient) return 'Sin patologías ni alergias registradas (Paciente Sano)';
    const ana = patient.anamnesis || {};
    const items = [];
    if (ana.medTreatment?.has === 'SI') items.push(`Tratamiento: ${ana.medTreatment.details || 'Sí'}`);
    if (ana.allergies?.has === 'SI') items.push(`Alergias: ${ana.allergies.details || 'Sí'}`);
    if (ana.penicillinAllergy?.has === 'SI') items.push('Alérgico a Penicilina');
    if (ana.childDiseases?.has === 'SI') items.push(`Enf. Niñez: ${ana.childDiseases.details || 'Sí'}`);
    if (ana.surgeries) items.push(`Cirugías: ${ana.surgeries}`);
    if (ana.heartProblems?.has === 'SI') items.push('Cardiopatía/Corazón');
    if (ana.respiratory?.adenoids || ana.respiratory?.tonsils) items.push('Trastorno Respiratorio');
    
    const habits = patient.extraoral_exam?.oralHabits || {};
    if (habits.nailBiting === 'SI') items.push('Onicofagia');
    if (habits.mouthBreather === 'SI') items.push('Respirador Bucal');
    if (habits.others) items.push(habits.others);

    return items.length > 0 ? items.join(' • ') : 'Sin patologías ni alergias registradas (Paciente Sano)';
  };

  // Autodisparador de Descarga / Impresión de PDF al abrir la página desde WhatsApp
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Presupuesto Demo por Defecto
  const budgetItems = [
    { tooth: 'Pieza #16', procedure: 'Resina Fotocurada Molar', doctor: 'Dr. Carlos Mendoza', priceUsd: 45.00 },
    { tooth: 'Pieza #24', procedure: 'Tratamiento de Conducto (Endodoncia)', doctor: 'Dra. Vanessa Rivas', priceUsd: 120.00 }
  ];

  const subtotalUsd = budgetItems.reduce((acc, item) => acc + item.priceUsd, 0);
  const totalBs = subtotalUsd * bcvRate;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-8 font-sans">
      
      {/* BARRA SUPERIOR WEB (Se oculta al imprimir/guardar PDF) */}
      <div className="no-print max-w-4xl mx-auto mb-6 p-4 bg-white dark:bg-[#111c3a] border border-slate-200 dark:border-[#1e2d5a] rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-xl shrink-0">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {paperworkSettings?.clinicName || CLINIC_INFO.name}
            </h2>
            <p className="text-xs text-teal-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
              Documento Oficial Odontológico Digital del Paciente
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          Descargar Presupuesto en PDF
        </button>
      </div>

      {/* CONTENEDOR DEL DOCUMENTO PDF */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-6 sm:p-8 space-y-4 rounded-2xl shadow-xl border border-slate-200">
        
        {/* 1. HEADER OFICIAL */}
        <div className="flex justify-between items-start pb-3 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <img
              src={paperworkSettings?.logoUrl || 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png'}
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">
                {paperworkSettings?.clinicName || 'CENTRO MÉDICO ODONTOLÓGICO VIDA SANA, C.A.'}
              </h1>
              <p className="text-xs font-black text-teal-700">
                {paperworkSettings?.clinicRif || 'RIF: J-50781755-5'}
              </p>
              <p className="text-[10px] text-slate-600 font-medium">
                {paperworkSettings?.clinicAddress || 'Av. Principal, Edif. Vida Sana, Piso 1, Consultorio 102'}
              </p>
              <p className="text-[10px] text-slate-600 font-medium">
                Teléf: {paperworkSettings?.clinicPhone || '+58 412 1234567 / +58 212 9876543'} • {paperworkSettings?.clinicEmail || 'contacto@vidasanacmo.com'}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="px-3 py-1 bg-slate-900 text-white font-black text-xs rounded-lg uppercase tracking-wider mb-1">
              PRESUPUESTO CLÍNICO / ODONTOGRAMA
            </div>
            <p className="text-[11px] font-mono font-bold text-slate-700">
              N° Documento: <span className="text-slate-900 font-black">002026-{(activePatient?.id || '0891').padStart(4, '0')}</span>
            </p>
            <p className="text-[11px] font-mono text-slate-600">
              Fecha: {new Date().toLocaleDateString('es-VE')}
            </p>
            <p className="text-[11px] font-mono text-teal-800 font-bold">
              Tasa BCV: {bcvRate.toFixed(4)} Bs/$
            </p>
          </div>
        </div>

        {/* 2. FICHA COMPACTA DEL PACIENTE & ANTECEDENTES */}
        <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-[10px] font-bold">
          <div><strong className="text-slate-900">Paciente:</strong> {activePatient?.name || activePatient?.full_name || 'Santiago Andrés Peña'}</div>
          <div><strong className="text-slate-900">Cédula:</strong> {activePatient?.documentId || activePatient?.document_id || 'V-25.148.963'}</div>
          <div><strong className="text-slate-900">Edad / Sexo:</strong> {calculateAge(activePatient?.birthDate || activePatient?.birth_date || '1995-06-15')} Años ({activePatient?.gender === 'M' ? 'Masculino' : 'Femenino'})</div>
          <div><strong className="text-slate-900">Teléfono (WhatsApp):</strong> {activePatient?.phone || activePatient?.phone_number || '+58 412-1234567'}</div>
          <div><strong className="text-slate-900">Categoría:</strong> {activePatient?.category || 'Privado'}</div>
          <div><strong className="text-slate-900">Especialista Tratante:</strong> {activePatient?.assignedSpecialist || activePatient?.assigned_specialist || 'Dr. Carlos Mendoza'}</div>
          <div className="col-span-2 sm:col-span-3"><strong className="text-slate-900">Dirección de Habitación:</strong> {activePatient?.address || activePatient?.direccion || 'Av. Principal de Las Mercedes, Edif. Torre B, Apto 4-B, Caracas'}</div>
          <div className="col-span-2 sm:col-span-3"><strong className="text-slate-900">Motivo de Consulta:</strong> <span className="text-slate-900 font-bold">{activePatient?.consultReason || activePatient?.consult_reason || 'Evaluación Odontológica General, Dolor en Pieza #17 y Blanqueamiento Estético'}</span></div>
          <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-300">
            <strong className="text-rose-900 uppercase font-black">Antecedentes Médicos & Patologías:</strong>{' '}
            <span className="text-rose-950 font-extrabold">{renderPathologySummary(activePatient)}</span>
          </div>
        </div>

        {/* 3. ODONTOGRAMA DIAGNÓSTICO */}
        <div className="p-2 border border-slate-300 rounded-xl text-center">
          <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider">ODONTOGRAMA GENERAL ANATÓMICO</span>
          <div className="grid grid-cols-8 gap-1 mt-2 text-[9px] font-mono font-bold text-center">
            {['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'].map(num => (
              <div key={num} className="p-1 border border-slate-300 rounded bg-slate-50">{num}</div>
            ))}
          </div>
        </div>

        {/* 4. TABLA DE PRESUPUESTO */}
        <div className="border border-slate-300 rounded-xl overflow-hidden text-[10px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase tracking-wider text-[9px]">
                <th className="p-2">Pieza / Cara</th>
                <th className="p-2">Procedimiento Clínico</th>
                <th className="p-2">Especialista</th>
                <th className="p-2 text-right">Monto ($ USD)</th>
                <th className="p-2 text-right">Monto (Bs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold">
              {budgetItems.map(item => (
                <tr key={item.tooth}>
                  <td className="p-2">{item.tooth}</td>
                  <td className="p-2">{item.procedure}</td>
                  <td className="p-2">{item.doctor}</td>
                  <td className="p-2 text-right font-mono">${item.priceUsd.toFixed(2)}</td>
                  <td className="p-2 text-right font-mono">{(item.priceUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-2 bg-slate-100 border-t border-slate-300 flex justify-end gap-6 text-xs font-black">
            <span>TOTAL REF.: ${subtotalUsd.toFixed(2)} USD</span>
            <span className="text-teal-800">TOTAL BOLÍVARES: {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs</span>
          </div>
        </div>

        {/* 5. FIRMAS Y CERTIFICACIÓN */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-[10px] text-center font-bold">
          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-mono font-black">{activePatient?.name || 'Santiago Andrés Peña'}</div>
            <p className="text-slate-600 uppercase text-[9px]">Firma Digital del Paciente / Representante</p>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-1 mb-1 font-mono font-black">Dr. Carlos Mendoza • M.P.P.S. 84.920</div>
            <p className="text-slate-600 uppercase text-[9px]">Firma Digital del Odontólogo Tratante</p>
          </div>
        </div>

        {/* 6. FOOTER */}
        <div className="pt-2 border-t border-slate-300 text-[9px] text-slate-500 font-bold flex justify-between items-center">
          <span>{paperworkSettings?.clinicName || 'Centro Médico Odontológico Vida Sana, C.A.'} • RIF: J-50781755-5</span>
          <span>Página 1 de 1 • Documento Digital Válido</span>
        </div>
      </div>
    </div>
  );
}
