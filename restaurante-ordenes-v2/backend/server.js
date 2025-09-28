const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const clientesRouter = require('./routes/clientes');
const ordenesRouter = require('./routes/ordenes');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'restaurante-ordenes API' });
});

app.use('/clientes', clientesRouter);
app.use('/ordenes', ordenesRouter);

// Healthcheck
const pool = require('./db');
app.get('/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT 1 as ok');
    res.json({ db: 'up', result: r.rows[0] });
  } catch (e) {
    res.status(500).json({ db: 'down', error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
