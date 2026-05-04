const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Presence = require('../model/presence');

router.get('/', async (req, res) => {
    try {
        const presences = await Presence.find()
            .populate({
                path: 'enseignement_id',
                populate: { path: 'matiere_id' }   // ← PEUPLE LA MATIÈRE
            })
            .populate({
                path: 'etudiant_id',
                populate: { path: 'filiere_id' }   // ← PEUPLE LA FILIÈRE
            });
        res.json(presences);
    } catch (err) {
        console.error('Erreur GET /presences:', err);
        res.status(500).json({ error: err.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const { enseignement_id, etudiant_id, statut, remarque } = req.body;
        const presence = new Presence({
            enseignement_id: new mongoose.Types.ObjectId(enseignement_id),
            etudiant_id: new mongoose.Types.ObjectId(etudiant_id),
            statut,
            remarque
        });
        await presence.save();
        res.json(presence);
    } catch (err) {
        console.error('Erreur POST /presences:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Presence.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error('Erreur DELETE /presences/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;