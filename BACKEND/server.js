import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

dotenv.config();

const app = express();

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