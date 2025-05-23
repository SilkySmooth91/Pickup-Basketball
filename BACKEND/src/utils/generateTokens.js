import jwt from "jsonwebtoken";

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtRefreshKey = process.env.JWT_REFRESH;

const signToken = (payload, secret, options) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });
};

export const generateTokens = async (payload) => {
  const accessToken = await signToken(payload, jwtSecretKey, { expiresIn: "15m" });
  const refreshToken = await signToken(payload, jwtRefreshKey, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};