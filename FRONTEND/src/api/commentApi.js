import { fetchWithAuth } from "../context/fetchWithAuth";

export async function addComment({ text, target, targetid }, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, target, targetid })
    },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'aggiunta commento");
  return await res.json();
}

export async function deleteComment(commentId, auth) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const res = await fetchWithAuth(
    `${API_URL}/comments/${commentId}`,
    { method: "DELETE" },
    auth
  );
  if (!res.ok) throw new Error("Errore nell'eliminazione commento");
  return await res.json();
}