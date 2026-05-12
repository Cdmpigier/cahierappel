const API_BASE = '';

// ========== DONNÉES GLOBALES ==========
let appData = {
    periode: [],
    matiere: [],
    enseignant: [],
    filiere: [],
    etudiant: [],
    enseignement: [],
    presence: [],
    justification: []
};

// ========== HELPERS API ==========
async function apiFetch(url, options = {}) {
    const fullUrl = API_BASE + url;
    const response = await fetch(fullUrl, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
    return response.json();
}

async function loadAllData() {
    try {
        const [periodes, matieres, enseignants, filieres, etudiants, enseignements, presences, justifications] = await Promise.all([
            apiFetch('/api/periodes'),
            apiFetch('/api/matieres'),
            apiFetch('/api/enseignants'),
            apiFetch('/api/filieres'),
            apiFetch('/api/etudiants'),
            apiFetch('/api/enseignements'),
            apiFetch('/api/presences'),
            apiFetch('/api/justifications')
        ]);
        appData.periode = periodes;
        appData.matiere = matieres;
        appData.enseignant = enseignants;
        appData.filiere = filieres;
        appData.etudiant = etudiants;
        appData.enseignement = enseignements;
        appData.presence = presences;
        appData.justification = justifications;
    } catch (error) {
        console.error('Erreur chargement données:', error);
        showToast('Erreur de connexion au serveur', true);
    }
}

// ========== HELPERS UI ==========
function getMatiereById(id) { return appData.matiere.find(m => String(m.id) === String(id)); }
function getEnseignantById(id) { return appData.enseignant.find(e => String(e.id) === String(id)); }
function getFiliereById(id) { return appData.filiere.find(f => String(f.id) === String(id)); }
function getEtudiantById(id) { return appData.etudiant.find(e => String(e.id) === String(id)); }
function getPeriodeById(id) { return appData.periode.find(p => String(p.id) === String(id)); }
function getEnseignementById(id) { return appData.enseignement.find(e => String(e.id) === String(id)); }

function getetudiantByFiliere(filiereId) {
    return appData.etudiant.filter(e => String(e.filiere_id) === String(filiereId));
}

function getAbsencesByEtudiant(etudiantId) {
    return appData.presence.filter(p => String(p.etudiant_id) === String(etudiantId) && p.statut === 'absent');
}

function isAbsenceJustifiee(enseignementId, etudiantId) {
    return appData.justification.some(j => 
        String(j.enseignement_id) === String(enseignementId) && 
        String(j.etudiant_id) === String(etudiantId)
    );
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toastMsg');
    toast.textContent = message;
    toast.className = 'toast-msg show';
    if (isError) toast.classList.add('error');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function openModal(htmlContent) {
    document.getElementById('modalContent').innerHTML = htmlContent;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function addDescriptionBox(containerSelector, text) {
    setTimeout(() => {
        const container = document.querySelector(containerSelector);
        if (container && !container.querySelector('.description-box')) {
            const descBox = document.createElement('div');
            descBox.className = 'description-box';
            descBox.style.cssText = 'margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 12px; font-size: 0.85rem; color: var(--text-medium); border-left: 3px solid #2563eb;';
            descBox.innerHTML = `<i class="fas fa-info-circle"></i> ${text}`;
            container.appendChild(descBox);
        }
    }, 50);
}

// ========== RENDU DES PAGES ==========
function renderDashboard() {
    const totaletudiant = appData.etudiant.length;
    const totalAbsences = appData.presence.filter(p => p.statut === 'absent').length;
    const totalJustifiees = appData.justification.length;
    const totalNonJustifiees = totalAbsences - totalJustifiees;
    const recentAbsences = [...appData.presence].filter(p => p.statut === 'absent').slice(-5).reverse();

    const absencesHtml = recentAbsences.map(p => {
        const etudiant = appData.etudiant.find(e => String(e.id) === String(p.etudiant_id));
        const enseignement = appData.enseignement.find(e => String(e.id) === String(p.enseignement_id));
        let matiereNom = 'Cours inconnu';
        if (enseignement) {
            matiereNom = enseignement.matiere_nom || 'Matière inconnue';
        } else if (p.matiere_nom) {
            matiereNom = p.matiere_nom;
        }
        const justifiee = appData.justification.some(j =>
            String(j.enseignement_id) === String(p.enseignement_id) && String(j.etudiant_id) === String(p.etudiant_id)
        );
        const etudiantNom = etudiant ? `${etudiant.nom} ${etudiant.prenom}` : `Étudiant ${String(p.etudiant_id).slice(-5)}`;
        return `<div class="absence-item ${justifiee ? 'justifiee' : 'non-justifiee'}">
                    <div class="absence-info">
                        <strong>${etudiantNom}</strong>
                        <small>${matiereNom} - ${new Date(p.date_validation).toLocaleDateString()}</small>
                    </div>
                    <div><span class="badge ${justifiee ? 'badge-success' : 'badge-danger'}">${justifiee ? 'Justifiée' : 'Non justifiée'}</span></div>
                </div>`;
    }).join('');

    const resumeFiliereHtml = appData.filiere.map(f => {
        const etudiantsFiliere = appData.etudiant.filter(e => String(e.filiere_id) === String(f.id));
        const idsEtudiants = etudiantsFiliere.map(e => String(e.id));
        const absencesCount = appData.presence.filter(p => 
            p.statut === 'absent' && idsEtudiants.includes(String(p.etudiant_id))
        ).length;
        return `<div class="activity-row">
                    <div><strong>${f.libelle}</strong><br><small>${f.nbre_etudiant} étudiant(s)</small></div>
                    <div><span class="badge badge-warning">${absencesCount} absence(s)</span></div>
                </div>`;
    }).join('');

    const html = `
        <div class="page-header">
            <h1><i class="fas fa-tachometer-alt"></i> Tableau de bord</h1>
            <div><button class="btn btn-primary" onclick="navigateTo('saisiepresence')"><i class="fas fa-plus"></i> Nouvelle saisie</button></div>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><h3><i class="fas fa-user-graduate"></i> Étudiants</h3><div class="stat-value">${totaletudiant}</div><div class="stat-sub">Inscrits</div></div>
            <div class="stat-card"><h3><i class="fas fa-user-times"></i> Absences</h3><div class="stat-value">${totalAbsences}</div><div class="stat-sub">Total enregistré</div></div>
            <div class="stat-card"><h3><i class="fas fa-check-circle"></i> Justifiées</h3><div class="stat-value">${totalJustifiees}</div><div class="stat-sub">Absences justifiées</div></div>
            <div class="stat-card"><h3><i class="fas fa-exclamation-circle"></i> Non justifiées</h3><div class="stat-value">${totalNonJustifiees}</div><div class="stat-sub">En attente</div></div>
        </div>
        <div class="two-col-grid">
            <div class="card-panel"><div class="panel-title"><i class="fas fa-clock"></i> Dernières absences</div><div class="absences-list">${absencesHtml || '<p style="text-align:center; color: var(--text-muted); padding: 20px;">Aucune absence enregistrée</p>'}</div></div>
            <div class="card-panel"><div class="panel-title"><i class="fas fa-chart-pie"></i> Résumé par filière</div><div class="absences-list">${resumeFiliereHtml}</div></div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
}

function renderParametrage() {
    const html = `
        <div class="page-header"><h1><i class="fas fa-cogs"></i> Paramétrage</h1></div>
        <div class="two-col-grid">
            <div class="card-panel"><div class="panel-title"><i class="fas fa-calendar-alt"></i> Périodes</div><div id="listperiode">${appData.periode.map(p => `<div class="activity-row"><div><strong>${p.libelle}</strong><br><small>${formatDate(p.date_debut)} → ${formatDate(p.date_fin)}</small></div><button class="btn-sm btn-sm-secondary" onclick="deletePeriode('${p.id}')"><i class="fas fa-trash"></i></button></div>`).join('')}</div><button class="btn btn-primary" style="margin-top:12px;" onclick="openAddPeriodeModal()"><i class="fas fa-plus"></i> Ajouter période</button></div>
            <div class="card-panel"><div class="panel-title"><i class="fas fa-book"></i> Matières</div><div id="listmatiere">${appData.matiere.map(m => `<div class="activity-row"><div><strong>${m.code} - ${m.nom}</strong><br><small>Volume: ${m.volume_horaire}h</small></div><button class="btn-sm btn-sm-secondary" onclick="deleteMatiere('${m.id}')"><i class="fas fa-trash"></i></button></div>`).join('')}</div><button class="btn btn-primary" style="margin-top:12px;" onclick="openAddMatiereModal()"><i class="fas fa-plus"></i> Ajouter matière</button></div>
            <div class="card-panel"><div class="panel-title"><i class="fas fa-chalkboard-teacher"></i> Enseignants</div><div id="listenseignant">${appData.enseignant.map(e => `<div class="activity-row"><div><strong>${e.prenom} ${e.nom}</strong><br><small>${e.specialite} · ${e.mail}</small></div><button class="btn-sm btn-sm-secondary" onclick="deleteEnseignant('${e.id}')"><i class="fas fa-trash"></i></button></div>`).join('')}</div><button class="btn btn-primary" style="margin-top:12px;" onclick="openAddEnseignantModal()"><i class="fas fa-plus"></i> Ajouter enseignant</button></div>
            <div class="card-panel"><div class="panel-title"><i class="fas fa-building"></i> Filières</div><div id="listfiliere">${appData.filiere.map(f => `<div class="activity-row"><div><strong>${f.code} - ${f.libelle}</strong><br><small>${f.nbre_etudiant} étudiant(s)</small></div><button class="btn-sm btn-sm-secondary" onclick="deleteFiliere('${f.id}')"><i class="fas fa-trash"></i></button></div>`).join('')}</div><button class="btn btn-primary" style="margin-top:12px;" onclick="openAddFiliereModal()"><i class="fas fa-plus"></i> Ajouter filière</button></div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
}

function renderetudiant() {
    const filiereMap = new Map();
    appData.filiere.forEach(f => filiereMap.set(String(f.id), f.libelle));
    const absenceCount = new Map();
    for (const p of appData.presence) {
        if (p.statut !== 'absent') continue;
        const etuId = String(p.etudiant_id);
        absenceCount.set(etuId, (absenceCount.get(etuId) || 0) + 1);
    }

    const html = `
        <div class="page-header"><h1><i class="fas fa-user-graduate"></i> Gestion des étudiants</h1><button class="btn btn-primary" onclick="openAddEtudiantModal()"><i class="fas fa-plus"></i> Inscrire un étudiant</button></div>
        <div class="card-panel">
            <div class="table-container" id="etudiantsTableContainer">
                <table>
                    <thead><tr><th>ID</th><th>Nom</th><th>Prénom</th><th>Sexe</th><th>Filière</th><th>Absences</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${appData.etudiant.map(e => {
                            const filiereLib = e.filiere_libelle || filiereMap.get(String(e.filiere_id)) || 'Aucune filière';
                            const nbAbsences = absenceCount.get(String(e.id)) || 0;
                            return `<tr>
                                <td>${String(e.id).slice(-5)}</td>
                                <td>${e.nom}</td>
                                <td>${e.prenom}</td>
                                <td>${e.sexe === 'M' ? 'Masculin' : 'Féminin'}</td>
                                <td>${filiereLib}</td>
                                <td><span class="badge badge-${nbAbsences > 0 ? 'danger' : 'success'}">${nbAbsences}</span></td>
                                <td><button class="btn-sm btn-sm-secondary" onclick="deleteEtudiant('${e.id}')" style="color: #991b1b;"><i class="fas fa-trash"></i></button></td>
                            </tr>`;
                        }).join('')}
                        ${appData.etudiant.length === 0 ? '<tr><td colspan="7">Aucun étudiant inscrit</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
    addDescriptionBox('#etudiantsTableContainer', `Liste des ${appData.etudiant.length} étudiant(s) inscrit(s).`);
}

function renderSaisiepresence() {
    let rows = '';
    for (const p of appData.presence) {
        const dateStr = p.date_enseignement 
            ? new Date(p.date_enseignement).toLocaleDateString() 
            : new Date(p.date_validation).toLocaleDateString();
        const matiereNom = p.matiere_nom || '—';
        const etudiantNom = (p.etudiant_prenom && p.etudiant_nom) ? `${p.etudiant_prenom} ${p.etudiant_nom}` : '—';
        const filiereNom = p.filiere_libelle || '—';
        const horaire = p.horaire || '—';
        const statut = p.statut === 'present' ? 'Présent' : 'Absent';
        const statutClass = p.statut === 'present' ? 'badge-success' : 'badge-danger';

        rows += `
            <tr>
                <td>${dateStr}</td>
                <td>${matiereNom}</td>
                <td>${etudiantNom}</td>
                <td>${filiereNom}</td>
                <td>${horaire}</td>
                <td><span class="badge ${statutClass}">${statut}</span></td>
                <td><button class="btn-sm btn-sm-secondary" onclick="deletePresence('${p.id}')"><i class="fas fa-trash"></i></button></td>
            </tr>
        `;
    }

    const html = `
        <div class="page-header">
            <h1><i class="fas fa-clipboard-check"></i> Saisie des présences</h1>
            <button class="btn btn-primary" onclick="openAddPresenceModal()">Nouvelle saisie</button>
        </div>
        <div class="card-panel">
            <div class="table-container" id="presencesTableContainer">
                <table>
                    <thead><tr><th>Date</th><th>Matière</th><th>Étudiant</th><th>Filière</th><th>Horaire</th><th>Statut</th><th>Actions</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="7">Aucune saisie</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
    addDescriptionBox('#presencesTableContainer', `Liste des ${appData.presence.length} saisie(s).`);
}

function renderJustification() {
    const justificationKeySet = new Set();
    appData.justification.forEach(j => justificationKeySet.add(`${String(j.enseignement_id)}|${String(j.etudiant_id)}`));

    const absencesNonJustifiees = appData.presence.filter(p => {
        if (p.statut !== 'absent') return false;
        return !justificationKeySet.has(`${String(p.enseignement_id)}|${String(p.etudiant_id)}`);
    });

    const nonJustifieesHtml = absencesNonJustifiees.map(p => {
        const enseignement = appData.enseignement.find(e => String(e.id) === String(p.enseignement_id));
        const matiereNom = enseignement ? (enseignement.matiere_nom || 'N/A') : (p.matiere_nom || 'N/A');
        const etudiant = appData.etudiant.find(e => String(e.id) === String(p.etudiant_id));
        const etudiantNom = etudiant ? `${etudiant.nom} ${etudiant.prenom}` : (p.etudiant_nom ? `${p.etudiant_prenom} ${p.etudiant_nom}` : 'Inconnu');
        return `<div class="absence-item non-justifiee">
                    <div class="absence-info">
                        <strong>${etudiantNom}</strong>
                        <small>${matiereNom} - ${new Date(p.date_validation).toLocaleDateString()}</small>
                    </div>
                    <button class="btn btn-sm btn-primary" onclick="openJustifierModal('${p.id}')">
                        <i class="fas fa-check"></i> Justifier
                    </button>
                </div>`;
    }).join('');

    const justifieesHtml = appData.justification.map(j => {
        const enseignement = appData.enseignement.find(e => String(e.id) === String(j.enseignement_id));
        const matiereNom = enseignement ? (enseignement.matiere_nom || 'N/A') : 'N/A';
        const etudiant = appData.etudiant.find(e => String(e.id) === String(j.etudiant_id));
        const etudiantNom = etudiant ? `${etudiant.nom} ${etudiant.prenom}` : 'Inconnu';
        return `<div class="absence-item justifiee">
                    <div class="absence-info">
                        <strong>${etudiantNom}</strong>
                        <small>${matiereNom} · ${j.motif}</small><br>
                        <small style="color:var(--text-muted);">📄 ${j.document || 'Aucun document'} - ${j.description || ''}</small>
                    </div>
                    <div>
                        <span class="badge badge-success">Justifiée</span>
                        <small style="display:block; color: var(--text-muted);">${new Date(j.date_justification).toLocaleDateString()}</small>
                    </div>
                </div>`;
    }).join('');

    const html = `
        <div class="page-header"><h1><i class="fas fa-file-medical-alt"></i> Justification des absences</h1></div>
        <div class="card-panel">
            <div class="panel-title"><i class="fas fa-exclamation-circle"></i> Absences non justifiées</div>
            <div class="absences-list">${nonJustifieesHtml || '<p style="text-align:center; color: var(--text-muted); padding: 20px;">✅ Aucune absence non justifiée</p>'}</div>
        </div>
        <div class="card-panel">
            <div class="panel-title"><i class="fas fa-check-circle"></i> Absences justifiées</div>
            <div class="absences-list">${justifieesHtml || '<p style="text-align:center; color: var(--text-muted); padding: 20px;">Aucune justification enregistrée</p>'}</div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
}

function renderEnvoiMessages() {
    const html = `
        <div class="page-header"><h1><i class="fas fa-envelope"></i> Envoi de messages</h1></div>
        <div class="card-panel"><div class="panel-title"><i class="fas fa-paper-plane"></i> Envoyer un message</div>
        <form id="messageForm">
            <div class="form-group"><label>Destinataire</label><select id="destinataireType" required>
                <option value="">Sélectionner...</option>
                <option value="etudiant">Étudiant spécifique</option>
                <option value="filiere">Toute une filière</option>
            </select></div>
            <div class="form-group" id="etudiantelect" style="display:none;"><label>Étudiant</label><select id="etudiantId">${appData.etudiant.map(e => `<option value="${e.id}">${e.nom} ${e.prenom}</option>`).join('')}</select></div>
            <div class="form-group" id="filiereelect" style="display:none;"><label>Filière</label><select id="filiereId">${appData.filiere.map(f => `<option value="${f.id}">${f.libelle}</option>`).join('')}</select></div>
            <div class="form-group"><label>Canal d'envoi</label><select id="canal" required>
                <option value="email">E-mail</option>
                <option value="sms">SMS</option>
                <option value="both">E-mail + SMS</option>
            </select></div>
            <div class="form-group"><label>Sujet</label><input type="text" id="sujet" placeholder="Sujet du message" required></div>
            <div class="form-group"><label>Message</label><textarea id="messageTexte" rows="5" placeholder="Votre message..." required></textarea></div>
            <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Envoyer</button>
        </form></div>
    `;
    document.getElementById('mainContent').innerHTML = html;
    document.getElementById('destinataireType').addEventListener('change', function() {
        document.getElementById('etudiantelect').style.display = this.value === 'etudiant' ? 'block' : 'none';
        document.getElementById('filiereelect').style.display = this.value === 'filiere' ? 'block' : 'none';
    });
    document.getElementById('messageForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('destinataireType').value;
        const canal = document.getElementById('canal').value;
        const sujet = document.getElementById('sujet').value;
        const texte = document.getElementById('messageTexte').value;
        if (!type) { showToast('Choisissez un destinataire', true); return; }
        const canalTexte = canal === 'email' ? 'par e-mail' : (canal === 'sms' ? 'par SMS' : 'par e-mail et SMS');
        if (type === 'etudiant') {
            const etudiant = getEtudiantById(document.getElementById('etudiantId').value);
            showToast(`✅ Message envoyé à ${etudiant.prenom} ${etudiant.nom} ${canalTexte} (simulation)`);
        } else {
            const filiere = getFiliereById(document.getElementById('filiereId').value);
            const nb = getetudiantByFiliere(filiere.id).length;
            showToast(`✅ Message envoyé aux ${nb} étudiants de ${filiere.libelle} ${canalTexte} (simulation)`);
        }
        e.target.reset();
        document.getElementById('etudiantelect').style.display = 'none';
        document.getElementById('filiereelect').style.display = 'none';
    });
}

function renderEditionmatiere() {
    const html = `<div class="page-header"><h1><i class="fas fa-book"></i> Matières par filière</h1></div>${appData.filiere.map(f => { const enseignementFiliere = appData.enseignement.filter(ens => String(ens.filiere_id) === String(f.id)); const matiereIds = [...new Set(enseignementFiliere.map(ens => ens.matiere_id))]; const matieres = matiereIds.map(id => getMatiereById(id)).filter(Boolean); return `<div class="card-panel"><div class="panel-title"><i class="fas fa-building"></i> ${f.libelle} (${f.code})</div>${matieres.length > 0 ? `<div class="table-container"><table><thead><tr><th>Code</th><th>Matière</th><th>Volume horaire</th><th>Enseignant(s)</th></tr></thead><tbody>${matieres.map(m => { const enseignantIds = enseignementFiliere.filter(ens => ens.matiere_id === m.id).map(ens => ens.enseignant_id); const enseignants = [...new Set(enseignantIds)].map(id => getEnseignantById(id)).filter(Boolean); return `<tr><td>${m.code}</td><td>${m.nom}</td><td>${m.volume_horaire}h</td><td>${enseignants.map(e => e.prenom + ' ' + e.nom).join(', ')}</td></tr>`; }).join('')}</tbody></table></div>` : '<p style="text-align:center; color: var(--text-muted); padding: 20px;">Aucune matière assignée</p>'}</div>`; }).join('')}`;
    document.getElementById('mainContent').innerHTML = html;
}

function renderEditionAbsences() {
    const etuFiliereMap = new Map();
    for (const e of appData.etudiant) {
        etuFiliereMap.set(String(e.id), String(e.filiere_id));
    }
    const absencesCount = new Map();
    const justifieesCount = new Map();

    for (const p of appData.presence) {
        if (p.statut !== 'absent') continue;
        const etuId = String(p.etudiant_id);
        const filiereId = etuFiliereMap.get(etuId);
        if (!filiereId) continue;
        absencesCount.set(filiereId, (absencesCount.get(filiereId) || 0) + 1);

        const justifiee = appData.justification.some(j =>
            String(j.enseignement_id) === String(p.enseignement_id) && String(j.etudiant_id) === etuId
        );
        if (justifiee) justifieesCount.set(filiereId, (justifieesCount.get(filiereId) || 0) + 1);
    }

    let html = '<div class="page-header"><h1><i class="fas fa-chart-bar"></i> Absences par filière</h1></div>';
    for (const f of appData.filiere) {
        const fid = String(f.id);
        const total = absencesCount.get(fid) || 0;
        const justifiees = justifieesCount.get(fid) || 0;
        const nonJustifiees = total - justifiees;
        html += `
            <div class="card-panel">
                <div class="panel-title">${f.libelle}</div>
                <div class="stats-grid" style="margin-bottom:0;">
                    <div class="stat-card"><h3>Total absences</h3><div class="stat-value">${total}</div></div>
                    <div class="stat-card"><h3>Justifiées</h3><div class="stat-value">${justifiees}</div></div>
                    <div class="stat-card"><h3>Non justifiées</h3><div class="stat-value">${nonJustifiees}</div></div>
                </div>
            </div>
        `;
    }
    document.getElementById('mainContent').innerHTML = html;
}

function renderEditionetudiant() {
    const html = `
        <div class="page-header"><h1><i class="fas fa-user-clock"></i> Absences par étudiant</h1></div>
        <div class="card-panel">
            <div class="table-container" id="absencesEtudiantTable">
                <table>
                    <thead><tr><th>Étudiant</th><th>Filière</th><th>Total absences</th><th>Justifiées</th><th>Non justifiées</th><th>Détails</th></tr></thead>
                    <tbody>
                        ${appData.etudiant.map(e => {
                            const filiereNom = e.filiere_libelle || 'Aucune filière';
                            const absences = getAbsencesByEtudiant(e.id);
                            const justifiees = absences.filter(a => isAbsenceJustifiee(a.enseignement_id, a.etudiant_id)).length;
                            const total = absences.length;
                            const nonJustifiees = total - justifiees;
                            return `<tr>
                                <td><strong>${e.nom} ${e.prenom}</strong></td>
                                <td>${filiereNom}</td>
                                <td><span class="badge badge-${total > 0 ? 'danger' : 'success'}">${total}</span></td>
                                <td><span class="badge badge-success">${justifiees}</span></td>
                                <td><span class="badge badge-danger">${nonJustifiees}</span></td>
                                <td><button class="btn-sm btn-sm-primary" onclick="openDetailsAbsencesModal('${e.id}')">Voir</button></td>
                            </tr>`;
                        }).join('')}
                        ${appData.etudiant.length === 0 ? '<tr><td colspan="6">Aucun étudiant inscrit</td>' : ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
    addDescriptionBox('#absencesEtudiantTable', `Détail des absences par étudiant. Cliquez sur "Voir" pour afficher la liste complète.`);
}

function renderListeJustifiees() {
    const matiereMap = new Map();
    appData.matiere.forEach(m => matiereMap.set(String(m.id), m.nom));
    const filiereMap = new Map();
    appData.filiere.forEach(f => filiereMap.set(String(f.id), f.libelle));
    const etudiantMap = new Map();
    appData.etudiant.forEach(e => etudiantMap.set(String(e.id), { nom: e.nom, prenom: e.prenom, filiereId: e.filiere_id }));

    const rows = appData.justification.map(j => {
        const enseignement = appData.enseignement.find(e => String(e.id) === String(j.enseignement_id));
        const matiereNom = enseignement ? (enseignement.matiere_nom || matiereMap.get(String(enseignement.matiere_id))) : 'Matière inconnue';
        const etudiantInfo = etudiantMap.get(String(j.etudiant_id));
        const filiereLib = etudiantInfo ? filiereMap.get(String(etudiantInfo.filiereId)) : 'Filière inconnue';
        const dateEnseignement = enseignement?.date_enseignement ? new Date(enseignement.date_enseignement).toLocaleDateString() : 'Date inconnue';
        const etudiantNom = etudiantInfo ? `${etudiantInfo.nom} ${etudiantInfo.prenom}` : 'Étudiant inconnu';
        return `<tr>
            <td>${dateEnseignement}</td>
            <td>${etudiantNom}</td>
            <td>${filiereLib}</td>
            <td>${matiereNom}</td>
            <td>${j.motif || '-'}</td>
            <td>${new Date(j.date_justification).toLocaleDateString()}</td>
            <td>${j.document || '-'}</td>
        </tr>`;
    }).join('');

    const html = `
        <div class="page-header"><h1><i class="fas fa-check-circle"></i> Absences justifiées</h1></div>
        <div class="card-panel">
            <div class="table-container" id="justifieesTableContainer">
                <table>
                    <thead><tr><th>Date</th><th>Étudiant</th><th>Filière</th><th>Matière</th><th>Motif</th><th>Date justification</th><th>Document</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="7">Aucune absence justifiée</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
    addDescriptionBox('#justifieesTableContainer', `Liste des ${appData.justification.length} justification(s).`);
}

function renderenseignement() {
    if (!appData.enseignement.length) {
        document.getElementById('mainContent').innerHTML = `
            <div class="page-header"><h1>Planification des cours</h1><button class="btn btn-primary" onclick="openAddEnseignementModal()">Nouvel enseignement</button></div>
            <div class="card-panel"><p>Aucun enseignement planifié.</p></div>`;
        return;
    }

    const rows = appData.enseignement.map(ens => {
        const matiereNom = ens.matiere_nom || '—';
        const enseignantNom = (ens.enseignant_prenom && ens.enseignant_nom) ? `${ens.enseignant_prenom} ${ens.enseignant_nom}` : '—';
        const filiereNom = ens.filiere_libelle || '—';
        const periodeNom = ens.periode_libelle || '—';
        const nbpresence = appData.presence.filter(p => String(p.enseignement_id) === String(ens.id)).length;
        const dateStr = new Date(ens.date_enseignement).toLocaleDateString();
        return `<tr>
            <td>${dateStr}</td>
            <td>${ens.horaire}</td>
            <td>${matiereNom}</td>
            <td>${enseignantNom}</td>
            <td>${filiereNom}</td>
            <td>${periodeNom}</td>
            <td><span class="badge badge-info">${nbpresence}</span></td>
            <td><button class="btn-sm btn-sm-secondary" onclick="deleteEnseignement('${ens.id}')">🗑️</button></td>
        </tr>`;
    }).join('');

    const html = `
        <div class="page-header"><h1><i class="fas fa-calendar-plus"></i> Planification des cours</h1><button class="btn btn-primary" onclick="openAddEnseignementModal()">Nouvel enseignement</button></div>
        <div class="card-panel">
            <div class="filter-bar">
                <select id="filterFiliereEns"><option value="">Toutes les filières</option>${appData.filiere.map(f => `<option value="${f.id}">${f.libelle}</option>`).join('')}</select>
                <select id="filterPeriodeEns"><option value="">Toutes les périodes</option>${appData.periode.map(p => `<option value="${p.id}">${p.libelle}</option>`).join('')}</select>
            </div>
            <div class="table-container" id="enseignementsTableContainer">
                <table>
                    <thead><tr><th>Date</th><th>Horaire</th><th>Matière</th><th>Enseignant</th><th>Filière</th><th>Période</th><th>Présences</th><th>Actions</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('mainContent').innerHTML = html;
    addDescriptionBox('#enseignementsTableContainer', `Liste des ${appData.enseignement.length} cours planifié(s).`);
}

// ========== MODALES ==========
async function openAddPeriodeModal() {
    const html = `<div class="modal-header"><h2><i class="fas fa-calendar-alt"></i> Ajouter une période</h2><i class="fas fa-times close-icon" onclick="closeModal()"></i></div><div class="modal-body"><form id="periodeForm"><div class="form-group"><label>Libellé</label><input type="text" id="libelle" required placeholder="Ex: Semestre 1 - 2025/2026"></div><div class="form-group"><label>Date de début</label><input type="date" id="date_debut" required></div><div class="form-group"><label>Date de fin</label><input type="date" id="date_fin" required></div><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Enregistrer</button></form></div>`;
    openModal(html);
    document.getElementById('periodeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiFetch('/api/periodes', {
            method: 'POST',
            body: JSON.stringify({
                libelle: document.getElementById('libelle').value,
                date_debut: document.getElementById('date_debut').value,
                date_fin: document.getElementById('date_fin').value
            })
        });
        await loadAllData();
        closeModal();
        showToast('Période ajoutée');
        navigateTo('parametrage');
    });
}

async function openAddMatiereModal() {
    const html = `<div class="modal-header"><h2><i class="fas fa-book"></i> Ajouter une matière</h2><i class="fas fa-times close-icon" onclick="closeModal()"></i></div><div class="modal-body"><form id="matiereForm"><div class="form-group"><label>Code</label><input type="text" id="code" required></div><div class="form-group"><label>Nom</label><input type="text" id="nom" required></div><div class="form-group"><label>Volume horaire</label><input type="number" id="volume_horaire" required min="1"></div><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Enregistrer</button></form></div>`;
    openModal(html);
    document.getElementById('matiereForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiFetch('/api/matieres', {
            method: 'POST',
            body: JSON.stringify({
                code: document.getElementById('code').value,
                nom: document.getElementById('nom').value,
                volume_horaire: parseInt(document.getElementById('volume_horaire').value)
            })
        });
        await loadAllData();
        closeModal();
        showToast('Matière ajoutée');
        navigateTo('parametrage');
    });
}

