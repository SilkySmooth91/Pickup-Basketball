import express from "express";
import usersModel from "../../models/UsersSchema.js";
import authMiddleware from "../../middlewares/auth.js";
import upload from "../../config/multer.js";

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
        select: "_id username email",
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
    const user = await usersModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    res.json({ message: "Utente aggiornato", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nell'aggiornamento utente" });
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

export default router;
