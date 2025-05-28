import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, refreshToken, logoutUser } from "../api/authApi";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(() => {
    // Recupera user da localStorage se presente
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // login: salva accessToken, user e refreshToken (in localStorage)
  const login = async ({ email, password }) => {
    const data = await loginUser({ email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
  };

  // logout: rimuove tutto e chiama API logout
  const logout = async () => {
    try {
      if (accessToken) await logoutUser(accessToken);
    } catch {}
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  // refresh: aggiorna accessToken
  const refresh = (newAccessToken) => setAccessToken(newAccessToken);

  // Al mount: se c'è un refreshToken, prova a fare il refresh automatico
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
        // Salva SEMPRE il nuovo refreshToken
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
      value={{ accessToken, user, login, logout, refresh, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
