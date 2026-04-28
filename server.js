const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);
let db;

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

// Save data
app.post("/submit", async (req, res) => {
  await db.collection("users").insertOne({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message,
    createdAt: new Date()
  });

  res.redirect("/");
});

// Get data
app.get("/api/feedbacks", async (req, res) => {
  try {
    const data = await db.collection("users").find().sort({ createdAt: -1 }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load feedbacks" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});