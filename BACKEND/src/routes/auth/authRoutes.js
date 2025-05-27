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

const router = express.Router();
const jwtRefreshKey = process.env.JWT_REFRESH_KEY;
const FE_URL = process.env.FE_URL;

router.post('/register', uniqueUserFields, async (req, res) => {
  console.log("BODY:", req.body);
  const { username, email, password, confirmPassword, age, city } = req.body;

  // Verifica campi obbligatori
  if (!username || !email || !password || !confirmPassword || !age || !city) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  // Verifica che password e conferma corrispondano
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Le password non coincidono' });
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
        city: user.city
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore registrazione utente' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatorie' });
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
        age: user.age, city: user.city
      },
      accessToken, refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore login utente' });
  }
});


router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ error: "Token di refresh mancante" });

  try {
    // Verifica il refresh token
    const decoded = jwt.verify(refreshToken, jwtRefreshKey);

    // Trova l'utente
    const user = await usersModel.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: "Token non valido o non corrispondente" });
    }

    // Genera nuovi token
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens({
      id: user.id,
      username: user.username,
      email: user.email,
    });

    // Salva il nuovo refresh token nel DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Restituisci i token aggiornati
    res.json({ accessToken, refreshToken: newRefreshToken });

  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: "Token non valido o scaduto" });
  }
});


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

// rotte per il recupero password
// forgot-password: invia un'email con un link per resettare la password
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

//rotta su cui l'utente arriva tramite il link di reset
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


export default router;
