const mongoose = require('mongoose');

const enseignementSchema = new mongoose.Schema({
    matiere_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere' },
    enseignant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enseignant' },
    filiere_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Filiere' },
    periode_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Periode' },
    date_enseignement: Date,
    horaire: String
});

module.exports = mongoose.model('Enseignement', enseignementSchema);