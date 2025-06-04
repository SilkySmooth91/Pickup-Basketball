import './styles/App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Profile from './pages/Profile'
import MainMap from './pages/MainMap'
import CourtInfo from './pages/CourtInfo';
import GoogleCallback from './pages/GoogleCallback';
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


// Componente per proteggere le rotte autenticate
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    // Memorizza l'URL che l'utente stava cercando di visitare
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
}

// Componente per reindirizzare gli utenti già autenticati lontano dalla landing page
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (user) {
    return <Navigate to="/map" replace />;
  }
  
  return children;
}

// Spinner di caricamento
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-gray-700">Caricamento...</span>
      </div>
    </div>
  );
}

// Componente per reindirizzare rotte sconosciute
function FallbackRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? "/map" : "/"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <ToastContainer position="top-center" autoClose={3500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        {/* Rotte protette (richiedono autenticazione) */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MainMap /></ProtectedRoute>} />
        <Route path="/court/:id" element={<ProtectedRoute><CourtInfo /></ProtectedRoute>} />
        {/* Rotte pubbliche (reindirizzano se autenticati) */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/google-callback" element={<GoogleCallback />} />
        {/* Fallback per rotte sconosciute */}
        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </>
  );
}
