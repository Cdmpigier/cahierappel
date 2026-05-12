// require('dotenv').config();   // <-- Supprimé pour Docker
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Import des routeurs
const etudiantRoutes = require('./routes/etudiant');
const enseignantRoutes = require('./routes/enseignant');
const matiereRoutes = require('./routes/matiere');
const filiereRoutes = require('./routes/filiere');
const periodeRoutes = require('./routes/periode');
const enseignementRoutes = require('./routes/enseignement');
const presenceRoutes = require('./routes/presence');
const justificationRoutes = require('./routes/justification');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/etudiants', etudiantRoutes);
app.use('/api/enseignants', enseignantRoutes);
app.use('/api/matieres', matiereRoutes);
app.use('/api/filieres', filiereRoutes);
app.use('/api/periodes', periodeRoutes);
app.use('/api/enseignements', enseignementRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/justifications', justificationRoutes);

// Fallback pour le frontend – compatible Express 5
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});

module.exports = app;