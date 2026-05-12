const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL connecté'))
  .catch(err => {
    console.error('❌ Erreur de connexion PostgreSQL:', err);
    process.exit(1);
  });

module.exports = pool;