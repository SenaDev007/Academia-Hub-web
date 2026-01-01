import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Filter,
  RefreshCw,
  Eye,
  Printer,
  Mail,
  Share2,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Award,
  GraduationCap
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import hrService from '../../services/hrService';

interface ReportConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'personnel' | 'contracts' | 'evaluations' | 'training' | 'leaves' | 'financial';
  format: ('pdf' | 'excel' | 'csv')[];
  requiresDateRange: boolean;
  requiresFilters: boolean;
}

const HRReports: React.FC = () => {
  const { user } = useUser();
  
  // États des données
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  
  // États des filtres
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filters, setFilters] = useState<any>({});
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  
  // États de génération
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  
  // Configuration des rapports disponibles
  const reportConfigs: ReportConfig[] = [
    {
      id: 'personnel-list',
      name: 'Liste du personnel',
      description: 'Liste complète de tous les employés avec leurs informations',
      icon: Users,
      category: 'personnel',
      format: ['pdf', 'excel', 'csv'],
      requiresDateRange: false,
      requiresFilters: true
    },
    {
      id: 'contracts-summary',
      name: 'Résumé des contrats',
      description: 'Vue d\'ensemble de tous les contrats et leur statut',
      icon: FileText,
      category: 'contracts',
      format: ['pdf', 'excel'],
      requiresDateRange: true,
      requiresFilters: true
    },
    {
      id: 'evaluations-report',
      name: 'Rapport d\'évaluations',
      description: 'Résultats des évaluations de performance',
      icon: Award,
      category: 'evaluations',
      format: ['pdf', 'excel'],
      requiresDateRange: true,
      requiresFilters: true
    },
    {
      id: 'training-summary',
      name: 'Résumé des formations',
      description: 'Formations planifiées et réalisées',
      icon: GraduationCap,
      category: 'training',
      format: ['pdf', 'excel'],
      requiresDateRange: true,
      requiresFilters: true
    },
    {
      id: 'leaves-report',
      name: 'Rapport des congés',
      description: 'Demandes de congés et soldes des employés',
      icon: Calendar,
      category: 'leaves',
      format: ['pdf', 'excel'],
      requiresDateRange: true,
      requiresFilters: true
    },
    {
      id: 'salary-summary',
      name: 'Résumé des salaires',
      description: 'Masse salariale et répartition des coûts',
      icon: DollarSign,
      category: 'financial',
      format: ['pdf', 'excel'],
      requiresDateRange: true,
      requiresFilters: false
    },
    {
      id: 'hr-dashboard',
      name: 'Tableau de bord RH',
      description: 'Vue d\'ensemble complète des ressources humaines',
      icon: BarChart3,
      category: 'personnel',
      format: ['pdf'],
      requiresDateRange: true,
      requiresFilters: false
    },
    {
      id: 'performance-analytics',
      name: 'Analyses de performance',
      description: 'Analyses détaillées des performances individuelles et collectives',
      icon: TrendingUp,
      category: 'evaluations',
      format: ['pdf', 'excel'],
      requiresDateRange: true,
      requiresFilters: true
    }
  ];
  
  // Charger les rapports existants
  const fetchReports = async () => {
    if (!user?.schoolId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implémenter la récupération des rapports existants
      setReports([]);
    } catch (err) {
      console.error('Erreur lors du chargement des rapports:', err);
      setError('Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReports();
  }, [user?.schoolId]);
  
  // Générer un rapport
  const generateReport = async () => {
    if (!selectedReport || !user?.schoolId) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const reportData = await hrService.generateHRReport(
        user.schoolId,
        selectedReport.id,
        {
          dateRange,
          filters,
          format: selectedFormat
        }
      );
      
      setGeneratedReport(reportData);
    } catch (err) {
      console.error('Erreur lors de la génération du rapport:', err);
      setError('Erreur lors de la génération du rapport');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Exporter un rapport
  const exportReport = async (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    if (!user?.schoolId) return;
    
    try {
      const exportData = await hrService.exportHRData(user.schoolId, reportId, format);
      
      // Créer un lien de téléchargement
      const blob = new Blob([exportData], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-${reportId}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      setError('Erreur lors de l\'export du rapport');
    }
  };
  
  // Filtrer les rapports par catégorie
  const getReportsByCategory = (category: string) => {
    return reportConfigs.filter(report => report.category === category);
  };
  
  // Obtenir l'icône de catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'personnel': return Users;
      case 'contracts': return FileText;
      case 'evaluations': return Award;
      case 'training': return GraduationCap;
      case 'leaves': return Calendar;
      case 'financial': return DollarSign;
      default: return FileText;
    }
  };
  
  // Obtenir la couleur de catégorie
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personnel': return 'from-blue-500 to-blue-600';
      case 'contracts': return 'from-green-500 to-green-600';
      case 'evaluations': return 'from-orange-500 to-orange-600';
      case 'training': return 'from-purple-500 to-purple-600';
      case 'leaves': return 'from-indigo-500 to-indigo-600';
      case 'financial': return 'from-emerald-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Rapports RH
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Générez et exportez des rapports détaillés sur les ressources humaines
          </p>
        </div>
        <button
          onClick={fetchReports}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </button>
      </div>
      
      {/* Statistiques des rapports */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rapports disponibles</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reportConfigs.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rapports générés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reports.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En cours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Catégories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">6</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Catégories de rapports */}
      <div className="space-y-6">
        {['personnel', 'contracts', 'evaluations', 'training', 'leaves', 'financial'].map(category => {
          const categoryReports = getReportsByCategory(category);
          const CategoryIcon = getCategoryIcon(category);
          const categoryColor = getCategoryColor(category);
          
          if (categoryReports.length === 0) return null;
          
          return (
            <div key={category} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className={`p-2 bg-gradient-to-r ${categoryColor} rounded-lg`}>
                    <CategoryIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {category === 'personnel' ? 'Personnel' :
                       category === 'contracts' ? 'Contrats' :
                       category === 'evaluations' ? 'Évaluations' :
                       category === 'training' ? 'Formations' :
                       category === 'leaves' ? 'Congés' :
                       category === 'financial' ? 'Financier' : category}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {categoryReports.length} rapport{categoryReports.length > 1 ? 's' : ''} disponible{categoryReports.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryReports.map(report => {
                    const ReportIcon = report.icon;
                    
                    return (
                      <div
                        key={report.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <ReportIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {report.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {report.description}
                            </p>
                            <div className="mt-2 flex items-center space-x-2">
                              {report.format.map(format => (
                                <span
                                  key={format}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {format.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Modal de génération de rapport */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {selectedReport.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="sr-only">Fermer</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Sélection du format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Format d'export
                </label>
                <div className="flex space-x-2">
                  {selectedReport.format.map(format => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedFormat === format
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Période (si requise) */}
              {selectedReport.requiresDateRange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Période
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        aria-label="Date de début"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        aria-label="Date de fin"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Filtres (si requis) */}
              {selectedReport.requiresFilters && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filtres
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Département
                      </label>
                      <select
                        value={filters.department || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        aria-label="Filtrer par département"
                      >
                        <option value="">Tous les départements</option>
                        <option value="pedagogical">Pédagogique</option>
                        <option value="administrative">Administratif</option>
                        <option value="technical">Technique</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Statut
                      </label>
                      <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        aria-label="Filtrer par statut"
                      >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                        <option value="on-leave">En congé</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Génération...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Générer le rapport
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rapport généré */}
      {generatedReport && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-900/30">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-green-900 dark:text-green-300">
                Rapport généré avec succès
              </h3>
              <p className="text-sm text-green-800 dark:text-green-400">
                Votre rapport a été généré et est prêt à être téléchargé.
              </p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={() => exportReport(generatedReport.id, selectedFormat)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </button>
            
            <button
              onClick={() => setGeneratedReport(null)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-900/30">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRReports;
