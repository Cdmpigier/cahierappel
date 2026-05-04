const mongoose = require('mongoose');

const periodeSchema = new mongoose.Schema({
    libelle: { type: String, required: true },
    date_debut: { type: Date, required: true },
    date_fin: { type: Date, required: true }
});

module.exports = mongoose.model('Periode', periodeSchema);