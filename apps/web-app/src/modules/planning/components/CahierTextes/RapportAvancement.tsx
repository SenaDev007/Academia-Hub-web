import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, Users, BookOpen, Target } from 'lucide-react';
import CahierTexteService from './services/CahierTexteService';
import NotificationService from './services/NotificationService';

interface User {
  id: string;
  name: string;
  role: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur';
  matieres?: string[];
  classes?: string[];
}

interface RapportAvancementProps {
  user: User;
}

interface StatistiqueMatiere {
  matiere: string;
  enseignant: string;
  classe: string;
  heuresPrevues: number;
  heuresEffectives: number;
  pourcentageAvancement: number;
  coursValides: number;
  coursEnAttente: number;
  dernierCours: string;
}

interface StatistiqueEnseignant {
  enseignant: string;
  totalHeures: number;
  coursValides: number;
  coursEnAttente: number;
  retardSaisie: number;
  performance: number;
}

const RapportAvancement: React.FC<RapportAvancementProps> = ({ user }) => {
  const [periodeSelectionnee, setPeriodeSelectionnee] = useState('trimestre_1');
  const [typeRapport, setTypeRapport] = useState<'matiere' | 'enseignant' | 'classe'>('matiere');

  // Données simulées
  const statistiquesMatiere: StatistiqueMatiere[] = [
    {
      matiere: 'Mathématiques',
      enseignant: 'Prof. Marie AGBODJAN',
      classe: '6èmeA',
      heuresPrevues: 80,
      heuresEffectives: 64,
      pourcentageAvancement: 80,
      coursValides: 22,
      coursEnAttente: 3,
      dernierCours: '2025-01-20'
    },
    {
      matiere: 'Français',
      enseignant: 'Prof. Jean KOUDJO',
      classe: '5èmeB',
      heuresPrevues: 75,
      heuresEffectives: 58,
      pourcentageAvancement: 77,
      coursValides: 18,
      coursEnAttente: 5,
      dernierCours: '2025-01-19'
    },
    {
      matiere: 'Histoire',
      enseignant: 'Prof. Célestine ZOMAHOUN',
      classe: '4èmeC',
      heuresPrevues: 60,
      heuresEffectives: 52,
      pourcentageAvancement: 87,
      coursValides: 20,
      coursEnAttente: 2,
      dernierCours: '2025-01-18'
    },
    {
      matiere: 'Physique',
      enseignant: 'Prof. Marie AGBODJAN',
      classe: '5èmeB',
      heuresPrevues: 45,
      heuresEffectives: 32,
      pourcentageAvancement: 71,
      coursValides: 12,
      coursEnAttente: 4,
      dernierCours: '2025-01-17'
    }
  ];

  const statistiquesEnseignant: StatistiqueEnseignant[] = [
    {
      enseignant: 'Prof. Marie AGBODJAN',
      totalHeures: 96,
      coursValides: 34,
      coursEnAttente: 7,
      retardSaisie: 1,
      performance: 85
    },
    {
      enseignant: 'Prof. Jean KOUDJO',
      totalHeures: 58,
      coursValides: 18,
      coursEnAttente: 5,
      retardSaisie: 3,
      performance: 75
    },
    {
      enseignant: 'Prof. Célestine ZOMAHOUN',
      totalHeures: 52,
      coursValides: 20,
      coursEnAttente: 2,
      retardSaisie: 0,
      performance: 92
    }
  ];

  const periodes = [
    { value: 'trimestre_1', label: '1er Trimestre 2024-2025' },
    { value: 'trimestre_2', label: '2ème Trimestre 2024-2025' },
    { value: 'trimestre_3', label: '3ème Trimestre 2024-2025' },
    { value: 'annee', label: 'Année complète 2024-2025' }
  ];

  const getPerformanceColor = (performance: number) => {
    if (performance >= 85) return 'text-green-600 bg-green-100';
    if (performance >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAvancementColor = (pourcentage: number) => {
    if (pourcentage >= 80) return 'bg-green-500';
    if (pourcentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const exporterRapport = async () => {
    try {
      NotificationService.showInfo('Génération du rapport PDF en cours...');
      
      const rapportData = {
        type: typeRapport,
        periode: periodeSelectionnee,
        statistiquesMatiere: typeRapport === 'matiere' ? statistiquesMatiere : null,
        statistiquesEnseignant: typeRapport === 'enseignant' ? statistiquesEnseignant : null,
        statsGlobales,
        dateGeneration: new Date().toISOString(),
        generePar: user.name
      };
      
      const blob = await CahierTexteService.exporterPDF(rapportData, 'rapport');
      
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `rapport_avancement_${typeRapport}_${periodeSelectionnee}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      NotificationService.showSuccess('Rapport PDF généré et téléchargé avec succès');
    } catch (error) {
      NotificationService.showError('Erreur lors de la génération du rapport');
      console.error('Erreur export rapport:', error);
    }
  };

  const calculerStatistiquesGlobales = () => {
    const totalHeuresPrevues = statistiquesMatiere.reduce((acc, stat) => acc + stat.heuresPrevues, 0);
    const totalHeuresEffectives = statistiquesMatiere.reduce((acc, stat) => acc + stat.heuresEffectives, 0);
    const totalCoursValides = statistiquesMatiere.reduce((acc, stat) => acc + stat.coursValides, 0);
    const totalCoursEnAttente = statistiquesMatiere.reduce((acc, stat) => acc + stat.coursEnAttente, 0);
    
    return {
      totalHeuresPrevues,
      totalHeuresEffectives,
      pourcentageGlobal: Math.round((totalHeuresEffectives / totalHeuresPrevues) * 100),
      totalCoursValides,
      totalCoursEnAttente,
      totalCours: totalCoursValides + totalCoursEnAttente
    };
  };

  const statsGlobales = calculerStatistiquesGlobales();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rapports et Statistiques</h2>
          <p className="text-gray-600">Suivi de l'avancement pédagogique et conformité réglementaire</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={periodeSelectionnee}
            onChange={(e) => setPeriodeSelectionnee(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {periodes.map(periode => (
              <option key={periode.value} value={periode.value}>{periode.label}</option>
            ))}
          </select>
          <button
            onClick={exporterRapport}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avancement global</p>
              <p className="text-2xl font-bold text-gray-900">{statsGlobales.pourcentageGlobal}%</p>
              <p className="text-sm text-gray-600">{statsGlobales.totalHeuresEffectives}h / {statsGlobales.totalHeuresPrevues}h</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getAvancementColor(statsGlobales.pourcentageGlobal)}`}
                style={{ width: `${statsGlobales.pourcentageGlobal}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cours validés</p>
              <p className="text-2xl font-bold text-gray-900">{statsGlobales.totalCoursValides}</p>
              <p className="text-sm text-gray-600">sur {statsGlobales.totalCours} cours</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{statsGlobales.totalCoursEnAttente}</p>
              <p className="text-sm text-gray-600">à valider</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Enseignants</p>
              <p className="text-2xl font-bold text-gray-900">{statistiquesEnseignant.length}</p>
              <p className="text-sm text-gray-600">actifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sélecteur de type de rapport */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setTypeRapport('matiere')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                typeRapport === 'matiere'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4 inline mr-2" />
              Par Matière
            </button>
            <button
              onClick={() => setTypeRapport('enseignant')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                typeRapport === 'enseignant'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Par Enseignant
            </button>
            <button
              onClick={() => setTypeRapport('classe')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                typeRapport === 'classe'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Par Classe
            </button>
          </nav>
        </div>

        <div className="p-6">
          {typeRapport === 'matiere' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matière / Classe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avancement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heures
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernier cours
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistiquesMatiere.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{stat.matiere}</div>
                        <div className="text-sm text-gray-500">{stat.classe}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.enseignant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${getAvancementColor(stat.pourcentageAvancement)}`}
                              style={{ width: `${stat.pourcentageAvancement}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{stat.pourcentageAvancement}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.heuresEffectives}h / {stat.heuresPrevues}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="text-green-600">{stat.coursValides} validés</span>
                          {stat.coursEnAttente > 0 && (
                            <span className="text-yellow-600 ml-2">{stat.coursEnAttente} en attente</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(stat.dernierCours).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {typeRapport === 'enseignant' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total heures
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cours validés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      En attente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Retards
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistiquesEnseignant.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.enseignant}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stat.totalHeures}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {stat.coursValides}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {stat.coursEnAttente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {stat.retardSaisie}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPerformanceColor(stat.performance)}`}>
                          {stat.performance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {typeRapport === 'classe' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">6èmeA</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mathématiques</span>
                    <span className="text-green-600">80%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Français</span>
                    <span className="text-yellow-600">75%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Histoire</span>
                    <span className="text-green-600">85%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">5èmeB</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Français</span>
                    <span className="text-yellow-600">77%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Physique</span>
                    <span className="text-yellow-600">71%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mathématiques</span>
                    <span className="text-green-600">82%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">4èmeC</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Histoire</span>
                    <span className="text-green-600">87%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mathématiques</span>
                    <span className="text-green-600">84%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Physique</span>
                    <span className="text-yellow-600">78%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Analyse et recommandations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            Analyse et Recommandations
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Points positifs</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  Avancement global satisfaisant (80% en moyenne)
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  Taux de validation élevé (85% des cours validés)
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                  Respect global du calendrier pédagogique
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Points d'amélioration</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                  Retards de saisie à réduire (5 cas identifiés)
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                  Harmoniser l'avancement entre les classes parallèles
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
                  Renforcer la formation APC pour certains enseignants
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RapportAvancement;