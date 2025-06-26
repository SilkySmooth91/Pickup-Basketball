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

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Invia una segnalazione di bug tramite il backend
 * @param {Object} bugData - Dati della segnalazione
 * @param {Object} auth - Oggetto di autenticazione dal context
 * @param {string} recaptchaToken - Token reCAPTCHA (opzionale)
 * @returns {Promise<Object>} Risultato dell'invio
 */
export const sendBugReport = async (bugData, auth, recaptchaToken = null) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!auth?.accessToken) {
      throw new Error('Utente non autenticato');
    }
    
    // Prepara i dati per il backend
    const payload = {
      title: bugData.title,
      description: bugData.description,
      email: bugData.email,
      userId: bugData.userId,
      userName: bugData.userName
    };
    
    // Aggiungi il token reCAPTCHA se presente
    if (recaptchaToken) {
      payload.recaptchaToken = recaptchaToken;
    }
    
    // Invia la richiesta al backend
    const response = await fetchWithAuth(`${API_URL}/bug-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }, auth);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Errore nell\'invio della segnalazione');
    }
    
    const result = await response.json();
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Errore nell\'invio del bug report:', error);
    
    // Gestione errori specifici
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      throw new Error('Sessione scaduta. Effettua nuovamente l\'accesso.');
    }
    
    if (error.message.includes('400') || error.message.includes('Bad Request')) {
      throw new Error('Dati della segnalazione non validi. Controlla i campi inseriti.');
    }
    
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      throw new Error('Errore del server. Riprova più tardi.');
    }
    
    throw error;
  }
};
