import React from 'react';
import { 
  GraduationCap, 
  Users, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  BookOpen,
  AlertCircle
} from 'lucide-react';

interface FeeConfiguration {
  id: string;
  academicYearId: string;
  level: string;
  classId?: string | null;
  className?: string;
  classLevel?: string;
  inscriptionFee: number;
  reinscriptionFee: number;
  tuitionFees: number[];
  effectiveDate: string;
  schoolId: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FeeConfigurationDisplayProps {
  configurations: FeeConfiguration[];
  loading: boolean;
  error: string | null;
  onEdit: (config: FeeConfiguration) => void;
  onDelete: (config: FeeConfiguration) => void;
  onView: (config: FeeConfiguration) => void;
  onNew: () => void;
}

const FeeConfigurationDisplay: React.FC<FeeConfigurationDisplayProps> = ({
  configurations,
  loading,
  error,
  onEdit,
  onDelete,
  onView,
  onNew
}) => {
  // Grouper les configurations par niveau
  const groupConfigurationsByLevel = () => {
    const grouped: { [key: string]: FeeConfiguration[] } = {};
    
    configurations.forEach(config => {
      if (!grouped[config.level]) {
        grouped[config.level] = [];
      }
      grouped[config.level].push(config);
    });
    
    return grouped;
  };

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
      icon: BookOpen,
      description: 'Niveau d\'éducation',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-50 to-gray-100',
      textColor: 'text-gray-700'
    };
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Chargement des configurations...
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez patienter pendant le chargement des données
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={onNew}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Nouvelle Configuration
        </button>
      </div>
    );
  }

  if (configurations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Aucune configuration de frais
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Commencez par configurer les frais pour l'année scolaire sélectionnée
        </p>
        <button
          onClick={onNew}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Configurer les Frais
        </button>
      </div>
    );
  }

  const groupedConfigs = groupConfigurationsByLevel();

  return (
    <div className="space-y-6">
      {Object.entries(groupedConfigs).map(([level, configs]) => {
        const levelInfo = getLevelInfo(level);
        const Icon = levelInfo.icon;
        
        return (
          <div key={level} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className={`px-6 py-4 bg-gradient-to-r ${levelInfo.bgColor} dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${levelInfo.color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${levelInfo.textColor} dark:text-gray-100`}>
                      {level}
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
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {configs.map((config) => (
                  <div key={config.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {config.className || 'Général'}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {config.id?.substring(0, 8)}...
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onView(config)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(config)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors duration-200"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(config)}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors duration-200"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
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
                      
                      {config.reinscriptionFee > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400 flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            Réinscription:
                          </span>
                          <span className="font-semibold text-amber-600 dark:text-amber-400">
                            {formatAmount(config.reinscriptionFee)} F CFA
                          </span>
                        </div>
                      )}
                      
                      {config.tuitionFees && config.tuitionFees.length > 0 && config.tuitionFees.some(fee => fee > 0) && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400 flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              Scolarité:
                            </span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {formatAmount(config.tuitionFees.reduce((sum, fee) => sum + fee, 0))} F CFA
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {config.tuitionFees.filter(fee => fee > 0).length} tranche(s)
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Date d'effet:
                        </span>
                        <span>{new Date(config.effectiveDate).toLocaleDateString('fr-FR')}</span>
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

export default FeeConfigurationDisplay;
