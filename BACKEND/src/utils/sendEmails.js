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

import sgMail from "@sendgrid/mail";
import "dotenv/config";

// Stampa informazioni di configurazione SendGrid all'avvio (senza mostrare l'API key completa)
const apiKey = process.env.SENDGRID_API_KEY || '';
const sender = process.env.SENDGRID_SENDER || '';
console.log(`SendGrid configurato con: 
  - API Key: ${apiKey.substring(0, 10)}...
  - Sender: ${sender}
`);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER,
    subject,
    html,
  };

  try {
    console.log(`Tentativo invio email a: ${to}`);
    const response = await sgMail.send(msg);
    console.log(`Email inviata con successo a: ${to}, Response Status:`, response[0].statusCode);
    return true;
  } catch (error) {
    console.error("Errore invio email:", error);
    
    // Log dettagliato dell'errore
    if (error.response) {
      console.error("Dettagli errore SendGrid:", {
        body: error.response.body,
        headers: error.response.headers,
        status: error.code || 'Nessun codice'
      });
    }
    
    throw new Error(error.message || "Errore nell'invio dell'email");
  }
};

export default sendEmail;
