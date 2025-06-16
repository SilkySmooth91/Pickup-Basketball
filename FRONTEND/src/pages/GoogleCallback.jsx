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

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/utils/LoadingSpinner";
import { toast } from "react-toastify";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending"); // pending, success, error
  const [message, setMessage] = useState("");
  const processedRef = useRef(false);
  const toastShownRef = useRef(false);

  // Effetto di navigazione dopo che l'autenticazione è completata
  useEffect(() => {
    if (status === "error") {
      // Mostra il toast di errore solo una volta
      if (!toastShownRef.current) {
        toast.error(message || "Si è verificato un errore durante il login con Google");
        toastShownRef.current = true;
      }
      
      // Naviga alla homepage dopo un breve ritardo
      const timer = setTimeout(() => {
        navigate("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
    
    if (status === "success") {
      // Mostra il toast di successo solo una volta
      if (!toastShownRef.current) {
        toast.success("Login con Google completato con successo!");
        toastShownRef.current = true;
      }
      
      // Naviga al profilo dopo un breve ritardo
      const timer = setTimeout(() => {
        navigate("/profile");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, message, navigate]);
  // Effetto principale che gestisce l'autenticazione
  useEffect(() => {
    // Evita di eseguire questa funzione più di una volta
    if (processedRef.current) return;
    processedRef.current = true;
    
    // Imposta un timeout di sicurezza per garantire che l'utente non rimanga bloccato
    const safetyTimeoutId = setTimeout(() => {
      console.warn("Timeout di sicurezza attivato nel callback Google");
      setLoading(false);
      setStatus("error");
      setMessage("Si è verificato un timeout durante l'autenticazione. Riprova.");
    }, 8000); // 8 secondi di timeout
    
    const handleGoogleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");
        const refreshToken = params.get("refreshToken");
        
        // Verifica la presenza dei token prima di procedere
        if (!accessToken || !refreshToken) {
          console.error("Token mancanti nell'URL");
          setStatus("error");
          setMessage("Login con Google fallito. Dati mancanti.");
          setLoading(false);
          return;
        }
        
        // Fetch dei dati utente utilizzando l'accessToken
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Risposta non valida:", response.status, errorData);
          setStatus("error");
          setMessage(errorData.error || "Errore nel recupero dati utente");
          setLoading(false);
          return;
        }
        
        const userData = await response.json();
        
        // Login con i dati dell'utente e i token
        await login(userData.user, accessToken, refreshToken);
        
        // Imposta lo stato di successo
        setStatus("success");
      } catch (error) {
        console.error("Errore durante il login con Google:", error);
        setStatus("error");
        setMessage(error.message || "Si è verificato un errore durante il login con Google");
      } finally {
        setLoading(false);
        clearTimeout(safetyTimeoutId); // Cancella il timeout di sicurezza
      }
    };
    
    handleGoogleCallback();
    
    // Cleanup function
    return () => {
      processedRef.current = true;
      clearTimeout(safetyTimeoutId);
    };
  }, [login]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="text-center">
          {status === "success" ? (
            <>
              <p className="text-xl text-green-600">Autenticazione completata con successo!</p>
              <p className="text-gray-600 mt-2">Verrai reindirizzato al tuo profilo...</p>
            </>
          ) : status === "error" ? (
            <>
              <p className="text-xl text-red-600">Autenticazione fallita</p>
              <p className="text-gray-600 mt-2">{message}</p>
              <p className="text-gray-600">Verrai reindirizzato alla pagina iniziale...</p>
            </>
          ) : (
            <p className="text-xl">Elaborazione autenticazione...</p>
          )}
        </div>
      )}
    </div>
  );
}
