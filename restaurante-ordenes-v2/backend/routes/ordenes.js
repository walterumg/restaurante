const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /ordenes  -> crear pedido
router.post('/', async (req, res) => {
  try {
    const { cliente_id, platillo_nombre, notes } = req.body;
    if (!cliente_id || !platillo_nombre) {
      return res.status(400).json({ error: 'cliente_id y platillo_nombre son requeridos' });
    }
    const q = `INSERT INTO ordenes (cliente_id, platillo_nombre, notes)
               VALUES ($1, $2, $3) RETURNING *`;
    const r = await pool.query(q, [cliente_id, platillo_nombre, notes || null]);
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /ordenes/:clienteId  -> listar pedidos de un cliente
router.get('/:clienteId', async (req, res) => {
  try {
    const q = `SELECT * FROM ordenes WHERE cliente_id=$1 ORDER BY creado DESC`;
    const r = await pool.query(q, [req.params.clienteId]);
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /ordenes/:id/estado  -> avanzar estado pending -> preparing -> delivered
router.put('/:id/estado', async (req, res) => {
  try {
    const find = await pool.query('SELECT id, estado FROM ordenes WHERE id=$1', [req.params.id]);
    if (find.rows.length === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    const estado = find.rows[0].estado;
    let nuevo = 'pending';
    if (estado === 'pending') nuevo = 'preparing';
    else if (estado === 'preparing') nuevo = 'delivered';
    else if (estado === 'delivered') nuevo = 'delivered';

    const upd = await pool.query('UPDATE ordenes SET estado=$1 WHERE id=$2 RETURNING *', [nuevo, req.params.id]);
    res.json(upd.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
