import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar,
  RefreshCw,
  Eye,
  Settings,
  Filter,
  Search,
  XCircle,
  Info,
  Zap,
  Target
} from 'lucide-react';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../types/planning';
import { conflictResolutionService, Conflict } from '../../../../services/conflictResolutionService';
import { ResolutionResultModal } from '../../../modals';
import { TeacherAvailabilityModal } from '../../../modals';

interface TeacherAvailability {
  teacherId: string;
  teacherName: string;
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  constraints: {
    preferredStartTime: string;
    preferredEndTime: string;
    unavailableDays: number[];
    notes: string;
  };
}

interface SchoolConstraints {
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  mandatoryBreaks: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
  }>;
  blockedTimeSlots: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    reason: string;
  }>;
  minRestBetweenClasses: number;
  lunchBreakMandatory: boolean;
  lunchBreakStart: string;
  lunchBreakEnd: string;
}

interface Conflict {
  id: string;
  type: 'availability' | 'workload' | 'schedule' | 'constraint';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedTeachers: string[];
  affectedClasses?: string[];
  timeSlot?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  };
  suggestions: string[];
  autoResolvable: boolean;
}

interface ConflictDetectorProps {
  teachers: PlanningTeacher[];
  teacherAvailabilities: TeacherAvailability[];
  constraints: SchoolConstraints;
  classes: PlanningClass[];
  subjects: PlanningSubject[];
}

