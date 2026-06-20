import { useEffect, useState } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const TIPOS = {
  exitoso: {
    icon: CheckCircle,
    title: '¡Pago realizado! 🎉',
    desc: 'Tu pago fue procesado correctamente. El dinero quedó retenido hasta que se complete la changa.',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  pendiente: {
    icon: Clock,
    title: 'Pago pendiente',
    desc: 'Tu pago está siendo procesado por MercadoPago. Te notificaremos cuando se confirme.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  fallido: {
    icon: XCircle,
    title: 'El pago no se completó',
    desc: 'Hubo un problema con el pago. Podés intentarlo nuevamente desde el chat.',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
};

export default function PagoResultado() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [confirmando, setConfirmando] = useState(false);
  const [tareaId, setTareaId] = useState(null);

  // Determinar tipo desde la URL: /pago/exitoso, /pago/fallido, /pago/pendiente
  const tipo = location.pathname.split('/').pop();
  const cfg = TIPOS[tipo] || TIPOS.fallido;
  const Icon = cfg.icon;

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status') || (tipo === 'exitoso' ? 'approved' : tipo === 'pendiente' ? 'pending' : 'rejected');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    if (paymentId && externalReference) {
      confirmPago();
    }
    // Extraer tareaId del external_reference (formato: tarea_XXXX)
    if (externalReference?.startsWith('tarea_')) {
      setTareaId(externalReference.replace('tarea_', ''));
    }
  }, []);

  const confirmPago = async () => {
    setConfirmando(true);
    try {
      await api.get('/pagos/confirmar-retorno', {
        params: { payment_id: paymentId, status, external_reference: externalReference },
      });
    } catch {
      // Silencioso — el webhook también debería actualizarlo
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-3xl font-black text-primary-700">Mi</span>
            <span className="text-3xl font-black text-accent-500">Changa</span>
          </Link>
        </div>

        <div className={`card p-8 text-center border-2 ${cfg.border} ${cfg.bg}`}>
          {confirmando ? (
            <LoadingSpinner center />
          ) : (
            <>
              <Icon className={`w-16 h-16 mx-auto mb-4 ${cfg.color}`} />
              <h1 className="text-2xl font-black text-gray-900 mb-3">{cfg.title}</h1>
              <p className="text-gray-600 leading-relaxed mb-2">{cfg.desc}</p>

              {paymentId && (
                <p className="text-xs text-gray-400 mt-4 font-mono">
                  ID de pago: {paymentId}
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-6">
          {tareaId && (
            <Link
              to={`/changas/${tareaId}`}
              className="btn-primary flex items-center justify-center gap-2"
            >
              Ver la changa <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {tareaId && tipo === 'exitoso' && (
            <Link
              to={`/chat/${tareaId}`}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              Ir al chat
            </Link>
          )}
          <Link to="/changas" className="text-center text-sm text-gray-500 hover:text-primary-700 transition-colors">
            Ver todas las changas
          </Link>
        </div>

        {tipo === 'exitoso' && (
          <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100 text-sm text-gray-600">
            <p className="font-semibold mb-1">¿Qué pasa ahora?</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-500">
              <li>El dinero queda retenido de forma segura</li>
              <li>Coordinás con el changador en el chat</li>
              <li>Cuando termina, marcás la changa como completada</li>
              <li>El pago se libera automáticamente al changador</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
