import React, { useState } from 'react';
import { Layers, FileSpreadsheet, Upload, Download, Plus, Search, Filter, Stethoscope, Activity, Eye, ShieldAlert, CheckCircle, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { MEDICAL_DIVISIONS } from '../mockData';

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
  const [formMaterialsCost, setFormMaterialsCost] = useState('5');

  // Filtrado de procedimientos
  const filteredProcedures = procedures.filter(p => {
    const matchesDivision = selectedDivision === 'ALL' || p.division === selectedDivision;
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDivision && matchesCategory && matchesSearch;
  });

  // Exportar / Descargar Plantilla Excel/CSV oficial
  const handleDownloadExcelTemplate = () => {
    const headers = "Codigo,Servicio,Categoria,Especialidad,Precio_USD,Porcentaje_Medico,Costo_Insumos\n";
    const sampleRows = [
      "OD-101,Resina Fotocurada Superior,Odontología General,Odontología General,45.00,50,5.50",
      "MED-201,Consulta Pediátrica Integral,Medicina Especializada,Pediatría,40.00,50,2.00",
      "RX-301,Ecografía Abdominal,Imagenología,Ecografía General,60.00,50,4.50",
      "LAB-401,Perfil 20 Completo,Laboratorio Clínico,Bionalista / Pruebas de Sangre,35.00,40,7.00"
    ].join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + sampleRows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", "Plantilla_Baremos_VidaSana.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Parser de Importación Masiva (CSV / Excel Text)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r\n|\n/);
        if (lines.length <= 1) {
          alert('⚠️ El archivo está vacío o no contiene datos.');
          return;
        }

        const newProcs = [...procedures];
        let addedCount = 0;
        let updatedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cols = line.split(',');
          if (cols.length < 2) continue;

          const code = cols[0]?.trim() || `IMP-${i}`;
          const name = cols[1]?.trim() || 'Servicio Sin Nombre';
          const category = cols[2]?.trim() || 'General';
          const specialty = cols[3]?.trim() || 'General';
          const price = parseFloat(cols[4]?.trim() || 0);
          const commission = parseFloat(cols[5]?.trim() || 50);
          const materialsCost = parseFloat(cols[6]?.trim() || 0);

          let division = 'MEDICINA';
          const catLower = (category + ' ' + specialty).toLowerCase();
          if (catLower.includes('odontolog') || catLower.includes('resina') || catLower.includes('exodoncia')) division = 'ODONTOLOGIA';
          else if (catLower.includes('laboratorio') || catLower.includes('sangre') || catLower.includes('perfil')) division = 'LABORATORIO';
          else if (catLower.includes('rayos') || catLower.includes('eco') || catLower.includes('radiolog')) division = 'RAYOS_X';

          const existingIdx = newProcs.findIndex(p => p.code === code || p.name.toLowerCase() === name.toLowerCase());

          if (existingIdx >= 0) {
            newProcs[existingIdx] = {
              ...newProcs[existingIdx],
              code,
              name,
              category,
              specialty,
              price,
              doctorCommissionPercent: commission,
              estimatedMaterialsCost: materialsCost,
              division
            };
            updatedCount++;
          } else {
            newProcs.push({
              id: `PROC-${Date.now()}-${i}`,
              code,
              name,
              division,
              category,
              specialty,
              price,
              doctorCommissionPercent: commission,
              estimatedMaterialsCost: materialsCost,
              materials: []
            });
            addedCount++;
          }
        }

        setProcedures(newProcs);
        alert(`✅ ¡Carga Masiva Exitosa! Se agregaron ${addedCount} servicios nuevos y se actualizaron ${updatedCount} existentes.`);
      } catch (err) {
        alert(`⚠️ Error al procesar archivo: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProcSubmit = (e) => {
    e.preventDefault();
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
      materials: editingProc ? editingProc.materials : []
    };

    if (editingProc) {
      setProcedures(procedures.map(p => p.id === editingProc.id ? procObj : p));
      Swal.fire('¡Servicio Actualizado!', `Se modificaron los datos de "${procObj.name}".`, 'success');
    } else {
      setProcedures([procObj, ...procedures]);
      Swal.fire('¡Servicio Registrado!', `El servicio "${procObj.name}" fue agregado al baremo.`, 'success');
    }

    setShowModal(false);
    setEditingProc(null);
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
    }).then((result) => {
      if (result.isConfirmed) {
        setProcedures(procedures.filter(p => p.id !== proc.id));
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
            Descargar Plantilla Excel / CSV
          </button>

          {/* Botón Cargar Excel */}
          <label className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-sm transition-all">
            <Upload className="w-4 h-4" />
            Importar Baremo (.CSV / Excel)
            <input type="file" accept=".csv, .txt, .xlsx" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* Botón Nuevo Servicio */}
          <button
            onClick={() => {
              setEditingProc(null);
              setFormCode('');
              setFormName('');
              setFormDivision('ODONTOLOGIA');
              setFormCategory('Odontología General');
              setFormPrice('45');
              setFormCommission('50');
              setFormMaterialsCost('5');
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            + Nuevo Servicio
          </button>
        </div>
      </div>

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
                <th className="p-3">División / Área</th>
                <th className="p-3">Categoría / Especialidad</th>
                <th className="p-3 text-right">Precio Público ($)</th>
                <th className="p-3 text-right">% Honorarios Médico</th>
                <th className="p-3 text-right">Costo Insumos ($)</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
              {filteredProcedures.map(proc => (
                <tr key={proc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-700">{proc.code || proc.id}</td>
                  <td className="p-3 font-extrabold text-slate-900">{proc.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                      {proc.division || 'ODONTOLOGIA'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-semibold">{proc.category || 'General'}</td>
                  <td className="p-3 text-right font-mono font-extrabold text-emerald-900">${(proc.price||0).toFixed(2)} USD</td>
                  <td className="p-3 text-right font-mono font-bold text-teal-800">{proc.doctorCommissionPercent||50}%</td>
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
                        setFormMaterialsCost(proc.estimatedMaterialsCost?.toString() || '5');
                        setShowModal(true);
                      }}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 transition-all inline-block"
                      title="Editar Servicio"
                    >
                      <Edit className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    </button>

                    <button
                      onClick={() => handleDeleteProcedure(proc)}
                      className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded text-rose-700 dark:text-rose-400 transition-all inline-block"
                      title="Eliminar Servicio"
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                  <label className="block font-bold mb-1">División Clínica</label>
                  <select
                    value={formDivision}
                    onChange={(e) => setFormDivision(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  >
                    {MEDICAL_DIVISIONS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Nombre del Servicio / Tratamiento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Profilaxis Dental Profunda"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Categoría / Especialidad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Odontología General / Pediatría"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Precio Público ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">% Honorarios Médico</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formCommission}
                    onChange={(e) => setFormCommission(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Costo Insumos ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formMaterialsCost}
                    onChange={(e) => setFormMaterialsCost(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  />
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg shadow-sm"
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
