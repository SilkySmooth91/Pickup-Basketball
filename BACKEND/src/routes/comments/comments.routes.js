import express from "express";
import authMiddleware from "../../middlewares/auth.js";
import commentModel from "../../models/CommentsSchema.js";
import { adminMiddleware } from "../../middlewares/admin.js";

const router = express.Router();

/**
 * @openapi
 * /comments:
 *   post:
 *     summary: Aggiungi un commento
 *     tags:
 *       - Comments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               target:
 *                 type: string
 *               targetid:
 *                 type: string
 *     responses:
 *       201:
 *         description: Commento creato
 */
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

/**
 * @openapi
 * /comments/{target}/{targetid}:
 *   get:
 *     summary: Ottieni i commenti per un target
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: target
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo di target (es. Events)
 *       - in: path
 *         name: targetid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del target
 *     responses:
 *       200:
 *         description: Lista commenti
 */
// Ottieni tutti i commenti per un target
router.get("/:target/:targetid", async (req, res) => {
  try {
    const { target, targetid } = req.params;
    const comments = await commentModel.find({ target, targetid }).populate("author", "username avatar");
    // Restituisci sempre 200, anche se l'array è vuoto
    return res.status(200).json(comments);
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