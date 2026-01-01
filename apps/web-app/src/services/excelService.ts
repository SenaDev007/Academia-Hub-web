import * as XLSX from 'xlsx';

export interface RevenueExcelData {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  studentName?: string;
  className?: string;
  reference?: string;
  paymentMethod?: string;
  status?: string;
}

export interface RevenueStats {
  total: number;
  tuitionRevenue: number;
  otherRevenue: number;
  monthly: number;
  tuitionPercentage: number;
  otherPercentage: number;
  typeAnalysis: Array<{
    label: string;
    count: number;
    total: number;
    type: string;
  }>;
  revenueCount: number;
}

export interface ExpenseExcelData {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  vendor?: string;
  paymentMethod: string;
  receiptNumber?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface AssignmentExcelData {
  id: string;
  teacherId: string;
  teacherName: string;
  mode: 'maternelle' | 'primaire' | 'secondaire';
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  subjectIds?: string[];
  subjectNames?: string[];
  subjectsCount?: number;
  classIds?: string[];
  classNames?: string[];
  hoursPerWeek: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'pending' | 'expired';
}

export interface AssignmentStats {
  totalHours: number;
  activeAssignments: number;
  pendingAssignments: number;
  expiredAssignments: number;
  assignmentCount: number;
  modeAnalysis: Array<{
    mode: string;
    count: number;
    totalHours: number;
    teachers: number;
  }>;
}

export interface WorkloadExcelData {
  id: string;
  teacherName: string;
  hoursPerWeek: number;
  maxHours: number;
  efficiency: number;
  status: string;
  classes: string;
  subjects: string;
  recommendations: string;
}

export interface WorkloadStats {
  totalHours: number;
  avgHours: number;
  underloaded: number;
  optimal: number;
  overloaded: number;
  utilizationRate: number;
  efficiency: number;
}

export interface ExpenseStats {
  total: number;
  approvedTotal: number;
  pendingTotal: number;
  monthly: number;
  approvedPercentage: number;
  pendingPercentage: number;
  categoryAnalysis: Array<{
    label: string;
    count: number;
    total: number;
    category: string;
  }>;
  expenseCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export class ExcelService {
  /**
   * Génère un fichier Excel professionnel pour les recettes
   */
  static generateRevenueExcel(
    revenues: RevenueExcelData[],
    revenueStats: RevenueStats,
    academicYear: string,
    schoolSettings?: {
      schoolName?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      motto?: string;
    }
  ): void {
    // Créer un nouveau workbook
    const workbook = XLSX.utils.book_new();

    // 1. Feuille principale avec en-tête et données
    const mainSheetData = [
      // En-tête de l'école (lignes 1-8)
      [schoolSettings?.schoolName || 'ACADEMIA HUB', '', '', '', '', '', '', '', '', ''],
      [schoolSettings?.address || '', '', '', '', '', '', '', '', '', ''],
      [`Tél: ${schoolSettings?.phone || ''}`, '', `Email: ${schoolSettings?.email || ''}`, '', `Site: ${schoolSettings?.website || ''}`, '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      
      // Titre du document (ligne 9)
      ['LISTE DES RECETTES', '', '', '', '', '', '', '', '', ''],
      [`Année Scolaire: ${academicYear}`, '', `Généré le: ${new Date().toLocaleDateString('fr-FR')}`, '', `Heure: ${new Date().toLocaleTimeString('fr-FR')}`, '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      
      // Récapitulatif (lignes 11-18)
      ['RÉCAPITULATIF GÉNÉRAL', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['Total des Recettes', `${revenueStats.total.toLocaleString()} F CFA`, '', 'Scolarité Encaissée', `${revenueStats.tuitionRevenue.toLocaleString()} F CFA`, '', 'Part Scolarité', `${revenueStats.tuitionPercentage.toFixed(1)}%`, '', ''],
      ['Autres Recettes', `${revenueStats.otherRevenue.toLocaleString()} F CFA`, '', 'Ce Mois', `${revenueStats.monthly.toLocaleString()} F CFA`, '', 'Part Autres', `${revenueStats.otherPercentage.toFixed(1)}%`, '', ''],
      ['Total Transactions', revenueStats.revenueCount, '', 'Types de Recettes', revenueStats.typeAnalysis.length, '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      
      // En-tête du tableau (ligne 19)
      ['N°', 'Date', 'Type de Recette', 'Description', 'Élève', 'Classe', 'Référence', 'Montant (F CFA)', 'Méthode', 'Statut'],
      
      // Données des recettes (lignes 20+)
      ...revenues.map((revenue, index) => [
        index + 1,
        revenue.date ? new Date(revenue.date).toLocaleDateString('fr-FR') : 'N/A',
        this.getTypeLabel(revenue.type),
        this.getRevenueDescription(revenue),
        revenue.studentName || 'N/A',
        revenue.className || 'N/A',
        revenue.reference || 'N/A',
        revenue.amount,
        revenue.paymentMethod || 'Espèces',
        revenue.status || 'Complété'
      ])
    ];

    const mainSheet = XLSX.utils.aoa_to_sheet(mainSheetData);
    
    // Définir la largeur des colonnes
    mainSheet['!cols'] = [
      { wch: 5 },   // N°
      { wch: 12 },  // Date
      { wch: 20 },  // Type
      { wch: 30 },  // Description
      { wch: 25 },  // Élève
      { wch: 15 },  // Classe
      { wch: 15 },  // Référence
      { wch: 15 },  // Montant
      { wch: 18 },  // Méthode
      { wch: 12 }   // Statut
    ];

    // Définir les plages pour le formatage
    // const range = XLSX.utils.decode_range(mainSheet['!ref'] || 'A1:J1');
    
    // Formatage des cellules
    if (!mainSheet['!merges']) mainSheet['!merges'] = [];
    
    // Fusionner les cellules pour l'en-tête de l'école
    mainSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }); // Nom de l'école
    mainSheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }); // Adresse
    mainSheet['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }); // Contacts
    mainSheet['!merges'].push({ s: { r: 8, c: 0 }, e: { r: 8, c: 9 } }); // Titre
    mainSheet['!merges'].push({ s: { r: 9, c: 0 }, e: { r: 9, c: 9 } }); // Sous-titre
    mainSheet['!merges'].push({ s: { r: 11, c: 0 }, e: { r: 11, c: 9 } }); // Récapitulatif

    // Ajouter les bordures pour le tableau des recettes
    const tableStartRow = 19; // Ligne de l'en-tête du tableau
    const tableEndRow = tableStartRow + revenues.length; // Dernière ligne de données
    
    // Bordures pour l'en-tête du tableau
    for (let col = 0; col < 10; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: tableStartRow, c: col });
      if (!mainSheet[cellRef]) mainSheet[cellRef] = { v: '', t: 's' };
      if (!mainSheet[cellRef].s) mainSheet[cellRef].s = {};
      mainSheet[cellRef].s.border = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };
    }
    
