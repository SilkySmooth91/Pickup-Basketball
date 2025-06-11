import { fetchWithAuth } from "../context/fetchWithAuth";

export async function getFriends(userId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const url = userId ? `${API_URL}/friends/${userId}` : `${API_URL}/friends`;
  const res = await fetchWithAuth(url, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero amici");
  return await res.json();
}

export async function searchUsers(query, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/friends/search?q=${encodeURIComponent(query)}`, {}, auth);
  if (!res.ok) throw new Error("Errore nella ricerca utenti");
  return await res.json();
}

export async function sendFriendRequest(toUserId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  
  // Assicuriamoci che toUserId sia una stringa
  const sanitizedUserId = String(toUserId || "").trim();
  
  if (!sanitizedUserId) {
    throw new Error("ID utente destinatario non valido");
  }

  const res = await fetchWithAuth(
    `${API_URL}/friends/requests`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: sanitizedUserId })
    },
    auth
  );

  // Log dettagliato in caso di errore
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Nessun testo di errore");
    console.error(`Errore invio richiesta amicizia: ${res.status} ${res.statusText}`, errorText);
    throw new Error(res.status === 400 ? "Richiesta non valida" : "Errore invio richiesta amicizia");
  }
  
  return await res.json();
}

export async function getReceivedFriendRequests(auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/friends/requests/received`, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero richieste ricevute");
  return await res.json();
}

export async function getSentFriendRequests(auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/friends/requests/sent`, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero richieste inviate");
  return await res.json();
}

export async function acceptFriendRequest(requestId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/friends/requests/${requestId}/accept`,
    { method: "POST" },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'accettare la richiesta");
  return await res.json();
}

export async function rejectFriendRequest(requestId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/friends/requests/${requestId}/reject`,
    { method: "POST" },
    auth
  );
  if (!res.ok) throw new Error("Errore nel rifiutare la richiesta");
  return await res.json();
}