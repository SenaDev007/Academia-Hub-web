/**
 * Client API HTTP pour Academia Hub Web SaaS
 * 
 * Remplace electronBridge pour la version Web
 * Toutes les communications passent par HTTP REST
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Instance Axios configurée
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de requête : Ajoute le token JWT
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Récupérer le token depuis le cookie ou localStorage
    const token = getAuthToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ajouter le tenant_id depuis le contexte ou le sous-domaine
    const tenantId = getTenantId();
    if (tenantId && config.headers) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    // Ajouter le school_level_id depuis localStorage (OBLIGATOIRE)
    const schoolLevelId = getSchoolLevelId();
    if (schoolLevelId && config.headers) {
      config.headers['X-School-Level-ID'] = schoolLevelId;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse : Gestion des erreurs
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Erreur 401 : Token expiré ou invalide
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tentative de refresh token
        const newToken = await refreshAuthToken();
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh échoué : rediriger vers login
        clearAuthToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Erreur 403 : Accès refusé
    if (error.response?.status === 403) {
      console.error('Access denied');
      // Optionnel : rediriger ou afficher message
    }

    // Erreur 404 : Ressource non trouvée
    if (error.response?.status === 404) {
      console.error('Resource not found');
    }

    // Erreur 500 : Erreur serveur
    if (error.response?.status === 500) {
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

/**
 * Récupère le token d'authentification
 */
function getAuthToken(): string | null {
  // Essayer depuis localStorage (temporaire, à remplacer par httpOnly cookie)
  return localStorage.getItem('authToken');
  
  // TODO: Utiliser httpOnly cookie en production
  // const cookies = document.cookie.split(';');
  // const tokenCookie = cookies.find(c => c.trim().startsWith('authToken='));
  // return tokenCookie ? tokenCookie.split('=')[1] : null;
}

/**
 * Récupère le tenant_id
 */
function getTenantId(): string | null {
  // 1. Depuis le sous-domaine
  const subdomain = extractSubdomain(window.location.hostname);
  if (subdomain) {
    // TODO: Résoudre subdomain → tenant_id via API
    return localStorage.getItem(`tenant_${subdomain}`);
  }

  // 2. Depuis localStorage (temporaire)
  return localStorage.getItem('tenantId');

  // 3. Depuis le JWT token (si disponible)
  // const token = getAuthToken();
  // if (token) {
  //   const payload = JSON.parse(atob(token.split('.')[1]));
  //   return payload.tenantId;
  // }

  return null;
}

/**
 * Extrait le sous-domaine depuis le hostname
 */
function extractSubdomain(hostname: string): string | null {
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  return null;
}

/**
 * Rafraîchit le token d'authentification
 */
