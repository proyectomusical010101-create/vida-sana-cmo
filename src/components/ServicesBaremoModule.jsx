import React, { useState } from 'react';
import { Layers, FileSpreadsheet, Upload, Download, Plus, Search, Filter, Stethoscope, Activity, Eye, ShieldAlert, CheckCircle, Edit, Trash2, Clock, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import { MEDICAL_DIVISIONS } from '../mockData';
import { createOrUpdateProcedureApi, bulkSaveProceduresApi, deleteProcedureApi } from '../api';

export default function ServicesBaremoModule({ procedures, setProcedures }) {
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal para agregar/editar procedimiento
  const [showModal, setShowModal] = useState(false);
  const [editingProc, setEditingProc] = useState(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDivision, setFormDivision] = useState('ODONTOLOGIA');
  const [formCategory, setFormCategory] = useState('Odontología General');
  const [formPrice, setFormPrice] = useState('45');
  const [formCommission, setFormCommission] = useState('50');
  const [formMaterialsCost, setFormMaterialsCost] = useState('0');
  const [formAssistantBonus, setFormAssistantBonus] = useState('0.00');

  // Disponibilidad de Atención al Público (Días y Horarios)
  const [formDays, setFormDays] = useState(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']);
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('17:00');

  // Pestañas Módulo 2: 'services' | 'consultorios'
  const [activeTab, setActiveTab] = useState('services');

  // Estado de Consultorios
  const [consultoriosList, setConsultoriosList] = useState([
    { id: 'CONS-01', name: 'Consultorio 1 - Ortodoncia & Estética', location: 'Piso 1, Ala A', services: ['PRO-001', 'PRO-004'] },
    { id: 'CONS-02', name: 'Consultorio 2 - Cirugía & Implantes', location: 'Piso 1, Ala B', services: ['PRO-002', 'PRO-003'] },
    { id: 'CONS-03', name: 'Consultorio 3 - Pediatría & Odontología General', location: 'Piso 1, Ala C', services: ['PRO-001'] }
  ]);
  const [showConsultorioModal, setShowConsultorioModal] = useState(false);
  const [consultorioName, setConsultorioName] = useState('');
  const [consultorioLocation, setConsultorioLocation] = useState('Piso 1');
  const [consultorioSelectedServices, setConsultorioSelectedServices] = useState([]);

  // Filtrado ultra-seguro de procedimientos
  const filteredProcedures = (procedures || []).filter(p => {
    if (!p) return false;
    const pName = String(p.name || '').toLowerCase();
    const pCode = String(p.code || p.id || '').toLowerCase();
    const pCat = String(p.category || '');
    const pDiv = String(p.division || '');
    const query = String(searchQuery || '').toLowerCase();

    const matchesDivision = selectedDivision === 'ALL' || pDiv === selectedDivision;
    const matchesCategory = selectedCategory === 'ALL' || pCat === selectedCategory;
    const matchesSearch = pName.includes(query) || pCode.includes(query);
    return matchesDivision && matchesCategory && matchesSearch;
  });

  // Generar y Descargar Plantilla Oficial Excel / CSV para Baremo
  const handleDownloadExcelTemplate = () => {
    const headers = "Codigo_Servicio;Nombre_Servicio;Division_Medica;Categoria_Especialidad;Precio_Ref_USD;Porcentaje_Comision_Doctor;Costo_Estimado_Materiales_USD;Bonificacion_Asistente_USD\n";
    const sampleRows = [
      "ODON-101;Resina Molar Fotocurada;ODONTOLOGIA;Odontología General;45.00;50;5.00;0.00",
      "MED-201;Consulta Ginecológica Integral;MEDICINA;Ginecología & Obstetricia;50.00;60;5.00;10.00",
      "MED-202;Consulta Médica Especializada;MEDICINA;Medicina General;40.00;70;0.00;0.00",
      "RAD-301;Radiografía Panorámica;RAYOS_X;Radiología Dental 3D / Panorámica;20.00;0;0.00;0.00",
      "LAB-401;Perfil 20 Completo;LABORATORIO;Bionalista / Pruebas de Sangre;35.00;40;7.00;0.00"
    ].join("\n");

    // BOM \uFEFF para que Excel abra UTF-8 perfecto en español
    const blob = new Blob(["\uFEFF" + headers + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Plantilla_Oficial_Baremos_VidaSana.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parser de Importación Masiva Robusto (CSV / Excel Text)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        let text = evt.target.result || '';
        // Remover BOM si existe
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.substring(1);
        }

        const lines = text.split(/\r\n|\n/);
        if (lines.length <= 1) {
          Swal.fire('Atención', 'El archivo está vacío o no contiene datos válidos.', 'warning');
          return;
        }

        const newProcs = [...procedures];
        let addedCount = 0;
        let updatedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Autodetectar separador (coma o punto y coma)
          const delimiter = line.includes(';') ? ';' : ',';
          const cols = line.split(delimiter).map(c => c.replace(/^["']|["']$/g, '').trim());

          if (cols.length < 2) continue;

          const code = cols[0] || `IMP-${i}`;
          const name = cols[1] || 'Servicio Sin Nombre';
          let divisionRaw = (cols[2] || '').toUpperCase();
          const category = cols[3] || 'General';
          
          // Limpiar números con comas europeas/venezolanas (ej: 45,00 -> 45.00)
          const price = parseFloat((cols[4] || '0').replace(',', '.')) || 0;
          const commission = parseFloat((cols[5] || '50').replace(',', '.')) || 50;
          const materialsCost = parseFloat((cols[6] || '0').replace(',', '.')) || 0;
          
          let assistantBonus = 0;
          if (cols[7] !== undefined && cols[7] !== '') {
            assistantBonus = parseFloat(cols[7].replace(',', '.')) || 0;
          } else if (category.toLowerCase().includes('ginec') || name.toLowerCase().includes('ginec')) {
            assistantBonus = 10.00;
          }

          let division = 'ODONTOLOGIA';
          if (divisionRaw.includes('ODON') || divisionRaw.includes('DENT')) division = 'ODONTOLOGIA';
          else if (divisionRaw.includes('LAB') || divisionRaw.includes('SANGRE')) division = 'LABORATORIO';
          else if (divisionRaw.includes('RAYO') || divisionRaw.includes('RAD') || divisionRaw.includes('X')) division = 'RAYOS_X';
          else if (divisionRaw.includes('MED')) division = 'MEDICINA';
          else {
            const cLower = category.toLowerCase();
            const nLower = name.toLowerCase();
            if (cLower.includes('odon') || nLower.includes('molar') || nLower.includes('resina') || nLower.includes('diente')) division = 'ODONTOLOGIA';
            else if (cLower.includes('lab') || nLower.includes('perfil') || nLower.includes('sangre')) division = 'LABORATORIO';
            else if (cLower.includes('rayo') || nLower.includes('panoram') || nLower.includes('eco')) division = 'RAYOS_X';
            else division = 'MEDICINA';
          }

          const existingIdx = newProcs.findIndex(p => p.code === code || p.name.toLowerCase() === name.toLowerCase());

          if (existingIdx >= 0) {
            newProcs[existingIdx] = {
              ...newProcs[existingIdx],
              code,
              name,
              division,
              category,
              specialty: category,
              price,
              doctorCommissionPercent: commission,
              estimatedMaterialsCost: materialsCost,
              assistantBonus,
              hygienistBonus: assistantBonus
            };
            updatedCount++;
          } else {
            newProcs.push({
              id: `PROC-${Date.now()}-${i}`,
              code,
              name,
              division,
              category,
              specialty: category,
              price,
              doctorCommissionPercent: commission,
              estimatedMaterialsCost: materialsCost,
              assistantBonus,
              hygienistBonus: assistantBonus,
              availableDays: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
              startTime: '08:00',
              endTime: '17:00',
              materials: []
            });
            addedCount++;
          }
        }

        const savedList = await bulkSaveProceduresApi(newProcs);
        setProcedures(savedList);

        Swal.fire({
          title: '¡Carga Masiva Completada!',
          text: `Se agregaron ${addedCount} servicios nuevos y se actualizaron ${updatedCount} existentes en el baremo.`,
          icon: 'success'
        });
      } catch (err) {
        Swal.fire('Error de Carga', `No se pudo procesar el archivo: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProcSubmit = async (e) => {
    e.preventDefault();
    if (formDays.length === 0) {
      Swal.fire('Atención', 'Debe seleccionar al menos un día disponible para atención al público.', 'warning');
      return;
    }

    const isGyn = formCategory.toLowerCase().includes('ginec') || formName.toLowerCase().includes('ginec');
    const asstBonusNum = formAssistantBonus !== '' ? (parseFloat(formAssistantBonus) || 0) : (isGyn ? 10.00 : 0.00);

    const procObj = {
      id: editingProc ? editingProc.id : `PROC-${Date.now()}`,
      code: formCode || `SERV-${Date.now().toString().slice(-4)}`,
      name: formName,
      division: formDivision,
      category: formCategory,
      specialty: formCategory,
      price: parseFloat(formPrice) || 0,
      doctorCommissionPercent: parseFloat(formCommission) || 50,
      estimatedMaterialsCost: parseFloat(formMaterialsCost) || 0,
      assistantBonus: asstBonusNum,
      hygienistBonus: asstBonusNum,
      availableDays: formDays,
      startTime: formStartTime || '08:00',
      endTime: formEndTime || '17:00',
      materials: editingProc ? editingProc.materials : []
    };

    const savedProc = await createOrUpdateProcedureApi(procObj);

    if (editingProc) {
      setProcedures(procedures.map(p => p.id === editingProc.id ? savedProc : p));
      Swal.fire('¡Servicio Actualizado!', `Se modificaron los datos de "${savedProc.name}".`, 'success');
    } else {
      setProcedures([savedProc, ...procedures]);
      Swal.fire('¡Servicio Registrado!', `El servicio "${savedProc.name}" fue agregado al baremo.`, 'success');
    }

    setShowModal(false);
    setEditingProc(null);
  };

  const handleCreateConsultorioSubmit = (e) => {
    e.preventDefault();
    if (!consultorioName.trim()) {
      Swal.fire('Atención', 'Ingresa el nombre del consultorio.', 'warning');
      return;
    }
    const newCons = {
      id: `CONS-${Date.now().toString().slice(-4)}`,
      name: consultorioName,
      location: consultorioLocation,
      services: consultorioSelectedServices
    };
    setConsultoriosList([...consultoriosList, newCons]);
    setShowConsultorioModal(false);
    setConsultorioName('');
    setConsultorioSelectedServices([]);
    Swal.fire('¡Consultorio Creado!', `Se registró "${newCons.name}" con sus servicios asignados.`, 'success');
  };

  const handleDeleteProcedure = (proc) => {
    Swal.fire({
      title: '¿Eliminar Servicio del Baremo?',
      text: `¿Estás seguro de que deseas eliminar permanentemente "${proc.name}" (${proc.code})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, Eliminar Servicio',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteProcedureApi(proc.id || proc.code);
        setProcedures(procedures.filter(p => p.id !== proc.id && p.code !== proc.code));
        Swal.fire('Eliminado', `El servicio "${proc.name}" ha sido eliminado del baremo.`, 'success');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="text-teal-600 w-7 h-7" />
            Catálogo de Servicios, Baremos & Carga Masiva Excel
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Gestión de tarifas oficiales agrupadas por 4 grandes divisiones (Medicina, Odontología, Laboratorio y Rayos X).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Descargar Plantilla Excel */}
          <button
            onClick={handleDownloadExcelTemplate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300 rounded-xl text-xs transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            Descargar Plantilla Excel
          </button>

          {/* Botón Cargar Excel */}
          <label className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            Importar Baremo
            <input type="file" accept=".csv, .txt, .xlsx" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Botón Crear Consultorio (NUEVO) */}
          <button
            onClick={() => {
              setConsultorioName('');
              setConsultorioLocation('Piso 1');
              setConsultorioSelectedServices([]);
              setShowConsultorioModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            + Crear consultorio
          </button>

          {/* Botón Nuevo Servicio */}
          <button
            onClick={() => {
              setEditingProc(null);
              setFormCode('');
              setFormName('');
              const initialDiv = selectedDivision !== 'ALL' ? selectedDivision : 'ODONTOLOGIA';
              setFormDivision(initialDiv);
              const divObj = MEDICAL_DIVISIONS.find(d => d.id === initialDiv);
              setFormCategory(divObj && divObj.specialties ? divObj.specialties[0] : 'Odontología General');
              setFormPrice('45');
              setFormCommission('50');
              setFormMaterialsCost('0');
              setFormAssistantBonus('0.00');
              setFormDays(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']);
              setFormStartTime('08:00');
              setFormEndTime('17:00');
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            + Nuevo Servicio
          </button>
        </div>
      </div>

      {/* Tabs Selector de Vista: Servicios vs Consultorios */}
      <div className="flex border-b border-slate-200 dark:border-[#1e2d5a] gap-2">
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 px-4 font-black text-xs transition-all border-b-2 ${
            activeTab === 'services'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          📋 Catálogo de Baremos & Servicios ({procedures.length})
        </button>
        <button
          onClick={() => setActiveTab('consultorios')}
          className={`pb-3 px-4 font-black text-xs transition-all border-b-2 ${
            activeTab === 'consultorios'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          🏥 Consultorios y Servicios Asignados ({consultoriosList.length})
        </button>
      </div>

      {/* VISTA DE SERVICIOS Y BAREMOS (SI ACTIVE TAB ES SERVICES) */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Selector de Divisiones Médicas */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedDivision('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all font-bold ${
            selectedDivision === 'ALL'
              ? 'bg-teal-600 text-white border-teal-700 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-xs uppercase tracking-wider opacity-80">Todas las Áreas</div>
          <div className="text-base font-extrabold mt-0.5">{procedures.length} Servicios</div>
        </button>

        {MEDICAL_DIVISIONS.map(div => {
          const count = procedures.filter(p => p.division === div.id).length;
          const isActive = selectedDivision === div.id;
          return (
            <button
              key={div.id}
              onClick={() => setSelectedDivision(div.id)}
              className={`p-3.5 rounded-xl border text-left transition-all font-bold ${
                isActive
                  ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-[11px] truncate opacity-90">{div.name}</div>
              <div className="text-base font-extrabold mt-0.5">{count} Servicios</div>
            </button>
          );
        })}
      </div>

      {/* Buscador & Tabla de Servicios */}
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar servicio por código o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-600"
            />
          </div>

          <span className="text-xs font-extrabold text-slate-700">
            Mostrando {filteredProcedures.length} de {procedures.length} servicios registrados
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Servicio / Tratamiento</th>
                <th className="p-3">Disponibilidad Público</th>
                <th className="p-3">División / Área</th>
                <th className="p-3">Categoría / Especialidad</th>
                <th className="p-3 text-right">Precio Público ($)</th>
                <th className="p-3 text-right">% Medico</th>
                <th className="p-3 text-right">Bono Asistente ($)</th>
                <th className="p-3 text-right">Costo Insumos ($)</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
              {filteredProcedures.map(proc => {
                const isGyn = String(proc.category || '').toLowerCase().includes('ginec') || String(proc.name || '').toLowerCase().includes('ginec');
                const asstVal = proc.assistantBonus !== undefined && proc.assistantBonus !== null
                  ? parseFloat(proc.assistantBonus)
                  : proc.hygienistBonus !== undefined && proc.hygienistBonus !== null
                    ? parseFloat(proc.hygienistBonus)
                    : isGyn ? 10.00 : 0.00;

                const divColor = proc.division === 'ODONTOLOGIA'
                  ? 'bg-teal-100 text-teal-900 border-teal-300'
                  : proc.division === 'LABORATORIO'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : proc.division === 'RAYOS_X'
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : 'bg-blue-100 text-blue-900 border-blue-300';

                const divLabel = proc.division === 'ODONTOLOGIA'
                  ? 'Odontología'
                  : proc.division === 'LABORATORIO'
                    ? 'Laboratorio'
                    : proc.division === 'RAYOS_X'
                      ? 'Rayos X'
                      : 'Medicina';

                return (
                  <tr key={proc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-700">{proc.code || proc.id}</td>
                    <td className="p-3 font-extrabold text-slate-900">{proc.name}</td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#85a738]/20 text-[#476016] border border-[#85a738]/40 block w-max">
                          📅 {Array.isArray(proc.availableDays) ? proc.availableDays.join(', ') : 'Lun a Sáb'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold block">
                          🕒 {proc.startTime || '08:00'} - {proc.endTime || '17:00'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${divColor}`}>
                        {divLabel}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-semibold">{proc.category || 'General'}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${(proc.price||0).toFixed(2)} USD</td>
                    <td className="p-3 text-right font-mono font-bold text-teal-800">{proc.doctorCommissionPercent||50}%</td>
                    <td className="p-3 text-right font-mono font-black text-emerald-700">
                      ${asstVal.toFixed(2)} USD
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600">${(proc.estimatedMaterialsCost||0).toFixed(2)}</td>
                    <td className="p-3 text-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingProc(proc);
                          setFormCode(proc.code || '');
                          setFormName(proc.name || '');
                          setFormDivision(proc.division || 'ODONTOLOGIA');
                          setFormCategory(proc.category || 'Odontología General');
                          setFormPrice(proc.price?.toString() || '45');
                          setFormCommission(proc.doctorCommissionPercent?.toString() || '50');
                          setFormMaterialsCost(proc.estimatedMaterialsCost?.toString() || '0');
                          setFormAssistantBonus(asstVal.toString());
                          setFormDays(Array.isArray(proc.availableDays) ? proc.availableDays : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']);
                          setFormStartTime(proc.startTime || '08:00');
                          setFormEndTime(proc.endTime || '17:00');
                          setShowModal(true);
                        }}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 transition-all inline-block cursor-pointer"
                        title="Editar Servicio"
                      >
                        <Edit className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      </button>

                      <button
                        onClick={() => handleDeleteProcedure(proc)}
                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded text-rose-700 dark:text-rose-400 transition-all inline-block cursor-pointer"
                        title="Eliminar Servicio"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* VISTA DE CONSULTORIOS Y SERVICIOS ASIGNADOS (SI ACTIVE TAB ES CONSULTORIOS) */}
      {activeTab === 'consultorios' && (
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              🏥 Consultorios Registrados & Servicios Autorizados por Unidad
            </h3>
            <button
              onClick={() => {
                setConsultorioName('');
                setConsultorioLocation('Piso 1');
                setConsultorioSelectedServices([]);
                setShowConsultorioModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-lg text-xs"
            >
              <Plus className="w-4 h-4" /> + Crear Consultorio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {consultoriosList.map(cons => (
              <div key={cons.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{cons.name}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">📍 {cons.location}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full border border-emerald-300">
                    Operativo
                  </span>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <label className="text-[11px] font-bold text-slate-700 block">Servicios Habilitados:</label>
                  <div className="flex flex-wrap gap-1">
                    {cons.services && cons.services.length > 0 ? (
                      cons.services.map(srvId => {
                        const matchedProc = procedures.find(p => p.id === srvId || p.code === srvId);
                        return (
                          <span key={srvId} className="px-2 py-0.5 bg-teal-100 text-teal-900 font-bold text-[10px] rounded-lg border border-teal-300">
                            {matchedProc ? matchedProc.name : srvId}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Sin servicios asignados aún</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CREAR CONSULTORIO */}
      {showConsultorioModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
              🏥 Crear Nuevo Consultorio Clínico
            </h3>

            <form onSubmit={handleCreateConsultorioSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre del Consultorio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Consultorio 4 - Odontopediatría & Estética"
                  value={consultorioName}
                  onChange={(e) => setConsultorioName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Ubicación / Ala</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Piso 1, Ala Norte"
                  value={consultorioLocation}
                  onChange={(e) => setConsultorioLocation(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Seleccionar Servicios Realizados en este Consultorio (Multiselección)</label>
                <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg max-h-40 overflow-y-auto space-y-1.5">
                  {procedures.map(p => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={consultorioSelectedServices.includes(p.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setConsultorioSelectedServices([...consultorioSelectedServices, p.id]);
                          } else {
                            setConsultorioSelectedServices(consultorioSelectedServices.filter(id => id !== p.id));
                          }
                        }}
                        className="w-3.5 h-3.5 text-purple-600 rounded"
                      />
                      <span>{p.name} (${p.price} USD)</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowConsultorioModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs"
                >
                  Crear Consultorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Servicio */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-200">
              {editingProc ? 'Editar Servicio de Baremo' : 'Registrar Nuevo Servicio en Baremo'}
            </h3>

            <form onSubmit={handleSaveProcSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Código Único de Servicio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: OD-105"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">División / Área Clínica *</label>
                  <select
                    value={formDivision}
                    onChange={(e) => {
                      const newDiv = e.target.value;
                      setFormDivision(newDiv);
                      const divObj = MEDICAL_DIVISIONS.find(d => d.id === newDiv);
                      if (divObj && divObj.specialties && divObj.specialties.length > 0) {
                        setFormCategory(divObj.specialties[0]);
                        if (divObj.specialties[0].toLowerCase().includes('ginec') && (formAssistantBonus === '0' || formAssistantBonus === '0.00' || !formAssistantBonus)) {
                          setFormAssistantBonus('10.00');
                        }
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    {MEDICAL_DIVISIONS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Nombre del Servicio / Tratamiento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Profilaxis Dental Profunda"
                  value={formName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormName(val);
                    if (val.toLowerCase().includes('ginec') && (formAssistantBonus === '0' || formAssistantBonus === '0.00' || !formAssistantBonus)) {
                      setFormAssistantBonus('10.00');
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Categoría / Especialidad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Odontología General / Ginecología & Obstetricia"
                  value={formCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormCategory(val);
                    if (val.toLowerCase().includes('ginec') && (formAssistantBonus === '0' || formAssistantBonus === '0.00' || !formAssistantBonus)) {
                      setFormAssistantBonus('10.00');
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold mb-1">Precio ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">% Médico</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formCommission}
                    onChange={(e) => setFormCommission(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block font-bold mb-1">Bono Asistente ($)</label>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formAssistantBonus}
                    onChange={(e) => setFormAssistantBonus(e.target.value)}
                    className="w-full p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg font-mono font-black text-emerald-900"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-normal">
                    {formCategory.toLowerCase().includes('ginec') || formName.toLowerCase().includes('ginec') ? 'Defecto: $10 (Ginecología)' : 'Opcional (Defecto: $0)'}
                  </span>
                </div>

                <div>
                  <label className="block font-bold mb-1">Insumos ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formMaterialsCost}
                    onChange={(e) => setFormMaterialsCost(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-normal">
                    Opcional (Defecto: $0)
                  </span>
                </div>
              </div>

              {/* SECCIÓN DISPONIBILIDAD DE HORARIO Y DÍAS PARA ATENCIÓN AL PÚBLICO */}
              <div className="p-3.5 bg-[#85a738]/10 border border-[#85a738]/30 rounded-xl space-y-2 text-xs">
                <label className="block font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#476016]" />
                  Disponibilidad para Atención al Público (Días y Horario)
                </label>
                <p className="text-[11px] text-slate-600 font-medium">
                  Seleccione los días de la semana y la franja horaria en que este servicio estará disponible para agendamiento del público.
                </p>

                {/* DÍAS DE LA SEMANA */}
                <div className="space-y-1">
                  <span className="block text-[11px] font-extrabold text-slate-800">Días Disponibles:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => {
                      const isSelected = formDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setFormDays(formDays.filter(d => d !== day));
                            } else {
                              setFormDays([...formDays, day]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#85a738] text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RANGO DE HORAS DE ATENCIÓN */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Hora Inicio Disponibilidad</label>
                    <input
                      type="time"
                      required
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Hora Fin Disponibilidad</label>
                    <input
                      type="time"
                      required
                      value={formEndTime}
                      onChange={(e) => setFormEndTime(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#85a738] hover:bg-[#72912f] text-white font-extrabold rounded-lg shadow-sm"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
