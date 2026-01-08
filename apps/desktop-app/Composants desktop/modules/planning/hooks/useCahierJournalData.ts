import { useState, useEffect } from 'react';
import { CahierJournalEntry } from '../types';

interface UseCahierJournalDataReturn {
  data: CahierJournalEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCahierJournalData = (): UseCahierJournalDataReturn => {
  const [data, setData] = useState<CahierJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implémenter l'appel API réel
      // Pour l'instant, retourner un tableau vide
      setData([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchEntries
  };
};

// API functions
export const createCahierJournalEntry = async (entry: Omit<CahierJournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<CahierJournalEntry> => {
  const newEntry: CahierJournalEntry = {
    ...entry,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return newEntry;
};

export const updateCahierJournalEntry = async (entry: CahierJournalEntry): Promise<void> => {
  // Implémentation réelle à venir
  console.log('Mise à jour de l\'entrée:', entry);
};

export const duplicateCahierJournalEntry = async (entry: CahierJournalEntry): Promise<CahierJournalEntry> => {
  const duplicatedEntry = {
    ...entry,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0],
    statut: 'planifie' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return createCahierJournalEntry(duplicatedEntry);
};

export const createCahierJournalEntryFromTemplate = async (template: any): Promise<CahierJournalEntry> => {
  const newEntry = {
    date: new Date().toISOString().split('T')[0],
    classe: '',
    matiere: template.matiere,
    duree: template.duree,
    objectifs: template.objectifs,
    competences: template.competences,
    deroulement: template.deroulement,
    supports: template.supports,
    evaluation: template.evaluation,
    observations: '',
    statut: 'planifie' as const,
    enseignant: template.enseignant || 'Enseignant'
  };
  
  return createCahierJournalEntry(newEntry);
};
