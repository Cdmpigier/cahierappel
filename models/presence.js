const pool = require('../config/db');

const Presence = {
  getAll: async () => {
    const query = `
      SELECT p.*,
             e.nom AS etudiant_nom, e.prenom AS etudiant_prenom,
             f.libelle AS filiere_libelle,
             m.nom AS matiere_nom,
             en.nom AS enseignant_nom, en.prenom AS enseignant_prenom,
             ens.date_enseignement, ens.horaire
      FROM presences p
      JOIN etudiants e ON p.etudiant_id = e.id
      LEFT JOIN filieres f ON e.filiere_id = f.id
      JOIN enseignements ens ON p.enseignement_id = ens.id
      JOIN matieres m ON ens.matiere_id = m.id
      LEFT JOIN enseignants en ON ens.enseignant_id = en.id
      ORDER BY ens.date_enseignement DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  create: async ({ enseignement_id, etudiant_id, statut, remarque }) => {
    const { rows } = await pool.query(
      'INSERT INTO presences (enseignement_id, etudiant_id, statut, remarque) VALUES ($1, $2, $3, $4) RETURNING *',
      [enseignement_id, etudiant_id, statut, remarque || null]
    );
    return rows[0];
  },

  delete: async (id) => {
    const { rows } = await pool.query('DELETE FROM presences WHERE id = $1 RETURNING *', [id]);
    return rows[0];
  }
};

module.exports = Presence;