import React, { useState } from 'react';
import { formatRang } from '../utils/formatters';
import { apiService } from '../services/api';
import { NotificationPanel } from './NotificationPanel';
import { Trophy, Award, Star, Medal, Crown, Download, Printer as Print, Users, TrendingUp, RefreshCw } from 'lucide-react';
import AcademicYearSelector from '../../../components/common/AcademicYearSelector';
import QuarterSelector from '../../../components/common/QuarterSelector';
import { useAcademicYearState } from '../../../hooks/useAcademicYearState';
import { useQuarterState } from '../../../hooks/useQuarterState';

export function TableauxHonneur() {
  // Hooks pour la gestion des années scolaires et trimestres
  const {
    selectedAcademicYear,
    setSelectedAcademicYear,
    currentAcademicYear,
    academicYearLoading
  } = useAcademicYearState('tableaux-honneur');

  const {
    selectedQuarter,
    setSelectedQuarter,
    currentQuarter,
    quarterLoading
  } = useQuarterState('tableaux-honneur');

  const [selectedLevel, setSelectedLevel] = useState('primaire');
  const [selectedClass, setSelectedClass] = useState('Toutes');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [isExporting, setIsExporting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const niveauxScolaires = [
    { id: 'maternelle', label: 'Maternelle' },
    { id: 'primaire', label: 'Primaire' },
    { id: '1er_cycle', label: '1er Cycle Secondaire' },
    { id: '2nd_cycle', label: '2nd Cycle Secondaire' }
  ];
  
  const classesByLevel = {
    'maternelle': ['Toutes', 'Petite Section', 'Moyenne Section', 'Grande Section'],
    'primaire': ['Toutes', 'CP', 'CE1', 'CE2', 'CM1', 'CM2-A', 'CM2-B'],
    '1er_cycle': ['Toutes', '6ème A', '6ème B', '5ème A', '5ème B', '4ème A', '3ème A'],
    '2nd_cycle': ['Toutes', '2nde A', '2nde C', '1ère A1', '1ère C', 'Terminale A1', 'Terminale C']
  };
  
  const trimestresByYear = {
    '2024-2025': ['T1', 'T2', 'T3'],
    '2023-2024': ['T1', 'T2', 'T3'],
    '2022-2023': ['T1', 'T2', 'T3']
  };

  // Données des tableaux d'honneur
  const tableauxHonneur = {
    general: [
      { rang: 1, nom: 'HOUEDE Sophie', sexe: 'F', classe: 'CM2-A', moyenne: 18.75, appreciation: 'Excellent', mentions: ['Félicitations', 'Prix d\'Excellence'] },
      { rang: 2, nom: 'ADJOVI Marie', sexe: 'F', classe: 'CM2-A', moyenne: 17.85, appreciation: 'Excellent', mentions: ['Félicitations', 'Prix Mathématiques'] },
      { rang: 3, nom: 'KONE Abdoul', sexe: 'M', classe: '6ème A', moyenne: 17.45, appreciation: 'Très Bien', mentions: ['Encouragements', 'Prix Sciences'] },
      { rang: 4, nom: 'SANTOS Lisa', sexe: 'F', classe: 'CM2-B', moyenne: 17.20, appreciation: 'Très Bien', mentions: ['Encouragements'] },
      { rang: 5, nom: 'DOSSOU Paul', sexe: 'M', classe: '6ème B', moyenne: 16.95, appreciation: 'Très Bien', mentions: ['Encouragements'] },
      { rang: 6, nom: 'AGBODJI Lucie', sexe: 'F', classe: 'CM2-A', moyenne: 16.80, appreciation: 'Très Bien', mentions: ['Encouragements'] },
      { rang: 7, nom: 'TOKO André', sexe: 'M', classe: '3ème C', moyenne: 16.65, appreciation: 'Très Bien', mentions: ['Encouragements'] },
      { rang: 8, nom: 'BASSENE Claire', sexe: 'F', classe: 'CM2-B', moyenne: 16.50, appreciation: 'Très Bien', mentions: ['Encouragements'] },
      { rang: 9, nom: 'HOUNSOU Marc', sexe: 'M', classe: '6ème A', moyenne: 16.35, appreciation: 'Très Bien', mentions: ['Encouragements'] },
      { rang: 10, nom: 'KPODEHOME Alice', sexe: 'F', classe: 'CM2-A', moyenne: 16.20, appreciation: 'Très Bien', mentions: ['Encouragements'] }
    ],
    parMatiere: {
      'Mathématiques': [
        { rang: 1, nom: 'ADJOVI Marie', sexe: 'F', classe: 'CM2-A', moyenne: 19.2, appreciation: 'Exceptionnel' },
        { rang: 2, nom: 'KONE Abdoul', sexe: 'M', classe: '6ème A', moyenne: 18.8, appreciation: 'Excellent' },
        { rang: 3, nom: 'HOUEDE Sophie', sexe: 'F', classe: 'CM2-A', moyenne: 18.5, appreciation: 'Excellent' }
      ],
      'Français': [
        { rang: 1, nom: 'HOUEDE Sophie', sexe: 'F', classe: 'CM2-A', moyenne: 18.9, appreciation: 'Exceptionnel' },
        { rang: 2, nom: 'SANTOS Lisa', sexe: 'F', classe: 'CM2-B', moyenne: 18.3, appreciation: 'Excellent' },
        { rang: 3, nom: 'AGBODJI Lucie', sexe: 'F', classe: 'CM2-A', moyenne: 17.8, appreciation: 'Excellent' }
      ],
      'Sciences': [
        { rang: 1, nom: 'KONE Abdoul', sexe: 'M', classe: '6ème A', moyenne: 19.5, appreciation: 'Exceptionnel' },
        { rang: 2, nom: 'TOKO André', sexe: 'M', classe: '3ème C', moyenne: 18.7, appreciation: 'Excellent' },
        { rang: 3, nom: 'HOUEDE Sophie', sexe: 'F', classe: 'CM2-A', moyenne: 18.2, appreciation: 'Excellent' }
      ]
    },
    parClasse: {
      'CM2-A': [
        { rang: 1, nom: 'HOUEDE Sophie', sexe: 'F', moyenne: 18.75, appreciation: 'Excellent' },
        { rang: 2, nom: 'ADJOVI Marie', sexe: 'F', moyenne: 17.85, appreciation: 'Excellent' },
        { rang: 3, nom: 'AGBODJI Lucie', sexe: 'F', moyenne: 16.80, appreciation: 'Très Bien' }
      ],
      'CM2-B': [
        { rang: 1, nom: 'SANTOS Lisa', sexe: 'F', moyenne: 17.20, appreciation: 'Très Bien' },
        { rang: 2, nom: 'BASSENE Claire', sexe: 'F', moyenne: 16.50, appreciation: 'Très Bien' },
        { rang: 3, nom: 'HOUNSOU Pierre', sexe: 'M', moyenne: 15.95, appreciation: 'Très Bien' }
      ],
      '6ème A': [
        { rang: 1, nom: 'KONE Abdoul', sexe: 'M', moyenne: 17.45, appreciation: 'Très Bien' },
        { rang: 2, nom: 'HOUNSOU Marc', sexe: 'M', moyenne: 16.35, appreciation: 'Très Bien' },
        { rang: 3, nom: 'AKPOVI Jean', sexe: 'M', moyenne: 15.80, appreciation: 'Très Bien' }
      ]
    },
    progression: [
      { nom: 'BASSENE Jean', sexe: 'M', classe: 'CM2-A', moyenneT1: 9.45, moyenneT2: 11.80, progression: '+2.35', type: 'Excellente progression' },
      { nom: 'KPODE Alice', sexe: 'F', classe: '6ème B', moyenneT1: 12.10, moyenneT2: 14.25, progression: '+2.15', type: 'Très bonne progression' },
      { nom: 'AGBO Paul', sexe: 'M', classe: 'CM2-B', moyenneT1: 10.80, moyenneT2: 12.65, progression: '+1.85', type: 'Bonne progression' }
    ]
  };

  const getMedalIcon = (rang: number) => {
    switch (rang) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-500" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-500" />;
      default:
        return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  const getMedalColor = (rang: number) => {
    switch (rang) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300';
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200';
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    
    try {
      const tableauResponse = await apiService.getTableauHonneur({
        trimestre_id: 1, // À adapter selon le trimestre sélectionné
        classe_id: selectedClass !== 'Toutes' ? 1 : undefined,
        limite: 20
      });
      
      let content = `TABLEAU D'HONNEUR - ${currentQuarter?.name || 'Trimestre'}\n\n`;
      
      if (selectedCategory === 'general') {
        content += 'CLASSEMENT GÉNÉRAL:\n';
        tableauResponse.data.forEach(eleve => {
          const rang = formatRang(eleve.rang, eleve.sexe);
          content += `${rang} ${eleve.nom} ${eleve.prenom} (${eleve.classe_nom}) - ${eleve.moyenne_generale}/20 - ${eleve.appreciation}\n`;
        });
      }
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Tableau_Honneur_${selectedCategory}_${currentQuarter?.name || 'Trimestre'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du tableau d\'honneur');
    }
    
    setIsExporting(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const getAvailableClasses = () => {
    return classesByLevel[selectedLevel as keyof typeof classesByLevel] || classesByLevel.primaire;
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Trophy className="h-7 w-7 mr-3 text-yellow-500" />
            Tableaux d'Honneur
          </h2>
          <div className="flex space-x-3">
            <button 
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? 'Export...' : 'Télécharger PDF'}
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Print className="h-4 w-4 mr-2" />
              Imprimer
            </button>
            <button 
              onClick={() => setShowNotifications(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Envoyer aux Parents
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <AcademicYearSelector
              moduleName="tableaux-honneur"
              className="w-full"
              onChange={(yearId) => {
                setSelectedAcademicYear(yearId);
                console.log('Année scolaire sélectionnée:', yearId);
              }}
            />
          </div>

          <div>
            <QuarterSelector
              moduleName="tableaux-honneur"
              className="w-full"
              academicYearId={selectedAcademicYear}
              onChange={(quarterId) => {
                setSelectedQuarter(quarterId);
                console.log('Trimestre sélectionné:', quarterId);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Niveau Scolaire</label>
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setSelectedClass('Toutes');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {niveauxScolaires.map(niveau => (
                <option key={niveau.id} value={niveau.id}>{niveau.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {getAvailableClasses().map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="general">Classement Général</option>
              <option value="matiere">Par Matière</option>
              <option value="classe">Par Classe</option>
              <option value="progression">Progression</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Crown className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">25</p>
              <p className="text-sm text-gray-600">Élèves d'Excellence</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">67</p>
              <p className="text-sm text-gray-600">Mentions</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">18.75</p>
              <p className="text-sm text-gray-600">Meilleure Moyenne</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">127</p>
              <p className="text-sm text-gray-600">Élèves Classés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu selon la catégorie sélectionnée */}
      {selectedCategory === 'general' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Trophy className="h-6 w-6 mr-2 text-yellow-600" />
              Classement Général - {currentQuarter?.name || 'Chargement...'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Top 10 des meilleurs élèves toutes classes confondues</p>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {tableauxHonneur.general.slice(0, 3).map((eleve, index) => (
                <div key={index} className={`p-6 rounded-xl border-2 ${getMedalColor(eleve.rang)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center">
                        {getMedalIcon(eleve.rang)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{eleve.nom}</h4>
                        <p className="text-sm text-gray-600">{eleve.classe}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {eleve.mentions.map((mention, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {mention}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{eleve.moyenne}/20</div>
                      <div className="text-sm text-gray-600">{eleve.appreciation}</div>
                      <div className="text-xs text-gray-500 mt-1">{formatRang(eleve.rang, eleve.sexe)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Autres élèves d'honneur</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tableauxHonneur.general.slice(3).map((eleve, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getMedalColor(eleve.rang)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-blue-600 font-bold text-xs">{formatRang(eleve.rang, eleve.sexe)}</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{eleve.nom}</h5>
                          <p className="text-xs text-gray-600">{eleve.classe}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{eleve.moyenne}</div>
                        <div className="text-xs text-gray-600">{eleve.appreciation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCategory === 'matiere' && (
        <div className="space-y-6">
          {Object.entries(tableauxHonneur.parMatiere).map(([matiere, eleves]) => (
            <div key={matiere} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  Meilleurs en {matiere}
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {eleves.map((eleve, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getMedalColor(eleve.rang)}`}>
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          {getMedalIcon(eleve.rang)}
                        </div>
                        <h4 className="font-semibold text-gray-900">{eleve.nom}</h4>
                        <p className="text-sm text-gray-600 mb-2">{eleve.classe}</p>
                        <div className="text-xl font-bold text-gray-900">{eleve.moyenne}/20</div>
                        <div className="text-sm text-gray-600">{eleve.appreciation}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatRang(eleve.rang, eleve.sexe)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCategory === 'classe' && (
        <div className="space-y-6">
          {Object.entries(tableauxHonneur.parClasse).map(([classe, eleves]) => (
            <div key={classe} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Tableau d'Honneur - {classe}
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {eleves.map((eleve, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${getMedalColor(eleve.rang)}`}>
                      <div className="text-center">
                        <div className="flex justify-center mb-2">
                          {getMedalIcon(eleve.rang)}
                        </div>
                        <h4 className="font-semibold text-gray-900">{eleve.nom}</h4>
                        <div className="text-xl font-bold text-gray-900 mt-2">{eleve.moyenne}/20</div>
                        <div className="text-sm text-gray-600">{eleve.appreciation}</div>
                        <div className="text-xs text-gray-500 mt-1">{formatRang(eleve.rang, eleve.sexe)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedCategory === 'progression' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-purple-600" />
              Prix de la Progression
            </h3>
            <p className="text-sm text-gray-600 mt-1">Élèves ayant le plus progressé entre les trimestres</p>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {tableauxHonneur.progression.map((eleve, index) => (
                <div key={index} className="p-6 rounded-xl border-2 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{eleve.nom}</h4>
                        <p className="text-sm text-gray-600">{eleve.classe}</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                          {eleve.type}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="text-sm text-gray-600">T1</div>
                          <div className="text-lg font-semibold text-gray-700">{eleve.moyenneT1}</div>
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="text-sm text-gray-600">T2</div>
                          <div className="text-lg font-semibold text-gray-900">{eleve.moyenneT2}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-green-600">{eleve.progression}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer avec informations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Critères d'Excellence</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Moyenne ≥ 16: Tableau d'Honneur</p>
              <p>• Moyenne ≥ 18: Prix d'Excellence</p>
              <p>• Progression ≥ 2 pts: Prix de la Progression</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Récompenses</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Diplômes d'honneur</p>
              <p>• Mentions spéciales</p>
              <p>• Céremonie de remise des prix</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Validation</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Date: {new Date().toLocaleDateString('fr-FR')}</p>
              <p>Trimestre: {currentQuarter?.name || 'Chargement...'}</p>
              <p>Responsable: Direction Pédagogique</p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de notifications */}
      {showNotifications && (
        <NotificationPanel
          onClose={() => setShowNotifications(false)}
          context={{
            type: 'tableau_honneur',
            data: { trimestre_id: selectedQuarter, classe_id: selectedClass }
          }}
        />
      )}
    </div>
  );
}