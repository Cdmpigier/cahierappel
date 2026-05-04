const mongoose = require('mongoose');

const filiereSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    libelle: String,
    nbre_etudiant: { type: Number, default: 0 }
});

module.exports = mongoose.model('Filiere', filiereSchema);