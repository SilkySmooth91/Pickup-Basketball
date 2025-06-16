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
import eventModel from "../../models/EventsSchema.js";
import courtModel from "../../models/CourtsSchema.js";
import authMiddleware from "../../middlewares/auth.js";

const router = express.Router();

/**
 * @openapi
 * /events:
 *   post:
 *     summary: Crea un nuovo evento
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Evento creato
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, court, datetime, maxplayers, isprivate } = req.body;
    if (!title || !court || !datetime) {
      return res.status(400).json({ error: "title, court e datetime sono obbligatori" });
    }
    // Verifica che il campetto esista
    const foundCourt = await courtModel.findById(court);
    if (!foundCourt) {
      return res.status(404).json({ error: "Campetto non trovato" });
    }
    // Crea l'evento
    const event = await eventModel.create({
      title,
      description,
      court,
      datetime,
      maxplayers,
      isprivate: isprivate || false,
      creator: req.user.id,
      participants: [req.user.id]
    });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella creazione dell'evento" });
  }
});

/**
 * @openapi
 * /events:
 *   get:
 *     summary: Ottieni la lista degli eventi
 *     tags:
 *       - Events
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numero della pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Numero di eventi per pagina
 *     responses:
 *       200:
 *         description: Lista eventi paginata
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    // Trova tutti gli eventi, ordinati per data crescente
    const [events, total] = await Promise.all([
      eventModel.find()
        .sort({ datetime: 1 })
        .skip(skip)
        .limit(limit),
      eventModel.countDocuments()
    ]);
    res.json({
      events,
      page,
      totalPages: Math.ceil(total / limit),
      totalEvents: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero eventi" });
  }
});

/**
 * @openapi
 * /events/court/{courtId}:
 *   get:
 *     summary: Ottieni gli eventi di un campetto
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: courtId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del campetto
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numero della pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Numero di eventi per pagina
 *     responses:
 *       200:
 *         description: Lista eventi del campetto
 */
router.get("/court/:courtId", authMiddleware, async (req, res) => {
  try {
    const { courtId } = req.params;
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    // Trova eventi del campetto, ordinati per data crescente
    const [events, total] = await Promise.all([
      eventModel.find({ court: courtId })
        .sort({ datetime: 1 })
        .skip(skip)
        .limit(limit),
      eventModel.countDocuments({ court: courtId })
    ]);
    res.json({
      events,
      page,
      totalPages: Math.ceil(total / limit),
      totalEvents: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero eventi" });
  }
});

/**
 * @openapi
 * /events/{id}:
 *   get:
 *     summary: Ottieni i dettagli di un evento
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'evento
 *     responses:
 *       200:
 *         description: Dettagli evento
 *       404:
 *         description: Evento non trovato
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id)
      .populate({
        path: "court",
        select: "name address images"
      })
      .populate({
        path: "creator",
        select: "username avatar"
      })
      .populate({
        path: "participants",
        select: "username avatar"
      });
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero evento" });
  }
});

/**
 * @openapi
 * /events/{id}:
 *   patch:
 *     summary: Modifica un evento (solo creator o admin)
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Evento aggiornato
 *       403:
 *         description: Non autorizzato
 *       404:
 *         description: Evento non trovato
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }
    // Solo il creator o un admin può modificare
    if (event.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Non autorizzato a modificare questo evento" });
    }
    // Aggiorna solo i campi consentiti
    const allowedFields = ["title", "description", "datetime", "maxplayers", "isprivate"];
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        event[key] = req.body[key];
      }
    }
    await event.save();
    res.json({ message: "Evento aggiornato", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'aggiornamento evento" });
  }
});

/**
 * @openapi
 * /events/{id}:
 *   delete:
 *     summary: Elimina un evento (solo creator o admin)
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'evento
 *     responses:
 *       204:
 *         description: Evento eliminato
 *       403:
 *         description: Non autorizzato
 *       404:
 *         description: Evento non trovato
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }
    // Solo il creator o un admin può eliminare
    if (event.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Non autorizzato a eliminare questo evento" });
    }
    await eventModel.findByIdAndDelete(req.params.id);
    res.sendStatus(204).json({ message: "Evento eliminato" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante l'eliminazione evento" });
  }
});

// Iscrizione a un evento
/**
 * @openapi
 * /events/{id}/join:
 *   post:
 *     summary: Iscriviti a un evento
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'evento
 *     responses:
 *       200:
 *         description: Iscritto all'evento
 *       400:
 *         description: Errore di iscrizione
 *       404:
 *         description: Evento non trovato
 */
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento non trovato" });

    // Già iscritto?
    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ error: "Sei già iscritto a questo evento" });
    }
    // Controlla maxplayers
    if (event.maxplayers && event.participants.length >= event.maxplayers) {
      return res.status(400).json({ error: "Evento pieno" });
    }
    event.participants.push(req.user.id);
    await event.save();
    res.json({ message: "Iscritto all'evento", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante l'iscrizione" });
  }
});

// Disiscrizione da un evento
/**
 * @openapi
 * /events/{id}/leave:
 *   post:
 *     summary: Disiscriviti da un evento
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'evento
 *     responses:
 *       200:
 *         description: Disiscritto dall'evento
 *       400:
 *         description: Errore di disiscrizione
 *       404:
 *         description: Evento non trovato
 */
router.post("/:id/leave", authMiddleware, async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento non trovato" });

    // Non iscritto?
    if (!event.participants.includes(req.user.id)) {
      return res.status(400).json({ error: "Non sei iscritto a questo evento" });
    }
    // Non permettere al creator di lasciare l'evento
    if (event.creator.toString() === req.user.id) {
      return res.status(400).json({ error: "Il creatore non può lasciare l'evento" });
    }
    event.participants = event.participants.filter(
      userId => userId.toString() !== req.user.id
    );
    await event.save();
    res.json({ message: "Disiscritto dall'evento", event });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante la disiscrizione" });
  }
});



export default router;