async function refreshAuthToken(): Promise<string | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      withCredentials: true, // Pour les cookies httpOnly
    });
    
    const newToken = response.data.token;
    if (newToken) {
      localStorage.setItem('authToken', newToken);
      return newToken;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

/**
 * Supprime le token d'authentification
 */
function clearAuthToken(): void {
  localStorage.removeItem('authToken');
  // TODO: Supprimer aussi le cookie httpOnly
}

/**
 * Définit le token d'authentification
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('authToken', token);
  // TODO: Définir aussi le cookie httpOnly côté serveur
}

/**
 * Définit le tenant_id
 */
export function setTenantId(tenantId: string): void {
  localStorage.setItem('tenantId', tenantId);
}

/**
 * Récupère le school_level_id
 */
function getSchoolLevelId(): string | null {
  // Depuis localStorage (format: schoolLevelId_tenantId)
  const tenantId = getTenantId();
  if (tenantId) {
    return localStorage.getItem(`schoolLevelId_${tenantId}`);
  }
  return localStorage.getItem('schoolLevelId');
}

/**
 * Définit le school_level_id
 */
export function setSchoolLevelId(schoolLevelId: string, tenantId?: string): void {
  const tenant = tenantId || getTenantId();
  if (tenant) {
    localStorage.setItem(`schoolLevelId_${tenant}`, schoolLevelId);
  } else {
    localStorage.setItem('schoolLevelId', schoolLevelId);
  }
}

/**
 * API object with all endpoints
 */
export const api = {
  // Students endpoints
  students: {
    getAll: async () => {
      return apiClient.get('/students');
    },
    getById: async (id: string) => {
      return apiClient.get(`/students/${id}`);
    },
    create: async (studentData: any) => {
      return apiClient.post('/students', studentData);
    },
    update: async (id: string, studentData: any) => {
      return apiClient.patch(`/students/${id}`, studentData);
    },
    delete: async (id: string) => {
      return apiClient.delete(`/students/${id}`);
    },
    // Additional methods for compatibility
    search: async (query: string) => {
      return apiClient.get(`/students?search=${encodeURIComponent(query)}`);
    },
    getByClass: async (classId: string) => {
      return apiClient.get(`/students?classId=${classId}`);
    },
  },
  // Auth endpoints
  auth: {
    login: async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
      return apiClient.post('/auth/login', credentials);
    },
    register: async (userData: any) => {
      return apiClient.post('/auth/register', userData);
    },
    logout: async () => {
      return apiClient.post('/auth/logout');
    },
    refresh: async () => {
      return apiClient.post('/auth/refresh');
    },
    profile: async () => {
      return apiClient.get('/auth/profile');
    },
  },
  // Finance endpoints
  finance: {
    getPayments: async (filters?: any) => {
      return apiClient.get('/finance/payments', { params: filters });
    },
    getStudentBalance: async (studentId: string, academicYearId: string) => {
      return apiClient.get(`/finance/students/${studentId}/balance`, { params: { academicYearId } });
    },
    createPayment: async (paymentData: any) => {
      return apiClient.post('/finance/payments', paymentData);
    },
    updatePayment: async (id: string, paymentData: any) => {
      return apiClient.patch(`/finance/payments/${id}`, paymentData);
    },
    deletePayment: async (id: string) => {
      return apiClient.delete(`/finance/payments/${id}`);
    },
  },
  // Planning endpoints
  planning: {
    getTeachers: async (schoolId: string) => {
      return apiClient.get('/planning/teachers', { params: { schoolId } });
    },
    getSchedules: async (filters?: any) => {
      return apiClient.get('/planning/schedules', { params: filters });
    },
    createSchedule: async (scheduleData: any) => {
      return apiClient.post('/planning/schedules', scheduleData);
    },
    updateSchedule: async (id: string, scheduleData: any) => {
      return apiClient.patch(`/planning/schedules/${id}`, scheduleData);
    },
    deleteSchedule: async (id: string) => {
      return apiClient.delete(`/planning/schedules/${id}`);
    },
  },
  // School endpoints
  school: {
    getSettings: async () => {
      return apiClient.get('/school/settings');
    },
    updateSettings: async (settings: any) => {
      return apiClient.patch('/school/settings', settings);
    },
  },
  // School Levels endpoints
  schoolLevels: {
    getAll: async (tenantId: string) => {
      return apiClient.get(`/school-levels?tenantId=${tenantId}`);
    },
    getById: async (id: string) => {
      return apiClient.get(`/school-levels/${id}`);
    },
  },
  // Modules endpoints
  modules: {
    getAll: async (tenantId: string, schoolLevelId?: string) => {
      const params = schoolLevelId 
        ? `?tenantId=${tenantId}&schoolLevelId=${schoolLevelId}`
        : `?tenantId=${tenantId}`;
      return apiClient.get(`/modules${params}`);
    },
    getByType: async (tenantId: string, moduleType: string, schoolLevelId?: string) => {
      const params = schoolLevelId
        ? `?tenantId=${tenantId}&type=${moduleType}&schoolLevelId=${schoolLevelId}`
        : `?tenantId=${tenantId}&type=${moduleType}`;
      return apiClient.get(`/modules${params}`);
    },
    isEnabled: async (tenantId: string, moduleType: string, schoolLevelId: string) => {
      return apiClient.get(`/modules/check-enabled?tenantId=${tenantId}&type=${moduleType}&schoolLevelId=${schoolLevelId}`);
    },
  },
  // Synthesis endpoints (Module général de synthèse)
  synthesis: {
    getFinancesByModule: async (schoolLevelId?: string) => {
      const params = schoolLevelId ? `?schoolLevelId=${schoolLevelId}` : '';
      return apiClient.get(`/synthesis/finances-by-module${params}`);
    },
    getFinancesByLevel: async (schoolLevelId?: string) => {
      const params = schoolLevelId ? `?schoolLevelId=${schoolLevelId}` : '';
      return apiClient.get(`/synthesis/finances-by-level${params}`);
    },
    getEffectifsByLevel: async (schoolLevelId?: string) => {
      const params = schoolLevelId ? `?schoolLevelId=${schoolLevelId}` : '';
      return apiClient.get(`/synthesis/effectifs-by-level${params}`);
    },
    getKPIGlobal: async () => {
      return apiClient.get('/synthesis/kpi-global');
    },
    getDashboard: async (schoolLevelId?: string) => {
      const params = schoolLevelId ? `?schoolLevelId=${schoolLevelId}` : '';
      return apiClient.get(`/synthesis/dashboard${params}`);
    },
    getDashboardWithKPI: async (schoolLevelId?: string) => {
      const params = schoolLevelId ? `?schoolLevelId=${schoolLevelId}` : '';
      return apiClient.get(`/synthesis/dashboard-with-kpi${params}`);
    },
    getRevenueGrowthRate: async (schoolLevelId: string, periodStart: string, periodEnd: string, previousPeriodStart: string, previousPeriodEnd: string) => {
      return apiClient.get(`/synthesis/revenue-growth-rate?schoolLevelId=${schoolLevelId}&periodStart=${periodStart}&periodEnd=${periodEnd}&previousPeriodStart=${previousPeriodStart}&previousPeriodEnd=${previousPeriodEnd}`);
    },
    getClassOccupancyRate: async (schoolLevelId: string) => {
      return apiClient.get(`/synthesis/class-occupancy-rate?schoolLevelId=${schoolLevelId}`);
    },
  },
  // Tenants endpoints
  tenants: {
    getById: async (id: string) => {
      return apiClient.get(`/tenants/${id}`);
    },
    getBySubdomain: async (subdomain: string) => {
      return apiClient.get(`/tenants/slug/${subdomain}`);
    },
    getAll: async () => {
      return apiClient.get('/tenants');
    },
  },
  // Database endpoints (pour requêtes SQL - à utiliser avec précaution)
  database: {
    executeQuery: async (sql: string, params: any[] = []) => {
      // TODO: Implémenter endpoint sécurisé pour requêtes SQL
      // Pour l'instant, retourner une erreur car les requêtes SQL directes ne sont pas recommandées
      throw new Error('Direct SQL queries are not allowed. Use specific API endpoints instead.');
    },
  },
};

// Export both api object and apiClient instance
export { apiClient };
export default apiClient;

