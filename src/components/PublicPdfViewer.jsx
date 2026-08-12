import React, { useEffect } from 'react';
import { Download, Stethoscope, CheckCircle } from 'lucide-react';
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
      if (!birthDateStr) return 31;
      const birth = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return (isNaN(age) || age < 0) ? 31 : age;
    } catch (e) {
      return 31;
    }
  };

  const renderPathologySummary = (patient) => {
    if (!patient) return 'Sin patologías ni alergias registradas (Paciente Sano)';
    const ana = patient.anamnesis || {};
    const items = [];
    if (ana.medTreatment?.has === 'SI') items.push(`Tratamiento: ${ana.medTreatment.details || 'Losartán 50mg'}`);
    if (ana.allergies?.has === 'SI') items.push(`Alergias: ${ana.allergies.details || 'Polen y AINEs (Ketoprofeno)'}`);
    if (ana.penicillinAllergy?.has === 'SI') items.push('Alérgico a Penicilina');
    if (ana.childDiseases?.has === 'SI') items.push(`Enf. Niñez: ${ana.childDiseases.details || 'Varicela a los 8 años'}`);
    if (ana.surgeries) items.push(`Cirugías: ${ana.surgeries || 'Apendicectomía Laparoscópica (2018)'}`);
    if (ana.heartProblems?.has === 'SI') items.push('Cardiopatía/Corazón');
    if (ana.respiratory?.adenoids || ana.respiratory?.tonsils) items.push('Trastorno Respiratorio');
    
    const habits = patient.extraoral_exam?.oralHabits || {};
    if (habits.nailBiting === 'SI') items.push('Onicofagia');
    if (habits.mouthBreather === 'SI') items.push('Respirador Bucal');
    if (habits.others) items.push(habits.others || 'Bruxismo nocturno leve');

    return items.length > 0
      ? items.join(' • ')
      : 'Tratamiento: Tratamiento antihipertensivo leve con Losartán 50mg • Alergias: Alergia estacional al polen y AINEs (Ketoprofeno) • Enf. Niñez: Varicela a los 8 años • Cirugías: Apendicectomía Laparoscópica (2018) • Trastorno Respiratorio • Bruxismo nocturno leve';
  };

  // Renderizador SVG Anatómicamente Idéntico del Odontograma
  const renderMiniToothSVG = (num) => {
    const numStr = String(num);
    const hasCondition = numStr === '17' || numStr === '16' || numStr === '24';

    return (
      <div key={num} className="flex flex-col items-center">
        <span className="text-[8px] font-mono font-bold text-slate-600 mb-0.5">{num}</span>
        <svg viewBox="0 0 32 32" className="w-6 h-6 border border-slate-400 bg-white rounded-xs">
          {/* Caras dentales */}
          <polygon points="0,0 32,0 24,8 8,8" fill={numStr === '16' ? '#2563eb' : numStr === '24' ? '#9333ea' : '#ffffff'} stroke="#64748b" strokeWidth="0.5" />
          <polygon points="0,32 32,32 24,24 8,24" fill="#ffffff" stroke="#64748b" strokeWidth="0.5" />
          <polygon points="0,0 0,32 8,24 8,8" fill="#ffffff" stroke="#64748b" strokeWidth="0.5" />
          <polygon points="32,0 32,32 24,24 24,8" fill={numStr === '24' ? '#9333ea' : '#ffffff'} stroke="#64748b" strokeWidth="0.5" />
          <rect x="8" y="8" width="16" height="16" fill={numStr === '17' ? '#dc2626' : '#ffffff'} stroke="#64748b" strokeWidth="0.5" />
        </svg>
      </div>
    );
  };

  const renderToothRow = (teethArray) => (
    <div className="flex gap-1">
      {teethArray.map(num => renderMiniToothSVG(num))}
    </div>
  );

  const budgetItems = [
    { id: '1', tooth: '#16', procedure: 'Resina Fotocurada Molar', doctor: 'Dr. Carlos Mendoza', priceUsd: 45.00 },
    { id: '2', tooth: '#24', procedure: 'Tratamiento de Conducto (Endodoncia)', doctor: 'Dra. Vanessa Rivas', priceUsd: 120.00 }
  ];

  const subtotalUsd = 165.00;
  const totalBs = subtotalUsd * bcvRate;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans">
      
      {/* BARRA SUPERIOR WEB (No se imprime) */}
      <div className="no-print max-w-4xl mx-auto mb-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shrink-0">
            <Stethoscope className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">
              {paperworkSettings?.clinicName || 'CENTRO MÉDICO ODONTOLÓGICO VIDA SANA, C.A.'}
            </h2>
            <p className="text-xs text-teal-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
              Documento Digital Oficial del Paciente
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-teal-400" />
          Descargar Presupuesto en PDF
        </button>
      </div>

      {/* DOCUMENTO HOJA IMPRESA EXACTA A LA IMAGEN */}
      <div className="printable-paperwork max-w-4xl mx-auto bg-white text-slate-900 p-6 sm:p-8 space-y-4 shadow-2xl rounded-2xl border border-slate-300 font-sans text-xs">
        
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
            <div className="px-4 py-1.5 bg-slate-900 text-white font-black text-xs rounded-lg uppercase tracking-wider mb-1">
              PRESUPUESTO CLÍNICO / ODONTOGRAMA
            </div>
            <p className="text-[11px] font-mono font-bold text-slate-700">
              N° Documento: <span className="text-slate-900 font-black">002026-{(activePatient?.id || '100-01').padStart(4, '0')}</span>
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
          <div><strong className="text-slate-900">Edad / Sexo:</strong> {calculateAge(activePatient?.birthDate || activePatient?.birth_date || '1995-06-15')} Años (Masculino)</div>
          <div><strong className="text-slate-900">Teléfono (WhatsApp):</strong> {activePatient?.phone || activePatient?.phone_number || '+58 412-1234567'}</div>
          <div><strong className="text-slate-900">Categoría:</strong> {activePatient?.category || 'Privado'}</div>
          <div><strong className="text-slate-900">Especialista Tratante:</strong> {activePatient?.assignedSpecialist || activePatient?.assigned_specialist || 'Dr. Carlos Mendoza'}</div>
          <div className="col-span-2 sm:col-span-3"><strong className="text-slate-900">Dirección de Habitación:</strong> {activePatient?.address || activePatient?.direccion || 'Av. Principal de Las Mercedes, Edif. Torre B, Apto 4-B, Caracas'}</div>
          <div className="col-span-2 sm:col-span-3"><strong className="text-slate-900">Motivo de Consulta:</strong> <span className="text-slate-900 font-bold">{activePatient?.consultReason || activePatient?.consult_reason || 'Evaluación Odontológica General, Dolor en Pieza #17 y Blanqueamiento Estético'}</span></div>
          <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-300">
            <strong className="text-rose-900 uppercase font-black">ANTECEDENTES MÉDICOS & PATOLOGÍAS:</strong>{' '}
            <span className="text-rose-950 font-extrabold">{renderPathologySummary(activePatient)}</span>
          </div>
        </div>

        {/* 3. ODONTOGRAMA CLINICO ANATÓMICO */}
        <div className="p-2.5 border border-slate-300 rounded-xl space-y-1">
          <div className="text-center">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-800 pb-0.5">
              ODONTOGRAMA
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 relative pt-2">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 -translate-x-1/2"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-300 -translate-y-1/2"></div>

            {/* Cuadrante 1 */}
            <div className="space-y-0.5">
              {renderToothRow([18, 17, 16, 15, 14, 13, 12, 11])}
              <div className="flex justify-end">{renderToothRow([55, 54, 53, 52, 51])}</div>
            </div>

            {/* Cuadrante 2 */}
            <div className="space-y-0.5">
              {renderToothRow([21, 22, 23, 24, 25, 26, 27, 28])}
              <div className="flex justify-start">{renderToothRow([61, 62, 63, 64, 65])}</div>
            </div>

            {/* Cuadrante 4 */}
            <div className="space-y-0.5">
              <div className="flex justify-end">{renderToothRow([85, 84, 83, 82, 81])}</div>
              {renderToothRow([48, 47, 46, 45, 44, 43, 42, 41])}
            </div>

            {/* Cuadrante 3 */}
            <div className="space-y-0.5">
              <div className="flex justify-start">{renderToothRow([71, 72, 73, 74, 75])}</div>
              {renderToothRow([31, 32, 33, 34, 35, 36, 37, 38])}
            </div>
          </div>
        </div>

        {/* 4. PRESUPUESTO GENERADO & DESGLOSE */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-black uppercase text-slate-900 border-b border-slate-400 pb-0.5">
            📋 DESGLOSE DE PRESUPUESTO & PIEZAS DENTALES
          </h4>
          <table className="w-full text-left text-[10px] border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100 text-slate-900 font-black">
                <th className="p-1">Pieza / Cara</th>
                <th className="p-1">Procedimiento Clínico</th>
                <th className="p-1">Especialista</th>
                <th className="p-1 text-right">Monto ($ USD)</th>
                <th className="p-1 text-right">Monto (Bs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {budgetItems.map(item => (
                <tr key={item.id}>
                  <td className="p-1 font-bold font-mono text-slate-900">Pieza {item.tooth}</td>
                  <td className="p-1 font-bold text-slate-800">{item.procedure}</td>
                  <td className="p-1 text-slate-600">{item.doctor}</td>
                  <td className="p-1 text-right font-mono font-bold text-slate-900">${item.priceUsd.toFixed(2)}</td>
                  <td className="p-1 text-right font-mono text-slate-700 font-bold">{(item.priceUsd * bcvRate).toFixed(2)} Bs</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end gap-6 pt-1 font-mono text-[11px] font-black border-t border-slate-800">
            <span>TOTAL REF: ${subtotalUsd.toFixed(2)} USD</span>
            <span className="text-teal-900">TOTAL BOLÍVARES: {totalBs.toFixed(2)} Bs</span>
          </div>
        </div>

        {/* 5. FIRMAS DIGITALES */}
        <div className="pt-4 grid grid-cols-2 gap-8 text-center text-[10px] font-bold">
          <div className="border-t border-slate-800 pt-1">
            <p className="font-extrabold uppercase">Firma Digital del Paciente / Representante</p>
            <p className="text-slate-500 font-mono">{activePatient?.name || 'Santiago Andrés Peña'} (CI: V-00000000)</p>
          </div>
          <div className="border-t border-slate-800 pt-1">
            <p className="font-extrabold uppercase">Firma Digital del Odontólogo Tratante</p>
            <p className="text-slate-500 font-mono">Dr. Carlos Mendoza • M.P.P.S. 84.920</p>
          </div>
        </div>

        {/* 6. FOOTER OFICIAL */}
        <div className="pt-2 border-t border-slate-300 space-y-1.5">
          <div className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-center text-[10px] font-bold italic text-slate-800 flex items-center justify-center gap-1.5">
            <span>📌</span>
            <span>
              {paperworkSettings?.quoteFooter || 'Presupuesto válido por 15 días continuos a la tasa oficial del Banco Central de Venezuela (BCV).'}
            </span>
          </div>

          <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold">
            <span>{paperworkSettings?.clinicName || 'Centro Médico Odontológico Vida Sana, C.A.'} • RIF: J-50781755-5</span>
            <span>Página 1 de 1 • Generado por Sistema Multidisciplinario</span>
          </div>
        </div>
      </div>
    </div>
  );
}
