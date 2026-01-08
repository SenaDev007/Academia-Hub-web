import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { FichePedagogique, FichePedagogiqueFilters, Commentaire, DuplicationOptions, Statistiques, ReferenceData, DemoData } from '../types';

class FichesPedagogiquesError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'FichesPedagogiquesError';
  }
}

interface FichesPedagogiquesServiceConfig {
  baseUrl: string;
}

class FichesPedagogiquesService {
  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor(config: FichesPedagogiquesServiceConfig = { 
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
  }) {
    this.baseUrl = config.baseUrl;
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    }) as AxiosInstance;

    // Ajouter l'intercepteur pour le token JWT
    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig): AxiosRequestConfig => {
      const token = this.getAuthToken();
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': localStorage.getItem('tenantId') || ''
      };
      return config;
    });

    // Gérer les erreurs d'authentification
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Gérer le token expiré
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('tenantId');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Récupérer toutes les fiches avec filtres
  async getFiches(filters: Partial<FichePedagogiqueFilters> = {}): Promise<FichePedagogique[]> {
    try {
      const response = await this.axiosInstance.get('/fiches-pedagogiques', {
        params: filters
      });
      
      if (!response.data.success) {
        throw new FichesPedagogiquesError(response.data.message, response.status);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération fiches:', error);
      throw new FichesPedagogiquesError(error instanceof AxiosError ? error.message : 'Erreur inconnue', error instanceof AxiosError ? error.response?.status : undefined);
    }
  }

  // Récupérer une fiche par ID
  async getFicheById(id: string): Promise<FichePedagogique> {
    try {
      const response = await this.axiosInstance.get(`/fiches-pedagogiques/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération fiche:', error);
      throw error;
    }
  }

  // Créer une nouvelle fiche
  async createFiche(ficheData: FichePedagogique): Promise<FichePedagogique> {
    try {
      const response = await this.axiosInstance.post('/fiches-pedagogiques', ficheData);
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur création fiche:', error);
      throw error;
    }
  }

  // Mettre à jour une fiche
  async updateFiche(id: string, ficheData: Partial<FichePedagogique>): Promise<FichePedagogique> {
    try {
      const response = await this.axiosInstance.put(`/fiches-pedagogiques/${id}`, ficheData);
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur mise à jour fiche:', error);
      throw error;
    }
  }

  // Envoyer une fiche pour validation au directeur
  async envoyerPourValidation(ficheId: string, commentaire: string = ''): Promise<FichePedagogique> {
    try {
      const response = await this.axiosInstance.put(`/fiches-pedagogiques/${ficheId}/envoyer-validation`, {
        commentaire
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur envoi pour validation:', error);
      throw error;
    }
  }

  // Valider une fiche par le directeur
  async validerFiche(ficheId: string, commentaire: string = ''): Promise<FichePedagogique> {
    try {
      const response = await this.axiosInstance.put(`/fiches-pedagogiques/${ficheId}/valider`, {
        commentaire
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur validation fiche:', error);
      throw error;
    }
  }

  // Demander des corrections (directeur)
  async demanderCorrections(ficheId: string, commentaire: string): Promise<FichePedagogique> {
    try {
      const response = await this.axiosInstance.put(`/fiches-pedagogiques/${ficheId}/demander-corrections`, {
        commentaire
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur demande corrections:', error);
      throw error;
    }
  }

  // Ajouter un commentaire
  async ajouterCommentaire(ficheId: string, commentaire: Partial<Commentaire>): Promise<Commentaire> {
    try {
      const response = await this.axiosInstance.post(`/fiches-pedagogiques/${ficheId}/commentaires`, commentaire);
      
      if (!response.data.success) {
        throw new FichesPedagogiquesError(response.data.message, response.status);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
      throw new FichesPedagogiquesError(error instanceof AxiosError ? error.message : 'Erreur inconnue', error instanceof AxiosError ? error.response?.status : undefined);
    }
  }

  // Dupliquer une fiche
  async dupliquerFiche(ficheId: string, options: DuplicationOptions): Promise<FichePedagogique> {
    try {
      const response = await this.axiosInstance.post(`/fiches-pedagogiques/${ficheId}/dupliquer`, options);
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur duplication fiche:', error);
      throw error;
    }
  }

  // Supprimer une fiche
  async deleteFiche(id: string): Promise<void> {
    try {
      const response = await this.axiosInstance.delete(`/fiches-pedagogiques/${id}`);
      
      if (!response.data.success) {
        throw new FichesPedagogiquesError(response.data.message, response.status);
      }
    } catch (error) {
      console.error('Erreur suppression fiche:', error);
      throw new FichesPedagogiquesError(error instanceof AxiosError ? error.message : 'Erreur inconnue', error instanceof AxiosError ? error.response?.status : undefined);
    }
  }

  // Récupérer les statistiques
  async getStatistiques(etablissementId: string, anneeScolaireId: string): Promise<Statistiques> {
    try {
      const response = await this.axiosInstance.get('/fiches-pedagogiques/statistiques', {
        params: {
          etablissement_id: etablissementId,
          annee_scolaire_id: anneeScolaireId
        }
      });
      
      if (!response.data.success) {
        throw new FichesPedagogiquesError(response.data.message, response.status);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      throw new FichesPedagogiquesError(error instanceof AxiosError ? error.message : 'Erreur inconnue', error instanceof AxiosError ? error.response?.status : undefined);
    }
  }

  // Récupérer les données de référence
  async getReferenceData(): Promise<ReferenceData> {
    try {
      const response = await this.axiosInstance.get('/fiches-pedagogiques/reference-data');
      
      if (!response.data.success) {
        throw new FichesPedagogiquesError(response.data.message, response.status);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur récupération données référence:', error);
      throw new FichesPedagogiquesError(error instanceof AxiosError ? error.message : 'Erreur inconnue', error instanceof AxiosError ? error.response?.status : undefined);
    }
  }

  // Récupérer le token d'authentification
  getAuthToken(): string {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new FichesPedagogiquesError('Pas de token d\'authentification', 401);
    }
    return token;
  }

  // Simuler les données pour la démo
  async getMockData(): Promise<DemoData> {
    return {
      fiches: [
        {
          id: '1',
          titre: "Les fractions - Addition et soustraction",
          matiere: "Mathématiques",
          classe: "6ème",
          saNumero: "SA 3",
          sequenceNumero: "Séquence 2",
          date: "2025-01-20",
          statut: "brouillon",
          enseignant: "M. KOUASSI Jean",
          commentaires: 0,
          lastModified: "2025-01-18 14:30"
        },
        {
          id: '2',
          titre: "La conjugaison du présent",
          matiere: "Français",
          classe: "5ème",
          saNumero: "SA 2",
          sequenceNumero: "Séquence 1",
          date: "2025-01-19",
          statut: "en_attente",
          enseignant: "Mme ADJOVI Marie",
          commentaires: 1,
          lastModified: "2025-01-17 10:15"
        }
      ],
      statistiques: {
        totalFiches: 124,
        enAttente: 8,
        validees: 98,
        brouillons: 18,
        conformiteAPC: 85,
        tauxValidation: 92
      }
    };
  }
}

export default new FichesPedagogiquesService();