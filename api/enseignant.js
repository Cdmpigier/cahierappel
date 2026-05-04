const express = require('express');
const router = express.Router();
const Enseignant = require('../model/enseignant');

router.get('/', async (req, res) => {
    const enseignants = await Enseignant.find();
    res.json(enseignants);
});
router.post('/', async (req, res) => {
    const enseignant = new Enseignant(req.body);
    await enseignant.save();
    res.json(enseignant);
});
router.delete('/:id', async (req, res) => {
    await Enseignant.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});
module.exports = router;