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

import jwt from "jsonwebtoken";
import "dotenv/config";
import usersModel from "../models/UsersSchema.js";

const jwtSecretKey = process.env.JWT_SECRET_KEY;

const authMiddleware = async (req, res, next) => {
    try {
        // Controlla se l'header Authorization è presente
        const tokenBearer = req.headers.authorization;
        if (!tokenBearer || !tokenBearer.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Token mancante o malformato" });
        }

        // Estrae il token rimuovendo il prefisso "Bearer "
        const token = tokenBearer.split(" ")[1];

        // Verifica il token
        const data = jwt.verify(token, jwtSecretKey);

        // Trova l'utente associato al token
        const user = await usersModel.findById(data.id);
        if (!user) {
            return res.status(404).json({ error: "Utente non trovato" });
        }

        // Aggiungi l'utente alla richiesta e passa al prossimo middleware
        req.user = user;
        next();
    } catch (err) {
        // Gestione degli errori
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token scaduto, effettua nuovamente il login" });
        } else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Token non valido" });
        } else {
            return res.status(500).json({ error: "Errore del server durante la verifica del token" });
        }
    }
};

export default authMiddleware;