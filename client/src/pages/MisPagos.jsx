import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EstadoPago from '../components/EstadoPago';
import { formatPeso, CATEGORIAS, timeAgo } from '../utils/helpers';
import { ArrowUpRight, ArrowDownLeft, MapPin } from 'lucide-react';

export default function MisPagos() {
  const { addToast } = useToast();
  const [data, setData] = useState({ realizados: [], recibidos: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('realizados');

  useEffect(() => {
    api.get('/pagos/mis-pagos')
      .then((res) => setData(res.data))
      .catch(() => addToast('Error al cargar tus pagos.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const lista = data[tab] || [];

  if (loading) return <LoadingSpinner center />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Mis pagos</h1>
        <p className="text-gray-500 text-sm mt-0.5">Historial de pagos realizados y recibidos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
        {[
          { key: 'realizados', label: 'Realizados', icon: ArrowUpRight },
          { key: 'recibidos', label: 'Recibidos', icon: ArrowDownLeft },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${tab === t.key ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-500'}`}>
              {data[t.key]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="text-center py-16 card p-8">
          <div className="text-5xl mb-4">{tab === 'realizados' ? '💳' : '💰'}</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {tab === 'realizados' ? 'Todavía no realizaste ningún pago' : 'Todavía no recibiste ningún pago'}
          </h3>
          <p className="text-gray-500 text-sm">
            {tab === 'realizados'
              ? 'Acordá un precio con el changador en el chat y pagá de forma segura.'
              : 'Cuando te acepten en una changa con pago integrado, vas a ver tu historial acá.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {lista.map((pago) => (
            <PagoRow key={pago.id} pago={pago} tipo={tab} />
          ))}
        </div>
      )}

      {/* Resumen */}
      {lista.length > 0 && (
        <div className="mt-6 card p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total {tab === 'realizados' ? 'pagado' : 'recibido'}</p>
              <p className="text-xl font-black text-primary-700">
                {formatPeso(lista.reduce((acc, p) => acc + p.monto, 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Transacciones</p>
              <p className="text-xl font-black text-gray-900">{lista.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PagoRow({ pago, tipo }) {
  const tarea = pago.tarea;
  const contraparte = tipo === 'realizados' ? pago.receptor : pago.pagador;
  const cat = CATEGORIAS[tarea?.categoria];

  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <span className="text-3xl mt-0.5">{cat?.emoji || '💰'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={`/changas/${tarea?.id}`} className="font-bold text-gray-900 hover:text-primary-700 transition-colors text-sm leading-tight truncate block">
                {tarea?.titulo}
              </Link>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />{tarea?.zona}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`font-black text-base ${tipo === 'realizados' ? 'text-red-600' : 'text-green-600'}`}>
                {tipo === 'realizados' ? '-' : '+'}{formatPeso(pago.monto)}
              </p>
              <p className="text-xs text-gray-400">{timeAgo(pago.fechaCreacion)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {contraparte?.foto ? (
                <img src={contraparte.foto} alt={contraparte.nombre} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                  {contraparte?.nombre?.[0]}
                </div>
              )}
              <span>{tipo === 'realizados' ? 'Changador: ' : 'Contratante: '}<strong>{contraparte?.nombre}</strong></span>
            </div>
            <EstadoPago pago={pago} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
