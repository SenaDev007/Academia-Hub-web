import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  
  // Section 1: En-tête de l'école
  schoolHeader: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2 solid #1e40af',
    paddingBottom: 12,
  },
  schoolHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  schoolLogo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
    lineHeight: 1.1,
  },
  schoolAddress: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 2,
  },
  schoolContact: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 1,
  },
  schoolContactLine: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  schoolMotto: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#1e40af',
    marginTop: 4,
  },
  
  // Section 2: Titre du document
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1e40af',
    marginBottom: 8,
  },
  documentSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 20,
  },
  
  // Section 3: Informations générales
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: '#374151',
  },
  
  // Section 4: Statistiques
  statsSection: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: '#374151',
  },
  
  // Section 5: Tableau des charges de travail
  tableSection: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    backgroundColor: '#f97316',
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    padding: 8,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
  },
  tableCell: {
    flex: 1,
    padding: 6,
    fontSize: 8,
    borderRight: '1 solid #e5e7eb',
    textAlign: 'left',
  },
  tableCellCenter: {
    flex: 1,
    padding: 6,
    fontSize: 8,
    borderRight: '1 solid #e5e7eb',
    textAlign: 'center',
  },
  tableCellLast: {
    flex: 1,
    padding: 6,
    fontSize: 8,
    textAlign: 'left',
  },
  
  // Section 6: Analyse par statut
  analysisSection: {
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 5,
    borderRadius: 3,
  },
  analysisLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  analysisValue: {
    fontSize: 10,
    color: '#6b7280',
  },
  
  // Section 7: Pied de page
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  
  // Utilitaires
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },
  small: {
    fontSize: 8,
  },
  large: {
    fontSize: 12,
  },
});

interface PDFWorkloadSummaryProps {
  workloadData: Array<{
    id: string;
    name: string;
    hoursPerWeek: number;
    maxHours: number;
    efficiency: number;
    status: 'underloaded' | 'optimal' | 'overloaded' | 'critical';
    classes: string[];
    subjects: string[];
    recommendations: string[];
  }>;
  academicYear: string;
  workloadStats: {
    totalHours: number;
    avgHours: number;
    underloaded: number;
    optimal: number;
    overloaded: number;
    utilizationRate: number;
    efficiency: number;
  };
  schoolSettings: {
    schoolName?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    motto?: string;
    logo?: string;
  };
}

