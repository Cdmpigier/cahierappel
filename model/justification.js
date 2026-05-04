const mongoose = require('mongoose');

const justificationSchema = new mongoose.Schema({
    enseignement_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enseignement' },
    etudiant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Etudiant' },
    motif: String,
    date_justification: { type: Date, default: Date.now },
    document: String
});

module.exports = mongoose.model('Justification', justificationSchema);