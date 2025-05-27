import friendRequestModel from "../models/FriendReqModel.js";

const validateFriendRequest = async (req, res, next) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: "ID destinatario mancante" });
  if (to === req.user.id) return res.status(400).json({ error: "Non puoi inviare una richiesta a te stesso" });

  const exists = await friendRequestModel.findOne({ from: req.user.id, to, status: "pending" });
  if (exists) return res.status(400).json({ error: "Richiesta già inviata" });

  next();
};

export default validateFriendRequest;