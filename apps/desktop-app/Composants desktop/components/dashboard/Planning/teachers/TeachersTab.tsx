import React, { useState, useMemo, useEffect } from 'react';
import { Users, BookOpen, Clock, BarChart3, Plus, Settings } from 'lucide-react';
import CycleSelector from './CycleSelector';
import TeachersOverview from './TeachersOverview';
import TeachersAssignments from './TeachersAssignments';
import TeachersWorkload from './TeachersWorkload';
import AssignmentWizard from './AssignmentWizard';
import TeacherPlanningModal from './components/TeacherPlanningModal';
import AssignmentDetailsModal from './components/AssignmentDetailsModal';
import AssignmentDeleteModal from './components/AssignmentDeleteModal';
import { PlanningTeacher, PlanningClass, PlanningSubject } from '../../../../types/planning';
import { sortClassesByLevel, getLevelDisplayName, getLevelCategory } from '../../../../utils/levelUtils';
import { planningService } from '../../../../services/planningService';

export type EducationalCycle = 'all' | 'maternelle' | 'primaire' | 'secondaire';
export type TeachersView = 'overview' | 'assignments' | 'workload';

interface TeachersTabProps {
  teachers: PlanningTeacher[];
  classes: PlanningClass[];
  subjects: PlanningSubject[];
  onSaveAssignment: (assignmentData: any) => Promise<void>;
  onSaveAvailability: (availabilityData: any) => Promise<void>;
  onRefreshData?: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const TeachersTab: React.FC<TeachersTabProps> = ({
  teachers,
  classes,
  subjects,
  onSaveAssignment,
  onSaveAvailability,
  onRefreshData,
  loading = false,
  error = null
}) => {
  const [activeView, setActiveView] = useState<TeachersView>('overview');
  const [selectedCycle, setSelectedCycle] = useState<EducationalCycle>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [isAssignmentWizardOpen, setIsAssignmentWizardOpen] = useState(false);
  const [isTeacherPlanningModalOpen, setIsTeacherPlanningModalOpen] = useState(false);
  const [isAssignmentDetailsModalOpen, setIsAssignmentDetailsModalOpen] = useState(false);
  const [isAssignmentDeleteModalOpen, setIsAssignmentDeleteModalOpen] = useState(false);
  const [selectedTeacherForPlanning, setSelectedTeacherForPlanning] = useState<PlanningTeacher | null>(null);
  const [selectedAssignmentForDetails, setSelectedAssignmentForDetails] = useState<any>(null);
  const [selectedAssignmentForDelete, setSelectedAssignmentForDelete] = useState<any>(null);
  const [selectedAssignmentForEdit, setSelectedAssignmentForEdit] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Fonction pour récupérer les affectations
  const fetchAssignments = async () => {
    try {
      console.log('🔍 TeachersTab - Récupération des affectations...');
      const assignmentsData = await planningService.getTeacherAssignments('school-1');
      console.log('🔍 TeachersTab - Affectations récupérées:', assignmentsData);
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des affectations:', error);
      setAssignments([]);
    }
  };

  // Récupérer les affectations au montage du composant
  useEffect(() => {
    fetchAssignments();
  }, []);

  // Fonction pour filtrer les enseignants par cycle spécifique
  const getTeachersByCycle = (cycle: EducationalCycle) => {
    if (cycle === 'all') return teachers;
    
    return teachers.filter(teacher => {
      // Utiliser directement les données de l'enseignant
      const teacherClasses = teacher.classes || [];
      return teacherClasses.some(className => {
        const classObj = classes.find(c => c.name === className);
        if (!classObj) return false;
        
        const level = classObj.level.toLowerCase();
        switch (cycle) {
          case 'maternelle':
            return level.includes('maternelle') || level.includes('ps') || level.includes('ms') || level.includes('gs');
          case 'primaire':
            return level.includes('primaire') || level.includes('cp') || level.includes('ce') || level.includes('cm');
          case 'secondaire':
            return level.includes('6') || level.includes('5') || level.includes('4') || level.includes('3') || 
                   level.includes('2nde') || level.includes('1ère') || level.includes('tle') || level.includes('terminale');
          default:
            return true;
        }
      });
    });
  };

  // Filtrer les enseignants par cycle sélectionné
  const filteredTeachers = useMemo(() => {
    return getTeachersByCycle(selectedCycle);
  }, [teachers, classes, selectedCycle]);

  // Filtrer les classes par cycle
  const filteredClasses = useMemo(() => {
    if (selectedCycle === 'all') return classes;
    
    return classes.filter(classObj => {
      const level = classObj.level.toLowerCase();
      switch (selectedCycle) {
        case 'maternelle':
          return level.includes('maternelle') || level.includes('ps') || level.includes('ms') || level.includes('gs');
        case 'primaire':
          return level.includes('primaire') || level.includes('cp') || level.includes('ce') || level.includes('cm');
        case 'secondaire':
          return level.includes('6') || level.includes('5') || level.includes('4') || level.includes('3') || 
                 level.includes('2nde') || level.includes('1ère') || level.includes('tle') || level.includes('terminale');
        default:
          return true;
      }
    });
  }, [classes, selectedCycle]);

  // Filtrer les matières par cycle
  const filteredSubjects = useMemo(() => {
    if (selectedCycle === 'all') {
      // Supprimer les matières génériques même quand tous les cycles sont sélectionnés
      return subjects.filter(subject => {
        const name = subject.name.toLowerCase();
        return !name.includes('toutes les matières') && 
               !name.includes('aucune matière') &&
               !name.includes('administration');
      });
    }
    
    return subjects.filter(subject => {
      const level = subject.level.toLowerCase();
      const name = subject.name.toLowerCase();
      
      // Supprimer les matières génériques
      if (name.includes('toutes les matières') || 
          name.includes('aucune matière') ||
          name.includes('administration')) {
        return false;
      }
      
      if (level === 'tous niveaux' || level === 'all') return true;
      
      switch (selectedCycle) {
        case 'maternelle':
          return level.includes('maternelle');
        case 'primaire':
          return level.includes('primaire');
        case 'secondaire':
          return level.includes('secondaire') || level.includes('collège') || level.includes('lycée');
        default:
          return true;
      }
    });
  }, [subjects, selectedCycle]);

  const handleNewAssignment = () => {
    setIsAssignmentWizardOpen(true);
  };


  const handleViewTeacherPlanning = (teacher: PlanningTeacher) => {
    setSelectedTeacherForPlanning(teacher);
    setIsTeacherPlanningModalOpen(true);
  };



  const handleCloseTeacherPlanningModal = () => {
    setIsTeacherPlanningModalOpen(false);
    setSelectedTeacherForPlanning(null);
  };

  const handleViewAssignmentDetails = (assignment: any) => {
    setSelectedAssignmentForDetails(assignment);
    setIsAssignmentDetailsModalOpen(true);
  };

  const handleEditAssignment = (assignment: any) => {
    // Utiliser l'AssignmentWizard existant pour l'édition
    setSelectedAssignmentForEdit(assignment);
    setIsAssignmentWizardOpen(true);
  };

  const handleDeleteAssignment = (assignment: any) => {
    setSelectedAssignmentForDelete(assignment);
    setIsAssignmentDeleteModalOpen(true);
  };

  const handleConfirmDeleteAssignment = async () => {
    try {
      if (!selectedAssignmentForDelete) {
        console.error('Aucune affectation sélectionnée pour la suppression');
        return;
      }

      console.log('🗑️ Suppression affectation:', selectedAssignmentForDelete);
      console.log('🔍 onRefreshData disponible:', !!onRefreshData);
      
      // Appeler le service de suppression
      const result = await planningService.deleteTeacherAssignment(selectedAssignmentForDelete.id);
      console.log('🔍 Résultat suppression:', result);
      
      if (result.success) {
        console.log('✅ Affectation supprimée avec succès');
        // Fermer le modal
        setIsAssignmentDeleteModalOpen(false);
        setSelectedAssignmentForDelete(null);
        
        // Rafraîchir les données pour mettre à jour l'interface
        if (onRefreshData) {
          console.log('🔄 Rafraîchissement des données...');
          await onRefreshData();
          console.log('✅ Données rafraîchies');
        } else {
          console.warn('⚠️ onRefreshData non disponible');
        }
      } else {
        console.error('❌ Erreur lors de la suppression:', result.message);
        // TODO: Afficher un message d'erreur à l'utilisateur
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'affectation:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    }
  };

  const handleCloseAssignmentDetailsModal = () => {
    setIsAssignmentDetailsModalOpen(false);
    setSelectedAssignmentForDetails(null);
  };

  const handleCloseAssignmentDeleteModal = () => {
    setIsAssignmentDeleteModalOpen(false);
    setSelectedAssignmentForDelete(null);
  };

  const handleSaveAssignmentWrapper = async (assignmentData: any) => {
    try {
      await onSaveAssignment(assignmentData);
      setIsAssignmentWizardOpen(false);
      setSelectedAssignmentForEdit(null);
      
      // Recharger les affectations après une nouvelle affectation
      console.log('🔄 Rechargement des affectations après sauvegarde...');
      await fetchAssignments();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'affectation:', error);
      throw error;
    }
  };

  const navigationTabs = [
    {
      id: 'overview' as TeachersView,
      name: 'Vue d\'ensemble',
      icon: Users,
      description: 'Aperçu général des enseignants et affectations'
    },
    {
      id: 'assignments' as TeachersView,
      name: 'Affectations',
      icon: BookOpen,
      description: 'Gérer les affectations enseignants ↔ matières ↔ classes'
    },
    {
      id: 'workload' as TeachersView,
      name: 'Charge de travail',
      icon: BarChart3,
      description: 'Analyser et équilibrer la charge horaire'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold mb-2">Gestion des Enseignants</h2>
              <p className="text-orange-100 text-lg">
                Organisez les affectations par cycle éducatif de manière intelligente
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleNewAssignment}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Affectation
              </button>
              <button 
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl"
              >
                <Settings className="w-5 h-5 mr-2" />
                Paramètres
              </button>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
      </div>

      {/* Sélecteur de cycle */}
      <CycleSelector 
        selectedCycle={selectedCycle}
        onCycleChange={setSelectedCycle}
        teacherCounts={{
          all: teachers.length,
          maternelle: getTeachersByCycle('maternelle').length,
          primaire: getTeachersByCycle('primaire').length,
          secondaire: getTeachersByCycle('secondaire').length
        }}
      />

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
                    ? 'bg-orange-600 text-white shadow-lg' 
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
          <TeachersOverview
            teachers={filteredTeachers}
            classes={filteredClasses}
            subjects={filteredSubjects}
            selectedCycle={selectedCycle}
            onTeacherSelect={setSelectedTeacher}
            onNewAssignment={handleNewAssignment}
            onViewTeacherPlanning={handleViewTeacherPlanning}
            onEditAssignment={handleEditAssignment}
            onSaveAssignment={onSaveAssignment}
          />
        )}

        {activeView === 'assignments' && (
          <TeachersAssignments
            teachers={filteredTeachers}
            classes={filteredClasses}
            subjects={filteredSubjects}
            assignments={assignments}
            selectedCycle={selectedCycle}
            onSaveAssignment={onSaveAssignment}
            onViewAssignmentDetails={handleViewAssignmentDetails}
            onEditAssignment={handleEditAssignment}
            onDeleteAssignment={handleDeleteAssignment}
          />
        )}

        {activeView === 'workload' && (
          <TeachersWorkload
            teachers={filteredTeachers}
            classes={filteredClasses}
            subjects={filteredSubjects}
            selectedCycle={selectedCycle}
            onEditAssignment={handleEditAssignment}
            onSaveAssignment={onSaveAssignment}
          />
        )}
      </div>

      {/* Assistant d'affectation */}
      {isAssignmentWizardOpen && (
        <AssignmentWizard
          isOpen={isAssignmentWizardOpen}
          onClose={() => {
            setIsAssignmentWizardOpen(false);
            setSelectedAssignmentForEdit(null);
          }}
          onSave={handleSaveAssignmentWrapper}
          teachers={filteredTeachers}
          classes={filteredClasses}
          subjects={filteredSubjects}
          selectedCycle={selectedCycle}
          editingAssignment={selectedAssignmentForEdit}
        />
      )}


      {/* Modal de planning d'enseignant */}
      <TeacherPlanningModal
        isOpen={isTeacherPlanningModalOpen}
        onClose={handleCloseTeacherPlanningModal}
        teacher={selectedTeacherForPlanning}
        classes={classes}
        subjects={subjects}
      />

      {/* Modal de détails d'affectation */}
      <AssignmentDetailsModal
        isOpen={isAssignmentDetailsModalOpen}
        onClose={handleCloseAssignmentDetailsModal}
        assignment={selectedAssignmentForDetails}
        teacher={selectedAssignmentForDetails ? teachers.find(t => t.id === selectedAssignmentForDetails.teacherId) : undefined}
        classes={classes}
        subjects={subjects}
      />

      {/* Modal de suppression d'affectation */}
      <AssignmentDeleteModal
        isOpen={isAssignmentDeleteModalOpen}
        onClose={handleCloseAssignmentDeleteModal}
        onConfirm={handleConfirmDeleteAssignment}
        assignment={selectedAssignmentForDelete}
        loading={loading}
      />
    </div>
  );
};

export default TeachersTab;
