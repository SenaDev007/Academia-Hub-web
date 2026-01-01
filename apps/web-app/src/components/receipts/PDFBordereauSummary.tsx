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
  
  // Section 5: Tableau des notes
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
    fontSize: 8,
    fontWeight: 'bold',
    padding: 6,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
  },
  tableCell: {
    flex: 1,
    padding: 4,
    fontSize: 7,
    borderRight: '1 solid #e5e7eb',
    textAlign: 'left',
  },
  tableCellCenter: {
    flex: 1,
    padding: 4,
    fontSize: 7,
    borderRight: '1 solid #e5e7eb',
    textAlign: 'center',
  },
  tableCellLast: {
    flex: 1,
    padding: 4,
    fontSize: 7,
    textAlign: 'left',
  },
  
  // Section 6: Pied de page
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
    fontSize: 7,
  },
  large: {
    fontSize: 12,
  },
});

interface PDFBordereauSummaryProps {
  bordereauData: Array<{
    id: string;
    nom: string;
    prenom: string;
    notes: Array<{
      subjectId: string;
      subjectName: string;
      coefficient: number;
      notes: { [key: string]: any };
      moyenne: number;
      rang: number;
      appreciation: string;
    }>;
    moyenneGenerale: number;
    rangGeneral: number;
    appreciationGenerale: string;
  }>;
  subjects: Array<{
    id: string;
    name: string;
    coefficient: number;
  }>;
  academicYear: string;
  quarter: string;
  level: string;
  className: string;
  schoolSettings: {
    schoolName?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    motto?: string;
    logo?: string;
  };
  filteredData?: Array<any>;
  filteredColumns?: Array<any>;
}

const PDFBordereauSummary: React.FC<PDFBordereauSummaryProps> = ({
  bordereauData,
  subjects,
  academicYear,
  quarter,
  level,
  className,
  schoolSettings,
  filteredData,
  filteredColumns
}) => {
  // Force cache refresh - v2
  const dataToShow = filteredData || bordereauData;
  const columnsToShow = filteredColumns || [];

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'maternelle': return 'Maternelle';
      case 'primaire': return 'Primaire';
      case '1er_cycle': return '1er Cycle Secondaire';
      case '2nd_cycle': return '2nd Cycle Secondaire';
      default: return level;
    }
  };

  const calculateStats = () => {
    if (!dataToShow || dataToShow.length === 0) {
      return {
        totalStudents: 0,
        averageClass: 0,
        successRate: 0,
        distribution: { excellent: 0, bien: 0, assez: 0, faible: 0 }
      };
    }

    const totalStudents = dataToShow.length;
    
    // Filtrer les moyennes numériques seulement
    const validAverages = dataToShow
      .map(student => student.moyenneGenerale)
      .filter(avg => avg !== null && avg !== undefined && typeof avg === 'number' && !isNaN(avg));
    
    const averageClass = validAverages.length > 0 
      ? validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length 
      : 0;

    const successRate = validAverages.length > 0 
      ? (validAverages.filter(avg => avg >= 10).length / validAverages.length) * 100 
      : 0;

    const distribution = validAverages.reduce((acc, avg) => {
      if (avg >= 16) acc.excellent++;
      else if (avg >= 14) acc.bien++;
      else if (avg >= 10) acc.assez++;
      else acc.faible++;
      return acc;
    }, { excellent: 0, bien: 0, assez: 0, faible: 0 });

    return {
      totalStudents,
      averageClass,
      successRate,
      distribution
    };
  };

  const stats = calculateStats();

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
          BORDEREAU DE NOTES
        </Text>
        <Text style={styles.documentSubtitle}>
          {getLevelLabel(level)} • {className} • {quarter} • {academicYear}
        </Text>

        {/* Informations générales */}
        <View style={styles.documentInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Année scolaire:</Text>
            <Text style={styles.infoValue}>{academicYear}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Trimestre:</Text>
            <Text style={styles.infoValue}>{quarter}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Niveau:</Text>
            <Text style={styles.infoValue}>{getLevelLabel(level)}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Classe:</Text>
            <Text style={styles.infoValue}>{className}</Text>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>STATISTIQUES DE LA CLASSE</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalStudents}</Text>
              <Text style={styles.statLabel}>Élèves</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.averageClass && !isNaN(stats.averageClass) ? stats.averageClass.toFixed(2) : '0.00'}
              </Text>
              <Text style={styles.statLabel}>Moyenne Classe</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.successRate && !isNaN(stats.successRate) ? stats.successRate.toFixed(1) : '0.0'}%
              </Text>
              <Text style={styles.statLabel}>Taux de Réussite</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {stats.distribution.excellent + stats.distribution.bien}
              </Text>
              <Text style={styles.statLabel}>Mentions</Text>
            </View>
          </View>
        </View>

        {/* Tableau des notes */}
        {dataToShow && dataToShow.length > 0 && (
          <View style={styles.tableSection}>
            <Text style={styles.tableTitle}>DÉTAIL DES NOTES</Text>
            <View style={styles.table}>
              {/* En-tête du tableau */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableHeader, { flex: 2 }]}>Élève</Text>
                {columnsToShow.map((column) => (
                  <Text key={column.key} style={[styles.tableHeader, { flex: 1 }]}>
                    {column.title}
                  </Text>
                ))}
                <Text style={[styles.tableHeader, { flex: 1 }]}>Moy. Gén.</Text>
                <Text style={[styles.tableHeader, { flex: 1 }]}>Rang</Text>
                <Text style={[styles.tableHeader, { flex: 1 }]}>Appréciation</Text>
              </View>
              
              {/* Lignes du tableau */}
              {dataToShow.map((student, index) => (
                <View key={student.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>
                    {student.nom || student.lastName || student.id} {student.prenom || student.firstName || ''}
                  </Text>
                  {columnsToShow.map((column) => (
                    <Text key={column.key} style={[styles.tableCellCenter, { flex: 1 }]}>
                      {student[column.key] || '-'}
                    </Text>
                  ))}
                  <Text style={[styles.tableCellCenter, { flex: 1 }]}>
                    {student.moyenneGenerale ? 
                      (typeof student.moyenneGenerale === 'number' ? 
                        student.moyenneGenerale.toFixed(2) : 
                        student.moyenneGenerale) : '-'}
                  </Text>
                  <Text style={[styles.tableCellCenter, { flex: 1 }]}>
                    {student.rangGeneral || '-'}
                  </Text>
                  <Text style={[styles.tableCellLast, { flex: 1 }]}>
                    {student.appreciationGenerale || '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pied de page */}
        <Text style={styles.footer}>
          Document généré par Academia Hub • {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
        </Text>
      </Page>
    </Document>
  );
};

export default PDFBordereauSummary;