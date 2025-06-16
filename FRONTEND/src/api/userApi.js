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

// Recupera eventi di un utente
export async function getUserEvents(userId, page = 1, limit = 10, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/users/${userId}/events?page=${page}&limit=${limit}`, 
    {}, 
    auth
  );
  if (!res.ok) throw new Error("Errore nel recupero degli eventi dell'utente");
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

// Aggiorna ultimo changelog visto dall'utente
export async function updateLastSeenChangelog(userId, version, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/users/${userId}/changelog`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version })
    },
    auth
  );
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("Errore nell'aggiornamento changelog");
  }
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