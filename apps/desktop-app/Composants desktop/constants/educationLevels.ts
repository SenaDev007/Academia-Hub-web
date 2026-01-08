export interface EducationLevel {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export const EDUCATION_LEVELS: EducationLevel[] = [
  {
    id: 'maternelle',
    name: 'Maternelle',
    description: 'Éducation préscolaire pour les enfants de 3 à 6 ans',
    order: 1
  },
  {
    id: 'primaire',
    name: 'Primaire',
    description: 'Enseignement élémentaire du CP au CM2',
    order: 2
  },
  {
    id: '1er-cycle-secondaire',
    name: '1er Cycle secondaire',
    description: 'Collège de la 6ème à la 3ème',
    order: 3
  },
  {
    id: '2nd-cycle-secondaire',
    name: '2nd Cycle secondaire',
    description: 'Lycée de la 2nde à la Terminale',
    order: 4
  }
];

export const getEducationLevelById = (id: string): EducationLevel | undefined => {
  return EDUCATION_LEVELS.find(level => level.id === id);
};

export const getEducationLevelByName = (name: string): EducationLevel | undefined => {
  return EDUCATION_LEVELS.find(level => level.name === name);
};

export const getEducationLevelsByOrder = (): EducationLevel[] => {
  return [...EDUCATION_LEVELS].sort((a, b) => a.order - b.order);
};
