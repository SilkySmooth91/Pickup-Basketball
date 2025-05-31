import React, { createContext, useContext, useState, useEffect } from "react";
import { refreshToken } from "../api/authApi";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const refresh = (newAccessToken) => setAccessToken(newAccessToken);

  // Al mount: refresh automatico
  useEffect(() => {
    const token = localStorage.getItem("refreshToken");
    if (!token) {
      setLoading(false);
      return;
    }
    refreshToken(token)
      .then(data => {
        setAccessToken(data.accessToken);
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
      })
      .catch(() => {
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