    // Bordures pour les lignes de données
    for (let row = tableStartRow + 1; row <= tableEndRow; row++) {
      for (let col = 0; col < 10; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (!mainSheet[cellRef]) mainSheet[cellRef] = { v: '', t: 's' };
        if (!mainSheet[cellRef].s) mainSheet[cellRef].s = {};
        mainSheet[cellRef].s.border = {
          top: { style: 'thin', color: { rgb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
          left: { style: 'thin', color: { rgb: 'CCCCCC' } },
          right: { style: 'thin', color: { rgb: 'CCCCCC' } }
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, mainSheet, 'Recettes');

    // 2. Feuille de statistiques détaillées
    const statsData = [
      ['STATISTIQUES DÉTAILLÉES DES RECETTES', ''],
      ['', ''],
      ['INFORMATIONS GÉNÉRALES', ''],
      ['Année Scolaire', academicYear],
      ['Date de Génération', new Date().toLocaleDateString('fr-FR')],
      ['Heure de Génération', new Date().toLocaleTimeString('fr-FR')],
      ['', ''],
      ['MÉTRIQUES FINANCIÈRES', ''],
      ['Total des Recettes', `${revenueStats.total.toLocaleString()} F CFA`],
      ['Scolarité Encaissée', `${revenueStats.tuitionRevenue.toLocaleString()} F CFA`],
      ['Autres Recettes', `${revenueStats.otherRevenue.toLocaleString()} F CFA`],
      ['Recettes du Mois', `${revenueStats.monthly.toLocaleString()} F CFA`],
      ['', ''],
      ['ANALYSE DES POURCENTAGES', ''],
      ['Part Scolarité', `${revenueStats.tuitionPercentage.toFixed(1)}%`],
      ['Part Autres', `${revenueStats.otherPercentage.toFixed(1)}%`],
      ['', ''],
      ['NOMBRE DE TRANSACTIONS', ''],
      ['Total des Transactions', revenueStats.revenueCount],
      ['Types de Recettes Différents', revenueStats.typeAnalysis.length],
      ['', ''],
      ['PERFORMANCE', ''],
      ['Moyenne par Transaction', `${(revenueStats.total / revenueStats.revenueCount).toFixed(0)} F CFA`],
      ['Recettes par Type', revenueStats.typeAnalysis.length]
    ];

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    statsSheet['!cols'] = [
      { wch: 30 },
      { wch: 25 }
    ];

    // Fusionner les cellules pour les titres
    if (!statsSheet['!merges']) statsSheet['!merges'] = [];
    statsSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }); // Titre principal
    statsSheet['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }); // Informations générales
    statsSheet['!merges'].push({ s: { r: 7, c: 0 }, e: { r: 7, c: 1 } }); // Métriques financières
    statsSheet['!merges'].push({ s: { r: 13, c: 0 }, e: { r: 13, c: 1 } }); // Analyse des pourcentages
    statsSheet['!merges'].push({ s: { r: 16, c: 0 }, e: { r: 16, c: 1 } }); // Nombre de transactions
    statsSheet['!merges'].push({ s: { r: 20, c: 0 }, e: { r: 20, c: 1 } }); // Performance

    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');

    // 3. Feuille d'analyse par type avec design
    const typeAnalysisData = [
      ['ANALYSE PAR TYPE DE RECETTE', '', '', ''],
      ['', '', '', ''],
      ['Type de Recette', 'Nombre de Transactions', 'Montant Total (F CFA)', 'Pourcentage (%)'],
      ...revenueStats.typeAnalysis.map(item => {
        const percentage = revenueStats.total > 0 ? (item.total / revenueStats.total) * 100 : 0;
        return [
          item.label,
          item.count,
          item.total.toLocaleString(),
          `${percentage.toFixed(1)}%`
        ];
      }),
      ['', '', '', ''],
      ['TOTAL GÉNÉRAL', revenueStats.revenueCount, revenueStats.total.toLocaleString(), '100.0%']
    ];

    const typeAnalysisSheet = XLSX.utils.aoa_to_sheet(typeAnalysisData);
    typeAnalysisSheet['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 }
    ];

    // Fusionner les cellules pour le titre
    if (!typeAnalysisSheet['!merges']) typeAnalysisSheet['!merges'] = [];
    typeAnalysisSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }); // Titre principal

    // Ajouter les bordures pour le tableau d'analyse par type
    const typeTableStartRow = 2; // Ligne de l'en-tête du tableau
    const typeTableEndRow = typeTableStartRow + revenueStats.typeAnalysis.length + 1; // +1 pour la ligne de total
    
    // Bordures pour l'en-tête du tableau
    for (let col = 0; col < 4; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: typeTableStartRow, c: col });
      if (!typeAnalysisSheet[cellRef]) typeAnalysisSheet[cellRef] = { v: '', t: 's' };
      if (!typeAnalysisSheet[cellRef].s) typeAnalysisSheet[cellRef].s = {};
      typeAnalysisSheet[cellRef].s.border = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };
    }
    
    // Bordures pour les lignes de données
    for (let row = typeTableStartRow + 1; row <= typeTableEndRow; row++) {
      for (let col = 0; col < 4; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (!typeAnalysisSheet[cellRef]) typeAnalysisSheet[cellRef] = { v: '', t: 's' };
        if (!typeAnalysisSheet[cellRef].s) typeAnalysisSheet[cellRef].s = {};
        typeAnalysisSheet[cellRef].s.border = {
          top: { style: 'thin', color: { rgb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
          left: { style: 'thin', color: { rgb: 'CCCCCC' } },
          right: { style: 'thin', color: { rgb: 'CCCCCC' } }
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, typeAnalysisSheet, 'Analyse par Type');

    // 4. Feuille d'informations de l'école avec design professionnel
    const schoolData = [
      ['INFORMATIONS DE L\'ÉTABLISSEMENT', ''],
      ['', ''],
      ['IDENTITÉ DE L\'ÉCOLE', ''],
      ['Nom de l\'École', schoolSettings?.schoolName || 'N/A'],
      ['Adresse', schoolSettings?.address || 'N/A'],
      ['Téléphone', schoolSettings?.phone || 'N/A'],
      ['Adresse Email', schoolSettings?.email || 'N/A'],
      ['Site Web', schoolSettings?.website || 'N/A'],
      ['Devise/Motto', schoolSettings?.motto || 'N/A'],
      ['', ''],
      ['INFORMATIONS DU RAPPORT', ''],
      ['Généré par', 'Academia Hub Desktop'],
      ['Version', '1.0.0'],
      ['Date de Génération', new Date().toLocaleDateString('fr-FR')],
      ['Heure de Génération', new Date().toLocaleTimeString('fr-FR')],
      ['Année Scolaire', academicYear],
      ['', ''],
      ['MÉTADONNÉES', ''],
      ['Nombre Total de Recettes', revenueStats.revenueCount],
      ['Montant Total', `${revenueStats.total.toLocaleString()} F CFA`],
      ['Types de Recettes', revenueStats.typeAnalysis.length],
      ['', ''],
      ['© 2024 Academia Hub - Tous droits réservés', '']
    ];

    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    schoolSheet['!cols'] = [
      { wch: 25 },
      { wch: 35 }
    ];

    // Fusionner les cellules pour les titres
    if (!schoolSheet['!merges']) schoolSheet['!merges'] = [];
    schoolSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }); // Titre principal
    schoolSheet['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }); // Identité de l'école
    schoolSheet['!merges'].push({ s: { r: 10, c: 0 }, e: { r: 10, c: 1 } }); // Informations du rapport
    schoolSheet['!merges'].push({ s: { r: 17, c: 0 }, e: { r: 17, c: 1 } }); // Métadonnées
    schoolSheet['!merges'].push({ s: { r: 22, c: 0 }, e: { r: 22, c: 1 } }); // Copyright

    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Informations École');

    // Télécharger le fichier
    const fileName = `recettes-${academicYear}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Génère un fichier Excel pour le résumé exécutif
   */
  static generateRevenueSummaryExcel(
    revenues: RevenueExcelData[],
    revenueStats: RevenueStats,
    academicYear: string,
    schoolSettings?: {
      schoolName?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      motto?: string;
    }
  ): void {
    const workbook = XLSX.utils.book_new();

    // Feuille de résumé exécutif avec design professionnel
    const summaryData = [
      // En-tête de l'école (lignes 1-8)
      [schoolSettings?.schoolName || 'ACADEMIA HUB', '', '', ''],
      [schoolSettings?.address || '', '', '', ''],
      [`Tél: ${schoolSettings?.phone || ''}`, '', `Email: ${schoolSettings?.email || ''}`, ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      
      // Titre du document (ligne 9)
      ['RÉSUMÉ EXÉCUTIF DES RECETTES', '', '', ''],
      [`Année Scolaire: ${academicYear}`, '', `Généré le: ${new Date().toLocaleDateString('fr-FR')}`, ''],
      ['', '', '', ''],
      
      // Métriques principales (lignes 11-18)
      ['MÉTRIQUES PRINCIPALES', '', '', ''],
      ['', '', '', ''],
      ['Total des Recettes', `${revenueStats.total.toLocaleString()} F CFA`, 'Scolarité Encaissée', `${revenueStats.tuitionRevenue.toLocaleString()} F CFA`],
      ['Autres Recettes', `${revenueStats.otherRevenue.toLocaleString()} F CFA`, 'Recettes du Mois', `${revenueStats.monthly.toLocaleString()} F CFA`],
      ['Total Transactions', revenueStats.revenueCount, 'Types de Recettes', revenueStats.typeAnalysis.length],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      
      // Répartition (lignes 19-22)
      ['RÉPARTITION', '', '', ''],
      ['Part Scolarité', `${revenueStats.tuitionPercentage.toFixed(1)}%`, 'Part Autres', `${revenueStats.otherPercentage.toFixed(1)}%`],
      ['', '', '', ''],
      ['', '', '', ''],
      
      // Détail par type (lignes 23+)
      ['DÉTAIL PAR TYPE DE RECETTE', '', '', ''],
      ['', '', '', ''],
      ['Type de Recette', 'Montant (F CFA)', 'Pourcentage (%)', 'Transactions'],
      ...revenueStats.typeAnalysis.map(item => {
        const percentage = revenueStats.total > 0 ? (item.total / revenueStats.total) * 100 : 0;
        return [
          item.label,
          item.total.toLocaleString(),
          `${percentage.toFixed(1)}%`,
          item.count
        ];
      }),
      ['', '', '', ''],
      ['TOTAL GÉNÉRAL', revenueStats.total.toLocaleString(), '100.0%', revenueStats.revenueCount]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 30 },
      { wch: 25 },
      { wch: 20 },
      { wch: 15 }
    ];

    // Fusionner les cellules pour le design professionnel
    if (!summarySheet['!merges']) summarySheet['!merges'] = [];
    summarySheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }); // Nom de l'école
    summarySheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } }); // Adresse
    summarySheet['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }); // Contacts
    summarySheet['!merges'].push({ s: { r: 8, c: 0 }, e: { r: 8, c: 3 } }); // Titre principal
    summarySheet['!merges'].push({ s: { r: 9, c: 0 }, e: { r: 9, c: 3 } }); // Sous-titre
    summarySheet['!merges'].push({ s: { r: 11, c: 0 }, e: { r: 11, c: 3 } }); // Métriques principales
    summarySheet['!merges'].push({ s: { r: 19, c: 0 }, e: { r: 19, c: 3 } }); // Répartition
    summarySheet['!merges'].push({ s: { r: 23, c: 0 }, e: { r: 23, c: 3 } }); // Détail par type

    // Ajouter les bordures pour le tableau du résumé exécutif
    const summaryTableStartRow = 25; // Ligne de l'en-tête du tableau (après "DÉTAIL PAR TYPE DE RECETTE")
    const summaryTableEndRow = summaryTableStartRow + revenueStats.typeAnalysis.length + 1; // +1 pour la ligne de total
    
    // Bordures pour l'en-tête du tableau
    for (let col = 0; col < 4; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: summaryTableStartRow, c: col });
      if (!summarySheet[cellRef]) summarySheet[cellRef] = { v: '', t: 's' };
      if (!summarySheet[cellRef].s) summarySheet[cellRef].s = {};
      summarySheet[cellRef].s.border = {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      };
    }
    
    // Bordures pour les lignes de données
    for (let row = summaryTableStartRow + 1; row <= summaryTableEndRow; row++) {
      for (let col = 0; col < 4; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
        if (!summarySheet[cellRef]) summarySheet[cellRef] = { v: '', t: 's' };
        if (!summarySheet[cellRef].s) summarySheet[cellRef].s = {};
        summarySheet[cellRef].s.border = {
          top: { style: 'thin', color: { rgb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
          left: { style: 'thin', color: { rgb: 'CCCCCC' } },
          right: { style: 'thin', color: { rgb: 'CCCCCC' } }
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé Exécutif');

    // Feuille d'informations de l'école
    const schoolData = [
      ['INFORMATIONS DE L\'ÉTABLISSEMENT', ''],
      ['', ''],
      ['IDENTITÉ DE L\'ÉCOLE', ''],
      ['Nom de l\'École', schoolSettings?.schoolName || 'N/A'],
      ['Adresse', schoolSettings?.address || 'N/A'],
      ['Téléphone', schoolSettings?.phone || 'N/A'],
      ['Adresse Email', schoolSettings?.email || 'N/A'],
      ['Site Web', schoolSettings?.website || 'N/A'],
      ['Devise/Motto', schoolSettings?.motto || 'N/A'],
      ['', ''],
      ['INFORMATIONS DU RAPPORT', ''],
      ['Généré par', 'Academia Hub Desktop'],
      ['Version', '1.0.0'],
      ['Date de Génération', new Date().toLocaleDateString('fr-FR')],
      ['Heure de Génération', new Date().toLocaleTimeString('fr-FR')],
      ['Année Scolaire', academicYear],
      ['', ''],
      ['MÉTADONNÉES', ''],
      ['Nombre Total de Recettes', revenueStats.revenueCount],
      ['Montant Total', `${revenueStats.total.toLocaleString()} F CFA`],
      ['Types de Recettes', revenueStats.typeAnalysis.length],
      ['', ''],
      ['© 2024 Academia Hub - Tous droits réservés', '']
    ];

    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    schoolSheet['!cols'] = [
      { wch: 25 },
      { wch: 35 }
    ];

    // Fusionner les cellules pour les titres
    if (!schoolSheet['!merges']) schoolSheet['!merges'] = [];
    schoolSheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }); // Titre principal
    schoolSheet['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }); // Identité de l'école
    schoolSheet['!merges'].push({ s: { r: 10, c: 0 }, e: { r: 10, c: 1 } }); // Informations du rapport
    schoolSheet['!merges'].push({ s: { r: 17, c: 0 }, e: { r: 17, c: 1 } }); // Métadonnées
    schoolSheet['!merges'].push({ s: { r: 22, c: 0 }, e: { r: 22, c: 1 } }); // Copyright

    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Informations École');

    // Télécharger le fichier
    const fileName = `resume-recettes-${academicYear}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Convertit le type de recette en libellé lisible
   */
  private static getTypeLabel(type: string): string {
    switch (type) {
      case 'uniforme': return 'Uniforme';
      case 'fournitures': return 'Fournitures';
      case 'cantine': return 'Cantine';
      case 'don': return 'Don';
      case 'subvention': return 'Subvention';
      case 'scolarite': return 'Scolarité';
      case 'inscription': return 'Inscription';
      case 'reinscription': return 'Réinscription';
      case 'inscription_fee': return 'Inscription & Scolarité';
      case 'reinscription_fee': return 'Inscription & Scolarité';
      case 'tuition_fee': return 'Inscription & Scolarité';
      default: return 'Autre';
    }
  }

  /**
   * Génère une description appropriée pour la recette
   */
  private static getRevenueDescription(revenue: RevenueExcelData): string {
    // Pour les recettes synchronisées (frais de scolarité)
    if (revenue.type === 'inscription_fee' || revenue.type === 'reinscription_fee' || revenue.type === 'tuition_fee') {
      return 'Paiement frais scolaires';
    }
    
    // Pour les recettes manuelles, utiliser la description stockée
    return revenue.description || 'N/A';
  }

  /**
   * Génère un fichier Excel professionnel pour les dépenses
   */
  static generateExpenseExcel(
    expenses: ExpenseExcelData[],
    expenseStats: ExpenseStats,
    academicYear: string,
    schoolSettings?: {
      schoolName?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      motto?: string;
    }
  ): void {
    // Créer un nouveau workbook
    const workbook = XLSX.utils.book_new();

    // Préparer les données pour le tableau principal
    const expenseData = [
      ['Date', 'Titre', 'Catégorie', 'Sous-catégorie', 'Fournisseur', 'Montant (F CFA)', 'Statut', 'Méthode de Paiement', 'N° Reçu', 'Description'],
      ...expenses.map(expense => [
        expense.date ? new Date(expense.date).toLocaleDateString('fr-FR') : 'N/A',
        expense.title,
        expense.category,
        expense.subcategory || 'N/A',
        expense.vendor || 'N/A',
        expense.amount,
        this.getExpenseStatusLabel(expense.status),
        expense.paymentMethod || 'Espèces',
        expense.receiptNumber || 'N/A',
        expense.description
      ])
    ];

    // Créer la feuille principale
    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData);
    expenseSheet['!cols'] = [
      { wch: 12 }, // Date
      { wch: 25 }, // Titre
      { wch: 20 }, // Catégorie
      { wch: 20 }, // Sous-catégorie
      { wch: 20 }, // Fournisseur
      { wch: 15 }, // Montant
      { wch: 12 }, // Statut
      { wch: 18 }, // Méthode
      { wch: 12 }, // N° Reçu
      { wch: 30 }  // Description
    ];

    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Dépenses');

    // Feuille de statistiques
    const statsData = [
      ['STATISTIQUES DES DÉPENSES', ''],
      ['', ''],
      ['MÉTRIQUES PRINCIPALES', ''],
      ['Total des Dépenses', `${expenseStats.total.toLocaleString()} F CFA`],
      ['Dépenses Approuvées', `${expenseStats.approvedTotal.toLocaleString()} F CFA`],
      ['Dépenses en Attente', `${expenseStats.pendingTotal.toLocaleString()} F CFA`],
      ['Dépenses du Mois', `${expenseStats.monthly.toLocaleString()} F CFA`],
      ['', ''],
      ['RÉPARTITION PAR STATUT', ''],
      ['Approuvées', `${expenseStats.approvedCount} (${expenseStats.approvedPercentage.toFixed(1)}%)`],
      ['En Attente', `${expenseStats.pendingCount} (${expenseStats.pendingPercentage.toFixed(1)}%)`],
      ['Rejetées', `${expenseStats.rejectedCount}`],
      ['Total', `${expenseStats.expenseCount}`],
      ['', ''],
      ['ANALYSE PAR CATÉGORIE', ''],
      ['Catégorie', 'Nombre', 'Montant Total', 'Pourcentage'],
      ...expenseStats.categoryAnalysis.map(item => [
        item.label,
        item.count,
        `${item.total.toLocaleString()} F CFA`,
        `${((item.total / expenseStats.total) * 100).toFixed(1)}%`
      ])
    ];

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    statsSheet['!cols'] = [
      { wch: 25 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');

    // Feuille d'informations de l'école
    const schoolData = [
      ['RAPPORT DES DÉPENSES', ''],
      ['', ''],
      ['IDENTITÉ DE L\'ÉCOLE', ''],
      ['Nom', schoolSettings?.schoolName || 'Non spécifié'],
      ['Adresse', schoolSettings?.address || 'Non spécifié'],
      ['Téléphone', schoolSettings?.phone || 'Non spécifié'],
      ['Email', schoolSettings?.email || 'Non spécifié'],
      ['Site Web', schoolSettings?.website || 'Non spécifié'],
      ['Devise', schoolSettings?.motto || 'Non spécifié'],
      ['', ''],
      ['INFORMATIONS DU RAPPORT', ''],
      ['Généré par', 'Academia Hub Desktop'],
      ['Version', '1.0.0'],
      ['Date de Génération', new Date().toLocaleDateString('fr-FR')],
      ['Heure de Génération', new Date().toLocaleTimeString('fr-FR')],
      ['Année Scolaire', academicYear],
      ['', ''],
      ['MÉTADONNÉES', ''],
      ['Nombre Total de Dépenses', expenseStats.expenseCount],
      ['Montant Total', `${expenseStats.total.toLocaleString()} F CFA`],
      ['Catégories', expenseStats.categoryAnalysis.length],
      ['', ''],
      ['© 2024 Academia Hub - Tous droits réservés', '']
    ];

    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    schoolSheet['!cols'] = [
      { wch: 25 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Informations École');

    // Télécharger le fichier
    const fileName = `liste-depenses-${academicYear}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Génère un fichier Excel de résumé pour les dépenses
   */
  static generateExpenseSummaryExcel(
    expenses: ExpenseExcelData[],
    expenseStats: ExpenseStats,
    academicYear: string,
    schoolSettings?: {
      schoolName?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      motto?: string;
    }
  ): void {
    // Créer un nouveau workbook
    const workbook = XLSX.utils.book_new();

    // Filtrer seulement les dépenses approuvées pour le résumé
    const approvedExpenses = expenses.filter(expense => expense.status === 'approved');

    // Grouper par catégorie
    const expensesByCategory = approvedExpenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(expense);
      return acc;
    }, {} as { [key: string]: ExpenseExcelData[] });

    // Créer les feuilles pour chaque catégorie
    Object.entries(expensesByCategory).forEach(([category, categoryExpenses]) => {
      const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      
      const categoryData = [
        [`DÉPENSES - ${category.toUpperCase()}`, ''],
        [`Total de la catégorie: ${categoryTotal.toLocaleString()} F CFA`, ''],
        ['', ''],
        ['Titre', 'Montant (F CFA)', 'Fournisseur', 'Date', 'Méthode de Paiement', 'Description'],
        ...categoryExpenses.map(expense => [
          expense.title,
          expense.amount,
          expense.vendor || 'N/A',
          expense.date ? new Date(expense.date).toLocaleDateString('fr-FR') : 'N/A',
          expense.paymentMethod || 'Espèces',
          expense.description
        ])
      ];

      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      categorySheet['!cols'] = [
        { wch: 30 }, // Titre
        { wch: 15 }, // Montant
        { wch: 20 }, // Fournisseur
        { wch: 12 }, // Date
        { wch: 18 }, // Méthode
        { wch: 30 }  // Description
      ];

      // Nettoyer le nom de la catégorie pour le nom de feuille
      const sheetName = category.replace(/[^a-zA-Z0-9]/g, '').substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, categorySheet, sheetName);
    });

    // Feuille de résumé exécutif
    const summaryData = [
      ['RÉSUMÉ EXÉCUTIF DES DÉPENSES', ''],
      ['', ''],
      ['MÉTRIQUES PRINCIPALES', ''],
      ['Total des Dépenses', `${expenseStats.total.toLocaleString()} F CFA`],
      ['Dépenses Approuvées', `${expenseStats.approvedTotal.toLocaleString()} F CFA`],
      ['Dépenses en Attente', `${expenseStats.pendingTotal.toLocaleString()} F CFA`],
      ['Dépenses du Mois', `${expenseStats.monthly.toLocaleString()} F CFA`],
      ['', ''],
      ['RÉPARTITION PAR STATUT', ''],
      ['Approuvées', `${expenseStats.approvedCount} (${expenseStats.approvedPercentage.toFixed(1)}%)`],
      ['En Attente', `${expenseStats.pendingCount} (${expenseStats.pendingPercentage.toFixed(1)}%)`],
      ['Rejetées', `${expenseStats.rejectedCount}`],
      ['Total', `${expenseStats.expenseCount}`],
      ['', ''],
      ['ANALYSE PAR CATÉGORIE', ''],
      ['Catégorie', 'Nombre', 'Montant Total', 'Pourcentage'],
      ...expenseStats.categoryAnalysis.map(item => [
        item.label,
        item.count,
        `${item.total.toLocaleString()} F CFA`,
        `${((item.total / expenseStats.total) * 100).toFixed(1)}%`
      ])
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé Exécutif');

    // Feuille d'informations de l'école
    const schoolData = [
      ['RÉSUMÉ DES DÉPENSES', ''],
      ['', ''],
      ['IDENTITÉ DE L\'ÉCOLE', ''],
      ['Nom', schoolSettings?.schoolName || 'Non spécifié'],
      ['Adresse', schoolSettings?.address || 'Non spécifié'],
      ['Téléphone', schoolSettings?.phone || 'Non spécifié'],
      ['Email', schoolSettings?.email || 'Non spécifié'],
      ['Site Web', schoolSettings?.website || 'Non spécifié'],
      ['Devise', schoolSettings?.motto || 'Non spécifié'],
      ['', ''],
      ['INFORMATIONS DU RAPPORT', ''],
      ['Généré par', 'Academia Hub Desktop'],
      ['Version', '1.0.0'],
      ['Date de Génération', new Date().toLocaleDateString('fr-FR')],
      ['Heure de Génération', new Date().toLocaleTimeString('fr-FR')],
      ['Année Scolaire', academicYear],
      ['', ''],
      ['MÉTADONNÉES', ''],
      ['Nombre Total de Dépenses', expenseStats.expenseCount],
      ['Montant Total', `${expenseStats.total.toLocaleString()} F CFA`],
      ['Catégories', expenseStats.categoryAnalysis.length],
      ['', ''],
      ['© 2024 Academia Hub - Tous droits réservés', '']
    ];

    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    schoolSheet['!cols'] = [
      { wch: 25 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Informations École');

    // Télécharger le fichier
    const fileName = `resume-depenses-${academicYear}-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * Convertit le statut de dépense en libellé lisible
   */
  private static getExpenseStatusLabel(status: string): string {
    switch (status) {
      case 'approved': return 'Approuvée';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejetée';
      case 'paid': return 'Payée';
      default: return status;
    }
  }

  // Méthodes pour les affectations
  static generateAssignmentExcel(
    assignments: AssignmentExcelData[],
    assignmentStats: AssignmentStats,
    academicYear: string,
    schoolSettings?: {
      schoolName?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      motto?: string;
      logo?: string;
    }
  ): void {
    const workbook = XLSX.utils.book_new();

    // Feuille principale - Liste des affectations
    const assignmentData = [
      ['ID', 'Enseignant', 'Mode', 'Classe(s)', 'Matière(s)', 'Heures/Semaine', 'Date de début', 'Date de fin', 'Statut']
    ];

    assignments.forEach(assignment => {
      assignmentData.push([
        assignment.id,
        assignment.teacherName,
        assignment.mode === 'maternelle' ? 'Maternelle' : 
        assignment.mode === 'primaire' ? 'Primaire' : 'Secondaire',
        assignment.classNames?.join(', ') || assignment.className || 'N/A',
        assignment.subjectNames?.join(', ') || assignment.subjectName || 'Toutes matières',
        assignment.hoursPerWeek,
        assignment.startDate,
        assignment.endDate || 'En cours',
        assignment.status === 'active' ? 'Actif' : 
        assignment.status === 'pending' ? 'En attente' : 'Expiré'
      ]);
    });

    const assignmentSheet = XLSX.utils.aoa_to_sheet(assignmentData);
    assignmentSheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 25 },
      { wch: 30 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(workbook, assignmentSheet, 'Affectations');

    // Feuille de résumé
    const summaryData = [
      ['RÉSUMÉ DES AFFECTATIONS', ''],
      ['', ''],
      ['STATISTIQUES GÉNÉRALES', ''],
      ['Total Heures/Semaine', assignmentStats.totalHours],
      ['Nombre d\'affectations', assignmentStats.assignmentCount],
      ['Affectations actives', assignmentStats.activeAssignments],
      ['Affectations en attente', assignmentStats.pendingAssignments],
      ['Affectations expirées', assignmentStats.expiredAssignments],
      ['', ''],
      ['ANALYSE PAR MODE', ''],
      ['Mode', 'Nombre', 'Heures/Semaine', 'Enseignants', 'Pourcentage']
    ];

    assignmentStats.modeAnalysis.forEach(item => {
      const percentage = assignmentStats.totalHours > 0 ? ((item.totalHours / assignmentStats.totalHours) * 100).toFixed(1) : 0;
      summaryData.push([
        item.mode === 'maternelle' ? 'Maternelle' : 
        item.mode === 'primaire' ? 'Primaire' : 'Secondaire',
        item.count,
        item.totalHours,
        item.teachers,
        `${percentage}%`
      ]);
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');

    // Feuille d'informations de l'école
    const schoolData = [
      ['RÉSUMÉ DES AFFECTATIONS', ''],
      ['', ''],
      ['IDENTITÉ DE L\'ÉCOLE', ''],
      ['Nom', schoolSettings?.schoolName || 'Non spécifié'],
      ['Adresse', schoolSettings?.address || 'Non spécifié'],
      ['Téléphone', schoolSettings?.phone || 'Non spécifié'],
      ['Email', schoolSettings?.email || 'Non spécifié'],
      ['Site Web', schoolSettings?.website || 'Non spécifié'],
      ['Devise', schoolSettings?.motto || 'Non spécifié'],
      ['', ''],
      ['INFORMATIONS DU RAPPORT', ''],
      ['Généré par', 'Academia Hub Desktop'],
      ['Version', '1.0.0'],
      ['Date de Génération', new Date().toLocaleDateString('fr-FR')],
      ['Heure de Génération', new Date().toLocaleTimeString('fr-FR')],
      ['Année Scolaire', academicYear],
      ['', ''],
      ['MÉTADONNÉES', ''],
      ['Nombre Total d\'Affectations', assignmentStats.assignmentCount],
      ['Total Heures/Semaine', `${assignmentStats.totalHours}h`],
      ['Modes d\'affectation', assignmentStats.modeAnalysis.length],
      ['', ''],
      ['© 2024 Academia Hub - Tous droits réservés', '']
    ];

    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    schoolSheet['!cols'] = [
      { wch: 25 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Informations École');

    XLSX.writeFile(workbook, `liste-affectations-${academicYear}.xlsx`);
  }

  static generateAssignmentSummaryExcel(
    assignments: AssignmentExcelData[],
    assignmentStats: AssignmentStats,
    academicYear: string,
    schoolSettings?: {
      schoolName?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      motto?: string;
      logo?: string;
    }
  ): void {
    const workbook = XLSX.utils.book_new();

    // Feuille de résumé exécutif
    const summaryData = [
      ['RÉSUMÉ EXÉCUTIF DES AFFECTATIONS', ''],
      ['', ''],
      ['STATISTIQUES GÉNÉRALES', ''],
      ['Total Heures/Semaine', assignmentStats.totalHours],
      ['Nombre d\'affectations', assignmentStats.assignmentCount],
      ['Affectations actives', assignmentStats.activeAssignments],
      ['Affectations en attente', assignmentStats.pendingAssignments],
      ['Affectations expirées', assignmentStats.expiredAssignments],
      ['', ''],
      ['ANALYSE PAR MODE', ''],
      ['Mode', 'Nombre', 'Heures/Semaine', 'Enseignants', 'Pourcentage']
    ];

    assignmentStats.modeAnalysis.forEach(item => {
      const percentage = assignmentStats.totalHours > 0 ? ((item.totalHours / assignmentStats.totalHours) * 100).toFixed(1) : 0;
      summaryData.push([
        item.mode === 'maternelle' ? 'Maternelle' : 
        item.mode === 'primaire' ? 'Primaire' : 'Secondaire',
        item.count,
        item.totalHours,
        item.teachers,
        `${percentage}%`
      ]);
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé Exécutif');

    // Feuille d'informations de l'école
    const schoolData = [
      ['RÉSUMÉ DES AFFECTATIONS', ''],
      ['', ''],
      ['IDENTITÉ DE L\'ÉCOLE', ''],
      ['Nom', schoolSettings?.schoolName || 'Non spécifié'],
      ['Adresse', schoolSettings?.address || 'Non spécifié'],
      ['Téléphone', schoolSettings?.phone || 'Non spécifié'],
      ['Email', schoolSettings?.email || 'Non spécifié'],
      ['Site Web', schoolSettings?.website || 'Non spécifié'],
      ['Devise', schoolSettings?.motto || 'Non spécifié'],
      ['', ''],
      ['INFORMATIONS DU RAPPORT', ''],
      ['Généré par', 'Academia Hub Desktop'],
      ['Version', '1.0.0'],
      ['Date de Génération', new Date().toLocaleDateString('fr-FR')],
      ['Heure de Génération', new Date().toLocaleTimeString('fr-FR')],
      ['Année Scolaire', academicYear],
      ['', ''],
      ['MÉTADONNÉES', ''],
      ['Nombre Total d\'Affectations', assignmentStats.assignmentCount],
      ['Total Heures/Semaine', `${assignmentStats.totalHours}h`],
      ['Modes d\'affectation', assignmentStats.modeAnalysis.length],
      ['', ''],
      ['© 2024 Academia Hub - Tous droits réservés', '']
    ];

    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    schoolSheet['!cols'] = [
      { wch: 25 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Informations École');

    XLSX.writeFile(workbook, `resume-affectations-${academicYear}.xlsx`);
  }

  // Méthodes pour la charge de travail
  static generateWorkloadExcel(
    workloadData: WorkloadExcelData[],
    workloadStats: WorkloadStats,
    academicYear: string,
    schoolSettings?: {
      schoolName?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      motto?: string;
      logo?: string;
    }
  ): void {
    const workbook = XLSX.utils.book_new();

    // Feuille principale - Liste des charges de travail
    const workloadExcelData = [
      ['ID', 'Enseignant', 'Heures/Semaine', 'Max Heures', 'Efficacité (%)', 'Statut', 'Classes', 'Matières', 'Recommandations']
    ];

    workloadData.forEach(teacher => {
      workloadExcelData.push([
        teacher.id,
        teacher.teacherName,
        teacher.hoursPerWeek.toString(),
        teacher.maxHours.toString(),
        teacher.efficiency.toString(),
        teacher.status,
        teacher.classes,
        teacher.subjects,
        teacher.recommendations
      ]);
    });

    const workloadSheet = XLSX.utils.aoa_to_sheet(workloadExcelData);
    workloadSheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
      { wch: 40 }
    ];

    XLSX.utils.book_append_sheet(workbook, workloadSheet, 'Charges de Travail');

    // Feuille de résumé
    const summaryData = [
      ['RÉSUMÉ DES CHARGES DE TRAVAIL', ''],
      ['', ''],
      ['STATISTIQUES GÉNÉRALES', ''],
      ['Total Heures/Semaine', workloadStats.totalHours.toString()],
      ['Moyenne par Enseignant', workloadStats.avgHours.toString()],
      ['Taux d\'Utilisation', `${workloadStats.utilizationRate}%`],
      ['Efficacité Globale', `${workloadStats.efficiency}%`],
      ['', ''],
      ['RÉPARTITION PAR STATUT', ''],
      ['Statut', 'Nombre', 'Pourcentage'],
      ['Équilibrés (Optimal)', workloadStats.optimal.toString(), `${workloadData.length > 0 ? Math.round((workloadStats.optimal / workloadData.length) * 100) : 0}%`],
      ['Sous-chargés', workloadStats.underloaded.toString(), `${workloadData.length > 0 ? Math.round((workloadStats.underloaded / workloadData.length) * 100) : 0}%`],
      ['Surchargés', workloadStats.overloaded.toString(), `${workloadData.length > 0 ? Math.round((workloadStats.overloaded / workloadData.length) * 100) : 0}%`]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');

    // Feuille d'informations de l'école
    const schoolData = [
      ['RAPPORT DE CHARGE DE TRAVAIL', ''],
      ['', ''],
      ['IDENTITÉ DE L\'ÉCOLE', ''],
      ['Nom', schoolSettings?.schoolName || 'Non spécifié'],
      ['Adresse', schoolSettings?.address || 'Non spécifié'],
      ['Téléphone', schoolSettings?.phone || 'Non spécifié'],
      ['Email', schoolSettings?.email || 'Non spécifié'],
      ['Site Web', schoolSettings?.website || 'Non spécifié'],
      ['Devise', schoolSettings?.motto || 'Non spécifié'],
      ['', ''],
      ['INFORMATIONS DU RAPPORT', ''],
      ['Généré par', 'Academia Hub Desktop'],
      ['Version', '1.0.0'],
      ['Date de Génération', new Date().toLocaleDateString('fr-FR')],
      ['Heure de Génération', new Date().toLocaleTimeString('fr-FR')],
      ['Année Scolaire', academicYear],
      ['', ''],
      ['MÉTADONNÉES', ''],
      ['Nombre Total d\'Enseignants', workloadData.length],
      ['Total Heures/Semaine', `${workloadStats.totalHours}h`],
      ['Taux d\'Utilisation', `${workloadStats.utilizationRate}%`],
      ['Efficacité Globale', `${workloadStats.efficiency}%`],
      ['', ''],
      ['© 2024 Academia Hub - Tous droits réservés', '']
    ];

    const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
    schoolSheet['!cols'] = [
      { wch: 25 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Informations École');

    XLSX.writeFile(workbook, `rapport-charge-travail-${academicYear}.xlsx`);
  }

  /**
   * Génère un fichier Excel pour le bordereau de notes
   */
  static generateBordereauExcel(
    bordereauData: any[],
    stats: any,
    academicInfo: {
      academicYear: string;
      quarter: string;
      level: string;
      className: string;
    },
    schoolSettings?: {
      schoolName?: string;
      address?: string;
      phone?: string;
      email?: string;
      website?: string;
      motto?: string;
      logo?: string;
    }
  ): void {
    const workbook = XLSX.utils.book_new();

    // Feuille principale - Bordereau de notes
    const bordereauDataArray = [
      ['N°', 'Nom', 'Prénom', 'Numéro', 'Sexe', 'Moyenne Générale', 'Rang', 'Appréciation']
    ];

    bordereauData.forEach((student, index) => {
      bordereauDataArray.push([
        index + 1,
        student.nom || student.lastName || student.id,
        student.prenom || student.firstName || 'Prénom',
        student.numeroEducmaster || '-',
        student.sexe || '-',
        student.moyenneGenerale ? 
          (typeof student.moyenneGenerale === 'number' ? 
            student.moyenneGenerale.toFixed(2) : 
            student.moyenneGenerale) : '-',
        student.rangGeneral || '-',
        student.appreciation || '-'
      ]);
    });

    const bordereauSheet = XLSX.utils.aoa_to_sheet(bordereauDataArray);
    bordereauSheet['!cols'] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 8 },
      { wch: 15 },
      { wch: 8 },
      { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(workbook, bordereauSheet, 'Bordereau de Notes');

    // Feuille des statistiques
    const statsData = [
      ['STATISTIQUES DU BORDEREAU', ''],
      ['', ''],
      ['Année Académique', academicInfo.academicYear],
      ['Trimestre', academicInfo.quarter],
      ['Niveau', academicInfo.level],
      ['Classe', academicInfo.className],
      ['', ''],
      ['STATISTIQUES GÉNÉRALES', ''],
      ['Nombre Total d\'Élèves', stats.totalStudents],
      ['Moyenne de Classe', stats.averageClass && !isNaN(stats.averageClass) ? stats.averageClass.toFixed(2) : '0.00'],
      ['Taux de Réussite', stats.successRate && !isNaN(stats.successRate) ? `${stats.successRate.toFixed(1)}%` : '0.0%'],
      ['', ''],
      ['RÉPARTITION PAR MENTION', ''],
      ['Excellent (≥18)', stats.distribution?.excellent || 0],
      ['Très Bien (16-17.99)', stats.distribution?.tresBien || 0],
      ['Bien (14-15.99)', stats.distribution?.bien || 0],
      ['Assez Bien (12-13.99)', stats.distribution?.assezBien || 0],
      ['Passable (10-11.99)', stats.distribution?.passable || 0],
      ['Insuffisant (<10)', stats.distribution?.insuffisant || 0],
      ['', ''],
      ['INFORMATIONS ÉCOLE', ''],
      ['Nom de l\'École', schoolSettings?.schoolName || ''],
      ['Adresse', schoolSettings?.address || ''],
      ['Téléphone', schoolSettings?.phone || ''],
      ['Email', schoolSettings?.email || ''],
      ['Site Web', schoolSettings?.website || ''],
      ['Devise', schoolSettings?.motto || ''],
      ['', ''],
      ['Généré le', new Date().toLocaleDateString('fr-FR')],
      ['© 2024 Academia Hub - Tous droits réservés', '']
    ];

    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    statsSheet['!cols'] = [
      { wch: 25 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');

    // Générer le nom du fichier
    const fileName = `bordereau-notes-${academicInfo.level}-${academicInfo.className}-${academicInfo.quarter}-${academicInfo.academicYear}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}
