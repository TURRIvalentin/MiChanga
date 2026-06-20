import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { StatusBadge, CategoryBadge } from '../components/ui/Badge';
import { timeAgo, formatPeso, CATEGORIAS } from '../utils/helpers';
import { Plus, Eye, Trash2, CheckCircle } from 'lucide-react';

export default function PanelContratante() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMisTareas();
  }, []);

  const fetchMisTareas = async () => {
    try {
      const { data } = await api.get('/tareas/mis-tareas');
      setTareas(data);
    } catch {
      addToast('Error al cargar tus changas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar esta changa?')) return;
    try {
      await api.delete(`/tareas/${id}`);
      addToast('Changa eliminada.', 'success');
      setTareas((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al eliminar.', 'error');
    }
  };

  const handleCompletar = async (id) => {
    try {
      await api.patch(`/tareas/${id}/estado`, { estado: 'COMPLETADA' });
      addToast('¡Changa completada!', 'success');
      fetchMisTareas();
    } catch {
      addToast('Error al completar.', 'error');
    }
  };

  if (loading) return <LoadingSpinner center />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mis changas publicadas</h1>
          <p className="text-gray-500 text-sm mt-0.5">{tareas.length} changa{tareas.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Link to="/publicar" className="btn-accent flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva changa
        </Link>
      </div>

      {tareas.length === 0 ? (
        <div className="text-center py-16 card p-8">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Todavía no publicaste ninguna changa</h3>
          <p className="text-gray-500 mb-6">¿Necesitás que te den una mano con algo? Publicalo acá.</p>
          <Link to="/publicar" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Publicar mi primera changa
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tareas.map((tarea) => (
            <MiTareaRow
              key={tarea.id}
              tarea={tarea}
              onEliminar={handleEliminar}
              onCompletar={handleCompletar}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MiTareaRow({ tarea, onEliminar, onCompletar }) {
  const postulacionAceptada = tarea.postulaciones?.find((p) => p.estado === 'ACEPTADA');

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-xl">{CATEGORIAS[tarea.categoria]?.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 truncate">{tarea.titulo}</h3>
                <StatusBadge estado={tarea.estado} />
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {tarea.zona} · Publicada {timeAgo(tarea.createdAt)}
                {tarea.presupuesto && ` · ${formatPeso(tarea.presupuesto)}`}
                {tarea.esAConvenir && ' · A convenir'}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">{tarea.descripcion}</p>

          {/* Stats postulaciones */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <span className="text-gray-600">
              <strong>{tarea._count?.postulaciones || 0}</strong> postulaciones
            </span>
            {postulacionAceptada && (
              <span className="text-green-700 font-medium">
                ✓ Changador: {postulacionAceptada.changador?.nombre}
              </span>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 shrink-0">
          <Link to={`/changas/${tarea.id}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Ver detalle">
            <Eye className="w-5 h-5" />
          </Link>
          {tarea.estado === 'EN_CURSO' && (
            <button
              onClick={() => onCompletar(tarea.id)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Marcar como completada"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
          {(tarea.estado === 'ABIERTA' || tarea.estado === 'CANCELADA') && (
            <button
              onClick={() => onEliminar(tarea.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          {(tarea.estado === 'EN_CURSO') && postulacionAceptada && (
            <Link to={`/chat/${tarea.id}`} className="btn-primary text-sm py-2 px-3 flex items-center gap-1">
              Chat
            </Link>
          )}
          {tarea.estado === 'COMPLETADA' && (
            <Link to={`/calificar/${tarea.id}`} className="btn-accent text-sm py-2 px-3">
              Calificar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
