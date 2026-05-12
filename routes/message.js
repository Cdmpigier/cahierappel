const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM messages ORDER BY date_envoi DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { destinataire_type, destinataire_id, canal, sujet, message } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO messages (destinataire_type, destinataire_id, canal, sujet, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [destinataire_type, destinataire_id, canal, sujet, message]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;