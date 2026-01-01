// Configuration pour les tests d'intégration
export const INTEGRATION_CONFIG = {
  // URLs de test
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // Endpoints de test
  HEALTH_CHECK: '/health',
  AUTH_CHECK: '/auth/me',
  
  // Données de test
  TEST_CREDENTIALS: {
    email: 'admin@school.com',
    password: 'password123'
  },
  
  // Configuration des timeouts
  TIMEOUTS: {
    API: 10000,
    LOGIN: 5000,
    UPLOAD: 30000
  },
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Fonctions utilitaires pour les tests
export const integrationHelpers = {
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${INTEGRATION_CONFIG.API_BASE_URL}${INTEGRATION_CONFIG.HEALTH_CHECK}`);
      return response.ok;
    } catch {
      return false;
    }
  },

  async waitForBackend(maxAttempts = 30, interval = 1000): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.checkBackendHealth()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    return false;
  }
};
