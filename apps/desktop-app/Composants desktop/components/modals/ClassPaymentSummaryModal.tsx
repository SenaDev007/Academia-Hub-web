import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Loader2, Users, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFClassPaymentSummary from '../receipts/PDFClassPaymentSummary';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';

interface ClassPaymentSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: {
    id: string;
    name: string;
    level: string;
    students: Array<{
      id: string;
      studentId: string;
      studentName: string;
      studentPhoto?: string;
      level: string;
      className: string;
      expectedTuition: number;
      paidTuition: number;
      remainingTuition: number;
      status: 'not_started' | 'partial' | 'completed';
      lastPaymentDate?: string;
      nextDueDate?: string;
      phoneNumber?: string;
      email?: string;
    }>;
  } | null;
  academicYear: string;
}

const ClassPaymentSummaryModal: React.FC<ClassPaymentSummaryModalProps> = ({ 
  isOpen, 
  onClose, 
  classData, 
  academicYear 
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
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

  // Calculer les statistiques de la classe
  const classStats = React.useMemo((): {
    totalStudents: number;
    completedStudents: number;
    partialStudents: number;
    notStartedStudents: number;
    totalExpected: number;
    totalPaid: number;
    totalRemaining: number;
    completionRate: number;
  } | null => {
    if (!classData) return null;

    const totalStudents = classData.students.length;
    const completedStudents = classData.students.filter(s => s.status === 'completed').length;
    const partialStudents = classData.students.filter(s => s.status === 'partial').length;
    const notStartedStudents = classData.students.filter(s => s.status === 'not_started').length;
    
    const totalExpected = classData.students.reduce((sum, s) => sum + s.expectedTuition, 0);
    const totalPaid = classData.students.reduce((sum, s) => sum + s.paidTuition, 0);
    const totalRemaining = classData.students.reduce((sum, s) => sum + s.remainingTuition, 0);
    
    const completionRate = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0;

    return {
      totalStudents,
      completedStudents,
      partialStudents,
      notStartedStudents,
      totalExpected,
      totalPaid,
      totalRemaining,
      completionRate
    };
  }, [classData]);

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

  if (!isOpen || !classData || !classStats) return null;

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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Récapitulatif des Paiements</h2>
                <p className="text-blue-100">{classData.name} - {classData.level}</p>
                <p className="text-sm text-blue-200">Année scolaire: {formatAcademicYear(academicYear)}</p>
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
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Élèves</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{classStats.totalStudents}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Soldés</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{classStats.completedStudents}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Partiels</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{classStats.partialStudents}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Non soldés</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{classStats.notStartedStudents}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Totaux financiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Attendu</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {classStats.totalExpected.toLocaleString()} F CFA
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-gray-500" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Versé</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    {classStats.totalPaid.toLocaleString()} F CFA
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Restant</p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300">
                    {classStats.totalRemaining.toLocaleString()} F CFA
                  </p>
                </div>
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Taux de collecte</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {classStats.completionRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(classStats.completionRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Liste des élèves */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détail par élève</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Élève
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Attendu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Versé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Restant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {classData.students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {student.studentPhoto ? (
                              <img 
                                src={student.studentPhoto} 
                                alt={student.studentName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              student.studentName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.studentName}
                            </div>
                            {student.phoneNumber && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {student.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.expectedTuition.toLocaleString()} F CFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-medium">
                        {student.paidTuition.toLocaleString()} F CFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-medium">
                        {student.remainingTuition.toLocaleString()} F CFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : student.status === 'partial'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {student.status === 'completed' ? 'Soldé' : 
                           student.status === 'partial' ? 'Partiel' : 'Non soldé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer avec actions */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Généré par Academia Hub, le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </div>
          <div className="flex items-center space-x-3">
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
              {isPrinting ? 'Impression...' : 'Imprimer'}
            </button>
            
             <PDFDownloadLink
               document={
                 <PDFClassPaymentSummary 
                   classData={classData} 
                   academicYear={academicYear} 
                   classStats={classStats}
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
               fileName={`recapitulatif-paiements-${classData.name}-${formatAcademicYear(academicYear)}.pdf`}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassPaymentSummaryModal;
