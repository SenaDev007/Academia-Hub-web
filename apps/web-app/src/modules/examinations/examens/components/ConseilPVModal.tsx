import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Calendar, 
  Users, 
  GraduationCap, 
  UserCheck,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Star,
  FileText,
  Clock,
  Loader2
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFConseilPV from '../../../components/receipts/PDFConseilPV';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  educmasterNumber: string;
  className: string;
  classLevel: string;
  average: number;
  rank: number;
  decision: string;
  observations: string;
  assiduite?: string;
  comportement?: string;
  gender?: string;
  subjects: Array<{
    subjectName: string;
    average: number;
    evaluation: string;
  }>;
}

interface ConseilData {
  directeur: string;
  enseignantTitulaire: string;
  representantParents: string;
  delegueEleves: string;
  dateConseil: string;
}

interface ConseilStats {
  effectif: number;
  presents: number;
  moyenneClasse: number | string;
  tauxReussite: number;
  decisions: {
    admis: number;
    encouragements: number;
    avertissement: number;
    redoublement: number;
  };
}

interface ConseilPVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
  students: Student[];
  conseilData: ConseilData;
  conseilStats: ConseilStats;
  selectedClass: string;
  selectedLevel: string;
  selectedEvaluation: string;
  schoolSettings: {
    name: string;
    abbreviation: string;
    address: string;
    primaryPhone: string;
  };
  isLoading?: boolean;
}

