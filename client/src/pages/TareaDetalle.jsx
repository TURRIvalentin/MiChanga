import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StarRating from '../components/ui/StarRating';
import { StatusBadge, CategoryBadge } from '../components/ui/Badge';
import EstadoPago from '../components/EstadoPago';
import { PAYMENTS_ENABLED } from '../config';
import { MapPin, Clock, Users, Calendar, MessageCircle, ChevronLeft, Send, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { timeAgo, formatPeso, CATEGORIAS } from '../utils/helpers';

export default function TareaDetalle() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [tarea, setTarea] = useState(null);
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPostularForm, setShowPostularForm] = useState(false);
  const [postulacionForm, setPostulacionForm] = useState({ mensaje: '', precioOfrecido: '' });
  const [postulando, setPostulando] = useState(false);
  const [miPostulacion, setMiPostulacion] = useState(null);

  useEffect(() => {
    fetchTarea();
  }, [id]);

  const fetchTarea = async () => {
    try {
      const { data } = await api.get(`/tareas/${id}`);
      setTarea(data);
      if (user) {
        const mp = data.postulaciones?.find((p) => p.changadorId === user.id);
        setMiPostulacion(mp || null);
        if (PAYMENTS_ENABLED) {
          try {
            const pagoRes = await api.get(`/pagos/tarea/${id}`);
            setPago(pagoRes.data);
          } catch { setPago(null); }
        }
      }
    } catch {
      addToast('No se pudo cargar la changa.', 'error');
      navigate('/changas');
    } finally {
      setLoading(false);
    }
  };

  const handleLiberarPago = async () => {
    if (!pago || !window.confirm('¿Liberar el pago al changador?')) return;
    try {
      const { data } = await api.post(`/pagos/liberar/${pago.id}`);
      setPago(data);
      addToast('¡Pago liberado al changador!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al liberar el pago.', 'error');
    }
  };

  const handleReembolsarPago = async () => {
    if (!pago || !window.confirm('¿Reembolsar el pago al contratante?')) return;
    try {
      const { data } = await api.post(`/pagos/reembolsar/${pago.id}`);
      setPago(data);
      addToast('Pago reembolsado.', 'info');
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al reembolsar.', 'error');
    }
  };

  const handlePostular = async (e) => {
    e.preventDefault();
    if (!postulacionForm.mensaje.trim()) {
      addToast('Escribí un mensaje de presentación.', 'error');
      return;
    }
    setPostulando(true);
    try {
      await api.post('/postulaciones', {
        tareaId: id,
        mensaje: postulacionForm.mensaje,
        precioOfrecido: postulacionForm.precioOfrecido || null,
      });
      addToast('¡Te postulaste! El contratante va a ver tu postulación.', 'success');
      setShowPostularForm(false);
      fetchTarea();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al postularse.', 'error');
    } finally {
      setPostulando(false);
    }
  };

  const handleAceptar = async (postulacionId) => {
    try {
      await api.patch(`/postulaciones/${postulacionId}/aceptar`);
      addToast('¡Postulación aceptada! Ya pueden chatear.', 'success');
      fetchTarea();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al aceptar.', 'error');
    }
  };

  const handleRechazar = async (postulacionId) => {
    try {
      await api.patch(`/postulaciones/${postulacionId}/rechazar`);
      addToast('Postulación rechazada.', 'info');
      fetchTarea();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al rechazar.', 'error');
    }
  };

  const handleCompletar = async () => {
    if (!window.confirm('¿Marcar esta changa como completada?')) return;
    try {
      await api.patch(`/tareas/${id}/estado`, { estado: 'COMPLETADA' });
      addToast('¡Changa completada! Ahora podés calificar.', 'success');
      fetchTarea();
    } catch (err) {
      addToast(err.response?.data?.error || 'Error.', 'error');
    }
  };

  if (loading) return <LoadingSpinner center />;
  if (!tarea) return null;

  const esContratante = user?.id === tarea.contratanteId;
  const postulacionAceptada = tarea.postulaciones?.find((p) => p.estado === 'ACEPTADA');
  const esChangadorAceptado = user && postulacionAceptada?.changadorId === user.id;
  const puedePostularse = user && !esContratante && tarea.estado === 'ABIERTA' && !miPostulacion && user.esChangador;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-primary-700 text-sm font-medium mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Volver
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Info principal */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{CATEGORIAS[tarea.categoria]?.emoji || '⭐'}</span>
                <div>
                  <CategoryBadge categoria={tarea.categoria} categorias={CATEGORIAS} />
                  <h1 className="text-xl font-black text-gray-900 mt-2 leading-tight">{tarea.titulo}</h1>
                </div>
              </div>
              <StatusBadge estado={tarea.estado} />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-5">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{tarea.zona}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" />Publicada {timeAgo(tarea.createdAt)}</span>
              {tarea.fechaLimite && (
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" />Límite: {new Date(tarea.fechaLimite).toLocaleDateString('es-AR')}</span>
              )}
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" />{tarea._count?.postulaciones || 0} postulado{tarea._count?.postulaciones !== 1 ? 's' : ''}</span>
            </div>

            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{tarea.descripcion}</p>

            {tarea.fotos?.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto">
                {tarea.fotos.map((f, i) => (
                  <img key={i} src={f} alt="" className="h-32 rounded-xl object-cover" />
                ))}
              </div>
            )}
          </div>

          {/* Presupuesto */}
          <div className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Presupuesto estimado</p>
              <p className="text-2xl font-black text-primary-700">
                {tarea.esAConvenir ? 'A convenir' : tarea.presupuesto ? formatPeso(tarea.presupuesto) : 'No especificado'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">El precio final se acuerda en el chat</p>
            </div>
            {(esContratante || esChangadorAceptado) && tarea.estado === 'EN_CURSO' && (
              <Link to={`/chat/${tarea.id}`} className="btn-primary flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Ir al chat
              </Link>
            )}
          </div>

          {/* Estado del pago — solo cuando PAYMENTS_ENABLED */}
          {PAYMENTS_ENABLED && pago && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-3">Estado del pago</h3>
              <EstadoPago pago={pago} />
              {esContratante && pago.estado === 'RETENIDO' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleLiberarPago}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Liberar pago
                  </button>
                  <button
                    onClick={handleReembolsarPago}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                  >
                    <RefreshCcw className="w-4 h-4" /> Reembolsar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Precio acordado — sin pagos, solo mostrar info del precio */}
          {tarea.precioAcordado && esContratante && tarea.estado === 'EN_CURSO' && (
            <div className="card p-4 bg-primary-50 border border-primary-200">
              <p className="text-sm text-primary-800 font-medium">
                💡 Precio acordado: <strong>{formatPeso(tarea.precioAcordado)}</strong>.
                {PAYMENTS_ENABLED ? ' Podés pagar desde el chat de forma segura.' : ' Coordiná el pago directamente con el changador.'}
              </p>
              <Link to={`/chat/${tarea.id}`} className="btn-primary mt-3 inline-flex items-center gap-2 text-sm py-2">
                <MessageCircle className="w-4 h-4" /> {PAYMENTS_ENABLED ? 'Ir al chat para pagar' : 'Ir al chat'}
              </Link>
            </div>
          )}

          {/* Postularse */}
          {puedePostularse && (
            <div className="card p-6">
              {!showPostularForm ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">¿Te interesa esta changa? Presentate y mandá tu precio.</p>
                  <button onClick={() => setShowPostularForm(true)} className="btn-accent flex items-center gap-2 mx-auto">
                    <Send className="w-4 h-4" /> Postularme para esta changa
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePostular}>
                  <h3 className="font-bold text-gray-900 mb-4">Tu postulación</h3>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="label">Mensaje de presentación *</label>
                      <textarea
                        className="input resize-none"
                        rows={4}
                        placeholder="Contale al contratante por qué sos la persona ideal para esta changa. Mencioná tu experiencia, disponibilidad, etc."
                        value={postulacionForm.mensaje}
                        onChange={(e) => setPostulacionForm((f) => ({ ...f, mensaje: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Tu precio ofrecido (opcional)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          className="input pl-7"
                          placeholder="ej: 3500"
                          value={postulacionForm.precioOfrecido}
                          onChange={(e) => setPostulacionForm((f) => ({ ...f, precioOfrecido: e.target.value }))}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="btn-primary flex items-center gap-2" disabled={postulando}>
                        {postulando ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Send className="w-4 h-4" />}
                        Enviar postulación
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => setShowPostularForm(false)}>Cancelar</button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Mi postulación */}
          {miPostulacion && (
            <div className={`card p-5 border-2 ${miPostulacion.estado === 'ACEPTADA' ? 'border-green-300 bg-green-50' : miPostulacion.estado === 'RECHAZADA' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                {miPostulacion.estado === 'ACEPTADA' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {miPostulacion.estado === 'RECHAZADA' && <XCircle className="w-5 h-5 text-red-500" />}
                {miPostulacion.estado === 'PENDIENTE' && <Clock className="w-5 h-5 text-blue-500" />}
                Tu postulación — {miPostulacion.estado === 'ACEPTADA' ? '¡Aceptada! 🎉' : miPostulacion.estado === 'RECHAZADA' ? 'Rechazada' : 'Pendiente de respuesta'}
              </h3>
              <p className="text-sm text-gray-600">{miPostulacion.mensaje}</p>
              {miPostulacion.estado === 'ACEPTADA' && (
                <Link to={`/chat/${tarea.id}`} className="btn-primary mt-3 inline-flex items-center gap-2 text-sm py-2">
                  <MessageCircle className="w-4 h-4" /> Ir al chat
                </Link>
              )}
            </div>
          )}

          {/* Panel de postulaciones (solo contratante) */}
          {esContratante && tarea.postulaciones?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                Postulaciones recibidas ({tarea.postulaciones.length})
              </h3>
              <div className="flex flex-col gap-4">
                {tarea.postulaciones.map((p) => (
                  <PostulacionItem
                    key={p.id}
                    postulacion={p}
                    tareaEstado={tarea.estado}
                    tareaId={id}
                    onAceptar={handleAceptar}
                    onRechazar={handleRechazar}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completar changa */}
          {esContratante && tarea.estado === 'EN_CURSO' && (
            <div className="card p-5 bg-green-50 border-green-200 border">
              <h3 className="font-semibold text-green-900 mb-2">¿Ya terminó la changa?</h3>
              <p className="text-sm text-green-700 mb-3">Marcala como completada para que ambos puedan calificarse.</p>
              <button onClick={handleCompletar} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-xl transition-colors flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Marcar como completada
              </button>
            </div>
          )}

          {/* Calificar (si completada y participantes) */}
          {tarea.estado === 'COMPLETADA' && (esContratante || esChangadorAceptado) && (
            <div className="card p-5 bg-accent-50 border-accent-200 border">
              <h3 className="font-semibold text-accent-900 mb-2">¡Changa completada!</h3>
              <p className="text-sm text-accent-700 mb-3">Acordate de calificar para ayudar a la comunidad.</p>
              <Link to={`/calificar/${tarea.id}`} className="btn-accent inline-flex items-center gap-2 text-sm py-2">
                ⭐ Calificar
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar: perfil contratante */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <h3 className="font-bold text-gray-700 text-sm mb-4">Publicado por</h3>
            <Link to={`/perfil/${tarea.contratante.id}`} className="flex items-center gap-3 group">
              {tarea.contratante.foto ? (
                <img src={tarea.contratante.foto} alt={tarea.contratante.nombre} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-xl">{tarea.contratante.nombre[0]}</span>
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{tarea.contratante.nombre}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StarRating value={tarea.contratante.calificacionProm} size="sm" />
                  <span className="text-xs text-gray-400">({tarea.contratante.totalCalificaciones})</span>
                </div>
                {tarea.contratante.zona && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />{tarea.contratante.zona}
                  </p>
                )}
              </div>
            </Link>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">{tarea.contratante.changasRealizadas} changas realizadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostulacionItem({ postulacion, tareaEstado, tareaId, onAceptar, onRechazar }) {
  const { addToast } = useToast();
  const estadoColor = {
    PENDIENTE: 'border-gray-200',
    ACEPTADA: 'border-green-300 bg-green-50',
    RECHAZADA: 'border-red-200 bg-red-50 opacity-60',
  }[postulacion.estado] || 'border-gray-200';

  return (
    <div className={`rounded-xl border-2 p-4 ${estadoColor}`}>
      <div className="flex items-start gap-3">
        <Link to={`/perfil/${postulacion.changador.id}`}>
          {postulacion.changador.foto ? (
            <img src={postulacion.changador.foto} alt={postulacion.changador.nombre} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-bold">{postulacion.changador.nombre[0]}</span>
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/perfil/${postulacion.changador.id}`} className="font-bold text-gray-900 hover:text-primary-700 transition-colors">
                {postulacion.changador.nombre}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <StarRating value={postulacion.changador.calificacionProm} size="sm" />
                <span className="text-xs text-gray-400">{postulacion.changador.changasRealizadas} changas</span>
              </div>
            </div>
            {postulacion.precioOfrecido && (
              <span className="text-primary-700 font-bold text-sm">{formatPeso(postulacion.precioOfrecido)}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{postulacion.mensaje}</p>
          <p className="text-xs text-gray-400 mt-1">{timeAgo(postulacion.createdAt)}</p>

          {postulacion.estado === 'PENDIENTE' && tareaEstado === 'ABIERTA' && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => onAceptar(postulacion.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition-colors">
                <CheckCircle className="w-4 h-4" /> Aceptar
              </button>
              <button onClick={() => onRechazar(postulacion.id)} className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition-colors">
                <XCircle className="w-4 h-4" /> Rechazar
              </button>
            </div>
          )}
          {postulacion.estado === 'ACEPTADA' && (
            <div className="mt-3 flex gap-2">
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">✓ Aceptado</span>
              <Link to={`/chat/${tareaId}`} className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-primary-100 transition-colors">
                <MessageCircle className="w-3 h-3" /> Chat
              </Link>
            </div>
          )}
          {postulacion.estado === 'RECHAZADA' && (
            <span className="mt-2 inline-block text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full">Rechazado</span>
          )}
        </div>
      </div>
    </div>
  );
}
