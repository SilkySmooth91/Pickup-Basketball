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

import { fetchWithAuth } from '../context/fetchWithAuth';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Ottieni le notifiche dell'utente
export async function getNotifications(params = {}, auth) {
  const { page = 1, limit = 20, unreadOnly = false } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    unreadOnly: unreadOnly.toString()
  });

  const res = await fetchWithAuth(
    `${API_URL}/notifications?${queryParams}`,
    { method: 'GET' },
    auth
  );
  
  if (!res.ok) {
    throw new Error('Errore nel caricamento delle notifiche');
  }
  
  return await res.json();
}

// Ottieni il numero di notifiche non lette
export async function getUnreadCount(auth) {
  const res = await fetchWithAuth(
    `${API_URL}/notifications/unread-count`,
    { method: 'GET' },
    auth
  );
  
  if (!res.ok) {
    throw new Error('Errore nel conteggio delle notifiche');
  }
  
  return await res.json();
}

// Segna una notifica come letta
export async function markNotificationAsRead(notificationId, auth) {
  const res = await fetchWithAuth(
    `${API_URL}/notifications/${notificationId}/read`,
    { method: 'PATCH' },
    auth
  );
  
  if (!res.ok) {
    throw new Error('Errore nel segnare la notifica come letta');
  }
  
  return await res.json();
}

// Segna tutte le notifiche come lette
export async function markAllNotificationsAsRead(auth) {
  const res = await fetchWithAuth(
    `${API_URL}/notifications/mark-all-read`,
    { method: 'PATCH' },
    auth
  );
  
  if (!res.ok) {
    throw new Error('Errore nel segnare tutte le notifiche come lette');
  }
  
  return await res.json();
}

// Elimina una notifica
export async function deleteNotification(notificationId, auth) {
  const res = await fetchWithAuth(
    `${API_URL}/notifications/${notificationId}`,
    { method: 'DELETE' },
    auth
  );
  
  if (!res.ok) {
    throw new Error('Errore nell\'eliminazione della notifica');
  }
  
  return await res.json();
}

// Crea una notifica (per test/admin)
export async function createNotification(notificationData, auth) {
  const res = await fetchWithAuth(
    `${API_URL}/notifications/create`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    },
    auth
  );
  
  if (!res.ok) {
    throw new Error('Errore nella creazione della notifica');
  }
  
  return await res.json();
}
