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

export async function getNearbyCourts(lat, lng, distance = 5, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  // Converti km in metri per la query
  const distanceInMeters = distance * 1000;
  
  try {
    const res = await fetchWithAuth(
      `${API_URL}/courts?lat=${lat}&lng=${lng}&distance=${distanceInMeters}`,
      {},
      auth
    );
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Errore nel recupero dei campetti vicini");
    }
    
    return await res.json();
  } catch (error) {
    console.error("Errore nel recupero dei campetti vicini:", error);
    throw new Error(`Errore nel recupero dei campetti vicini: ${error.message}`);
  }
}