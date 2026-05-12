const pool = require('../config/db');

const Justification = {
  getAll: async () => {
    const query = `
      SELECT j.*,
             e.nom AS etudiant_nom, e.prenom AS etudiant_prenom,
             f.libelle AS filiere_libelle,
             m.nom AS matiere_nom,
             ens.date_enseignement, ens.horaire
      FROM justifications j
      JOIN etudiants e ON j.etudiant_id = e.id
      LEFT JOIN filieres f ON e.filiere_id = f.id
      JOIN enseignements ens ON j.enseignement_id = ens.id
      JOIN matieres m ON ens.matiere_id = m.id
      ORDER BY j.date_justification DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  create: async ({ enseignement_id, etudiant_id, motif, description, document }) => {
    const { rows } = await pool.query(
      'INSERT INTO justifications (enseignement_id, etudiant_id, motif, description, document) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [enseignement_id, etudiant_id, motif, description || null, document || null]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await pool.query('DELETE FROM justifications WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
};

module.exports = Justification;