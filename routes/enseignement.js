const express = require('express');
const router = express.Router();
const Enseignement = require('../models/enseignement');

router.get('/', async (req, res, next) => {
  try {
    const enseignements = await Enseignement.getAll();
    res.json(enseignements);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const enseignement = await Enseignement.create(req.body);
    res.status(201).json(enseignement);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Enseignement.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;