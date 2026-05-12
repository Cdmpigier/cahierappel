const express = require('express');
const router = express.Router();
const Etudiant = require('../models/etudiant');

router.get('/', async (req, res, next) => {
  try {
    const etudiants = await Etudiant.getAll();
    res.json(etudiants);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const etudiant = await Etudiant.create(req.body);
    res.status(201).json(etudiant);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Etudiant.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;