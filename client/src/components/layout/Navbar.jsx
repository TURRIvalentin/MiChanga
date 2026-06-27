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

  const navLink = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(path)
      ? 'text-white bg-white/15'
      : 'text-white/60 hover:text-white hover:bg-white/10'
    }`;

  return (
    <header className="bg-primary-900 sticky top-0 z-40 shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="MiChanga" className="h-20 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/changas" className={navLink('/changas')}>
              Ver changas
            </Link>
            {user && (
              <>
                <Link to="/mis-changas" className={navLink('/mis-changas')}>
                  Mis changas
                </Link>
                <Link to="/mis-postulaciones" className={navLink('/mis-postulaciones')}>
                  Mis postulaciones
                </Link>
                {PAYMENTS_ENABLED && (
                  <Link to="/mis-pagos" className={navLink('/mis-pagos')}>
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
                <Link to={`/perfil/${user.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                  {user.foto ? (
                    <img src={user.foto} alt={user.nombre} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">{user.nombre[0]}</span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-white/80">{user.nombre.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-white/40 hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/30" title="Salir">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-2">Entrar</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Registrarse gratis</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-primary-900 border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          <Link to="/changas" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white font-medium">
            <Briefcase className="w-5 h-5 text-white/40" /> Ver changas
          </Link>
          {user ? (
            <>
              <Link to="/publicar" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-primary-400 hover:bg-white/10 font-medium">
                <Plus className="w-5 h-5" /> Publicar changa
              </Link>
              <Link to="/mis-changas" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white font-medium">
                <ClipboardList className="w-5 h-5 text-white/40" /> Mis changas
              </Link>
              <Link to="/mis-postulaciones" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white font-medium">
                <Bell className="w-5 h-5 text-white/40" /> Mis postulaciones
              </Link>
              {PAYMENTS_ENABLED && (
                <Link to="/mis-pagos" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white font-medium">
                  <Wallet className="w-5 h-5 text-white/40" /> Mis pagos
                </Link>
              )}
              <Link to={`/perfil/${user.id}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white font-medium">
                <User className="w-5 h-5 text-white/40" /> Mi perfil
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-400 hover:bg-red-900/30 font-medium w-full text-left">
                <LogOut className="w-5 h-5" /> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="px-3 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white font-medium">Entrar</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-center mt-1">Registrarse gratis</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
