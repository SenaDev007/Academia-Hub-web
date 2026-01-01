// Types pour Cahier Journal
export interface CahierJournalEntry {
  id: string;
  date: string;
  classe: string;
  matiere: string;
  duree: number;
  objectifs: string;
  competences: string[];
  deroulement: string;
  supports: string;
  evaluation: string;
  observations: string;
  statut: 'planifie' | 'realise' | 'annule' | 'reporte';
  enseignant: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour Fiches Pédagogiques
export interface FichePedagogique {
  id: string;
  titre: string;
  matiere: string;
  niveau: string;
  duree: number;
  objectifs: string[];
  competences: string[];
  deroulement: string;
  supports: string[];
  evaluation: string;
  materiels: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
  enseignant: string;
}

// Types pour Cahier de Texte
export interface CahierTexteEntry {
  id: string;
  date: string;
  classe: string;
  matiere: string;
  titre: string;
  contenu: string;
  devoirs: string[];
  documents: string[];
  remarques: string;
  enseignant: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour Réservations
export interface Reservation {
  id: string;
  title: string;
  start: string;
  end: string;
  resourceId?: string;
  type: 'salle' | 'materiel' | 'enseignant';
  status: 'pending' | 'confirmed' | 'cancelled';
  requester: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les ressources
export interface Resource {
  id: string;
  name: string;
  type: string;
  capacity?: number;
  equipment?: string[];
  availability: {
    start: string;
    end: string;
  }[];
}

// Types pour Work Hours
export interface WorkHour {
  id: string;
  day: string;
  is_work_day: boolean;
  start_time?: string;
  end_time?: string;
  breaks?: Break[];
}

export interface Break {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  duration: number;
}
