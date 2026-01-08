import { useState, useEffect } from 'react';

export interface Matiere {
  id: string;
  nom: string;
  code: string;
  couleur: string;
  dureeStandard: number;
  niveaux: string[];
  competencesBase: string[];
  description: string;
  coefficient: number;
}

export interface ReferentielScolaire {
  matieres: Matiere[];
  niveaux: string[];
}

export const useReferentielScolaire = () => {
  const [referentiel, setReferentiel] = useState<ReferentielScolaire>({
    matieres: [],
    niveaux: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferentiel = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Données de démonstration pour les tests - à remplacer par appel API réel
      const demoData: ReferentielScolaire = {
        matieres: [
          {
            id: '1',
            nom: 'Français',
            code: 'FR',
            couleur: 'bg-blue-500',
            dureeStandard: 45,
            niveaux: ['CP1', 'CE1', 'CM1', 'CM2'],
            competencesBase: ['Lecture', 'Écriture', 'Grammaire', 'Vocabulaire'],
            description: 'Apprentissage de la langue française : lecture, écriture, grammaire et expression orale.',
            coefficient: 3
          },
          {
            id: '2',
            nom: 'Mathématiques',
            code: 'MATH',
            couleur: 'bg-green-500',
            dureeStandard: 45,
            niveaux: ['CP1', 'CE1', 'CM1', 'CM2'],
            competencesBase: ['Calcul', 'Géométrie', 'Résolution de problèmes', 'Logique'],
            description: 'Développement des compétences mathématiques : calcul, géométrie et résolution de problèmes.',
            coefficient: 3
          },
          {
            id: '3',
            nom: 'Histoire',
            code: 'HIST',
            couleur: 'bg-purple-500',
            dureeStandard: 35,
            niveaux: ['CE1', 'CM1', 'CM2'],
            competencesBase: ['Chronologie', 'Empire', 'Révolution', 'Civilisations'],
            description: 'Découverte de l\'histoire à travers les grandes périodes et civilisations.',
            coefficient: 2
          },
          {
            id: '4',
            nom: 'Géographie',
            code: 'GEO',
            couleur: 'bg-orange-500',
            dureeStandard: 35,
            niveaux: ['CE1', 'CM1', 'CM2'],
            competencesBase: ['Cartographie', 'Continents', 'Climats', 'Territoires'],
            description: 'Compréhension du monde et des territoires à travers la géographie.',
            coefficient: 2
          },
          {
            id: '5',
            nom: 'Sciences',
            code: 'SCI',
            couleur: 'bg-red-500',
            dureeStandard: 40,
            niveaux: ['CE1', 'CM1', 'CM2'],
            competencesBase: ['Expérimentation', 'Observation', 'Méthode scientifique', 'Environnement'],
            description: 'Initiation aux sciences expérimentales et à la démarche scientifique.',
            coefficient: 2
          }
        ],
        niveaux: ['CP1', 'CE1', 'CM1', 'CM2', '6ème', '5ème', '4ème', '3ème']
      };
      
      setReferentiel(demoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setReferentiel({
        matieres: [],
        niveaux: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferentiel();
  }, []);

  return {
    referentiel,
    loading,
    error,
    refetch: fetchReferentiel
  };
};