async function openAddEnseignantModal() {
    const html = `<div class="modal-header"><h2><i class="fas fa-chalkboard-teacher"></i> Ajouter un enseignant</h2><i class="fas fa-times close-icon" onclick="closeModal()"></i></div><div class="modal-body"><form id="enseignantForm"><div class="form-group"><label>Nom</label><input type="text" id="nomEns" required></div><div class="form-group"><label>Prénom</label><input type="text" id="prenomEns" required></div><div class="form-group"><label>Email</label><input type="email" id="mail" required></div><div class="form-group"><label>Spécialité</label><input type="text" id="specialite" required></div><div class="form-group"><label>Diplôme</label><select id="diplome" required><option value="">Sélectionner...</option><option value="Doctorat">Doctorat</option><option value="Master">Master</option><option value="Licence">Licence</option></select></div><div class="form-group"><label>Sexe</label><select id="sexeEns" required><option value="M">Masculin</option><option value="F">Féminin</option></select></div><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Enregistrer</button></form></div>`;
    openModal(html);
    document.getElementById('enseignantForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiFetch('/api/enseignants', {
            method: 'POST',
            body: JSON.stringify({
                nom: document.getElementById('nomEns').value,
                prenom: document.getElementById('prenomEns').value,
                mail: document.getElementById('mail').value,
                specialite: document.getElementById('specialite').value,
                diplome: document.getElementById('diplome').value,
                sexe: document.getElementById('sexeEns').value
            })
        });
        await loadAllData();
        closeModal();
        showToast('Enseignant ajouté');
        navigateTo('parametrage');
    });
}

