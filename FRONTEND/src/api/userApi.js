import { fetchWithAuth } from "../context/fetchWithAuth";

// Lista utenti
export async function getUsers(page = 1, limit = 10, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/users?page=${page}&limit=${limit}`, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero utenti");
  return await res.json();
}

// Dettaglio utente
export async function getUserProfile(userId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/users/${userId}`, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero profilo");
  return await res.json();
}

// Aggiorna utente
export async function updateUserProfile(userId, data, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/users/${userId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'aggiornamento profilo");
  return await res.json();
}

// Aggiorna avatar utente
export async function updateUserAvatar(userId, file, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetchWithAuth(
    `${API_URL}/users/${userId}/avatar`,
    {
      method: "PATCH",
      body: formData
      // headers: lasciamo che il browser imposti il boundary multipart
    },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'aggiornamento avatar");
  return await res.json();
}

// Elimina utente
export async function deleteUser(userId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/users/${userId}`,
    { method: "DELETE" },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'eliminazione utente");
  return res.status === 204 ? true : await res.json();
}