import React, { useState } from 'react';
import { CheckCircle, XCircle, MessageCircle, Calendar, User, BookOpen, Clock, AlertTriangle, Eye, ArrowLeft } from 'lucide-react';
import CahierTexteService from './services/CahierTexteService';
import NotificationService from './services/NotificationService';

interface User {
  id: string;
  name: string;
  role: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur';
  matieres?: string[];
  classes?: string[];
}

interface ValidationAdminProps {
  user: User;
}

interface EntryValidation {
  id: string;
  enseignant: string;
  enseignantId: string;
  date: string;
  matiere: string;
  classe: string;
  theme: string;
  duree: string;
  statut: 'soumis' | 'validé' | 'refusé';
  dateSubmission: string;
  priorite: 'normale' | 'urgente';
  commentaires?: string;
  retard: boolean;
}

const ValidationAdmin: React.FC<ValidationAdminProps> = ({ user }) => {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'validated' | 'rejected'>('pending');
  const [selectedEntry, setSelectedEntry] = useState<EntryValidation | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'valider' | 'refuser'>('valider');

  // Données simulées pour validation
  const entriesEnAttente: EntryValidation[] = [
    {
      id: '1',
      enseignant: 'Prof. Marie AGBODJAN',
      enseignantId: 'ens001',
      date: '2025-01-20',
      matiere: 'Mathématiques',
      classe: '6èmeA',
      theme: 'Les nombres décimaux - Addition et soustraction',
      duree: '2h',
      statut: 'soumis',
      dateSubmission: '2025-01-20T14:30:00',
      priorite: 'normale',
      retard: false
    },
    {
      id: '2',
      enseignant: 'Prof. Jean KOUDJO',
      enseignantId: 'ens002',
      date: '2025-01-19',
      matiere: 'Français',
      classe: '5èmeB',
      theme: 'La conjugaison du présent de l\'indicatif',
      duree: '1h30',
      statut: 'soumis',
      dateSubmission: '2025-01-21T09:15:00',
      priorite: 'urgente',
      retard: true
    },
    {
      id: '3',
      enseignant: 'Prof. Célestine ZOMAHOUN',
      enseignantId: 'ens003',
      date: '2025-01-18',
      matiere: 'Histoire',
      classe: '4èmeC',
      theme: 'L\'indépendance du Bénin',
      duree: '2h',
      statut: 'soumis',
      dateSubmission: '2025-01-18T16:45:00',
      priorite: 'normale',
      retard: false
    }
  ];

  const entriesValidees: EntryValidation[] = [
    {
      id: '4',
      enseignant: 'Prof. Marie AGBODJAN',
      enseignantId: 'ens001',
      date: '2025-01-17',
      matiere: 'Mathématiques',
      classe: '6èmeA',
      theme: 'Les fractions - Introduction',
      duree: '2h',
      statut: 'validé',
      dateSubmission: '2025-01-17T10:20:00',
      priorite: 'normale',
      retard: false,
      commentaires: 'Excellent cours, objectifs bien définis'
    }
  ];

  const entriesRefusees: EntryValidation[] = [
    {
      id: '5',
      enseignant: 'Prof. Jean KOUDJO',
      enseignantId: 'ens002',
      date: '2025-01-16',
      matiere: 'Français',
      classe: '5èmeB',
      theme: 'Les homophones grammaticaux',
      duree: '1h30',
      statut: 'refusé',
      dateSubmission: '2025-01-16T11:30:00',
      priorite: 'normale',
      retard: false,
      commentaires: 'Objectifs pédagogiques à préciser, contenu trop vague'
    }
  ];

  const getCurrentEntries = () => {
    switch (selectedTab) {
      case 'pending': return entriesEnAttente;
      case 'validated': return entriesValidees;
      case 'rejected': return entriesRefusees;
      default: return [];
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'pending': return entriesEnAttente.length;
      case 'validated': return entriesValidees.length;
      case 'rejected': return entriesRefusees.length;
      default: return 0;
    }
  };

  const openValidationModal = (entry: EntryValidation, action: 'valider' | 'refuser') => {
    setSelectedEntry(entry);
    setActionType(action);
    setCommentaire('');
    setShowModal(true);
  };

  const openPreview = (entry: EntryValidation) => {
    setSelectedEntry(entry);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedEntry(null);
  };

  const confirmerAction = () => {
    if (selectedEntry) {
      const validationData = {
        entryId: selectedEntry.id,
        action: actionType,
        commentaire,
        validateur: user.id,
        dateValidation: new Date().toISOString()
      };
      
      // Appeler le service de validation
      CahierTexteService.validerCahier(validationData)
        .then(() => {
          // Envoyer notification à l'enseignant
          NotificationService.envoyerNotificationValidation(
            selectedEntry, 
            user, 
            actionType === 'valider' ? 'validé' : 'refusé'
          );
          
          NotificationService.showSuccess(
            `Cahier ${actionType === 'valider' ? 'validé' : 'refusé'} avec succès`
          );
          
          setShowModal(false);
          setSelectedEntry(null);
          setCommentaire('');
          
          // Rafraîchir la liste (en production, recharger depuis l'API)
          window.location.reload();
        })
        .catch((error) => {
          NotificationService.showError('Erreur lors de la validation');
          console.error('Erreur validation:', error);
        });
    }
  };

  const getPriorityColor = (priorite: string, retard: boolean) => {
    if (retard) return 'text-red-600 bg-red-100';
    return priorite === 'urgente' ? 'text-orange-600 bg-orange-100' : 'text-blue-600 bg-blue-100';
  };

  const getPriorityText = (priorite: string, retard: boolean) => {
    if (retard) return 'Retard';
    return priorite === 'urgente' ? 'Urgent' : 'Normal';
  };

  // Données détaillées simulées pour la prévisualisation
  const getDetailedEntry = (entry: EntryValidation) => {
    return {
      ...entry,
      objectifs: "À la fin de cette séance, l'élève sera capable de :\n- Identifier les nombres décimaux\n- Effectuer des additions simples\n- Résoudre des problèmes concrets",
      contenuEnseigne: `<h3>Introduction aux nombres décimaux</h3>
<p>Nous avons commencé par réviser les nombres entiers, puis introduit la notion de partie décimale.</p>
<h4>Activités réalisées :</h4>
<ul>
<li>Manipulation de matériel concret (réglettes)</li>
<li>Exercices d'application au tableau</li>
<li>Travail en groupes de 4 élèves</li>
</ul>
<p><strong>Difficultés observées :</strong> Certains élèves confondent encore la virgule décimale.</p>`,
      competences: [
        { id: '1', libelle: 'Identifier et nommer les nombres décimaux', niveau: 'en_cours' },
        { id: '2', libelle: 'Effectuer des opérations simples', niveau: 'acquis' }
      ],
      devoirs: [
        { 
          id: '1', 
          type: 'exercice', 
          titre: 'Exercices page 45-46', 
          description: 'Compléter les exercices 1 à 5 sur les nombres décimaux',
          dateRendu: '2025-01-22',
          notesSur: 20
        }
      ],
      methodesUtilisees: 'Méthode active avec manipulation',
      materielsUtilises: 'Réglettes, tableau, cahiers d\'exercices',
      observationsEleves: 'Bonne participation générale. Marie et Jean ont besoin d\'aide supplémentaire.',
      difficultes: 'Confusion entre virgule décimale et séparateur de milliers',
      remediation: 'Prévoir des exercices supplémentaires et un rappel en début de prochaine séance'
    };
  };

  if (showPreview && selectedEntry) {
    const detailedEntry = getDetailedEntry(selectedEntry);
    
    return (
      <div className="space-y-6">
        {/* En-tête avec retour */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={closePreview}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Prévisualisation du Cahier de Texte</h2>
              <p className="text-gray-600">Vérifiez le contenu avant validation</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowPreview(false);
                openValidationModal(selectedEntry, 'refuser');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Refuser
            </button>
            <button
              onClick={() => {
                setShowPreview(false);
                openValidationModal(selectedEntry, 'valider');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Valider
            </button>
          </div>
        </div>

        {/* Aperçu du cahier */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">RÉPUBLIQUE DU BÉNIN</h1>
            <p className="text-lg text-gray-700">CAHIER DE TEXTE ÉLECTRONIQUE</p>
            <p className="text-sm text-gray-600 mt-2">Academia Hub - Année scolaire 2024-2025</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p><strong>Enseignant :</strong> {detailedEntry.enseignant}</p>
              <p><strong>Matière :</strong> {detailedEntry.matiere}</p>
              <p><strong>Classe :</strong> {detailedEntry.classe}</p>
            </div>
            <div>
              <p><strong>Date :</strong> {new Date(detailedEntry.date).toLocaleDateString('fr-FR')}</p>
              <p><strong>Durée :</strong> {detailedEntry.duree}</p>
              <p><strong>Soumis le :</strong> {new Date(detailedEntry.dateSubmission).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">THÈME</h3>
              <p className="text-gray-800">{detailedEntry.theme}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-2">OBJECTIFS PÉDAGOGIQUES</h3>
              <div className="whitespace-pre-line text-gray-800">{detailedEntry.objectifs}</div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-2">CONTENU ENSEIGNÉ</h3>
              <div 
                className="prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: detailedEntry.contenuEnseigne }} 
              />
            </div>
            
            {detailedEntry.competences && detailedEntry.competences.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">COMPÉTENCES VISÉES (APC)</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {detailedEntry.competences.map(comp => (
                    <li key={comp.id} className="text-gray-800">
                      {comp.libelle}
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${
                        comp.niveau === 'acquis' ? 'bg-green-100 text-green-800' :
                        comp.niveau === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {comp.niveau === 'acquis' ? 'Acquis' : 
                         comp.niveau === 'en_cours' ? 'En cours' : 'Non acquis'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {detailedEntry.devoirs && detailedEntry.devoirs.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">DEVOIRS DONNÉS</h3>
                {detailedEntry.devoirs.map(devoir => (
                  <div key={devoir.id} className="mb-3 p-3 bg-gray-50 rounded">
                    <p className="font-medium text-gray-900">{devoir.titre} ({devoir.type})</p>
                    <p className="text-sm text-gray-600">{devoir.description}</p>
                    <p className="text-sm text-gray-600">À rendre le : {new Date(devoir.dateRendu).toLocaleDateString('fr-FR')}</p>
                    <p className="text-sm text-gray-600">Noté sur : {devoir.notesSur}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">MÉTHODES UTILISÉES</h3>
                <p className="text-gray-800">{detailedEntry.methodesUtilisees}</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">MATÉRIELS UTILISÉS</h3>
                <p className="text-gray-800">{detailedEntry.materielsUtilises}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">OBSERVATIONS SUR LES ÉLÈVES</h3>
              <p className="text-gray-800">{detailedEntry.observationsEleves}</p>
            </div>

            {detailedEntry.difficultes && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">DIFFICULTÉS RENCONTRÉES</h3>
                <p className="text-gray-800">{detailedEntry.difficultes}</p>
              </div>
            )}

            {detailedEntry.remediation && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">REMÉDIATION PRÉVUE</h3>
                <p className="text-gray-800">{detailedEntry.remediation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Zone de commentaires */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Commentaires de validation</h3>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Ajoutez vos commentaires sur ce cahier de texte (optionnel pour validation, obligatoire pour refus)..."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => {
                setShowPreview(false);
                openValidationModal(selectedEntry, 'refuser');
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Refuser avec commentaire
            </button>
            <button
              onClick={() => {
                setShowPreview(false);
                openValidationModal(selectedEntry, 'valider');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Valider
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Validation Administrative</h2>
          <p className="text-gray-600">
            {user.role === 'directeur' ? 'Valider les cahiers de texte de votre établissement' : 
             'Approuver les cahiers validés par les directeurs'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{getTabCount('pending')}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getTabCount('validated')}</div>
              <div className="text-sm text-gray-600">Validés</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{getTabCount('rejected')}</div>
              <div className="text-sm text-gray-600">Refusés</div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectedTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'pending'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              En attente ({getTabCount('pending')})
            </button>
            <button
              onClick={() => setSelectedTab('validated')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'validated'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Validés ({getTabCount('validated')})
            </button>
            <button
              onClick={() => setSelectedTab('rejected')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'rejected'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Refusés ({getTabCount('rejected')})
            </button>
          </nav>
        </div>

        {/* Liste des entrées */}
        <div className="p-6">
          <div className="space-y-4">
            {getCurrentEntries().map((entry) => (
              <div key={entry.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{entry.enseignant}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(entry.priorite, entry.retard)}`}>
                        {getPriorityText(entry.priorite, entry.retard)}
                      </span>
                      {entry.retard && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {entry.matiere} - {entry.classe}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {entry.duree}
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-2">{entry.theme}</h3>
                    
                    <div className="text-sm text-gray-600">
                      Soumis le {new Date(entry.dateSubmission).toLocaleDateString('fr-FR')} à {new Date(entry.dateSubmission).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    {entry.commentaires && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <div className="flex items-start">
                          <MessageCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                          <p className="text-sm text-blue-800">{entry.commentaires}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedTab === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => openPreview(entry)}
                        className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
                        title="Prévisualiser"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openValidationModal(entry, 'valider')}
                        className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors"
                        title="Valider"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openValidationModal(entry, 'refuser')}
                        className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors"
                        title="Refuser"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {getCurrentEntries().length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  {selectedTab === 'pending' && <Clock className="h-12 w-12 mx-auto" />}
                  {selectedTab === 'validated' && <CheckCircle className="h-12 w-12 mx-auto" />}
                  {selectedTab === 'rejected' && <XCircle className="h-12 w-12 mx-auto" />}
                </div>
                <p className="text-gray-600">
                  {selectedTab === 'pending' && 'Aucun cahier en attente de validation'}
                  {selectedTab === 'validated' && 'Aucun cahier validé'}
                  {selectedTab === 'rejected' && 'Aucun cahier refusé'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de validation */}
      {showModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {actionType === 'valider' ? 'Confirmer la validation' : 'Confirmer le refus'}
            </h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-1">Enseignant: {selectedEntry.enseignant}</p>
              <p className="text-sm text-gray-600 mb-1">Cours: {selectedEntry.matiere} - {selectedEntry.classe}</p>
              <p className="text-sm font-medium text-gray-900">{selectedEntry.theme}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire {actionType === 'refuser' ? '(obligatoire)' : '(optionnel)'}
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder={
                  actionType === 'valider' 
                    ? "Ajoutez un commentaire positif (optionnel)"
                    : "Expliquez les raisons du refus et les améliorations attendues"
                }
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={actionType === 'refuser'}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  openPreview(selectedEntry);
                }}
                className="px-4 py-2 text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                Revoir le cahier
              </button>
              <button
                onClick={confirmerAction}
                disabled={actionType === 'refuser' && !commentaire.trim()}
                className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionType === 'valider'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionType === 'valider' ? 'Valider' : 'Refuser'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationAdmin;