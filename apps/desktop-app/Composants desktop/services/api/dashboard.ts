import { apiClient } from './config';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  activeStudents: number;
  activeTeachers: number;
  recentActivities: Activity[];
  upcomingEvents: Event[];
  performance: {
    overallAverage: number;
    bestSubject: string;
    worstSubject: string;
    attendanceRate: number;
  };
}

export interface Activity {
  id: string;
  type: 'grade' | 'attendance' | 'announcement' | 'exam' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  className?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'exam' | 'meeting' | 'holiday' | 'deadline';
  className?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }>;
}

export const dashboardService = {
  async getDashboardStats(schoolId?: string): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats', {
      params: { schoolId }
    });
    return response.data;
  },

  async getRecentActivities(limit: number = 10) {
    const response = await apiClient.get('/dashboard/activities', {
      params: { limit }
    });
    return response.data;
  },

  async getUpcomingEvents(limit: number = 10) {
    const response = await apiClient.get('/dashboard/events', {
      params: { limit }
    });
    return response.data;
  },

  async getPerformanceChart(classId?: string, termId?: string): Promise<ChartData> {
    const response = await apiClient.get('/dashboard/performance-chart', {
      params: { classId, termId }
    });
    return response.data;
  },

  async getAttendanceChart(classId?: string, dateRange?: string): Promise<ChartData> {
    const response = await apiClient.get('/dashboard/attendance-chart', {
      params: { classId, dateRange }
    });
    return response.data;
  },

  async getFinanceChart(dateRange?: string): Promise<ChartData> {
    const response = await apiClient.get('/dashboard/finance-chart', {
      params: { dateRange }
    });
    return response.data;
  },

  async getNotifications() {
    const response = await apiClient.get('/dashboard/notifications');
    return response.data;
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/dashboard/notifications/${notificationId}/read`);
  },

  async getQuickStats(type: 'students' | 'teachers' | 'classes' | 'subjects') {
    const response = await apiClient.get(`/dashboard/quick-stats/${type}`);
    return response.data;
  }
};
