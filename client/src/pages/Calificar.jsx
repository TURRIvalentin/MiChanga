import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StarRating from '../components/ui/StarRating';
import { Send, ChevronLeft } from 'lucide-react';

export default function Calificar() {
  const { tareaId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tarea, setTarea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState('');
  const [yaCalifique, setYaCalifique] = useState(false);

  useEffect(() => {
    fetchTarea();
  }, [tareaId]);

  const fetchTarea = async () => {
    try {
      const [tareaRes, yaCalifRes] = await Promise.all([
        api.get(`/tareas/${tareaId}`),
        api.get(`/calificaciones/tarea/${tareaId}/ya-califique`),
      ]);
      const t = tareaRes.data;
      if (t.estado !== 'COMPLETADA') {
        addToast('Solo podés calificar cuando la changa está completada.', 'error');
        navigate(`/changas/${tareaId}`);
        return;
      }
      setTarea(t);
      setYaCalifique(yaCalifRes.data.yaCalifique);
    } catch {
      addToast('No se pudo cargar la changa.', 'error');
      navigate('/changas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner center />;
  if (!tarea) return null;

  const postulacionAceptada = tarea.postulaciones?.find((p) => p.estado === 'ACEPTADA');
  const esContratante = user.id === tarea.contratanteId;
  const esChangadorAceptado = postulacionAceptada?.changadorId === user.id;

  if (!esContratante && !esChangadorAceptado) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">No sos participante de esta changa.</p>
        <Link to="/changas" className="btn-primary mt-4 inline-block">Volver</Link>
      </div>
    );
  }

  const destinatario = esContratante ? postulacionAceptada?.changador : tarea.contratante;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (puntaje === 0) {
      addToast('Dale un puntaje de 1 a 5 estrellas.', 'error');
      return;
    }
    setEnviando(true);
    try {
      await api.post('/calificaciones', {
        tareaId,
        destinatarioId: destinatario?.id,
        puntaje,
        comentario: comentario.trim() || null,
      });
      addToast('¡Gracias por calificar! Eso ayuda a toda la comunidad.', 'success');
      navigate(`/changas/${tareaId}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al calificar.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  const puntajeLabels = ['', '😕 Muy malo', '😐 Regular', '🙂 Bueno', '😄 Muy bueno', '🤩 Excelente'];

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-primary-700 text-sm font-medium mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Volver
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Calificar</h1>
        <p className="text-gray-500 mt-1">Tu opinión ayuda a todos en la comunidad</p>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Changa completada</h3>
        <p className="font-bold text-gray-900">{tarea.titulo}</p>
        <p className="text-sm text-gray-500 mt-1">{tarea.zona}</p>
      </div>

      {yaCalifique ? (
        <div className="card p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ya calificaste en esta changa</h3>
          <p className="text-gray-500 mb-6">Tu calificación ya fue registrada. ¡Gracias por contribuir!</p>
          <Link to={`/changas/${tareaId}`} className="btn-primary inline-block">Volver a la changa</Link>
        </div>
      ) : destinatario ? (
        <div className="card p-6">
          {/* Destinatario */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            {destinatario.foto ? (
              <img src={destinatario.foto} alt={destinatario.nombre} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-black text-2xl">{destinatario.nombre[0]}</span>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Calificás a</p>
              <h3 className="font-black text-xl text-gray-900">{destinatario.nombre}</h3>
              <p className="text-sm text-gray-500">{destinatario.zona}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Puntaje */}
            <div>
              <label className="label text-base">¿Cómo fue la experiencia? *</label>
              <div className="flex flex-col items-center gap-3 py-4">
                <StarRating value={puntaje} size="lg" interactive onChange={setPuntaje} />
                {puntaje > 0 && (
                  <p className="text-lg font-semibold text-gray-700 animate-in fade-in duration-200">
                    {puntajeLabels[puntaje]}
                  </p>
                )}
              </div>
            </div>

            {/* Comentario */}
            <div>
              <label className="label">Comentario (opcional)</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Contá cómo fue trabajar con esta persona. Tu comentario va a aparecer en su perfil."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">{comentario.length}/500</p>
            </div>

            <button type="submit" className="btn-accent flex items-center justify-center gap-2" disabled={enviando || puntaje === 0}>
              {enviando ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent" />
              ) : (
                <><Send className="w-4 h-4" /> Enviar calificación</>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-gray-500">No hay nadie para calificar todavía.</p>
        </div>
      )}
    </div>
  );
}
