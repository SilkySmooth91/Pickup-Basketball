import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import passport from "passport"
import googleStrategy from "./src/auth/strategies/googleOAuth.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
passport.use("google", googleStrategy);

// Routes
app.use("/auth", authRoutes);

// Middleware
app.use(express.json());

// Connect to MongoDB
await connectDB();

app.get("/", (req, res) => {
    res.send("API running...")
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})