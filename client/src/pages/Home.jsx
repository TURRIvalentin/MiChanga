import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import ChangaCard from '../components/ChangaCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Search, SlidersHorizontal, X, Plus } from 'lucide-react';
import { CATEGORIAS, ZONAS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tareas, setTareas] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    categoria: searchParams.get('categoria') || '',
    zona: searchParams.get('zona') || '',
    presupuestoMax: searchParams.get('presupuestoMax') || '',
    page: parseInt(searchParams.get('page') || '1'),
  });

  const fetchTareas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.q) params.q = filters.q;
      if (filters.categoria) params.categoria = filters.categoria;
      if (filters.zona) params.zona = filters.zona;
      if (filters.presupuestoMax) params.presupuestoMax = filters.presupuestoMax;
      params.page = filters.page;

      const { data } = await api.get('/tareas', { params });
      setTareas(data.tareas);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setTareas([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTareas();
  }, [fetchTareas]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
    const sp = new URLSearchParams(searchParams);
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete('page');
    setSearchParams(sp);
  };

  const clearFilters = () => {
    setFilters({ q: '', categoria: '', zona: '', presupuestoMax: '', page: 1 });
    setSearchParams({});
  };

  const hasActiveFilters = filters.q || filters.categoria || filters.zona || filters.presupuestoMax;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Changas disponibles</h1>
          {!loading && (
            <p className="text-gray-500 text-sm mt-0.5">
              {total === 0 ? 'No hay changas con esos filtros' : `${total} changa${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        {user && (
          <Link to="/publicar" className="btn-accent flex items-center gap-2 self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Publicar changa
          </Link>
        )}
      </div>

      {/* Buscador */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Buscar changas... (ej: ANSES, mudanza, limpieza)"
            value={filters.q}
            onChange={(e) => updateFilter('q', e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-medium text-sm transition-colors ${showFilters || hasActiveFilters ? 'border-primary-500 text-primary-700 bg-primary-50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-600" />}
        </button>
      </div>

      {/* Filtros expandibles */}
      {showFilters && (
        <div className="card p-4 mb-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={filters.categoria} onChange={(e) => updateFilter('categoria', e.target.value)}>
                <option value="">Todas las categorías</option>
                {Object.entries(CATEGORIAS).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Zona / Barrio</label>
              <select className="input" value={filters.zona} onChange={(e) => updateFilter('zona', e.target.value)}>
                <option value="">Todos los barrios</option>
                {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Presupuesto máximo</label>
              <input
                type="number"
                className="input"
                placeholder="ej: 5000"
                value={filters.presupuestoMax}
                onChange={(e) => updateFilter('presupuestoMax', e.target.value)}
                min="0"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium">
              <X className="w-4 h-4" /> Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Categorías rápidas */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={() => updateFilter('categoria', '')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${!filters.categoria ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
        >
          Todas
        </button>
        {Object.entries(CATEGORIAS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => updateFilter('categoria', k === filters.categoria ? '' : k)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filters.categoria === k ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
          >
            {v.emoji} {v.label}
          </button>
        ))}
      </div>

      {/* Grid de changas */}
      {loading ? (
        <LoadingSpinner center />
      ) : tareas.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No encontramos changas</h3>
          <p className="text-gray-500 mb-6">Probá cambiando los filtros o buscá algo diferente</p>
          {user && (
            <Link to="/publicar" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Publicar la primera changa
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tareas.map((t) => <ChangaCard key={t.id} tarea={t} />)}
          </div>

          {/* Paginación */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                disabled={filters.page === 1}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 hover:border-primary-300 transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-500">Página {filters.page} de {pages}</span>
              <button
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                disabled={filters.page === pages}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-50 hover:border-primary-300 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
