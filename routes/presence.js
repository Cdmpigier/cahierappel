const express = require('express');
const router = express.Router();
const Presence = require('../models/presence');

router.get('/', async (req, res, next) => {
  try {
    const presences = await Presence.getAll();
    res.json(presences);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const presence = await Presence.create(req.body);
    res.status(201).json(presence);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Presence.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;