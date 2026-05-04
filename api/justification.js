const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Justification = require('../model/justification');

router.get('/', async (req, res) => {
    const justifications = await Justification.find()
        .populate({
            path: 'enseignement_id',
            populate: { path: 'matiere_id' }
        })
        .populate({
            path: 'etudiant_id',
            populate: { path: 'filiere_id' }
        });
    res.json(justifications);
});
router.post('/', async (req, res) => {
    try {
        const { enseignement_id, etudiant_id, motif, description, document } = req.body;
        const justification = new Justification({
            enseignement_id: new mongoose.Types.ObjectId(enseignement_id),
            etudiant_id: new mongoose.Types.ObjectId(etudiant_id),
            motif,
            description,
            document
        });
        await justification.save();
        res.json(justification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;