import express from "express";
import courtModel from "../../models/CourtsSchema.js";
import authMiddleware from "../../middlewares/auth.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, address, coordinates, baskets, officialsize, nightlights } = req.body;
    if (!name || !address || !coordinates || !baskets || officialsize === undefined || nightlights === undefined) {
      return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }
    const court = await courtModel.create({
      name,
      address,
      coordinates,
      baskets,
      officialsize,
      nightlights
    });
    res.status(201).json(court);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nella creazione del campetto" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const courts = await courtModel.find();
    res.json(courts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero dei campetti" });
  }
});

export default router;