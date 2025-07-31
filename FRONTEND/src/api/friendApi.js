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

// Nuove funzioni per inviti agli eventi
export async function getRecentFriends(auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/friends/recent`, {}, auth);
  if (!res.ok) throw new Error("Errore nel recupero amici recenti");
  return await res.json();
}

export async function searchFriends(query, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(`${API_URL}/friends/search-friends?q=${encodeURIComponent(query)}`, {}, auth);
  if (!res.ok) throw new Error("Errore nella ricerca amici");
  return await res.json();
}

export async function inviteFriendToEvent(friendId, eventId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  
  // Validazione parametri
  if (!friendId || !eventId) {
    throw new Error("ID amico e ID evento sono richiesti");
  }
  
  console.log('Invitando amico:', { friendId, eventId });
  
  const res = await fetchWithAuth(
    `${API_URL}/events/${eventId}/invite`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: friendId }) // Cambiato da friendId a userId
    },
    auth
  );
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Nessun testo di errore");
    console.error(`Errore invito amico: ${res.status} ${res.statusText}`, errorText);
    
    switch (res.status) {
      case 400:
        // Parsing del messaggio di errore specifico
        let errorMsg = "Richiesta non valida.";
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMsg = errorData.error;
          }
        } catch (e) {
          // Usa il messaggio di default se il parsing fallisce
        }
        throw new Error(errorMsg);
      case 403:
        throw new Error("Solo i partecipanti all'evento possono invitare utenti.");
      case 404:
        throw new Error("Evento o amico non trovato.");
      case 409:
        throw new Error("L'amico è già stato invitato a questo evento.");
      case 500:
        throw new Error("Errore del server. API potrebbero non essere implementate.");
      default:
        throw new Error(`Errore nell'invitare l'amico (${res.status})`);
    }
  }
  
  return await res.json();
}