async function openAddFiliereModal() {
    const html = `<div class="modal-header"><h2><i class="fas fa-building"></i> Ajouter une filière</h2><i class="fas fa-times close-icon" onclick="closeModal()"></i></div><div class="modal-body"><form id="filiereForm"><div class="form-group"><label>Code</label><input type="text" id="codeFil" required></div><div class="form-group"><label>Libellé</label><input type="text" id="libelleFil" required></div><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Enregistrer</button></form></div>`;
    openModal(html);
    document.getElementById('filiereForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiFetch('/api/filieres', {
            method: 'POST',
            body: JSON.stringify({
                code: document.getElementById('codeFil').value,
                libelle: document.getElementById('libelleFil').value
            })
        });
        await loadAllData();
        closeModal();
        showToast('Filière ajoutée');
        navigateTo('parametrage');
    });
}

async function openAddEtudiantModal() {
    const html = `<div class="modal-header"><h2><i class="fas fa-user-graduate"></i> Inscrire un étudiant</h2><i class="fas fa-times close-icon" onclick="closeModal()"></i></div><div class="modal-body"><form id="etudiantForm"><div class="form-group"><label>Nom</label><input type="text" id="nomEtu" required></div><div class="form-group"><label>Prénom</label><input type="text" id="prenomEtu" required></div><div class="form-group"><label>Sexe</label><select id="sexeEtu" required><option value="M">Masculin</option><option value="F">Féminin</option></select></div><div class="form-group"><label>Filière</label><select id="filiereEtu" required><option value="">Sélectionner...</option>${appData.filiere.map(f => `<option value="${f.id}">${f.libelle}</option>`).join('')}</select></div><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Inscrire</button></form></div>`;
    openModal(html);
    document.getElementById('etudiantForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiFetch('/api/etudiants', {
            method: 'POST',
            body: JSON.stringify({
                nom: document.getElementById('nomEtu').value,
                prenom: document.getElementById('prenomEtu').value,
                sexe: document.getElementById('sexeEtu').value,
                filiere_id: parseInt(document.getElementById('filiereEtu').value)
            })
        });
        await loadAllData();
        closeModal();
        showToast('Étudiant inscrit');
        navigateTo('etudiant');
    });
}

