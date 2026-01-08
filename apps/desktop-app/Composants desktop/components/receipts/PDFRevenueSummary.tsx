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
  
  // Section 4: Tableau des recettes
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
  typeBadge: {
    padding: 2,
    borderRadius: 3,
    textAlign: 'center',
    fontSize: 7,
    fontWeight: 'bold',
  },
  typeTuition: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  typeOther: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  typeDefault: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
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

interface PDFRevenueSummaryProps {
  revenues: Array<{
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
  }>;
  academicYear: string;
  revenueStats: {
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
  };
  viewMode: 'list' | 'summary';
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

const PDFRevenueSummary: React.FC<PDFRevenueSummaryProps> = ({
  revenues,
  academicYear,
  revenueStats,
  viewMode,
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

  // Fonction pour obtenir le libellé du type
  const getTypeLabel = (type: string): string => {
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
  };

  // Fonction pour obtenir le style du type
  const getTypeStyle = (type: string) => {
    if (type === 'inscription_fee' || type === 'reinscription_fee' || type === 'tuition_fee') {
      return [styles.typeBadge, styles.typeTuition];
    } else if (type === 'uniforme' || type === 'fournitures' || type === 'cantine') {
      return [styles.typeBadge, styles.typeOther];
    }
    return [styles.typeBadge, styles.typeDefault];
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  if (viewMode === 'summary') {
    // Vue Résumé Exécutif
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
              RÉSUMÉ EXÉCUTIF DES RECETTES
            </Text>
            <Text style={styles.subtitle}>
              Année scolaire: {formatAcademicYear(academicYear)}
            </Text>
          </View>

          {/* Section 3: Récapitulatif */}
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>MÉTRIQUES PRINCIPALES</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Recettes</Text>
                <Text style={styles.summaryValue}>
                  {formatAmount(revenueStats.total)} F CFA
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Scolarité Encaissée</Text>
                <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
                  {formatAmount(revenueStats.tuitionRevenue)} F CFA
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Autres Recettes</Text>
                <Text style={[styles.summaryValue, styles.summaryValueWarning]}>
                  {formatAmount(revenueStats.otherRevenue)} F CFA
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Ce Mois</Text>
                <Text style={styles.summaryValue}>
                  {formatAmount(revenueStats.monthly)} F CFA
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Part Scolarité</Text>
                <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
                  {revenueStats.tuitionPercentage.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Part Autres</Text>
                <Text style={[styles.summaryValue, styles.summaryValueWarning]}>
                  {revenueStats.otherPercentage.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Transactions</Text>
                <Text style={styles.summaryValue}>
                  {revenueStats.revenueCount}
                </Text>
              </View>
            </View>
          </View>

          {/* Section 4: Analyse par type */}
          <View style={styles.tableSection}>
            <Text style={styles.tableTitle}>ANALYSE PAR TYPE DE RECETTE</Text>
            <View style={styles.table}>
              {/* En-tête du tableau */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { width: '8%' }]}>N°</Text>
                <Text style={[styles.tableHeaderCell, { width: '32%' }]}>Type de Recette</Text>
                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Montant (F CFA)</Text>
                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Pourcentage</Text>
                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Transactions</Text>
                <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Statut</Text>
              </View>
              
              {/* Lignes des types */}
              {revenueStats.typeAnalysis.map((item, index) => {
                const percentage = revenueStats.total > 0 ? (item.total / revenueStats.total) * 100 : 0;
                return (
                  <View key={item.type} style={styles.tableRow}>
                    <Text style={[styles.tableCellCenter, { width: '8%' }]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.tableCell, { width: '32%' }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.tableCellCenter, { width: '20%' }]}>
                      {formatAmount(item.total)}
                    </Text>
                    <Text style={[styles.tableCellCenter, { width: '15%' }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                    <Text style={[styles.tableCellCenter, { width: '15%' }]}>
                      {item.count}
                    </Text>
                    <Text style={[styles.tableCellCenter, { width: '10%' }]}>
                      <Text style={getTypeStyle(item.type)}>
                        Actif
                      </Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Généré par Academia Hub, le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR')}
          </Text>
        </Page>
      </Document>
    );
  }

  // Vue Liste des Recettes
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
            LISTE DES RECETTES
          </Text>
          <Text style={styles.subtitle}>
            Année scolaire: {formatAcademicYear(academicYear)}
          </Text>
        </View>

        {/* Section 3: Récapitulatif */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>RÉCAPITULATIF GÉNÉRAL</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Recettes</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(revenueStats.total)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Scolarité Encaissée</Text>
              <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
                {formatAmount(revenueStats.tuitionRevenue)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Autres Recettes</Text>
              <Text style={[styles.summaryValue, styles.summaryValueWarning]}>
                {formatAmount(revenueStats.otherRevenue)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Ce Mois</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(revenueStats.monthly)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Part Scolarité</Text>
              <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
                {revenueStats.tuitionPercentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Part Autres</Text>
              <Text style={[styles.summaryValue, styles.summaryValueWarning]}>
                {revenueStats.otherPercentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Transactions</Text>
              <Text style={styles.summaryValue}>
                {revenueStats.revenueCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Tableau des recettes */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>DÉTAIL DES RECETTES</Text>
          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '5%' }]}>N°</Text>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Date</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Type</Text>
              <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Description</Text>
              <Text style={[styles.tableHeaderCell, { width: '18%' }]}>Élève/Classe</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Montant</Text>
              <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Statut</Text>
            </View>
            
            {/* Lignes des recettes */}
            {revenues.map((revenue, index) => (
              <View key={revenue.id} style={styles.tableRow}>
                <Text style={[styles.tableCellCenter, { width: '5%' }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '12%' }]}>
                  {formatDate(revenue.date)}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '15%' }]}>
                  <Text style={getTypeStyle(revenue.type)}>
                    {getTypeLabel(revenue.type)}
                  </Text>
                </Text>
                <Text style={[styles.tableCell, { width: '25%' }]}>
                  {revenue.description}
                </Text>
                <Text style={[styles.tableCell, { width: '18%' }]}>
                  {revenue.studentName ? `${revenue.studentName}${revenue.className ? ` (${revenue.className})` : ''}` : 'N/A'}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '15%' }]}>
                  {formatAmount(revenue.amount)}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '10%' }]}>
                  <Text style={[styles.typeBadge, styles.typeTuition]}>
                    Complété
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

export default PDFRevenueSummary;