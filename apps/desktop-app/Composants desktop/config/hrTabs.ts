import { 
  Users, 
  FileSpreadsheet, 
  Presentation, 
  Award, 
  Calculator, 
  PieChart,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react';

export interface HRTabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  isExternal?: boolean;
  externalModule?: string;
  externalTab?: string;
  description?: string;
  permissions?: string[];
}

export const hrTabs: HRTabConfig[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: BarChart3,
    color: 'from-slate-500 to-slate-600',
    description: 'Tableau de bord et statistiques générales'
  },
  {
    id: 'personnel',
    label: 'Personnel',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    description: 'Gestion du personnel et des employés'
  },
  {
    id: 'contracts',
    label: 'Contrats',
    icon: FileSpreadsheet,
    color: 'from-green-500 to-green-600',
    description: 'Gestion des contrats et accords'
  },
  {
    id: 'paystates',
    label: 'États des paiements',
    icon: FileSpreadsheet,
    color: 'from-emerald-500 to-emerald-600',
    description: 'Tableaux des paiements pour permanents et vacataires'
  },
  {
    id: 'vacatairesState',
    label: 'État des vacataires',
    icon: FileSpreadsheet,
    color: 'from-teal-500 to-teal-600',
    description: 'État détaillé des paiements pour vacataires'
  },
  {
    id: 'training',
    label: 'Formation',
    icon: Presentation,
    color: 'from-purple-500 to-purple-600',
    description: 'Planification et suivi des formations'
  },
  {
    id: 'evaluations',
    label: 'Évaluations',
    icon: Award,
    color: 'from-orange-500 to-orange-600',
    description: 'Évaluations de performance et objectifs'
  },
  {
    id: 'leaves',
    label: 'Congés',
    icon: Calendar,
    color: 'from-indigo-500 to-indigo-600',
    description: 'Gestion des congés et soldes'
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: FileText,
    color: 'from-cyan-500 to-cyan-600',
    description: 'Génération et export de rapports RH'
  },
  {
    id: 'payroll',
    label: 'Paie',
    icon: Calculator,
    color: 'from-emerald-500 to-emerald-600',
    description: 'Gestion des salaires et de la paie',
    isExternal: true,
    externalModule: 'Finance',
    externalTab: 'payroll'
  },
  {
    id: 'analytics',
    label: 'Analytics RH',
    icon: PieChart,
    color: 'from-pink-500 to-pink-600',
    description: 'Statistiques et analyses RH'
  }
];

// Configuration spécifique pour l'onglet Paie
export const payrollTabConfig = {
  id: 'payroll',
  label: 'Gestion de la Paie',
  icon: Calculator,
  color: 'from-emerald-500 to-emerald-600',
  description: 'Gestion complète des salaires, primes et charges sociales',
  externalModule: 'Finance',
  externalTab: 'payroll',
  features: [
    'Calcul des salaires',
    'Gestion des primes',
    'Calcul des charges sociales',
    'Génération des bulletins de paie',
    'Déclarations fiscales',
    'Suivi des congés payés'
  ]
};

// Fonction pour obtenir la configuration d'un onglet
export const getTabConfig = (tabId: string): HRTabConfig | undefined => {
  return hrTabs.find(tab => tab.id === tabId);
};

// Fonction pour vérifier si un onglet est externe
export const isExternalTab = (tabId: string): boolean => {
  const tab = getTabConfig(tabId);
  return tab?.isExternal || false;
};

// Fonction pour obtenir les informations de navigation externe
export const getExternalNavigation = (tabId: string): { module: string; tab?: string } | null => {
  const tab = getTabConfig(tabId);
  if (tab?.isExternal && tab.externalModule) {
    return {
      module: tab.externalModule,
      tab: tab.externalTab
    };
  }
  return null;
};

export default hrTabs;
