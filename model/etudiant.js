const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema({
    nom: String,
    prenom: String,
    sexe: { type: String, enum: ['M', 'F'] },
    filiere_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Filiere' }
});

module.exports = mongoose.model('Etudiant', etudiantSchema);