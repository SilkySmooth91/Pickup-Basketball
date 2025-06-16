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

import jwt from "jsonwebtoken";

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const jwtRefreshKey = process.env.JWT_REFRESH_KEY;

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