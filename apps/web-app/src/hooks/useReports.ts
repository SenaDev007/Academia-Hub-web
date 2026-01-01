import { useState, useEffect, useCallback } from 'react';
import { financeService, FinancialReport, ReportTemplate, ReportStats } from '../services/financeService';
import { useUser } from '../contexts/UserContext';

export const useReports = () => {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useUser();

  // Charger les rapports financiers
  const fetchReports = useCallback(async (filters?: any) => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching reports');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Chargement des rapports financiers...', { schoolId: user.schoolId, filters });
      
      const reportsData = await financeService.getFinancialReports(user.schoolId, filters);
      
      console.log('✅ Rapports financiers chargés:', reportsData);
      
      // Traiter la réponse de l'API (qui peut être un tableau ou un objet avec success/data)
      if (Array.isArray(reportsData)) {
        setReports(reportsData);
      } else if (reportsData && typeof reportsData === 'object' && 'data' in reportsData) {
        setReports(reportsData.data || []);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des rapports:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  }, [user?.schoolId]);

  // Charger les modèles de rapports
  const fetchReportTemplates = useCallback(async () => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching report templates');
      return;
    }

    try {
      console.log('🔍 Chargement des modèles de rapports...', { schoolId: user.schoolId });
      
      const templates = await financeService.getReportTemplates(user.schoolId);
      
      console.log('✅ Modèles de rapports chargés:', templates);
      
      // Traiter la réponse de l'API (qui peut être un tableau ou un objet avec success/data)
      if (Array.isArray(templates)) {
        setReportTemplates(templates);
      } else if (templates && typeof templates === 'object' && 'data' in templates) {
        setReportTemplates(templates.data || []);
      } else {
        setReportTemplates([]);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des modèles:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des modèles');
    }
  }, [user?.schoolId]);

  // Charger les statistiques des rapports
  const fetchReportStats = useCallback(async () => {
    if (!user?.schoolId) {
      console.warn('School ID not available for fetching report stats');
      return;
    }

    try {
      console.log('🔍 Chargement des statistiques des rapports...', { schoolId: user.schoolId });
      
      const stats = await financeService.getReportStats(user.schoolId);
      
      console.log('✅ Statistiques des rapports chargées:', stats);
      setReportStats(stats);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des statistiques:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    }
  }, [user?.schoolId]);

  // Générer un rapport
  const generateReport = useCallback(async (templateId: string, filters: any) => {
    if (!user?.schoolId || !user?.id) {
      throw new Error('School ID or User ID not available');
    }

    try {
      console.log('🔍 Génération d\'un rapport...', { templateId, filters, generatedBy: user.id });
      
      const newReport = await financeService.generateFinancialReport(templateId, {
        ...filters,
        schoolId: user.schoolId
      }, user.id);
      
      console.log('✅ Rapport généré:', newReport);
      
      // Ajouter le nouveau rapport à la liste
      setReports(prev => [newReport, ...prev]);
      
      return newReport;
    } catch (err) {
      console.error('❌ Erreur lors de la génération du rapport:', err);
      throw err;
    }
  }, [user?.schoolId, user?.id]);

  // Créer un modèle de rapport
  const createReportTemplate = useCallback(async (templateData: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Création d\'un modèle de rapport...', templateData);
      
      const newTemplate = await financeService.createReportTemplate({
        ...templateData,
        schoolId: user.schoolId
      });
      
      console.log('✅ Modèle de rapport créé:', newTemplate);
      
      // Ajouter le nouveau modèle à la liste
      setReportTemplates(prev => [newTemplate, ...prev]);
      
      return newTemplate;
    } catch (err) {
      console.error('❌ Erreur lors de la création du modèle:', err);
      throw err;
    }
  }, [user?.schoolId]);

  // Modifier un modèle de rapport
  const updateReportTemplate = useCallback(async (id: string, templateData: Partial<ReportTemplate>) => {
    if (!user?.schoolId) {
      throw new Error('School ID not available');
    }

    try {
      console.log('🔍 Modification d\'un modèle de rapport...', { id, templateData });
      
      const updatedTemplate = await financeService.updateReportTemplate(id, templateData);
      
      console.log('✅ Modèle de rapport modifié:', updatedTemplate);
      
      // Mettre à jour le modèle dans la liste
      setReportTemplates(prev => prev.map(template => 
        template.id === id ? updatedTemplate : template
      ));
      
      return updatedTemplate;
    } catch (err) {
      console.error('❌ Erreur lors de la modification du modèle:', err);
      throw err;
    }
  }, [user?.schoolId]);

  // Supprimer un modèle de rapport
  const deleteReportTemplate = useCallback(async (id: string) => {
    try {
      console.log('🔍 Suppression d\'un modèle de rapport...', id);
      
      await financeService.deleteReportTemplate(id);
      
      console.log('✅ Modèle de rapport supprimé:', id);
      
      // Supprimer le modèle de la liste
      setReportTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      console.error('❌ Erreur lors de la suppression du modèle:', err);
      throw err;
    }
  }, []);

  // Supprimer un rapport
  const deleteReport = useCallback(async (id: string) => {
    try {
      console.log('🔍 Suppression d\'un rapport...', id);
      
      await financeService.deleteFinancialReport(id);
      
      console.log('✅ Rapport supprimé:', id);
      
      // Supprimer le rapport de la liste
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      console.error('❌ Erreur lors de la suppression du rapport:', err);
      throw err;
    }
  }, []);

  // Actualiser toutes les données
  const refreshData = useCallback(async (filters?: any) => {
    await Promise.all([
      fetchReports(filters),
      fetchReportTemplates(),
      fetchReportStats()
    ]);
  }, [fetchReports, fetchReportTemplates, fetchReportStats]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (user?.schoolId) {
      refreshData();
    }
  }, [user?.schoolId, refreshData]);

  return {
    reports,
    reportTemplates,
    reportStats,
    loading,
    error,
    fetchReports,
    fetchReportTemplates,
    fetchReportStats,
    generateReport,
    createReportTemplate,
    updateReportTemplate,
    deleteReportTemplate,
    deleteReport,
    refreshData
  };
};
