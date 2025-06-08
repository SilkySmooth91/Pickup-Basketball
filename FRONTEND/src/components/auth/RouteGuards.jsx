import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../utils/LoadingSpinner';

/**
 * Componente per proteggere le rotte autenticate
 * Reindirizza alla home se l'utente non è autenticato
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return <LoadingSpinner />;
  
  if (!user) {
    // Memorizza l'URL che l'utente stava cercando di visitare
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
}

/**
 * Componente per reindirizzare gli utenti già autenticati lontano dalla landing page
 * Reindirizza alla mappa se l'utente è già autenticato
 */
export function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (user) {
    return <Navigate to="/map" replace />;
  }
  
  return children;
}

/**
 * Componente per reindirizzare rotte sconosciute
 * Reindirizza alla mappa se l'utente è autenticato, altrimenti alla home
 */
export function FallbackRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? "/map" : "/"} replace />;
}
