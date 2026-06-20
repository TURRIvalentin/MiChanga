import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getSocket } from '../services/socket';
import { PAYMENTS_ENABLED } from '../config';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AcordarPrecio from '../components/chat/AcordarPrecio';
import BotonPagar from '../components/chat/BotonPagar';
import EstadoPago from '../components/EstadoPago';
import { Send, ChevronLeft, Info, CheckCircle } from 'lucide-react';
import { timeAgo } from '../utils/helpers';

export default function Chat() {
  const { tareaId } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [tarea, setTarea] = useState(null);
  const [pago, setPago] = useState(null);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [completando, setCompletando] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [tareaRes, mensajesRes] = await Promise.all([
          api.get(`/tareas/${tareaId}`),
          api.get(`/mensajes/tarea/${tareaId}`),
        ]);
        setTarea(tareaRes.data);
        setMensajes(mensajesRes.data);
        // Cargar pago solo cuando los pagos están activos
        if (PAYMENTS_ENABLED) {
          try {
            const pagoRes = await api.get(`/pagos/tarea/${tareaId}`);
            setPago(pagoRes.data);
          } catch {
            setPago(null);
          }
        }
      } catch (err) {
        addToast(err.response?.data?.error || 'No podés acceder a este chat.', 'error');
        navigate('/changas');
      } finally {
        setLoading(false);
      }
    };
    init();

    const socket = getSocket();
    if (socket) {
      socket.emit('join_chat', tareaId);

      socket.on('nuevo_mensaje', (msg) => {
        setMensajes((prev) => [...prev, msg]);
      });

      socket.on('precio_propuesto', ({ monto, propuestoPorId }) => {
        setTarea((t) => t ? {
          ...t,
          precioAcordadoPropuesto: monto,
          precioAcordadoPropuestoPorId: propuestoPorId,
          precioAcordado: null,
        } : t);
      });

      socket.on('precio_acordado', ({ monto }) => {
        setTarea((t) => t ? {
          ...t,
          precioAcordado: monto,
          precioAcordadoPropuesto: null,
          precioAcordadoPropuestoPorId: null,
        } : t);
        addToast(`¡Precio acordado: $${monto.toLocaleString('es-AR')}!`, 'success');
      });

      socket.on('precio_rechazado', () => {
        setTarea((t) => t ? {
          ...t,
          precioAcordadoPropuesto: null,
          precioAcordadoPropuestoPorId: null,
        } : t);
      });

      if (PAYMENTS_ENABLED) {
        socket.on('estado_pago_actualizado', ({ estado, monto }) => {
          setPago((p) => p ? { ...p, estado, monto } : { estado, monto, tareaId });
          const msgs = {
            RETENIDO: '✅ Pago confirmado y retenido. ¡Listo para arrancar!',
            LIBERADO: '🎉 El pago fue liberado. ¡Changa completada!',
            REEMBOLSADO: '↩️ El pago fue reembolsado.',
            FALLIDO: '❌ El pago falló. El contratante puede intentarlo de nuevo.',
          };
          if (msgs[estado]) addToast(msgs[estado], estado === 'FALLIDO' ? 'error' : 'success');
        });
      }
    }

    return () => {
      if (socket) {
        socket.off('nuevo_mensaje');
        socket.off('precio_propuesto');
        socket.off('precio_acordado');
        socket.off('precio_rechazado');
        if (PAYMENTS_ENABLED) socket.off('estado_pago_actualizado');
        socket.emit('leave_chat', tareaId);
      }
    };
  }, [tareaId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, scrollToBottom]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    setEnviando(true);
    const contenido = texto.trim();
    setTexto('');
    try {
      await api.post('/mensajes', { tareaId, contenido });
    } catch (err) {
      addToast('Error al enviar el mensaje.', 'error');
      setTexto(contenido);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleCompletarTarea = async () => {
    setCompletando(true);
    try {
      const { data } = await api.patch(`/tareas/${tareaId}/estado`, { estado: 'COMPLETADA' });
      setTarea((t) => ({ ...t, ...data }));
      addToast('¡Changa completada! Ya pueden calificarse.', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al completar la changa.', 'error');
    } finally {
      setCompletando(false);
    }
  };

  if (loading) return <LoadingSpinner center />;

  const postulacionAceptada = tarea?.postulaciones?.find((p) => p.estado === 'ACEPTADA');
  const otroParticipante =
    user?.id === tarea?.contratanteId
      ? postulacionAceptada?.changador
      : tarea?.contratante;
  const esContratante = user?.id === tarea?.contratanteId;
  const chatCerrado = tarea?.estado === 'COMPLETADA' || tarea?.estado === 'CANCELADA';

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 p-1">
          <ChevronLeft className="w-5 h-5" />
        </button>
        {otroParticipante && (
          <>
            {otroParticipante.foto ? (
              <img src={otroParticipante.foto} alt={otroParticipante.nombre} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-bold">{otroParticipante.nombre[0]}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <Link to={`/perfil/${otroParticipante.id}`} className="font-bold text-gray-900 hover:text-primary-700 text-sm transition-colors">
                {otroParticipante.nombre}
              </Link>
              <p className="text-xs text-gray-500 truncate">{tarea?.titulo}</p>
            </div>
          </>
        )}
        <Link to={`/changas/${tareaId}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors ml-auto" title="Ver changa">
          <Info className="w-5 h-5" />
        </Link>
      </div>

      {/* Barra de acordar precio (solo EN_CURSO) */}
      {tarea?.estado === 'EN_CURSO' && (
        <AcordarPrecio
          tarea={tarea}
          userId={user?.id}
          onUpdate={(updated) => setTarea((prev) => ({ ...prev, ...updated }))}
        />
      )}

      {/* Botón pagar (solo contratante, precio acordado, sin pago vigente) — requiere PAYMENTS_ENABLED */}
      {PAYMENTS_ENABLED && esContratante && tarea?.estado === 'EN_CURSO' && (!pago || pago.estado === 'FALLIDO') && (
        <BotonPagar tarea={tarea} pago={pago} />
      )}

      {/* Estado del pago (si existe) — requiere PAYMENTS_ENABLED */}
      {PAYMENTS_ENABLED && pago && (
        <div className="px-4 py-2 bg-white border-b border-gray-100">
          <EstadoPago pago={pago} compact />
        </div>
      )}

      {/* Marcar como completada — solo contratante, visible cuando no hay pagos */}
      {!PAYMENTS_ENABLED && esContratante && tarea?.estado === 'EN_CURSO' && (
        <div className="px-4 py-2.5 bg-green-50 border-b border-green-100 flex items-center justify-between gap-3">
          <p className="text-sm text-green-800 font-medium">¿Ya terminó la changa?</p>
          <button
            onClick={handleCompletarTarea}
            disabled={completando}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
          >
            {completando ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5" />
            )}
            Marcar como completada
          </button>
        </div>
      )}

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 bg-gray-50">
        {mensajes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center py-16">
            <div>
              <div className="text-5xl mb-3">💬</div>
              <p className="text-gray-500 font-medium">¡Empezá la conversación!</p>
              <p className="text-sm text-gray-400 mt-1">Acordá los detalles y el precio final acá.</p>
            </div>
          </div>
        ) : (
          mensajes.map((m, i) => {
            const esMio = m.emisorId === user?.id || m.emisor?.id === user?.id;
            const showAvatar = !esMio && (i === 0 || mensajes[i - 1]?.emisorId !== m.emisorId);
            return (
              <div key={m.id} className={`flex gap-2 ${esMio ? 'flex-row-reverse' : 'flex-row'}`}>
                {!esMio && (
                  <div className="w-8 h-8 shrink-0 mt-auto">
                    {showAvatar && (m.emisor?.foto ? (
                      <img src={m.emisor.foto} alt={m.emisor.nombre} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {m.emisor?.nombre?.[0]}
                      </div>
                    ))}
                  </div>
                )}
                <div className={`max-w-[75%] flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${esMio ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white text-gray-900 border border-gray-100 shadow-sm rounded-bl-sm'}`}>
                    {m.contenido}
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-1">{timeAgo(m.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        {chatCerrado ? (
          <p className="text-center text-sm text-gray-400 py-2">
            Esta changa ya finalizó. El chat está cerrado.
            {tarea?.estado === 'COMPLETADA' && (
              <Link to={`/calificar/${tareaId}`} className="ml-2 text-primary-600 font-semibold hover:underline">
                ¿Ya calificaste?
              </Link>
            )}
          </p>
        ) : (
          <form onSubmit={handleSend} className="flex gap-2">
            <textarea
              className="input flex-1 resize-none py-2.5 max-h-32"
              rows={1}
              placeholder="Escribí tu mensaje... (Enter para enviar)"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              disabled={!texto.trim() || enviando}
              className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
