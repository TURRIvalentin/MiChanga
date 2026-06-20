import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PAYMENTS_ENABLED } from './config';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import TareaDetalle from './pages/TareaDetalle';
import PublicarChanga from './pages/PublicarChanga';
import PanelContratante from './pages/PanelContratante';
import PanelChangador from './pages/PanelChangador';
import Chat from './pages/Chat';
import Perfil from './pages/Perfil';
import Calificar from './pages/Calificar';
import PagoResultado from './pages/PagoResultado';
import MisPagos from './pages/MisPagos';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/changas" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
                <Route path="/changas" element={<Home />} />
                <Route path="/changas/:id" element={<TareaDetalle />} />
                <Route path="/publicar" element={<ProtectedRoute><PublicarChanga /></ProtectedRoute>} />
                <Route path="/mis-changas" element={<ProtectedRoute><PanelContratante /></ProtectedRoute>} />
                <Route path="/mis-postulaciones" element={<ProtectedRoute><PanelChangador /></ProtectedRoute>} />
                <Route path="/chat/:tareaId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/perfil/:id" element={<Perfil />} />
                <Route path="/calificar/:tareaId" element={<ProtectedRoute><Calificar /></ProtectedRoute>} />
                {/* Rutas de pagos — solo activas cuando PAYMENTS_ENABLED=true */}
                {PAYMENTS_ENABLED ? (
                  <>
                    <Route path="/mis-pagos" element={<ProtectedRoute><MisPagos /></ProtectedRoute>} />
                    <Route path="/pago/exitoso" element={<PagoResultado />} />
                    <Route path="/pago/fallido" element={<PagoResultado />} />
                    <Route path="/pago/pendiente" element={<PagoResultado />} />
                  </>
                ) : (
                  <>
                    <Route path="/mis-pagos" element={<Navigate to="/changas" replace />} />
                    <Route path="/pago/exitoso" element={<Navigate to="/changas" replace />} />
                    <Route path="/pago/fallido" element={<Navigate to="/changas" replace />} />
                    <Route path="/pago/pendiente" element={<Navigate to="/changas" replace />} />
                  </>
                )}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
