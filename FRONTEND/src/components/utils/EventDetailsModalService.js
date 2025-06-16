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

import { getEventById as apiGetEventById } from '../../api/eventApi';

/**
 * Recupera i dettagli completi di un evento, includendo i dati degli utenti partecipanti
 * @param {string} eventId - ID dell'evento
 * @param {Object} auth - Dati di autenticazione
 * @returns {Promise} Promise che risolve con i dati completi dell'evento
 */
export async function getEventWithUserDetails(eventId, auth) {
  const eventData = await apiGetEventById(eventId, auth);
  
  if (!eventData) return null;
  
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // Raccoglie tutti gli ID utente unici, gestendo sia oggetti che ID
    const extractId = (u) => (typeof u === 'object' && u !== null ? u._id : u);
    const userIds = new Set([
      extractId(eventData.creator),
      ...((eventData.participants || []).map(extractId))
    ].filter(Boolean));
    
    // Recupera i dettagli per ogni utente solo se non già oggetto completo
    const userDetailsPromises = Array.from(userIds).map(async userId => {
      // Se già presente come oggetto completo tra creator o participants, usalo
      const existing =
        (typeof eventData.creator === 'object' && eventData.creator && eventData.creator._id === userId)
          ? eventData.creator
        : (eventData.participants || []).find(p => typeof p === 'object' && p && p._id === userId);
      if (existing && existing.username) return existing;
      try {
        const res = await fetch(`${API_URL}/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`
          }
        });
        if (!res.ok) throw new Error(`Errore nel recupero utente ${userId}`);
        return await res.json();
      } catch (err) {
        console.error(`Errore nel recupero utente ${userId}:`, err);
        // Restituisci un oggetto utente "placeholder" con solo l'ID
        return { _id: userId, username: 'Utente sconosciuto', avatar: '', error: true };
      }
    });
    
    const usersData = await Promise.all(userDetailsPromises);
    
    // Crea una mappa di ID utente -> dettagli utente
    const usersMap = usersData.reduce((map, user) => {
      map[user._id] = user;
      return map;
    }, {});
    

    const populateEvent = {
      ...eventData,
      creator: usersMap[extractId(eventData.creator)] || { _id: extractId(eventData.creator) },
      participants: (eventData.participants || []).map(p => usersMap[extractId(p)] || { _id: extractId(p) })
    };
    
    return populateEvent;
  } catch (error) {
    console.error('Errore nel recupero dettagli utenti:', error);
    return eventData;
  }
}
