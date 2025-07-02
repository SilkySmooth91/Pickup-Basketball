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
import NotificationService from "../../utils/NotificationService.js";
import Users from "../../models/UsersSchema.js";

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

    // Notifica gli utenti che hanno questo campo nei preferiti
    try {
      const usersWithFavoriteCourt = await Users.find({
        favoriteCourts: court,
        _id: { $ne: req.user.id } // Escludi il creatore dell'evento
      }).select('_id');

      if (usersWithFavoriteCourt.length > 0) {
        const userIds = usersWithFavoriteCourt.map(user => user._id);
        await NotificationService.createNewEventOnFavoriteCourtNotification(
          event._id,
          title,
          foundCourt.name,
          userIds
        );
      }
    } catch (notificationError) {
      console.error('Errore nella creazione notifiche nuovo evento:', notificationError);
      // Non bloccare la creazione dell'evento se le notifiche falliscono
    }

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
    const updatedFields = [];
    
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        event[key] = req.body[key];
        updatedFields.push(key);
      }
    }
    
    await event.save();

    // Notifica i partecipanti dell'aggiornamento (escluso il creatore)
    try {
      if (updatedFields.length > 0) {
        const participantIds = event.participants.filter(
          participantId => participantId.toString() !== req.user.id
        );
        
        if (participantIds.length > 0) {
          let updateMessage = `Modificati: ${updatedFields.join(', ')}`;
          await NotificationService.createEventUpdateNotification(
            event._id,
            event.title,
            participantIds,
            updateMessage
          );
        }
      }
    } catch (notificationError) {
      console.error('Errore nella creazione notifiche aggiornamento evento:', notificationError);
      // Non bloccare l'aggiornamento se le notifiche falliscono
    }

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

    // Notifica i partecipanti della cancellazione (escluso il creatore)
    try {
      const participantIds = event.participants.filter(
        participantId => participantId.toString() !== req.user.id
      );
      
      if (participantIds.length > 0) {
        await NotificationService.createEventCancelledNotification(
          event._id,
          event.title,
          participantIds,
          'L\'evento è stato cancellato dal creatore.'
        );
      }
    } catch (notificationError) {
      console.error('Errore nella creazione notifiche cancellazione evento:', notificationError);
      // Non bloccare la cancellazione se le notifiche falliscono
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

/**
 * @openapi
 * /events/{id}/invite:
 *   post:
 *     summary: Invita un utente a un evento
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
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID dell'utente da invitare
 *     responses:
 *       200:
 *         description: Invito inviato
 *       400:
 *         description: Errore nell'invito
 *       403:
 *         description: Non autorizzato
 *       404:
 *         description: Evento o utente non trovato
 */
router.post("/:id/invite", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "userId è obbligatorio" });
    }

    const event = await eventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    // Solo il creator può invitare
    if (event.creator.toString() !== req.user.id) {
      return res.status(403).json({ error: "Solo il creatore può invitare utenti" });
    }

    // Verifica che l'utente da invitare esista
    const userToInvite = await Users.findById(userId);
    if (!userToInvite) {
      return res.status(404).json({ error: "Utente da invitare non trovato" });
    }

    // Verifica che l'utente non sia già partecipante
    if (event.participants.includes(userId)) {
      return res.status(400).json({ error: "L'utente è già partecipante all'evento" });
    }

    // Verifica che l'evento non sia pieno
    if (event.maxplayers && event.participants.length >= event.maxplayers) {
      return res.status(400).json({ error: "Evento pieno, non è possibile invitare altri utenti" });
    }

    // Crea la notifica di invito
    try {
      await NotificationService.createEventInvitationNotification(
        req.user.id,
        userId,
        event._id,
        event.title
      );
    } catch (notificationError) {
      console.error('Errore nella creazione notifica invito:', notificationError);
      // Non bloccare l'invito se le notifiche falliscono
    }

    res.json({ 
      message: "Invito inviato con successo",
      invitedUser: {
        id: userToInvite._id,
        username: userToInvite.username
      }
    });
  } catch (err) {
    console.error('Errore nell\'invito utente:', err);
    res.status(500).json({ error: "Errore durante l'invito" });
  }
});



export default router;
