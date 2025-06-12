import React, { createContext, useContext, useState, useEffect } from "react";
import { refreshToken } from "../api/authApi";

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

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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
      })
      .catch(error => {
        clearTimeout(timeoutId); // Cancella il timeout anche in caso di errore
        console.error("Errore nel refresh del token:", error);
        // Pulizia in caso di errore
        logout();
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
