import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Loader2, Receipt, TrendingUp, BarChart3, Calendar, FileSpreadsheet } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFRevenueSummary from '../receipts/PDFRevenueSummary';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { ExcelService } from '../../services/excelService';

interface RevenuePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenues: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
    studentName?: string;
    className?: string;
    reference?: string;
    paymentMethod?: string;
    status?: string;
  }>;
  academicYear: string;
  viewMode: 'list' | 'summary';
}

const RevenuePrintModal: React.FC<RevenuePrintModalProps> = ({ 
  isOpen, 
  onClose, 
  revenues, 
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
    const total = revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
    const tuitionRevenue = revenues
      .filter(r => r.type === 'inscription_fee' || r.type === 'reinscription_fee' || r.type === 'tuition_fee')
      .reduce((sum, revenue) => sum + revenue.amount, 0);
    const otherRevenue = total - tuitionRevenue;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthly = revenues
      .filter(r => {
        const revenueDate = new Date(r.date);
        return revenueDate.getMonth() === currentMonth && revenueDate.getFullYear() === currentYear;
      })
      .reduce((sum, revenue) => sum + revenue.amount, 0);

    const tuitionPercentage = total > 0 ? (tuitionRevenue / total) * 100 : 0;
    const otherPercentage = total > 0 ? (otherRevenue / total) * 100 : 0;

    // Analyse par type
    const typeMap = new Map<string, { count: number; total: number; type: string }>();
    revenues.forEach(revenue => {
      const typeKey = revenue.type;
      const existing = typeMap.get(typeKey) || { count: 0, total: 0, type: typeKey };
      existing.count += 1;
      existing.total += revenue.amount;
      typeMap.set(typeKey, existing);
    });

    const typeAnalysis = Array.from(typeMap.entries()).map(([type, data]) => ({
      label: getTypeLabel(type),
      count: data.count,
      total: data.total,
      type: data.type
    }));

    return {
      total,
      tuitionRevenue,
      otherRevenue,
      monthly,
      tuitionPercentage,
      otherPercentage,
      typeAnalysis,
      revenueCount: revenues.length
    };
  };

  // Fonction pour obtenir le libellé du type
  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'uniforme': return 'Uniforme';
      case 'fournitures': return 'Fournitures';
      case 'cantine': return 'Cantine';
      case 'don': return 'Don';
      case 'subvention': return 'Subvention';
      case 'scolarite': return 'Scolarité';
      case 'inscription': return 'Inscription';
      case 'reinscription': return 'Réinscription';
      case 'inscription_fee': return 'Inscription & Scolarité';
      case 'reinscription_fee': return 'Inscription & Scolarité';
      case 'tuition_fee': return 'Inscription & Scolarité';
      default: return 'Autre';
    }
  };

  // Fonction pour obtenir la description correcte d'une recette
  const getRevenueDescription = (revenue: any) => {
    // Pour les recettes synchronisées (frais de scolarité), afficher "Paiement frais scolaires"
    if (revenue.type === 'inscription_fee' || revenue.type === 'reinscription_fee' || revenue.type === 'tuition_fee') {
      return 'Paiement frais scolaires';
    }
    
    // Pour les recettes manuelles, utiliser la description stockée
    return revenue.description || 'N/A';
  };

  // Fonction pour corriger la description des recettes
  const getCorrectedRevenues = () => {
    return revenues.map(revenue => ({
      ...revenue,
      description: getRevenueDescription(revenue)
    }));
  };

  // Fonction pour générer Excel
  const handleGenerateExcel = () => {
    try {
      setIsGeneratingPDF(true);
      const stats = calculateStats();
      const correctedRevenues = getCorrectedRevenues();
      
      if (viewMode === 'list') {
        ExcelService.generateRevenueExcel(
          correctedRevenues,
          stats,
          formatAcademicYear(academicYear),
          schoolSettings
        );
      } else {
        ExcelService.generateRevenueSummaryExcel(
          correctedRevenues,
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

  // Calculer les statistiques des recettes
  const revenueStats = React.useMemo(() => {
    const total = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const tuitionRevenue = revenues
      .filter(r => ['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(r.type))
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    const otherRevenue = revenues
      .filter(r => !['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(r.type))
      .reduce((sum, r) => sum + (r.amount || 0), 0);
    
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthly = revenues
      .filter(r => r.date?.startsWith(currentMonth))
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    const tuitionPercentage = total > 0 ? (tuitionRevenue / total) * 100 : 0;
    const otherPercentage = total > 0 ? (otherRevenue / total) * 100 : 0;

    // Analyse par type
    const typeAnalysis = revenues.reduce((acc, revenue) => {
      const type = revenue.type;
      const typeLabel = type === 'uniforme' ? 'Uniforme' :
                      type === 'fournitures' ? 'Fournitures' :
                      type === 'cantine' ? 'Cantine' :
                      type === 'don' ? 'Don' :
                      type === 'subvention' ? 'Subvention' :
                      type === 'scolarite' ? 'Scolarité' :
                      type === 'inscription' ? 'Inscription' :
                      type === 'reinscription' ? 'Réinscription' :
                      type === 'inscription_fee' ? 'Inscription & Scolarité' :
                      type === 'reinscription_fee' ? 'Inscription & Scolarité' :
                      type === 'tuition_fee' ? 'Inscription & Scolarité' :
                      'Autre';
      
      if (!acc[typeLabel]) {
        acc[typeLabel] = { count: 0, total: 0, type: type };
      }
      acc[typeLabel].count += 1;
      acc[typeLabel].total += revenue.amount || 0;
      return acc;
    }, {} as { [key: string]: { count: number; total: number; type: string } });

    const sortedTypes = Object.entries(typeAnalysis)
      .map(([label, data]) => ({ label, ...data }))
      .sort((a, b) => b.total - a.total);

    return {
      total,
      tuitionRevenue,
      otherRevenue,
      monthly,
      tuitionPercentage,
      otherPercentage,
      typeAnalysis: sortedTypes,
      revenueCount: revenues.length
    };
  }, [revenues]);

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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {viewMode === 'list' ? 'Liste des Recettes' : 'Résumé des Recettes'}
                </h2>
                <p className="text-green-100">Année scolaire: {formatAcademicYear(academicYear)}</p>
                <p className="text-sm text-green-200">
                  {revenues.length} recette{revenues.length > 1 ? 's' : ''} • 
                  Total: {revenueStats.total.toLocaleString()} F CFA
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
            // Vue Liste des Recettes
            <div className="space-y-6">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Recettes</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {revenueStats.total.toLocaleString()} F CFA
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Scolarité</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {revenueStats.tuitionRevenue.toLocaleString()} F CFA
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Autres</p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {revenueStats.otherRevenue.toLocaleString()} F CFA
                      </p>
                    </div>
                    <Receipt className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Ce Mois</p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {revenueStats.monthly.toLocaleString()} F CFA
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Tableau des recettes */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détail des Recettes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Élève/Classe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Méthode
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {revenues.map((revenue) => (
                        <tr key={revenue.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {revenue.date ? new Date(revenue.date).toLocaleDateString('fr-FR') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              ['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(revenue.type)
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                              {revenue.type === 'uniforme' ? 'Uniforme' :
                               revenue.type === 'fournitures' ? 'Fournitures' :
                               revenue.type === 'cantine' ? 'Cantine' :
                               revenue.type === 'don' ? 'Don' :
                               revenue.type === 'subvention' ? 'Subvention' :
                               revenue.type === 'scolarite' ? 'Scolarité' :
                               revenue.type === 'inscription' ? 'Inscription' :
                               revenue.type === 'reinscription' ? 'Réinscription' :
                               revenue.type === 'inscription_fee' ? 'Inscription & Scolarité' :
                               revenue.type === 'reinscription_fee' ? 'Inscription & Scolarité' :
                               revenue.type === 'tuition_fee' ? 'Inscription & Scolarité' :
                               'Autre'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {getRevenueDescription(revenue)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            <div>
                              {revenue.studentName && (
                                <div className="font-medium">{revenue.studentName}</div>
                              )}
                              {revenue.className && (
                                <div className="text-xs text-gray-500">{revenue.className}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                            {revenue.amount.toLocaleString()} F CFA
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {revenue.paymentMethod || 'Espèces'}
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
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {revenueStats.total.toLocaleString()} F CFA
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total des Recettes</div>
                  <div className="text-xs text-gray-500 mt-1">Toutes sources confondues</div>
                </div>
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {revenueStats.tuitionRevenue.toLocaleString()} F CFA
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Scolarité Encaissée</div>
                  <div className="text-xs text-gray-500 mt-1">{revenueStats.tuitionPercentage.toFixed(1)}% du total</div>
                </div>
                <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {revenueStats.otherRevenue.toLocaleString()} F CFA
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Autres Recettes</div>
                  <div className="text-xs text-gray-500 mt-1">{revenueStats.otherPercentage.toFixed(1)}% du total</div>
                </div>
                <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {revenueStats.monthly.toLocaleString()} F CFA
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Ce Mois</div>
                  <div className="text-xs text-gray-500 mt-1">Recettes du mois en cours</div>
                </div>
              </div>

              {/* Analyse par type */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analyse par Type de Recette</h3>
                <div className="space-y-3">
                  {revenueStats.typeAnalysis.map((item) => {
                    const percentage = revenueStats.total > 0 ? (item.total / revenueStats.total) * 100 : 0;
                    const isTuition = ['inscription_fee', 'reinscription_fee', 'tuition_fee'].includes(item.type);
                    
                    return (
                      <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${isTuition ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{item.label}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{item.count} transaction{item.count > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.total.toLocaleString()} F CFA
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
                      <PDFRevenueSummary 
                        revenues={getCorrectedRevenues()} 
                        academicYear={academicYear} 
                        revenueStats={revenueStats}
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
                    fileName={`${viewMode === 'list' ? 'liste' : 'resume'}-recettes-${formatAcademicYear(academicYear)}.pdf`}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
      </div>
    </div>
  );
};

export default RevenuePrintModal;
