const pool = require('../config/db');

const Periode = {
  getAll: async () => {
    const { rows } = await pool.query('SELECT * FROM periodes ORDER BY date_debut');
    return rows;
  },

  create: async ({ libelle, date_debut, date_fin }) => {
    const { rows } = await pool.query(
      'INSERT INTO periodes (libelle, date_debut, date_fin) VALUES ($1, $2, $3) RETURNING *',
      [libelle, date_debut, date_fin]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await pool.query('DELETE FROM periodes WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
};

module.exports = Periode;