async function openAddPresenceModal() {
    const html = `<div class="modal-header"><h2><i class="fas fa-clipboard-check"></i> Saisir présence/absence</h2><i class="fas fa-times close-icon" onclick="closeModal()"></i></div><div class="modal-body"><form id="presenceForm"><div class="form-group"><label>Enseignement</label><select id="enseignementPres" required><option value="">Sélectionner...</option>${appData.enseignement.map(ens => `<option value="${ens.id}">${ens.matiere_nom || 'Matière inconnue'} - ${new Date(ens.date_enseignement).toLocaleDateString()} (${ens.horaire})</option>`).join('')}</select></div><div class="form-group"><label>Étudiant</label><select id="etudiantPres" required><option value="">Sélectionner...</option>${appData.etudiant.map(e => `<option value="${e.id}">${e.nom} ${e.prenom} (${e.filiere_libelle || ''})</option>`).join('')}</select></div><div class="form-group"><label>Statut</label><select id="statutPres" required><option value="present">Présent</option><option value="absent">Absent</option></select></div><div class="form-group"><label>Remarque</label><textarea id="remarque" rows="2"></textarea></div><button type="submit" class="btn btn-primary">Enregistrer</button></form></div>`;
    openModal(html);
    document.getElementById('presenceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiFetch('/api/presences', {
            method: 'POST',
            body: JSON.stringify({
                enseignement_id: parseInt(document.getElementById('enseignementPres').value),
                etudiant_id: parseInt(document.getElementById('etudiantPres').value),
                statut: document.getElementById('statutPres').value,
                remarque: document.getElementById('remarque').value
            })
        });
        await loadAllData();
        closeModal();
        showToast('Saisie enregistrée');
        navigateTo('saisiepresence');
    });
}

