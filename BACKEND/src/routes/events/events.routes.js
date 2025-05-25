import express from "express";
import eventModel from "../../models/EventsSchema.js";
import courtModel from "../../models/CourtsSchema.js";
import authMiddleware from "../../middlewares/auth.js";

const router = express.Router();


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

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await eventModel.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero evento" });
  }
});

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
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante l'eliminazione evento" });
  }
});



export default router;
