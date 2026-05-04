const express = require('express');
const router = express.Router();
const Etudiant = require('../model/etudiant');
const Filiere = require('../model/filiere');
const Presence = require('../model/presence');
const Justification = require('../model/justification');


router.get('/', async (req, res) => {
    const etudiants = await Etudiant.find().populate('filiere_id');
    res.json(etudiants);
});
router.post('/', async (req, res) => {
    const etudiant = new Etudiant(req.body);
    await etudiant.save();
    await Filiere.findByIdAndUpdate(req.body.filiere_id, { $inc: { nbre_etudiant: 1 } });
    res.json(etudiant);
});
router.delete('/:id', async (req, res) => {
    const etudiant = await Etudiant.findByIdAndDelete(req.params.id);
    if (etudiant) {
        await Filiere.findByIdAndUpdate(etudiant.filiere_id, { $inc: { nbre_etudiant: -1 } });
        await Presence.deleteMany({ etudiant_id: req.params.id });
        await Justification.deleteMany({ etudiant_id: req.params.id });
    }
    res.json({ success: true });
});
module.exports = router;