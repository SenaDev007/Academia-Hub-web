import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  User, 
  BookOpen,
  MapPin,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Target,
  Filter,
  Search,
  Zap,
  Info,
  ExternalLink,
  Shield,
  Lightbulb,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { PlanningClass, PlanningSubject, PlanningTeacher, PlanningSchedule, WorkHoursConfig } from '../../../../types/planning';
import { scheduleValidationService, ValidationResult } from '../../../../services/scheduleValidationService';

interface ConflictResolverProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  schedule: PlanningSchedule[];
  workHours: WorkHoursConfig | null;
  onResolveConflict: (resolutionData: any) => Promise<void>;
}

interface ScheduleConflict {
  id: string;
  type: 'teacher_overlap' | 'room_overlap' | 'class_overlap' | 'availability' | 'workload' | 'sequence';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedEntries: string[];
  suggestions: ConflictSuggestion[];
  autoResolvable: boolean;
  impactScore: number;
}

interface ConflictSuggestion {
  id: string;
  type: 'move_time' | 'change_teacher' | 'change_room' | 'split_class' | 'adjust_duration';
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  details: any;
}

const ConflictResolver: React.FC<ConflictResolverProps> = ({
  teachers,
  classes,
  subjects,
  schedule,
  workHours,
  onResolveConflict
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedConflicts, setSelectedConflicts] = useState<Set<string>>(new Set());
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);

  const days = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  // Analyser les conflits avec le service intelligent
  const handleAnalyzeConflicts = async () => {
    setIsAnalyzing(true);
    
    try {
      // Utiliser le service de validation intelligent
      const result = await scheduleValidationService.validateSchedule(
        schedule,
        teachers,
        classes,
        subjects,
        workHours
      );
      
      setValidationResult(result);
      
      // Convertir les erreurs en conflits
      const detectedConflicts: ScheduleConflict[] = result.errors.map(error => ({
        id: error.id,
        type: mapErrorTypeToConflictType(error.type),
        severity: error.severity,
        title: getConflictTitle(error.type),
        description: error.message,
        affectedEntries: error.affectedEntries,
        suggestions: error.suggestedFix ? [{
          id: `suggestion_${error.id}`,
          type: 'move_time',
          description: error.suggestedFix,
          effort: 'medium',
          impact: error.severity === 'high' ? 'high' : 'medium',
          confidence: 0.8
        }] : [],
        autoResolvable: error.severity !== 'critical',
        impactScore: calculateImpactScore(error.severity)
      }));
      
      setConflicts(detectedConflicts);
    } catch (error) {
      console.error('Erreur lors de l\'analyse des conflits:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Mapper les types d'erreurs vers les types de conflits
  const mapErrorTypeToConflictType = (errorType: string): ScheduleConflict['type'] => {
    switch (errorType) {
      case 'conflict': return 'teacher_overlap';
      case 'constraint_violation': return 'availability';
      case 'resource_unavailable': return 'room_overlap';
      case 'schedule_invalid': return 'sequence';
      default: return 'teacher_overlap';
    }
  };

  // Obtenir le titre du conflit
  const getConflictTitle = (errorType: string): string => {
    switch (errorType) {
      case 'conflict': return 'Conflit de réservation';
      case 'constraint_violation': return 'Violation de contrainte';
      case 'resource_unavailable': return 'Ressource indisponible';
      case 'schedule_invalid': return 'Emploi du temps invalide';
      default: return 'Conflit détecté';
    }
  };

  // Calculer le score d'impact
  const calculateImpactScore = (severity: string): number => {
    switch (severity) {
      case 'critical': return 10;
      case 'high': return 8;
      case 'medium': return 5;
      case 'low': return 2;
      default: return 1;
    }
  };

  // Analyser les conflits dans l'emploi du temps
  const detectedConflicts = useMemo((): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = [];

    // 1. Conflits de chevauchement d'enseignants
    const teacherConflicts = new Map<string, PlanningSchedule[]>();
    schedule.forEach(entry => {
      const key = `${entry.teacherId}-${entry.dayOfWeek}-${entry.startTime}`;
      if (!teacherConflicts.has(key)) {
        teacherConflicts.set(key, []);
      }
      teacherConflicts.get(key)!.push(entry);
    });

    teacherConflicts.forEach((entries, key) => {
      if (entries.length > 1) {
        const teacher = teachers.find(t => t.id === entries[0].teacherId);
        conflicts.push({
          id: `teacher-overlap-${key}`,
          type: 'teacher_overlap',
          severity: 'critical',
          title: `Conflit d'enseignant - ${teacher?.name}`,
          description: `${teacher?.name} est assigné à ${entries.length} cours simultanés le ${days.find(d => d.id === entries[0].dayOfWeek)?.name} à ${entries[0].startTime}`,
          affectedEntries: entries.map(e => e.id),
          suggestions: [
            {
              id: 'move-time',
              type: 'move_time',
              description: 'Décaler un des cours à un autre créneau',
              effort: 'medium',
              impact: 'high',
              details: { alternativeSlots: ['09:00', '14:00', '15:00'] }
            },
            {
              id: 'change-teacher',
              type: 'change_teacher',
              description: 'Assigner un autre enseignant disponible',
              effort: 'low',
              impact: 'medium',
              details: { availableTeachers: teachers.filter(t => t.id !== entries[0].teacherId).slice(0, 3) }
            }
          ],
          autoResolvable: true,
          impactScore: entries.length * 10
        });
      }
    });

    // 2. Conflits de surcharge d'enseignants
    const teacherWorkloads = new Map<string, number>();
    schedule.forEach(entry => {
      const current = teacherWorkloads.get(entry.teacherId) || 0;
      teacherWorkloads.set(entry.teacherId, current + 1);
    });

    teacherWorkloads.forEach((hours, teacherId) => {
      const teacher = teachers.find(t => t.id === teacherId);
      const maxHours = 30; // Limite supposée de 30h/semaine
      
      if (hours > maxHours) {
        conflicts.push({
          id: `workload-${teacherId}`,
          type: 'workload',
          severity: hours > maxHours * 1.2 ? 'critical' : 'high',
          title: `Surcharge de travail - ${teacher?.name}`,
          description: `${teacher?.name} a ${hours}h de cours assignés, dépassant la limite de ${maxHours}h/semaine`,
          affectedEntries: schedule.filter(s => s.teacherId === teacherId).map(s => s.id),
          suggestions: [
            {
              id: 'redistribute',
              type: 'change_teacher',
              description: 'Redistribuer certains cours vers d\'autres enseignants',
              effort: 'high',
              impact: 'high',
              details: { excessHours: hours - maxHours }
            }
          ],
          autoResolvable: false,
          impactScore: (hours - maxHours) * 5
        });
      }
    });

    // 3. Conflits de disponibilité (simulés)
    schedule.forEach(entry => {
      // Simuler des conflits de disponibilité
      if (Math.random() < 0.1) { // 10% de chance de conflit
        const teacher = teachers.find(t => t.id === entry.teacherId);
        const day = days.find(d => d.id === entry.dayOfWeek);
        
        conflicts.push({
          id: `availability-${entry.id}`,
          type: 'availability',
          severity: 'medium',
          title: `Conflit de disponibilité - ${teacher?.name}`,
          description: `${teacher?.name} n'est pas disponible le ${day?.name} à ${entry.startTime} selon ses préférences`,
          affectedEntries: [entry.id],
          suggestions: [
            {
              id: 'move-to-available',
              type: 'move_time',
              description: 'Déplacer vers un créneau disponible',
              effort: 'low',
              impact: 'medium',
              details: { availableSlots: ['10:00', '14:00'] }
            }
          ],
          autoResolvable: true,
          impactScore: 3
        });
      }
    });

    // 4. Conflits de séquence de matières (simulés)
    classes.forEach(cls => {
      const classSchedule = schedule.filter(s => s.classId === cls.id);
      const mathEntries = classSchedule.filter(s => {
        const subject = subjects.find(sub => sub.id === s.subjectId);
        return subject?.name?.toLowerCase().includes('math');
      });

      if (mathEntries.length > 1) {
        // Vérifier si les cours de maths sont trop concentrés
        const mathDays = mathEntries.map(e => e.dayOfWeek);
        const uniqueDays = new Set(mathDays);
        
        if (uniqueDays.size < mathEntries.length / 2) {
          conflicts.push({
            id: `sequence-math-${cls.id}`,
            type: 'sequence',
            severity: 'low',
            title: `Concentration de matière - ${cls.name}`,
            description: `Les cours de mathématiques sont trop concentrés sur certains jours pour la classe ${cls.name}`,
            affectedEntries: mathEntries.map(e => e.id),
            suggestions: [
              {
                id: 'redistribute-days',
                type: 'move_time',
                description: 'Répartir les cours sur plus de jours',
                effort: 'medium',
                impact: 'low',
                details: { targetDistribution: 'uniform' }
              }
            ],
            autoResolvable: true,
            impactScore: 2
          });
        }
      }
    });

    return conflicts.sort((a, b) => b.impactScore - a.impactScore);
  }, [schedule, teachers, classes, subjects]);

  // Filtrer les conflits
  const filteredConflicts = useMemo(() => {
    return detectedConflicts.filter(conflict => {
      const matchesSearch = !searchTerm || 
        conflict.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conflict.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = selectedSeverity === 'all' || conflict.severity === selectedSeverity;
      const matchesType = selectedType === 'all' || conflict.type === selectedType;

      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [detectedConflicts, searchTerm, selectedSeverity, selectedType]);

  // Statistiques des conflits
  const conflictStats = useMemo(() => {
    const stats = {
      total: detectedConflicts.length,
      critical: detectedConflicts.filter(c => c.severity === 'critical').length,
      high: detectedConflicts.filter(c => c.severity === 'high').length,
      medium: detectedConflicts.filter(c => c.severity === 'medium').length,
      low: detectedConflicts.filter(c => c.severity === 'low').length,
      autoResolvable: detectedConflicts.filter(c => c.autoResolvable).length
    };
    return stats;
  }, [detectedConflicts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'teacher_overlap': return <User className="w-4 h-4" />;
      case 'room_overlap': return <MapPin className="w-4 h-4" />;
      case 'class_overlap': return <Users className="w-4 h-4" />;
      case 'availability': return <Clock className="w-4 h-4" />;
      case 'workload': return <User className="w-4 h-4" />;
      case 'sequence': return <BookOpen className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    // Simuler une analyse
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  const handleResolveConflict = async (conflict: ScheduleConflict, suggestion: ConflictSuggestion) => {
    try {
      await onResolveConflict({
        conflictId: conflict.id,
        suggestionId: suggestion.id,
        type: suggestion.type,
        details: suggestion.details
      });
      console.log('Conflit résolu:', conflict.id);
    } catch (error) {
      console.error('Erreur lors de la résolution:', error);
    }
  };

  const handleBulkResolve = async () => {
    const resolvableConflicts = filteredConflicts.filter(c => 
      selectedConflicts.has(c.id) && c.autoResolvable
    );

    for (const conflict of resolvableConflicts) {
      if (conflict.suggestions.length > 0) {
        await handleResolveConflict(conflict, conflict.suggestions[0]);
      }
    }

    setSelectedConflicts(new Set());
  };

  const toggleConflictSelection = (conflictId: string) => {
    const newSelected = new Set(selectedConflicts);
    if (newSelected.has(conflictId)) {
      newSelected.delete(conflictId);
    } else {
      newSelected.add(conflictId);
    }
    setSelectedConflicts(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques des conflits */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{conflictStats.total}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Critiques</p>
              <p className="text-2xl font-bold text-red-600">{conflictStats.critical}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Élevés</p>
              <p className="text-2xl font-bold text-orange-600">{conflictStats.high}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Moyens</p>
              <p className="text-2xl font-bold text-yellow-600">{conflictStats.medium}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Faibles</p>
              <p className="text-2xl font-bold text-blue-600">{conflictStats.low}</p>
            </div>
            <Info className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Auto-résolvables</p>
              <p className="text-2xl font-bold text-green-600">{conflictStats.autoResolvable}</p>
            </div>
            <Zap className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Contrôles et filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Recherche */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un conflit..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtres et actions */}
          <div className="flex gap-3">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-sm"
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              aria-label="Filtrer par sévérité"
            >
              <option value="all">Toutes sévérités</option>
              <option value="critical">Critiques</option>
              <option value="high">Élevés</option>
              <option value="medium">Moyens</option>
              <option value="low">Faibles</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filtrer par type"
            >
              <option value="all">Tous types</option>
              <option value="teacher_overlap">Chevauchement enseignant</option>
              <option value="workload">Charge de travail</option>
              <option value="availability">Disponibilité</option>
              <option value="sequence">Séquence</option>
            </select>

            {selectedConflicts.size > 0 && (
              <button
                onClick={handleBulkResolve}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Résoudre ({selectedConflicts.size})
              </button>
            )}

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyse...' : 'Réanalyser'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des conflits */}
      {filteredConflicts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          {detectedConflicts.length === 0 ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Aucun conflit détecté !
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                L'emploi du temps actuel ne présente aucun conflit majeur.
              </p>
            </>
          ) : (
            <>
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Aucun conflit ne correspond aux filtres
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Essayez de modifier les critères de recherche ou les filtres.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConflicts.map((conflict) => (
            <div key={conflict.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedConflicts.has(conflict.id)}
                      onChange={() => toggleConflictSelection(conflict.id)}
                      className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      title="Sélectionner ce conflit pour résolution groupée"
                    />
                    
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(conflict.severity)}
                      {getTypeIcon(conflict.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {conflict.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(conflict.severity)}`}>
                          {conflict.severity === 'critical' ? 'Critique' :
                           conflict.severity === 'high' ? 'Élevé' :
                           conflict.severity === 'medium' ? 'Moyen' : 'Faible'}
                        </span>
                        {conflict.autoResolvable && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <Zap className="w-3 h-3 mr-1" />
                            Auto-résolvable
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3">
                        {conflict.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>Impact: {conflict.impactScore}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ExternalLink className="w-4 h-4" />
                          <span>{conflict.affectedEntries.length} entrée(s) affectée(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedConflict(expandedConflict === conflict.id ? null : conflict.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Voir les suggestions"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Suggestions étendues */}
                {expandedConflict === conflict.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                      Suggestions de résolution :
                    </h4>
                    <div className="space-y-3">
                      {conflict.suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                              {suggestion.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`${getEffortColor(suggestion.effort)} font-medium`}>
                                Effort: {suggestion.effort === 'low' ? 'Faible' : suggestion.effort === 'medium' ? 'Moyen' : 'Élevé'}
                              </span>
                              <span className={`${getEffortColor(suggestion.impact)} font-medium`}>
                                Impact: {suggestion.impact === 'low' ? 'Faible' : suggestion.impact === 'medium' ? 'Moyen' : 'Élevé'}
                              </span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleResolveConflict(conflict, suggestion)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Appliquer
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConflictResolver;
