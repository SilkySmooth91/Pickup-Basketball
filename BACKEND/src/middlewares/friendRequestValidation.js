import friendRequestModel from "../models/FriendReqModel.js";
import usersModel from "../models/UsersSchema.js";

const validateFriendRequest = async (req, res, next) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: "ID destinatario mancante" });
  if (to === req.user.id) return res.status(400).json({ error: "Non puoi inviare una richiesta a te stesso" });

  // Blocca se esiste già una richiesta pendente
  const exists = await friendRequestModel.findOne({
    $or: [
      { from: req.user.id, to, status: "pending" },
      { from: to, to: req.user.id, status: "pending" }
    ]
  });
  if (exists) return res.status(400).json({ error: "Richiesta già inviata o ricevuta" });

  // Blocca se sono già amici
  const fromUser = await usersModel.findById(req.user.id);
  if (fromUser && fromUser.friends.includes(to)) {
    return res.status(400).json({ error: "Siete già amici" });
  }

  next();
};

export default validateFriendRequest;