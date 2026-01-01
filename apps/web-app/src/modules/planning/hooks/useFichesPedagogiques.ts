import { useState, useEffect } from 'react';

interface FichePedagogique {
  id: string;
  titre: string;
  matiere: string;
  classe: string;
  niveauScolaire: string;
  statut: string;
  date: string;
  enseignant: string;
  duree: string;
  saNumero?: string;
  sequenceNumero?: string;
}

interface FicheStats {
  totalFiches: number;
  enAttente: number;
  validees: number;
  brouillons: number;
  conformiteAPC: number;
  tauxValidation: number;
}

interface NiveauScolaire {
  id: string;
  nom: string;
  classes: string[];
}

interface Trimestre {
  id: string;
  nom: string;
  periode: string;
}

interface Commentaire {
  id: string;
  contenu: string;
  type: string;
  auteur: string;
  role: string;
  date: string;
}

interface HistoriqueVersion {
  id: string;
  numero: string;
  action: string;
  auteur: string;
  date: string;
  commentaire: string;
  changes: {
    additions: number;
    deletions: number;
    modifications: number;
  };
  sections: string[];
}

export const useFichesPedagogiques = () => {
  const [fiches, setFiches] = useState<FichePedagogique[]>([]);
  const [stats, setStats] = useState<FicheStats>({
    totalFiches: 0,
    enAttente: 0,
    validees: 0,
    brouillons: 0,
    conformiteAPC: 0,
    tauxValidation: 0
  });
  const [niveauxScolaires, setNiveauxScolaires] = useState<NiveauScolaire[]>([]);
  const [anneesScolaires, setAnneesScolaires] = useState<string[]>([]);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [matieres, setMatieres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // TODO: Remplacer par appels API réels
        // Données de démonstration dynamiques
        const demoFiches: FichePedagogique[] = [
          {
            id: '1',
            titre: "Les fractions - Addition et soustraction",
            matiere: "Mathématiques",
            classe: "6ème",
            niveauScolaire: "secondaire",
            statut: "validee",
            date: "2025-01-15",
            enseignant: "M. KOUASSI",
            duree: "55",
            saNumero: "SA 3",
            sequenceNumero: "Séquence 2"
          },
          {
            id: '2',
            titre: "La conjugaison - Présent de l'indicatif",
            matiere: "Français",
            classe: "5ème",
            niveauScolaire: "secondaire",
            statut: "en_attente",
            date: "2025-01-14",
            enseignant: "Mme ADJOVI",
            duree: "45"
          },
          {
            id: '3',
            titre: "Les états de la matière",
            matiere: "Sciences Physiques",
            classe: "4ème",
            niveauScolaire: "secondaire",
            statut: "brouillon",
            date: "2025-01-13",
            enseignant: "M. DOSSOU",
            duree: "60"
          }
        ];

        const demoNiveaux: NiveauScolaire[] = [
          {
            id: 'maternelle',
            nom: 'Maternelle',
            classes: ['Petite Section', 'Moyenne Section', 'Grande Section']
          },
          {
            id: 'primaire',
            nom: 'Primaire',
            classes: ['CP', 'CE1', 'CE2', 'CM1', 'CM2']
          },
          {
            id: 'secondaire',
            nom: 'Secondaire',
            classes: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle']
          }
        ];

        const demoStats: FicheStats = {
          totalFiches: demoFiches.length,
          enAttente: demoFiches.filter(f => f.statut === 'en_attente').length,
          validees: demoFiches.filter(f => f.statut === 'validee').length,
          brouillons: demoFiches.filter(f => f.statut === 'brouillon').length,
          conformiteAPC: 85,
          tauxValidation: 92
        };

        const demoAnnees = ['2024-2025', '2023-2024', '2022-2023', '2021-2022'];
        
        const demoTrimestres: Trimestre[] = [
          { id: '1', nom: '1er Trimestre', periode: 'Sept - Déc' },
          { id: '2', nom: '2ème Trimestre', periode: 'Jan - Mars' },
          { id: '3', nom: '3ème Trimestre', periode: 'Avril - Juin' }
        ];

        const demoMatieres = [
          'Mathématiques', 'Français', 'Sciences Physiques', 'SVT', 
          'Histoire-Géographie', 'Anglais', 'EPS', 'Arts Plastiques'
        ];

        setFiches(demoFiches);
        setStats(demoStats);
        setNiveauxScolaires(demoNiveaux);
        setAnneesScolaires(demoAnnees);
        setTrimestres(demoTrimestres);
        setMatieres(demoMatieres);
        setLoading(false);
      } catch (error) {
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshData = async () => {
    // TODO: Implémenter le rafraîchissement des données depuis l'API
    console.log('Rafraîchissement des données...');
  };

  return {
    fiches,
    stats,
    niveauxScolaires,
    anneesScolaires,
    trimestres,
    matieres,
    loading,
    error,
    refreshData
  };
};

// Hook pour les commentaires
export const useCommentairesFiche = (ficheId: string) => {
  const [commentaires, setCommentaires] = useState<Commentaire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommentaires = async () => {
      try {
        // TODO: Remplacer par appel API réel
        const demoCommentaires: Commentaire[] = [
          {
            id: '1',
            contenu: "Bonne structure générale. Pensez à diversifier les activités.",
            type: "suggestion",
            auteur: "Directeur ASSOGBA",
            role: "Directeur",
            date: "2025-01-18T14:30:00Z"
          }
        ];
        setCommentaires(demoCommentaires);
      } catch (error) {
        console.error('Erreur chargement commentaires:', error);
      } finally {
        setLoading(false);
      }
    };

    if (ficheId) {
      fetchCommentaires();
    }
  }, [ficheId]);

  return { commentaires, loading };
};

// Hook pour l'historique
export const useHistoriqueFiche = (ficheId: string) => {
  const [historique, setHistorique] = useState<HistoriqueVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorique = async () => {
      try {
        // TODO: Remplacer par appel API réel
        const demoHistorique: HistoriqueVersion[] = [
          {
            id: '1',
            numero: "1.3",
            action: "modification",
            auteur: "M. KOUASSI",
            date: "2025-01-18T14:30:00Z",
            commentaire: "Ajout d'activités différenciées",
            changes: { additions: 5, deletions: 2, modifications: 3 },
            sections: ["Déroulement", "Stratégies"]
          },
          {
            id: '2',
            numero: "1.2",
            action: "validation",
            auteur: "Directeur ASSOGBA",
            date: "2025-01-17T10:15:00Z",
            commentaire: "Validation avec suggestions",
            changes: { additions: 0, deletions: 0, modifications: 1 }
          }
        ];
        setHistorique(demoHistorique);
      } catch (error) {
        console.error('Erreur chargement historique:', error);
      } finally {
        setLoading(false);
      }
    };

    if (ficheId) {
      fetchHistorique();
    }
  }, [ficheId]);

  return { historique, loading };
};
