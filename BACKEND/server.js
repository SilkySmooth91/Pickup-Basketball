import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import passport from "passport"
import googleStrategy from "./src/auth/strategies/googleOAuth.js";
import authRoutes from "./src/routes/auth/authRoutes.js";
import usersRoutes from "./src/routes/users/users.routes.js";
import courtsRoutes from "./src/routes/courts/courts.routes.js";
import eventsRoutes from "./src/routes/events/events.routes.js";

dotenv.config();

const app = express();
passport.use("google", googleStrategy);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/courts", courtsRoutes);
app.use("/events", eventsRoutes);

// Connect to MongoDB
await connectDB();

app.get("/", (req, res) => {
    res.send("API running...")
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})