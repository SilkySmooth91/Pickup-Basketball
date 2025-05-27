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
