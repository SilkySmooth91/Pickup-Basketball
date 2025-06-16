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

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Registrazione utente
export async function registerUser(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Errore nella registrazione");
  }
  return await res.json();
}

// Login utente
export async function loginUser({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Errore di login");
  }
  const data = await res.json();
  
  // Salva il refresh token nel localStorage
  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  }
  
  return data;
}

// Refresh token
export async function refreshToken(refreshToken) {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Errore nel refresh del token");
  }
  return await res.json();
}

// Logout utente
export async function logoutUser(accessToken) {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json();
    throw new Error(err.error || "Errore durante il logout");
  }
  return true;
}

// Richiesta reset password
export async function forgotPassword(email) {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  
  if (!res.ok) {
    // Non dobbiamo rivelare errori specifici per motivi di sicurezza
    // in modo da non far sapere se l'email esiste o meno
    const err = await res.json();
    // Gestiamo solo errori critici di server, non quelli relativi all'utente
    if (res.status >= 500) {
      throw new Error("Errore del server. Riprova più tardi.");
    }
  }
  
  // Ritorniamo sempre un successo per non rivelare se l'email esiste
  return { message: "Se l'indirizzo email è associato a un account, riceverai un'email con le istruzioni per reimpostare la password." };
}

// Reset password con token
export async function resetPassword(token, password) {
  const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Errore nel reset della password");
  }
  
  return await res.json();
}
