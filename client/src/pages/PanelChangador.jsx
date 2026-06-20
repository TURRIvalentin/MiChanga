import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/Badge';
import { timeAgo, formatPeso, CATEGORIAS } from '../utils/helpers';
import { MapPin, MessageCircle, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import StarRating from '../components/ui/StarRating';

export default function PanelChangador() {
  const { addToast } = useToast();
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    fetchPostulaciones();
  }, []);

  const fetchPostulaciones = async () => {
    try {
      const { data } = await api.get('/postulaciones/mis-postulaciones');
      setPostulaciones(data);
    } catch {
      addToast('Error al cargar tus postulaciones.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtradas = postulaciones.filter((p) => {
    if (filtro === 'todos') return true;
    if (filtro === 'pendientes') return p.estado === 'PENDIENTE';
    if (filtro === 'aceptadas') return p.estado === 'ACEPTADA';
    if (filtro === 'rechazadas') return p.estado === 'RECHAZADA';
    return true;
  });

  if (loading) return <LoadingSpinner center />;

  const counts = {
    todos: postulaciones.length,
    pendientes: postulaciones.filter((p) => p.estado === 'PENDIENTE').length,
    aceptadas: postulaciones.filter((p) => p.estado === 'ACEPTADA').length,
    rechazadas: postulaciones.filter((p) => p.estado === 'RECHAZADA').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Mis postulaciones</h1>
        <p className="text-gray-500 text-sm mt-0.5">Las changas a las que te postulaste</p>
      </div>

      {/* Filtros tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { key: 'todos', label: 'Todas' },
          { key: 'pendientes', label: 'Pendientes' },
          { key: 'aceptadas', label: '¡Aceptadas!' },
          { key: 'rechazadas', label: 'Rechazadas' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFiltro(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${filtro === tab.key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${filtro === tab.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-16 card p-8">
          <div className="text-6xl mb-4">🙋</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {filtro === 'todos' ? 'Todavía no te postulaste a ninguna changa' : `No hay postulaciones ${filtro}`}
          </h3>
          <p className="text-gray-500 mb-6">Explorá las changas disponibles y postulate a las que te interesen.</p>
          <Link to="/changas" className="btn-primary inline-flex items-center gap-2">
            Ver changas disponibles
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtradas.map((p) => (
            <PostulacionCard key={p.id} postulacion={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PostulacionCard({ postulacion }) {
  const tarea = postulacion.tarea;
  const cat = CATEGORIAS[tarea?.categoria];

  const estadoStyle = {
    PENDIENTE: { border: 'border-blue-200', icon: <Clock className="w-4 h-4 text-blue-500" />, text: 'Esperando respuesta...' },
    ACEPTADA: { border: 'border-green-300', icon: <CheckCircle className="w-4 h-4 text-green-600" />, text: '¡Te aceptaron! 🎉' },
    RECHAZADA: { border: 'border-red-200', icon: <XCircle className="w-4 h-4 text-red-500" />, text: 'No te seleccionaron esta vez' },
  }[postulacion.estado] || { border: 'border-gray-200', icon: null, text: '' };

  return (
    <div className={`card p-5 border-2 ${estadoStyle.border} ${postulacion.estado === 'RECHAZADA' ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-4">
        <span className="text-3xl mt-1">{cat?.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/changas/${tarea?.id}`} className="font-bold text-gray-900 hover:text-primary-700 transition-colors leading-tight">
                {tarea?.titulo}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />{tarea?.zona} · {timeAgo(postulacion.createdAt)}
              </p>
            </div>
            <StatusBadge estado={tarea?.estado} />
          </div>

          <p className="text-sm text-gray-600 mt-2 italic">"{postulacion.mensaje}"</p>

          {postulacion.precioOfrecido && (
            <p className="text-sm font-semibold text-primary-700 mt-1">Tu precio: {formatPeso(postulacion.precioOfrecido)}</p>
          )}

          {/* Contratante */}
          {tarea?.contratante && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              {tarea.contratante.foto ? (
                <img src={tarea.contratante.foto} alt={tarea.contratante.nombre} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  {tarea.contratante.nombre[0]}
                </div>
              )}
              <span className="text-sm text-gray-600">Publicado por <strong>{tarea.contratante.nombre}</strong></span>
              <div className="flex items-center gap-1 ml-1">
                <StarRating value={tarea.contratante.calificacionProm} size="sm" />
              </div>
            </div>
          )}

          {/* Estado y acciones */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              {estadoStyle.icon}
              <span className={postulacion.estado === 'ACEPTADA' ? 'text-green-700' : postulacion.estado === 'RECHAZADA' ? 'text-red-600' : 'text-blue-600'}>
                {estadoStyle.text}
              </span>
            </div>
            {postulacion.estado === 'ACEPTADA' && tarea?.estado === 'EN_CURSO' && (
              <Link to={`/chat/${tarea.id}`} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" /> Ir al chat
              </Link>
            )}
            {postulacion.estado === 'ACEPTADA' && tarea?.estado === 'COMPLETADA' && (
              <Link to={`/calificar/${tarea.id}`} className="btn-accent text-sm py-2 px-4">
                ⭐ Calificar
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
