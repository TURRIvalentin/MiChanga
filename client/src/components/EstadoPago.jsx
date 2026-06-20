import { formatPeso } from '../utils/helpers';
import { Clock, Lock, CheckCircle, RefreshCcw, XCircle, Loader2 } from 'lucide-react';

const CONFIG = {
  PENDIENTE: {
    icon: Clock,
    label: 'Pago pendiente',
    desc: 'El contratante aún no realizó el pago.',
    color: 'bg-gray-50 border-gray-200 text-gray-700',
    iconColor: 'text-gray-400',
  },
  PROCESANDO: {
    icon: Loader2,
    label: 'Pago en proceso',
    desc: 'MercadoPago está procesando el pago.',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-500',
  },
  RETENIDO: {
    icon: Lock,
    label: 'Pago retenido',
    desc: 'El pago fue acreditado y está retenido hasta completar la changa.',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    iconColor: 'text-amber-500',
  },
  LIBERADO: {
    icon: CheckCircle,
    label: 'Pago liberado',
    desc: 'El pago fue liberado al changador. ¡Changa completada!',
    color: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'text-green-600',
  },
  REEMBOLSADO: {
    icon: RefreshCcw,
    label: 'Pago reembolsado',
    desc: 'El dinero fue devuelto al contratante.',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    iconColor: 'text-purple-500',
  },
  FALLIDO: {
    icon: XCircle,
    label: 'Pago fallido',
    desc: 'El pago no pudo procesarse. Podés intentar nuevamente.',
    color: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-500',
  },
};

export default function EstadoPago({ pago, compact = false }) {
  if (!pago) return null;

  const cfg = CONFIG[pago.estado] || CONFIG.PENDIENTE;
  const Icon = cfg.icon;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
        <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
        {cfg.label}
        {pago.monto ? ` · ${formatPeso(pago.monto)}` : ''}
      </span>
    );
  }

  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${cfg.color}`}>
      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.iconColor}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-bold text-sm">{cfg.label}</p>
          {pago.monto && (
            <p className="font-black text-base">{formatPeso(pago.monto)}</p>
          )}
        </div>
        <p className="text-xs mt-0.5 opacity-80">{cfg.desc}</p>
        {pago.fechaLiberacion && (
          <p className="text-xs mt-1 opacity-70">
            Liberado el {new Date(pago.fechaLiberacion).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
