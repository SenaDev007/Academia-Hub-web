import React, { useState } from 'react';
import { Save, X, Clock, MessageSquare, Send } from 'lucide-react';
import ElementsPlanificationForm from './ElementsPlanificationForm';
import DeroulementBuilder from './DeroulementBuilder';
import EnvoiDirecteurModal from './EnvoiDirecteurModal';
import fichesPedagogiquesService from './services/fichesPedagogiquesService';

const FicheEditForm = ({ fiche, onCancel, onSave, niveauxScolaires }) => {
  const [ficheData, setFicheData] = useState(fiche || {
    anneeScolaire: '2024-2025',
    trimestre: '1',
    titre: "Les fractions - Addition et soustraction",
    saNumero: "SA 3",
    sequenceNumero: "Séquence 2",
    date: "2025-01-20",
    cours: "Mathématiques",
    duree: "55",
    niveauScolaire: "secondaire",
    classe: "6ème",
    matiere: "Mathématiques",
    competences: [
      { type: "disciplinaire", description: "Effectuer des opérations sur les fractions" }
    ],
    objectifsSpecifiques: [
      { description: "À la fin de cette séance, l'élève sera capable d'additionner deux fractions" }
    ],
    prerequis: [
      { description: "Notion de fraction" }
    ],
    materielDidactique: [
      { nom: "Tableau", quantite: "1" }
    ],
    strategiesEnseignement: [
      { nom: "Méthode interrogative", description: "Questions-réponses" }
    ],
    deroulement: {
      preliminaires: {
        consignes: "Appel des élèves, vérification du matériel",
        resultats: "Élèves présents et attentifs",
        duree: 5
      },
      introduction: {
        consignes: "Présenter une situation concrète",
        resultats: "Élèves motivés",
        duree: 10
      },
      realisation: {
        consignes: "Démonstration au tableau",
        resultats: "Élèves maîtrisent",
        duree: 35
      },
      retour: {
        consignes: "Synthèse des acquis",
        resultats: "Objectifs atteints",
        duree: 5
      }
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [showEnvoiDirecteur, setShowEnvoiDirecteur] = useState(false);

  // Auto-sauvegarde toutes les 30 secondes
  React.useEffect(() => {
    const interval = setInterval(() => {
      setAutoSaveStatus('saving');
      // Simuler la sauvegarde
      setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleDataChange = (newData) => {
    setFicheData({ ...ficheData, ...newData });
    setAutoSaveStatus('modified');
  };

  const getClassesForNiveau = (niveauScolaire) => {
    return niveauxScolaires[niveauScolaire]?.classes || [];
  };

  const handleNiveauScolaireChange = (niveauScolaire) => {
    handleDataChange({
      niveauScolaire,
      classe: '' // Reset classe when niveau changes
    });
  };

  const handleSave = () => {
    console.log('Sauvegarde de la fiche:', ficheData);
    onSave();
  };

  const handleEnvoyerDirecteur = async (ficheId, commentaire) => {
    try {
      await fichesPedagogiquesService.envoyerPourValidation(ficheId, commentaire);
      
      // Notification de succès
      alert('✅ Fiche envoyée au directeur avec succès !\n\nUne notification WhatsApp a été envoyée au directeur. Vous recevrez une réponse sous 48h maximum.');
      
      // Retourner au dashboard
      onCancel();
      
    } catch (error) {
      console.error('Erreur envoi directeur:', error);
      alert('❌ Erreur lors de l\'envoi de la fiche au directeur');
    }
  };
  const renderGeneralTab = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Année scolaire</label>
          <select
            value={ficheData.anneeScolaire}
            onChange={(e) => handleDataChange({ anneeScolaire: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2022-2023">2022-2023</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre</label>
          <select
            value={ficheData.trimestre}
            onChange={(e) => handleDataChange({ trimestre: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1">1er Trimestre (Sept - Déc)</option>
            <option value="2">2ème Trimestre (Jan - Mars)</option>
            <option value="3">3ème Trimestre (Avril - Juin)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SA N°</label>
          <input
            type="text"
            value={ficheData.saNumero}
            onChange={(e) => handleDataChange({ saNumero: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">SÉQUENCE N°</label>
          <input
            type="text"
            value={ficheData.sequenceNumero}
            onChange={(e) => handleDataChange({ sequenceNumero: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
          <input
            type="date"
            value={ficheData.date}
            onChange={(e) => handleDataChange({ date: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cours</label>
          <input
            type="text"
            value={ficheData.cours}
            onChange={(e) => handleDataChange({ cours: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Durée (minutes)</label>
          <input
            type="number"
            value={ficheData.duree}
            onChange={(e) => handleDataChange({ duree: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Niveau scolaire</label>
          <select
            value={ficheData.niveauScolaire}
            onChange={(e) => handleNiveauScolaireChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner un niveau</option>
            {Object.entries(niveauxScolaires).map(([key, niveau]) => (
              <option key={key} value={key}>{niveau.nom}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
          <select
            value={ficheData.classe}
            onChange={(e) => handleDataChange({ classe: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!ficheData.niveauScolaire}
          >
            <option value="">Sélectionner une classe</option>
            {getClassesForNiveau(ficheData.niveauScolaire).map(classe => (
              <option key={classe} value={classe}>{classe}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Matière</label>
          <select
            value={ficheData.matiere}
            onChange={(e) => handleDataChange({ matiere: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Mathématiques">Mathématiques</option>
            <option value="Français">Français</option>
            <option value="Sciences Physiques">Sciences Physiques</option>
            <option value="SVT">SVT</option>
            <option value="Histoire-Géographie">Histoire-Géographie</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TITRE</label>
          <textarea
            value={ficheData.titre}
            onChange={(e) => handleDataChange({ titre: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  const renderPlanificationTab = () => (
    <ElementsPlanificationForm
      data={ficheData}
      onChange={handleDataChange}
    />
  );

  const renderDeroulementTab = () => (
    <DeroulementBuilder
      deroulement={ficheData.deroulement}
      dureeTotal={parseInt(ficheData.duree) || 55}
      onChange={(deroulement) => handleDataChange({ deroulement })}
    />
  );

  const tabs = [
    { id: 'general', label: 'Informations générales', content: renderGeneralTab },
    { id: 'planification', label: 'Éléments de planification', content: renderPlanificationTab },
    { id: 'deroulement', label: 'Déroulement', content: renderDeroulementTab }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Modifier la fiche pédagogique</h1>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className={`${
                  autoSaveStatus === 'saved' ? 'text-green-600' :
                  autoSaveStatus === 'saving' ? 'text-blue-600' :
                  'text-orange-600'
                }`}>
                  {autoSaveStatus === 'saved' ? 'Sauvegardé' :
                   autoSaveStatus === 'saving' ? 'Sauvegarde...' :
                   'Non sauvegardé'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <MessageSquare className="w-4 h-4" />
                Commentaires (2)
              </button>
              
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Sauvegarder
              </button>
              
              {(ficheData.statut === 'brouillon' || ficheData.statut === 'corrigee') && (
                <button 
                  onClick={() => setShowEnvoiDirecteur(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                  Envoyer au Directeur
                </button>
              )}
              
              <button
                onClick={onCancel}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Onglets */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu de l'onglet */}
          <div className="p-6">
            {tabs.find(tab => tab.id === activeTab)?.content()}
          </div>
        </div>
      </div>

      {/* Modal d'envoi au directeur */}
      {showEnvoiDirecteur && (
        <EnvoiDirecteurModal
          fiche={ficheData}
          onClose={() => setShowEnvoiDirecteur(false)}
          onEnvoyer={handleEnvoyerDirecteur}
        />
      )}
    </div>
  );
};

export default FicheEditForm;