import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Loader2, Users, TrendingUp, BarChart3, Calendar, FileSpreadsheet } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFWorkloadSummary from '../receipts/PDFWorkloadSummary';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { ExcelService } from '../../services/excelService';

interface WorkloadPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  workloadData: Array<{
    id: string;
    name: string;
    hoursPerWeek: number;
    maxHours: number;
    efficiency: number;
    status: 'underloaded' | 'optimal' | 'overloaded' | 'critical';
    classes: string[];
    subjects: string[];
    recommendations: string[];
  }>;
  academicYear: string;
  workloadStats: {
    totalHours: number;
    avgHours: number;
    underloaded: number;
    optimal: number;
    overloaded: number;
    utilizationRate: number;
    efficiency: number;
  };
}

const WorkloadPrintModal: React.FC<WorkloadPrintModalProps> = ({ 
  isOpen, 
  onClose, 
  workloadData, 
  academicYear,
  workloadStats
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  
  // Récupérer les paramètres de l'école
  const { settings: schoolSettings } = useSchoolSettings();

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

  // Fonction pour générer Excel
  const handleGenerateExcel = () => {
    try {
      setIsGeneratingPDF(true);
      
      // Convertir les données de charge de travail en format Excel
      const excelData = workloadData.map(teacher => ({
        id: teacher.id,
        teacherName: teacher.name,
        hoursPerWeek: teacher.hoursPerWeek,
        maxHours: teacher.maxHours,
        efficiency: Math.round(teacher.efficiency),
        status: teacher.status === 'underloaded' ? 'Sous-chargé' :
                teacher.status === 'optimal' ? 'Optimal' :
                teacher.status === 'overloaded' ? 'Surchargé' : 'Critique',
        classes: teacher.classes.join(', '),
        subjects: teacher.subjects.join(', '),
        recommendations: teacher.recommendations.join('; ')
      }));

      ExcelService.generateWorkloadExcel(
        excelData,
        workloadStats,
        formatAcademicYear(academicYear),
        schoolSettings
      );
    } catch (error) {
      console.error('Erreur lors de la génération Excel:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Empêcher la fermeture accidentelle
  useEffect(() => {
    if (isOpen) {
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => {
          // Empêcher la fermeture en cliquant sur le contenu
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Rapport de Charge de Travail des Enseignants
                </h2>
                <p className="text-orange-100">Année scolaire: {formatAcademicYear(academicYear)}</p>
                <p className="text-sm text-orange-200">
                  {workloadData.length} enseignant{workloadData.length > 1 ? 's' : ''} • 
                  Total: {workloadStats.totalHours}h/semaine
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Total Heures</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {workloadStats.totalHours}h/sem
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Équilibrés</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {workloadStats.optimal}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Sous-chargés</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {workloadStats.underloaded}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Surchargés</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {workloadStats.overloaded}
                  </p>
                </div>
                <Users className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Tableau des charges de travail */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détail des Charges de Travail</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Enseignant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Heures/Sem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Max
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Efficacité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Matières
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {workloadData.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {teacher.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {teacher.hoursPerWeek}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {teacher.maxHours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {Math.round(teacher.efficiency)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          teacher.status === 'optimal'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : teacher.status === 'underloaded'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : teacher.status === 'overloaded'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {teacher.status === 'underloaded' ? 'Sous-chargé' :
                           teacher.status === 'optimal' ? 'Optimal' :
                           teacher.status === 'overloaded' ? 'Surchargé' : 'Critique'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {teacher.classes.join(', ') || 'Aucune'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {teacher.subjects.join(', ') || 'Toutes matières'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Généré par Academia Hub, le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            {/* Sélecteur de format */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Format d'export :</span>
              <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                    exportFormat === 'pdf'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => setExportFormat('excel')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                    exportFormat === 'excel'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Boutons d'action */}
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
                      <PDFWorkloadSummary 
                        workloadData={workloadData} 
                        academicYear={academicYear} 
                        workloadStats={workloadStats}
                        schoolSettings={{
                          schoolName: schoolSettings?.name,
                          address: schoolSettings?.address,
                          phone: schoolSettings?.primaryPhone,
                          email: schoolSettings?.primaryEmail,
                          website: schoolSettings?.website,
                          motto: schoolSettings?.motto,
                          logo: schoolSettings?.logo
                        }}
                      />
                    }
                    fileName={`rapport-charge-travail-${formatAcademicYear(academicYear)}.pdf`}
                    className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
                  onClick={handleGenerateExcel}
                  disabled={isGeneratingPDF}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
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
      </div>
    </div>
  );
};

export default WorkloadPrintModal;
