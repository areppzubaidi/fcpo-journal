import pg from "pg";

const pool = new pg.Pool({
  host: process.env.DB_HOST || "fcpo-postgres",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "fcpo",
  password: process.env.DB_PASSWORD || "fcpopass123",
  database: process.env.DB_NAME || "fcpo_journal",
});

export default pool;
