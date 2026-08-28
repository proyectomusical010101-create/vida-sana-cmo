// CONFIGURACIÓN GLOBAL DE CATEGORÍAS / ETIQUETAS CON REGLAS DE PRECIOS & DESCUENTOS

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Privado', type: 'descuento', percentage: 0, description: 'Tarifa Estándar (Sin descuento)' },
  { id: 'cat-2', name: 'Funcionario', type: 'descuento', percentage: 20, description: '20% Descuento Empleados / Funcionarios' },
  { id: 'cat-3', name: 'Convenio', type: 'descuento', percentage: 30, description: '30% Descuento Empresas Aliadas' },
  { id: 'cat-4', name: 'Asegurado', type: 'descuento', percentage: 15, description: '15% Descuento Seguros Privados' }
];

export function getSavedCategories() {
  try {
    const raw = localStorage.getItem('cmo_configured_categories');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => {
          if (typeof c === 'string') {
            return {
              id: `cat-${c.toLowerCase()}`,
              name: c,
              type: 'descuento',
              percentage: c === 'Funcionario' ? 20 : c === 'Convenio' ? 30 : c === 'Asegurado' ? 15 : 0,
              description: `Tarifa ${c}`
            };
          }
          return {
            id: c.id || `cat-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            name: c.name || 'Sin Nombre',
            type: c.type || 'descuento',
            percentage: parseFloat(c.percentage) || 0,
            description: c.description || ''
          };
        });
      }
    }
  } catch (e) {
    console.warn("Error leyendo categorías de localStorage:", e);
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategoriesToStorage(categories) {
  try {
    localStorage.setItem('cmo_configured_categories', JSON.stringify(categories));
  } catch (e) {
    console.warn("Error guardando categorías en localStorage:", e);
  }
}

export function getCategoryRule(categoryName, categoriesList = null) {
  if (!categoryName) return { name: 'Privado', type: 'descuento', percentage: 0 };
  const list = categoriesList || getSavedCategories();
  const match = list.find(c => String(c.name).toLowerCase() === String(categoryName).toLowerCase());
  if (match) return match;
  return { name: categoryName, type: 'descuento', percentage: 0 };
}
