import express from "express";
import jwt from "jsonwebtoken";
import usersModel from "../models/UsersSchema.js";
import { generateTokens } from "../utils/generateTokens.js";

const router = express.Router();
const jwtRefreshKey = process.env.JWT_REFRESH_KEY;

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

export default router;
