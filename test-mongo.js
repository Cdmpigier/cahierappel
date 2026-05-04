const mongoose = require('mongoose');
const uri = 'mongodb+srv://cdmpigierdbruser:FQ9xXFIJc6XMBJaR@cluster0.ouei3hn.mongodb.net/cahierappel?retryWrites=true&w=majority';
mongoose.connect(uri)
  .then(() => { console.log('✅ Connecté'); process.exit(0); })
  .catch(err => { console.error('❌ Erreur:', err.message); process.exit(1); });