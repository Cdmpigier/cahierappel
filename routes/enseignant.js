const express = require('express');
const router = express.Router();
const Enseignant = require('../models/enseignant');

router.get('/', async (req, res, next) => {
  try {
    const enseignants = await Enseignant.getAll();
    res.json(enseignants);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const enseignant = await Enseignant.create(req.body);
    res.status(201).json(enseignant);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Enseignant.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;