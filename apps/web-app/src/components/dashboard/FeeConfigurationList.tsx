import React from 'react';
import { 
  Settings, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign, 
  Calendar, 
  Users, 
  GraduationCap,
  BookOpen,
  Plus,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { FeeConfiguration } from '../../services/financeService';

interface FeeConfigurationListProps {
  configurations: FeeConfiguration[];
  loading: boolean;
  error: string | null;
  onEdit: (config: FeeConfiguration) => void;
  onDelete: (config: FeeConfiguration) => void;
  onView: (config: FeeConfiguration) => void;
  onNew: () => void;
  academicYearId?: string;
}

const FeeConfigurationList: React.FC<FeeConfigurationListProps> = ({
  configurations,
  loading,
  error,
  onEdit,
  onDelete,
  onView,
  onNew,
  academicYearId
}) => {
  // Grouper les configurations par niveau (comme Planning/Students)
  const groupConfigurationsByLevel = () => {
    const grouped: { [key: string]: FeeConfiguration[] } = {};
    
    configurations.forEach(config => {
      if (!grouped[config.level]) {
        grouped[config.level] = [];
      }
      grouped[config.level].push(config);
    });
    
    // Définir l'ordre des niveaux souhaité
    const levelOrder = ['maternelle', 'primaire', '1er-cycle-secondaire', '2nd-cycle-secondaire'];
    
    // Définir l'ordre des classes pour chaque niveau
    const classOrderByLevel: { [key: string]: string[] } = {
      'primaire': ['CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'],
      '1er-cycle-secondaire': ['6ème', '5ème', '4ème', '3ème'],
      '2nd-cycle-secondaire': ['2nde', '1ère', 'Tle']
    };
    
    // Fonction pour trier les configurations par classe
    const sortConfigurationsByClass = (configs: FeeConfiguration[], level: string) => {
      const classOrder = classOrderByLevel[level];
      if (!classOrder) return configs; // Pas d'ordre spécifique pour ce niveau
      
      return configs.sort((a, b) => {
        const aClassName = a.className || '';
        const bClassName = b.className || '';
        
        const aIndex = classOrder.findIndex(className => 
          aClassName.toLowerCase().includes(className.toLowerCase())
        );
        const bIndex = classOrder.findIndex(className => 
          bClassName.toLowerCase().includes(className.toLowerCase())
        );
        
        // Si les deux classes sont trouvées dans l'ordre, trier par index
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        
        // Si une seule classe est trouvée, la mettre en premier
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // Si aucune classe n'est trouvée, trier alphabétiquement
        return aClassName.localeCompare(bClassName);
      });
    };
    
    // Créer un objet ordonné selon l'ordre souhaité
    const orderedGrouped: { [key: string]: FeeConfiguration[] } = {};
    
    levelOrder.forEach(level => {
      if (grouped[level]) {
        // Trier les configurations par classe pour ce niveau
        orderedGrouped[level] = sortConfigurationsByClass(grouped[level], level);
      }
    });
    
    // Ajouter les autres niveaux qui ne sont pas dans l'ordre prédéfini
    Object.keys(grouped).forEach(level => {
      if (!levelOrder.includes(level)) {
        orderedGrouped[level] = grouped[level];
      }
    });
    
    return orderedGrouped;
  };

  // Informations des niveaux (comme Planning/Students)
  const getLevelInfo = (level: string) => {
    const levelInfo: Record<string, {
      icon: React.ComponentType<any>;
      description: string;
      color: string;
      bgColor: string;
      textColor: string;
    }> = {
      'Maternelle': {
        icon: GraduationCap,
        description: 'Éducation préscolaire (3-6 ans)',
        color: 'from-pink-500 to-rose-600',
        bgColor: 'from-pink-50 to-rose-50',
        textColor: 'text-pink-700'
      },
      'Primaire': {
        icon: BookOpen,
        description: 'Enseignement élémentaire (6-12 ans)',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'from-blue-50 to-indigo-50',
        textColor: 'text-blue-700'
      },
      '1er cycle secondaire': {
        icon: GraduationCap,
        description: 'Premier cycle du secondaire (12-16 ans)',
        color: 'from-green-500 to-emerald-600',
        bgColor: 'from-green-50 to-emerald-50',
        textColor: 'text-green-700'
      },
      '2nd cycle secondaire': {
        icon: GraduationCap,
        description: 'Deuxième cycle du secondaire (16-19 ans)',
        color: 'from-purple-500 to-violet-600',
        bgColor: 'from-purple-50 to-violet-50',
        textColor: 'text-purple-700'
      }
    };
    
    return levelInfo[level] || {
      icon: Settings,
      description: 'Configuration de frais',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-50 to-gray-50',
      textColor: 'text-gray-700'
    };
  };

  // Formater les montants
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-FR');
  };

  // Capitaliser le niveau scolaire
  const capitalizeLevel = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'maternelle': 'Maternelle',
      'primaire': 'Primaire',
      '1er-cycle-secondaire': '1er Cycle Secondaire',
      '2nd-cycle-secondaire': '2nd Cycle Secondaire'
    };
    return levelMap[level] || level;
  };

  // Formater l'année académique
  const formatAcademicYear = (academicYearId?: string) => {
    if (!academicYearId) return 'Sélectionner une année';
    
    // Extraire l'année de l'ID (format: academic-year-2025-2026)
    const match = academicYearId.match(/academic-year-(\d{4}-\d{4})/);
    if (match) {
      return match[1]; // Retourne "2025-2026"
    }
    
    // Si le format n'est pas reconnu, retourner l'ID tel quel
    return academicYearId;
  };

  // État de chargement (comme Planning/Students)
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center animate-spin">
            <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Chargement des configurations...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Veuillez patienter pendant le chargement des frais configurés.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // État d'erreur (comme Planning/Students)
  if (error) {
    return (
      <div className="space-y-6">
        {/* En-tête avec l'année académique sélectionnée */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Configurations de frais
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Année scolaire : <span className="font-medium">{formatAcademicYear(academicYearId)}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-600 dark:text-red-400">
                Erreur de chargement
              </p>
            </div>
          </div>
        </div>

        {/* Message d'erreur */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
            <Settings className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Erreur de chargement
            </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Impossible de charger les configurations de frais pour l'année scolaire <strong>{formatAcademicYear(academicYearId)}</strong>.
              </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={onNew}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Configuration
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // État vide (comme Planning/Students)
  if (configurations.length === 0) {
    return (
      <div className="space-y-6">
        {/* En-tête avec l'année académique sélectionnée */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Configurations de frais
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Année scolaire : <span className="font-medium">{formatAcademicYear(academicYearId)}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                0 configuration(s) trouvée(s)
              </p>
            </div>
          </div>
        </div>

        {/* Message d'état vide */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
            <Settings className="w-10 h-10 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Aucune configuration de frais trouvée
            </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Aucune configuration de frais n'a été trouvée pour l'année scolaire <strong>{formatAcademicYear(academicYearId)}</strong>.
              </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Commencez par créer une nouvelle configuration de frais pour vos niveaux et classes.
            </p>
            <button
              onClick={onNew}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Configuration
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const groupedConfigs = groupConfigurationsByLevel();

  return (
    <div className="space-y-6">
      {/* En-tête avec l'année académique sélectionnée */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Configurations de frais
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Année scolaire : <span className="font-medium">{formatAcademicYear(academicYearId)}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {configurations.length} configuration(s) trouvée(s)
            </p>
          </div>
        </div>
      </div>
      {Object.entries(groupedConfigs).map(([level, configs]) => {
        const levelInfo = getLevelInfo(capitalizeLevel(level));
        const Icon = levelInfo.icon;
        
        return (
          <div key={level} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* En-tête du niveau (comme Planning/Students) */}
            <div className={`px-6 py-4 bg-gradient-to-r ${levelInfo.bgColor} dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${levelInfo.color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${levelInfo.textColor} dark:text-gray-100`}>
                      {capitalizeLevel(level)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {levelInfo.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {configs.length} configuration(s)
                  </p>
                </div>
              </div>
            </div>
            
            {/* Liste des configurations (comme Planning/Students) */}
            <div className="p-6">
              <div className="grid gap-4">
                {configs.map((config) => (
                  <div
                    key={config.id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                              {config.className ? `Classe: ${config.className}` : `Niveau: ${capitalizeLevel(config.level)}`}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Configuration des frais
                            </p>
                          </div>
                        </div>
                        
                        {/* Détails des frais */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          {config.inscriptionFee > 0 && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                Inscription:
                              </span>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatAmount(config.inscriptionFee)} F CFA
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              Réinscription:
                            </span>
                            {config.reinscriptionFee > 0 ? (
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {formatAmount(config.reinscriptionFee)} F CFA
                              </span>
                            ) : (
                              <span className="font-semibold text-green-600 dark:text-green-400 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Gratuit
                              </span>
                            )}
                          </div>
                          
                          {config.tuitionFees && config.tuitionFees.length > 0 && config.tuitionFees.some(fee => fee > 0) && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600 dark:text-gray-400 flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                Scolarité:
                              </span>
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {formatAmount(config.tuitionFees.reduce((sum, fee) => sum + fee, 0))} F CFA
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Date d'effet */}
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Date d'effet: {new Date(config.effectiveDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      
                      {/* Actions (comme Planning/Students) */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => onView(config)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(config)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(config)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeeConfigurationList;

