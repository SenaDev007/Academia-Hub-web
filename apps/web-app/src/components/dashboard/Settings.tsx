import React, { useState } from 'react';
import { useAcademicYearState } from '../../hooks/useAcademicYearState';
import AcademicYearSelector from '../common/AcademicYearSelector';
import CurrentAcademicYearDisplay from '../common/CurrentAcademicYearDisplay';
import { 
  Settings as SettingsIcon, 
  School, 
  Users, 
  Shield, 
  Bell,
  CreditCard,
  Database,
  Save,
  Upload,
  Download,
  FileText,
  RefreshCw,
  Trash2
} from 'lucide-react';
import DocumentSettings from '../settings/DocumentSettings';
import { storageDashboardService, RealTimeStorageData, RealTimeSyncData, RealTimePerformanceData, FileCategoryData } from '../../services/storageDashboardService';
import { useSchoolSettingsContext } from '../../contexts/SchoolSettingsContext';


// Liste des 12 départements du Bénin
const BENIN_DEPARTMENTS = [
  { value: 'atacora', label: 'Atacora' },
  { value: 'atlantique', label: 'Atlantique' },
  { value: 'borgou', label: 'Borgou' },
  { value: 'collines', label: 'Collines' },
  { value: 'couffo', label: 'Couffo' },
  { value: 'donga', label: 'Donga' },
  { value: 'littoral', label: 'Littoral' },
  { value: 'mono', label: 'Mono' },
  { value: 'oueme', label: 'Ouémé' },
  { value: 'plateau', label: 'Plateau' },
  { value: 'zou', label: 'Zou' },
  { value: 'alibori', label: 'Alibori' }
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('school');
  
  // Gestion de l'année scolaire
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('settings');
  
  // États pour les données en temps réel
  const [storageData, setStorageData] = useState<RealTimeStorageData | null>(null);
  const [syncData, setSyncData] = useState<RealTimeSyncData | null>(null);
  const [performanceData, setPerformanceData] = useState<RealTimePerformanceData | null>(null);
  const [fileData, setFileData] = useState<FileCategoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setLastUpdate] = useState<Date>(new Date());

  // États pour la gestion du logo
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // États pour les niveaux d'enseignement sélectionnés
  const [selectedLevels, setSelectedLevels] = useState({
    maternelle: false,
    primaire: false,
    college: false,
    lycee: false
  });

  // États pour les classes sélectionnées par niveau
  const [selectedClasses, setSelectedClasses] = useState({
    maternelle: {
      ps: false,
      ms: false,
      gs: false
    },
    primaire: {
      ci: false,
      cp: false,
      ce1: false,
      ce2: false,
      cm1: false,
      cm2: false
    },
    college: {
      sixieme: false,
      cinquieme: false,
      quatrieme: false,
      troisieme: false
    },
    lycee: {
      seconde: false,
      premiere: false,
      terminale: false
    }
  });

  // Hook pour la gestion des paramètres d'école
  const {
    settings: schoolSettings,
    loading: settingsLoading,
    error: settingsError,
    success: settingsSuccess,
    loadSettings: loadSchoolSettings,
    saveSettings: saveSchoolSettings,
    resetSettings: resetSchoolSettings,
    updateSetting: handleSettingsChange,
    setError,
    setSuccess
  } = useSchoolSettingsContext();

  const settingsTabs = [
    { id: 'school', label: 'Établissement', icon: School },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'data', label: 'Stockage & Sync', icon: Database },
    { id: 'system', label: 'Système', icon: SettingsIcon }
  ];


  // Fonctions de gestion des données
  const refreshAllData = async () => {
    setLoading(true);
    try {
      await storageDashboardService.refreshAllData();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour changer le logo avec gestion d'erreur robuste
  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Réinitialiser les états
    setLogoError(null);
    setLogoLoading(true);

    try {
      // Vérifier la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Le fichier est trop volumineux. Taille maximale : 2MB');
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Format de fichier non supporté. Formats acceptés : JPG, PNG, SVG');
      }

      // Créer une preview immédiate pour l'UX
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      // Convertir en base64 de manière asynchrone
      const logoData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            resolve(result);
          } else {
            reject(new Error('Erreur lors de la lecture du fichier'));
          }
        };
        reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
        reader.readAsDataURL(file);
      });

      // Mettre à jour les paramètres
      handleSettingsChange('logo', logoData);
      setSuccess('Logo mis à jour avec succès');
      setTimeout(() => setSuccess(null), 3000);

      // Nettoyer la preview temporaire
      URL.revokeObjectURL(previewUrl);
      setLogoPreview(null);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement du logo';
      setLogoError(errorMessage);
      setError(errorMessage);
      console.error('Erreur lors du chargement du logo:', error);
    } finally {
      setLogoLoading(false);
      // Réinitialiser l'input file
      event.target.value = '';
    }
  };

  // Fonction pour supprimer le logo avec confirmation
  const handleLogoDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer le logo ?')) {
      setLogoError(null);
      setLogoPreview(null);
      handleSettingsChange('logo', '');
      setSuccess('Logo supprimé avec succès');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Fonction pour changer la couleur principale
  const handlePrimaryColorChange = (color: string) => {
    handleSettingsChange('primaryColor', color);
  };

  // Fonction pour changer la couleur secondaire
  const handleSecondaryColorChange = (color: string) => {
    handleSettingsChange('secondaryColor', color);
  };

  // Fonction pour gérer la sélection des niveaux d'enseignement
  const handleLevelToggle = (level: keyof typeof selectedLevels) => {
    const newSelectedLevels = {
      ...selectedLevels,
      [level]: !selectedLevels[level]
    };
    setSelectedLevels(newSelectedLevels);

    // Si on sélectionne un niveau, sélectionner toutes ses classes
    if (!selectedLevels[level]) {
      // Sélectionner toutes les classes du niveau
      const allClassesSelected = getDefaultClassesForLevel(level);
      setSelectedClasses(prev => ({
        ...prev,
        [level]: allClassesSelected
      }));
    } else {
      // Désélectionner toutes les classes du niveau
      const noClassesSelected = getEmptyClassesForLevel(level);
      setSelectedClasses(prev => ({
        ...prev,
        [level]: noClassesSelected
      }));
    }

    // Construire la chaîne des niveaux sélectionnés
    const selectedLevelsArray = Object.entries(newSelectedLevels)
      .filter(([_, isSelected]) => isSelected)
      .map(([level, _]) => level);

    // Mapper les niveaux internes vers les valeurs d'éducation
    const educationLevelsMap: Record<string, string> = {
      maternelle: 'maternelle',
      primaire: 'primaire',
      college: 'college',
      lycee: 'lycee'
    };

    const educationLevels = selectedLevelsArray
      .map(level => educationLevelsMap[level])
      .join('-');

    handleSettingsChange('educationLevels', educationLevels || '');
  };

  // Fonction pour obtenir toutes les classes sélectionnées par défaut pour un niveau
  const getDefaultClassesForLevel = (level: keyof typeof selectedLevels) => {
    switch (level) {
      case 'maternelle':
        return { ps: true, ms: true, gs: true };
      case 'primaire':
        return { ci: true, cp: true, ce1: true, ce2: true, cm1: true, cm2: true };
      case 'college':
        return { sixieme: true, cinquieme: true, quatrieme: true, troisieme: true };
      case 'lycee':
        return { seconde: true, premiere: true, terminale: true };
      default:
        return {};
    }
  };

  // Fonction pour obtenir un objet vide de classes pour un niveau
  const getEmptyClassesForLevel = (level: keyof typeof selectedLevels) => {
    switch (level) {
      case 'maternelle':
        return { ps: false, ms: false, gs: false };
      case 'primaire':
        return { ci: false, cp: false, ce1: false, ce2: false, cm1: false, cm2: false };
      case 'college':
        return { sixieme: false, cinquieme: false, quatrieme: false, troisieme: false };
      case 'lycee':
        return { seconde: false, premiere: false, terminale: false };
      default:
        return {};
    }
  };

  // Fonction pour gérer la sélection d'une classe individuelle
  const handleClassToggle = (level: keyof typeof selectedClasses, classKey: string) => {
    setSelectedClasses(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [classKey]: !prev[level][classKey as keyof typeof prev[typeof level]]
      }
    }));

    // Vérifier si toutes les classes du niveau sont sélectionnées
    const updatedClasses = {
      ...selectedClasses[level],
      [classKey]: !selectedClasses[level][classKey as keyof typeof selectedClasses[typeof level]]
    };
    
    const allClassesSelected = Object.values(updatedClasses).every(Boolean);
    const noClassesSelected = Object.values(updatedClasses).every(value => !value);

    // Mettre à jour le niveau principal
    if (allClassesSelected && !selectedLevels[level]) {
      setSelectedLevels(prev => ({ ...prev, [level]: true }));
    } else if (noClassesSelected && selectedLevels[level]) {
      setSelectedLevels(prev => ({ ...prev, [level]: false }));
    }
  };

  // Fonction pour initialiser les niveaux sélectionnés à partir des paramètres
  const initializeSelectedLevels = (educationLevels: string) => {
    if (!educationLevels) return;
    
    const levels = educationLevels.split('-');
    setSelectedLevels({
      maternelle: levels.includes('maternelle'),
      primaire: levels.includes('primaire'),
      college: levels.includes('college'),
      lycee: levels.includes('lycee')
    });

    // Initialiser toutes les classes pour les niveaux sélectionnés
    levels.forEach(level => {
      if (level === 'maternelle' || level === 'primaire' || level === 'college' || level === 'lycee') {
        const allClasses = getDefaultClassesForLevel(level);
        setSelectedClasses(prev => ({
          ...prev,
          [level]: allClasses
        }));
      }
    });
  };

  const preloadFrequentData = async () => {
    setLoading(true);
    try {
      await storageDashboardService.preloadFrequentData();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error preloading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceSync = async () => {
    setLoading(true);
    try {
      await storageDashboardService.forceSync();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error forcing sync:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    setLoading(true);
    try {
      await storageDashboardService.clearCache();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setLoading(false);
    }
  };

  const preloadData = async () => {
    setLoading(true);
    try {
      await storageDashboardService.preloadData();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error preloading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDiskSpace = async () => {
    setLoading(true);
    try {
      const analysis = await storageDashboardService.analyzeDiskSpace();
      console.log('Disk space analysis:', analysis);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error analyzing disk space:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupOldFiles = async () => {
    setLoading(true);
    try {
      await storageDashboardService.cleanupOldFiles();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIntegrity = async () => {
    setLoading(true);
    try {
      const integrity = await storageDashboardService.checkIntegrity();
      console.log('Integrity check:', integrity);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error checking integrity:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportMetrics = async () => {
    setLoading(true);
    try {
      const metrics = await storageDashboardService.exportMetrics();
      console.log('Exported metrics:', metrics);
      // Ici vous pourriez télécharger le fichier JSON
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error exporting metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupLogs = async () => {
    setLoading(true);
    try {
      await storageDashboardService.cleanupLogs();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error cleaning up logs:', error);
    } finally {
      setLoading(false);
    }
  };


  // useEffect pour les données en temps réel
  React.useEffect(() => {
    if (activeTab === 'data') {
      // S'abonner aux mises à jour en temps réel
      const unsubscribeStorage = storageDashboardService.onStorageUpdate(setStorageData);
      const unsubscribeSync = storageDashboardService.onSyncUpdate(setSyncData);
      const unsubscribePerformance = storageDashboardService.onPerformanceUpdate(setPerformanceData);
      const unsubscribeFiles = storageDashboardService.onFileUpdate(setFileData);

      // Charger les données initiales
      refreshAllData();

      // Nettoyer les abonnements
      return () => {
        unsubscribeStorage();
        unsubscribeSync();
        unsubscribePerformance();
        unsubscribeFiles();
      };
    }
  }, [activeTab]);

  // Nettoyage des URLs d'objets au démontage
  React.useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  // Initialiser les niveaux sélectionnés quand les paramètres changent
  React.useEffect(() => {
    if (schoolSettings.educationLevels) {
      initializeSelectedLevels(schoolSettings.educationLevels);
    }
  }, [schoolSettings.educationLevels]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-600 rounded-2xl p-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
              <p className="text-slate-100">
                Configuration et gestion de votre établissement
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Affichage de l'année scolaire actuelle */}
              <CurrentAcademicYearDisplay variant="compact" className="text-white" />
              
              {/* Sélecteur d'année scolaire */}
              <AcademicYearSelector
                value={selectedAcademicYear}
                onChange={setSelectedAcademicYear}
                className="w-full sm:w-auto min-w-[200px]"
              />
              
              <button 
                onClick={refreshAllData}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full"></div>
      </div>

      {/* Settings Navigation - Horizontal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                      activeTab === tab.id
                      ? 'border-slate-500 text-slate-600 dark:text-slate-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            {activeTab === 'school' && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <School className="w-4 h-4 text-white" />
                      </div>
                      Informations de l'établissement
                    </h2>
                    <div className="flex space-x-3">
                      <button 
                        onClick={resetSchoolSettings}
                        disabled={settingsLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        <RefreshCw className={`w-4 h-4 mr-2 ${settingsLoading ? 'animate-spin' : ''}`} />
                        Réinitialiser
                      </button>
                    <button 
                      onClick={() => saveSchoolSettings(schoolSettings)}
                      disabled={settingsLoading}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                      <Save className={`w-4 h-4 mr-2 ${settingsLoading ? 'animate-spin' : ''}`} />
                      Sauvegarder
                    </button>
                    </div>
                  </div>
                </div>

                {/* Messages de feedback */}
                {settingsError && (
                  <div className="mx-6 mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800 dark:text-red-200">{settingsError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {settingsSuccess && (
                  <div className="mx-6 mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-800 dark:text-green-200">{settingsSuccess}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-8">
                  {/* Informations générales */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <School className="w-3 h-3 text-white" />
                      </div>
                      Informations générales
                    </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Nom de l'établissement *
                      </label>
                      <input
                        type="text"
                        value={schoolSettings.name}
                        onChange={(e) => handleSettingsChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                          placeholder="Entrez le nom de votre établissement"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Abréviation du nom
                      </label>
                      <input
                        type="text"
                        value={schoolSettings.abbreviation}
                        onChange={(e) => handleSettingsChange('abbreviation', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        placeholder="Ex: EPP, Collège ABC, Lycée XYZ"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Niveaux d'enseignement *
                      </label>
                      <select 
                        value={schoolSettings.educationLevels}
                        onChange={(e) => handleSettingsChange('educationLevels', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200">
                          <option value="">Sélectionner les niveaux</option>
                          <option value="maternelle-primaire">Maternelle + Primaire</option>
                          <option value="maternelle-secondaire">Maternelle + Primaire + Secondaire</option>
                      </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Sélectionnez les niveaux d'enseignement de votre établissement
                        </p>
                      </div>


                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Devise
                        </label>
                        <input
                          type="text"
                          value={schoolSettings.motto}
                          onChange={(e) => handleSettingsChange('motto', e.target.value)}
                          placeholder="Ex: Excellence, Innovation, Réussite"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Slogan
                        </label>
                        <input
                          type="text"
                          value={schoolSettings.slogan}
                          onChange={(e) => handleSettingsChange('slogan', e.target.value)}
                          placeholder="Ex: L'éducation au service de l'avenir"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        />
                    </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Cycles d'enseignement proposés
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {/* Maternelle */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg border border-pink-200 dark:border-pink-700">
                              <input 
                                type="checkbox" 
                                checked={selectedLevels.maternelle}
                                onChange={() => handleLevelToggle('maternelle')}
                                className="w-5 h-5 text-pink-600 border-gray-300 rounded focus:ring-pink-500" 
                              />
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Maternelle</h4>
                            </div>
                            {selectedLevels.maternelle && (
                              <div className="space-y-2 ml-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.maternelle.ps}
                                    onChange={() => handleClassToggle('maternelle', 'ps')}
                                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">PS (Petite Section)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.maternelle.ms}
                                    onChange={() => handleClassToggle('maternelle', 'ms')}
                                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">MS (Moyenne Section)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.maternelle.gs}
                                    onChange={() => handleClassToggle('maternelle', 'gs')}
                                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">GS (Grande Section)</span>
                                </label>
                              </div>
                            )}
                          </div>
                          
                          {/* Primaire */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                              <input 
                                type="checkbox" 
                                checked={selectedLevels.primaire}
                                onChange={() => handleLevelToggle('primaire')}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                              />
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Primaire</h4>
                            </div>
                            {selectedLevels.primaire && (
                              <div className="space-y-2 ml-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.primaire.ci}
                                    onChange={() => handleClassToggle('primaire', 'ci')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">CI (Cours d'Initiation)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.primaire.cp}
                                    onChange={() => handleClassToggle('primaire', 'cp')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">CP (Cours Préparatoire)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.primaire.ce1}
                                    onChange={() => handleClassToggle('primaire', 'ce1')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">CE1 (Cours Élémentaire 1)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.primaire.ce2}
                                    onChange={() => handleClassToggle('primaire', 'ce2')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">CE2 (Cours Élémentaire 2)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.primaire.cm1}
                                    onChange={() => handleClassToggle('primaire', 'cm1')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">CM1 (Cours Moyen 1)</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.primaire.cm2}
                                    onChange={() => handleClassToggle('primaire', 'cm2')}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">CM2 (Cours Moyen 2)</span>
                                </label>
                              </div>
                            )}
                          </div>
                          
                          {/* Collège */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                              <input 
                                type="checkbox" 
                                checked={selectedLevels.college}
                                onChange={() => handleLevelToggle('college')}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500" 
                              />
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Collège</h4>
                            </div>
                            {selectedLevels.college && (
                              <div className="space-y-2 ml-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.college.sixieme}
                                    onChange={() => handleClassToggle('college', 'sixieme')}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">6ème</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.college.cinquieme}
                                    onChange={() => handleClassToggle('college', 'cinquieme')}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">5ème</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.college.quatrieme}
                                    onChange={() => handleClassToggle('college', 'quatrieme')}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">4ème</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.college.troisieme}
                                    onChange={() => handleClassToggle('college', 'troisieme')}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">3ème</span>
                                </label>
                              </div>
                            )}
                          </div>
                          
                          {/* Lycée */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                              <input 
                                type="checkbox" 
                                checked={selectedLevels.lycee}
                                onChange={() => handleLevelToggle('lycee')}
                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
                              />
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Lycée</h4>
                            </div>
                            {selectedLevels.lycee && (
                              <div className="space-y-2 ml-2">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.lycee.seconde}
                                    onChange={() => handleClassToggle('lycee', 'seconde')}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">2nde</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.lycee.premiere}
                                    onChange={() => handleClassToggle('lycee', 'premiere')}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">1ère</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedClasses.lycee.terminale}
                                    onChange={() => handleClassToggle('lycee', 'terminale')}
                                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" 
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">Tle</span>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Sélectionnez les niveaux d'enseignement que propose votre établissement
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact et localisation */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      Contact et localisation
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Adresse complète *
                      </label>
                      <textarea
                        rows={3}
                        value={schoolSettings.address}
                        onChange={(e) => handleSettingsChange('address', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        placeholder="Entrez l'adresse complète de votre établissement"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Département *
                      </label>
                      <select
                        value={schoolSettings.department || ''}
                        onChange={(e) => handleSettingsChange('department', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        aria-label="Sélectionner un département"
                        title="Sélectionner un département"
                      >
                        <option value="">Sélectionnez un département</option>
                        {BENIN_DEPARTMENTS.map((dept) => (
                          <option key={dept.value} value={dept.value}>
                            {dept.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Commune
                      </label>
                      <input
                        type="text"
                        value={schoolSettings.commune || ''}
                        onChange={(e) => handleSettingsChange('commune', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        placeholder="Ex: Cotonou, Porto-Novo, Parakou..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Téléphone principal *
                      </label>
                      <input
                        type="tel"
                        value={schoolSettings.primaryPhone}
                        onChange={(e) => handleSettingsChange('primaryPhone', e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value && !value.startsWith('+229')) {
                            handleSettingsChange('primaryPhone', '+229 ' + value);
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        placeholder="Ex: +229 01XXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Téléphone secondaire
                        </label>
                        <input
                          type="tel"
                          value={schoolSettings.secondaryPhone}
                          onChange={(e) => handleSettingsChange('secondaryPhone', e.target.value)}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value && !value.startsWith('+229')) {
                              handleSettingsChange('secondaryPhone', '+229 ' + value);
                            }
                          }}
                          placeholder="Ex: +229 01XXXXXXXX"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Email principal *
                      </label>
                      <input
                        type="email"
                        value={schoolSettings.primaryEmail}
                        onChange={(e) => handleSettingsChange('primaryEmail', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        placeholder="Ex: contact@ecole.fr"
                      />
                    </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Site web
                        </label>
                        <input
                          type="url"
                          value={schoolSettings.website}
                          onChange={(e) => handleSettingsChange('website', e.target.value)}
                          placeholder="Ex: https://www.ecole.fr"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          N° WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={schoolSettings.whatsapp}
                          onChange={(e) => handleSettingsChange('whatsapp', e.target.value)}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value && !value.startsWith('+229')) {
                              handleSettingsChange('whatsapp', '+229 ' + value);
                            }
                          }}
                          placeholder="Ex: +229 XXXXXXXX"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Numéro WhatsApp pour la communication avec les parents
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logo et identité visuelle */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      Logo et identité visuelle
                    </h3>
                    <div className="space-y-6">
                      <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Logo de l'établissement
                      </label>
                        <div className="flex items-center space-x-6">
                          <div className={`w-20 h-20 rounded-xl flex items-center justify-center shadow-lg overflow-hidden relative ${
                            (schoolSettings.logo || logoPreview) 
                              ? 'bg-white border-2 border-gray-200' 
                              : 'bg-gradient-to-r from-blue-600 to-purple-600'
                          }`}>
                            {logoLoading ? (
                              <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="text-xs text-gray-500 mt-1">Chargement...</span>
                              </div>
                            ) : logoError ? (
                              <div className="flex flex-col items-center justify-center text-red-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span className="text-xs mt-1">Erreur</span>
                              </div>
                            ) : (schoolSettings.logo || logoPreview) ? (
                              <img 
                                src={logoPreview || schoolSettings.logo} 
                                alt="Logo de l'établissement" 
                                className="w-full h-full object-contain p-2"
                                onError={() => setLogoError('Erreur lors du chargement de l\'image')}
                                onLoad={() => setLogoError(null)}
                              />
                            ) : (
                              <School className="w-10 h-10 text-white" />
                            )}
                        </div>
                          <div className="flex-1">
                            <div className="flex space-x-3">
                              <label className={`inline-flex items-center px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer ${
                                logoLoading 
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                              }`}>
                          {logoLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {logoLoading ? 'Chargement...' : 'Changer le logo'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/svg+xml"
                            onChange={handleLogoChange}
                            disabled={logoLoading}
                            className="hidden"
                          />
                        </label>
                              <button 
                                onClick={handleLogoDelete}
                                disabled={logoLoading || !schoolSettings.logo}
                                className={`inline-flex items-center px-4 py-2 border rounded-xl transition-all duration-200 ${
                                  logoLoading || !schoolSettings.logo
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </button>
                      </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Formats acceptés: JPG, PNG, SVG (max. 2MB)
                            </p>
                            {logoError && (
                              <p className="text-xs text-red-500 mt-2 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {logoError}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Couleur principale
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={schoolSettings.primaryColor}
                              onChange={(e) => handlePrimaryColorChange(e.target.value)}
                              className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={schoolSettings.primaryColor}
                              onChange={(e) => handlePrimaryColorChange(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              placeholder="#3B82F6"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Couleur secondaire
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={schoolSettings.secondaryColor}
                              onChange={(e) => handleSecondaryColorChange(e.target.value)}
                              className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                            />
                            <input
                              type="text"
                              value={schoolSettings.secondaryColor}
                              onChange={(e) => handleSecondaryColorChange(e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                              placeholder="#8B5CF6"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations pédagogiques */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      Informations pédagogiques
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Nom du fondateur
                        </label>
                        <input
                          type="text"
                          value={schoolSettings.founderName}
                          onChange={(e) => handleSettingsChange('founderName', e.target.value)}
                          placeholder="Ex: M. Koffi Amédée"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Directeur/Chef d'établissement (Maternelle & Primaire)
                        </label>
                        <input
                          type="text"
                          value={schoolSettings.directorPrimary}
                          onChange={(e) => handleSettingsChange('directorPrimary', e.target.value)}
                          placeholder="Ex: M. Dupont Jean"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Directeur/Chef d'établissement (Secondaire)
                        </label>
                        <input
                          type="text"
                          value={schoolSettings.directorSecondary}
                          onChange={(e) => handleSettingsChange('directorSecondary', e.target.value)}
                          placeholder="Ex: Mme Martin Sophie"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                        />
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Gestion des utilisateurs
                    </h2>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <Users className="w-4 h-4 mr-2" />
                      Ajouter utilisateur
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Administrateurs</h3>
                      <span className="text-2xl font-bold text-blue-600">3</span>
                    </div>
                    <p className="text-sm text-gray-600">Accès complet à tous les modules</p>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Enseignants</h3>
                      <span className="text-2xl font-bold text-green-600">45</span>
                    </div>
                    <p className="text-sm text-gray-600">Accès aux modules pédagogiques</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Personnel</h3>
                      <span className="text-2xl font-bold text-purple-600">12</span>
                    </div>
                    <p className="text-sm text-gray-600">Accès limité selon le rôle</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Rôles et permissions</h3>
                  
                  <div className="space-y-3">
                    {['Directeur', 'Enseignant', 'Secrétaire', 'Comptable', 'Surveillant'].map((role, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{role}</h4>
                          <p className="text-sm text-gray-600">
                            {role === 'Directeur' ? 'Accès complet à tous les modules' :
                             role === 'Enseignant' ? 'Notes, emploi du temps, communication' :
                             role === 'Secrétaire' ? 'Élèves, communication, documents' :
                             role === 'Comptable' ? 'Finance, paiements, rapports' :
                             'Absences, discipline, surveillance'}
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Modifier
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      Sécurité et confidentialité
                    </h2>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <Shield className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                        Authentification
                      </h3>
                      
                      <div className="space-y-4">
                        <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-red-600 border-gray-300 dark:border-gray-500 rounded focus:ring-red-500 focus:ring-2" />
                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Authentification à deux facteurs obligatoire</span>
                        </label>
                        
                        <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-red-600 border-gray-300 dark:border-gray-500 rounded focus:ring-red-500 focus:ring-2" />
                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Expiration automatique des sessions (30 min)</span>
                        </label>
                        
                        <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <input type="checkbox" className="w-5 h-5 text-red-600 border-gray-300 dark:border-gray-500 rounded focus:ring-red-500 focus:ring-2" />
                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Connexion par empreinte digitale</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                        Politique de mot de passe
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Longueur minimale
                          </label>
                          <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 transition-all duration-200">
                            <option>8 caractères</option>
                            <option>10 caractères</option>
                            <option>12 caractères</option>
                          </select>
                        </div>
                        
                        <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-red-600 border-gray-300 dark:border-gray-500 rounded focus:ring-red-500 focus:ring-2" />
                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Caractères spéciaux obligatoires</span>
                        </label>
                        
                        <label className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-red-600 border-gray-300 dark:border-gray-500 rounded focus:ring-red-500 focus:ring-2" />
                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">Renouvellement tous les 90 jours</span>
                        </label>
                    </div>
                  </div>
                </div>

                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-6 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                      Zone de danger
                    </h3>
                    <div className="space-y-4">
                      <button className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                        Réinitialiser tous les mots de passe
                      </button>
                      <button className="w-full px-4 py-3 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200">
                        Exporter les logs de sécurité
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <Bell className="w-4 h-4 text-white" />
                      </div>
                      Paramètres de notification
                    </h2>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <Bell className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                          <Bell className="w-3 h-3 text-white" />
                        </div>
                        Notifications système
                      </h3>
                      
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Nouvelles inscriptions</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-yellow-600 border-gray-300 dark:border-gray-500 rounded focus:ring-yellow-500 focus:ring-2" />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Paiements reçus</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-yellow-600 border-gray-300 dark:border-gray-500 rounded focus:ring-yellow-500 focus:ring-2" />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Absences non justifiées</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-yellow-600 border-gray-300 dark:border-gray-500 rounded focus:ring-yellow-500 focus:ring-2" />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Incidents disciplinaires</span>
                          <input type="checkbox" className="w-5 h-5 text-yellow-600 border-gray-300 dark:border-gray-500 rounded focus:ring-yellow-500 focus:ring-2" />
                        </label>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                          <Bell className="w-3 h-3 text-white" />
                        </div>
                        Canaux de notification
                      </h3>
                      
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-yellow-600 border-gray-300 dark:border-gray-500 rounded focus:ring-yellow-500 focus:ring-2" />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SMS</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5 text-yellow-600 border-gray-300 dark:border-gray-500 rounded focus:ring-yellow-500 focus:ring-2" />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications push</span>
                          <input type="checkbox" className="w-5 h-5 text-yellow-600 border-gray-300 dark:border-gray-500 rounded focus:ring-yellow-500 focus:ring-2" />
                        </label>
                        
                        <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Slack/Teams</span>
                          <input type="checkbox" className="w-5 h-5 text-yellow-600 border-gray-300 dark:border-gray-500 rounded focus:ring-yellow-500 focus:ring-2" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      Facturation et abonnement
                    </h2>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Gérer l'abonnement
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Plan Professional</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Jusqu'à 500 élèves • Tous les modules inclus</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">79€/mois</p>
                      </div>
                      <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                        Changer de plan
                      </button>
                    </div>
                  </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Informations de facturation</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom de facturation
                        </label>
                        <input
                          type="text"
                          defaultValue="École Exemple"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse de facturation
                        </label>
                        <textarea
                          rows={3}
                          defaultValue="123 Rue de l'Éducation, 75001 Paris, France"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Méthode de paiement</h3>
                    
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-6 h-6 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                            <p className="text-sm text-gray-600">Expire 12/25</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium">
                          Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Historique des factures</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Montant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">01/01/2024</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€79.00</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Payé
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Download className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      Paramétrage des Documents
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Configurez les en-têtes, pieds de page et modèles de vos documents</p>
                  </div>
                </div>
                <div className="p-6">
                  <DocumentSettings />
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <Database className="w-4 h-4 text-white" />
                      </div>
                      Gestion du stockage et synchronisation
                    </h2>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${(window as any).electronAPI ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <span className="text-xs text-gray-500">
                        {(window as any).electronAPI ? 'Electron (Production)' : 'Web (Development)'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={loadSchoolSettings}
                      disabled={settingsLoading}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${settingsLoading ? 'animate-spin' : ''}`} />
                      {settingsLoading ? 'Actualisation...' : 'Actualiser'}
                    </button>
                    <button 
                      onClick={preloadFrequentData}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      {loading ? 'Préchargement...' : 'Précharger'}
                    </button>
                  </div>
                </div>

                {/* Vue d'ensemble du stockage */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Base SQLite</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {storageData ? `${(storageData.sqlite.totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB` : '...'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {storageData ? `${storageData.sqlite.totalItems} éléments` : 'Chargement...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Save className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Cache IndexedDB</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {storageData ? `${(storageData.cache.totalSize / (1024 * 1024)).toFixed(0)} MB` : '...'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {storageData ? `${storageData.cache.totalItems} éléments` : 'Chargement...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Fichiers locaux</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {storageData ? `${(storageData.files.totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB` : '...'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {storageData ? `${storageData.files.totalFiles} fichiers` : 'Chargement...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Upload className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {storageData ? `${(storageData.overall.totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB` : '...'}
                        </p>
                        <p className="text-xs text-green-600">
                          {storageData ? `+${(storageData.overall.compressionRatio * 100).toFixed(0)}% optimisé` : 'Chargement...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statut de synchronisation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Statut de synchronisation</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${syncData?.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-medium ${syncData?.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                          {syncData?.isOnline ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-blue-600">
                            {syncData ? syncData.queueStatus.pending : '...'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">En attente</p>
                        <p className="text-xs text-gray-500">Éléments à synchroniser</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-green-600">
                            {syncData ? syncData.syncStats.completedItems : '...'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">Synchronisés</p>
                        <p className="text-xs text-gray-500">Aujourd'hui</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-red-600">
                            {syncData ? syncData.queueStatus.failed : '...'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">Échecs</p>
                        <p className="text-xs text-gray-500">À résoudre</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center space-x-3">
                      <button 
                        onClick={forceSync}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Synchronisation...' : 'Forcer la synchronisation'}
                      </button>
                      <button 
                        onClick={async () => {
                          const queue = await storageDashboardService.getSyncQueue();
                          console.log('Sync queue:', queue);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Voir la queue
                      </button>
                    </div>
                  </div>
                </div>

                {/* Performance du cache */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Performance du cache</h3>
                  </div>
                  <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Taux de réussite</span>
                            <span className="font-medium text-gray-900">
                              {performanceData ? `${performanceData.cacheHitRate.toFixed(1)}%` : '...'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${performanceData ? performanceData.cacheHitRate : 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Temps de réponse</span>
                            <span className="font-medium text-gray-900">
                              {performanceData ? `${performanceData.responseTime.toFixed(0)}ms` : '...'}
                            </span>
                        </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${performanceData ? (performanceData.responseTime / 60) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Espace utilisé</span>
                            <span className="font-medium text-gray-900">
                              {performanceData ? `${(performanceData.spaceUsage / (1024 * 1024)).toFixed(0)} MB / ${(performanceData.maxSpace / (1024 * 1024)).toFixed(0)} MB` : '...'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${performanceData ? (performanceData.spaceUsage / performanceData.maxSpace) * 100 : 0}%` }}
                            ></div>
                        </div>
                      </div>
                    </div>
                    
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Stratégies de cache</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">Fréquent</span>
                            <span className="text-sm font-medium text-green-600">
                              {performanceData ? `${performanceData.strategies.frequent.count} éléments` : '...'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">Normal</span>
                            <span className="text-sm font-medium text-blue-600">
                              {performanceData ? `${performanceData.strategies.normal.count} éléments` : '...'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-700">Rare</span>
                            <span className="text-sm font-medium text-orange-600">
                              {performanceData ? `${performanceData.strategies.rare.count} éléments` : '...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center space-x-3">
                      <button 
                        onClick={clearCache}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Nettoyage...' : 'Nettoyer le cache'}
                      </button>
                      <button 
                        onClick={preloadData}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Préchargement...' : 'Précharger les données'}
                      </button>
                    </div>
                    </div>
                  </div>

                {/* Gestion des fichiers */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Gestion des fichiers</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Répartition par catégorie</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-blue-500 rounded"></div>
                              <span className="text-sm text-gray-700">Photos d'élèves</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {fileData ? `${(fileData.studentPhotos.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : '...'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-green-500 rounded"></div>
                              <span className="text-sm text-gray-700">Documents</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {fileData ? `${(fileData.documents.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : '...'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-4 h-4 bg-purple-500 rounded"></div>
                              <span className="text-sm text-gray-700">Rapports</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {fileData ? `${(fileData.reports.size / (1024 * 1024 * 1024)).toFixed(1)} GB` : '...'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Statistiques d'optimisation</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm text-gray-700">Photos optimisées</span>
                            <span className="text-sm font-medium text-blue-600">
                              {fileData ? `${fileData.studentPhotos.optimized}/${fileData.studentPhotos.count}` : '...'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="text-sm text-gray-700">Documents compressés</span>
                            <span className="text-sm font-medium text-green-600">
                              {fileData ? `${fileData.documents.compressed}/${fileData.documents.count}` : '...'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                            <span className="text-sm text-gray-700">Rapports archivés</span>
                            <span className="text-sm font-medium text-purple-600">
                              {fileData ? `${fileData.reports.archived}/${fileData.reports.count}` : '...'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-center space-x-3">
                      <button 
                        onClick={analyzeDiskSpace}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Analyse...' : 'Analyser l\'espace'}
                      </button>
                      <button 
                        onClick={cleanupOldFiles}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Nettoyage...' : 'Nettoyer les anciens'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions de maintenance */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-yellow-900 mb-4">Actions de maintenance</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                      <button 
                        onClick={checkIntegrity}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Database className="w-4 h-4 inline mr-2" />
                        {loading ? 'Vérification...' : 'Vérifier l\'intégrité'}
                      </button>
                      <button 
                        onClick={exportMetrics}
                        disabled={loading}
                        className="w-full px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4 inline mr-2" />
                        {loading ? 'Export...' : 'Exporter les métriques'}
                      </button>
                    </div>
                    <div className="space-y-3">
                      <button 
                        onClick={cleanupLogs}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4 inline mr-2" />
                        {loading ? 'Nettoyage...' : 'Nettoyer les logs'}
                      </button>
                      <button 
                        onClick={async () => {
                          const settings = await storageDashboardService.getAdvancedSettings();
                          console.log('Advanced settings:', settings);
                        }}
                        className="w-full px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors"
                      >
                        <SettingsIcon className="w-4 h-4 inline mr-2" />
                        Paramètres avancés
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div>
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <SettingsIcon className="w-4 h-4 text-white" />
                      </div>
                      Paramètres système
                    </h2>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-xl hover:from-gray-700 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                          <SettingsIcon className="w-3 h-3 text-white" />
                        </div>
                        Localisation
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Langue
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Français</option>
                          <option>English</option>
                          <option>Español</option>
                          <option>Deutsch</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fuseau horaire
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>Europe/Paris (UTC+1)</option>
                          <option>Europe/London (UTC+0)</option>
                          <option>America/New_York (UTC-5)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Format de date
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                          <option>DD/MM/YYYY</option>
                          <option>MM/DD/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Intégrations IA</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Traduction automatique</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Génération de commentaires</span>
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Détection d'anomalies</span>
                        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Prédictions de performance</span>
                        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      </label>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm mr-3">
                        <SettingsIcon className="w-3 h-3 text-white" />
                      </div>
                      Informations système
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-800 dark:text-blue-300"><strong>Version:</strong> Academia Hub v2.1.0</p>
                        <p className="text-blue-800 dark:text-blue-300"><strong>Base de données:</strong> PostgreSQL 14.2</p>
                        <p className="text-blue-800 dark:text-blue-300"><strong>Serveur:</strong> AWS eu-west-1</p>
                      </div>
                      <div>
                        <p className="text-blue-800 dark:text-blue-300"><strong>Uptime:</strong> 99.98%</p>
                        <p className="text-blue-800 dark:text-blue-300"><strong>Dernière mise à jour:</strong> 15/01/2024</p>
                        <p className="text-blue-800 dark:text-blue-300"><strong>Support:</strong> 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default Settings;