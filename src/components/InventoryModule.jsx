import React, { useState } from 'react';
import { Package, AlertTriangle, Plus, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle, RefreshCw, ShoppingCart, Printer } from 'lucide-react';
import { createInventoryApi, adjustStockApi } from '../api';

export default function InventoryModule({ inventory, setInventory, procedures, setProcedures }) {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'procedures' | 'purchaseOrder'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stock adjustment modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustType, setAdjustType] = useState('entrada');
  const [adjustQty, setAdjustQty] = useState('10');

  // New Item Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    unit: 'Unidad',
    unitCost: '1.50',
    currentStock: '50',
    minStock: '20',
    expDate: '2027-12-31',
    category: 'Odontología'
  });

  const lowStockItems = inventory.filter(item => item.currentStock <= item.minStock);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustItem) return;
    const qty = parseFloat(adjustQty) || 0;

    try {
      await adjustStockApi(adjustItem.id, adjustType, qty);
    } catch (err) {}

    const updated = inventory.map(item => {
      if (item.id === adjustItem.id) {
        const newStock = adjustType === 'entrada' 
          ? item.currentStock + qty 
          : Math.max(0, item.currentStock - qty);
        return { ...item, currentStock: newStock };
      }
      return item;
    });

    setInventory(updated);
    setShowAdjustModal(false);
    setAdjustItem(null);
  };

  const handleCreateItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await createInventoryApi(newItem);
      setInventory([...inventory, created]);
    } catch (err) {
      const newId = `INV-${(inventory.length + 1).toString().padStart(3, '0')}`;
      setInventory([...inventory, { id: newId, ...newItem, unitCost: parseFloat(newItem.unitCost), currentStock: parseFloat(newItem.currentStock), minStock: parseFloat(newItem.minStock) }]);
    }
    setShowNewModal(false);
  };

  // Generate Purchase Order PDF preview
  const handlePrintPO = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm p-6 rounded-2xl">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="text-teal-600 w-7 h-7" />
            Módulo de Inventario & Descargo por Procedimiento
          </h2>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Control de insumos en tiempo real con matriz de escandallo y sugerencia automática de órdenes de compra.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm text-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            + Nuevo Insumo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          1. Catálogo de Insumos ({inventory.length})
        </button>

        <button
          onClick={() => setActiveTab('procedures')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'procedures'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          2. Receta de Procedimientos (Escandallo)
        </button>

        <button
          onClick={() => setActiveTab('purchaseOrder')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'purchaseOrder'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          3. Orden de Compra Sugerida ({lowStockItems.length})
        </button>
      </div>

      {/* TAB 1: CATALOGO INSUMOS */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Buscar por Nombre de Insumo o Categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 font-bold focus:outline-none"
            />

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                {lowStockItems.length} insumos en stock crítico
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Insumo / Material</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3 text-right">Costo U. ($)</th>
                  <th className="p-3 text-center">Stock Actual</th>
                  <th className="p-3 text-center">Stock Mínimo</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900">
                {filteredInventory.map((item) => {
                  const isLow = item.currentStock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-600">{item.id}</td>
                      <td className="p-3 font-extrabold text-slate-900">{item.name} <span className="text-[10px] text-slate-400 font-normal">({item.unit})</span></td>
                      <td className="p-3 text-slate-600 font-medium">{item.category}</td>
                      <td className="p-3 text-right font-mono font-bold">${item.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-center font-mono font-extrabold text-sm text-slate-900">{item.currentStock}</td>
                      <td className="p-3 text-center font-mono text-slate-500">{item.minStock}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow 
                            ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {isLow ? '🚨 CRÍTICO' : '✅ OPTIMO'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setAdjustItem(item);
                            setShowAdjustModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded font-bold text-[11px]"
                        >
                          Ajustar Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RECETA / ESCANDALLO */}
      {activeTab === 'procedures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {procedures.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-start pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded uppercase">{p.category}</span>
                  <h4 className="font-extrabold text-slate-900 text-base mt-1">{p.name}</h4>
                </div>
                <span className="font-mono text-base font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  ${p.price.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Insumos asociados (Descargo automático por cita):</span>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1 text-xs">
                  {p.materials.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center font-mono">
                      <span className="font-medium text-slate-800">• {m.name}</span>
                      <span className="font-bold text-rose-600">-{m.quantity} cant.</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: ORDEN DE COMPRA AUTOMATICA A PROVEEDORES */}
      {activeTab === 'purchaseOrder' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-teal-600" />
                Orden de Compra Sugerida (Auto-Reposición a 30 Días)
              </h3>
              <p className="text-xs text-slate-600 font-medium">Calculada automáticamente para los insumos en stock crítico.</p>
            </div>

            <button
              onClick={handlePrintPO}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Exportar Orden de Compra PDF
            </button>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between border-b border-slate-200 pb-4">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">ORDEN DE COMPRA SUGERIDA #OC-2026-08</h4>
                <p className="text-xs text-slate-500 font-mono">Generado: {new Date().toLocaleDateString('es-VE')}</p>
              </div>
              <div className="text-right text-xs text-slate-600">
                <strong>Vida Sana CMO, C.A.</strong><br />
                RIF: J-50781755-5
              </div>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-3">Insumo Requerido</th>
                  <th className="p-3 text-center">Stock Actual</th>
                  <th className="p-3 text-center">Stock Mínimo</th>
                  <th className="p-3 text-center">Cantidad a Pedir</th>
                  <th className="p-3 text-right">Costo U. Est.</th>
                  <th className="p-3 text-right">Subtotal Est. ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900 font-mono">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-500">
                      🎉 Todos los insumos se encuentran en niveles óptimos. No se requiere reposición de emergencia.
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map(item => {
                    const suggestedQty = (item.minStock * 3) - item.currentStock;
                    const subtotal = suggestedQty * item.unitCost;
                    return (
                      <tr key={item.id}>
                        <td className="p-3 font-sans font-bold text-slate-900">{item.name} ({item.unit})</td>
                        <td className="p-3 text-center text-rose-600 font-bold">{item.currentStock}</td>
                        <td className="p-3 text-center">{item.minStock}</td>
                        <td className="p-3 text-center font-extrabold text-teal-700 bg-teal-50">{suggestedQty}</td>
                        <td className="p-3 text-right">${item.unitCost.toFixed(2)}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">${subtotal.toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {lowStockItems.length > 0 && (
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <div className="text-right space-y-1">
                  <span className="text-xs text-slate-500 font-bold">Monto Total Estimado de Compra:</span>
                  <div className="text-xl font-extrabold font-mono text-emerald-700">
                    ${lowStockItems.reduce((acc, item) => acc + (((item.minStock * 3) - item.currentStock) * item.unitCost), 0).toFixed(2)} USD
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Ajuste Stock */}
      {showAdjustModal && adjustItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-sm p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold">Ajustar Stock: {adjustItem.name}</h3>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Tipo de Movimiento</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="entrada">📥 Entrada (Compra / Reposición)</option>
                  <option value="salida">📤 Salida (Ajuste / Merma)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Cantidad</label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Insumo */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-600" />
              Nuevo Insumo / Material Dental
            </h3>

            <form onSubmit={handleCreateItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre del Material</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Alginato Cromático 454g"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Unidad de Medida</label>
                  <input
                    type="text"
                    required
                    placeholder="Tubo, Cárpule, Pote"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({ ...newItem, unitCost: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    required
                    value={newItem.minStock}
                    onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md"
                >
                  Guardar en SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
