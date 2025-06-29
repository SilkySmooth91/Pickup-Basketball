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

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import googleStrategy from "./src/auth/strategies/googleOAuth.js";
import authRoutes from "./src/routes/auth/authRoutes.js";
import usersRoutes from "./src/routes/users/users.routes.js";
import courtsRoutes from "./src/routes/courts/courts.routes.js";
import eventsRoutes from "./src/routes/events/events.routes.js";
import friendsRoutes from "./src/routes/friends-requests/friends.routes.js";
import commentsRoutes from "./src/routes/comments/comments.routes.js";
import bugReportsRoutes from "./src/routes/bug-reports/bugReports.routes.js";
import favoritesRoutes from "./src/routes/favorites/favorites.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.js";

dotenv.config();

const app = express();
passport.use("google", googleStrategy);

// Inizializzazione di passport
app.use(passport.initialize());

// Configurazione CORS per permettere richieste solo dal frontend
const corsOptions = {
  origin: [process.env.FE_URL, 'http://localhost:5173', 'https://pickup-basketball.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/courts", courtsRoutes);
app.use("/events", eventsRoutes);
app.use("/friends", friendsRoutes);
app.use("/comments", commentsRoutes);
app.use("/bug-reports", bugReportsRoutes);
app.use("/favorites", favoritesRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;