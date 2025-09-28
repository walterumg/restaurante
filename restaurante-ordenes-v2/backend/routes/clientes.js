const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /clientes/registrar
router.post('/registrar', async (req, res) => {
  try {
    let { nombre, email, telefono } = req.body;
    if (!nombre || !email || !telefono) {
      return res.status(400).json({ error: 'nombre, email y telefono son requeridos' });
    }
    email = String(email).toLowerCase().trim();

    const exists = await pool.query('SELECT id FROM clientes WHERE email=$1', [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const q = `INSERT INTO clientes (nombre, email, telefono) 
               VALUES ($1, $2, $3) 
               RETURNING id, nombre, email, telefono`;
    const r = await pool.query(q, [nombre, email, telefono]);
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /clientes/login  (email + telefono)
router.post('/login', async (req, res) => {
  try {
    const { email, telefono } = req.body;
    if (!email || !telefono) {
      return res.status(400).json({ error: 'email y telefono son requeridos' });
    }
    const q = 'SELECT id, nombre, email, telefono FROM clientes WHERE email=$1';
    const r = await pool.query(q, [String(email).toLowerCase().trim()]);
    if (r.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    if (String(r.rows[0].telefono) !== String(telefono)) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
