const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Registrazione utente
export async function registerUser(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Errore nella registrazione");
  }
  return await res.json();
}

// Login utente
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Errore di login");
  }
  const data = await res.json();
  
  // Salva il refresh token nel localStorage
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  
  return data;
}

// Refresh token
export async function refreshToken(refreshToken) {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Errore nel refresh del token");
  }
  return await res.json();
}

// Logout utente
export async function logoutUser(accessToken) {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json();
    throw new Error(err.error || "Errore durante il logout");
  }
  return true;
}
