const pool = require('../config/db');

const Enseignant = {
  getAll: async () => {
    const { rows } = await pool.query('SELECT * FROM enseignants ORDER BY nom, prenom');
    return rows;
  },

  create: async ({ nom, prenom, mail, specialite, diplome, sexe }) => {
    const { rows } = await pool.query(
      'INSERT INTO enseignants (nom, prenom, mail, specialite, diplome, sexe) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nom, prenom, mail, specialite, diplome, sexe]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await pool.query('DELETE FROM enseignants WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
};

module.exports = Enseignant;