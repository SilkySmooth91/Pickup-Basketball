import { fetchWithAuth } from "../context/fetchWithAuth";

export async function getCourts(page = 1, limit = 10, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/courts?page=${page}&limit=${limit}`, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero campetti");
  return await res.json();
}

export async function getCourtById(courtId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/courts/${courtId}`, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero campetto");
  return await res.json();
}

export async function createCourt(data, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  // data deve essere FormData per upload immagini
  const res = await fetchWithAuth(
    `${API_URL}/courts`,
    {
      method: "POST",
      body: data
    },
    auth
  );
  if (!res.ok) throw new Error("Errore nella creazione del campetto");
  return await res.json();
}

export async function updateCourt(courtId, data, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/courts/${courtId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'aggiornamento campetto");
  return await res.json();
}

export async function deleteCourt(courtId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/courts/${courtId}`,
    { method: "DELETE" },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'eliminazione campetto");
  return res.status === 204 ? true : await res.json();
}