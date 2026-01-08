import { useState, useEffect } from 'react';

export interface Template {
  id: string;
  nom: string;
  matiere: string;
  niveau: string;
  duree: number;
  objectifs: string;
  competences: string[];
  deroulement: string;
  supports: string;
  evaluation: string;
  auteur: string;
  utilise: number;
  note: number;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Remplacer par appel API réel
      // Pour l'instant, retourner un tableau vide
      setTemplates([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates
  };
};
