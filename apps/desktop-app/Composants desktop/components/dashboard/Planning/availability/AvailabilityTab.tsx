import React, { useState, useMemo, useEffect } from 'react';
import { Clock, Users, Settings, Eye, AlertTriangle, CheckCircle, Calendar, Filter, Trash2 } from 'lucide-react';
import AvailabilityOverview from './AvailabilityOverview';
import SchoolConstraints from './SchoolConstraints';
import ConflictDetector from './ConflictDetector';
import { PlanningTeacher, PlanningClass, PlanningSubject, WorkHoursConfig } from '../../../../types/planning';
import { TeacherAvailabilityModal, ConfirmDeleteModal } from '../../../modals';
import { availabilityService, TeacherAvailability, WorkHoursConfig as AvailabilityWorkHoursConfig } from '../../../../services/availabilityService';

export type AvailabilityView = 'overview' | 'individual' | 'constraints' | 'conflicts';

interface AvailabilityTabProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  workHours: WorkHoursConfig | null;
  onSaveAvailability: (availabilityData: any) => Promise<void>;
  loading?: boolean;
  error?: string | null;
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

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  teachers,
  classes,
  subjects,
  workHours,
  onSaveAvailability,
  loading = false,
  error = null
}) => {
  const [activeView, setActiveView] = useState<AvailabilityView>('overview');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<PlanningTeacher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [schoolConstraints, setSchoolConstraints] = useState<SchoolConstraints>({
    maxHoursPerDay: 6,
    maxHoursPerWeek: 25,
    mandatoryBreaks: [],
    blockedTimeSlots: [],
    minRestBetweenClasses: 15,
    lunchBreakMandatory: true,
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00'
  });

  // États pour les données réelles
  const [teacherAvailabilities, setTeacherAvailabilities] = useState<Array<{
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
  }>>([]);
  const [availabilityStats, setAvailabilityStats] = useState({
    totalTeachers: 0,
    availableTeachers: 0,
    fullyAvailable: 0,
    withConstraints: 0,
    conflicts: 0,
    utilizationRate: 0,
    averageHoursPerDay: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Charger les données de disponibilité depuis la base de données
  useEffect(() => {
    const loadAvailabilityData = async () => {
      if (!teachers.length) {
        return;
      }
      
      setIsLoadingData(true);
      try {
        const schoolId = 'school-1'; // Utiliser un schoolId fixe
        
        // Récupérer les statistiques
        const stats = await availabilityService.getAvailabilityStats(schoolId);
        setAvailabilityStats(stats);

        // Récupérer les disponibilités des enseignants
        const teachersWithAvailability = await availabilityService.getTeachersWithAvailability(schoolId);
        
        const formattedAvailabilities = teachersWithAvailability.map(({ teacher, availability }) => ({
      teacherId: teacher.id,
      teacherName: teacher.name,
          availability: availability.map(slot => ({
            dayOfWeek: slot.day_of_week,
            startTime: slot.start_time,
            endTime: slot.end_time,
            isAvailable: Boolean(slot.is_available)
          })),
      constraints: {
        preferredStartTime: '08:00',
        preferredEndTime: '17:00',
            unavailableDays: availability.filter(slot => !slot.is_available).map(slot => slot.day_of_week),
            notes: ''
      }
    }));

        setTeacherAvailabilities(formattedAvailabilities);
      } catch (error) {
        console.error('Erreur lors du chargement des disponibilités:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAvailabilityData();
  }, [teachers]);

  // Charger les contraintes scolaires depuis la base de données
  useEffect(() => {
    const loadSchoolConstraints = async () => {
      try {
        const constraints = await availabilityService.getSchoolConstraints('school-1');
        setSchoolConstraints(constraints);
      } catch (error) {
        console.error('Erreur lors du chargement des contraintes scolaires:', error);
      }
    };

    loadSchoolConstraints();
  }, []);

  const handleTeacherAvailability = (teacher: PlanningTeacher) => {
    setSelectedTeacher(teacher.id);
    setIsAvailabilityModalOpen(true);
  };

  const handleSaveAvailabilityWrapper = async (availabilityData: any) => {
    try {
      console.log('🔍 handleSaveAvailabilityWrapper - Données reçues:', availabilityData);
      console.log('🔍 handleSaveAvailabilityWrapper - Teachers:', teachers);
      console.log('🔍 handleSaveAvailabilityWrapper - SchoolId:', teachers[0]?.schoolId);
      
      // Sauvegarder via le service
      const result = await availabilityService.saveTeacherAvailability({
        teacherId: availabilityData.teacherId,
        availability: availabilityData.availability,
        schoolId: teachers[0]?.schoolId || 'school-1'
      });
      
      console.log('🔍 handleSaveAvailabilityWrapper - Résultat:', result);

      if (result.success) {
        console.log('🔍 handleSaveAvailabilityWrapper - Sauvegarde réussie, rechargement des données...');
        
        // Recharger les données
        const loadAvailabilityData = async () => {
          try {
            const schoolId = 'school-1'; // Utiliser un schoolId fixe
            
            const stats = await availabilityService.getAvailabilityStats(schoolId);
            setAvailabilityStats(stats);

            const teachersWithAvailability = await availabilityService.getTeachersWithAvailability(schoolId);
            
            
            const formattedAvailabilities = teachersWithAvailability.map(({ teacher, availability }) => ({
              teacherId: teacher.id,
              teacherName: teacher.name,
              availability: availability.map(slot => ({
                dayOfWeek: slot.day_of_week,
                startTime: slot.start_time,
                endTime: slot.end_time,
                isAvailable: Boolean(slot.is_available)
              })),
              constraints: {
                preferredStartTime: '08:00',
                preferredEndTime: '17:00',
                unavailableDays: availability.filter(slot => !slot.is_available).map(slot => slot.day_of_week),
                notes: ''
              }
            }));

        setTeacherAvailabilities(formattedAvailabilities);
          } catch (error) {
            console.error('Erreur lors du rechargement des disponibilités:', error);
          }
        };

        await loadAvailabilityData();
        setIsLoadingData(false);
      } else {
        throw new Error(result.message || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des disponibilités:', error);
      throw error;
    }
  };

  const handleDeleteTeacherAvailability = (teacher: PlanningTeacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;

    setIsDeleting(true);
    try {
      const schoolId = 'school-1';
      const result = await availabilityService.deleteTeacherAvailability(teacherToDelete.id, schoolId);
      
      if (result.success) {
        // Recharger les données
        const loadAvailabilityData = async () => {
          try {
            const stats = await availabilityService.getAvailabilityStats(schoolId);
            setAvailabilityStats(stats);

            const teachersWithAvailability = await availabilityService.getTeachersWithAvailability(schoolId);
            
            const formattedAvailabilities = teachersWithAvailability.map(({ teacher, availability }) => ({
              teacherId: teacher.id,
              teacherName: teacher.name,
              availability: availability.map(slot => ({
                dayOfWeek: slot.day_of_week,
                startTime: slot.start_time,
                endTime: slot.end_time,
                isAvailable: Boolean(slot.is_available)
              })),
              constraints: {
                preferredStartTime: '08:00',
                preferredEndTime: '17:00',
                unavailableDays: availability.filter(slot => !slot.is_available).map(slot => slot.day_of_week),
                notes: ''
              }
            }));

            setTeacherAvailabilities(formattedAvailabilities);
          } catch (error) {
            console.error('Erreur lors du rechargement des disponibilités:', error);
          }
        };

        await loadAvailabilityData();
        setIsDeleteModalOpen(false);
        setTeacherToDelete(null);
      } else {
        alert('Erreur lors de la suppression : ' + result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des disponibilités:', error);
      alert('Erreur lors de la suppression des disponibilités');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTeacherToDelete(null);
  };

  const handleSaveSchoolConstraints = async (constraints: SchoolConstraints) => {
    try {
      const result = await availabilityService.saveSchoolConstraints('school-1', constraints);
      if (result.success) {
        setSchoolConstraints(constraints);
        console.log('Contraintes scolaires sauvegardées avec succès');
      } else {
        console.error('Erreur lors de la sauvegarde des contraintes:', result.message);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des contraintes scolaires:', error);
    }
  };

  const navigationTabs = [
    {
      id: 'overview' as AvailabilityView,
      name: 'Vue d\'ensemble',
      icon: Eye,
      description: 'Visualisation globale des disponibilités'
    },
    {
      id: 'individual' as AvailabilityView,
      name: 'Gestion individuelle',
      icon: Users,
      description: 'Configurer les disponibilités par enseignant'
    },
    {
      id: 'constraints' as AvailabilityView,
      name: 'Contraintes école',
      icon: Settings,
      description: 'Règles et contraintes de l\'établissement'
    },
    {
      id: 'conflicts' as AvailabilityView,
      name: 'Détection conflits',
      icon: AlertTriangle,
      description: 'Identifier et résoudre les conflits'
    }
  ];

  if (loading || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des disponibilités...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold mb-2">Gestion des Disponibilités</h2>
              <p className="text-blue-100 text-lg">
                Optimisez les créneaux horaires et gérez les contraintes de l'établissement
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">{availabilityStats.totalTeachers}</div>
                <div className="text-xs text-blue-100">Enseignants</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold text-green-300">{availabilityStats.availableTeachers}</div>
                <div className="text-xs text-blue-100">Disponibles</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold text-orange-300">{availabilityStats.withConstraints}</div>
                <div className="text-xs text-blue-100">Contraintes</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <div className="text-2xl font-bold">{availabilityStats.utilizationRate}%</div>
                <div className="text-xs text-blue-100">Utilisation</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Navigation des vues */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
        <nav className="flex space-x-1" role="tablist">
          {navigationTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`
                  flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                role="tab"
                aria-selected={isActive}
                title={tab.description}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des vues */}
      <div className="min-h-96">
        {activeView === 'overview' && (
          <AvailabilityOverview
            teachers={teachers}
            teacherAvailabilities={teacherAvailabilities}
            workHours={workHours}
            constraints={schoolConstraints}
            stats={availabilityStats}
            onEditAvailability={handleTeacherAvailability}
          />
        )}

        {activeView === 'individual' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Gestion Individuelle des Disponibilités
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configurez les créneaux horaires pour chaque enseignant
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Maternelle</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Primaire</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Secondaire</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {teachers.map((teacher) => {
                  const availability = teacherAvailabilities.find(a => a.teacherId === teacher.id);
                  const availableSlots = availability?.availability.filter(slot => slot.isAvailable).length || 0;
                  
                  // Calculer le nombre total d'heures disponibles
                  const totalAvailableHours = availability?.availability
                    .filter(slot => slot.isAvailable)
                    .reduce((total, slot) => {
                      const start = new Date(`2000-01-01T${slot.startTime}`);
                      const end = new Date(`2000-01-01T${slot.endTime}`);
                      const hours = (end - start) / (1000 * 60 * 60);
                      return total + hours;
                    }, 0) || 0;
                  
                  // Déterminer les couleurs selon le niveau scolaire
                  const getLevelColors = (subject: string) => {
                    if (subject?.includes('Maternelle')) {
                      return {
                        avatar: 'from-pink-500 to-rose-500',
                        badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
                        border: 'border-pink-200 dark:border-pink-800',
                        hover: 'hover:bg-pink-50 dark:hover:bg-pink-900/10'
                      };
                    } else if (subject?.includes('Primaire')) {
                      return {
                        avatar: 'from-green-500 to-emerald-500',
                        badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                        border: 'border-green-200 dark:border-green-800',
                        hover: 'hover:bg-green-50 dark:hover:bg-green-900/10'
                      };
                    } else if (subject?.includes('Secondaire')) {
                      return {
                        avatar: 'from-blue-500 to-indigo-500',
                        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                        border: 'border-blue-200 dark:border-blue-800',
                        hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/10'
                      };
                    } else if (subject?.includes('Administration')) {
                      return {
                        avatar: 'from-purple-500 to-violet-500',
                        badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                        border: 'border-purple-200 dark:border-purple-800',
                        hover: 'hover:bg-purple-50 dark:hover:bg-purple-900/10'
                      };
                    } else {
                      return {
                        avatar: 'from-gray-500 to-slate-500',
                        badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
                        border: 'border-gray-200 dark:border-gray-700',
                        hover: 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      };
                    }
                  };
                  
                  const colors = getLevelColors(teacher.subject || '');
                  
                  return (
                    <div key={teacher.id} className={`flex items-center justify-between p-6 border-2 ${colors.border} rounded-xl ${colors.hover} transition-all duration-200 shadow-sm hover:shadow-md`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 bg-gradient-to-r ${colors.avatar} rounded-full flex items-center justify-center shadow-lg`}>
                          <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
                            {teacher.name}
                          </h4>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                              {teacher.subject || 'Toutes matières'}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {availableSlots}/6 jours • {totalAvailableHours.toFixed(1)}h disponibles
                            </span>
                        </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {availableSlots === 6 ? (
                            <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                Complet
                              </span>
                            </div>
                          ) : availableSlots >= 4 ? (
                            <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-orange-500" />
                              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                Partiel
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                Limité
                          </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleTeacherAvailability(teacher)}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <Calendar className="w-4 h-4 mr-2 inline" />
                          Configurer
                        </button>
                          
                          {availableSlots > 0 && (
                            <button
                              onClick={() => handleDeleteTeacherAvailability(teacher)}
                              className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              title="Supprimer toutes les disponibilités"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeView === 'constraints' && (
          <SchoolConstraints
            constraints={schoolConstraints}
            onUpdateConstraints={handleSaveSchoolConstraints}
            workHours={workHours}
          />
        )}

        {activeView === 'conflicts' && (
          <ConflictDetector
            teachers={teachers}
            teacherAvailabilities={teacherAvailabilities}
            constraints={schoolConstraints}
            classes={classes}
            subjects={subjects}
          />
        )}
      </div>

      {/* Modal de disponibilité */}
      {isAvailabilityModalOpen && selectedTeacher && (
        <TeacherAvailabilityModal
          isOpen={isAvailabilityModalOpen}
          onClose={() => {
            setIsAvailabilityModalOpen(false);
            setSelectedTeacher(null);
          }}
          onSave={handleSaveAvailabilityWrapper}
          teacherId={selectedTeacher}
          teacherName={teachers.find(t => t.id === selectedTeacher)?.name || ''}
          existingAvailability={teacherAvailabilities.find(a => a.teacherId === selectedTeacher)?.availability || []}
        />
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Supprimer les disponibilités"
        message="Cette action supprimera définitivement toutes les disponibilités configurées pour cet enseignant. Cette action ne peut pas être annulée."
        itemName={teacherToDelete?.name}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AvailabilityTab;
