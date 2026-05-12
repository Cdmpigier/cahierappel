const express = require('express');
const router = express.Router();
const Periode = require('../models/periode');

router.get('/', async (req, res, next) => {
  try {
    const periodes = await Periode.getAll();
    res.json(periodes);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const periode = await Periode.create(req.body);
    res.status(201).json(periode);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Periode.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;