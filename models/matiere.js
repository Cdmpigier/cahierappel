const pool = require('../config/db');

const Matiere = {
  getAll: async () => {
    const { rows } = await pool.query('SELECT * FROM matieres ORDER BY nom');
    return rows;
  },

  create: async ({ code, nom, volume_horaire }) => {
    const { rows } = await pool.query(
      'INSERT INTO matieres (code, nom, volume_horaire) VALUES ($1, $2, $3) RETURNING *',
      [code, nom, volume_horaire]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await pool.query('DELETE FROM matieres WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
};

module.exports = Matiere;