const pool = require('../config/db');

const Enseignement = {
  getAll: async () => {
    const query = `
      SELECT e.*,
             m.nom AS matiere_nom, m.code AS matiere_code,
             en.nom AS enseignant_nom, en.prenom AS enseignant_prenom,
             f.libelle AS filiere_libelle,
             p.libelle AS periode_libelle
      FROM enseignements e
      LEFT JOIN matieres m ON e.matiere_id = m.id
      LEFT JOIN enseignants en ON e.enseignant_id = en.id
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN periodes p ON e.periode_id = p.id
      ORDER BY e.date_enseignement DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  create: async ({ matiere_id, enseignant_id, filiere_id, periode_id, date_enseignement, horaire }) => {
    const { rows } = await pool.query(
      'INSERT INTO enseignements (matiere_id, enseignant_id, filiere_id, periode_id, date_enseignement, horaire) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [matiere_id, enseignant_id, filiere_id, periode_id, date_enseignement, horaire]
    );
    return rows[0];
  },

  delete: async (id) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM justifications WHERE enseignement_id = $1', [id]);
      await client.query('DELETE FROM presences WHERE enseignement_id = $1', [id]);
      const { rows } = await client.query('DELETE FROM enseignements WHERE id = $1 RETURNING *', [id]);
      await client.query('COMMIT');
      return rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
};

module.exports = Enseignement;