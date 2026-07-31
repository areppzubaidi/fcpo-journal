import express from "express";
import cors from "cors";
import pool from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected", timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: "error", database: "disconnected", error: err.message });
  }
});

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS journals (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      authors TEXT,
      publication_date DATE,
      download_date DATE DEFAULT CURRENT_DATE,
      month INTEGER,
      year INTEGER,
      publisher VARCHAR(300),
      doi VARCHAR(300),
      category VARCHAR(200),
      keywords TEXT,
      notes TEXT,
      pdf_path VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("Database table ready");
};

createTable().catch(console.error);

app.get("/api/journals", async (req, res) => {
  const result = await pool.query("SELECT * FROM journals ORDER BY download_date DESC");
  res.json({ journals: result.rows, total: result.rows.length });
});


// Create a journal entry
app.post("/api/journals", async (req, res) => {
  const { title, authors, publication_date, download_date, month, year, publisher, doi, category, keywords, notes } = req.body;
  const result = await pool.query(
    `INSERT INTO journals (title, authors, publication_date, download_date, month, year, publisher, doi, category, keywords, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [title, authors, publication_date, download_date, month, year, publisher, doi, category, keywords, notes]
  );
  res.status(201).json(result.rows[0]);
});

app.listen(PORT, () => {
  console.log(`FCPO Journal API running on port ${PORT}`);
});
