const express = require('express');
const router = express.Router();
const Filiere = require('../model/filiere');

router.get('/', async (req, res) => {
    const filieres = await Filiere.find();
    res.json(filieres);
});
router.post('/', async (req, res) => {
    const filiere = new Filiere(req.body);
    await filiere.save();
    res.json(filiere);
});
router.delete('/:id', async (req, res) => {
    await Filiere.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});
module.exports = router;