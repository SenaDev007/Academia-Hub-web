import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Utiliser les polices par défaut pour éviter les erreurs de chargement

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
    borderBottom: '2 solid #2563eb',
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
  schoolMotto: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#4b5563',
    marginTop: 4,
  },
  
  // Section 2: Titre du document
  documentTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  
  // Section 3: Récapitulatif
  summarySection: {
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    border: '1 solid #e5e7eb',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '32%',
    marginBottom: 6,
    padding: 4,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    border: '1 solid #e5e7eb',
  },
  summaryLabel: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryValueSuccess: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
  },
  summaryValueWarning: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#d97706',
  },
  summaryValueDanger: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  
  // Section 4: Tableau des élèves
  tableSection: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCell: {
    padding: 6,
    fontSize: 8,
    color: '#374151',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableCellCenter: {
    padding: 6,
    fontSize: 8,
    color: '#374151',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    textAlign: 'center',
  },
  statusBadge: {
    padding: 2,
    borderRadius: 3,
    textAlign: 'center',
    fontSize: 7,
    fontWeight: 'bold',
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusPartial: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusNotStarted: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  
  // Footer
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
});

interface PDFClassPaymentSummaryProps {
  classData: {
    id: string;
    name: string;
    level: string;
    students: Array<{
      studentId: string;
      studentName: string;
      expectedTuition: number;
      paidTuition: number;
      remainingTuition: number;
      status: 'completed' | 'partial' | 'not_started';
    }>;
  };
  academicYear: string;
  classStats: {
    totalStudents: number;
    completedStudents: number;
    partialStudents: number;
    notStartedStudents: number;
    totalExpected: number;
    totalPaid: number;
    totalRemaining: number;
    completionRate: number;
  };
  schoolSettings?: {
    schoolName?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    motto?: string;
    logo?: string;
  };
}

const PDFClassPaymentSummary: React.FC<PDFClassPaymentSummaryProps> = ({
  classData,
  academicYear,
  classStats,
  schoolSettings = {}
}) => {
  // Fonction pour formater l'année scolaire
  const formatAcademicYear = (yearId: string) => {
    if (!yearId) return 'N/A';
    
    if (yearId.match(/^\d{4}-\d{4}$/)) {
      return yearId;
    }
    
    if (yearId.startsWith('academic-year-')) {
      const yearPart = yearId.replace('academic-year-', '');
      return yearPart;
    }
    
    return yearId;
  };

  // Fonction pour formater les montants (12.000 au lieu de 12000 F CFA)
  const formatAmount = (amount: number) => {
    const formatted = amount.toLocaleString('fr-FR');
    return formatted.replace(/\s/g, '.');
  };

  // Fonction pour formater le statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Soldé';
      case 'partial': return 'Partiel';
      case 'not_started': return 'Non soldé';
      default: return status;
    }
  };

  // Fonction pour obtenir le style du statut
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return [styles.statusBadge, styles.statusCompleted];
      case 'partial': return [styles.statusBadge, styles.statusWarning];
      case 'not_started': return [styles.statusBadge, styles.statusNotStarted];
      default: return [styles.statusBadge];
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Section 1: En-tête de l'école */}
        <View style={styles.schoolHeader}>
          <View style={styles.schoolHeaderContent}>
            {schoolSettings.logo && (
              <Image style={styles.schoolLogo} src={schoolSettings.logo} />
            )}
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>
                {schoolSettings.schoolName || 'Academia Hub'}
              </Text>
            </View>
          </View>
          
          {/* Contacts sur la même ligne */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 4 }}>
            {schoolSettings.phone && (
              <Text style={styles.schoolContact}>
                Tél: {schoolSettings.phone}
              </Text>
            )}
            {schoolSettings.email && schoolSettings.phone && (
              <Text style={[styles.schoolContact, { marginLeft: 10 }]}>
                | Email: {schoolSettings.email}
              </Text>
            )}
            {schoolSettings.website && (schoolSettings.phone || schoolSettings.email) && (
              <Text style={[styles.schoolContact, { marginLeft: 10 }]}>
                | Site web: {schoolSettings.website}
              </Text>
            )}
          </View>
          
          {schoolSettings.address && (
            <Text style={styles.schoolAddress}>
              Adresse: {schoolSettings.address}
            </Text>
          )}
          
          {schoolSettings.motto && (
            <Text style={styles.schoolMotto}>
              "{schoolSettings.motto}"
            </Text>
          )}
        </View>

        {/* Section 2: Titre du document */}
        <View style={styles.documentTitle}>
          <Text style={styles.title}>
            RÉCAPITULATIF DES PAIEMENTS DE SCOLARITÉ
          </Text>
          <Text style={styles.subtitle}>
            Classe: {classData.name} | Année scolaire: {formatAcademicYear(academicYear)}
          </Text>
        </View>

        {/* Section 3: Récapitulatif */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>RÉCAPITULATIF GÉNÉRAL</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Élèves</Text>
              <Text style={styles.summaryValue}>{classStats.totalStudents}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Soldés</Text>
              <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
                {classStats.completedStudents}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Partiels</Text>
              <Text style={[styles.summaryValue, styles.summaryValueWarning]}>
                {classStats.partialStudents}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Non soldés</Text>
              <Text style={[styles.summaryValue, styles.summaryValueDanger]}>
                {classStats.notStartedStudents}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Attendu</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(classStats.totalExpected)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Versé</Text>
              <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
                {formatAmount(classStats.totalPaid)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Restant</Text>
              <Text style={[styles.summaryValue, styles.summaryValueDanger]}>
                {formatAmount(classStats.totalRemaining)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Taux de collecte</Text>
              <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
                {classStats.completionRate.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Tableau des élèves */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>DÉTAIL PAR ÉLÈVE</Text>
          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>N°</Text>
              <Text style={[styles.tableHeaderCell, { width: '32%' }]}>Nom et Prénoms</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Attendu</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Versé</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Restant</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Statut</Text>
            </View>
            
            {/* Lignes des élèves - triées par ordre alphabétique */}
            {classData.students
              .sort((a, b) => a.studentName.localeCompare(b.studentName))
              .map((student, index) => (
              <View key={student.studentId} style={styles.tableRow}>
                <Text style={[styles.tableCellCenter, { width: '8%' }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tableCell, { width: '32%' }]}>
                  {student.studentName}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '15%' }]}>
                  {formatAmount(student.expectedTuition)}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '15%' }]}>
                  {formatAmount(student.paidTuition)}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '15%' }]}>
                  {formatAmount(student.remainingTuition)}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '15%' }]}>
                  <Text style={getStatusStyle(student.status)}>
                    {getStatusText(student.status)}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Généré par Academia Hub, le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
        </Text>
      </Page>
    </Document>
  );
};

export default PDFClassPaymentSummary;