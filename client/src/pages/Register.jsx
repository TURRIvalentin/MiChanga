import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { ZONAS } from '../utils/helpers';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    zona: '',
    esChangador: true,
    esContratante: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      addToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      addToast('¡Bienvenido a MiChanga! 🎉', 'success');
      navigate('/changas');
    } catch (err) {
      addToast(err.response?.data?.error || 'No se pudo registrar. Intentá de nuevo.', 'error');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-black text-gray-900">Creá tu cuenta gratis</h1>
          <p className="text-gray-500 mt-1">En 2 minutos estás dentro 👋</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label" htmlFor="nombre">Nombre y apellido</label>
              <input id="nombre" name="nombre" type="text" className="input" placeholder="María García" value={form.nombre} onChange={handleChange} required />
            </div>

            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input" placeholder="tu@email.com" value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>

            <div>
              <label className="label" htmlFor="password">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="zona">Tu barrio / zona</label>
              <select id="zona" name="zona" className="input" value={form.zona} onChange={handleChange}>
                <option value="">Seleccioná tu zona (opcional)</option>
                {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            {/* Roles */}
            <div>
              <p className="label">¿Qué querés hacer en MiChanga?</p>
              <div className="flex flex-col gap-3">
                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input type="checkbox" name="esContratante" checked={form.esContratante} onChange={handleChange} className="mt-0.5 w-4 h-4 accent-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Publicar changas 📝</p>
                    <p className="text-sm text-gray-500">Necesito que me ayuden con cosas</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-primary-300 transition-colors has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                  <input type="checkbox" name="esChangador" checked={form.esChangador} onChange={handleChange} className="mt-0.5 w-4 h-4 accent-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Hacer changas 💪</p>
                    <p className="text-sm text-gray-500">Quiero ganarme unos pesos ayudando</p>
                  </div>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary flex items-center justify-center gap-2 mt-2" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <><UserPlus className="w-5 h-5" /> Crear mi cuenta</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Entrá acá</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
