import express from "express";
import usersModel from "../../models/UsersSchema.js";
import authMiddleware from "../../middlewares/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await usersModel.find();
    res.json(users);
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

export default router;
