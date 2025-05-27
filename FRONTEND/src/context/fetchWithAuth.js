export async function fetchWithAuth(url, options = {}, auth) {
  // auth: { accessToken, refresh, logout }
  let finalOptions = { ...options };
  if (auth?.accessToken) {
    finalOptions.headers = {
      ...(finalOptions.headers || {}),
      Authorization: `Bearer ${auth.accessToken}`,
    };
  }

  let res = await fetch(url, finalOptions);

  // Se il token è scaduto, prova il refresh e ripeti la richiesta
  if (res.status === 401 && auth?.refresh) {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        auth.refresh(data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        // Ripeti la richiesta originale con il nuovo accessToken
        finalOptions.headers.Authorization = `Bearer ${data.accessToken}`;
        res = await fetch(url, finalOptions);
      } else {
        // Refresh fallito: logout
        auth.logout && auth.logout();
        throw new Error("Sessione scaduta, effettua nuovamente il login");
      }
    }
  }

  return res;
}
