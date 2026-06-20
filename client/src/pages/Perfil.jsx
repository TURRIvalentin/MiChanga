import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StarRating from '../components/ui/StarRating';
import { StatusBadge, CategoryBadge } from '../components/ui/Badge';
import { MapPin, Phone, Calendar, Briefcase, Star, Edit3 } from 'lucide-react';
import { timeAgo, CATEGORIAS } from '../utils/helpers';

export default function Perfil() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const [perfil, setPerfil] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const esPropio = currentUser?.id === id;

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [perfilRes, califRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/calificaciones/usuario/${id}`),
      ]);
      setPerfil(perfilRes.data);
      setCalificaciones(califRes.data);
      setEditForm({
        nombre: perfilRes.data.nombre,
        descripcion: perfilRes.data.descripcion || '',
        zona: perfilRes.data.zona || '',
        telefono: perfilRes.data.telefono || '',
      });
    } catch {
      addToast('No se pudo cargar el perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/users/${id}`, editForm);
      setPerfil((prev) => ({ ...prev, ...data }));
      setEditMode(false);
      addToast('Perfil actualizado.', 'success');
    } catch {
      addToast('Error al guardar los cambios.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner center />;
  if (!perfil) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar: datos del usuario */}
        <div className="flex flex-col gap-4">
          {/* Avatar y nombre */}
          <div className="card p-6 text-center">
            <div className="relative inline-block mb-4">
              {perfil.foto ? (
                <img src={perfil.foto} alt={perfil.nombre} className="w-24 h-24 rounded-full object-cover mx-auto" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
                  <span className="text-primary-700 font-black text-4xl">{perfil.nombre[0]}</span>
                </div>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSave} className="text-left">
                <div className="flex flex-col gap-3">
                  <input className="input" value={editForm.nombre} onChange={(e) => setEditForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Nombre" />
                  <textarea className="input resize-none text-sm" rows={3} value={editForm.descripcion} onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))} placeholder="Contá algo sobre vos..." />
                  <input className="input" value={editForm.zona} onChange={(e) => setEditForm((f) => ({ ...f, zona: e.target.value }))} placeholder="Zona / Barrio" />
                  <input className="input" value={editForm.telefono} onChange={(e) => setEditForm((f) => ({ ...f, telefono: e.target.value }))} placeholder="Teléfono (opcional)" />
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary text-sm py-2 flex-1" disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => setEditMode(false)} className="btn-secondary text-sm py-2 flex-1">Cancelar</button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-xl font-black text-gray-900">{perfil.nombre}</h1>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <StarRating value={perfil.calificacionProm} size="md" />
                  <span className="text-sm text-gray-500 font-medium">
                    {perfil.calificacionProm.toFixed(1)}
                    {perfil.totalCalificaciones > 0 && ` (${perfil.totalCalificaciones})`}
                  </span>
                </div>

                <div className="flex justify-center gap-4 mt-4 text-center">
                  <div>
                    <p className="text-2xl font-black text-primary-700">{perfil.changasRealizadas}</p>
                    <p className="text-xs text-gray-500">changas</p>
                  </div>
                  <div className="w-px bg-gray-200" />
                  <div>
                    <p className="text-2xl font-black text-primary-700">{perfil.totalCalificaciones}</p>
                    <p className="text-xs text-gray-500">calificaciones</p>
                  </div>
                </div>

                {esPropio && (
                  <button onClick={() => setEditMode(true)} className="mt-4 flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium mx-auto transition-colors">
                    <Edit3 className="w-4 h-4" /> Editar perfil
                  </button>
                )}
              </>
            )}
          </div>

          {/* Info de contacto */}
          {!editMode && (
            <div className="card p-5 flex flex-col gap-3">
              {perfil.zona && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{perfil.zona}</span>
                </div>
              )}
              {esPropio && perfil.telefono && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{perfil.telefono}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Miembro desde {new Date(perfil.createdAt).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex gap-2 mt-1">
                {perfil.esChangador && <span className="text-xs bg-green-100 text-green-700 font-medium px-2.5 py-1 rounded-full">💪 Changador</span>}
                {perfil.esContratante && <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-1 rounded-full">📋 Contratante</span>}
              </div>
            </div>
          )}

          {/* Descripción */}
          {!editMode && perfil.descripcion && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-700 text-sm mb-2">Sobre mí</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{perfil.descripcion}</p>
            </div>
          )}
        </div>

        {/* Columna principal */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Changas recientes */}
          {perfil.tareasPublicadas?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-400" /> Changas publicadas
              </h2>
              <div className="flex flex-col gap-3">
                {perfil.tareasPublicadas.map((t) => (
                  <Link key={t.id} to={`/changas/${t.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{CATEGORIAS[t.categoria]?.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{t.titulo}</p>
                        <p className="text-xs text-gray-400">{t.zona} · {timeAgo(t.createdAt)}</p>
                      </div>
                    </div>
                    <StatusBadge estado={t.estado} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Calificaciones */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-gray-400" />
              Calificaciones recibidas ({calificaciones.length})
            </h2>

            {calificaciones.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">⭐</div>
                <p className="text-gray-500 text-sm">Todavía no tiene calificaciones.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {calificaciones.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    {c.autor?.foto ? (
                      <img src={c.autor.foto} alt={c.autor.nombre} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <span className="text-gray-600 font-bold text-sm">{c.autor?.nombre?.[0]}</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link to={`/perfil/${c.autor?.id}`} className="font-semibold text-gray-900 text-sm hover:text-primary-700 transition-colors">
                          {c.autor?.nombre}
                        </Link>
                        <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 my-1">
                        <StarRating value={c.puntaje} size="sm" />
                        <span className="text-xs text-gray-500">por "{c.tarea?.titulo}"</span>
                      </div>
                      {c.comentario && (
                        <p className="text-sm text-gray-600 leading-relaxed italic">"{c.comentario}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
