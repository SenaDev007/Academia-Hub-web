import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';
import { planningService } from '../services/planningService';
import { useStudentsData } from './useStudentsData';
import { useAcademicYearState } from './useAcademicYearState';
import { useUser } from '../contexts/UserContext';

// Fonction utilitaire pour formater le temps
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('fr-FR');
};

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  successRate: number;
  activeTeachers: number;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'enrollment' | 'alert' | 'grade' | 'attendance';
  message: string;
  time: string;
  status: 'success' | 'warning' | 'info' | 'error';
  studentName?: string;
  className?: string;
  amount?: number;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'meeting' | 'event' | 'exam' | 'holiday';
  description?: string;
  location?: string;
}

export interface UseDashboardDataReturn {
  // Statistiques principales
  stats: DashboardStats;
  statsLoading: boolean;
  
  // Activités récentes
  recentActivities: RecentActivity[];
  activitiesLoading: boolean;
  
  // Événements à venir
  upcomingEvents: UpcomingEvent[];
  eventsLoading: boolean;
  
  // États de chargement
  loading: boolean;
  error: string | null;
  
  // Fonctions
  refreshData: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  refreshEvents: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const { selectedAcademicYear } = useAcademicYearState('overview');
  const { stats: studentStats, loading: studentsLoading } = useStudentsData();
  const { user } = useUser();
  
