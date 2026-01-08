import { invokeIpc } from './dataService';

export interface Class {
  id: string;
  name: string;
  level: string;
  academicYearId: string;
  capacity?: number;
  main_teacher_id?: string;
  room_id?: string;
  description?: string;
  school_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassWithLevel {
  level: string;
  classes: Class[];
}

class ClassService {
  // Récupérer toutes les classes depuis le module Planning
  async getAllClasses(): Promise<Class[]> {
    try {
      console.log('🔍 Tentative de récupération des classes depuis le module Planning...');
      console.log('🔍 electronAPI disponible:', typeof window !== 'undefined' && !!(window as any).electronAPI);
      console.log('🔍 electronAPI.planning disponible:', typeof window !== 'undefined' && !!(window as any).electronAPI?.planning);
      console.log('🔍 electronAPI.planning.getAllClasses disponible:', typeof window !== 'undefined' && !!(window as any).electronAPI?.planning?.getAllClasses);
      
      // Essayer d'abord l'API Planning
      if (typeof window !== 'undefined' && (window as any).electronAPI?.planning?.getClasses) {
        console.log('🔍 Appel de electronAPI.planning.getClasses()...');
        const result = await api.planning.getClasses('default-school-001');
        console.log('✅ Résultat de getClasses:', result);
        if (result && result.success && result.data) {
          console.log('✅ Classes récupérées depuis Planning:', result.data.length, result.data);
          return result.data;
        } else {
          console.log('⚠️ Aucune classe trouvée dans Planning ou erreur:', result);
          return [];
        }
      }
      
      // Fallback vers l'API classes si Planning n'est pas disponible
      if (typeof window !== 'undefined' && (window as any).electronAPI?.classes?.getAllClasses) {
        console.log('🔍 Appel de electronAPI.classes.getAllClasses()...');
        const classes = await api.classes.getAllClasses();
        console.log('✅ Classes récupérées depuis Classes:', classes.length, classes);
        return classes;
      }
      
      console.log('⚠️ Aucune API de classes disponible');
      console.log('⚠️ electronAPI:', (window as any).electronAPI);
      return [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des classes:', error);
      return [];
    }
  }

  // Récupérer les classes par niveau depuis le module Planning
  async getClassesByLevel(level: string, academicYearId: string): Promise<Class[]> {
    try {
      console.log(`🔍 Recherche des classes pour le niveau: ${level}, année: ${academicYearId}`);
      
      // Essayer d'abord l'API Planning
      if (typeof window !== 'undefined' && (window as any).electronAPI?.planning?.getClasses) {
        console.log(`🔍 Appel de electronAPI.planning.getClasses() pour filtrer par niveau ${level}...`);
        const result = await api.planning.getClasses('default-school-001');
        if (result && result.success && result.data) {
          const filteredClasses = result.data.filter((cls: any) => cls.level === level);
          console.log(`✅ Classes filtrées pour ${level}:`, filteredClasses.length);
          return filteredClasses;
        } else {
          console.log(`⚠️ Aucune classe trouvée dans Planning pour ${level}:`, result);
          return [];
        }
      }
      
      // Fallback: récupérer toutes les classes et filtrer par niveau
      const allClasses = await this.getAllClasses();
      const filteredClasses = allClasses.filter(cls => cls.level === level);
      console.log(`✅ Classes filtrées pour ${level}:`, filteredClasses.length);
      return filteredClasses;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des classes par niveau:', error);
      return [];
    }
  }

  // Récupérer les classes groupées par niveau
  async getClassesGroupedByLevel(academicYearId: string): Promise<ClassWithLevel[]> {
    try {
      const classes = await this.getAllClasses();
      const classesForYear = classes.filter(cls => cls.academicYearId === academicYearId);
      
      // Grouper par niveau
      const groupedClasses = classesForYear.reduce((acc, cls) => {
        const existingLevel = acc.find(item => item.level === cls.level);
        if (existingLevel) {
          existingLevel.classes.push(cls);
        } else {
          acc.push({
            level: cls.level,
            classes: [cls]
          });
        }
        return acc;
      }, [] as ClassWithLevel[]);

      return groupedClasses;
    } catch (error) {
      console.error('Erreur lors du groupement des classes par niveau:', error);
      return [];
    }
  }

  // Créer une classe via le module Planning
  async createClass(classData: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<Class | null> {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.planning?.createClass) {
        const result = await api.planning.createClass(classData);
        if (result && result.success && result.data) {
          return result.data;
        }
        return null;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la création de la classe:', error);
      return null;
    }
  }

  // Mettre à jour une classe via le module Planning
  async updateClass(id: string, classData: Partial<Class>): Promise<Class | null> {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.planning?.updateClass) {
        const result = await api.planning.updateClass(id, classData);
        if (result && result.success && result.data) {
          return result.data;
        }
        return null;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la classe:', error);
      return null;
    }
  }

  // Supprimer une classe via le module Planning
  async deleteClass(id: string): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.planning?.deleteClass) {
        const result = await api.planning.deleteClass(id);
        if (result && result.success) {
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la suppression de la classe:', error);
      return false;
    }
  }

  // Les classes sont gérées par le module Planning
  // Cette méthode n'est plus nécessaire car les classes existent déjà
}

export const classService = new ClassService();
