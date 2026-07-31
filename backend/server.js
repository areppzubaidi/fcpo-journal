import express from 'express';
import cors from 'cors';
import pool from './db.js';
import { register, login, authenticate, requireAdmin } from './auth.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Create tables on startup
const createTables = async () => {
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Database tables ready');
};

createTables().catch(console.error);

// Protected: list journals (any authenticated user)
app.get('/api/journals', authenticate, async (req, res) => {
  const result = await pool.query('SELECT * FROM journals ORDER BY download_date DESC');
  res.json({ journals: result.rows, total: result.rows.length });
});

// Protected: create a journal entry (any authenticated user)
app.post('/api/journals', authenticate, async (req, res) => {
  const { title, authors, publication_date, download_date, month, year, publisher, doi, category, keywords, notes } = req.body;
  const result = await pool.query(
    `INSERT INTO journals (title, authors, publication_date, download_date, month, year, publisher, doi, category, keywords, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [title, authors, publication_date, download_date, month, year, publisher, doi, category, keywords, notes]
  );
  res.status(201).json(result.rows[0]);
});

// Protected: update a journal entry
app.put('/api/journals/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, authors, publication_date, download_date, month, year, publisher, doi, category, keywords, notes } = req.body;
  const result = await pool.query(
    `UPDATE journals SET title=$1, authors=$2, publication_date=$3, download_date=$4, month=$5, year=$6, publisher=$7, doi=$8, category=$9, keywords=$10, notes=$11, updated_at=NOW()
     WHERE id=$12 RETURNING *`,
    [title, authors, publication_date, download_date, month, year, publisher, doi, category, keywords, notes, id]
  );
  res.json(result.rows[0]);
});

// Protected: delete a journal entry (admin only)
app.delete('/api/journals/:id', authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM journals WHERE id = $1', [id]);
  res.json({ message: 'Journal deleted' });
});

app.listen(PORT, () => {
  console.log(`FCPO Journal API running on port ${PORT}`);
});
