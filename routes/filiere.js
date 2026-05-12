const express = require('express');
const router = express.Router();
const Filiere = require('../models/filiere');

router.get('/', async (req, res, next) => {
  try {
    const filieres = await Filiere.getAll();
    res.json(filieres);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const filiere = await Filiere.create(req.body);
    res.status(201).json(filiere);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Filiere.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;