// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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
  
  if (loading) 
    return <LoadingSpinner />;
  
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
  
  if (loading) 
    return <LoadingSpinner />;
  
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
