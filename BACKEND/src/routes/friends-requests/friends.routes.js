import express from "express";
import authMiddleware from "../../middlewares/auth.js";
import friendRequestModel from "../../models/FriendReqModel.js";

const router = express.Router();

// Invia una richiesta di amicizia
router.post("/requests", authMiddleware, async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ error: "ID destinatario mancante" });
    // Evita doppioni
    const exists = await friendRequestModel.findOne({ from: req.user.id, to, status: "pending" });
    if (exists) return res.status(400).json({ error: "Richiesta già inviata" });
    const request = await friendRequestModel.create({ from: req.user.id, to });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: "Errore invio richiesta" });
  }
});

// Visualizza richieste ricevute
router.get("/requests/received", authMiddleware, async (req, res) => {
  const requests = await friendRequestModel.find({ to: req.user.id, status: "pending" }).populate("from", "username");
  res.json(requests);
});

// Visualizza richieste inviate
router.get("/requests/sent", authMiddleware, async (req, res) => {
  const requests = await friendRequestModel.find({ from: req.user.id, status: "pending" }).populate("to", "username");
  res.json(requests);
});

// Accetta una richiesta
router.post("/requests/:id/accept", authMiddleware, async (req, res) => {
  const request = await friendRequestModel.findById(req.params.id);
  if (!request || request.to.toString() !== req.user.id) return res.status(404).json({ error: "Richiesta non trovata" });
  request.status = "accepted";
  await request.save();
  res.json({ message: "Richiesta accettata" });
});

// Rifiuta una richiesta
router.post("/requests/:id/reject", authMiddleware, async (req, res) => {
  const request = await friendRequestModel.findById(req.params.id);
  if (!request || request.to.toString() !== req.user.id) return res.status(404).json({ error: "Richiesta non trovata" });
  request.status = "rejected";
  await request.save();
  res.json({ message: "Richiesta rifiutata" });
});

// Lista amici attuali ordinati per username
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Trova tutte le richieste accettate dove l'utente è coinvolto
    const requests = await friendRequestModel.find({
      status: "accepted",
      $or: [
        { from: req.user.id },
        { to: req.user.id }
      ]
    }).populate([
      { path: "from", select: "username" },
      { path: "to", select: "username" }
    ]);

    // Ricava la lista degli amici (l'altro utente rispetto a req.user.id)
    const friends = requests.map(r =>
      r.from._id.toString() === req.user.id ? r.to : r.from
    );

    // Ordina per username
    friends.sort((a, b) => a.username.localeCompare(b.username));

    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore nel recupero amici" });
  }
});

export default router;