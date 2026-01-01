import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  
  // En-tête de l'école
  schoolHeader: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2 solid #059669',
    paddingBottom: 12,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 2,
  },
  schoolContact: {
    fontSize: 9,
    color: '#6b7280',
  },
  
  // Titre du rapport
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#047857',
    textAlign: 'center',
    marginBottom: 8,
  },
  reportSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  // Informations du rapport
  reportInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 5,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  
  // Statistiques
  statsContainer: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#f0fdf4',
    borderRadius: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 8,
    color: '#6b7280',
  },
  
  // Tableau des recettes
  tableContainer: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableCell: {
    padding: 8,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  tableCellHeader: {
    fontWeight: 'bold',
    color: '#374151',
  },
  tableCellCenter: {
    textAlign: 'center',
  },
  tableCellRight: {
    textAlign: 'right',
  },
  
  // Résumé
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0fdf4',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  summaryTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#047857',
    borderTop: '1 solid #d1d5db',
    paddingTop: 5,
    marginTop: 5,
  },
  
  // Pied de page
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
    borderTop: '1 solid #d1d5db',
    paddingTop: 10,
  },
});

interface RevenueReportProps {
  schoolInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  reportData: {
    title: string;
    period: string;
    academicYear: string;
    generatedDate: string;
    revenues: Array<{
      id: string;
      reference: string;
      description: string;
      studentName: string;
      className: string;
      type: string;
      amount: number;
      date: string;
      paymentMethod: string;
      status: string;
    }>;
    stats: {
      total: number;
      completed: number;
      pending: number;
      count: number;
    };
  };
}

const PDFRevenueReport: React.FC<RevenueReportProps> = ({ schoolInfo, reportData }) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} F CFA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? 'Encaissé' : 'En attente';
  };

  const getTypeText = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'scolarite': 'Frais inscription et scolarité',
      'transport': 'Transport',
      'cantine': 'Cantine',
      'uniforme': 'Uniforme',
      'activite': 'Activités',
      'don': 'Don',
      'subvention': 'Subvention',
    };
    return typeMap[type] || type;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête de l'école */}
        <View style={styles.schoolHeader}>
          <Text style={styles.schoolName}>{schoolInfo.name}</Text>
          <Text style={styles.schoolAddress}>{schoolInfo.address}</Text>
          <Text style={styles.schoolContact}>
            Tél: {schoolInfo.phone} | Email: {schoolInfo.email}
          </Text>
        </View>

        {/* Titre du rapport */}
        <Text style={styles.reportTitle}>{reportData.title}</Text>
        <Text style={styles.reportSubtitle}>
          Période: {reportData.period} | Année scolaire: {reportData.academicYear}
        </Text>

        {/* Informations du rapport */}
        <View style={styles.reportInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Date de génération:</Text>
            <Text style={styles.infoValue}>{formatDate(reportData.generatedDate)}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Nombre de recettes:</Text>
            <Text style={styles.infoValue}>{reportData.stats.count}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Montant total:</Text>
            <Text style={styles.infoValue}>{formatCurrency(reportData.stats.total)}</Text>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Résumé des Recettes</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCurrency(reportData.stats.total)}</Text>
              <Text style={styles.statLabel}>Total Général</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCurrency(reportData.stats.completed)}</Text>
              <Text style={styles.statLabel}>Encaissées</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCurrency(reportData.stats.pending)}</Text>
              <Text style={styles.statLabel}>En Attente</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{reportData.stats.count}</Text>
              <Text style={styles.statLabel}>Nombre Total</Text>
            </View>
          </View>
        </View>

        {/* Tableau des recettes */}
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>Détail des Recettes</Text>
          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: '15%' }]}>Réf.</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: '20%' }]}>Description</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: '15%' }]}>Élève</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: '10%' }]}>Classe</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, { width: '12%' }]}>Type</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellRight, { width: '12%' }]}>Montant</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellCenter, { width: '8%' }]}>Statut</Text>
              <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellCenter, { width: '8%' }]}>Date</Text>
            </View>

            {/* Lignes des données */}
            {reportData.revenues.map((revenue) => (
              <View key={revenue.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '15%' }]}>{revenue.reference}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{revenue.description}</Text>
                <Text style={[styles.tableCell, { width: '15%' }]}>{revenue.studentName}</Text>
                <Text style={[styles.tableCell, { width: '10%' }]}>{revenue.className}</Text>
                <Text style={[styles.tableCell, { width: '12%' }]}>{getTypeText(revenue.type)}</Text>
                <Text style={[styles.tableCell, styles.tableCellRight, { width: '12%' }]}>
                  {formatCurrency(revenue.amount)}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { width: '8%' }]}>
                  {getStatusText(revenue.status)}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellCenter, { width: '8%' }]}>
                  {formatDate(revenue.date)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Résumé final */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Résumé Financier</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total des recettes:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(reportData.stats.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Montant encaissé:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(reportData.stats.completed)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Montant en attente:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(reportData.stats.pending)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotal}>Taux d'encaissement:</Text>
            <Text style={styles.summaryTotal}>
              {reportData.stats.total > 0 
                ? `${((reportData.stats.completed / reportData.stats.total) * 100).toFixed(1)}%`
                : '0%'
              }
            </Text>
          </View>
        </View>

        {/* Pied de page */}
        <Text style={styles.footer}>
          Rapport généré le {formatDate(reportData.generatedDate)} | 
          Complexe Scolaire Privé Entrepreneurial et Bilingue (CSPEB) - Eveil d'Afrique Education
        </Text>
      </Page>
    </Document>
  );
};

export default PDFRevenueReport;
