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
import usersModel from "../../models/UsersSchema.js";
import authMiddleware from "../../middlewares/auth.js";
import upload from "../../config/multer.js";
import friendRequestModel from "../../models/FriendReqModel.js";
import eventModel from "../../models/EventsSchema.js";

const router = express.Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Ottieni la lista utenti
 *     tags:
 *       - Users
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
 *         description: Numero di utenti per pagina
 *     responses:
 *       200:
 *         description: Lista utenti paginata
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      usersModel.find().skip(skip).limit(limit),
      usersModel.countDocuments()
    ]);
    res.json({
      users,
      page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero utenti" });
  }
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Ottieni i dettagli di un utente
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'utente
 *     responses:
 *       200:
 *         description: Dettagli utente
 *       404:
 *         description: Utente non trovato
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await usersModel
      .findById(req.params.id)
      .select("-password -refreshToken") // Esclude direttamente i campi riservati
      .populate({
        path: "userEvents",
        select: "_id title datetime court",
      })
      .populate({
        path: "friends",
        select: "_id username email avatar",
      })
      .lean(); // Restituisce un oggetto JS semplice

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    user.friendsCount = user.friends ? user.friends.length : 0;

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero utente" });
  }
});

/**
 * @openapi
 * /users/{id}/avatar:
 *   patch:
 *     summary: Aggiorna l'avatar dell'utente
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'utente
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar aggiornato
 *       400:
 *         description: Nessun file caricato
 *       404:
 *         description: Utente non trovato
 */
router.patch("/:id/avatar", authMiddleware, upload.single("avatar"), async (req, res) => {
  try {
    const user = await usersModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "Nessun file caricato" });
    }
    user.avatar = req.file.path; 
    await user.save();
    res.json({ message: "Avatar aggiornato", avatar: user.avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'aggiornamento avatar" });
  }
});

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Aggiorna i dati di un utente
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'utente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Utente aggiornato
 *       404:
 *         description: Utente non trovato
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const allowed = ["age", "city", "height", "basketrole", "bestskill"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    const user = await usersModel.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "Utente non trovato" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Errore aggiornamento profilo" });
  }
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Elimina un utente
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'utente
 *     responses:
 *       204:
 *         description: Utente eliminato
 *       403:
 *         description: Non autorizzato
 *       404:
 *         description: Utente non trovato
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Non autorizzato a cancellare questo utente' });
    }
    const user = await usersModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore durante l\'eliminazione utente' });
  }
});

/**
 * @openapi
 * /users/{id}/recent-activity:
 *   get:
 *     summary: Ottieni le attività recenti di un utente
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'utente
 *     responses:
 *       200:
 *         description: Attività recenti dell'utente
 *       404:
 *         description: Utente non trovato
 */
router.get("/:id/recent-activity", authMiddleware, async (req, res) => {
  try {
    // Eventi recenti
    const user = await usersModel.findById(req.params.id)
      .populate({
        path: "userEvents",
        select: "_id title datetime court createdAt",
        options: { sort: { datetime: -1 }, limit: 5 }
      })
      .lean();

    // Amici aggiunti di recente (dalle richieste accettate)
    const friendReqs = await friendRequestModel.find({
      status: "accepted",
      $or: [{ from: req.params.id }, { to: req.params.id }]
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate([
        { path: "from", select: "username _id avatar" },
        { path: "to", select: "username _id avatar" }
      ])
      .lean();

    // Ricava l'altro utente rispetto a req.params.id
    const recentFriends = friendReqs.map(r =>
      r.from._id.toString() === req.params.id ? r.to : r.from
    );

    res.json({
      recentEvents: user.userEvents,
      recentFriends
    });
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero attività recente" });
  }
});

/**
 * @openapi
 * /users/{id}/events:
 *   get:
 *     summary: Ottieni gli eventi a cui un utente partecipa
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'utente
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
 *         description: Lista eventi dell'utente
 *       404:
 *         description: Utente non trovato
 */
router.get("/:id/events", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Verifico che l'utente esista
    const userExists = await usersModel.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    // Trova eventi in cui l'utente è partecipante o creatore
    const [events, total] = await Promise.all([
      eventModel.find({
        $or: [
          { creator: userId },
          { participants: userId }
        ]
      })
        .populate({
          path: "court",
          select: "name address images"
        })
        .sort({ datetime: 1 })
        .skip(skip)
        .limit(limit),
      eventModel.countDocuments({
        $or: [
          { creator: userId },
          { participants: userId }
        ]
      })
    ]);

    res.json({
      events,
      page,
      totalPages: Math.ceil(total / limit),
      totalEvents: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero eventi dell'utente" });
  }
});

/**
 * @openapi
 * /users/{id}/changelog:
 *   patch:
 *     summary: Aggiorna l'ultima versione del changelog vista dall'utente
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'utente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               version:
 *                 type: string
 *                 description: Versione del changelog vista
 *     responses:
 *       200:
 *         description: Changelog aggiornato con successo
 *       403:
 *         description: Non autorizzato
 *       404:
 *         description: Utente non trovato
 */
router.patch("/:id/changelog", authMiddleware, async (req, res) => {
  try {
    // Solo l'utente stesso può aggiornare il proprio changelog
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Non autorizzato ad aggiornare il changelog di questo utente' });
    }

    const { version } = req.body;
    if (!version) {
      return res.status(400).json({ error: 'Versione del changelog richiesta' });
    }

    const user = await usersModel.findByIdAndUpdate(
      req.params.id,
      { $set: { lastSeenChangelog: version } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }

    res.json({ message: 'Changelog aggiornato con successo', lastSeenChangelog: user.lastSeenChangelog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore aggiornamento changelog" });
  }
});

export default router;
