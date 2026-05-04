const express = require('express');
const router = express.Router();
const Matiere = require('../model/matiere');

router.get('/', async (req, res) => {
    const matieres = await Matiere.find();
    res.json(matieres);
});
router.post('/', async (req, res) => {
    const matiere = new Matiere(req.body);
    await matiere.save();
    res.json(matiere);
});
router.delete('/:id', async (req, res) => {
    await Matiere.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});
module.exports = router;