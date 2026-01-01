import React, { useState } from 'react';
import { Calendar, Plus, Filter, Search, Download, Send, BookOpen, Clock, CheckCircle, AlertCircle, Eye, Users, TrendingUp, FileText, Award, X, Copy, Share2, MessageSquare } from 'lucide-react';
import CalendrierFiches from './CalendrierFiches';
import FichesList from './FichesList';
import FicheCreateForm from './FicheCreateForm';
import FicheViewer from './FicheViewer';
import FicheEditForm from './FicheEditForm';
import ValidationWorkflow from './ValidationWorkflow';
import AnalyticsPanel from './AnalyticsPanel';
import FicheDuplicator from './FicheDuplicator';
import ExportPDFOfficial from './ExportPDFOfficial';
import PrintPreview from './PrintPreview';
import ExportBulk from './ExportBulk';
import ShareFiche from './ShareFiche';
import CommentaireValidator from './CommentaireValidator';
import HistoriqueModifications from './HistoriqueModifications';
import RapportConformite from './RapportConformite';
import EnvoiDirecteurModal from './EnvoiDirecteurModal';
import DirecteurDashboard from './DirecteurDashboard';
import fichesPedagogiquesService from './services/fichesPedagogiquesService';

const FichesPedagogiquesDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('enseignant'); // 'enseignant' ou 'directeur'
  const [selectedFiche, setSelectedFiche] = useState(null);
  const [selectedAnneeScolaire, setSelectedAnneeScolaire] = useState('2024-2025');
  const [selectedTrimestre, setSelectedTrimestre] = useState('1');
  const [showDuplicator, setShowDuplicator] = useState(false);
  const [showExportPDF, setShowExportPDF] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showExportBulk, setShowExportBulk] = useState(false);
  const [showShareFiche, setShowShareFiche] = useState(false);
  const [showCommentaires, setShowCommentaires] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);
  const [showRapportConformite, setShowRapportConformite] = useState(false);
  const [showEnvoiDirecteur, setShowEnvoiDirecteur] = useState(false);
  const [filters, setFilters] = useState({
    anneeScolaire: '2024-2025',
    trimestre: '1',
    niveauScolaire: '',
    classe: '',
    matiere: '',
    statut: '',
    periode: ''
  });

  // Si l'utilisateur est directeur, afficher l'espace directeur
  if (userRole === 'directeur') {
    return <DirecteurDashboard />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
    { id: 'create', label: 'Nouvelle fiche', icon: Plus },
    { id: 'list', label: 'Mes fiches', icon: FileText },
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'validation', label: 'Validation', icon: Users },
    { id: 'analytics', label: 'Analyses', icon: Award },
    { id: 'export-bulk', label: 'Export groupé', icon: Download }
  ];

  const stats = {
    totalFiches: 124,
    enAttente: 8,
    validees: 98,
    brouillons: 18,
    conformiteAPC: 85,
    tauxValidation: 92
  };

  const anneesScolaires = [
    '2024-2025',
    '2023-2024',
    '2022-2023',
    '2021-2022'
  ];

  const trimestres = [
    { id: '1', nom: '1er Trimestre', periode: 'Sept - Déc' },
    { id: '2', nom: '2ème Trimestre', periode: 'Jan - Mars' },
    { id: '3', nom: '3ème Trimestre', periode: 'Avril - Juin' }
  ];

  const niveauxScolaires = {
    'maternelle': {
      nom: 'Maternelle',
      classes: ['Petite Section', 'Moyenne Section', 'Grande Section']
    },
    'primaire': {
      nom: 'Primaire',
      classes: ['CP', 'CE1', 'CE2', 'CM1', 'CM2']
    },
    'secondaire': {
      nom: 'Secondaire',
      classes: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle']
    }
  };

  const matieres = [
    'Mathématiques', 'Français', 'Sciences Physiques', 'SVT', 
    'Histoire-Géographie', 'Anglais', 'EPS', 'Arts Plastiques'
  ];

  const getClassesForNiveau = (niveauScolaire) => {
    return niveauxScolaires[niveauScolaire]?.classes || [];
  };

  const handleNiveauScolaireChange = (niveauScolaire) => {
    setFilters({
      ...filters,
      niveauScolaire,
      classe: '' // Reset classe when niveau changes
    });
  };

  const handleEnvoyerDirecteur = async (ficheId, commentaire) => {
    try {
      await fichesPedagogiquesService.envoyerPourValidation(ficheId, commentaire);
      
      // Notification de succès
      alert('✅ Fiche envoyée au directeur avec succès !\n\nUne notification WhatsApp a été envoyée au directeur. Vous recevrez une réponse sous 48h maximum.');
      
      setShowEnvoiDirecteur(false);
      
    } catch (error) {
      console.error('Erreur envoi directeur:', error);
      alert('❌ Erreur lors de l\'envoi de la fiche au directeur');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return (
          <FicheCreateForm 
            onCancel={() => setActiveTab('dashboard')}
            onSave={() => setActiveTab('dashboard')}
            niveauxScolaires={niveauxScolaires}
          />
        );
      case 'edit':
        return (
          <FicheEditForm 
            fiche={selectedFiche}
            onCancel={() => setActiveTab('dashboard')}
            onSave={() => setActiveTab('dashboard')}
            niveauxScolaires={niveauxScolaires}
          />
        );
      case 'view':
        return (
          <FicheViewer 
            fiche={selectedFiche}
            onEdit={() => setActiveTab('edit')}
            onClose={() => setActiveTab('dashboard')}
          />
        );
      case 'list':
        return (
          <FichesList 
            filters={filters}
            niveauxScolaires={niveauxScolaires}
            onSelectFiche={(fiche) => {
              setSelectedFiche(fiche);
              setActiveTab('view');
            }}
            onEditFiche={(fiche) => {
              setSelectedFiche(fiche);
              setActiveTab('edit');
            }}
          />
        );
      case 'validation':
        return (
          <ValidationWorkflow 
            onClose={() => setActiveTab('dashboard')}
          />
        );
      case 'analytics':
        return (
          <AnalyticsPanel 
            onClose={() => setActiveTab('dashboard')}
          />
        );
      case 'export-bulk':
        return (
          <ExportBulk 
            fiches={[
              { id: 1, titre: "Les fractions - SA 3", matiere: "Mathématiques", classe: "6ème", statut: "validee", date: "2025-01-15", enseignant: "M. KOUASSI" },
              { id: 2, titre: "La conjugaison - SA 2", matiere: "Français", classe: "5ème", statut: "en_attente", date: "2025-01-14", enseignant: "Mme ADJOVI" },
              { id: 3, titre: "Les états de la matière", matiere: "Sciences Physiques", classe: "4ème", statut: "corrigee", date: "2025-01-13", enseignant: "M. DOSSOU" }
            ]}
            onBulkExport={(data) => {
              console.log('Export groupé:', data);
              setActiveTab('dashboard');
            }}
          />
        );
      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
                Retour au tableau de bord
              </button>
              <h2 className="text-xl font-semibold">Vue Calendrier</h2>
            </div>
            
            <CalendrierFiches
              fiches={[
                { id: 1, titre: "Les fractions - SA 3", matiere: "Mathématiques", classe: "6ème", statut: "validee", date: "2025-01-20", enseignant: "M. KOUASSI", duree: "55" },
                { id: 2, titre: "La conjugaison - SA 2", matiere: "Français", classe: "5ème", statut: "en_attente", date: "2025-01-21", enseignant: "Mme ADJOVI", duree: "45" },
                { id: 3, titre: "Les états de la matière", matiere: "Sciences Physiques", classe: "4ème", statut: "corrigee", date: "2025-01-22", enseignant: "M. DOSSOU", duree: "60" }
              ]}
              onSelectDate={(date) => {
                console.log('Date sélectionnée:', date);
              }}
              onCreateFiche={(date) => {
                console.log('Créer fiche pour:', date);
                setActiveTab('create');
              }}
              onViewFiche={(fiche) => {
                setSelectedFiche(fiche);
                setActiveTab('view');
              }}
              onEditFiche={(fiche) => {
                setSelectedFiche(fiche);
                setActiveTab('edit');
              }}
            />
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-6 h-6" />
            <span className="text-sm opacity-90">Total</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalFiches}</div>
          <div className="text-sm opacity-90">fiches créées</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-6 h-6" />
            <span className="text-sm opacity-90">En attente</span>
          </div>
          <div className="text-3xl font-bold">{stats.enAttente}</div>
          <div className="text-sm opacity-90">à valider</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-6 h-6" />
            <span className="text-sm opacity-90">Validées</span>
          </div>
          <div className="text-3xl font-bold">{stats.validees}</div>
          <div className="text-sm opacity-90">approuvées</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-6 h-6" />
            <span className="text-sm opacity-90">Brouillons</span>
          </div>
          <div className="text-3xl font-bold">{stats.brouillons}</div>
          <div className="text-sm opacity-90">en cours</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-6 h-6" />
            <span className="text-sm opacity-90">Conformité APC</span>
          </div>
          <div className="text-3xl font-bold">{stats.conformiteAPC}%</div>
          <div className="text-sm opacity-90">score moyen</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="text-sm opacity-90">Taux validation</span>
          </div>
          <div className="text-3xl font-bold">{stats.tauxValidation}%</div>
          <div className="text-sm opacity-90">acceptées</div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={() => {
              const ficheExemple = {
                id: 1,
                titre: "Les fractions - Addition et soustraction",
                saNumero: "SA 3",
                sequenceNumero: "Séquence 2",
                date: "2025-01-20",
                cours: "Mathématiques",
                duree: "55",
                classe: "6ème",
                matiere: "Mathématiques",
                enseignant: "M. KOUASSI Jean"
              };
              setSelectedFiche(ficheExemple);
              setShowExportPDF(true);
            }}
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors"
          >
            <Download className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-green-900">Export PDF</h3>
            <p className="text-sm text-green-700">Exporter au format officiel</p>
          </button>
          
          <button
            onClick={() => {
              const ficheExemple = {
                id: 1,
                titre: "Les fractions - Addition et soustraction",
                saNumero: "SA 3",
                sequenceNumero: "Séquence 2",
                date: "2025-01-20",
                cours: "Mathématiques",
                duree: "55",
                classe: "6ème",
                matiere: "Mathématiques",
                enseignant: "M. KOUASSI Jean",
                statut: "brouillon"
              };
              setSelectedFiche(ficheExemple);
              setShowEnvoiDirecteur(true);
            }}
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors"
          >
            <Send className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-purple-900">Envoyer au Directeur</h3>
            <p className="text-sm text-purple-700">Soumettre pour validation</p>
          </button>
          
          <button
            onClick={() => {
              const ficheExemple = {
                id: 1,
                titre: "Les fractions - Addition et soustraction",
                saNumero: "SA 3",
                sequenceNumero: "Séquence 2",
                date: "2025-01-20",
                cours: "Mathématiques",
                duree: "55",
                classe: "6ème",
                matiere: "Mathématiques",
                enseignant: "M. KOUASSI Jean"
              };
              setSelectedFiche(ficheExemple);
              setShowShareFiche(true);
            }}
            className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors"
          >
            <Share2 className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-blue-900">Partager</h3>
            <p className="text-sm text-blue-700">Partager avec collègues</p>
          </button>
          
          <button
            onClick={() => {
              const ficheExemple = {
                id: 1,
                titre: "Les fractions - Addition et soustraction",
                saNumero: "SA 3",
                sequenceNumero: "Séquence 2",
                date: "2025-01-20",
                cours: "Mathématiques",
                duree: "55",
                classe: "6ème",
                matiere: "Mathématiques",
                enseignant: "M. KOUASSI Jean"
              };
              setSelectedFiche(ficheExemple);
              setShowRapportConformite(true);
            }}
            className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-left transition-colors"
          >
            <Award className="w-8 h-8 text-yellow-600 mb-2" />
            <h3 className="font-medium text-yellow-900">Analyse APC</h3>
            <p className="text-sm text-yellow-700">Vérifier la conformité</p>
          </button>
        </div>
      </div>

      {/* Modals et overlays */}
      {showDuplicator && selectedFiche && (
        <FicheDuplicator
          fiche={selectedFiche}
          niveauxScolaires={niveauxScolaires}
          onDuplicate={(nouvelleFiche) => {
            console.log('Fiche dupliquée:', nouvelleFiche);
            setShowDuplicator(false);
          }}
          onClose={() => setShowDuplicator(false)}
        />
      )}

      {showExportPDF && selectedFiche && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Export PDF</h3>
              <button
                onClick={() => setShowExportPDF(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ExportPDFOfficial
                fiche={selectedFiche}
                onExport={(data) => {
                  console.log('Export PDF:', data);
                  setShowExportPDF(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showPrintPreview && selectedFiche && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Aperçu avant impression</h3>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <PrintPreview
                fiche={selectedFiche}
                onPrint={(data) => {
                  console.log('Impression:', data);
                  setShowPrintPreview(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showShareFiche && selectedFiche && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Partager la fiche</h3>
              <button
                onClick={() => setShowShareFiche(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <ShareFiche
                fiche={selectedFiche}
                onShare={(data) => {
                  console.log('Partage:', data);
                  setShowShareFiche(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showCommentaires && selectedFiche && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Commentaires et validations</h3>
              <button
                onClick={() => setShowCommentaires(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <CommentaireValidator
                fiche={selectedFiche}
                commentaires={[
                  {
                    id: 1,
                    contenu: "Bonne structure générale. Pensez à diversifier les activités.",
                    type: "suggestion",
                    auteur: "Directeur ASSOGBA",
                    role: "Directeur",
                    date: "2025-01-18T14:30:00Z"
                  }
                ]}
                currentUser={{ id: 1, nom: "Utilisateur Test", role: "Enseignant" }}
                onAddComment={(comment) => console.log('Nouveau commentaire:', comment)}
                onUpdateComment={(id, data) => console.log('Commentaire modifié:', id, data)}
                onDeleteComment={(id) => console.log('Commentaire supprimé:', id)}
              />
            </div>
          </div>
        </div>
      )}

      {showHistorique && selectedFiche && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Historique des modifications</h3>
              <button
                onClick={() => setShowHistorique(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <HistoriqueModifications
                fiche={selectedFiche}
                versions={[
                  {
                    id: 1,
                    numero: "1.3",
                    action: "modification",
                    auteur: "M. KOUASSI",
                    date: "2025-01-18T14:30:00Z",
                    commentaire: "Ajout d'activités différenciées",
                    changes: { additions: 5, deletions: 2, modifications: 3 },
                    sections: ["Déroulement", "Stratégies"]
                  },
                  {
                    id: 2,
                    numero: "1.2",
                    action: "validation",
                    auteur: "Directeur ASSOGBA",
                    date: "2025-01-17T10:15:00Z",
                    commentaire: "Validation avec suggestions",
                    changes: { additions: 0, deletions: 0, modifications: 1 }
                  }
                ]}
                onRestoreVersion={(version) => console.log('Restaurer version:', version)}
                onViewVersion={(version) => console.log('Voir version:', version)}
              />
            </div>
          </div>
        </div>
      )}

      {showRapportConformite && selectedFiche && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Rapport de conformité APC</h3>
              <button
                onClick={() => setShowRapportConformite(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <RapportConformite
                fiche={selectedFiche}
                onGenerateReport={(data) => console.log('Rapport généré:', data)}
              />
            </div>
          </div>
        </div>
      )}

      {showEnvoiDirecteur && selectedFiche && (
        <EnvoiDirecteurModal
          fiche={selectedFiche}
          onClose={() => setShowEnvoiDirecteur(false)}
          onEnvoyer={handleEnvoyerDirecteur}
        />
      )}

      {/* Fiches récentes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Fiches récentes</h2>
        <div className="space-y-3">
          {[
            { id: 1, titre: "Les fractions - SA 3", matiere: "Mathématiques", niveauScolaire: "secondaire", classe: "6ème", statut: "validee", date: "2025-01-15" },
            { id: 2, titre: "La conjugaison - SA 2", matiere: "Français", niveauScolaire: "secondaire", classe: "5ème", statut: "en_attente", date: "2025-01-14" },
            { id: 3, titre: "Les états de la matière", matiere: "Sciences Physiques", niveauScolaire: "secondaire", classe: "4ème", statut: "corrigee", date: "2025-01-13" }
          ].map(fiche => (
            <div key={fiche.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex-1">
                <h3 className="font-medium">{fiche.titre}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>{fiche.matiere}</span>
                  <span>{niveauxScolaires[fiche.niveauScolaire]?.nom} - {fiche.classe}</span>
                  <span>{fiche.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  fiche.statut === 'validee' ? 'bg-green-100 text-green-800' :
                  fiche.statut === 'en_attente' ? 'bg-orange-100 text-orange-800' :
                  fiche.statut === 'corrigee' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {fiche.statut === 'validee' ? 'Validée' :
                   fiche.statut === 'en_attente' ? 'En attente' :
                   fiche.statut === 'corrigee' ? 'À corriger' : 'Brouillon'}
                </span>
                <button 
                  onClick={() => {
                    setSelectedFiche(fiche);
                    setActiveTab('view');
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedFiche(fiche);
                    setShowEnvoiDirecteur(true);
                  }}
                  className="text-purple-600 hover:text-purple-800"
                  title="Envoyer au directeur"
                >
                  <Send className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedFiche(fiche);
                    setShowCommentaires(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="Commentaires"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedFiche(fiche);
                    setShowHistorique(true);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                  title="Historique"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedFiche(fiche);
                    setShowPrintPreview(true);
                  }}
                  className="text-green-600 hover:text-green-800"
                  title="Aperçu impression"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedFiche(fiche);
                    setShowDuplicator(true);
                  }}
                  className="text-green-600 hover:text-green-800"
                  title="Dupliquer"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedFiche(fiche);
                    setShowExportPDF(true);
                  }}
                  className="text-purple-600 hover:text-purple-800"
                  title="Export PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedFiche(fiche);
                    setShowShareFiche(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-800"
                  title="Partager"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec sélecteurs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Fiches Pédagogiques</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mode:</span>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="enseignant">👨‍🏫 Enseignant</option>
                  <option value="directeur">👨‍💼 Directeur</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedAnneeScolaire}
                  onChange={(e) => {
                    setSelectedAnneeScolaire(e.target.value);
                    setFilters({...filters, anneeScolaire: e.target.value});
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {anneesScolaires.map(annee => (
                    <option key={annee} value={annee}>{annee}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <select
                  value={selectedTrimestre}
                  onChange={(e) => {
                    setSelectedTrimestre(e.target.value);
                    setFilters({...filters, trimestre: e.target.value});
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {trimestres.map(trimestre => (
                    <option key={trimestre.id} value={trimestre.id}>
                      {trimestre.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default FichesPedagogiquesDashboard;