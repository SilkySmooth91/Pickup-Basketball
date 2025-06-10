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
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.js";

dotenv.config();

const app = express();
passport.use("google", googleStrategy);

// Configurazione CORS per permettere richieste solo dal frontend
const corsOptions = {
  origin: process.env.FE_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API running...");
});

export default app;