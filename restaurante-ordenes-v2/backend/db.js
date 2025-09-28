const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL no está definida. Configúrala en Render o en .env');
}

const isLocal = process.env.LOCAL_DEV === '1';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

module.exports = pool;
