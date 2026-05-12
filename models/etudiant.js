const pool = require('../config/db');

const Etudiant = {
  getAll: async () => {
    const query = `
      SELECT e.id, e.nom, e.prenom, e.sexe, e.filiere_id,
             f.libelle AS filiere_libelle, f.code AS filiere_code
      FROM etudiants e
      LEFT JOIN filieres f ON e.filiere_id = f.id
      ORDER BY e.nom, e.prenom
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  create: async ({ nom, prenom, sexe, filiere_id }) => {
    const { rows } = await pool.query(
      'INSERT INTO etudiants (nom, prenom, sexe, filiere_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nom, prenom, sexe, filiere_id]
    );
    // Incrémenter le compteur de la filière
    if (filiere_id) {
      await pool.query('UPDATE filieres SET nbre_etudiant = nbre_etudiant + 1 WHERE id = $1', [filiere_id]);
    }
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await pool.query('DELETE FROM etudiants WHERE id = $1 RETURNING *', [id]);
    if (rows[0] && rows[0].filiere_id) {
      await pool.query('UPDATE filieres SET nbre_etudiant = nbre_etudiant - 1 WHERE id = $1', [rows[0].filiere_id]);
    }
    return rows[0];
  }
};

module.exports = Etudiant;