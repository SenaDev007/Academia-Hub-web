import React, { useState } from 'react';
import { Eye, Edit3, Download, Share2, Send, MessageSquare, CheckCircle, X, Clock, User } from 'lucide-react';
import EnvoiDirecteurModal from './EnvoiDirecteurModal';
import fichesPedagogiquesService from './services/fichesPedagogiquesService';

const FicheViewer = ({ fiche, onEdit, onClose }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showEnvoiDirecteur, setShowEnvoiDirecteur] = useState(false);
  const [ficheData, setFicheData] = useState(fiche);

  // Données exemple pour la fiche
  const ficheExemple = fiche || {
    anneeScolaire: '2024-2025',
    trimestre: '1',
    id: 1,
    titre: "Les fractions - Addition et soustraction",
    saNumero: "SA 3",
    sequenceNumero: "Séquence 2",
    date: "2025-01-20",
    cours: "Mathématiques",
    duree: "55",
    niveauScolaire: "secondaire",
    classe: "6ème",
    matiere: "Mathématiques",
    enseignant: "M. KOUASSI Jean",
    etablissement: "CEG Sainte-Marie",
    statut: "en_attente",
    
    competences: [
      { type: "disciplinaire", description: "Effectuer des opérations sur les fractions" },
      { type: "methodologique", description: "Utiliser des stratégies de calcul mental" }
    ],
    objectifsSpecifiques: [
      { description: "À la fin de cette séance, l'élève sera capable d'additionner deux fractions de même dénominateur" },
      { description: "À la fin de cette séance, l'élève sera capable de soustraire deux fractions de même dénominateur" }
    ],
    prerequis: [
      { description: "Notion de fraction" },
      { description: "Égalité de fractions" }
    ],
    materielDidactique: [
      { nom: "Tableau", quantite: "1" },
      { nom: "Craies colorées", quantite: "3" },
      { nom: "Cahiers d'exercices", quantite: "1 par élève" }
    ],
    strategiesEnseignement: [
      { nom: "Méthode interrogative", description: "Questions-réponses pour faire découvrir" },
      { nom: "Travail individuel", description: "Exercices d'application" }
    ],
    deroulement: {
      preliminaires: {
        consignes: "Appel des élèves, vérification du matériel, rappel de la séance précédente sur les fractions",
        resultats: "Élèves présents et attentifs, matériel disponible, prérequis activés",
        duree: 5
      },
      introduction: {
        consignes: "Présenter une situation concrète : partage d'une pizza en parts égales",
        resultats: "Élèves motivés et comprennent le lien avec les fractions",
        duree: 10
      },
      realisation: {
        consignes: "Démonstration au tableau, exercices guidés puis individuels",
        resultats: "Élèves maîtrisent l'addition et la soustraction de fractions de même dénominateur",
        duree: 35
      },
      retour: {
        consignes: "Synthèse des acquis, exercices de consolidation pour la maison",
        resultats: "Objectifs atteints, devoirs donnés",
        duree: 5
      }
    },
    
    commentaires: [
      {
        id: 1,
        auteur: "Directeur ASSOGBA",
        role: "Directeur",
        date: "2025-01-18 14:30",
        contenu: "Bonne structure générale. Cependant, la phase de réalisation semble trop longue. Pensez à diversifier les activités.",
        type: "suggestion"
      },
      {
        id: 2,
        auteur: "Directeur ASSOGBA",
        role: "Directeur", 
        date: "2025-01-18 14:35",
        contenu: "Ajoutez des activités différenciées pour les élèves en difficulté.",
        type: "correction"
      }
    ]
  };

  const getStatutBadge = (statut) => {
    const badges = {
      brouillon: { color: 'bg-gray-100 text-gray-800', text: 'Brouillon' },
      en_attente: { color: 'bg-orange-100 text-orange-800', text: 'En attente de validation' },
      validee: { color: 'bg-green-100 text-green-800', text: 'Validée' },
      corrigee: { color: 'bg-red-100 text-red-800', text: 'À corriger' }
    };
    
    return badges[statut] || badges.brouillon;
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      // Ici on enverrait le commentaire
      console.log('Nouveau commentaire:', newComment);
      setNewComment('');
    }
  };

  const handleEnvoyerDirecteur = async (ficheId, commentaire) => {
    try {
      const ficheUpdated = await fichesPedagogiquesService.envoyerPourValidation(ficheId, commentaire);
      setFicheData(ficheUpdated);
      
      // Notification de succès
      alert('✅ Fiche envoyée au directeur avec succès !\n\nUne notification WhatsApp a été envoyée au directeur. Vous recevrez une réponse sous 48h maximum.');
      
    } catch (error) {
      console.error('Erreur envoi directeur:', error);
      alert('❌ Erreur lors de l\'envoi de la fiche au directeur');
    }
  };
  const renderEnTete = () => (
    <div className="bg-white border border-gray-300 p-6 mb-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">FICHE PÉDAGOGIQUE</h1>
        <div className="text-sm mt-2">
          République du Bénin - Ministère de l'Enseignement Maternel et Primaire
        </div>
        <div className="text-sm mt-1">
          Année scolaire: {(ficheData || ficheExemple).anneeScolaire} - 
          {(ficheData || ficheExemple).trimestre === '1' ? ' 1er Trimestre' :
           (ficheData || ficheExemple).trimestre === '2' ? ' 2ème Trimestre' : ' 3ème Trimestre'}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6 text-sm">
        <div className="space-y-2">
          <div className="flex">
            <span className="font-medium w-20">SA N° :</span>
            <span className="border-b border-black flex-1 px-2">{(ficheData || ficheExemple).saNumero}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20">Date :</span>
            <span className="border-b border-black flex-1 px-2">{(ficheData || ficheExemple).date}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20">Durée :</span>
            <span className="border-b border-black flex-1 px-2">{(ficheData || ficheExemple).duree} min</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex">
            <span className="font-medium w-24">SÉQUENCE N° :</span>
            <span className="border-b border-black flex-1 px-2">{(ficheData || ficheExemple).sequenceNumero}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-24">Cours :</span>
            <span className="border-b border-black flex-1 px-2">{(ficheData || ficheExemple).cours}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex">
            <span className="font-medium w-16">Classe :</span>
            <span className="border-b border-black flex-1 px-2">{(ficheData || ficheExemple).classe}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-16">Enseignant :</span>
            <span className="border-b border-black flex-1 px-2">{(ficheData || ficheExemple).enseignant}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <div className="font-bold text-lg">TITRE :</div>
        <div className="border border-black p-3 mt-2 min-h-[60px] flex items-center justify-center">
          {(ficheData || ficheExemple).titre}
        </div>
      </div>
    </div>
  );

  const renderElementsPlanification = () => (
    <div className="bg-white border border-gray-300 p-6 mb-6">
      <h2 className="text-lg font-bold text-center mb-6">I - ÉLÉMENTS DE PLANIFICATION</h2>
      
      <div className="space-y-6">
        {/* Compétences */}
        <div>
          <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">1. Compétences</h3>
          <div className="space-y-2">
            {(ficheData || ficheExemple).competences.map((comp, index) => (
              <div key={index} className="flex">
                <span className="font-medium w-32 text-sm">{comp.type} :</span>
                <span className="flex-1 text-sm">{comp.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Objectifs spécifiques */}
        <div>
          <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">2. Objectifs spécifiques</h3>
          <div className="space-y-1">
            {(ficheData || ficheExemple).objectifsSpecifiques.map((obj, index) => (
              <div key={index} className="text-sm">• {obj.description}</div>
            ))}
          </div>
        </div>

        {/* Prérequis */}
        <div>
          <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">3. Prérequis</h3>
          <div className="space-y-1">
            {(ficheData || ficheExemple).prerequis.map((req, index) => (
              <div key={index} className="text-sm">• {req.description}</div>
            ))}
          </div>
        </div>

        {/* Matériel didactique */}
        <div>
          <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">4. Matériel didactique</h3>
          <div className="grid grid-cols-2 gap-4">
            {(ficheData || ficheExemple).materielDidactique.map((mat, index) => (
              <div key={index} className="flex text-sm">
                <span className="flex-1">{mat.nom}</span>
                <span className="text-gray-600">({mat.quantite})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stratégies d'enseignement */}
        <div>
          <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">5. Stratégies d'enseignement</h3>
          <div className="space-y-2">
            {(ficheData || ficheExemple).strategiesEnseignement.map((strat, index) => (
              <div key={index}>
                <div className="font-medium text-sm">{strat.nom}</div>
                <div className="text-sm text-gray-700 ml-4">{strat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeroulement = () => (
    <div className="bg-white border border-gray-300 p-6 mb-6">
      <h2 className="text-lg font-bold text-center mb-6">II - DÉROULEMENT</h2>
      
      <div className="border border-gray-400">
        <div className="bg-gray-100 grid grid-cols-12 border-b border-gray-400">
          <div className="col-span-1 p-3 border-r border-gray-400 font-semibold text-center">N°</div>
          <div className="col-span-6 p-3 border-r border-gray-400 font-semibold text-center">Consignes</div>
          <div className="col-span-5 p-3 font-semibold text-center">Résultats attendus</div>
        </div>
        
        {Object.entries((ficheData || ficheExemple).deroulement).map(([phase, data], index) => (
          <div key={phase} className="grid grid-cols-12 border-b border-gray-400 last:border-b-0">
            <div className="col-span-1 p-3 border-r border-gray-400 text-center bg-gray-50">
              <div className="font-semibold">{index + 1}</div>
              <div className="text-xs text-gray-600 mt-1">{data.duree}min</div>
            </div>
            <div className="col-span-6 p-3 border-r border-gray-400">
              <div className="font-semibold text-sm mb-2 capitalize">{phase}</div>
              <div className="text-sm text-justify">{data.consignes}</div>
            </div>
            <div className="col-span-5 p-3">
              <div className="text-sm text-justify">{data.resultats}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{(ficheData || ficheExemple).titre}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutBadge((ficheData || ficheExemple).statut).color}`}>
                {getStatutBadge((ficheData || ficheExemple).statut).text}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <MessageSquare className="w-4 h-4" />
                Commentaires ({(ficheData || ficheExemple).commentaires.length})
              </button>
              
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit3 className="w-4 h-4" />
                Modifier
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              
              {((ficheData || ficheExemple).statut === 'brouillon' || (ficheData || ficheExemple).statut === 'corrigee') && (
                <button 
                  onClick={() => setShowEnvoiDirecteur(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                  Envoyer au Directeur
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Contenu principal */}
          <div className={`transition-all duration-300 ${showComments ? 'w-2/3' : 'w-full'}`}>
            {renderEnTete()}
            {renderElementsPlanification()}
            {renderDeroulement()}
          </div>

          {/* Panel des commentaires */}
          {showComments && (
            <div className="w-1/3 bg-white rounded-lg shadow-lg h-fit">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold">Commentaires et Corrections</h3>
              </div>
              
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {(ficheData || ficheExemple).commentaires.map(comment => (
                  <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-sm">{comment.auteur}</span>
                      <span className="text-xs text-gray-500">({comment.role})</span>
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{comment.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.contenu}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      comment.type === 'correction' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {comment.type === 'correction' ? 'Correction' : 'Suggestion'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  rows="3"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim()}
                  className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Envoyer le commentaire
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal d'envoi au directeur */}
        {showEnvoiDirecteur && (
          <EnvoiDirecteurModal
            fiche={ficheData || ficheExemple}
            onClose={() => setShowEnvoiDirecteur(false)}
            onEnvoyer={handleEnvoyerDirecteur}
          />
        )}
      </div>
    </div>
  );
};

export default FicheViewer;