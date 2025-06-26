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

import express from 'express';
import auth from '../../middlewares/auth.js';
import sendEmail from '../../utils/sendEmails.js';

const router = express.Router();

/**
 * @swagger
 * /api/bug-reports:
 *   post:
 *     summary: Invia una segnalazione di bug
 *     tags: [Bug Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - email
 *             properties:
 *               title:
 *                 type: string
 *                 description: Titolo del bug report
 *                 example: "Errore nel caricamento della mappa"
 *               description:
 *                 type: string
 *                 description: Descrizione dettagliata del problema
 *                 example: "La mappa non si carica quando clicco su 'Trova campetti'"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email dell'utente per eventuale contatto
 *                 example: "utente@example.com"
 *               recaptchaToken:
 *                 type: string
 *                 description: Token reCAPTCHA per la verifica (opzionale)
 *                 example: "03AGdBq25..."
 *     responses:
 *       200:
 *         description: Segnalazione inviata con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Segnalazione inviata con successo"
 *       400:
 *         description: Dati di input non validi
 *       401:
 *         description: Non autorizzato
 *       500:
 *         description: Errore del server
 */
router.post(
  '/',
  auth,
  async (req, res) => {
    try {
      const { title, description, email, recaptchaToken } = req.body;
      const user = req.user;

      // Validazione manuale dei dati
      if (!title || typeof title !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Il titolo è obbligatorio'
        });
      }

      const trimmedTitle = title.trim();
      if (trimmedTitle.length < 5 || trimmedTitle.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Il titolo deve essere tra 5 e 100 caratteri'
        });
      }

      if (!description || typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'La descrizione è obbligatoria'
        });
      }

      const trimmedDescription = description.trim();
      if (trimmedDescription.length < 10 || trimmedDescription.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'La descrizione deve essere tra 10 e 1000 caratteri'
        });
      }

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'L\'email è obbligatoria'
        });
      }

      const trimmedEmail = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Formato email non valido'
        });
      }

      // TODO: Implementare la verifica del token reCAPTCHA se presente
      // if (recaptchaToken) {
      //   // Verifica il token con Google reCAPTCHA API
      // }

      // Prepara il contenuto dell'email
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">🐛 Nuova Segnalazione Bug - Pickup Basketball</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Dettagli Segnalazione</h3>
            <p><strong>Titolo:</strong> ${trimmedTitle}</p>
            <p><strong>Descrizione:</strong></p>
            <p style="background-color: white; padding: 15px; border-left: 4px solid #f97316; margin: 10px 0;">
              ${trimmedDescription.replace(/\n/g, '<br>')}
            </p>
          </div>

          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Informazioni Utente</h3>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${trimmedEmail}</p>
            <p><strong>ID Utente:</strong> ${user._id}</p>
            <p><strong>Data Segnalazione:</strong> ${new Date().toLocaleString('it-IT')}</p>
          </div>

          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Nota:</strong> Questa email è stata generata automaticamente dal sistema di bug report di Pickup Basketball.
            </p>
          </div>
        </div>
      `;

      // Invia l'email tramite SendGrid
      await sendEmail({
        to: 'lorenzo.olivieri13@gmail.com',
        subject: `🐛 Bug Report: ${trimmedTitle}`,
        html: emailHtml
      });

      res.json({
        success: true,
        message: 'Segnalazione inviata con successo'
      });

    } catch (error) {
      console.error('Errore nell\'invio del bug report:', error);
      res.status(500).json({
        success: false,
        message: 'Errore interno del server durante l\'invio della segnalazione'
      });
    }
  }
);

export default router;
