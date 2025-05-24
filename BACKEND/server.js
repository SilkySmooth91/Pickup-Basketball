import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import passport from "passport"
import googleStrategy from "./src/auth/strategies/googleOAuth.js";
import authRoutes from "./src/routes/auth/authRoutes.js";

dotenv.config();

const app = express();
passport.use("google", googleStrategy);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Connect to MongoDB
await connectDB();

app.get("/", (req, res) => {
    res.send("API running...")
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})