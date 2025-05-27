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