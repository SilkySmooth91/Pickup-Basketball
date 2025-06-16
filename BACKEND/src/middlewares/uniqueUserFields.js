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

import usersModel from "../models/UsersSchema.js";

const uniqueUserFields = async (req, res, next) => {
  let { email, username } = req.body;
  if (
    !email ||
    !username ||
    typeof email !== "string" ||
    typeof username !== "string"
  ) {
    return res.status(400).json({ error: "Email e username sono obbligatori" });
  }

  email = email.trim();
  username = username.trim();

  if (await usersModel.findOne({ email: { $regex: `^${email}$`, $options: "i" } })) {
    return res.status(409).json({ error: "Email già in uso" });
  }
  if (await usersModel.findOne({ username: { $regex: `^${username}$`, $options: "i" } })) {
    return res.status(409).json({ error: "Username già in uso" });
  }
  next();
};

export default uniqueUserFields;