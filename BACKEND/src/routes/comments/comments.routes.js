import express from "express";
import authMiddleware from "../../middlewares/auth.js";
import commentModel from "../../models/CommentsSchema.js";
import { adminMiddleware } from "../../middlewares/admin.js";

const router = express.Router();

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

// Ottieni tutti i commenti per un target
router.get("/:target/:targetid", async (req, res) => {
  try {
    const { target, targetid } = req.params;
    const comments = await commentModel.find({ target, targetid }).populate("author", "username");
    res.json(comments);
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