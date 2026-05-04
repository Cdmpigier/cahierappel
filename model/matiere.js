const mongoose = require('mongoose');

const matiereSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    nom: { type: String, required: true },
    volume_horaire: { type: Number, required: true }
});

module.exports = mongoose.model('Matiere', matiereSchema);