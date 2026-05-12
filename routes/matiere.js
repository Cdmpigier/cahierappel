const express = require('express');
const router = express.Router();
const Matiere = require('../models/matiere');

router.get('/', async (req, res, next) => {
  try {
    const matieres = await Matiere.getAll();
    res.json(matieres);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const matiere = await Matiere.create(req.body);
    res.status(201).json(matiere);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Matiere.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;