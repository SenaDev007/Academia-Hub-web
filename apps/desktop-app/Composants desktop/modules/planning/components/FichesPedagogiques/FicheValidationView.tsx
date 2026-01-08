import React, { useState } from 'react';
import { ArrowLeft, Eye, Edit3, CheckCircle, XCircle, MessageSquare, Award, Clock, User, FileText, AlertTriangle } from 'lucide-react';

const FicheValidationView = ({ fiche, onValidate, onClose }) => {
  const [showAnalyseAPC, setShowAnalyseAPC] = useState(false);

  // Données exemple pour la fiche complète
  const ficheComplete = fiche || {
    id: 1,
    titre: "Les fractions - Addition et soustraction",
    enseignant: "M. KOUASSI Jean",
    matiere: "Mathématiques",
    classe: "6ème",
    saNumero: "SA 3",
    sequenceNumero: "Séquence 2",
    date: "2025-01-20",
    cours: "Mathématiques",
    duree: "55",
    dateEnvoi: "2025-01-18 14:30",
    commentaireEnseignant: "Première version de ma fiche sur les fractions",
    
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
    }
  };

  const analyseAPC = {
    scoreGlobal: 78,
    criteres: [
      { nom: "Types de compétences", score: 50, statut: "insuffisant", commentaire: "Manque compétences transversales et sociales" },
      { nom: "Objectifs mesurables", score: 90, statut: "excellent", commentaire: "Objectifs bien formulés avec verbes d'action" },
      { nom: "Phases obligatoires", score: 100, statut: "excellent", commentaire: "Toutes les phases présentes et complètes" },
      { nom: "Cohérence durées", score: 85, statut: "satisfaisant", commentaire: "Durées réalistes et bien réparties" },
      { nom: "Matériel adapté", score: 70, statut: "ameliorer", commentaire: "Matériel basique, pourrait être enrichi" },
      { nom: "Stratégies variées", score: 60, statut: "ameliorer", commentaire: "Peu de diversité dans les stratégies" }
    ]
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'excellent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'satisfaisant':
        return <CheckCircle className="w-4 h-4 text-yellow-500" />;
      case 'ameliorer':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'insuffisant':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
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
          Année scolaire: 2024-2025 - 1er Trimestre
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6 text-sm">
        <div className="space-y-2">
          <div className="flex">
            <span className="font-medium w-20">SA N° :</span>
            <span className="border-b border-black flex-1 px-2">{ficheComplete.saNumero}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20">Date :</span>
            <span className="border-b border-black flex-1 px-2">{ficheComplete.date}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-20">Durée :</span>
            <span className="border-b border-black flex-1 px-2">{ficheComplete.duree} min</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex">
            <span className="font-medium w-24">SÉQUENCE N° :</span>
            <span className="border-b border-black flex-1 px-2">{ficheComplete.sequenceNumero}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-24">Cours :</span>
            <span className="border-b border-black flex-1 px-2">{ficheComplete.cours}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex">
            <span className="font-medium w-16">Classe :</span>
            <span className="border-b border-black flex-1 px-2">{ficheComplete.classe}</span>
          </div>
          <div className="flex">
            <span className="font-medium w-16">Enseignant :</span>
            <span className="border-b border-black flex-1 px-2">{ficheComplete.enseignant}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <div className="font-bold text-lg">TITRE :</div>
        <div className="border border-black p-3 mt-2 min-h-[60px] flex items-center justify-center">
          {ficheComplete.titre}
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
            {ficheComplete.competences.map((comp, index) => (
              <div key={index} className="flex">
                <span className="font-medium w-32 text-sm capitalize">{comp.type} :</span>
                <span className="flex-1 text-sm">{comp.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Objectifs spécifiques */}
        <div>
          <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">2. Objectifs spécifiques</h3>
          <div className="space-y-1">
            {ficheComplete.objectifsSpecifiques.map((obj, index) => (
              <div key={index} className="text-sm">• {obj.description}</div>
            ))}
          </div>
        </div>

        {/* Prérequis */}
        <div>
          <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">3. Prérequis</h3>
          <div className="space-y-1">
            {ficheComplete.prerequis.map((req, index) => (
              <div key={index} className="text-sm">• {req.description}</div>
            ))}
          </div>
        </div>

        {/* Matériel didactique */}
        <div>
          <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">4. Matériel didactique</h3>
          <div className="grid grid-cols-2 gap-4">
            {ficheComplete.materielDidactique.map((mat, index) => (
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
            {ficheComplete.strategiesEnseignement.map((strat, index) => (
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
        
        {Object.entries(ficheComplete.deroulement).map(([phase, data], index) => (
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

  const renderAnalyseAPC = () => (
    <div className="bg-white border border-gray-300 p-6 mb-6">
      <h2 className="text-lg font-bold text-center mb-6 flex items-center justify-center gap-2">
        <Award className="w-6 h-6 text-purple-600" />
        ANALYSE DE CONFORMITÉ APC
      </h2>
      
      {/* Score global */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(analyseAPC.scoreGlobal)}`}>
              {analyseAPC.scoreGlobal}%
            </div>
            <div className="text-sm text-gray-600">Score global</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-medium ${
              analyseAPC.scoreGlobal >= 80 ? 'text-green-600' :
              analyseAPC.scoreGlobal >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {analyseAPC.scoreGlobal >= 80 ? 'Conforme APC' :
               analyseAPC.scoreGlobal >= 70 ? 'Partiellement conforme' : 'Non conforme'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Détail par critère */}
      <div className="space-y-3">
        {analyseAPC.criteres.map((critere, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatutIcon(critere.statut)}
                <span className="font-medium">{critere.nom}</span>
              </div>
              <span className={`font-bold ${getScoreColor(critere.score)}`}>
                {critere.score}%
              </span>
            </div>
            <div className="text-sm text-gray-700">{critere.commentaire}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h2 className="text-xl font-semibold">Consultation de la fiche</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalyseAPC(!showAnalyseAPC)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAnalyseAPC 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Award className="w-4 h-4" />
            {showAnalyseAPC ? 'Masquer analyse APC' : 'Voir analyse APC'}
          </button>
          
          <button
            onClick={onValidate}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit3 className="w-4 h-4" />
            Procéder à la validation
          </button>
        </div>
      </div>

      {/* Informations de réception */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">Fiche reçue de {ficheComplete.enseignant}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
          <div><span className="font-medium">Reçue le:</span> {ficheComplete.dateEnvoi}</div>
          <div><span className="font-medium">Date prévue:</span> {ficheComplete.date}</div>
          <div><span className="font-medium">Délai restant:</span> 2 jours</div>
        </div>
        {ficheComplete.commentaireEnseignant && (
          <div className="mt-3 p-3 bg-white rounded border border-blue-200">
            <div className="text-sm font-medium text-blue-900 mb-1">Message de l'enseignant:</div>
            <div className="text-sm text-blue-800 italic">"{ficheComplete.commentaireEnseignant}"</div>
          </div>
        )}
      </div>

      {/* Contenu de la fiche */}
      <div className="space-y-6">
        {renderEnTete()}
        {renderElementsPlanification()}
        {renderDeroulement()}
        {showAnalyseAPC && renderAnalyseAPC()}
      </div>
    </div>
  );
};

export default FicheValidationView;