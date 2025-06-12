import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/utils/LoadingSpinner";
import { toast } from "react-toastify";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        
        if (!accessToken || !refreshToken) {
          toast.error("Login con Google fallito. Dati mancanti.");
          navigate("/?google=fail");
          return;
        }
        
        // Fetch dei dati utente utilizzando l'accessToken
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Errore nel recupero dei dati utente");
        }
        
        const userData = await response.json();
        
        // Login con i dati dell'utente e i token
        await login(userData.user, accessToken, refreshToken);
        toast.success("Login con Google completato con successo!");
        navigate("/profile");
      } catch (error) {
        console.error("Errore durante il login con Google:", error);
        toast.error("Si è verificato un errore durante il login con Google");
        navigate("/?google=fail");
      } finally {
        setLoading(false);
      }
    };

    handleGoogleCallback();
  }, [login, navigate]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="text-center">
          <p className="text-xl">Autenticazione completata!</p>
          <p className="text-gray-600 mt-2">Verrai reindirizzato automaticamente...</p>
        </div>
      )}
    </div>
  );
}
