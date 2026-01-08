import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Loader2, Users, TrendingUp, BarChart3, Calendar, FileSpreadsheet } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFAssignmentSummary from '../receipts/PDFAssignmentSummary';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { ExcelService } from '../../services/excelService';

interface AssignmentPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: Array<{
    id: string;
    teacherId: string;
    teacherName: string;
    mode: 'maternelle' | 'primaire' | 'secondaire';
    classId?: string;
    className?: string;
    subjectId?: string;
    subjectName?: string;
    subjectIds?: string[];
    subjectNames?: string[];
    subjectsCount?: number;
    classIds?: string[];
    classNames?: string[];
    hoursPerWeek: number;
    startDate: string;
    endDate?: string;
    status: 'active' | 'pending' | 'expired';
  }>;
  academicYear: string;
  viewMode: 'list' | 'summary';
}

const AssignmentPrintModal: React.FC<AssignmentPrintModalProps> = ({ 
  isOpen, 
  onClose, 
  assignments, 
  academicYear,
  viewMode 
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

  // Fonction pour calculer les statistiques
  const calculateStats = () => {
    const totalHours = assignments.reduce((sum, assignment) => sum + assignment.hoursPerWeek, 0);
    const activeAssignments = assignments.filter(a => a.status === 'active');
    
    // Analyse par mode
    const modeAnalysis = assignments.reduce((acc, assignment) => {
      const mode = assignment.mode;
      if (!acc[mode]) {
        acc[mode] = { count: 0, totalHours: 0, teachers: new Set() };
      }
      acc[mode].count += 1;
      acc[mode].totalHours += assignment.hoursPerWeek;
      acc[mode].teachers.add(assignment.teacherId);
      return acc;
    }, {} as { [key: string]: { count: number; totalHours: number; teachers: Set<string> } });

    // Convertir les Sets en nombres
    Object.keys(modeAnalysis).forEach(mode => {
      modeAnalysis[mode].teachers = modeAnalysis[mode].teachers.size as any;
    });

    return {
      totalHours,
      activeAssignments: activeAssignments.length,
      assignmentCount: assignments.length,
      modeAnalysis: Object.entries(modeAnalysis).map(([mode, data]) => ({
        mode,
        count: data.count,
        totalHours: data.totalHours,
        teachers: data.teachers
      }))
    };
  };

  // Fonction pour générer Excel
  const handleGenerateExcel = () => {
    try {
      setIsGeneratingPDF(true);
      const stats = calculateStats();
      
      if (viewMode === 'list') {
        ExcelService.generateAssignmentExcel(
          assignments,
          stats,
          formatAcademicYear(academicYear),
          schoolSettings
        );
      } else {
        ExcelService.generateAssignmentSummaryExcel(
          assignments,
          stats,
          formatAcademicYear(academicYear),
          schoolSettings
        );
      }
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

  // Calculer les statistiques des affectations
  const assignmentStats = React.useMemo(() => {
    const totalHours = assignments.reduce((sum, a) => sum + (a.hoursPerWeek || 0), 0);
    const activeAssignments = assignments.filter(a => a.status === 'active');
    
    // Analyse par mode
    const modeAnalysis = assignments.reduce((acc, assignment) => {
      const mode = assignment.mode;
      if (!acc[mode]) {
        acc[mode] = { count: 0, totalHours: 0, teachers: new Set() };
      }
      acc[mode].count += 1;
      acc[mode].totalHours += assignment.hoursPerWeek || 0;
      acc[mode].teachers.add(assignment.teacherId);
      return acc;
    }, {} as { [key: string]: { count: number; totalHours: number; teachers: Set<string> } });

    // Convertir les Sets en nombres
    const modeAnalysisArray = Object.entries(modeAnalysis).map(([mode, data]) => ({
      mode,
      count: data.count,
      totalHours: data.totalHours,
      teachers: data.teachers.size
    }));

    return {
      totalHours,
      activeAssignments: activeAssignments.length,
      assignmentCount: assignments.length,
      modeAnalysis: modeAnalysisArray
    };
  }, [assignments]);

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
                  {viewMode === 'list' ? 'Liste des Affectations' : 'Résumé des Affectations'}
                </h2>
                <p className="text-orange-100">Année scolaire: {formatAcademicYear(academicYear)}</p>
                <p className="text-sm text-orange-200">
                  {assignments.length} affectation{assignments.length > 1 ? 's' : ''} • 
                  Total: {assignmentStats.totalHours}h/semaine
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
          {viewMode === 'list' ? (
            // Vue Liste des Affectations
            <div className="space-y-6">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Total Heures</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {assignmentStats.totalHours}h/sem
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Actives</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {assignmentStats.activeAssignments}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-green-500" />
                  </div>
                </div>

              </div>

              {/* Tableau des affectations */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détail des Affectations</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Enseignant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Mode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Classe(s)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Matière(s)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Heures/Sem
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {assignments.map((assignment) => (
                        <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {assignment.teacherName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              assignment.mode === 'maternelle'
                                ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
                                : assignment.mode === 'primaire'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                              {assignment.mode === 'maternelle' ? 'Maternelle' :
                             assignment.mode === 'primaire' ? 'Primaire' : 'Secondaire'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {assignment.classNames?.join(', ') || assignment.className || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {assignment.subjectNames?.join(', ') || assignment.subjectName || 'Toutes matières'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                            {assignment.hoursPerWeek}h
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              assignment.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : assignment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {assignment.status === 'active' ? 'Actif' :
                               assignment.status === 'pending' ? 'En attente' : 'Expiré'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Vue Résumé Exécutif
            <div className="space-y-6">
              {/* Résumé exécutif */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {assignmentStats.totalHours}h
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Heures/Semaine</div>
                  <div className="text-xs text-gray-500 mt-1">Toutes affectations confondues</div>
                </div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {assignmentStats.activeAssignments}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Affectations Actives</div>
                  <div className="text-xs text-gray-500 mt-1">En cours d'exécution</div>
                </div>
              </div>

              {/* Analyse par mode */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analyse par Mode d'Affectation</h3>
                <div className="space-y-3">
                  {assignmentStats.modeAnalysis.map((item) => {
                    const percentage = assignmentStats.totalHours > 0 ? (item.totalHours / assignmentStats.totalHours) * 100 : 0;
                    
                    return (
                      <div key={item.mode} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            item.mode === 'maternelle' ? 'bg-pink-500' :
                            item.mode === 'primaire' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.mode === 'maternelle' ? 'Maternelle' :
                               item.mode === 'primaire' ? 'Primaire' : 'Secondaire'}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {item.count} affectation{item.count > 1 ? 's' : ''} • {item.teachers} enseignant{item.teachers > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.totalHours}h/semaine
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
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
                      <PDFAssignmentSummary 
                        assignments={assignments} 
                        academicYear={academicYear} 
                        assignmentStats={assignmentStats}
                        viewMode={viewMode}
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
                    fileName={`${viewMode === 'list' ? 'liste' : 'resume'}-affectations-${formatAcademicYear(academicYear)}.pdf`}
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

export default AssignmentPrintModal;
