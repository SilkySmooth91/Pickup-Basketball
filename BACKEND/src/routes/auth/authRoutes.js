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

import express from "express";
import jwt from "jsonwebtoken";
import usersModel from '../../models/UsersSchema.js';
import { generateTokens } from "../../utils/generateTokens.js";
import authMiddleware from "../../middlewares/auth.js";
import sendEmail from "../../utils/sendEmails.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import "dotenv/config";
import uniqueUserFields from "../../middlewares/uniqueUserFields.js";
import passport from "passport";

const router = express.Router();
const jwtRefreshKey = process.env.JWT_REFRESH_KEY;
const FE_URL = process.env.FE_URL;

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registra un nuovo utente
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - confirmPassword
 *               - age
 *               - city
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               age:
 *                 type: integer
 *               city:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utente registrato con successo
 *       400:
 *         description: Dati mancanti o non validi
 *       500:
 *         description: Errore registrazione utente
 */
router.post('/register', uniqueUserFields, async (req, res) => {
  // console.log("BODY:", req.body);
  const { username, email, password, confirmPassword, age, city } = req.body;

  // Verifica campi obbligatori
  if (!username || !email || !password || !confirmPassword || !age || !city) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  // Verifica che password e conferma corrispondano
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Le password non coincidono' });
  }

  // Validazione formato email
  const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,64}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato email non valido' });
  }

  try {
    // Hash della password
    const hashed = await bcrypt.hash(password, 10);

    // Creazione utente
    const user = await usersModel.create({
      username,
      email,
      password: hashed,
      age,
      city
    });

    // Genera access + refresh token
    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      username: user.username,
      email: user.email
    });
    user.refreshToken = refreshToken;
    await user.save();

    // Risposta
    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        age: user.age,
        city: user.city,
        avatar: user.avatar || null // <-- AGGIUNTO
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore registrazione utente' });
  }
});


/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Effettua il login di un utente
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *       400:
 *         description: Email e password sono obbligatorie
 *       401:
 *         description: Credenziali non valide
 *       500:
 *         description: Errore login utente
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatorie' });
  }

  // Validazione formato email
  const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,64}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato email non valido' });
  }

  try {
    const user = await usersModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    const { accessToken, refreshToken } = await generateTokens({
      id: user.id, username: user.username, email: user.email
    });
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: {
        id: user.id, username: user.username, email: user.email,
        age: user.age, city: user.city,
        avatar: user.avatar || null // <-- AGGIUNTO
      },
      accessToken, refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore login utente' });
  }
});


/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Ottieni un nuovo access token tramite refresh token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nuovo access token generato
 *       401:
 *         description: Token di refresh mancante
 *       403:
 *         description: Token non valido o scaduto
 */
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  // console.log("=== [DEBUG] /auth/refresh chiamato ===");
  // console.log("=== [DEBUG] Refresh token ricevuto dal client:", refreshToken);

  if (!refreshToken)
    return res.status(401).json({ error: "Token di refresh mancante" });

  try {
    const decoded = jwt.verify(refreshToken, jwtRefreshKey);
    // console.log("=== [DEBUG] Decoded refresh token:", decoded); 

    const user = await usersModel.findById(decoded.id);
    // console.log("=== [DEBUG] Utente trovato:", user ? user.email : "Nessun utente");  
    // console.log("=== [DEBUG] Refresh token salvato nel DB:", user?.refreshToken);

    if (!user || user.refreshToken !== refreshToken) {
      // console.log("=== [DEBUG] Token non valido o non corrispondente"); // OK
      return res.status(403).json({ error: "Token non valido o non corrispondente" });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    user.refreshToken = newRefreshToken;
    await user.save();

    // console.log("=== [DEBUG] Nuovo refresh token generato:", newRefreshToken); 

    res.json({
      accessToken, refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        age: user.age,
        city: user.city,
        avatar: user.avatar || null // <-- AGGIUNTO
      }
    });

  } catch (err) {
    // console.error("=== [DEBUG] Errore refresh:", err); // OK
    return res.status(403).json({ error: "Token non valido o scaduto" });
  }
});


