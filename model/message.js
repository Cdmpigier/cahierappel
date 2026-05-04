const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    destinataireType: { type: String, enum: ['etudiant', 'filiere'] },
    destinataireId: { type: mongoose.Schema.Types.ObjectId, refPath: 'destinataireType' },
    canal: { type: String, enum: ['email', 'sms', 'both'], default: 'email' },
    sujet: String,
    message: String,
    date_envoi: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', messageSchema);