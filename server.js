const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// MongoDB URI from environment variable
const uri = process.env.MONGO_URI;

// MongoDB Client
const client = new MongoClient(uri);
let db;

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    db = client.db("sit737_db");
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ DB Error:", err);
  }
}

connectDB();

// -------------------- ROUTES --------------------

// Save feedback
app.post("/submit", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).send("Database not connected");
    }

    await db.collection("users").insertOne({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
      createdAt: new Date()
    });

    res.redirect("/");
  } catch (err) {
    console.error("❌ Insert Error:", err);
    res.status(500).send("Error saving feedback");
  }
});

// Get feedbacks
app.get("/api/feedbacks", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }

    const data = await db
      .collection("users")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(data);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to load feedbacks" });
  }
});

// Health check (VERY IMPORTANT for Kubernetes)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// -------------------- SERVER --------------------

// ⚠️ IMPORTANT: Use 0.0.0.0 for Kubernetes
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});