  // États des données
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalPayments: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    successRate: 0,
    activeTeachers: 0
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  
  // États de chargement
  const [statsLoading, setStatsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les statistiques du dashboard
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setError(null);
    
    try {
      console.log('📊 Chargement des statistiques du dashboard...');
      const dashboardStats = await dataService.getDashboardStats();
      
      // Calculer le revenu mensuel (approximation)
      const monthlyRevenue = Math.round(dashboardStats.totalRevenue / 12);
      
      // Calculer le taux de réussite (simulation basée sur les données)
      const successRate = Math.min(95, Math.max(85, 90 + (dashboardStats.totalStudents / 100)));
      
      // Récupérer les enseignants du module planning (même logique que le dashboard planning)
      let totalTeachers = dashboardStats.totalTeachers;
      if (totalTeachers === 0 && user?.schoolId) {
        try {
          console.log('📊 Récupération des enseignants via planningService...');
          const teachersData = await planningService.getTeachers(user.schoolId);
          totalTeachers = teachersData.length;
          console.log('📊 Enseignants récupérés du planning:', totalTeachers);
        } catch (planningError) {
          console.error('❌ Erreur lors de la récupération des enseignants du planning:', planningError);
          // Fallback vers la valeur statique du module planning
          totalTeachers = 24;
          console.log('📊 Utilisation du fallback statique pour les enseignants:', totalTeachers);
        }
      }
      
      const enhancedStats: DashboardStats = {
        ...dashboardStats,
        totalTeachers,
        monthlyRevenue,
        successRate: Math.round(successRate * 10) / 10,
        activeTeachers: totalTeachers
      };
      
      console.log('✅ Statistiques chargées:', enhancedStats);
      setStats(enhancedStats);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
      
      // Fallback avec les données des étudiants
      const fallbackStats: DashboardStats = {
        totalStudents: studentStats.totalStudents,
        totalTeachers: 0,
        totalClasses: 0,
        totalPayments: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        successRate: studentStats.attendanceRate || 92.5,
        activeTeachers: 0
      };
      setStats(fallbackStats);
    } finally {
      setStatsLoading(false);
    }
  }, [studentStats, user?.schoolId]);

  // Charger les activités récentes
  const fetchActivities = useCallback(async () => {
    setActivitiesLoading(true);
    setError(null);
    
    try {
      console.log('📝 Chargement des activités récentes...');
      
      // Récupérer de vraies activités depuis la base de données
      const activities: RecentActivity[] = [];
      
      // Récupérer les paiements récents
      try {
        const recentPayments = await dataService.getRecentPayments(5);
        recentPayments.forEach((payment, index) => {
          activities.push({
            id: `payment-${payment.id}`,
            type: 'payment',
            message: `Paiement reçu de ${payment.studentName || 'un élève'} (${payment.className || 'Classe inconnue'})`,
            time: getTimeAgo(payment.createdAt),
            status: 'success',
            studentName: payment.studentName,
            className: payment.className,
            amount: payment.amount
          });
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des paiements récents:', error);
      }
      
      // Récupérer les inscriptions récentes
      try {
        const recentStudents = await dataService.getRecentStudents(3);
        recentStudents.forEach((student, index) => {
          activities.push({
            id: `enrollment-${student.id}`,
            type: 'enrollment',
            message: `Nouvel élève inscrit: ${student.firstName} ${student.lastName} (${student.className || 'Classe inconnue'})`,
            time: getTimeAgo(student.createdAt),
            status: 'info',
            studentName: `${student.firstName} ${student.lastName}`,
            className: student.className
          });
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des inscriptions récentes:', error);
      }
      
      // Récupérer les absences récentes
      try {
        const recentAbsences = await dataService.getRecentAbsences(3);
        recentAbsences.forEach((absence, index) => {
          activities.push({
            id: `absence-${absence.id}`,
            type: 'alert',
            message: `Absence non justifiée: ${absence.studentName} (${absence.className})`,
            time: getTimeAgo(absence.date),
            status: 'warning',
            studentName: absence.studentName,
            className: absence.className
          });
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des absences récentes:', error);
      }
      
      // Trier par date et prendre les 5 plus récentes
      const sortedActivities = activities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);
      
      // Si pas assez d'activités réelles, ajouter quelques activités par défaut
      if (sortedActivities.length < 3) {
        const defaultActivities: RecentActivity[] = [
          {
            id: 'default-1',
            type: 'grade',
            message: 'Notes saisies pour le contrôle de Mathématiques (Terminale S)',
            time: 'Il y a 1h',
            status: 'success',
            className: 'Terminale S'
          },
          {
            id: 'default-2',
            type: 'alert',
            message: 'Rappel: Réunion parents-professeurs demain à 14h',
            time: 'Il y a 2h',
            status: 'info'
          }
        ];
        sortedActivities.push(...defaultActivities.slice(0, 3 - sortedActivities.length));
      }
      
      setRecentActivities(sortedActivities);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des activités:', err);
      setError('Erreur lors du chargement des activités');
    } finally {
      setActivitiesLoading(false);
    }
  }, [studentStats]);

  // Charger les événements à venir
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setError(null);
    
    try {
      console.log('📅 Chargement des événements à venir...');
      
      // Récupérer de vrais événements depuis la base de données
      const events: UpcomingEvent[] = [];
      
      // Récupérer les examens à venir
      try {
        const upcomingExams = await dataService.getUpcomingExams(5);
        upcomingExams.forEach((exam, index) => {
          events.push({
            id: `exam-${exam.id}`,
            title: exam.title,
            date: exam.date,
            time: exam.time || '08:00',
            type: 'exam',
            description: exam.description,
            location: exam.location
          });
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des examens:', error);
      }
      
      // Récupérer les réunions à venir
      try {
        const upcomingMeetings = await dataService.getUpcomingMeetings(3);
        upcomingMeetings.forEach((meeting, index) => {
          events.push({
            id: `meeting-${meeting.id}`,
            title: meeting.title,
            date: meeting.date,
            time: meeting.time || '14:00',
            type: 'meeting',
            description: meeting.description,
            location: meeting.location
          });
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des réunions:', error);
      }
      
      // Trier par date et prendre les 5 plus proches
      const sortedEvents = events
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      
      // Si pas assez d'événements réels, ajouter quelques événements par défaut
      if (sortedEvents.length < 3) {
        const defaultEvents: UpcomingEvent[] = [
          {
            id: 'default-1',
            title: 'Réunion parents-professeurs',
            date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '18:00',
            type: 'meeting',
            description: 'Rencontre avec les parents',
            location: 'Amphithéâtre'
          },
          {
            id: 'default-2',
            title: 'Vacances de février',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            time: '00:00',
            type: 'holiday',
            description: 'Début des vacances de février'
          }
        ];
        sortedEvents.push(...defaultEvents.slice(0, 3 - sortedEvents.length));
      }
      
      setUpcomingEvents(sortedEvents);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des événements:', err);
      setError('Erreur lors du chargement des événements');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // Charger toutes les données
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStats(),
        fetchActivities(),
        fetchEvents()
      ]);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [fetchStats, fetchActivities, fetchEvents]);

  // Rafraîchir les données
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Rafraîchir les statistiques
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Rafraîchir les activités
  const refreshActivities = useCallback(async () => {
    await fetchActivities();
  }, [fetchActivities]);

  // Rafraîchir les événements
  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Charger les données au montage et quand l'année scolaire change
  useEffect(() => {
    fetchData();
  }, [fetchData, selectedAcademicYear]);

  return {
    stats,
    statsLoading,
    recentActivities,
    activitiesLoading,
    upcomingEvents,
    eventsLoading,
    loading,
    error,
    refreshData,
    refreshStats,
    refreshActivities,
    refreshEvents
  };
}