async function openJustifierModal(presenceId) {
    const presence = appData.presence.find(p => String(p.id) === String(presenceId));
    if (!presence) {
        showToast('Présence introuvable', true);
        return;
    }
    const enseignement = getEnseignementById(presence.enseignement_id);
    const etudiant = getEtudiantById(presence.etudiant_id);
    const matiereNom = enseignement ? (enseignement.matiere_nom || 'Matière inconnue') : (presence.matiere_nom || 'Matière inconnue');
    const etudiantNom = etudiant ? `${etudiant.nom} ${etudiant.prenom}` : (presence.etudiant_nom ? `${presence.etudiant_prenom} ${presence.etudiant_nom}` : 'Inconnu');
    const dateStr = enseignement?.date_enseignement ? new Date(enseignement.date_enseignement).toLocaleDateString() : new Date(presence.date_validation).toLocaleDateString();

    const html = `
        <div class="modal-header"><h2><i class="fas fa-file-medical-alt"></i> Justifier une absence</h2><i class="fas fa-times close-icon" onclick="closeModal()"></i></div>
        <div class="modal-body">
            <p><strong>Étudiant :</strong> ${etudiantNom}<br><strong>Matière :</strong> ${matiereNom}<br><strong>Date :</strong> ${dateStr}</p>
            <form id="justifierForm">
                <div class="form-group"><label>Motif *</label><select id="motif" required><option value="">Sélectionner...</option><option value="Certificat médical">Certificat médical</option><option value="Raison familiale">Raison familiale</option><option value="Problème de transport">Problème de transport</option><option value="Autre">Autre</option></select></div>
                <div class="form-group"><label>Description</label><textarea id="description" rows="3"></textarea></div>
                <div class="form-group"><label>Document</label><input type="file" id="justificatifFile"><small id="fileNameDisplay" style="display:block;margin-top:4px;color:var(--text-muted);"></small></div>
                <button type="submit" class="btn btn-primary">Justifier</button>
            </form>
        </div>
    `;
    openModal(html);

    document.getElementById('justificatifFile').addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name || '';
        document.getElementById('fileNameDisplay').innerText = fileName ? `Fichier sélectionné : ${fileName}` : '';
    });

    document.getElementById('justifierForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const motif = document.getElementById('motif').value;
        if (!motif) { showToast('Choisissez un motif', true); return; }
        const description = document.getElementById('description').value;
        const file = document.getElementById('justificatifFile').files[0];
        const fileName = file ? file.name : '';

        await apiFetch('/api/justifications', {
            method: 'POST',
            body: JSON.stringify({
                enseignement_id: presence.enseignement_id,
                etudiant_id: presence.etudiant_id,
                motif,
                description,
                document: fileName
            })
        });
        await loadAllData();
        closeModal();
        showToast('Absence justifiée avec succès');
        navigateTo('justification');
    });
}

