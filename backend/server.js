import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import mysql from "mysql2";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Logging Setup ----------
const logDir = "./logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const accessLogStream = fs.createWriteStream(
  path.join(logDir, "access.log"),
  { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

// ---------- MySQL Connection ----------
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

// ---------- Routes ----------
app.get("/api/health", (req, res) => {
  res.json({ message: "API is working with MySQL 🚀" });
});

app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});
app.post("/api/users", (req, res) => {
  const { id, name} = req.body;

  db.query(
    "INSERT INTO users (id, name) VALUES (?, ?)",
    [id, name],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "User added", id: results.insertId });
    }
  );
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});