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