function openDetailsAbsencesModal(etudiantId) {
    const etudiant = getEtudiantById(etudiantId);
    if (!etudiant) return;
    const absences = getAbsencesByEtudiant(etudiant.id);
    const html = `<div class="modal-header"><h2><i class="fas fa-user-clock"></i> Absences de ${etudiant.prenom} ${etudiant.nom}</h2><i class="fas fa-times close-icon" onclick="closeModal()"></i></div><div class="modal-body"><div class="absences-list">${absences.map(a => { const enseignement = getEnseignementById(a.enseignement_id); const matiereNom = enseignement ? (enseignement.matiere_nom || 'N/A') : (a.matiere_nom || 'N/A'); const justifiee = isAbsenceJustifiee(a.enseignement_id, a.etudiant_id); return `<div class="absence-item ${justifiee ? 'justifiee' : 'non-justifiee'}"><div class="absence-info"><strong>${matiereNom}</strong><small>${new Date(a.date_validation).toLocaleDateString()} - ${enseignement ? enseignement.horaire : ''}</small></div><span class="badge badge-${justifiee ? 'success' : 'danger'}">${justifiee ? 'Justifiée' : 'Non justifiée'}</span></div>`; }).join('')}${absences.length === 0 ? '<p>Aucune absence</p>' : ''}</div></div><div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Fermer</button></div>`;
    openModal(html);
}

