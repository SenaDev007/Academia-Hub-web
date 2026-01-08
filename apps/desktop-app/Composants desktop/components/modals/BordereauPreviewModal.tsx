import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Loader2, Users, TrendingUp, BarChart3, Calendar, FileSpreadsheet, Eye, Filter, RotateCcw } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { ExcelService } from '../../services/excelService';
import PDFBordereauSummary from '../receipts/PDFBordereauSummary?v=2';

interface BordereauPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bordereauData: Array<{
    id: string;
    nom: string;
    prenom: string;
    numeroEducmaster: string;
    sexe: string;
    notes: { [subjectId: string]: any };
    moyenneGenerale: number | string;
    rang: number;
    appreciation: string;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    coefficient?: number;
  }>;
  academicYear: string;
  quarter: string;
  level: string;
  className: string;
  viewMode: 'list' | 'summary';
}

const BordereauPreviewModal: React.FC<BordereauPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  bordereauData, 
  subjects,
  academicYear,
  quarter,
  level,
  className,
  viewMode 
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  
  // États pour les filtres
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('');
  
  // Récupérer les paramètres de l'école
  const { settings: schoolSettings } = useSchoolSettings();

  // Réinitialiser l'état d'impression quand le format change
  useEffect(() => {
    setIsPrinting(false);
  }, [exportFormat]);

  // Fonction pour formater l'année scolaire
  const formatAcademicYear = (yearId: string) => {
    if (!yearId) return 'N/A';
    
    // Si c'est déjà au format "2025-2026", on le retourne tel quel
    if (yearId.match(/^\d{4}-\d{4}$/)) {
      return yearId;
    }
    
    // Si c'est au format "academic-year-2025-2026", on extrait l'année
    if (yearId.startsWith('academic-year-')) {
      const yearPart = yearId.replace('academic-year-', '');
      return yearPart;
    }
    
    // Sinon, on retourne l'ID tel quel
    return yearId;
  };

  // Fonction pour formater le niveau scolaire
  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'maternelle': return 'Maternelle';
      case 'primaire': return 'Primaire';
      case '1er_cycle': return '1er Cycle Secondaire';
      case '2nd_cycle': return '2nd Cycle Secondaire';
      default: return level;
    }
  };

  // Fonction pour calculer les statistiques
  const calculateStats = () => {
    const totalStudents = bordereauData.length;
    
    // Calculer les moyennes selon le niveau
    let classAverage = 0;
    let successCount = 0;
    let excellentCount = 0;
    let tresBienCount = 0;
    let bienCount = 0;
    let assezBienCount = 0;
    let passableCount = 0;
    let insuffisantCount = 0;

    if (level === 'maternelle') {
      // Pour la maternelle, compter les annotations qualitatives
      const numericAverages = bordereauData.map(student => {
        switch (student.moyenneGenerale) {
          case 'TS': return 3;
          case 'S': return 2;
          case 'PS': return 1;
          default: return 0;
        }
      });
      
      classAverage = numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
      successCount = bordereauData.filter(s => s.moyenneGenerale === 'TS' || s.moyenneGenerale === 'S').length;
    } else {
      // Pour les autres niveaux, calculer avec les moyennes numériques
      const numericAverages = bordereauData.map(student => {
        return typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
      });
      
      classAverage = numericAverages.reduce((sum, avg) => sum + avg, 0) / numericAverages.length;
      successCount = bordereauData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 10;
      }).length;

      // Répartition par mention
      excellentCount = bordereauData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 18;
      }).length;

      tresBienCount = bordereauData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 16 && numAvg < 18;
      }).length;

      bienCount = bordereauData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 14 && numAvg < 16;
      }).length;

      assezBienCount = bordereauData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 12 && numAvg < 14;
      }).length;

      passableCount = bordereauData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 10 && numAvg < 12;
      }).length;

      insuffisantCount = bordereauData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg < 10;
      }).length;
    }

    const successRate = totalStudents > 0 ? (successCount / totalStudents) * 100 : 0;

    return {
      totalStudents,
      classAverage,
      successCount,
      successRate,
      excellentCount,
      tresBienCount,
      bienCount,
      assezBienCount,
      passableCount,
      insuffisantCount
    };
  };

  // Fonction pour filtrer les données selon les sélections
  const getFilteredData = () => {
    let filteredData = [...bordereauData];
    
    // Filtrer par élève si sélectionné
    if (selectedStudent) {
      filteredData = filteredData.filter(student => student.id === selectedStudent);
    }
    
    return filteredData;
  };

  // Recalculer les statistiques avec les données filtrées
  const calculateFilteredStats = () => {
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
      return {
        totalStudents: 0,
        classAverage: 0,
        successRate: 0,
        successCount: 0,
        excellentCount: 0,
        tresBienCount: 0,
        bienCount: 0,
        assezBienCount: 0,
        passableCount: 0,
        insuffisantCount: 0
      };
    }

    let classAverage = 0;
    let successCount = 0;
    let excellentCount = 0;
    let tresBienCount = 0;
    let bienCount = 0;
    let assezBienCount = 0;
    let passableCount = 0;
    let insuffisantCount = 0;

    if (level === 'maternelle') {
      // Pour la maternelle, compter les annotations qualitatives
      const numericAverages = filteredData.map(student => {
        switch (student.moyenneGenerale) {
          case 'TS': return 3;
          case 'S': return 2;
          case 'PS': return 1;
          default: return 0;
        }
      });
      
      classAverage = numericAverages.reduce((sum, val) => sum + val, 0) / numericAverages.length;
      successCount = filteredData.filter(s => s.moyenneGenerale === 'TS' || s.moyenneGenerale === 'S').length;
    } else {
      // Pour les autres niveaux, calculer avec les moyennes numériques
      const numericAverages = filteredData.map(student => {
        return typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
      });
      
      classAverage = numericAverages.reduce((sum, avg) => sum + avg, 0) / numericAverages.length;
      successCount = filteredData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 10;
      }).length;

      // Répartition par mention
      excellentCount = filteredData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 18;
      }).length;

      tresBienCount = filteredData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 16 && numAvg < 18;
      }).length;

      bienCount = filteredData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 14 && numAvg < 16;
      }).length;

      assezBienCount = filteredData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 12 && numAvg < 14;
      }).length;

      passableCount = filteredData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg >= 10 && numAvg < 12;
      }).length;

      insuffisantCount = filteredData.filter(student => {
        const numAvg = typeof student.moyenneGenerale === 'string' ? 0 : student.moyenneGenerale;
        return numAvg < 10;
      }).length;
    }

    return {
      totalStudents: filteredData.length,
      classAverage: classAverage || 0,
      successRate: filteredData.length > 0 ? (successCount / filteredData.length) * 100 : 0,
      successCount,
      excellentCount,
      tresBienCount,
      bienCount,
      assezBienCount,
      passableCount,
      insuffisantCount
    };
  };

  const filteredData = getFilteredData();
  const bordereauStats = calculateFilteredStats();

  // Fonction pour obtenir les évaluations disponibles selon le niveau
  const getAvailableEvaluations = () => {
    switch (level) {
      case 'maternelle':
        return [
          { key: 'em1', label: 'EM1' },
          { key: 'em2', label: 'EM2' },
          { key: 'ec', label: 'EC' }
        ];
      case 'primaire':
        return [
          { key: 'em1', label: 'EM1' },
          { key: 'em2', label: 'EM2' },
          { key: 'ec', label: 'EC' }
        ];
      case '1er_cycle':
        return [
          { key: 'ie1', label: 'IE1' },
          { key: 'ie2', label: 'IE2' },
          { key: 'ds1', label: 'DS1' },
          { key: 'ds2', label: 'DS2' }
        ];
      case '2nd_cycle':
        return [
          { key: 'ie1', label: 'IE1' },
          { key: 'ie2', label: 'IE2' },
          { key: 'ds1', label: 'DS1' },
          { key: 'ds2', label: 'DS2' }
        ];
      default:
        return [];
    }
  };

  // Fonction pour obtenir les colonnes filtrées selon l'évaluation sélectionnée
  const getFilteredColumns = () => {
    const allColumns = getColumnsForLevel();
    
    if (!selectedEvaluation) {
      return allColumns;
    }
    
    // Filtrer les colonnes selon l'évaluation sélectionnée
    return allColumns.filter(col => {
      if (col.type === 'group' && col.subcolumns) {
        // Pour les colonnes groupées, vérifier si l'évaluation correspond
        return col.key === selectedEvaluation;
      } else {
        // Pour les colonnes simples, vérifier si la clé correspond
        return col.key === selectedEvaluation;
      }
    });
  };

  // Fonction pour obtenir les colonnes selon le niveau
  const getColumnsForLevel = () => {
    switch (level) {
      case 'maternelle':
        return [
          { key: 'em1', label: 'EM1', type: 'qualitative' },
          { key: 'em2', label: 'EM2', type: 'qualitative' },
          { key: 'ec', label: 'EC', type: 'qualitative' },
          { key: 'moyenne', label: 'Moy', type: 'calculated' }
        ];
      case 'primaire':
        return [
          { 
            key: 'em1', 
            label: 'EM1', 
            type: 'group',
            subcolumns: [
              { key: 'em1_cm', label: 'CM', sublabel: '/18', type: 'number' },
              { key: 'em1_cp', label: 'CP', sublabel: '/2', type: 'number' },
              { key: 'em1_note', label: 'Note', sublabel: '/20', type: 'calculated' }
            ]
          },
          { 
            key: 'em2', 
            label: 'EM2', 
            type: 'group',
            subcolumns: [
              { key: 'em2_cm', label: 'CM', sublabel: '/18', type: 'number' },
              { key: 'em2_cp', label: 'CP', sublabel: '/2', type: 'number' },
              { key: 'em2_note', label: 'Note', sublabel: '/20', type: 'calculated' }
            ]
          },
          { 
            key: 'ec', 
            label: 'EC', 
            type: 'group',
            subcolumns: [
              { key: 'ec_cm', label: 'CM', sublabel: '/18', type: 'number' },
              { key: 'ec_cp', label: 'CP', sublabel: '/2', type: 'number' },
              { key: 'ec_note', label: 'Note', sublabel: '/20', type: 'calculated' }
            ]
          },
          { key: 'moyenne', label: 'Moy', type: 'calculated' }
        ];
      case '1er_cycle':
        return [
          { key: 'ie1', label: 'IE1', type: 'number' },
          { key: 'ie2', label: 'IE2', type: 'number' },
          { key: 'moy_ie', label: 'Moy. IE', type: 'calculated' },
          { key: 'ds1', label: 'DS1', type: 'number' },
          { key: 'ds2', label: 'DS2', type: 'number' },
          { key: 'moyenne', label: 'Moy', type: 'calculated' }
        ];
      case '2nd_cycle':
        return [
          { key: 'ie1', label: 'IE1', type: 'number' },
          { key: 'ie2', label: 'IE2', type: 'number' },
          { key: 'moy_ie', label: 'Moy. IE', type: 'calculated' },
          { key: 'ds1', label: 'DS1', type: 'number' },
          { key: 'ds2', label: 'DS2', type: 'number' },
          { key: 'moy', label: 'Moy.', type: 'calculated' },
          { key: 'coef', label: 'Coef', type: 'coefficient' },
          { key: 'moyenne', label: 'Moy. coef', type: 'calculated' }
        ];
      default:
        return [];
    }
  };

  // Fonction pour formater le rang
  const formatRang = (rang: number, sexe: string) => {
    let suffix = '';
    if (rang === 1) {
      suffix = sexe === 'F' ? 'ère' : 'er';
    } else {
      suffix = 'ème';
    }
    return `${rang}${suffix}`;
  };

  // Fonction pour calculer la moyenne IE
  const calculateMoyenneIE = (subjectNotes: any): string => {
    if (!subjectNotes) return '-';
    
    const ie1 = parseFloat(subjectNotes['ie1'] || subjectNotes['IE1'] || '0');
    const ie2 = parseFloat(subjectNotes['ie2'] || subjectNotes['IE2'] || '0');
    
    if (ie1 && ie2) {
      return ((ie1 + ie2) / 2).toFixed(2);
    }
    return '-';
  };

  // Fonction pour calculer la Moy. (moyenne sans coefficient) pour 2nd cycle
  const calculateMoy = (subjectNotes: any): string => {
    if (!subjectNotes) return '-';
    
    const ie1 = parseFloat(subjectNotes['ie1'] || subjectNotes['IE1'] || '0');
    const ie2 = parseFloat(subjectNotes['ie2'] || subjectNotes['IE2'] || '0');
    const ds1 = parseFloat(subjectNotes['ds1'] || subjectNotes['DS1'] || '0');
    const ds2 = parseFloat(subjectNotes['ds2'] || subjectNotes['DS2'] || '0');
    
    // Calculer la moyenne avec les notes disponibles
    const availableNotes = [ie1, ie2, ds1, ds2].filter(note => note > 0);
    
    if (availableNotes.length > 0) {
      return (availableNotes.reduce((sum, note) => sum + note, 0) / availableNotes.length).toFixed(2);
    }
    return '-';
  };

  // Fonction pour calculer la moyenne par matière
  const calculateSubjectAverage = (subjectNotes: any, level: string): number => {
    if (!subjectNotes) return 0;
    
    switch (level) {
      case 'maternelle':
        const em1 = subjectNotes['em1'] || subjectNotes['EM1'] || '-';
        const em2 = subjectNotes['em2'] || subjectNotes['EM2'] || '-';
        const ec = subjectNotes['ec'] || subjectNotes['EC'] || '-';
        
        if (em1 !== '-' && em2 !== '-' && ec !== '-') {
          const numericValues = [em1, em2, ec].map(val => {
            switch (val) {
              case 'TS': return 3;
              case 'S': return 2;
              case 'PS': return 1;
              default: return 0;
            }
          });
          return numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
        }
        break;
      case 'primaire':
        const em1_cm_primaire = parseFloat(subjectNotes['em1_cm'] || '0');
        const em1_cp_primaire = parseFloat(subjectNotes['em1_cp'] || '0');
        const em2_cm_primaire = parseFloat(subjectNotes['em2_cm'] || '0');
        const em2_cp_primaire = parseFloat(subjectNotes['em2_cp'] || '0');
        const ec_cm_primaire = parseFloat(subjectNotes['ec_cm'] || '0');
        const ec_cp_primaire = parseFloat(subjectNotes['ec_cp'] || '0');
        
        const em1_primaire = em1_cm_primaire + em1_cp_primaire;
        const em2_primaire = em2_cm_primaire + em2_cp_primaire;
        const ec_primaire = ec_cm_primaire + ec_cp_primaire;
        
        // Formule spécifique pour le primaire: (((EM1+EM2)/2)+EC)/2
        if (em1_primaire > 0 && em2_primaire > 0 && ec_primaire > 0) {
          const moyenneEM = (em1_primaire + em2_primaire) / 2;
          return (moyenneEM + ec_primaire) / 2;
        }
        
        // Si toutes les notes ne sont pas disponibles, calculer avec celles disponibles
        const availableNotes = [em1_primaire, em2_primaire, ec_primaire].filter(note => note > 0);
        if (availableNotes.length > 0) {
          return availableNotes.reduce((sum, note) => sum + note, 0) / availableNotes.length;
        }
        break;
      case '1er_cycle':
        const ie1_1er = parseFloat(subjectNotes['ie1'] || subjectNotes['IE1'] || '0');
        const ie2_1er = parseFloat(subjectNotes['ie2'] || subjectNotes['IE2'] || '0');
        const ds1_1er = parseFloat(subjectNotes['ds1'] || subjectNotes['DS1'] || '0');
        const ds2_1er = parseFloat(subjectNotes['ds2'] || subjectNotes['DS2'] || '0');
        
        // Formule spécifique pour le 1er cycle: Moy = (Moy IE + DS1 + DS2) / 3
        // où Moy IE = (IE1 + IE2) / 2
        if (ie1_1er > 0 && ie2_1er > 0 && ds1_1er > 0 && ds2_1er > 0) {
          const moyIE = (ie1_1er + ie2_1er) / 2;
          return (moyIE + ds1_1er + ds2_1er) / 3;
        }
        
        // Si toutes les notes ne sont pas disponibles, calculer avec celles disponibles
        const availableNotes1er = [ie1_1er, ie2_1er, ds1_1er, ds2_1er].filter(note => note > 0);
        if (availableNotes1er.length > 0) {
          return availableNotes1er.reduce((sum, note) => sum + note, 0) / availableNotes1er.length;
        }
        break;
      case '2nd_cycle':
        const ie1_2nd = parseFloat(subjectNotes['ie1'] || subjectNotes['IE1'] || '0');
        const ie2_2nd = parseFloat(subjectNotes['ie2'] || subjectNotes['IE2'] || '0');
        const ds1_2nd = parseFloat(subjectNotes['ds1'] || subjectNotes['DS1'] || '0');
        const ds2_2nd = parseFloat(subjectNotes['ds2'] || subjectNotes['DS2'] || '0');
        const coef = subjectNotes['coef'] || 1;
        
        // Calculer la moyenne avec les notes disponibles
        const availableNotes2nd = [ie1_2nd, ie2_2nd, ds1_2nd, ds2_2nd].filter(note => note > 0);
        
        if (availableNotes2nd.length > 0) {
          const moyenneBase = availableNotes2nd.reduce((sum, note) => sum + note, 0) / availableNotes2nd.length;
          return moyenneBase * coef;
        }
        break;
    }
    return 0;
  };

  // Fonction pour exporter en Excel
  const handleExcelExport = () => {
    try {
      setIsGeneratingPDF(true);
      const stats = calculateFilteredStats();
      
      // Utiliser ExcelService comme dans AssignmentPrintModal
      ExcelService.generateBordereauExcel(
        filteredData,
        stats,
        {
          academicYear,
          quarter,
          level: getLevelLabel(level),
          className
        },
        schoolSettings
      );
    } catch (error) {
      console.error('Erreur lors de la génération Excel:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Fonction pour imprimer
  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Simuler un délai d'impression
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Déclencher le téléchargement du PDF (même que le bouton télécharger)
      const downloadButton = document.querySelector('[data-pdf-download]') as HTMLAnchorElement;
      if (downloadButton) {
        // Cloner le lien et modifier son comportement pour l'impression
        const printLink = downloadButton.cloneNode(true) as HTMLAnchorElement;
        printLink.target = '_blank';
        printLink.onclick = (e) => {
          e.preventDefault();
          // Ouvrir le PDF dans une nouvelle fenêtre
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            // Le PDF s'ouvrira dans la nouvelle fenêtre
            newWindow.location.href = printLink.href;
            // Attendre que le PDF soit chargé puis déclencher l'impression
            setTimeout(() => {
              newWindow.print();
            }, 2000);
          }
        };
        printLink.click();
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    // Remettre l'état à false après un délai pour permettre le téléchargement
    setTimeout(() => {
      setIsGeneratingPDF(false);
    }, 3000);
  };


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Fermer le modal seulement si on clique sur le backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => {
          // Empêcher la fermeture en cliquant sur le contenu
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Aperçu du Bordereau de Notes
                </h2>
                <p className="text-blue-100">
                  {className} • {quarter} • {formatAcademicYear(academicYear)}
                </p>
                <p className="text-sm text-blue-200">
                  {bordereauData.length} élève{bordereauData.length > 1 ? 's' : ''} • 
                  Niveau: {level === 'maternelle' ? 'Maternelle' : 
                          level === 'primaire' ? 'Primaire' : 
                          level === '1er_cycle' ? '1er Cycle Secondaire' : '2nd Cycle Secondaire'}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Fermer"
              aria-label="Fermer le modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Sélecteur d'élève */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Élève:
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white min-w-[200px]"
                  title="Sélectionner un élève"
                  aria-label="Sélectionner un élève"
                >
                  <option value="">Tous les élèves</option>
                  {bordereauData.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.prenom || student.firstName || 'Prénom'} {student.nom || student.lastName || student.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélecteur d'évaluation */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Évaluation:
                </label>
                <select
                  value={selectedEvaluation}
                  onChange={(e) => setSelectedEvaluation(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  title="Sélectionner une évaluation"
                  aria-label="Sélectionner une évaluation"
                >
                  <option value="">Toutes les évaluations</option>
                  {getAvailableEvaluations().map(evaluation => (
                    <option key={evaluation.key} value={evaluation.key}>
                      {evaluation.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Format d'export:
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'excel')}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  title="Sélectionner le format d'export"
                  aria-label="Format d'export"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>

              {/* Bouton pour réinitialiser les filtres */}
              <button
                onClick={() => {
                  setSelectedStudent('');
                  setSelectedEvaluation('');
                }}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
                title="Réinitialiser les filtres"
              >
                <X className="w-4 h-4" />
                <span>Réinitialiser</span>
              </button>
            </div>
            <div className="flex space-x-3">
              {exportFormat === 'pdf' ? (
                <>
                  <button
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {isPrinting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Printer className="w-4 h-4 mr-2" />
                    )}
                    {isPrinting ? 'Impression...' : 'Imprimer PDF'}
                  </button>
                  
                  <PDFDownloadLink
                    document={
                      <PDFBordereauSummary 
                        bordereauData={bordereauData} 
                        subjects={subjects}
                        academicYear={academicYear}
                        quarter={quarter}
                        level={level}
                        className={className}
                        schoolSettings={{
                          schoolName: schoolSettings?.name,
                          address: schoolSettings?.address,
                          phone: schoolSettings?.primaryPhone,
                          email: schoolSettings?.primaryEmail,
                          website: schoolSettings?.website,
                          motto: schoolSettings?.motto,
                          logo: schoolSettings?.logo
                        }}
                        filteredData={filteredData}
                        filteredColumns={getFilteredColumns()}
                      />
                    }
                    fileName={`bordereau-notes-${level}-${className}-${quarter}-${academicYear}.pdf`}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                </>
              ) : (
                <button
                  onClick={handleExcelExport}
                  disabled={isGeneratingPDF}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                  )}
                  {isGeneratingPDF ? 'Génération...' : 'Télécharger Excel'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'list' ? (
            // Vue Liste du Bordereau
            <div className="space-y-6">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Élèves</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {filteredData.length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Moyenne Classe</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {level === 'maternelle' ? 
                          bordereauStats.classAverage.toFixed(2) + '/3' : 
                          bordereauStats.classAverage.toFixed(2) + '/20'
                        }
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Taux Réussite</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {bordereauStats.successRate.toFixed(1)}%
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Admis</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {bordereauStats.successCount}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Tableau du bordereau */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bordereau de Notes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Élève
                        </th>
                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Sexe
                        </th>
                        {subjects.map(subject => (
                          <th key={subject.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600">
                            <div className="space-y-2">
                              <div className="text-center font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                                {subject.name}
                              </div>
                              <div className="flex justify-center gap-1 text-xs">
                                {getFilteredColumns().map(col => {
                                  if (col.type === 'group' && col.subcolumns) {
                                    return (
                                      <div key={col.key} className="flex flex-col gap-1 flex-1">
                                        <div className="text-center font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 py-1 rounded border border-blue-200 dark:border-blue-800">
                                          {col.label}
                                        </div>
                                        <div className="flex justify-center gap-1">
                                          {col.subcolumns.map(subcol => (
                                            <span key={subcol.key} className={`px-1 py-1 rounded border text-center w-16 ${
                                              subcol.key.includes('_cm') ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' :
                                              subcol.key.includes('_cp') ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' :
                                              subcol.key.includes('_note') ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' :
                                              'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300'
                                            }`}>
                                              {subcol.label}
                                              {subcol.sublabel && <div className="text-xs opacity-75">{subcol.sublabel}</div>}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <span key={col.key} className={`px-2 py-1 rounded border flex-1 text-center ${
                                        col.key === 'moyenne' ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300' :
                                        col.key === 'moy_ie' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300' :
                                        col.key === 'moy' ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-300' :
                                        col.key === 'coef' ? 'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300' :
                                        col.key === 'rang' ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300' :
                                        col.key.includes('em') ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' :
                                        col.key === 'ec' ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' :
                                        col.key.includes('ie') ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300' :
                                        col.key.includes('ds') ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300' :
                                        'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300'
                                      }`}>
                                        {col.label}
                                        {col.sublabel && <div className="text-xs opacity-75">{col.sublabel}</div>}
                                      </span>
                                    );
                                  }
                                })}
                              </div>
                            </div>
                          </th>
                        ))}
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Moyenne Générale
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rang
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Appréciation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredData.map((student, index) => (
                        <tr key={student.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">
                                {student.prenom || student.firstName || 'Prénom'} {student.nom || student.lastName || student.id}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{student.numeroEducmaster}</div>
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              student.sexe === 'F' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                            }`}>
                              {student.sexe}
                            </span>
                          </td>
                          {subjects.map(subject => {
                            const noteData = student.notes[subject.id] || {};
                            return (
                              <td key={subject.id} className="px-3 py-4 text-center border-r border-gray-200 dark:border-gray-600">
                                <div className="space-y-1">
                                  <div className="flex justify-center gap-1 text-xs">
                                    {getFilteredColumns().map(col => {
                                      if (col.type === 'group' && col.subcolumns) {
                                        return (
                                          <div key={col.key} className="flex flex-col gap-1 flex-1">
                                            <div className="flex justify-center gap-1">
                                              {col.subcolumns.map(subcol => {
                                                if (subcol.type === 'calculated') {
                                                  let calculatedValue = '-';
                                                  if (subcol.key === 'em1_note') {
                                                    const cm = parseFloat(noteData['em1_cm'] || '0');
                                                    const cp = parseFloat(noteData['em1_cp'] || '0');
                                                    const note = cm + cp;
                                                    calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                                  } else if (subcol.key === 'em2_note') {
                                                    const cm = parseFloat(noteData['em2_cm'] || '0');
                                                    const cp = parseFloat(noteData['em2_cp'] || '0');
                                                    const note = cm + cp;
                                                    calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                                  } else if (subcol.key === 'ec_note') {
                                                    const cm = parseFloat(noteData['ec_cm'] || '0');
                                                    const cp = parseFloat(noteData['ec_cp'] || '0');
                                                    const note = cm + cp;
                                                    calculatedValue = note > 0 ? note.toFixed(2) : '-';
                                                  }
                                                  
                                                  return (
                                                    <span
                                                      key={subcol.key}
                                                      className={`w-12 text-center px-1 py-1 rounded text-sm font-semibold ${
                                                        calculatedValue !== '-' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'
                                                      }`}
                                                    >
                                                      {calculatedValue}
                                                    </span>
                                                  );
                                                } else {
                                                  return (
                                                    <span
                                                      key={subcol.key}
                                                      className={`w-12 text-center px-1 py-1 rounded text-sm font-semibold ${
                                                        noteData[subcol.key] ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'
                                                      }`}
                                                    >
                                                      {noteData[subcol.key] || '-'}
                                                    </span>
                                                  );
                                                }
                                              })}
                                            </div>
                                          </div>
                                        );
                                      } else if (col.type === 'calculated') {
                                        let calculatedValue = '-';
                                        if (col.key === 'moyenne') {
                                          const moyenne = calculateSubjectAverage(noteData, level);
                                          calculatedValue = moyenne > 0 ? moyenne.toFixed(2) : '-';
                                        } else if (col.key === 'moy_ie') {
                                          calculatedValue = calculateMoyenneIE(noteData);
                                        } else if (col.key === 'moy') {
                                          calculatedValue = calculateMoy(noteData);
                                        }
                                        
                                        return (
                                          <span key={col.key} className={`flex-1 text-center px-1 py-1 rounded text-sm font-semibold ${
                                            col.key === 'moyenne' ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300' :
                                            col.key === 'moy_ie' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300' :
                                            col.key === 'moy' ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-300' :
                                            'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300'
                                          }`}>
                                            {calculatedValue}
                                          </span>
                                        );
                                      } else if (col.key === 'coef') {
                                        return (
                                          <span key={col.key} className="flex-1 text-center px-1 py-1 rounded text-sm font-semibold bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300">
                                            {noteData.coef || '-'}
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span key={col.key} className={`flex-1 text-center px-1 py-1 rounded text-sm font-semibold ${
                                            col.key.includes('em') ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' :
                                            col.key === 'ec' ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' :
                                            col.key.includes('ie') ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300' :
                                            col.key.includes('ds') ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300' :
                                            'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-300'
                                          }`}>
                                            {noteData[col.key] || '-'}
                                          </span>
                                        );
                                      }
                                    })}
                                  </div>
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-4 py-4 text-center">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              level === 'maternelle' ? (
                                student.moyenneGenerale === 'TS' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                student.moyenneGenerale === 'S' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                student.moyenneGenerale === 'PS' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                                'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                              ) : (
                                typeof student.moyenneGenerale === 'number' && student.moyenneGenerale >= 10 ?
                                'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              )
                            }`}>
                              {typeof student.moyenneGenerale === 'string' ? student.moyenneGenerale : student.moyenneGenerale.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              student.rang === 1 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                              student.rang <= 3 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                              'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                            }`}>
                              {formatRang(student.rang, student.sexe)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {student.appreciation || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Statistiques Générales</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Moyenne de classe:</span>
                      <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                        {level === 'maternelle' ? 
                          bordereauStats.classAverage.toFixed(2) + '/3' : 
                          bordereauStats.classAverage.toFixed(2) + '/20'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Taux de réussite:</span>
                      <span className="font-bold text-lg text-green-600 dark:text-green-400">
                        {bordereauStats.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {level !== 'maternelle' && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Répartition par Mention</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Excellent (≥18):</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{bordereauStats.excellentCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Très bien (16-17.99):</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{bordereauStats.tresBienCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bien (14-15.99):</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{bordereauStats.bienCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assez bien (12-13.99):</span>
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">{bordereauStats.assezBienCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Passable (10-11.99):</span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">{bordereauStats.passableCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insuffisant (&lt;10):</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{bordereauStats.insuffisantCount}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Extrêmes</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Meilleure moyenne:</span>
                      <span className="font-bold text-lg text-green-600 dark:text-green-400">
                        {level === 'maternelle' ? 
                          Math.max(...bordereauData.map(s => {
                            switch (s.moyenneGenerale) {
                              case 'TS': return 3;
                              case 'S': return 2;
                              case 'PS': return 1;
                              default: return 0;
                            }
                          })).toFixed(2) + '/3' : 
                          Math.max(...bordereauData.map(s => typeof s.moyenneGenerale === 'string' ? 0 : s.moyenneGenerale)).toFixed(2) + '/20'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Plus faible moyenne:</span>
                      <span className="font-bold text-lg text-red-600 dark:text-red-400">
                        {level === 'maternelle' ? 
                          Math.min(...bordereauData.map(s => {
                            switch (s.moyenneGenerale) {
                              case 'TS': return 3;
                              case 'S': return 2;
                              case 'PS': return 1;
                              default: return 0;
                            }
                          })).toFixed(2) + '/3' : 
                          Math.min(...bordereauData.map(s => typeof s.moyenneGenerale === 'string' ? 0 : s.moyenneGenerale)).toFixed(2) + '/20'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Vue Résumé (à implémenter si nécessaire)
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Vue Résumé
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Cette vue sera implémentée selon les besoins spécifiques.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BordereauPreviewModal;
