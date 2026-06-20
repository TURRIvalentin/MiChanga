import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { useToast } from '../../context/ToastContext';
import { useCallback } from 'react';
import { Menu, X, Plus, Bell, User, LogOut, Briefcase, ClipboardList, Wallet } from 'lucide-react';
import { PAYMENTS_ENABLED } from '../../config';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNotification = useCallback((data) => {
    addToast(`Nueva postulación en "${data.tituloTarea}"`, 'info');
  }, [addToast]);

  const handleAceptada = useCallback((data) => {
    addToast(`¡Te aceptaron para "${data.tituloTarea}"! Dale al chat.`, 'success');
  }, [addToast]);

  const handleCompletada = useCallback((data) => {
    addToast(`La changa "${data.titulo}" fue completada.`, 'success');
  }, [addToast]);

  useSocket('nueva_postulacion', handleNotification);
  useSocket('postulacion_aceptada', handleAceptada);
  useSocket('tarea_completada', handleCompletada);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-primary-700">Mi</span>
            <span className="text-2xl font-black text-accent-500">Changa</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/changas" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/changas') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'}`}>
              Ver changas
            </Link>
            {user && (
              <>
                <Link to="/mis-changas" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/mis-changas') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'}`}>
                  Mis changas
                </Link>
                <Link to="/mis-postulaciones" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/mis-postulaciones') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'}`}>
                  Mis postulaciones
                </Link>
                {PAYMENTS_ENABLED && (
                  <Link to="/mis-pagos" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/mis-pagos') ? 'text-primary-700 bg-primary-50' : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'}`}>
                    Mis pagos
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/publicar" className="btn-accent py-2 px-4 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Publicar changa
                </Link>
                <Link to={`/perfil/${user.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {user.foto ? (
                    <img src={user.foto} alt={user.nombre} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-semibold text-sm">{user.nombre[0]}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{user.nombre.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="Salir">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-primary-700 transition-colors px-3 py-2">Entrar</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Registrarse gratis</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          <Link to="/changas" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            <Briefcase className="w-5 h-5 text-gray-400" /> Ver changas
          </Link>
          {user ? (
            <>
              <Link to="/publicar" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-accent-600 hover:bg-accent-50 font-medium">
                <Plus className="w-5 h-5" /> Publicar changa
              </Link>
              <Link to="/mis-changas" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                <ClipboardList className="w-5 h-5 text-gray-400" /> Mis changas
              </Link>
              <Link to="/mis-postulaciones" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                <Bell className="w-5 h-5 text-gray-400" /> Mis postulaciones
              </Link>
              {PAYMENTS_ENABLED && (
                <Link to="/mis-pagos" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                  <Wallet className="w-5 h-5 text-gray-400" /> Mis pagos
                </Link>
              )}
              <Link to={`/perfil/${user.id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                <User className="w-5 h-5 text-gray-400" /> Mi perfil
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium w-full text-left">
                <LogOut className="w-5 h-5" /> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Entrar</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center mt-1">Registrarse gratis</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
