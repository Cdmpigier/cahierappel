-- ============================================
-- TABLES PRINCIPALES
-- ============================================

CREATE TABLE filieres (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    libelle VARCHAR(100),
    nbre_etudiant INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE etudiants (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50),
    prenom VARCHAR(50),
    sexe CHAR(1) CHECK (sexe IN ('M', 'F')),
    filiere_id INTEGER REFERENCES filieres(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE periodes (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(100) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE matieres (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    volume_horaire INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE enseignants (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(50),
    prenom VARCHAR(50),
    mail VARCHAR(100),
    specialite VARCHAR(100),
    diplome VARCHAR(50),
    sexe CHAR(1) CHECK (sexe IN ('M', 'F')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE enseignements (
    id SERIAL PRIMARY KEY,
    matiere_id INTEGER REFERENCES matieres(id) ON DELETE CASCADE,
    enseignant_id INTEGER REFERENCES enseignants(id) ON DELETE CASCADE,
    filiere_id INTEGER REFERENCES filieres(id) ON DELETE CASCADE,
    periode_id INTEGER REFERENCES periodes(id) ON DELETE CASCADE,
    date_enseignement DATE,
    horaire VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE presences (
    id SERIAL PRIMARY KEY,
    enseignement_id INTEGER REFERENCES enseignements(id) ON DELETE CASCADE,
    etudiant_id INTEGER REFERENCES etudiants(id) ON DELETE CASCADE,
    statut VARCHAR(10) CHECK (statut IN ('present', 'absent')) DEFAULT 'present',
    remarque TEXT,
    date_validation TIMESTAMP DEFAULT NOW()
);

CREATE TABLE justifications (
    id SERIAL PRIMARY KEY,
    enseignement_id INTEGER REFERENCES enseignements(id) ON DELETE CASCADE,
    etudiant_id INTEGER REFERENCES etudiants(id) ON DELETE CASCADE,
    motif VARCHAR(100),
    description TEXT,
    document VARCHAR(255),
    date_justification TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    destinataire_type VARCHAR(20) CHECK (destinataire_type IN ('etudiant', 'filiere')),
    destinataire_id INTEGER,
    canal VARCHAR(10) CHECK (canal IN ('email', 'sms', 'both')),
    sujet VARCHAR(200),
    message TEXT,
    date_envoi TIMESTAMP DEFAULT NOW()
);