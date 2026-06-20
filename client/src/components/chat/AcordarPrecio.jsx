import { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatPeso } from '../../utils/helpers';
import { DollarSign, Check, X, HeartHandshake } from 'lucide-react';

export default function AcordarPrecio({ tarea, userId, onUpdate }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [proponiendo, setProponiendo] = useState(false);
  const [montoInput, setMontoInput] = useState('');

  const hayPropuesta = !!tarea.precioAcordadoPropuesto;
  const yaAcordado = !!tarea.precioAcordado;
  const esMiPropuesta = tarea.precioAcordadoPropuestoPorId === userId;

  const enviar = async (accion, monto) => {
    setLoading(true);
    try {
      const { data } = await api.post(`/tareas/${tarea.id}/acordar-precio`, {
        accion,
        monto: monto ? parseFloat(monto) : undefined,
      });
      onUpdate(data);
      if (accion === 'proponer') addToast('Propuesta enviada. Esperá que el otro acepte.', 'info');
      if (accion === 'aceptar') addToast('¡Precio acordado! Ya podés pagar.', 'success');
      if (accion === 'rechazar') addToast('Propuesta rechazada.', 'info');
      setProponiendo(false);
      setMontoInput('');
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al procesar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProponer = (e) => {
    e.preventDefault();
    if (!montoInput || parseFloat(montoInput) <= 0) {
      addToast('Ingresá un monto válido.', 'error');
      return;
    }
    enviar('proponer', montoInput);
  };

  // Precio ya acordado — mostrar chip verde
  if (yaAcordado) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border-b border-green-100">
        <Check className="w-4 h-4 text-green-600 shrink-0" />
        <span className="text-sm font-semibold text-green-800">
          Precio acordado: {formatPeso(tarea.precioAcordado)}
        </span>
      </div>
    );
  }

  // Hay una propuesta pendiente
  if (hayPropuesta) {
    return (
      <div className={`px-4 py-3 border-b ${esMiPropuesta ? 'bg-blue-50 border-blue-100' : 'bg-accent-50 border-accent-100'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <DollarSign className="w-4 h-4 text-accent-600 shrink-0" />
            <span className="text-sm font-semibold text-gray-800">
              {esMiPropuesta ? 'Tu propuesta: ' : 'Propuesta recibida: '}
              <span className="text-primary-700">{formatPeso(tarea.precioAcordadoPropuesto)}</span>
            </span>
          </div>
          {!esMiPropuesta ? (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => enviar('aceptar')}
                disabled={loading}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Aceptar
              </button>
              <button
                onClick={() => enviar('rechazar')}
                disabled={loading}
                className="flex items-center gap-1 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Rechazar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 font-medium">Esperando respuesta...</span>
              <button
                onClick={() => enviar('rechazar')}
                disabled={loading}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sin propuesta — mostrar botón o formulario
  return (
    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
      {!proponiendo ? (
        <button
          onClick={() => setProponiendo(true)}
          className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
        >
          <HeartHandshake className="w-4 h-4" />
          Acordar precio final
        </button>
      ) : (
        <form onSubmit={handleProponer} className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">$</span>
            <input
              type="number"
              className="input text-sm py-2 pl-6 pr-2"
              placeholder="Monto propuesto"
              value={montoInput}
              onChange={(e) => setMontoInput(e.target.value)}
              min="1"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
            Proponer
          </button>
          <button type="button" onClick={() => setProponiendo(false)} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}
