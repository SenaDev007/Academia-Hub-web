import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Loader2, Receipt, TrendingUp, BarChart3, Calendar, FileSpreadsheet, Minus } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFExpenseSummary from '../receipts/PDFExpenseSummary';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { ExcelService } from '../../services/excelService';

interface ExpensePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    category: string;
    subcategory?: string;
    vendor?: string;
    paymentMethod: string;
    receiptNumber?: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    approvedBy?: string;
    approvedAt?: string;
    createdAt: string;
  }>;
  academicYear: string;
  viewMode: 'list' | 'summary';
  expenseCategories?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  startDate?: string;
  endDate?: string;
}

const ExpensePrintModal: React.FC<ExpensePrintModalProps> = ({ 
  isOpen, 
  onClose, 
  expenses, 
  academicYear, 
  viewMode, 
  expenseCategories = [],
  startDate,
  endDate
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
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
    const match = yearId.match(/academic-year-(\d{4}-\d{4})/);
    if (match) {
      return match[1];
    }
    
    return yearId;
  };

  // Calculer les statistiques
  const calculateStats = () => {
    const total = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const approvedTotal = expenses.filter(e => e.status === 'approved').reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const pendingTotal = expenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const rejected = expenses.filter(e => e.status === 'rejected').reduce((sum, expense) => sum + (expense.amount || 0), 0);
    
    // Dépenses du mois en cours
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthly = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    }).reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Analyse par catégorie
    const categoryAnalysis = expenses.reduce((acc, expense) => {
      const categoryId = expense.category || 'Non catégorisé';
      const categoryName = expenseCategories.find(cat => cat.id === categoryId)?.name || categoryId;
      
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, total: 0 };
      }
      acc[categoryName].count += 1;
      acc[categoryName].total += expense.amount || 0;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const approvedCount = expenses.filter(e => e.status === 'approved').length;
    const pendingCount = expenses.filter(e => e.status === 'pending').length;
    const rejectedCount = expenses.filter(e => e.status === 'rejected').length;

    return {
      total,
      approved: approvedTotal,
      pending: pendingTotal,
      rejected,
      monthly,
      categoryAnalysis,
      // Pour l'interface ExpenseStats
      approvedTotal,
      pendingTotal,
      approvedPercentage: total > 0 ? (approvedTotal / total) * 100 : 0,
      pendingPercentage: total > 0 ? (pendingTotal / total) * 100 : 0,
      expenseCount: expenses.length,
      approvedCount,
      pendingCount,
      rejectedCount,
      categoryAnalysisArray: Object.entries(categoryAnalysis).map(([category, data]) => ({
        label: category,
        count: data.count,
        total: data.total,
        category
      }))
    };
  };

  const stats = calculateStats();

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'paid': return 'Payée';
      default: return status;
    }
  };


  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'paid': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Gérer la génération Excel
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

  const handleGenerateExcel = async () => {
    if (exportFormat === 'excel') {
      try {
        setIsGeneratingPDF(true);
        
        if (viewMode === 'summary') {
          await ExcelService.generateExpenseSummaryExcel(expenses, {
            total: stats.total,
            approvedTotal: stats.approvedTotal,
            pendingTotal: stats.pendingTotal,
            monthly: stats.monthly,
            approvedPercentage: stats.approvedPercentage,
            pendingPercentage: stats.pendingPercentage,
            categoryAnalysis: stats.categoryAnalysisArray,
            expenseCount: stats.expenseCount,
            approvedCount: stats.approvedCount,
            pendingCount: stats.pendingCount,
            rejectedCount: stats.rejectedCount
          }, formatAcademicYear(academicYear));
        } else {
          await ExcelService.generateExpenseExcel(expenses, {
            total: stats.total,
            approvedTotal: stats.approvedTotal,
            pendingTotal: stats.pendingTotal,
            monthly: stats.monthly,
            approvedPercentage: stats.approvedPercentage,
            pendingPercentage: stats.pendingPercentage,
            categoryAnalysis: stats.categoryAnalysisArray,
            expenseCount: stats.expenseCount,
            approvedCount: stats.approvedCount,
            pendingCount: stats.pendingCount,
            rejectedCount: stats.rejectedCount
          }, formatAcademicYear(academicYear));
        }
      } catch (error) {
        console.error('Erreur lors de la génération Excel:', error);
      } finally {
        setIsGeneratingPDF(false);
      }
    }
  };

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {viewMode === 'summary' ? 'Résumé des Dépenses' : 'Liste des Dépenses'}
                </h2>
                <p className="text-red-100 text-sm">
                  {expenses.length} dépense{expenses.length > 1 ? 's' : ''} • Année {formatAcademicYear(academicYear)}
                  {startDate && endDate && (
                    <span> • Période: {new Date(startDate).toLocaleDateString('fr-FR')} - {new Date(endDate).toLocaleDateString('fr-FR')}</span>
                  )}
                  {startDate && !endDate && (
                    <span> • À partir du {new Date(startDate).toLocaleDateString('fr-FR')}</span>
                  )}
                  {!startDate && endDate && (
                    <span> • Jusqu'au {new Date(endDate).toLocaleDateString('fr-FR')}</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
              title="Fermer le modal"
              aria-label="Fermer le modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-3 border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <Minus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">Total</p>
                  <p className="text-sm font-bold text-red-700 dark:text-red-300">
                    {stats.total.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Approuvées</p>
                  <p className="text-sm font-bold text-green-700 dark:text-green-300">
                    {stats.approved.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">En attente</p>
                  <p className="text-sm font-bold text-orange-700 dark:text-orange-300">
                    {stats.pending.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-3 border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">Rejetées</p>
                  <p className="text-sm font-bold text-red-700 dark:text-red-300">
                    {stats.rejected.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Ce mois</p>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    {stats.monthly.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des dépenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détail des Dépenses</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fournisseur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Méthode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {expense.date ? new Date(expense.date).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">{expense.title || 'N/A'}</div>
                          {expense.description && (
                            <div className="text-xs text-gray-500">{expense.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div>
                          <div className="font-medium">
                            {expenseCategories.find(cat => cat.id === expense.category)?.name || expense.category || 'N/A'}
                          </div>
                          {expense.subcategory && (
                            <div className="text-xs text-gray-500">{expense.subcategory}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {expense.vendor || ' - '}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {expense.amount?.toLocaleString() || '0'} F CFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {expense.paymentMethod === 'cash' ? 'Espèces' :
                         expense.paymentMethod === 'bank_transfer' ? 'Virement bancaire' :
                         expense.paymentMethod === 'check' ? 'Chèque' :
                         expense.paymentMethod === 'mobile_money' ? 'Mobile Money' :
                         expense.paymentMethod || 'Espèces'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                          {getStatusLabel(expense.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Généré par Academia Hub, le {new Date().toLocaleString('fr-FR')}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Sélecteur de format */}
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Format d'export :</span>
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
              <div className="flex flex-wrap gap-2">
                {exportFormat === 'pdf' ? (
                  <>
                    <button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
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
                        <PDFExpenseSummary
                          expenses={expenses}
                          schoolSettings={schoolSettings}
                          academicYear={formatAcademicYear(academicYear)}
                          viewMode={viewMode}
                          expenseStats={{
                            total: stats.total,
                            approvedTotal: stats.approvedTotal,
                            pendingTotal: stats.pendingTotal,
                            rejectedTotal: stats.rejected,
                            monthly: stats.monthly,
                            approvedPercentage: stats.approvedPercentage,
                            pendingPercentage: stats.pendingPercentage,
                            categoryAnalysis: stats.categoryAnalysisArray,
                            expenseCount: stats.expenseCount,
                            approvedCount: stats.approvedCount,
                            pendingCount: stats.pendingCount,
                            rejectedCount: stats.rejectedCount
                          }}
                          expenseCategories={expenseCategories}
                          startDate={startDate}
                          endDate={endDate}
                        />
                      }
                      fileName={`depenses-${formatAcademicYear(academicYear)}-${viewMode}-${new Date().toISOString().split('T')[0]}.pdf`}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
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
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm whitespace-nowrap"
                  >
                    {isGeneratingPDF ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                    )}
                    Télécharger Excel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensePrintModal;