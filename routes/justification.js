const express = require('express');
const router = express.Router();
const Justification = require('../models/justification');

router.get('/', async (req, res, next) => {
  try {
    const justifications = await Justification.getAll();
    res.json(justifications);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const justification = await Justification.create(req.body);
    res.status(201).json(justification);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Justification.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;