export interface ReferenceData {
  matieres: string[];
  niveaux: string[];
  classes: string[];
  enseignants: string[];
  templates: Template[];
  anneesScolaires: string[];
  trimestres: string[];
}

export interface DemoData {
  fiches: {
    id: string;
    titre: string;
    matiere: string;
    classe: string;
    saNumero: string;
    sequenceNumero: string;
    date: string;
    statut: 'brouillon' | 'en_attente' | 'validé' | 'rejeté';
    enseignant: string;
    commentaires: number;
    lastModified: string;
  }[];
  statistiques: {
    totalFiches: number;
    enAttente: number;
    validees: number;
    brouillons: number;
    conformiteAPC: number;
    tauxValidation: number;
  };
}

export interface DuplicationOptions {
  matiere?: string;
  classe?: string;
  enseignant?: string;
  date?: string;
  anneeScolaire?: string;
  trimestre?: string;
  sequence?: string;
  titre?: string;
  description?: string;
}

export interface Commentaire {
  id: string | undefined;
  type: 'enseignant' | 'directeur' | 'validation' | 'correction';
  contenu: string;
  date: string;
  utilisateur: string;
  statut?: 'en_attente' | 'lu' | 'repondu';
}

export interface FichePedagogique {
  id: string;
  titre: string;
  description: string;
  contenu: string;
  matiere: string;
  niveau: string;
  classe: string;
  enseignant: string;
  dateCreation: string;
  dateModification: string;
  statut: 'en_attente' | 'validé' | 'rejeté' | 'en_cours';
  commentaireDirecteur?: string;
  templateId?: string;
  attachments?: string[];
  historique?: {
    date: string;
    utilisateur: string;
    action: string;
    commentaire?: string;
  }[];
  commentaires?: Commentaire[];
}

export interface FichePedagogiqueFilters {
  matiere?: string;
  classe?: string;
  enseignant?: string;
  statut?: 'en_attente' | 'validé' | 'rejeté' | 'en_cours';
  dateDebut?: string;
  dateFin?: string;
  search?: string;
  page?: number;
  limit?: number;
}

import { AxiosInstance, AxiosRequestConfig, AxiosInterceptorManager } from 'axios';

export type { AxiosInstance, AxiosRequestConfig, AxiosInterceptorManager };

export interface Template {
  id: string;
  nom: string;
  description: string;
  contenu: string;
  type: string;
  dateCreation: string;
}

export interface Commentaire {
  id: string | undefined;
  ficheId?: string;
  utilisateur: string;
  contenu: string;
  date: string;
  type: 'enseignant' | 'directeur' | 'validation' | 'correction';
  statut?: 'en_attente' | 'lu' | 'repondu';
}

export interface DuplicationOptions {
  newTitre?: string;
  newDescription?: string;
  newContenu?: string;
  newStatut?: 'en_attente' | 'validé' | 'rejeté' | 'en_cours';
  newAttachments?: string[];
  newHistorique?: {
    date: string;
    utilisateur: string;
    action: string;
    commentaire?: string;
  }[];
  newCommentaires?: Commentaire[];
}

export interface Statistiques {
  totalFiches: number;
  fichesEnAttente: number;
  fichesValidees: number;
  fichesRejetees: number;
  fichesParMatiere: {
    matiere: string;
    nombre: number;
  }[];
  fichesParNiveau: {
    niveau: string;
    nombre: number;
  }[];
}
