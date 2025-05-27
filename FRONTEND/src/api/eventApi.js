import { fetchWithAuth } from "../context/fetchWithAuth";

export async function getEvents(page = 1, limit = 10, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/events?page=${page}&limit=${limit}`, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero eventi");
  return await res.json();
}

export async function getEventById(eventId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/events/${eventId}`, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero evento");
  return await res.json();
}

export async function createEvent(data, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    },
    auth
  );
  if (!res.ok) throw new Error("Errore nella creazione evento");
  return await res.json();
}

export async function updateEvent(eventId, data, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/events/${eventId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'aggiornamento evento");
  return await res.json();
}

export async function deleteEvent(eventId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/events/${eventId}`,
    { method: "DELETE" },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'eliminazione evento");
  return res.status === 204 ? true : await res.json();
}

export async function joinEvent(eventId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/events/${eventId}/join`,
    { method: "POST" },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'iscrizione all'evento");
  return await res.json();
}

export async function leaveEvent(eventId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/events/${eventId}/leave`,
    { method: "POST" },
    auth
  );
  if (!res.ok) throw new Error("Errore nella disiscrizione dall'evento");
  return await res.json();
}