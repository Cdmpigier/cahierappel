const mongoose = require('mongoose');

const enseignantSchema = new mongoose.Schema({
    nom: String,
    prenom: String,
    mail: String,
    specialite: String,
    diplome: String,
    sexe: { type: String, enum: ['M', 'F'] }
});

module.exports = mongoose.model('Enseignant', enseignantSchema);