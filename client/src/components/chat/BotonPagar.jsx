import { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatPeso } from '../../utils/helpers';
import { CreditCard, ExternalLink } from 'lucide-react';

export default function BotonPagar({ tarea, pago }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Si ya hay pago no-fallido, no mostrar botón
  if (pago && !['FALLIDO'].includes(pago.estado)) return null;
  if (!tarea.precioAcordado) return null;

  const handlePagar = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/pagos/crear-preferencia', { tareaId: tarea.id });
      // Sandbox: usar sandbox_init_point, producción: init_point
      const url = data.sandboxInitPoint || data.initPoint;
      window.open(url, '_blank', 'noopener,noreferrer');
      addToast('Se abrió MercadoPago en una nueva pestaña. Completá el pago ahí.', 'info');
    } catch (err) {
      addToast(err.response?.data?.error || 'No se pudo iniciar el pago.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-3 bg-primary-50 border-b border-primary-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-primary-700 font-medium">Precio acordado</p>
          <p className="text-lg font-black text-primary-900">{formatPeso(tarea.precioAcordado)}</p>
        </div>
        <button
          onClick={handlePagar}
          disabled={loading}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Pagar con MercadoPago
              <ExternalLink className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
