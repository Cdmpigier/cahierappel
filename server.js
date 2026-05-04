require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cahierappel';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// Importer les routeurs (chemins exacts)
const periodesRouter = require('./api/periode');
const matieresRouter = require('./api/matiere');
const enseignantsRouter = require('./api/enseignant');
const filieresRouter = require('./api/filiere');
const etudiantsRouter = require('./api/etudiant');
const enseignementsRouter = require('./api/enseignement');
const presencesRouter = require('./api/presence');
const justificationsRouter = require('./api/justification');

// Monter les routes (public avec 's')
app.use('/api/periodes', periodesRouter);
app.use('/api/matieres', matieresRouter);
app.use('/api/enseignants', enseignantsRouter);
app.use('/api/filieres', filieresRouter);
app.use('/api/etudiants', etudiantsRouter);
app.use('/api/enseignements', enseignementsRouter);
app.use('/api/presences', presencesRouter);
app.use('/api/justifications', justificationsRouter);

// Route par défaut (pour index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});





// Fin du fichier server.js
const PORT = process.env.PORT || 4000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`🚀 Serveur local sur http://localhost:${PORT}`));
}
module.exports = app; // nécessaire pour Vercel (mais Render ne l'utilisera pas)