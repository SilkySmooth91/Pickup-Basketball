// Copyright (C) 2025 Pickup Basketball
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

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