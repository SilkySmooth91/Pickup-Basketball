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
import mongoose from 'mongoose';
import auth from '../../middlewares/auth.js';
import usersModel from '../../models/UsersSchema.js';
import courtsModel from '../../models/CourtsSchema.js';

const router = express.Router();

/**
 * @swagger
 * /favorites/courts:
 *   get:
 *     summary: Ottieni i campetti preferiti dell'utente
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista dei campetti preferiti
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 favoriteCourts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Court'
 *       401:
 *         description: Non autorizzato
 *       500:
 *         description: Errore del server
 */
router.get('/courts', auth, async (req, res) => {
  try {
    const user = await usersModel.findById(req.user._id)
      .populate('favoriteCourts')
      .select('favoriteCourts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    res.json({
      success: true,
      favoriteCourts: user.favoriteCourts || []
    });

  } catch (error) {
    console.error('Errore nel recupero campetti preferiti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
});

/**
 * @swagger
 * /favorites/courts/{courtId}:
 *   post:
 *     summary: Aggiungi un campetto ai preferiti
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courtId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del campetto da aggiungere ai preferiti
 *     responses:
 *       200:
 *         description: Campetto aggiunto ai preferiti
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 isFavorite:
 *                   type: boolean
 *       400:
 *         description: Richiesta non valida
 *       401:
 *         description: Non autorizzato
 *       404:
 *         description: Campetto non trovato
 *       500:
 *         description: Errore del server
 */
router.post('/courts/:courtId', auth, async (req, res) => {
  try {
    const { courtId } = req.params;

    // Validazione ObjectId
    if (!mongoose.Types.ObjectId.isValid(courtId)) {
      return res.status(400).json({
        success: false,
        message: 'ID campetto non valido'
      });
    }

    // Verifica che il campetto esista
    const court = await courtsModel.findById(courtId);
    if (!court) {
      return res.status(404).json({
        success: false,
        message: 'Campetto non trovato'
      });
    }

    // Trova l'utente
    const user = await usersModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    // Verifica se il campetto è già nei preferiti
    const courtObjectId = new mongoose.Types.ObjectId(courtId);
    const isAlreadyFavorite = user.favoriteCourts.some(
      favCourtId => favCourtId.equals(courtObjectId)
    );

    if (isAlreadyFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Il campetto è già nei tuoi preferiti',
        isFavorite: true
      });
    }

    // Aggiungi ai preferiti
    user.favoriteCourts.push(courtObjectId);
    await user.save();

    res.json({
      success: true,
      message: 'Campetto aggiunto ai preferiti',
      isFavorite: true
    });

  } catch (error) {
    console.error('Errore nell\'aggiunta ai preferiti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
});

/**
 * @swagger
 * /favorites/courts/{courtId}:
 *   delete:
 *     summary: Rimuovi un campetto dai preferiti
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courtId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del campetto da rimuovere dai preferiti
 *     responses:
 *       200:
 *         description: Campetto rimosso dai preferiti
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 isFavorite:
 *                   type: boolean
 *       400:
 *         description: Richiesta non valida
 *       401:
 *         description: Non autorizzato
 *       404:
 *         description: Campetto non trovato
 *       500:
 *         description: Errore del server
 */
router.delete('/courts/:courtId', auth, async (req, res) => {
  try {
    const { courtId } = req.params;

    // Validazione ObjectId
    if (!mongoose.Types.ObjectId.isValid(courtId)) {
      return res.status(400).json({
        success: false,
        message: 'ID campetto non valido'
      });
    }

    // Trova l'utente
    const user = await usersModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    // Verifica se il campetto è nei preferiti
    const courtObjectId = new mongoose.Types.ObjectId(courtId);
    const favoriteIndex = user.favoriteCourts.findIndex(
      favCourtId => favCourtId.equals(courtObjectId)
    );

    if (favoriteIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Il campetto non è nei tuoi preferiti',
        isFavorite: false
      });
    }

    // Rimuovi dai preferiti
    user.favoriteCourts.splice(favoriteIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Campetto rimosso dai preferiti',
      isFavorite: false
    });

  } catch (error) {
    console.error('Errore nella rimozione dai preferiti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
});

/**
 * @swagger
 * /favorites/courts/{courtId}/status:
 *   get:
 *     summary: Verifica se un campetto è nei preferiti
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courtId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del campetto da verificare
 *     responses:
 *       200:
 *         description: Status del campetto nei preferiti
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isFavorite:
 *                   type: boolean
 *       400:
 *         description: Richiesta non valida
 *       401:
 *         description: Non autorizzato
 *       500:
 *         description: Errore del server
 */
router.get('/courts/:courtId/status', auth, async (req, res) => {
  try {
    const { courtId } = req.params;

    // Validazione ObjectId
    if (!mongoose.Types.ObjectId.isValid(courtId)) {
      return res.status(400).json({
        success: false,
        message: 'ID campetto non valido'
      });
    }

    // Trova l'utente
    const user = await usersModel.findById(req.user._id).select('favoriteCourts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    // Verifica se è nei preferiti
    const courtObjectId = new mongoose.Types.ObjectId(courtId);
    const isFavorite = user.favoriteCourts.some(
      favCourtId => favCourtId.equals(courtObjectId)
    );

    res.json({
      success: true,
      isFavorite
    });

  } catch (error) {
    console.error('Errore nella verifica status preferiti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server'
    });
  }
});

export default router;
