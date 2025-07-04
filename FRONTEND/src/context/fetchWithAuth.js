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

let refreshPromise = null;
let refreshAttemptMade = false; // Flag per evitare tentativi multipli di refresh

export async function fetchWithAuth(url, options = {}, auth) {
  let finalOptions = { ...options };
  if (auth?.accessToken) {
    finalOptions.headers = {
      ...(finalOptions.headers || {}),
      Authorization: `Bearer ${auth.accessToken}`,
    };
  }

  let res = await fetch(url, finalOptions);

  // Tenta di fare il refresh solo se non è già stato fatto un tentativo nella catena di richieste
  if (res.status === 401 && auth?.refresh && !refreshAttemptMade) {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    const refreshToken = localStorage.getItem("refreshToken");
    
    // Imposta il flag per evitare tentativi ripetuti
    refreshAttemptMade = true;
    
    if (!refreshPromise) {
      refreshPromise = (async () => {
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            let data = null;
            try {
              data = await refreshRes.clone().json();
            } catch (e) {
              // Errore silenzioso, nessun body JSON
            }            if (refreshRes.ok && data && data.accessToken) {
              auth.refresh(data.accessToken);
              if (data.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
              }
              return data.accessToken;
            } else {
              auth.logout && auth.logout(true);
              throw new Error("Sessione scaduta, effettua nuovamente il login");
            }          } catch (error) {
            auth.logout && auth.logout(true);
            throw error;
          }
        } else {
          auth.logout && auth.logout(true);
          throw new Error("Sessione scaduta, effettua nuovamente il login");
        }
      })();
    }

    try {
      const newAccessToken = await refreshPromise;
      finalOptions.headers = { ...(finalOptions.headers || {}) };
      finalOptions.headers.Authorization = `Bearer ${newAccessToken}`;
      res = await fetch(url, finalOptions);
    } catch (error) {
      // Gestisci l'errore, ma non rilanciarlo per evitare loop
      console.error("Errore durante il refresh del token:", error.message);
    } finally {
      refreshPromise = null;
      // Reimposta il flag dopo aver completato il tentativo
      setTimeout(() => {
        refreshAttemptMade = false;
      }, 1000); // Attendi un secondo prima di permettere un nuovo tentativo
    }
  }

  return res;
}
