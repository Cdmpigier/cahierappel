const pool = require('../config/db');

const Filiere = {
  getAll: async () => {
    const { rows } = await pool.query('SELECT * FROM filieres ORDER BY libelle');
    return rows;
  },

  create: async ({ code, libelle }) => {
    const { rows } = await pool.query(
      'INSERT INTO filieres (code, libelle) VALUES ($1, $2) RETURNING *',
      [code, libelle]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await pool.query('DELETE FROM filieres WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
};

module.exports = Filiere;