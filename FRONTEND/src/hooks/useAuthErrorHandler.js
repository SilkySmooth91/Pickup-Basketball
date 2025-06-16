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

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export function useAuthErrorHandler() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleAuthError = (error, customMessage = null) => {
    // Controlla se l'errore è correlato all'autenticazione
    if (error?.response?.status === 401 || 
        error?.message?.includes('token') || 
        error?.message?.includes('Sessione scaduta') ||
        error?.message?.includes('Non autorizzato')) {
      
      const message = customMessage || "La tua sessione è scaduta, effettua nuovamente il login";
      
      // Logout con messaggio
      logout(true, message);
      
      // Naviga alla pagina di login dopo un piccolo delay
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      
      return true; // Indica che l'errore è stato gestito
    }
    
    return false; // Indica che l'errore non è correlato all'autenticazione
  };

  const handleSessionExpired = (customMessage = null) => {
    const message = customMessage || "La tua sessione è scaduta, effettua nuovamente il login";
    logout(true, message);
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return {
    handleAuthError,
    handleSessionExpired
  };
}
