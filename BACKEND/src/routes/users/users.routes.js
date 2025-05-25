import express from "express";
import usersModel from "../../models/UsersSchema.js";
import authMiddleware from "../../middlewares/auth.js";
import upload from "../../config/multer.js";

const router = express.Router();

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

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await usersModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero utente" });
  }
});

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