/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Effettua il logout dell'utente autenticato
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logout effettuato con successo
 *       500:
 *         description: Errore durante il logout
 */
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const user = await usersModel.findById(req.user.id);
    user.refreshToken = null;
    await user.save();
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Errore durante il logout" });
  }
});

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Invia una email per il reset della password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email di reset inviata
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore nel reset della password
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await usersModel.findOne({ email });
    if (!user) return res.status(404).json({ error: "Utente non trovato" });

    // Genera un token di reset casuale e imposta la scadenza
    const resetToken = crypto.randomBytes(32).toString("hex");

    // salva il token e la scadenza nel DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 ora di validità
    await user.save();

    // Crea il link di reset
    const resetUrl = `${FE_URL}/reset-password?token=${resetToken}`;
    
    // Invia l'email di reset e crea il corpo del messaggio
    await sendEmail({
      to: user.email,
      subject: "Reset password",
      html: `
        <p>Ciao ${user.username},</p>
        <p>hai richiesto di resettare la password. Clicca qui sotto:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Il link ha validità un’ora.</p>
      `
    });

    res.status(200).json({ message: "Email di reset inviata" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel reset della password" });
  }
});

/**
 * @openapi
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Resetta la password tramite token ricevuto via email
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token di reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password aggiornata con successo
 *       400:
 *         description: Token o nuova password mancanti o non validi
 *       500:
 *         description: Errore interno del server
 */
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;     
  const { password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token e nuova password sono obbligatori" });
  }

  try {
    const user = await usersModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token non valido o scaduto" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password aggiornata con successo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore interno del server" });
  }
});

/**
 * @openapi
 * /auth/change-email:
 *   patch:
 *     summary: Cambia l'email dell'utente autenticato
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *             properties:
 *               newEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email aggiornata
 *       400:
 *         description: Email non valida o già in uso
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore aggiornamento email
 */
router.patch("/change-email", authMiddleware, async (req, res) => {
  const { newEmail } = req.body;
  if (!newEmail || typeof newEmail !== "string") {
    return res.status(400).json({ error: "La nuova email è obbligatoria" });
  }
  // Sanitize: consenti solo email valide
  const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,64}$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({ error: "Formato email non valido" });
  }
  try {
    // Verifica che la nuova email non sia già in uso
    const exists = await usersModel.findOne({ email: newEmail });
    if (exists) return res.status(400).json({ error: "Email già in uso" });

    const user = await usersModel.findByIdAndUpdate(
      req.user.id,
      { $set: { email: newEmail } },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: "Utente non trovato" });

    res.json({ message: "Email aggiornata", email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore aggiornamento email" });
  }
});

/**
 * @openapi
 * /auth/change-password:
 *   patch:
 *     summary: Cambia la password dell'utente autenticato
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password aggiornata
 *       400:
 *         description: Password non valida o uguale alla precedente
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore aggiornamento password
 */
router.patch("/change-password", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (
    !oldPassword ||
    !newPassword ||
    typeof oldPassword !== "string" ||
    typeof newPassword !== "string"
  ) {
    return res.status(400).json({ error: "Vecchia e nuova password sono obbligatorie" });
  }
  // Sanitize: lunghezza minima e nessun carattere pericoloso
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "La nuova password deve essere di almeno 8 caratteri" });
  }
  try {
    const user = await usersModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Utente non trovato" });

    // Verifica la vecchia password
    const isMatch = await user.comparePassword
      ? await user.comparePassword(oldPassword)
      : await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Password attuale errata" });

    // Verifica che la nuova password sia diversa dalla vecchia
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) return res.status(400).json({ error: "La nuova password deve essere diversa dalla precedente" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password aggiornata" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore aggiornamento password" });
  }
});


// === GOOGLE OAUTH ROUTES ===
router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false

}));


router.get( "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: FE_URL + "/?google=fail" }),
  (req, res) => {
    // I token sono in req.user (vedi googleOAuth.js)
    // Redirigi al FE con i token come query string
    const { accessToken, refreshToken } = req.user;
    const redirectUrl = `${FE_URL}/google-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  }
);


/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Recupera i dati dell'utente autenticato
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dati utente recuperati con successo
 *       401:
 *         description: Non autorizzato
 *       404:
 *         description: Utente non trovato
 *       500:
 *         description: Errore interno del server
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await usersModel.findById(req.user.id).select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    res.json({ user });
  } catch (err) {
    console.error("Errore nel recupero dati utente:", err);
    res.status(500).json({ error: "Errore nel recupero dati utente" });
  }
});

export default router;
