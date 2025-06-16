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
import emailjs from '@emailjs/browser';

const API_URL = import.meta.env.VITE_API_URL;

// Configurazione EmailJS dalle variabili d'ambiente
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_USER_ID = import.meta.env.VITE_EMAILJS_USER_ID;

// Servizio client-side per inviare email di bug report
export const sendBugReport = async (bugData, accessToken, recaptchaToken = null) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!accessToken) {
      throw new Error('Utente non autenticato');
    }
    
    // Prepara i parametri del template
    const templateParams = {
      to_email: 'lorenzo.olivieri13@gmail.com',
      from_name: bugData.userName || 'Utente Anonimo',
      from_email: bugData.email,
      subject: bugData.title,
      message: bugData.description,
      user_id: bugData.userId || 'Non disponibile'
    };
    
    // Approccio 1: Utilizzo della libreria @emailjs/browser (consigliato)
    if (emailjs) {
      // Inizializza emailjs
      emailjs.init(EMAILJS_USER_ID);
      
      // Se c'è un token reCAPTCHA, aggiungilo
      if (recaptchaToken) {
        templateParams['g-recaptcha-response'] = recaptchaToken;
      }
      
      // Invia l'email
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );
      
      if (response.status !== 200) {
        throw new Error('Errore nell\'invio della segnalazione');
      }
      
      return { success: true };
    } 
    // Approccio 2: Utilizzo diretto dell'API (fallback)
    else {
      const payload = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_USER_ID,
        template_params: templateParams
      };
      
      // Se c'è un token reCAPTCHA, aggiungilo
      if (recaptchaToken) {
        payload.template_params['g-recaptcha-response'] = recaptchaToken;
      }
      
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Errore nell\'invio della segnalazione');
      }

      return { success: true };
    }
  } catch (error) {
    console.error('Errore nell\'invio del bug report:', error);
    throw error;
  }
};

// Alternativa che usa il backend (da implementare se si preferisce)
export const sendBugReportViaBackend = async (bugData) => {
  return fetchWithAuth(`${API_URL}/api/bug-reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bugData)
  });
};
