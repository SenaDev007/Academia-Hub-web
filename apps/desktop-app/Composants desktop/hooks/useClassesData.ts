import { useState, useEffect, useCallback } from 'react';
import { classService, Class, ClassWithLevel } from '../services/classService';

export const useClassesData = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [classesByLevel, setClassesByLevel] = useState<ClassWithLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les classes
  const loadClasses = useCallback(async () => {
    try {
      console.log('🔄 useClassesData: Chargement des classes...');
      setLoading(true);
      setError(null);
      const classesData = await classService.getAllClasses();
      console.log('🔄 useClassesData: Classes reçues:', classesData.length, classesData);
      setClasses(classesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des classes');
      console.error('Erreur lors du chargement des classes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les classes groupées par niveau
  const loadClassesByLevel = useCallback(async (academicYearId: string) => {
    try {
      setLoading(true);
      setError(null);
      const groupedClasses = await classService.getClassesGroupedByLevel(academicYearId);
      setClassesByLevel(groupedClasses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des classes par niveau');
      console.error('Erreur lors du chargement des classes par niveau:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer une classe
  const createClass = useCallback(async (classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const newClass = await classService.createClass(classData);
      if (newClass) {
        setClasses(prev => [...prev, newClass]);
        return newClass;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la classe');
      console.error('Erreur lors de la création de la classe:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour une classe
  const updateClass = useCallback(async (id: string, classData: Partial<Class>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedClass = await classService.updateClass(id, classData);
      if (updatedClass) {
        setClasses(prev => prev.map(cls => cls.id === id ? updatedClass : cls));
        return updatedClass;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la classe');
      console.error('Erreur lors de la mise à jour de la classe:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer une classe
  const deleteClass = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await classService.deleteClass(id);
      if (success) {
        setClasses(prev => prev.filter(cls => cls.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la classe');
      console.error('Erreur lors de la suppression de la classe:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Les classes sont gérées par le module Planning
  // Cette méthode n'est plus nécessaire car les classes existent déjà
  const generateDefaultClassesForLevel = useCallback(async (level: string, academicYearId: string, schoolId: string) => {
    console.log('Les classes sont gérées par le module Planning. Utilisez l\'onglet Classes pour créer des classes.');
    return [];
  }, []);

  // Charger les classes au montage
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  return {
    classes,
    classesByLevel,
    loading,
    error,
    loadClasses,
    loadClassesByLevel,
    createClass,
    updateClass,
    deleteClass,
    generateDefaultClassesForLevel
  };
};