const PDFWorkloadSummary: React.FC<PDFWorkloadSummaryProps> = ({
  workloadData,
  academicYear,
  workloadStats,
  schoolSettings
}) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'underloaded': return 'Sous-chargé';
      case 'optimal': return 'Optimal';
      case 'overloaded': return 'Surchargé';
      case 'critical': return 'Critique';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'underloaded': return '#f59e0b'; // Jaune
      case 'optimal': return '#10b981'; // Vert
      case 'overloaded': return '#f97316'; // Orange
      case 'critical': return '#ef4444'; // Rouge
      default: return '#6b7280'; // Gris
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête de l'école */}
        <View style={styles.schoolHeader}>
          <View style={styles.schoolHeaderContent}>
            {schoolSettings.logo && (
              <Image style={styles.schoolLogo} src={schoolSettings.logo} />
            )}
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>{schoolSettings.schoolName || 'Academia Hub'}</Text>
              <Text style={styles.schoolContactLine}>
                {schoolSettings.address && `Adresse: ${schoolSettings.address}`}
                {schoolSettings.phone && ` | Tél: ${schoolSettings.phone}`}
                {schoolSettings.email && ` | Email: ${schoolSettings.email}`}
                {schoolSettings.website && ` | Web: ${schoolSettings.website}`}
              </Text>
              {schoolSettings.motto && (
                <Text style={styles.schoolMotto}>"{schoolSettings.motto}"</Text>
              )}
            </View>
          </View>
        </View>

        {/* Titre du document */}
        <Text style={styles.documentTitle}>
          RAPPORT DE CHARGE DE TRAVAIL DES ENSEIGNANTS
        </Text>
        <Text style={styles.documentSubtitle}>
          Année scolaire {academicYear} • Généré le {new Date().toLocaleDateString('fr-FR')}
        </Text>

        {/* Informations générales */}
        <View style={styles.documentInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Année scolaire:</Text>
            <Text style={styles.infoValue}>{academicYear}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Nombre d'enseignants:</Text>
            <Text style={styles.infoValue}>{workloadData.length}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Total heures/semaine:</Text>
            <Text style={styles.infoValue}>{workloadStats.totalHours}h</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Taux d'utilisation:</Text>
            <Text style={styles.infoValue}>{workloadStats.utilizationRate}%</Text>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>STATISTIQUES GÉNÉRALES</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{workloadStats.totalHours}h</Text>
              <Text style={styles.statLabel}>Total Heures/Semaine</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{workloadStats.avgHours}h</Text>
              <Text style={styles.statLabel}>Moyenne par Enseignant</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{workloadStats.optimal}</Text>
              <Text style={styles.statLabel}>Équilibrés</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{workloadStats.underloaded + workloadStats.overloaded}</Text>
              <Text style={styles.statLabel}>À Ajuster</Text>
            </View>
          </View>
        </View>

        {/* Tableau des charges de travail */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>DÉTAIL DES CHARGES DE TRAVAIL</Text>
          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, { flex: 2 }]}>Enseignant</Text>
              <Text style={[styles.tableHeader, { flex: 1 }]}>Heures/Sem</Text>
              <Text style={[styles.tableHeader, { flex: 1 }]}>Max</Text>
              <Text style={[styles.tableHeader, { flex: 1 }]}>Efficacité</Text>
              <Text style={[styles.tableHeader, { flex: 1 }]}>Statut</Text>
              <Text style={[styles.tableHeader, { flex: 2 }]}>Classes</Text>
              <Text style={[styles.tableHeader, { flex: 2 }]}>Matières</Text>
            </View>
            
            {/* Lignes du tableau */}
            {workloadData.map((teacher, index) => (
              <View key={teacher.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{teacher.name}</Text>
                <Text style={[styles.tableCellCenter, { flex: 1 }]}>{teacher.hoursPerWeek}h</Text>
                <Text style={[styles.tableCellCenter, { flex: 1 }]}>{teacher.maxHours}h</Text>
                <Text style={[styles.tableCellCenter, { flex: 1 }]}>{Math.round(teacher.efficiency)}%</Text>
                <Text style={[styles.tableCellCenter, { flex: 1, color: getStatusColor(teacher.status) }]}>
                  {getStatusLabel(teacher.status)}
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {teacher.classes.join(', ') || 'Aucune'}
                </Text>
                <Text style={[styles.tableCellLast, { flex: 2 }]}>
                  {teacher.subjects.join(', ') || 'Toutes matières'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Analyse par statut */}
        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>ANALYSE PAR STATUT</Text>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>
              Enseignants équilibrés (charge optimale)
            </Text>
            <Text style={styles.analysisValue}>
              {workloadStats.optimal} enseignant{workloadStats.optimal > 1 ? 's' : ''} ({workloadData.length > 0 ? Math.round((workloadStats.optimal / workloadData.length) * 100) : 0}%)
            </Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>
              Enseignants sous-chargés (nécessitent plus d'heures)
            </Text>
            <Text style={styles.analysisValue}>
              {workloadStats.underloaded} enseignant{workloadStats.underloaded > 1 ? 's' : ''} ({workloadData.length > 0 ? Math.round((workloadStats.underloaded / workloadData.length) * 100) : 0}%)
            </Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>
              Enseignants surchargés (nécessitent moins d'heures)
            </Text>
            <Text style={styles.analysisValue}>
              {workloadStats.overloaded} enseignant{workloadStats.overloaded > 1 ? 's' : ''} ({workloadData.length > 0 ? Math.round((workloadStats.overloaded / workloadData.length) * 100) : 0}%)
            </Text>
          </View>
        </View>

        {/* Pied de page */}
        <Text style={styles.footer}>
          Document généré par Academia Hub • {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
        </Text>
      </Page>
    </Document>
  );
};

export default PDFWorkloadSummary;