const ConseilPVModal: React.FC<ConseilPVModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  onPrint,
  students,
  conseilData,
  conseilStats,
  selectedClass,
  selectedLevel,
  selectedEvaluation,
  schoolSettings,
  isLoading = false
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString('fr-FR');
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'maternelle': return 'Maternelle';
      case 'primaire': return 'Primaire';
      case '1er_cycle': return '1er Cycle Secondaire';
      case '2nd_cycle': return '2nd Cycle Secondaire';
      default: return level;
    }
  };

  const getDecisionLabel = (decision: string) => {
    switch (decision) {
      case 'TS': return 'Très Satisfaisant';
      case 'S': return 'Satisfaisant';
      case 'PS': return 'Peu Satisfaisant';
      case 'ADMIS': return 'Admis';
      case 'ENCOURAGEMENTS': return 'Encouragements';
      case 'AVERTISSEMENT': return 'Avertissement';
      case 'REDOUBLEMENT': return 'Redoublement';
      default: return decision;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'TS':
      case 'ADMIS':
        return 'text-green-600 bg-green-50';
      case 'S':
      case 'ENCOURAGEMENTS':
        return 'text-blue-600 bg-blue-50';
      case 'PS':
      case 'AVERTISSEMENT':
        return 'text-orange-600 bg-orange-50';
      case 'REDOUBLEMENT':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatRang = (rang: number, gender?: string) => {
    console.log('🔍 formatRang appelé avec:', { rang, gender });
    if (rang <= 0) return '-';
    if (rang === 1) {
      return gender === 'F' ? '1ère' : '1er';
    }
    return `${rang}ème`;
  };

  // Fonction pour gérer l'impression
  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Simuler un délai d'impression
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Déclencher le téléchargement du PDF (même que le bouton télécharger)
      // Le PDF sera généré et ouvert dans une nouvelle fenêtre pour l'impression
      const downloadButton = document.querySelector('[data-pdf-download]') as HTMLAnchorElement;
      if (downloadButton) {
        // Cloner le lien et modifier son comportement pour l'impression
        const clonedButton = downloadButton.cloneNode(true) as HTMLAnchorElement;
        clonedButton.style.display = 'none';
        document.body.appendChild(clonedButton);
        
        // Déclencher le clic
        clonedButton.click();
        
        // Nettoyer
        setTimeout(() => {
          document.body.removeChild(clonedButton);
        }, 1000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  // Fonction pour gérer le téléchargement PDF
  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    // Remettre l'état à false après un délai pour permettre le téléchargement
    setTimeout(() => {
      setIsGeneratingPDF(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Procès-Verbal du Conseil de Classe</h2>
                <p className="text-blue-100 text-sm">
                  {getLevelLabel(selectedLevel)} - {selectedClass} - {selectedEvaluation}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                disabled={isPrinting || isGeneratingPDF}
                className={`p-2 rounded-lg transition-colors ${
                  isPrinting || isGeneratingPDF ? 'bg-white/10 opacity-50 cursor-not-allowed' : 'bg-white/20 hover:bg-white/30'
                }`}
                title="Télécharger PDF"
              >
                {isPrinting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Download className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)] p-6">
          {/* En-tête du document */}
          <div className="text-center mb-8 border-b border-gray-200 pb-6">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {schoolSettings?.abbreviation || schoolSettings?.name || 'École'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {schoolSettings?.address || 'Adresse de l\'école'}
                </p>
                <p className="text-gray-600 text-sm">
                  Tél: {schoolSettings?.primaryPhone || '(+000) 00 00 00 00'}
                </p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              PROCÈS-VERBAL DU CONSEIL DE CLASSE
            </h2>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Date: {formatDate(conseilData.dateConseil)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Classe: {selectedClass}</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Niveau: {getLevelLabel(selectedLevel)}</span>
              </div>
            </div>
          </div>

          {/* Composition du conseil */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
              Composition du Conseil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Directeur(trice)</p>
                      <p className="font-medium text-gray-900">{conseilData.directeur || 'Non défini'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Enseignant titulaire</p>
                      <p className="font-medium text-gray-900">{conseilData.enseignantTitulaire || 'Non défini'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Représentant des parents</p>
                      <p className="font-medium text-gray-900">{conseilData.representantParents || 'Non défini'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Délégué des élèves</p>
                      <p className="font-medium text-gray-900">{conseilData.delegueEleves || 'Non défini'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques du conseil */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Résumé Statistique
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Taux de Réussite */}
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-500">Taux de Réussite</p>
                <p className="text-lg font-semibold text-green-600">
                  {conseilStats.tauxReussite.toFixed(1)}%
                </p>
              </div>
              
              {/* Élèves excellents */}
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-sm text-gray-500">
                  {selectedLevel === 'maternelle' ? 'Élèves Excellents (TS)' : 'Élèves Excellents (≥16)'}
                </p>
                <p className="text-lg font-semibold text-yellow-600">
                  {conseilStats.decisions.admis}
                </p>
              </div>
              
              {/* Élèves satisfaisants/encouragements */}
              {selectedLevel === 'maternelle' ? (
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Élèves Satisfaisants (S)</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {conseilStats.decisions.encouragements}
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500">Élèves Encouragements (12-16)</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {conseilStats.decisions.encouragements}
                  </p>
                </div>
              )}
              
              {/* Élèves moyens (seulement pour les niveaux non-maternelle) */}
              {selectedLevel !== 'maternelle' && (
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-500">Élèves Moyens (10-12)</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {conseilStats.decisions.avertissement}
                  </p>
                </div>
              )}
              
              {/* Élèves en difficulté */}
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-sm text-gray-500">
                  {selectedLevel === 'maternelle' ? 'Élèves en Difficulté (PS)' : 'Élèves en Difficulté (<10)'}
                </p>
                <p className="text-lg font-semibold text-red-600">
                  {conseilStats.decisions.redoublement}
                </p>
              </div>
            </div>
          </div>

          {/* Tableau des élèves */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-600" />
              Détail des Élèves
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Élève
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                      Moyenne
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                      Rang
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                      Assiduité
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                      Comportement
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                      Décision
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                      Observations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-medium">{student.firstName} {student.lastName}</span>
                          <span className="text-xs text-gray-500">N° {student.educmasterNumber}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                        {selectedLevel === 'maternelle' ? 
                          (student.average || '-') : 
                          (typeof student.average === 'number' ? student.average.toFixed(2) : (student.average || '-'))
                        }
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center text-sm text-gray-900">
                        {student.rank ? formatRang(student.rank, student.gender) : '-'}
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          student.assiduite === 'Excellent' ? 'bg-green-100 text-green-800' :
                          student.assiduite === 'Bon' ? 'bg-blue-100 text-blue-800' :
                          student.assiduite === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.assiduite || '-'}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          student.comportement === 'Excellent' ? 'bg-green-100 text-green-800' :
                          student.comportement === 'Bon' ? 'bg-blue-100 text-blue-800' :
                          student.comportement === 'Correct' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {student.comportement || '-'}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDecisionColor(student.decision)}`}>
                          {getDecisionLabel(student.decision)}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700">
                        {student.observations || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Détail des matières pour chaque élève */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
              Moyennes par Matière
            </h3>
            {students.map((student) => (
              <div key={student.id} className="mb-6 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  {student.firstName} {student.lastName} - {student.educmasterNumber}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {student.subjects?.map((subject, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">{subject.subjectName}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedLevel === 'maternelle' ? 
                          (subject.average || '-') : 
                          (typeof subject.average === 'number' ? subject.average.toFixed(2) : (subject.average || '-'))
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Signature et cachet */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <UserCheck className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Le Directeur(trice)</span>
                </div>
                <div className="mt-2 flex flex-col items-center">
                  {/* Cachet rouge avec signature intégrée */}
                  <div className="mt-4">
                    <div className="school-stamp">
                      <svg width="160" height="160" viewBox="0 0 160 160" className="stamp-svg">
                        {/* Définitions des chemins courbes pour le texte */}
                        <defs>
                          {/* Chemin pour l'arc supérieur extérieur (nom de l'école) - sens gauche à droite */}
                          <path id="path-top-outer" d="M 25 80 A 55 55 0 0 1 135 80" fill="none"/>
                          
                          {/* Chemin pour l'arc inférieur extérieur (adresse et téléphone) - sens gauche à droite */}
                          <path id="path-bottom-outer" d="M 20 80 A 60 60 0 0 0 140 80" fill="none"/>
                        </defs>
                        
                        {/* Cercle extérieur */}
                        <circle cx="80" cy="80" r="70" fill="none" stroke="#dc2626" strokeWidth="2"/>
                        
                        {/* Cercle intérieur */}
                        <circle cx="80" cy="80" r="45" fill="none" stroke="#dc2626" strokeWidth="2"/>
                        
                        {/* Texte courbé - Arc supérieur extérieur (abréviation de l'école) */}
                        <text fill="#dc2626" className="stamp-text-outer">
                          <textPath href="#path-top-outer" startOffset="0%" textAnchor="start">
                            {schoolSettings?.abbreviation || schoolSettings?.name || 'NOM ENTREPRISE'}
                          </textPath>
                        </text>
                        
                        {/* Texte courbé - Arc inférieur extérieur (adresse et téléphone) */}
                        <text fill="#dc2626" className="stamp-text-outer">
                          <textPath href="#path-bottom-outer" startOffset="12%" textAnchor="start">
                            {`* ${schoolSettings?.address || 'Adresse'} - Tél: ${schoolSettings?.primaryPhone || '(+000) 00 00 00 00'} *`}
                          </textPath>
                        </text>
                        
                        {/* Texte horizontal - niveau (juste au-dessus du titre) */}
                        <text x="80" y="75" textAnchor="middle" className="stamp-text-level" fill="#dc2626">
                          {(selectedLevel === 'maternelle' || selectedLevel === 'primaire') ? 'Maternelle & Primaire' : 'Secondaire'}
                        </text>
                        
                        {/* Texte central - titre */}
                        <text x="80" y="90" textAnchor="middle" className="stamp-text-center" fill="#dc2626">
                          DIRECTEUR(TRICE)
                        </text>
                        
                        {/* Signature numérique du directeur intégrée dans le SVG */}
                        <text 
                          x="10" 
                          y="95" 
                          fill="#0000ff"
                          fillOpacity="0.7"
                          fontFamily="Brush Script MT, Lucida Handwriting, cursive"
                          fontSize="45"
                          fontWeight="normal"
                          transform="rotate(-15 10 95)"
                          letterSpacing="1px"
                          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
                        >
                          {conseilData.directeur ? conseilData.directeur.split(' ').slice(-2, -1)[0] : 'Signature'}
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Date</span>
                </div>
                <div className="w-32 h-12 border border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-sm text-gray-600">{formatDate(conseilData.dateConseil)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Généré par Academia Hub, le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              disabled={isPrinting || isGeneratingPDF}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isPrinting || isGeneratingPDF 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isPrinting ? 'Téléchargement...' : 'Télécharger PDF'}
            </button>
            
            <PDFDownloadLink
              document={
                <PDFConseilPV
                  students={students}
                  conseilData={conseilData}
                  conseilStats={conseilStats}
                  selectedClass={selectedClass}
                  selectedLevel={selectedLevel}
                  selectedEvaluation={selectedEvaluation}
                  schoolSettings={schoolSettings}
                />
              }
              fileName={`pv-conseil-${selectedClass}-${selectedLevel}-${selectedEvaluation}.pdf`}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isGeneratingPDF 
                  ? 'bg-blue-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={handleDownloadPDF}
              data-pdf-download
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isGeneratingPDF ? 'Génération...' : 'Télécharger PDF'}
            </PDFDownloadLink>
          </div>
        </div>
      </div>
      
      {/* Styles CSS pour le cachet */}
      <style>{`
        .school-stamp {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .stamp-svg {
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
        }
        
        .stamp-text-outer {
          font-family: 'Arial', sans-serif;
          font-size: 8px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stamp-text-level {
          font-family: 'Arial', sans-serif;
          font-size: 7px;
          font-weight: normal;
          text-transform: none;
        }
        
        .stamp-text-center {
          font-family: 'Arial', sans-serif;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
};

export default ConseilPVModal;