async function openAddEnseignementModal() {
    const html = `<div class="modal-header"><h2><i class="fas fa-calendar-plus"></i> Planifier un cours</h2><i class="fas fa-times close-icon" onclick="closeModal()"></i></div><div class="modal-body"><form id="enseignementForm"><div class="two-col-grid"><div class="form-group"><label>Matière</label><select id="matiereEns" required><option value="">Sélectionner...</option>${appData.matiere.map(m => `<option value="${m.id}">${m.nom} (${m.code})</option>`).join('')}</select></div><div class="form-group"><label>Enseignant</label><select id="enseignantEns" required><option value="">Sélectionner...</option>${appData.enseignant.map(e => `<option value="${e.id}">${e.prenom} ${e.nom}</option>`).join('')}</select></div></div><div class="two-col-grid"><div class="form-group"><label>Filière</label><select id="filiereEns" required><option value="">Sélectionner...</option>${appData.filiere.map(f => `<option value="${f.id}">${f.libelle}</option>`).join('')}</select></div><div class="form-group"><label>Période</label><select id="periodeEns" required><option value="">Sélectionner...</option>${appData.periode.map(p => `<option value="${p.id}">${p.libelle}</option>`).join('')}</select></div></div><div class="two-col-grid"><div class="form-group"><label>Date</label><input type="date" id="dateEns" required></div><div class="form-group"><label>Horaire</label><input type="text" id="horaireEns" required placeholder="Ex: 08:00-10:00"></div></div><button type="submit" class="btn btn-primary">Planifier</button></form></div>`;
    openModal(html);
    document.getElementById('enseignementForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await apiFetch('/api/enseignements', {
            method: 'POST',
            body: JSON.stringify({
                matiere_id: parseInt(document.getElementById('matiereEns').value),
                enseignant_id: parseInt(document.getElementById('enseignantEns').value),
                filiere_id: parseInt(document.getElementById('filiereEns').value),
                periode_id: parseInt(document.getElementById('periodeEns').value),
                date_enseignement: document.getElementById('dateEns').value,
                horaire: document.getElementById('horaireEns').value
            })
        });
        await loadAllData();
        closeModal();
        showToast('Cours planifié');
        navigateTo('enseignement');
    });
}

