import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway')
    ? { rejectUnauthorized: false }
    : false
});

const email = 'admin@cac.local';
const password = process.env.ADMIN_PASSWORD;
if(!password) throw new Error('ADMIN_PASSWORD is required');

const hash = await bcrypt.hash(password, 10);

await pool.query(
  `INSERT INTO users(email, password_hash, role)
   VALUES($1, $2, 'administrador')
   ON CONFLICT(email) DO NOTHING`,
  [email, hash]
);

await pool.end();

console.log('Admin bootstrap completed');
