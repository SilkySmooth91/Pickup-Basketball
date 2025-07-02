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
import Notification from "../../models/NotificationSchema.js";
import Users from "../../models/UsersSchema.js";
import EventReminderService from "../../utils/EventReminderService.js";
import authMiddleware from "../../middlewares/auth.js";

const router = express.Router();

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: Ottieni le notifiche dell'utente
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero di pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Numero di notifiche per pagina
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Mostra solo notifiche non lette
 *     responses:
 *       200:
 *         description: Lista delle notifiche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     type: object
 *                 unreadCount:
 *                   type: integer
 *                 totalCount:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Non autorizzato
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';
    const skip = (page - 1) * limit;

    // Costruisci la query
    const query = { recipient: userId };
    if (unreadOnly) {
      query.read = false;
    }

    // Ottieni le notifiche con paginazione
    const notifications = await Notification.find(query)
      .populate('sender', 'username avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Conta il totale e le non lette
    const totalCount = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      notifications,
      unreadCount,
      totalCount,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (err) {
    console.error("Errore nel recupero notifiche:", err);
    res.status(500).json({ error: "Errore nel recupero delle notifiche" });
  }
});

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     summary: Ottieni il numero di notifiche non lette
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Numero di notifiche non lette
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *       401:
 *         description: Non autorizzato
 */
router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    res.json({ unreadCount });
  } catch (err) {
    console.error("Errore nel conteggio notifiche non lette:", err);
    res.status(500).json({ error: "Errore nel conteggio delle notifiche" });
  }
});

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Segna una notifica come letta
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della notifica
 *     responses:
 *       200:
 *         description: Notifica segnata come letta
 *       404:
 *         description: Notifica non trovata
 *       401:
 *         description: Non autorizzato
 */
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ error: "Notifica non trovata" });
    }

    await notification.markAsRead();

    res.json({ message: "Notifica segnata come letta" });
  } catch (err) {
    console.error("Errore nel segnare notifica come letta:", err);
    res.status(500).json({ error: "Errore nell'aggiornamento della notifica" });
  }
});

/**
 * @openapi
 * /notifications/mark-all-read:
 *   patch:
 *     summary: Segna tutte le notifiche come lette
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutte le notifiche segnate come lette
 *       401:
 *         description: Non autorizzato
 */
router.patch("/mark-all-read", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { recipient: userId, read: false },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    res.json({ 
      message: "Tutte le notifiche sono state segnate come lette",
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Errore nel segnare tutte le notifiche come lette:", err);
    res.status(500).json({ error: "Errore nell'aggiornamento delle notifiche" });
  }
});

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     summary: Elimina una notifica
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID della notifica
 *     responses:
 *       200:
 *         description: Notifica eliminata
 *       404:
 *         description: Notifica non trovata
 *       401:
 *         description: Non autorizzato
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ error: "Notifica non trovata" });
    }

    res.json({ message: "Notifica eliminata con successo" });
  } catch (err) {
    console.error("Errore nell'eliminazione notifica:", err);
    res.status(500).json({ error: "Errore nell'eliminazione della notifica" });
  }
});

/**
 * @openapi
 * /notifications/create:
 *   post:
 *     summary: Crea una nuova notifica (solo per test/admin)
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *               - type
 *               - title
 *               - message
 *             properties:
 *               recipient:
 *                 type: string
 *                 description: ID del destinatario
 *               type:
 *                 type: string
 *                 enum: [friend_request, friend_accepted, event_invitation, event_update, event_cancelled, event_reminder, system]
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               message:
 *                 type: string
 *                 maxLength: 500
 *               data:
 *                 type: object
 *               actionUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notifica creata
 *       400:
 *         description: Dati non validi
 *       401:
 *         description: Non autorizzato
 */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { recipient, type, title, message, data, actionUrl } = req.body;
    const senderId = req.user.id;

    if (!recipient || !type || !title || !message) {
      return res.status(400).json({ 
        error: "Campi obbligatori: recipient, type, title, message" 
      });
    }

    const notification = await Notification.createNotification({
      recipient,
      sender: senderId,
      type,
      title,
      message,
      data: data || {},
      actionUrl
    });

    res.status(201).json({ 
      message: "Notifica creata con successo",
      notification 
    });
  } catch (err) {
    console.error("Errore nella creazione notifica:", err);
    res.status(500).json({ error: "Errore nella creazione della notifica" });
  }
});

/**
 * @openapi
 * /notifications/test:
 *   post:
 *     summary: Crea una notifica di test
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Notifica di test creata
 *       401:
 *         description: Non autorizzato
 */
router.post("/test", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notification = await Notification.createNotification({
      recipient: userId,
      sender: null,
      type: 'system',
      title: 'Test notifica',
      message: 'Questa è una notifica di test per verificare il funzionamento del sistema',
      data: { test: true },
      actionUrl: '/profile'
    });

    res.status(201).json({ 
      message: "Notifica di test creata con successo",
      notification 
    });
  } catch (err) {
    console.error("Errore nella creazione notifica di test:", err);
    res.status(500).json({ error: "Errore nella creazione della notifica di test" });
  }
});

/**
 * @openapi
 * /notifications/test-reminder/{eventId}:
 *   post:
 *     summary: Invia promemoria di test per un evento
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dell'evento per cui inviare il promemoria
 *     responses:
 *       200:
 *         description: Promemoria di test inviato
 *       404:
 *         description: Evento non trovato
 *       401:
 *         description: Non autorizzato
 */
router.post("/test-reminder/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const success = await EventReminderService.sendTestReminder(eventId);
    
    if (success) {
      res.json({ 
        message: "Promemoria di test inviato con successo",
        eventId 
      });
    } else {
      res.status(404).json({ error: "Evento non trovato o senza partecipanti" });
    }
  } catch (err) {
    console.error("Errore nell'invio promemoria di test:", err);
    res.status(500).json({ error: "Errore nell'invio del promemoria di test" });
  }
});

export default router;
