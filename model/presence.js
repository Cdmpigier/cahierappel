const mongoose = require('mongoose');

const presenceSchema = new mongoose.Schema({
    enseignement_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enseignement', required: true },
    etudiant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant', required: true },
    statut: { type: String, enum: ['present', 'absent'], default: 'present' },
    date_validation: { type: Date, default: Date.now },
    remarque: { type: String }
});

module.exports = mongoose.model('Presence', presenceSchema);