import React, { useState } from 'react';
import { Award, CheckCircle, AlertTriangle, XCircle, TrendingUp, FileText, Target, Users } from 'lucide-react';

const RapportConformite = ({ fiche, onGenerateReport }) => {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Critères de conformité APC
  const criteresAPC = [
    {
      id: 'competences_types',
      nom: 'Types de compétences',
      description: 'Présence des 4 types de compétences (disciplinaires, transversales, méthodologiques, sociales)',
      poids: 20,
      obligatoire: true
    },
    {
      id: 'objectifs_mesurables',
      nom: 'Objectifs mesurables',
      description: 'Objectifs formulés avec des verbes d\'action observables et mesurables',
      poids: 15,
      obligatoire: true
    },
    {
      id: 'phases_obligatoires',
      nom: 'Phases obligatoires',
      description: 'Présence des 4 phases : Préliminaires, Introduction, Réalisation, Retour',
      poids: 15,
      obligatoire: true
    },
    {
      id: 'coherence_duree',
      nom: 'Cohérence des durées',
      description: 'Durées réalistes et cohérentes avec les activités prévues',
      poids: 10,
      obligatoire: false
    },
    {
      id: 'materiel_adapte',
      nom: 'Matériel adapté',
      description: 'Matériel didactique approprié et disponible',
      poids: 10,
      obligatoire: false
    },
    {
      id: 'strategies_variees',
      nom: 'Stratégies variées',
      description: 'Diversité des stratégies d\'enseignement',
      poids: 10,
      obligatoire: false
    },
    {
      id: 'evaluation_prevue',
      nom: 'Évaluation prévue',
      description: 'Modalités d\'évaluation définies et cohérentes',
      poids: 10,
      obligatoire: false
    },
    {
      id: 'differenciation',
      nom: 'Différenciation',
      description: 'Prise en compte des différents niveaux d\'élèves',
      poids: 10,
      obligatoire: false
    }
  ];

  const analyserConformite = async () => {
    setIsAnalyzing(true);
    
    // Simulation d'analyse (remplacer par vraie logique)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const resultats = criteresAPC.map(critere => {
      let score = 0;
      let commentaires = [];
      let suggestions = [];
      
      switch (critere.id) {
        case 'competences_types':
          const typesPresents = [...new Set((fiche.competences || []).map(c => c.type))];
          score = Math.min(100, (typesPresents.length / 4) * 100);
          if (score < 100) {
            const typesManquants = ['disciplinaire', 'transversale', 'methodologique', 'sociale']
              .filter(type => !typesPresents.includes(type));
            commentaires.push(`Types manquants: ${typesManquants.join(', ')}`);
            suggestions.push('Ajoutez au moins une compétence de chaque type');
          }
          break;
          
        case 'objectifs_mesurables':
          const objectifs = fiche.objectifsSpecifiques || [];
          const verbesAction = ['identifier', 'analyser', 'résoudre', 'expliquer', 'démontrer', 'calculer'];
          const objectifsMesurables = objectifs.filter(obj => 
            verbesAction.some(verbe => obj.description.toLowerCase().includes(verbe))
          );
          score = objectifs.length > 0 ? (objectifsMesurables.length / objectifs.length) * 100 : 0;
          if (score < 80) {
            suggestions.push('Utilisez des verbes d\'action observables et mesurables');
          }
          break;
          
        case 'phases_obligatoires':
          const phasesObligatoires = ['preliminaires', 'introduction', 'realisation', 'retour'];
          const phasesPresentes = Object.keys(fiche.deroulement || {});
          const phasesValides = phasesObligatoires.filter(phase => 
            phasesPresentes.includes(phase) && 
            fiche.deroulement[phase]?.consignes && 
            fiche.deroulement[phase]?.resultats
          );
          score = (phasesValides.length / phasesObligatoires.length) * 100;
          if (score < 100) {
            const phasesManquantes = phasesObligatoires.filter(phase => !phasesValides.includes(phase));
            commentaires.push(`Phases incomplètes: ${phasesManquantes.join(', ')}`);
          }
          break;
          
        case 'coherence_duree':
          const dureeTotal = parseInt(fiche.duree) || 55;
          const dureePhases = Object.values(fiche.deroulement || {})
            .reduce((total, phase) => total + (phase.duree || 0), 0);
          const ecart = Math.abs(dureeTotal - dureePhases);
          score = Math.max(0, 100 - (ecart / dureeTotal) * 100);
          if (ecart > 5) {
            commentaires.push(`Écart de ${ecart} minutes entre durée prévue et phases`);
            suggestions.push('Ajustez les durées des phases pour correspondre à la durée totale');
          }
          break;
          
        default:
          score = Math.floor(Math.random() * 40) + 60; // Score aléatoire pour la démo
      }
      
      return {
        critere: critere.id,
        score: Math.round(score),
        statut: score >= 80 ? 'excellent' : score >= 60 ? 'satisfaisant' : score >= 40 ? 'ameliorer' : 'insuffisant',
        commentaires,
        suggestions
      };
    });
    
    const scoreGlobal = resultats.reduce((total, result, index) => {
      return total + (result.score * criteresAPC[index].poids / 100);
    }, 0);
    
    setAnalysisResult({
      scoreGlobal: Math.round(scoreGlobal),
      resultats,
      dateAnalyse: new Date().toISOString(),
      recommandations: genererRecommandations(resultats)
    });
    
    setIsAnalyzing(false);
  };

  const genererRecommandations = (resultats) => {
    const recommandations = [];
    
    resultats.forEach((result, index) => {
      const critere = criteresAPC[index];
      if (result.score < 60 && critere.obligatoire) {
        recommandations.push({
          priorite: 'haute',
          message: `${critere.nom}: ${result.suggestions[0] || 'Amélioration nécessaire'}`,
          critere: critere.id
        });
      } else if (result.score < 80) {
        recommandations.push({
          priorite: 'moyenne',
          message: `${critere.nom}: ${result.suggestions[0] || 'Peut être amélioré'}`,
          critere: critere.id
        });
      }
    });
    
    return recommandations;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case 'excellent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'satisfaisant':
        return <CheckCircle className="w-5 h-5 text-yellow-500" />;
      case 'ameliorer':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'insuffisant':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPrioriteColor = (priorite) => {
    switch (priorite) {
      case 'haute':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moyenne':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'basse':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="w-5 h-5" />
          Rapport de Conformité APC
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={analyserConformite}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyse en cours...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Analyser la conformité
              </>
            )}
          </button>
          
          {analysisResult && (
            <button
              onClick={() => onGenerateReport(analysisResult)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FileText className="w-4 h-4" />
              Générer le rapport
            </button>
          )}
        </div>
      </div>

      {!analysisResult && !isAnalyzing && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Analyse de conformité APC</h4>
          <p className="text-gray-600 mb-6">
            Évaluez la conformité de cette fiche pédagogique aux standards de l'Approche Par Compétences
          </p>
          <button
            onClick={analyserConformite}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Lancer l'analyse
          </button>
        </div>
      )}

      {analysisResult && (
        <div className="space-y-6">
          {/* Score global */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Score de conformité global</h4>
              <span className="text-sm text-gray-500">
                Analysé le {new Date(analysisResult.dateAnalyse).toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${getScoreBg(analysisResult.scoreGlobal)}`}>
                <span className={getScoreColor(analysisResult.scoreGlobal)}>
                  {analysisResult.scoreGlobal}%
                </span>
              </div>
              
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      analysisResult.scoreGlobal >= 80 ? 'bg-green-500' :
                      analysisResult.scoreGlobal >= 60 ? 'bg-yellow-500' :
                      analysisResult.scoreGlobal >= 40 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analysisResult.scoreGlobal}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {analysisResult.scoreGlobal >= 80 ? 'Excellente conformité APC' :
                   analysisResult.scoreGlobal >= 60 ? 'Conformité satisfaisante' :
                   analysisResult.scoreGlobal >= 40 ? 'Conformité à améliorer' : 'Conformité insuffisante'}
                </div>
              </div>
            </div>
          </div>

          {/* Détail par critère */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Analyse détaillée par critère</h4>
            
            <div className="space-y-4">
              {analysisResult.resultats.map((result, index) => {
                const critere = criteresAPC[index];
                
                return (
                  <div key={critere.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatutIcon(result.statut)}
                        <div>
                          <h5 className="font-medium">{critere.nom}</h5>
                          <p className="text-sm text-gray-600">{critere.description}</p>
                        </div>
                        {critere.obligatoire && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Obligatoire
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Poids: {critere.poids}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          result.score >= 80 ? 'bg-green-500' :
                          result.score >= 60 ? 'bg-yellow-500' :
                          result.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                    
                    {result.commentaires.length > 0 && (
                      <div className="mb-2">
                        <div className="text-sm font-medium text-gray-700 mb-1">Observations :</div>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {result.commentaires.map((commentaire, idx) => (
                            <li key={idx}>{commentaire}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.suggestions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Suggestions :</div>
                        <ul className="text-sm text-blue-600 list-disc list-inside">
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommandations */}
          {analysisResult.recommandations.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recommandations d'amélioration
              </h4>
              
              <div className="space-y-3">
                {analysisResult.recommandations.map((rec, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${getPrioriteColor(rec.priorite)}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-sm">
                        {rec.priorite === 'haute' ? '🔴' : rec.priorite === 'moyenne' ? '🟡' : '🔵'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                          Priorité {rec.priorite}
                        </div>
                        <div className="text-sm">{rec.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions recommandées */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Prochaines étapes</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {analysisResult.scoreGlobal < 60 ? (
                <>
                  <p>• Corrigez les critères obligatoires insuffisants avant soumission</p>
                  <p>• Consultez un conseiller pédagogique pour assistance</p>
                  <p>• Relancez l'analyse après corrections</p>
                </>
              ) : analysisResult.scoreGlobal < 80 ? (
                <>
                  <p>• Améliorez les points faibles identifiés</p>
                  <p>• La fiche peut être soumise mais des améliorations sont recommandées</p>
                  <p>• Consultez les suggestions pour optimiser la qualité</p>
                </>
              ) : (
                <>
                  <p>• Excellente conformité ! La fiche est prête pour soumission</p>
                  <p>• Vous pouvez partager cette fiche comme exemple de bonne pratique</p>
                  <p>• Continuez à maintenir ce niveau de qualité</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapportConformite;