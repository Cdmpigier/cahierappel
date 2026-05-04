const express = require('express');
const router = express.Router();
const Enseignement = require('../model/enseignement');
const Presence = require('../model/presence');
const Justification = require('../model/justification');

// GET avec populate
router.get('/', async (req, res) => {
    try {
        const enseignements = await Enseignement.find()
            .populate('matiere_id')
            .populate('enseignant_id')
            .populate('filiere_id')
            .populate('periode_id');
        res.json(enseignements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const enseignement = new Enseignement(req.body);
    await enseignement.save();
    res.json(enseignement);
});

router.delete('/:id', async (req, res) => {
    await Enseignement.findByIdAndDelete(req.params.id);
    await Presence.deleteMany({ enseignement_id: req.params.id });
    await Justification.deleteMany({ enseignement_id: req.params.id });
    res.json({ success: true });
});

module.exports = router;