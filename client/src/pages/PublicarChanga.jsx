import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { CATEGORIAS, ZONAS } from '../utils/helpers';
import { Send } from 'lucide-react';

export default function PublicarChanga() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    zona: '',
    presupuesto: '',
    esAConvenir: false,
    fechaLimite: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.descripcion.trim() || !form.categoria || !form.zona) {
      addToast('Completá todos los campos obligatorios.', 'error');
      return;
    }
    if (!form.esAConvenir && !form.presupuesto) {
      addToast('Indicá un presupuesto o marcá "A convenir".', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria,
        zona: form.zona,
        esAConvenir: form.esAConvenir,
        presupuesto: !form.esAConvenir && form.presupuesto ? parseFloat(form.presupuesto) : null,
        fechaLimite: form.fechaLimite || null,
      };
      const { data } = await api.post('/tareas', payload);
      addToast('¡Changa publicada! Ya podés recibir postulaciones.', 'success');
      navigate(`/changas/${data.id}`);
    } catch (err) {
      addToast(err.response?.data?.error || 'Error al publicar. Intentá de nuevo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Publicar una changa</h1>
        <p className="text-gray-500 mt-1">Contale a los changadores qué necesitás</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Título */}
          <div>
            <label className="label" htmlFor="titulo">Título de la changa *</label>
            <input
              id="titulo"
              name="titulo"
              type="text"
              className="input"
              placeholder="ej: Necesito que vayan al ANSES, Mudanza de monoambiente..."
              value={form.titulo}
              onChange={handleChange}
              maxLength={100}
              required
            />
            <p className="text-xs text-gray-400 mt-1">{form.titulo.length}/100 caracteres</p>
          </div>

          {/* Categoría */}
          <div>
            <label className="label" htmlFor="categoria">Categoría *</label>
            <select id="categoria" name="categoria" className="input" value={form.categoria} onChange={handleChange} required>
              <option value="">Elegí una categoría</option>
              {Object.entries(CATEGORIAS).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="label" htmlFor="descripcion">Descripción detallada *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              className="input resize-none"
              rows={5}
              placeholder="Contá con detalle qué necesitás: qué hay que hacer, dónde, cuándo, qué herramientas o conocimientos se necesitan, si hay que movilizarse, etc."
              value={form.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          {/* Zona */}
          <div>
            <label className="label" htmlFor="zona">Zona donde se realiza *</label>
            <select id="zona" name="zona" className="input" value={form.zona} onChange={handleChange} required>
              <option value="">Seleccioná el barrio</option>
              {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>

          {/* Presupuesto */}
          <div>
            <label className="label">Presupuesto *</label>
            <label className="flex items-center gap-3 mb-3 cursor-pointer">
              <input
                type="checkbox"
                name="esAConvenir"
                checked={form.esAConvenir}
                onChange={handleChange}
                className="w-4 h-4 accent-primary-600"
              />
              <span className="text-sm font-medium text-gray-700">A convenir (negocio directo con el changador)</span>
            </label>
            {!form.esAConvenir && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                <input
                  type="number"
                  name="presupuesto"
                  className="input pl-7"
                  placeholder="ej: 5000"
                  value={form.presupuesto}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1.5">El precio es orientativo. El final se acuerda en el chat.</p>
          </div>

          {/* Fecha límite */}
          <div>
            <label className="label" htmlFor="fechaLimite">Fecha límite (opcional)</label>
            <input
              id="fechaLimite"
              name="fechaLimite"
              type="date"
              className="input"
              value={form.fechaLimite}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-400 mt-1">Si la changa tiene una fecha máxima para realizarse</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex items-center gap-2 flex-1 justify-center" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <><Send className="w-4 h-4" /> Publicar changa</>
              )}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-5">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
