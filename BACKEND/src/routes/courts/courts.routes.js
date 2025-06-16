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
import courtModel from "../../models/CourtsSchema.js";
import authMiddleware from "../../middlewares/auth.js";
import { adminMiddleware } from "../../middlewares/admin.js";
import { uploadCover } from "../../config/multer.js";
import cloudinary from "../../config/cloudinary.js";
import multer from "multer";

const router = express.Router();

// Multer per upload multiplo immagini (galleria)
const uploadGallery = multer({ storage: uploadCover.storage });

/**
 * @openapi
 * /courts:
 *   post:
 *     summary: Crea un nuovo campetto
 *     tags:
 *       - Courts
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               coordinates:
 *                 type: object
 *               baskets:
 *                 type: integer
 *               officialsize:
 *                 type: boolean
 *               nightlights:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Campetto creato
 */
router.post("/", authMiddleware, uploadGallery.array("images", 10), async (req, res) => {
  try {
    const { name, address, coordinates, baskets, officialsize, nightlights } = req.body;
    
    if (!name || !address || !coordinates || !baskets || officialsize === undefined || nightlights === undefined) {
      return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }
    
    // Converte le stringhe in booleani
    const isOfficialSize = officialsize === "true" || officialsize === true;
    const hasNightLights = nightlights === "true" || nightlights === true;
    
    // Parse coordinates
    let parsedCoordinates;
    try {
      parsedCoordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
    } catch (e) {
      console.error("Errore nel parsing delle coordinate:", e);
      return res.status(400).json({ error: "Formato coordinate non valido" });
    }let images = [];    if (req.files && req.files.length > 0) {
      images = req.files.map(f => ({ url: f.path, public_id: f.filename }));
    }
    const court = await courtModel.create({
      name,
      address,
      coordinates: parsedCoordinates,
      baskets: Number(baskets),
      officialsize: isOfficialSize,
      nightlights: hasNightLights,
      images,
      createdBy: req.user.id // Aggiungiamo l'ID dell'utente che crea il campetto
    });
    res.status(201).json(court);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella creazione del campetto" });
  }
});

/**
 * @openapi
 * /courts:
 *   get:
 *     summary: Ottieni la lista dei campetti
 *     tags:
 *       - Courts
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
 *         description: Numero di campetti per pagina
 *     responses:
 *       200:
 *         description: Lista campetti paginata
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Se ci sono coordinate e una distanza, cerca per prossimità
    if (req.query.lat && req.query.lng && req.query.distance) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const distance = parseInt(req.query.distance) || 5000; // Default 5km, in metri
        // Esegui una query geospaziale per trovare campetti vicini
      const courts = await courtModel.find({
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat] // MongoDB usa [lng, lat]
            },
            $maxDistance: distance
          }
        }
      }).populate('createdBy', '_id username avatar');
      
      return res.json({
        courts,
        totalCourts: courts.length
      });
    }
    
    // Altrimenti usa la paginazione standard    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const [courts, total] = await Promise.all([
      courtModel.find().populate('createdBy', '_id username avatar').skip(skip).limit(limit),
      courtModel.countDocuments()
    ]);
    res.json({
      courts,
      page,
      totalPages: Math.ceil(total / limit),
      totalCourts: total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero dei campetti" });
  }
});

/**
 * @openapi
 * /courts/{id}:
 *   get:
 *     summary: Ottieni i dettagli di un campetto
 *     tags:
 *       - Courts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del campetto
 *     responses:
 *       200:
 *         description: Dettagli campetto
 *       404:
 *         description: Campetto non trovato
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const court = await courtModel.findById(req.params.id)
                                  .populate('createdBy', '_id username avatar');
    console.log('Dettagli del campetto con ID:', req.params.id);
    console.log('Creatore del campetto:', court.createdBy);
    
    if (!court) {
      return res.status(404).json({ error: "Campetto non trovato" });
    }
    res.json(court);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero del campetto" });
  }
});

/**
 * @openapi
 * /courts/{id}:
 *   patch:
 *     summary: Modifica i dati di un campetto
 *     tags:
 *       - Courts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del campetto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Campetto aggiornato
 *       404:
 *         description: Campetto non trovato
 */
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const court = await courtModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!court) {
      return res.status(404).json({ error: "Campetto non trovato" });
    }
    res.json({ message: "Campetto aggiornato", court });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'aggiornamento del campetto" });
  }
});

/**
 * @openapi
 * /courts/{id}/images:
 *   post:
 *     summary: Aggiungi immagini alla galleria del campetto
 *     tags:
 *       - Courts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del campetto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Immagini aggiunte
 *       404:
 *         description: Campetto non trovato
 */
router.post("/:id/images", authMiddleware, uploadGallery.array("images", 10), async (req, res) => {
  try {
    const court = await courtModel.findById(req.params.id);
    if (!court) return res.status(404).json({ error: "Campetto non trovato" });
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: "Nessun file caricato" });
    const newImages = req.files.map(f => ({ url: f.path, public_id: f.filename }));
    court.images = [...(court.images || []), ...newImages];
    await court.save();
    res.json({ message: "Immagini aggiunte", images: court.images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore upload immagini" });
  }
});

/**
 * @openapi
 * /courts/{id}/images/{public_id}:
 *   delete:
 *     summary: Elimina una singola immagine dalla galleria del campetto
 *     tags:
 *       - Courts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del campetto
 *       - in: path
 *         name: public_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Public ID dell'immagine su Cloudinary
 *     responses:
 *       200:
 *         description: Immagine eliminata
 *       404:
 *         description: Campetto o immagine non trovati
 */
router.delete("/:id/images", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const public_id = req.query.public_id;
    if (!public_id) return res.status(400).json({ error: "public_id mancante" });
    const court = await courtModel.findById(id);
    if (!court) return res.status(404).json({ error: "Campetto non trovato" });
    const imgIndex = court.images.findIndex(img => img.public_id === public_id);
    if (imgIndex === -1) return res.status(404).json({ error: "Immagine non trovata" });
    try { await cloudinary.uploader.destroy(public_id); } catch {}
    court.images.splice(imgIndex, 1);
    await court.save();
    res.json({ message: "Immagine eliminata", images: court.images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante l'eliminazione dell'immagine" });
  }
});

/**
 * @openapi
 * /courts/{id}:
 *   delete:
 *     summary: Elimina un campetto (solo admin)
 *     tags:
 *       - Courts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del campetto
 *     responses:
 *       204:
 *         description: Campetto eliminato
 *       403:
 *         description: Non autorizzato
 *       404:
 *         description: Campetto non trovato
 */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const court = await courtModel.findById(req.params.id);
    if (!court) return res.status(404).json({ error: "Campetto non trovato" });
    // Elimina tutte le immagini della galleria
    if (court.images && court.images.length > 0) {
      for (const img of court.images) {
        try { await cloudinary.uploader.destroy(`covers/${img.public_id}`); } catch {}
      }
    }
    await courtModel.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante l'eliminazione del campetto" });
  }
});

export default router;