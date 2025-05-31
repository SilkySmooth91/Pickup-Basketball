import React, { createContext, useContext, useState, useEffect } from "react";
import { refreshToken } from "../api/authApi";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => {
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
    
    // Altrimenti esegui il refresh completo
    refreshToken(storedRefreshToken)
      .then(data => {
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
        console.error("Errore nel refresh del token:", error);
        // Pulizia in caso di errore
        logout();
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, user, login, logout, refresh, loading, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
