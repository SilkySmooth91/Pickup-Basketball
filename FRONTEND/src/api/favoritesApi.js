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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Ottieni tutti i campetti preferiti dell'utente
 * @param {Object} auth - Oggetto di autenticazione
 * @returns {Promise<Object>} Lista dei campetti preferiti
 */
export const getFavoriteCourts = async (auth) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/favorites/courts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, auth);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Errore nel recupero dei campetti preferiti');
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Errore nel recupero campetti preferiti:', error);
    throw error;
  }
};

/**
 * Aggiungi un campetto ai preferiti
 * @param {string} courtId - ID del campetto
 * @param {Object} auth - Oggetto di autenticazione
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const addCourtToFavorites = async (courtId, auth) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/favorites/courts/${courtId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, auth);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Errore nell\'aggiunta ai preferiti');
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Errore nell\'aggiunta ai preferiti:', error);
    throw error;
  }
};

/**
 * Rimuovi un campetto dai preferiti
 * @param {string} courtId - ID del campetto
 * @param {Object} auth - Oggetto di autenticazione
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const removeCourtFromFavorites = async (courtId, auth) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/favorites/courts/${courtId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }, auth);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Errore nella rimozione dai preferiti');
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Errore nella rimozione dai preferiti:', error);
    throw error;
  }
};

/**
 * Verifica se un campetto è nei preferiti
 * @param {string} courtId - ID del campetto
 * @param {Object} auth - Oggetto di autenticazione
 * @returns {Promise<boolean>} True se è nei preferiti, false altrimenti
 */
export const isCourtInFavorites = async (courtId, auth) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/favorites/courts/${courtId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, auth);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Errore nella verifica dello status');
    }

    const result = await response.json();
    return result.isFavorite;

  } catch (error) {
    console.error('Errore nella verifica status preferiti:', error);
    throw error;
  }
};

/**
 * Toggle dello status di un campetto nei preferiti
 * @param {string} courtId - ID del campetto
 * @param {boolean} isFavorite - Status attuale
 * @param {Object} auth - Oggetto di autenticazione
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const toggleCourtFavorite = async (courtId, isFavorite, auth) => {
  try {
    if (isFavorite) {
      return await removeCourtFromFavorites(courtId, auth);
    } else {
      return await addCourtToFavorites(courtId, auth);
    }
  } catch (error) {
    console.error('Errore nel toggle preferiti:', error);
    throw error;
  }
};
