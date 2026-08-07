import React, { useState } from 'react';
import { Layers, FileSpreadsheet, Upload, Download, Plus, Search, Filter, Stethoscope, Activity, Eye, ShieldAlert, CheckCircle, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
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

  // Exportar / Descargar Plantilla Excel (.XLSX)
  const handleDownloadExcelTemplate = () => {
    const templateData = [
      {
        Codigo: 'OD-101',
        Servicio: 'Resina Fotocurada Superior',
        Categoria: 'Odontología General',
        Especialidad: 'Odontología General',
        Precio_USD: 45.00,
        Porcentaje_Medico: 50,
        Costo_Insumos: 5.50
      },
      {
        Codigo: 'MED-201',
        Servicio: 'Consulta Pediátrica Integral',
        Categoria: 'Medicina Especializada',
        Especialidad: 'Pediatría',
        Precio_USD: 40.00,
        Porcentaje_Medico: 50,
        Costo_Insumos: 2.00
      },
      {
        Codigo: 'RX-301',
        Servicio: 'Ecografía Abdominal',
        Categoria: 'Imagenología',
        Especialidad: 'Ecografía General',
        Precio_USD: 60.00,
        Porcentaje_Medico: 50,
        Costo_Insumos: 4.50
      },
      {
        Codigo: 'LAB-401',
        Servicio: 'Perfil 20 Completo',
        Categoria: 'Laboratorio Clínico',
        Especialidad: 'Bionalista / Pruebas de Sangre',
        Precio_USD: 35.00,
        Porcentaje_Medico: 40,
        Costo_Insumos: 7.00
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PlantillaBaremo');
    XLSX.writeFile(workbook, 'Plantilla_Baremos_VidaSana.xlsx');
  };

  // Parser de Importación Masiva Excel (.XLSX)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          alert('⚠️ El archivo Excel está vacío.');
          return;
        }

        const newProcs = [...procedures];
        let addedCount = 0;
        let updatedCount = 0;

        rawData.forEach((row, idx) => {
          const code = row.Codigo || row.codigo || `IMP-${idx + 1}`;
          const name = row.Servicio || row.servicio || row.Nombre || row.nombre || 'Servicio Sin Nombre';
          const category = row.Categoria || row.categoria || 'General';
          const specialty = row.Especialidad || row.especialidad || 'General';
          const price = parseFloat(row.Precio_USD || row.precio || 0);
          const commission = parseFloat(row.Porcentaje_Medico || row.porcentaje || 50);
          const materialsCost = parseFloat(row.Costo_Insumos || row.costo_insumos || 0);

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
              id: `PROC-${Date.now()}-${idx}`,
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
        });

        setProcedures(newProcs);
        alert(`✅ ¡Carga Masiva Exitosa! Se agregaron ${addedCount} servicios nuevos y se actualizaron ${updatedCount} existentes.`);
      } catch (err) {
        alert(`⚠️ Error al leer el archivo Excel: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
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
    } else {
      setProcedures([procObj, ...procedures]);
    }

    setShowModal(false);
    setEditingProc(null);
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
            Importar Baremo (.XLSX)
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
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
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        setEditingProc(proc);
                        setFormCode(proc.code || '');
                        setFormName(proc.name || '');
                        setFormDivision(proc.division || 'ODONTOLOGIA');
                        setFormCategory(proc.category || 'General');
                        setFormPrice((proc.price||0).toString());
                        setFormCommission((proc.doctorCommissionPercent||50).toString());
                        setFormMaterialsCost((proc.estimatedMaterialsCost||0).toString());
                        setShowModal(true);
                      }}
                      className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
                    >
                      <Edit className="w-4 h-4 text-teal-700" />
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
