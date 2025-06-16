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
import authMiddleware from "../../middlewares/auth.js";
import commentModel from "../../models/CommentsSchema.js";
import { adminMiddleware } from "../../middlewares/admin.js";

const router = express.Router();

/**
 * @openapi
 * /comments:
 *   post:
 *     summary: Aggiungi un commento
 *     tags:
 *       - Comments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               target:
 *                 type: string
 *               targetid:
 *                 type: string
 *     responses:
 *       201:
 *         description: Commento creato
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { text, target, targetid } = req.body;
    if (!text || !target || !targetid) {
      return res.status(400).json({ error: "text, target e targetid sono obbligatori" });
    }
    const comment = await commentModel.create({
      text,
      target,
      targetid,
      author: req.user.id
    });
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore creazione commento" });
  }
});

/**
 * @openapi
 * /comments/{target}/{targetid}:
 *   get:
 *     summary: Ottieni i commenti per un target
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: target
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo di target (es. Events)
 *       - in: path
 *         name: targetid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del target
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numero della pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Numero di commenti per pagina
 *     responses:
 *       200:
 *         description: Lista commenti paginata
 */
// Ottieni tutti i commenti per un target
router.get("/:target/:targetid", async (req, res) => {
  try {
    const { target, targetid } = req.params;
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    
    // Conta il numero totale di commenti
    const totalComments = await commentModel.countDocuments({ target, targetid });
    
    // Ottieni i commenti per la pagina corrente, ordinati dal più recente
    const comments = await commentModel.find({ target, targetid })
      .populate("author", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Restituisci i dati della pagina e il totale
    return res.status(200).json({
      comments,
      page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore recupero commenti" });
  }
});

// Cancella un commento (solo autore o admin)
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const comment = await commentModel.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Commento non trovato" });

    // Se l'utente è autore, può cancellare
    if (comment.author.toString() === req.user.id) {
      await comment.deleteOne();
      return res.json({ message: "Commento eliminato" });
    }

    // Se non è autore, passa il controllo all'adminMiddleware
    adminMiddleware(req, res, async () => {
      await comment.deleteOne();
      res.json({ message: "Commento eliminato (admin)" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore eliminazione commento" });
  }
});

export default router;