const ConflictDetector: React.FC<ConflictDetectorProps> = ({
  teachers,
  teacherAvailabilities,
  constraints,
  classes,
  subjects
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);
  const [resolvingConflicts, setResolvingConflicts] = useState<Set<string>>(new Set());
  const [resolutionResults, setResolutionResults] = useState<{[key: string]: {success: boolean, message: string}}>({});
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [currentResolutionResult, setCurrentResolutionResult] = useState<any>(null);
  
  // États pour le modal de disponibilité avec suggestions
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const days = [
    { id: 1, name: 'Lundi', short: 'Lun' },
    { id: 2, name: 'Mardi', short: 'Mar' },
    { id: 3, name: 'Mercredi', short: 'Mer' },
    { id: 4, name: 'Jeudi', short: 'Jeu' },
    { id: 5, name: 'Vendredi', short: 'Ven' },
    { id: 6, name: 'Samedi', short: 'Sam' }
  ];

  // Analyser les conflits
  const detectedConflicts = useMemo((): Conflict[] => {
    const conflicts: Conflict[] = [];

    // 1. Conflits de disponibilité
    teacherAvailabilities.forEach(teacherAvail => {
      const teacher = teachers.find(t => t.id === teacherAvail.teacherId);
      if (!teacher) return;

      // Vérifier les jours complètement indisponibles
      const unavailableDays = teacherAvail.availability.filter(a => !a.isAvailable);
      if (unavailableDays.length > 2) {
        conflicts.push({
          id: `availability-${teacher.id}-days`,
          type: 'availability',
          severity: unavailableDays.length > 4 ? 'critical' : 'high',
          title: `Disponibilité limitée - ${teacher.name}`,
          description: `${teacher.name} n'est disponible que ${6 - unavailableDays.length} jours sur 6, ce qui peut compliquer la planification.`,
          teacherId: teacher.id,
          affectedTeachers: [teacher.id],
          suggestions: [
            'Négocier une disponibilité supplémentaire',
            'Répartir la charge sur les jours disponibles',
            'Envisager un enseignant supplémentaire'
          ],
          autoResolvable: false
        });
      }

      // Vérifier les créneaux horaires trop restrictifs
      const availableDays = teacherAvail.availability.filter(a => a.isAvailable);
      const restrictiveDays = availableDays.filter(day => {
        const start = parseInt(day.startTime.split(':')[0]);
        const end = parseInt(day.endTime.split(':')[0]);
        return (end - start) < 6; // Moins de 6h disponibles
      });

      if (restrictiveDays.length > 0) {
        conflicts.push({
          id: `availability-${teacher.id}-hours`,
          type: 'availability',
          severity: 'medium',
          title: `Créneaux horaires restreints - ${teacher.name}`,
          description: `${teacher.name} a des créneaux horaires limités sur ${restrictiveDays.length} jour(s), réduisant les possibilités de planification.`,
          teacherId: teacher.id,
          affectedTeachers: [teacher.id],
          suggestions: [
            'Étendre les heures de disponibilité',
            'Concentrer les cours sur les créneaux optimaux',
            'Utiliser les créneaux pour des cours plus courts'
          ],
          autoResolvable: false
        });
      }
    });

    // 2. Conflits de charge de travail
    teachers.forEach(teacher => {
      const availability = teacherAvailabilities.find(a => a.teacherId === teacher.id);
      if (!availability) return;

      const totalAvailableHours = availability.availability.reduce((total, day) => {
        if (!day.isAvailable) return total;
        const start = parseInt(day.startTime.split(':')[0]);
        const end = parseInt(day.endTime.split(':')[0]);
        return total + (end - start);
      }, 0);

      // Vérifier si la charge dépasse les contraintes
      if (totalAvailableHours > constraints.maxHoursPerWeek) {
        conflicts.push({
          id: `workload-${teacher.id}-excess`,
          type: 'workload',
          severity: 'high',
          title: `Dépassement de charge - ${teacher.name}`,
          description: `${teacher.name} pourrait dépasser la limite de ${constraints.maxHoursPerWeek}h/semaine avec ${totalAvailableHours}h de disponibilité.`,
          teacherId: teacher.id,
          affectedTeachers: [teacher.id],
          suggestions: [
            'Réduire les heures de disponibilité',
            'Répartir la charge sur plusieurs enseignants',
            'Ajuster les contraintes de l\'établissement'
          ],
          autoResolvable: true
        });
      }

      // Vérifier la sous-utilisation
      if (totalAvailableHours < constraints.maxHoursPerWeek * 0.5) {
        conflicts.push({
          id: `workload-${teacher.id}-underuse`,
          type: 'workload',
          severity: 'low',
          title: `Sous-utilisation - ${teacher.name}`,
          description: `${teacher.name} n'est disponible que ${totalAvailableHours}h/semaine, ce qui pourrait être optimisé.`,
          teacherId: teacher.id,
          affectedTeachers: [teacher.id],
          suggestions: [
            'Augmenter les heures de disponibilité',
            'Assigner des responsabilités supplémentaires',
            'Optimiser la répartition des cours'
          ],
          autoResolvable: true
        });
      }
    });

    // 3. Conflits avec les contraintes d'établissement
    constraints.blockedTimeSlots.forEach(blockedSlot => {
      const affectedTeachers = teacherAvailabilities.filter(teacherAvail => {
        const dayAvailability = teacherAvail.availability.find(a => a.dayOfWeek === blockedSlot.dayOfWeek);
        if (!dayAvailability?.isAvailable) return false;

        const teacherStart = parseInt(dayAvailability.startTime.split(':')[0]);
        const teacherEnd = parseInt(dayAvailability.endTime.split(':')[0]);
        const blockedStart = parseInt(blockedSlot.startTime.split(':')[0]);
        const blockedEnd = parseInt(blockedSlot.endTime.split(':')[0]);

        return teacherStart <= blockedStart && teacherEnd >= blockedEnd;
      });

      if (affectedTeachers.length > 0) {
        conflicts.push({
          id: `constraint-blocked-${blockedSlot.id}`,
          type: 'constraint',
          severity: 'medium',
          title: `Conflit avec créneau bloqué`,
          description: `Le créneau bloqué "${blockedSlot.reason}" entre en conflit avec les disponibilités de ${affectedTeachers.length} enseignant(s).`,
          teacherId: affectedTeachers[0]?.teacherId, // Prendre le premier enseignant affecté
          affectedTeachers: affectedTeachers.map(t => t.teacherId),
          timeSlot: {
            dayOfWeek: blockedSlot.dayOfWeek,
            startTime: blockedSlot.startTime,
            endTime: blockedSlot.endTime
          },
          suggestions: [
            'Ajuster les disponibilités des enseignants',
            'Modifier le créneau bloqué',
            'Planifier les cours en dehors de cette période'
          ],
          autoResolvable: true
        });
      }
    });

    // 4. Conflits de pause déjeuner
    if (constraints.lunchBreakMandatory) {
      const lunchStart = parseInt(constraints.lunchBreakStart.split(':')[0]);
      const lunchEnd = parseInt(constraints.lunchBreakEnd.split(':')[0]);

      teacherAvailabilities.forEach(teacherAvail => {
        const teacher = teachers.find(t => t.id === teacherAvail.teacherId);
        if (!teacher) return;

        const conflictingDays = teacherAvail.availability.filter(day => {
          if (!day.isAvailable) return false;
          const dayStart = parseInt(day.startTime.split(':')[0]);
          const dayEnd = parseInt(day.endTime.split(':')[0]);
          
          // Vérifier si la disponibilité chevauche avec la pause déjeuner sans la couvrir complètement
          return (dayStart < lunchEnd && dayEnd > lunchStart) && !(dayStart <= lunchStart && dayEnd >= lunchEnd);
        });

        if (conflictingDays.length > 0) {
          conflicts.push({
            id: `constraint-lunch-${teacher.id}`,
            type: 'constraint',
            severity: 'medium',
            title: `Conflit pause déjeuner - ${teacher.name}`,
            description: `Les disponibilités de ${teacher.name} ne permettent pas de respecter intégralement la pause déjeuner obligatoire.`,
            teacherId: teacher.id,
            affectedTeachers: [teacher.id],
            suggestions: [
              'Ajuster les heures de disponibilité',
              'Modifier les heures de pause déjeuner',
              'Prévoir des créneaux de cours avant/après la pause'
            ],
            autoResolvable: true
          });
        }
      });
    }

    return conflicts;
  }, [teachers, teacherAvailabilities, constraints]);

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
      case 'availability': return <Calendar className="w-4 h-4" />;
      case 'workload': return <Users className="w-4 h-4" />;
      case 'schedule': return <Clock className="w-4 h-4" />;
      case 'constraint': return <Settings className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    // Simuler une analyse
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  const getDayName = (dayOfWeek: number) => {
    return days.find(d => d.id === dayOfWeek)?.name || 'Inconnu';
  };

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.id === teacherId)?.name || 'Inconnu';
  };

  const handleResolveConflict = async (conflict: Conflict) => {
    // Au lieu de résoudre automatiquement, ouvrir le modal de disponibilité avec des suggestions
    const teacherId = conflict.teacherId;
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (!teacher) {
      console.error('Enseignant non trouvé:', teacherId);
      return;
    }

    // Générer des suggestions de résolution basées sur le type de conflit
    const suggestions = generateResolutionSuggestions(conflict);
    
    // Ouvrir le modal de disponibilité avec les suggestions
    setSelectedTeacher({
      ...teacher,
      suggestions: suggestions,
      conflictType: conflict.type,
      conflictDescription: conflict.description
    });
    setIsAvailabilityModalOpen(true);
  };

  const generateResolutionSuggestions = (conflict: Conflict) => {
    const suggestions = [];
    
    switch (conflict.type) {
      case 'workload':
        if (conflict.description.includes('Dépassement')) {
          suggestions.push({
            type: 'reduce_hours',
            title: 'Réduire les heures de disponibilité',
            description: 'Diminuer le nombre d\'heures disponibles pour respecter la charge maximale',
            action: 'reduce'
          });
          suggestions.push({
            type: 'adjust_schedule',
            title: 'Ajuster l\'horaire',
            description: 'Modifier les créneaux horaires pour optimiser la charge',
            action: 'adjust'
          });
        } else if (conflict.description.includes('Sous-utilisation')) {
          suggestions.push({
            type: 'increase_hours',
            title: 'Augmenter les heures de disponibilité',
            description: 'Ajouter plus de créneaux disponibles pour atteindre la charge minimale',
            action: 'increase'
          });
        }
        break;
        
      case 'constraint':
        suggestions.push({
          type: 'modify_constraints',
          title: 'Modifier les contraintes',
          description: 'Ajuster les contraintes personnelles pour résoudre le conflit',
          action: 'modify'
        });
        break;
        
      case 'availability':
        suggestions.push({
          type: 'update_availability',
          title: 'Mettre à jour la disponibilité',
          description: 'Modifier les créneaux de disponibilité pour résoudre le conflit',
          action: 'update'
        });
        break;
        
      default:
        suggestions.push({
          type: 'manual_review',
          title: 'Révision manuelle',
          description: 'Examiner et ajuster manuellement la disponibilité',
          action: 'review'
        });
    }
    
    return suggestions;
  };

  const handleCloseResolutionModal = () => {
    setIsResolutionModalOpen(false);
    setCurrentResolutionResult(null);
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-3">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
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
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filtrer par type"
            >
              <option value="all">Tous types</option>
              <option value="availability">Disponibilité</option>
              <option value="workload">Charge de travail</option>
              <option value="schedule">Planification</option>
              <option value="constraint">Contraintes</option>
            </select>

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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
                Toutes les disponibilités sont compatibles avec les contraintes de l'établissement.
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

                      {/* Résultat de résolution */}
                      {resolutionResults[conflict.id] && (
                        <div className={`p-3 rounded-lg mb-3 ${
                          resolutionResults[conflict.id].success 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}>
                          <div className="flex items-center gap-2">
                            {resolutionResults[conflict.id].success ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              resolutionResults[conflict.id].success 
                                ? 'text-green-800 dark:text-green-300' 
                                : 'text-red-800 dark:text-red-300'
                            }`}>
                              {resolutionResults[conflict.id].message}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Informations détaillées */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {conflict.affectedTeachers.length} enseignant(s): {' '}
                            {conflict.affectedTeachers.slice(0, 2).map(getTeacherName).join(', ')}
                            {conflict.affectedTeachers.length > 2 && ` +${conflict.affectedTeachers.length - 2} autres`}
                          </span>
                        </div>
                        
                        {conflict.timeSlot && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {getDayName(conflict.timeSlot.dayOfWeek)} {conflict.timeSlot.startTime}-{conflict.timeSlot.endTime}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedConflict(expandedConflict === conflict.id ? null : conflict.id)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Voir les suggestions"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {conflict.autoResolvable && (
                      <button
                        onClick={() => handleResolveConflict(conflict)}
                        disabled={resolvingConflicts.has(conflict.id)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resolvingConflicts.has(conflict.id) ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Résolution...
                          </>
                        ) : (
                          <>
                        <Target className="w-4 h-4" />
                        Résoudre
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Suggestions étendues */}
                {expandedConflict === conflict.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      Suggestions de résolution :
                    </h4>
                    <ul className="space-y-2">
                      {conflict.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de résultat de résolution */}
      <ResolutionResultModal
        isOpen={isResolutionModalOpen}
        onClose={handleCloseResolutionModal}
        result={currentResolutionResult}
        isResolving={resolvingConflicts.size > 0}
      />

      {/* Modal de disponibilité avec suggestions */}
      {selectedTeacher && (
        <TeacherAvailabilityModal
          isOpen={isAvailabilityModalOpen}
          onClose={() => {
            setIsAvailabilityModalOpen(false);
            setSelectedTeacher(null);
          }}
          teacher={selectedTeacher}
          onSave={(availability) => {
            // Logique de sauvegarde avec les suggestions appliquées
            console.log('Sauvegarde avec suggestions:', availability);
            setIsAvailabilityModalOpen(false);
            setSelectedTeacher(null);
          }}
          suggestions={selectedTeacher.suggestions}
          conflictType={selectedTeacher.conflictType}
          conflictDescription={selectedTeacher.conflictDescription}
        />
      )}
    </div>
  );
};

export default ConflictDetector;
