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

// Upload avatar utente
export async function uploadUserAvatar(userId, file, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await fetchWithAuth(
    `${API_URL}/users/${userId}/avatar`,
    { method: "PATCH", body: formData },
    auth
  );
  if (!res.ok) throw new Error("Errore upload avatar");
  return await res.json();
}

// Upload immagini campetto
export async function uploadCourtImages(courtId, files, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const formData = new FormData();
  for (const file of files) {
    formData.append("images", file);
  }
  const res = await fetchWithAuth(
    `${API_URL}/courts/${courtId}/images`,
    { method: "POST", body: formData },
    auth
  );
  if (!res.ok) throw new Error("Errore upload immagini campetto");
  return await res.json();
}

// Elimina immagine campetto
export async function deleteCourtImage(courtId, public_id, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/courts/${courtId}/images?public_id=${encodeURIComponent(public_id)}`,
    { method: "DELETE" },
    auth
  );
  if (!res.ok) throw new Error("Errore eliminazione immagine");
  return await res.json();
}
