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

router.post("/", authMiddleware, uploadGallery.array("images", 10), async (req, res) => {
  try {
    const { name, address, coordinates, baskets, officialsize, nightlights } = req.body;
    if (!name || !address || !coordinates || !baskets || officialsize === undefined || nightlights === undefined) {
      return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => ({ url: f.path, public_id: f.filename }));
    }
    const court = await courtModel.create({
      name,
      address,
      coordinates,
      baskets,
      officialsize,
      nightlights,
      images
    });
    res.status(201).json(court);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella creazione del campetto" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const [courts, total] = await Promise.all([
      courtModel.find().skip(skip).limit(limit),
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

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const court = await courtModel.findById(req.params.id);
    if (!court) {
      return res.status(404).json({ error: "Campetto non trovato" });
    }
    res.json(court);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero del campetto" });
  }
});

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

// AGGIUNTA immagini alla galleria
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

// DELETE singola immagine dalla galleria
router.delete("/:id/images/:public_id", authMiddleware, async (req, res) => {
  try {
    const { id, public_id } = req.params;
    const court = await courtModel.findById(id);
    if (!court) return res.status(404).json({ error: "Campetto non trovato" });
    // Trova l'immagine
    const imgIndex = court.images.findIndex(img => img.public_id === public_id);
    if (imgIndex === -1) return res.status(404).json({ error: "Immagine non trovata" });
    // Elimina da Cloudinary
    try { await cloudinary.uploader.destroy(`covers/${public_id}`); } catch {}
    // Rimuovi dal court
    court.images.splice(imgIndex, 1);
    await court.save();
    res.json({ message: "Immagine eliminata", images: court.images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante l'eliminazione dell'immagine" });
  }
});

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