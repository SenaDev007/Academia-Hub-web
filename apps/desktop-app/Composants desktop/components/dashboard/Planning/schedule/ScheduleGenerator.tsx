import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  BookOpen,
  BarChart3,
  Target,
  Sliders,
  Save,
  Eye,
  Info,
  TrendingUp,
  Shield,
  Lightbulb
} from 'lucide-react';
import { PlanningClass, PlanningSubject, PlanningTeacher, WorkHoursConfig } from '../../../../types/planning';
import { scheduleGeneratorService, GenerationSettings, GenerationResult } from '../../../../services/scheduleGeneratorService';

interface ScheduleGeneratorProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  workHours: WorkHoursConfig | null;
  onGenerateSchedule: (scheduleData: any) => Promise<void>;
}

// Utiliser l'interface du service

interface GenerationProgress {
  isRunning: boolean;
  currentStep: string;
  progress: number;
  totalSteps: number;
  estimatedTime: number;
  conflicts: number;
  completedClasses: number;
}

const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({
  teachers,
  classes,
  subjects,
  workHours,
  onGenerateSchedule
}) => {
  const [settings, setSettings] = useState<GenerationSettings>({
    prioritizeTeacherAvailability: true,
    balanceWorkload: true,
    minimizeGaps: true,
    respectSubjectSequence: false,
    maxHoursPerDay: 6,
    preferredTimeSlots: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00'],
    avoidTimeSlots: ['12:00-13:00'],
    subjectWeights: {},
    classConstraints: {}
  });

  const [progress, setProgress] = useState<GenerationProgress>({
    isRunning: false,
    currentStep: '',
    progress: 0,
    totalSteps: 0,
    estimatedTime: 0,
    conflicts: 0,
    completedClasses: 0
  });

  const [selectedStrategy, setSelectedStrategy] = useState<'balanced' | 'teacher-focused' | 'class-focused' | 'custom'>('balanced');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [previewResults, setPreviewResults] = useState<GenerationResult | null>(null);

  const generationStrategies = {
    balanced: {
      name: 'Équilibré',
      description: 'Balance optimale entre disponibilités enseignants et besoins classes',
      icon: BarChart3,
      settings: {
        prioritizeTeacherAvailability: true,
        balanceWorkload: true,
        minimizeGaps: true,
        respectSubjectSequence: false
      }
    },
    'teacher-focused': {
      name: 'Centré Enseignants',
      description: 'Privilégie les disponibilités et préférences des enseignants',
      icon: Users,
      settings: {
        prioritizeTeacherAvailability: true,
        balanceWorkload: true,
        minimizeGaps: true,
        respectSubjectSequence: false
      }
    },
    'class-focused': {
      name: 'Centré Classes',
      description: 'Optimise les emplois du temps pour les classes en priorité',
      icon: BookOpen,
      settings: {
        prioritizeTeacherAvailability: false,
        balanceWorkload: false,
        minimizeGaps: true,
        respectSubjectSequence: true
      }
    },
    custom: {
      name: 'Personnalisé',
      description: 'Configuration manuelle de tous les paramètres',
      icon: Settings,
      settings: settings
    }
  };

  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
  ];

  // Calculer les statistiques de génération
  const generationStats = useMemo(() => {
    const totalSlots = classes.length * 6 * 9; // 6 jours × 9 créneaux
    const requiredSlots = classes.reduce((total, cls) => {
      // Simuler le nombre de créneaux requis par classe
      return total + 30; // Moyenne de 30 créneaux par classe
    }, 0);

    const availableTeacherHours = teachers.reduce((total, teacher) => {
      // Simuler les heures disponibles par enseignant
      return total + 25; // Moyenne de 25h par enseignant
    }, 0);

    const estimatedComplexity = classes.length * teachers.length * subjects.length;
    const estimatedTime = Math.max(30, Math.min(300, estimatedComplexity / 10)); // Entre 30s et 5min

    return {
      totalSlots,
      requiredSlots,
      availableTeacherHours,
      estimatedTime,
      complexity: estimatedComplexity > 1000 ? 'Élevée' : estimatedComplexity > 500 ? 'Moyenne' : 'Faible'
    };
  }, [classes, teachers, subjects]);

  const handleStrategyChange = (strategy: typeof selectedStrategy) => {
    setSelectedStrategy(strategy);
    if (strategy !== 'custom') {
      setSettings({ ...settings, ...generationStrategies[strategy].settings });
    }
  };

  const updateSetting = (key: keyof GenerationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const simulateGeneration = async () => {
    setProgress({
      isRunning: true,
      currentStep: 'Initialisation...',
      progress: 0,
      totalSteps: 6,
      estimatedTime: generationStats.estimatedTime,
      conflicts: 0,
      completedClasses: 0
    });

    try {
      // Utiliser le service intelligent de génération
      const result = await scheduleGeneratorService.generateSchedule(
        teachers,
        classes,
        subjects,
        workHours,
        settings,
        (progress, step) => {
      setProgress(prev => ({
        ...prev,
            currentStep: step,
            progress: progress,
            completedClasses: Math.floor((progress / 100) * classes.length)
      }));
    }
      );

      setPreviewResults(result);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    setPreviewResults({
        success: false,
        schedule: [],
        conflicts: [],
        statistics: {
          totalSlots: 0,
          filledSlots: 0,
          completionRate: 0,
          teacherUtilization: 0,
          classCompletion: 0,
          averageGapsPerDay: 0,
          conflictsResolved: 0,
          conflictsRemaining: 0,
          generationTime: 0
        },
        warnings: ['Erreur lors de la génération'],
        suggestions: []
      });
    } finally {
    setProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  const handleGenerate = async () => {
    await simulateGeneration();
  };

  const handleSaveResults = async () => {
    if (previewResults && previewResults.success) {
      try {
        // Sauvegarder chaque entrée de l'emploi du temps
        for (const scheduleEntry of previewResults.schedule) {
          await onGenerateSchedule(scheduleEntry);
        }
        console.log('Emploi du temps généré et sauvegardé');
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Génération Automatique d'Emploi du Temps
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Créez des emplois du temps optimisés automatiquement
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{generationStats.complexity}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Complexité</div>
          </div>
        </div>
      </div>

      {/* Statistiques de génération */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Classes à planifier</p>
              <p className="text-2xl font-bold text-indigo-600">{classes.length}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enseignants disponibles</p>
              <p className="text-2xl font-bold text-green-600">{teachers.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Matières à répartir</p>
              <p className="text-2xl font-bold text-purple-600">{subjects.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Temps estimé</p>
              <p className="text-2xl font-bold text-orange-600">{generationStats.estimatedTime}s</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Stratégies de génération */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Stratégie de Génération
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(generationStrategies).map(([key, strategy]) => {
            const Icon = strategy.icon;
            const isSelected = selectedStrategy === key;

            return (
              <button
                key={key}
                onClick={() => handleStrategyChange(key as typeof selectedStrategy)}
                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h4 className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                    {strategy.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {strategy.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paramètres avancés */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Sliders className="w-5 h-5 mr-2 text-purple-600" />
            Paramètres de Génération
          </h3>
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showAdvancedSettings ? 'Masquer' : 'Afficher'} les options avancées
          </button>
        </div>

        <div className="space-y-4">
          {/* Paramètres de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Prioriser les disponibilités</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Respecter les créneaux disponibles des enseignants</p>
              </div>
              <button
                onClick={() => updateSetting('prioritizeTeacherAvailability', !settings.prioritizeTeacherAvailability)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.prioritizeTeacherAvailability ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                title={settings.prioritizeTeacherAvailability ? 'Désactiver' : 'Activer'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.prioritizeTeacherAvailability ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Équilibrer les charges</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Répartir équitablement les heures entre enseignants</p>
              </div>
              <button
                onClick={() => updateSetting('balanceWorkload', !settings.balanceWorkload)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.balanceWorkload ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                title={settings.balanceWorkload ? 'Désactiver' : 'Activer'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.balanceWorkload ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Minimiser les trous</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Éviter les créneaux libres dans les emplois du temps</p>
              </div>
              <button
                onClick={() => updateSetting('minimizeGaps', !settings.minimizeGaps)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.minimizeGaps ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                title={settings.minimizeGaps ? 'Désactiver' : 'Activer'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.minimizeGaps ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Heures maximum par jour</h4>
              <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="4"
                    max="8"
                    value={settings.maxHoursPerDay}
                    onChange={(e) => updateSetting('maxHoursPerDay', parseInt(e.target.value))}
                    className="flex-1"
                    title="Nombre maximum d'heures par jour"
                  />
                <span className="w-12 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {settings.maxHoursPerDay}h
                </span>
              </div>
            </div>
          </div>

          {/* Paramètres avancés */}
          {showAdvancedSettings && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              {/* Créneaux préférés */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Créneaux Préférés</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => {
                        const newPreferred = settings.preferredTimeSlots.includes(slot)
                          ? settings.preferredTimeSlots.filter(s => s !== slot)
                          : [...settings.preferredTimeSlots, slot];
                        updateSetting('preferredTimeSlots', newPreferred);
                      }}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        settings.preferredTimeSlots.includes(slot)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Créneaux à éviter */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Créneaux à Éviter</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => {
                        const newAvoid = settings.avoidTimeSlots.includes(slot)
                          ? settings.avoidTimeSlots.filter(s => s !== slot)
                          : [...settings.avoidTimeSlots, slot];
                        updateSetting('avoidTimeSlots', newAvoid);
                      }}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        settings.avoidTimeSlots.includes(slot)
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Génération et résultats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Génération et Aperçu
          </h3>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={progress.isRunning}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {progress.isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Générer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Barre de progression */}
        {progress.isRunning && (
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                {progress.currentStep}
              </span>
              <span className="text-sm text-orange-600 dark:text-orange-300">
                {Math.round(progress.progress)}%
              </span>
            </div>
            <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-orange-600 dark:text-orange-300">
              <span>{progress.completedClasses}/{classes.length} classes</span>
              <span>{progress.conflicts} conflits détectés</span>
            </div>
          </div>
        )}

        {/* Aperçu des résultats */}
        {previewResults && !progress.isRunning && (
          <div className="space-y-6">
            {/* Statistiques principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{previewResults.statistics.filledSlots}</div>
                <div className="text-xs text-green-600 dark:text-green-300">Cours planifiés</div>
              </div>
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(previewResults.statistics.teacherUtilization)}%</div>
                <div className="text-xs text-blue-600 dark:text-blue-300">Utilisation enseignants</div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(previewResults.statistics.classCompletion)}%</div>
                <div className="text-xs text-purple-600 dark:text-purple-300">Complétude classes</div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{previewResults.conflicts.length}</div>
                <div className="text-xs text-red-600 dark:text-red-300">Conflits détectés</div>
              </div>
            </div>

            {/* Avertissements et suggestions */}
            {(previewResults.warnings.length > 0 || previewResults.suggestions.length > 0) && (
              <div className="space-y-4">
                {previewResults.warnings.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Avertissements</h4>
                    </div>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      {previewResults.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewResults.suggestions.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Suggestions d'amélioration</h4>
                    </div>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {previewResults.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Détails des conflits */}
            {previewResults.conflicts.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <h4 className="font-medium text-red-800 dark:text-red-200">Conflits détectés</h4>
                </div>
                <div className="space-y-2">
                  {previewResults.conflicts.slice(0, 3).map((conflict, index) => (
                    <div key={index} className="text-sm text-red-700 dark:text-red-300 p-2 bg-red-100 dark:bg-red-900/30 rounded">
                      <div className="font-medium">{conflict.description}</div>
                      {conflict.suggestedResolutions.length > 0 && (
                        <div className="text-xs mt-1">
                          <span className="font-medium">Suggestions:</span> {conflict.suggestedResolutions[0]}
                        </div>
                      )}
                    </div>
                  ))}
                  {previewResults.conflicts.length > 3 && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      +{previewResults.conflicts.length - 3} autres conflits...
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Info className="w-4 h-4" />
                <span>Généré en {Math.round(previewResults.statistics.generationTime / 1000)}s avec la stratégie "{generationStrategies[selectedStrategy].name}"</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewResults(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Régénérer
                </button>
                
                {previewResults.success && (
                <button
                  onClick={handleSaveResults}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Appliquer
                </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* État initial */}
        {!progress.isRunning && !previewResults && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">Prêt à générer</p>
            <p>Cliquez sur "Générer" pour créer automatiquement les emplois du temps</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleGenerator;
