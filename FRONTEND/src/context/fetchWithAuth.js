let refreshPromise = null;

export async function fetchWithAuth(url, options = {}, auth) {
  let finalOptions = { ...options };
  if (auth?.accessToken) {
    finalOptions.headers = {
      ...(finalOptions.headers || {}),
      Authorization: `Bearer ${auth.accessToken}`,
    };
  }

  let res = await fetch(url, finalOptions);

  if (res.status === 401 && auth?.refresh) {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const refreshToken = localStorage.getItem("refreshToken");
    console.log("[DEBUG] 401 ricevuto, provo refresh...");
    console.log("[DEBUG] Refresh token letto da localStorage:", refreshToken);

    if (!refreshPromise) {
      refreshPromise = (async () => {
        if (refreshToken) {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });

          let data = null;
          try {
            data = await refreshRes.clone().json();
            console.log("[DEBUG] Body risposta refresh:", data);
          } catch (e) {
            console.log("[DEBUG] Nessun body JSON nella risposta refresh.");
          }

          if (refreshRes.ok && data && data.accessToken) {
            console.log("[DEBUG] Refresh token ricevuto dal backend:", data.refreshToken);
            auth.refresh(data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem("refreshToken", data.refreshToken);
              console.log("[DEBUG] Refresh token salvato in localStorage:", localStorage.getItem("refreshToken"));
            }
            return data.accessToken;
          } else {
            console.warn("[DEBUG] Refresh fallito, faccio logout. Status:", refreshRes.status, "Body:", data);
            auth.logout && auth.logout();
            throw new Error("Sessione scaduta, effettua nuovamente il login");
          }
        } else {
          console.warn("[DEBUG] Nessun refresh token trovato in localStorage.");
          auth.logout && auth.logout();
          throw new Error("Sessione scaduta, effettua nuovamente il login");
        }
      })();
    }

    try {
      const newAccessToken = await refreshPromise;
      finalOptions.headers = { ...(finalOptions.headers || {}) };
      finalOptions.headers.Authorization = `Bearer ${newAccessToken}`;
      res = await fetch(url, finalOptions);
    } finally {
      refreshPromise = null;
    }
  }

  return res;
}
