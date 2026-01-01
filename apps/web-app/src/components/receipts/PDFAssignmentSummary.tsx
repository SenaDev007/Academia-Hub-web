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
  
  // Section 5: Tableau des affectations
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
    backgroundColor: '#1e40af',
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
  
  // Section 6: Analyse par mode
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

interface PDFAssignmentSummaryProps {
  assignments: Array<{
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
  }>;
  academicYear: string;
  assignmentStats: {
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
  };
  viewMode: 'list' | 'summary';
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

const PDFAssignmentSummary: React.FC<PDFAssignmentSummaryProps> = ({
  assignments,
  academicYear,
  assignmentStats,
  viewMode,
  schoolSettings
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'expired': return 'Expiré';
      default: return status;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'maternelle': return 'Maternelle';
      case 'primaire': return 'Primaire';
      case 'secondaire': return 'Secondaire';
      default: return mode;
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
          {viewMode === 'list' ? 'LISTE DES AFFECTATIONS DES ENSEIGNANTS' : 'RÉSUMÉ DES AFFECTATIONS DES ENSEIGNANTS'}
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
            <Text style={styles.infoLabel}>Nombre d'affectations:</Text>
            <Text style={styles.infoValue}>{assignmentStats.assignmentCount}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Total heures/semaine:</Text>
            <Text style={styles.infoValue}>{assignmentStats.totalHours}h</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Affectations actives:</Text>
            <Text style={styles.infoValue}>{assignmentStats.activeAssignments}</Text>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>STATISTIQUES GÉNÉRALES</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{assignmentStats.totalHours}h</Text>
              <Text style={styles.statLabel}>Total Heures/Semaine</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{assignmentStats.activeAssignments}</Text>
              <Text style={styles.statLabel}>Actives</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{assignmentStats.pendingAssignments}</Text>
              <Text style={styles.statLabel}>En Attente</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{assignmentStats.expiredAssignments}</Text>
              <Text style={styles.statLabel}>Expirées</Text>
            </View>
          </View>
        </View>

        {/* Tableau des affectations */}
        {viewMode === 'list' && (
          <View style={styles.tableSection}>
            <Text style={styles.tableTitle}>DÉTAIL DES AFFECTATIONS</Text>
            <View style={styles.table}>
              {/* En-tête du tableau */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableHeader, { flex: 2 }]}>Enseignant</Text>
                <Text style={[styles.tableHeader, { flex: 1 }]}>Mode</Text>
                <Text style={[styles.tableHeader, { flex: 2 }]}>Classe(s)</Text>
                <Text style={[styles.tableHeader, { flex: 2 }]}>Matière(s)</Text>
                <Text style={[styles.tableHeader, { flex: 1 }]}>Heures</Text>
                <Text style={[styles.tableHeader, { flex: 1 }]}>Statut</Text>
              </View>
              
              {/* Lignes du tableau */}
              {assignments.map((assignment, index) => (
                <View key={assignment.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{assignment.teacherName}</Text>
                  <Text style={[styles.tableCellCenter, { flex: 1 }]}>{getModeLabel(assignment.mode)}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {assignment.classNames?.join(', ') || assignment.className || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {assignment.subjectNames?.join(', ') || assignment.subjectName || 'Toutes matières'}
                  </Text>
                  <Text style={[styles.tableCellCenter, { flex: 1 }]}>{assignment.hoursPerWeek}h</Text>
                  <Text style={[styles.tableCellLast, { flex: 1 }]}>{getStatusLabel(assignment.status)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Analyse par mode */}
        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>ANALYSE PAR MODE D'AFFECTATION</Text>
          {assignmentStats.modeAnalysis.map((item) => (
            <View key={item.mode} style={styles.analysisItem}>
              <Text style={styles.analysisLabel}>
                {getModeLabel(item.mode)}: {item.count} affectation{item.count > 1 ? 's' : ''} • {item.teachers} enseignant{item.teachers > 1 ? 's' : ''}
              </Text>
              <Text style={styles.analysisValue}>
                {item.totalHours}h/semaine ({assignmentStats.totalHours > 0 ? ((item.totalHours / assignmentStats.totalHours) * 100).toFixed(1) : 0}%)
              </Text>
            </View>
          ))}
        </View>

        {/* Pied de page */}
        <Text style={styles.footer}>
          Document généré par Academia Hub • {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
        </Text>
      </Page>
    </Document>
  );
};

export default PDFAssignmentSummary;