// ========== SUPPRESSIONS ==========
async function deletePeriode(id) { if (confirm('Supprimer cette période ?')) { await apiFetch(`/api/periodes/${id}`, { method: 'DELETE' }); await loadAllData(); showToast('Période supprimée'); navigateTo('parametrage'); } }
async function deleteMatiere(id) { if (confirm('Supprimer cette matière ?')) { await apiFetch(`/api/matieres/${id}`, { method: 'DELETE' }); await loadAllData(); showToast('Matière supprimée'); navigateTo('parametrage'); } }
async function deleteEnseignant(id) { if (confirm('Supprimer cet enseignant ?')) { await apiFetch(`/api/enseignants/${id}`, { method: 'DELETE' }); await loadAllData(); showToast('Enseignant supprimé'); navigateTo('parametrage'); } }
async function deleteFiliere(id) { if (confirm('Supprimer cette filière ?')) { await apiFetch(`/api/filieres/${id}`, { method: 'DELETE' }); await loadAllData(); showToast('Filière supprimée'); navigateTo('parametrage'); } }
async function deleteEtudiant(id) { if (confirm('Supprimer cet étudiant ?')) { await apiFetch(`/api/etudiants/${id}`, { method: 'DELETE' }); await loadAllData(); showToast('Étudiant supprimé'); navigateTo('etudiant'); } }
async function deletePresence(id) { if (confirm('Supprimer cette saisie ?')) { await apiFetch(`/api/presences/${id}`, { method: 'DELETE' }); await loadAllData(); showToast('Saisie supprimée'); navigateTo('saisiepresence'); } }
async function deleteEnseignement(id) { if (confirm('Supprimer cet enseignement ?')) { await apiFetch(`/api/enseignements/${id}`, { method: 'DELETE' }); await loadAllData(); showToast('Enseignement supprimé'); navigateTo('enseignement'); } }

// ========== NAVIGATION ==========
let currentPage = 'dashboard';
async function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if (nav.getAttribute('data-page') === page) nav.classList.add('active');
    });
    await loadAllData();
    switch (page) {
        case 'dashboard': renderDashboard(); break;
        case 'parametrage': renderParametrage(); break;
        case 'etudiants': renderetudiant(); break;
        case 'saisiePresences': renderSaisiepresence(); break;
        case 'justification': renderJustification(); break;
        case 'envoiMessages': renderEnvoiMessages(); break;
        case 'editionMatieres': renderEditionmatiere(); break;
        case 'editionAbsences': renderEditionAbsences(); break;
        case 'editionEtudiants': renderEditionetudiant(); break;
        case 'listeJustifiees': renderListeJustifiees(); break;
        case 'enseignements': renderenseignement(); break;
        default: renderDashboard();
    }
}

// ========== INITIALISATION ==========
document.addEventListener('DOMContentLoaded', async () => {
    window.navigateTo = navigateTo;
    window.closeModal = closeModal;
    window.openAddPeriodeModal = openAddPeriodeModal;
    window.openAddMatiereModal = openAddMatiereModal;
    window.openAddEnseignantModal = openAddEnseignantModal;
    window.openAddFiliereModal = openAddFiliereModal;
    window.openAddEtudiantModal = openAddEtudiantModal;
    window.openAddPresenceModal = openAddPresenceModal;
    window.openJustifierModal = openJustifierModal;
    window.openDetailsAbsencesModal = openDetailsAbsencesModal;
    window.openAddEnseignementModal = openAddEnseignementModal;
    window.deletePeriode = deletePeriode;
    window.deleteMatiere = deleteMatiere;
    window.deleteEnseignant = deleteEnseignant;
    window.deleteFiliere = deleteFiliere;
    window.deleteEtudiant = deleteEtudiant;
    window.deletePresence = deletePresence;
    window.deleteEnseignement = deleteEnseignement;

    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.addEventListener('click', () => navigateTo(nav.getAttribute('data-page')));
    });
    document.getElementById('logoHome')?.addEventListener('click', () => navigateTo('dashboard'));
    document.getElementById('modal').addEventListener('click', (e) => { if (e.target === document.getElementById('modal')) closeModal(); });

    await navigateTo('dashboard');
});