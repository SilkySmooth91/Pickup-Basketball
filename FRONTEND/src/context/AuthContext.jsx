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

import React, { createContext, useContext, useState, useEffect } from "react";
import { refreshToken } from "../api/authApi";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken") || null;
  });
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const login = (userData, token, refreshTokenValue) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
    if (refreshTokenValue) {
      localStorage.setItem("refreshToken", refreshTokenValue);
    }
  };
  const logout = (showMessage = false, message = "Il tuo accesso è scaduto, effettua nuovamente il login") => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    
    if (showMessage) {
      toast.warn(message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const refresh = (newAccessToken) => {
    setAccessToken(newAccessToken);
    localStorage.setItem("accessToken", newAccessToken);
  };
  // Al mount: controlla token esistenti e fai refresh
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    
    // Se non ci sono token, termina subito
    if (!storedRefreshToken && !storedAccessToken) {
      setLoading(false);
      return;
    }
    
    // Se c'è solo l'access token ma non il refresh token, 
    // prova a usare quello (non ideale ma meglio che niente)
    if (storedAccessToken && !storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setLoading(false);
      return;
    }
    
    // Imposta un timeout di sicurezza per garantire che loading non rimanga bloccato
    const timeoutId = setTimeout(() => {
      console.warn("Timeout di sicurezza attivato per il caricamento dell'autenticazione");
      setLoading(false);
    }, 5000); // 5 secondi di timeout di sicurezza
    
    // Altrimenti esegui il refresh completo
    refreshToken(storedRefreshToken)
      .then(data => {
        clearTimeout(timeoutId); // Cancella il timeout se il refresh ha successo
        
        setAccessToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
        
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
      })      .catch(error => {
        clearTimeout(timeoutId); // Cancella il timeout anche in caso di errore
        console.error("Errore nel refresh del token:", error);
        // Pulizia in caso di errore con messaggio informativo
        logout(true, "La tua sessione è scaduta durante il caricamento");
      })
      .finally(() => setLoading(false));
      
    // Cleanup function per cancellare il timeout
    return () => clearTimeout(timeoutId);
  }, []);
  return (
    <AuthContext.Provider
      value={{ accessToken, user, login, logout, refresh, loading, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
