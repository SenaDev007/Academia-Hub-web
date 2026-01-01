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
    borderBottom: '2 solid #374151',
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
    color: '#1f2937',
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
    backgroundColor: '#f9fafb',
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
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  
  // Section 4: Tableau des dépenses
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
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusApproved: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  statusPaid: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  
  // Section 5: Analyse par catégorie
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  categoryTable: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  categoryHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  categoryHeaderCell: {
    padding: 8,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  categoryRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryCell: {
    padding: 6,
    fontSize: 8,
    color: '#374151',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  categoryCellCenter: {
    padding: 6,
    fontSize: 8,
    color: '#374151',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1 solid #e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 3,
  },
  footerDate: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

interface PDFExpenseSummaryProps {
  expenses: Array<{
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
  }>;
  schoolSettings: any;
  academicYear: string;
  viewMode: 'list' | 'summary';
  expenseStats: {
    total: number;
    approvedTotal: number;
    pendingTotal: number;
    rejectedTotal?: number;
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
  };
  expenseCategories?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  startDate?: string;
  endDate?: string;
}

const PDFExpenseSummary: React.FC<PDFExpenseSummaryProps> = ({
  expenses,
  schoolSettings,
  academicYear,
  viewMode,
  expenseStats,
  expenseCategories = [],
  startDate,
  endDate
}) => {
  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(/\s/g, '.');
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      case 'paid': return 'Payée';
      default: return status;
    }
  };

  // Fonction pour obtenir le style du statut
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return [styles.statusBadge, styles.statusPending];
      case 'approved': return [styles.statusBadge, styles.statusApproved];
      case 'rejected': return [styles.statusBadge, styles.statusRejected];
      case 'paid': return [styles.statusBadge, styles.statusPaid];
      default: return [styles.statusBadge, styles.statusPending];
    }
  };

  // Fonction pour obtenir le libellé de la méthode de paiement
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'bank_transfer': return 'Virement bancaire';
      case 'check': return 'Chèque';
      case 'mobile_money': return 'Mobile Money';
      default: return method;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Section 1: En-tête de l'école */}
        <View style={styles.schoolHeader}>
          <View style={styles.schoolHeaderContent}>
            {schoolSettings?.logo && (
              <Image style={styles.schoolLogo} src={schoolSettings.logo} />
            )}
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>
                {schoolSettings?.schoolName || schoolSettings?.name || 'Academia Hub'}
              </Text>
            </View>
          </View>
          
          {/* Contacts sur la même ligne */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 4 }}>
            {schoolSettings?.phone && (
              <Text style={styles.schoolContact}>
                Tél: {schoolSettings.phone}
              </Text>
            )}
            {schoolSettings?.email && schoolSettings?.phone && (
              <Text style={[styles.schoolContact, { marginLeft: 10 }]}>
                | Email: {schoolSettings.email}
              </Text>
            )}
            {schoolSettings?.website && (schoolSettings?.phone || schoolSettings?.email) && (
              <Text style={[styles.schoolContact, { marginLeft: 10 }]}>
                | Site web: {schoolSettings.website}
              </Text>
            )}
          </View>
          
          {schoolSettings?.address && (
            <Text style={styles.schoolAddress}>
              Adresse: {schoolSettings.address}
            </Text>
          )}
          
          {schoolSettings?.motto && (
            <Text style={styles.schoolMotto}>
              "{schoolSettings.motto}"
            </Text>
          )}
        </View>

        {/* Section 2: Titre du document */}
        <View style={styles.documentTitle}>
          <Text style={styles.title}>
            {viewMode === 'summary' ? 'RÉSUMÉ DES DÉPENSES' : 'LISTE DES DÉPENSES'}
          </Text>
          <Text style={styles.subtitle}>
            Année scolaire {academicYear} • {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
            {startDate && endDate && (
              <Text> • Période: {new Date(startDate).toLocaleDateString('fr-FR')} - {new Date(endDate).toLocaleDateString('fr-FR')}</Text>
            )}
            {startDate && !endDate && (
              <Text> • À partir du {new Date(startDate).toLocaleDateString('fr-FR')}</Text>
            )}
            {!startDate && endDate && (
              <Text> • Jusqu'au {new Date(endDate).toLocaleDateString('fr-FR')}</Text>
            )}
          </Text>
        </View>

        {/* Section 3: Récapitulatif */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>RÉCAPITULATIF FINANCIER</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total des dépenses</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(expenseStats.total)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Dépenses approuvées</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(expenseStats.approvedTotal)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Dépenses en attente</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(expenseStats.pendingTotal)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Dépenses rejetées</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(expenseStats.rejectedTotal || 0)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Ce mois</Text>
              <Text style={styles.summaryValue}>
                {formatAmount(expenseStats.monthly)} F CFA
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Taux d'approbation</Text>
              <Text style={styles.summaryValue}>
                {expenseStats.approvedPercentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Nombre total</Text>
              <Text style={styles.summaryValue}>
                {expenseStats.expenseCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Section 4: Analyse par catégorie */}
        {viewMode === 'summary' && (
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>ANALYSE PAR CATÉGORIE</Text>
            <View style={styles.categoryTable}>
              {/* En-tête du tableau */}
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryHeaderCell, { width: '8%' }]}>N°</Text>
                <Text style={[styles.categoryHeaderCell, { width: '32%' }]}>Catégorie</Text>
                <Text style={[styles.categoryHeaderCell, { width: '20%' }]}>Montant (F CFA)</Text>
                <Text style={[styles.categoryHeaderCell, { width: '15%' }]}>Pourcentage</Text>
                <Text style={[styles.categoryHeaderCell, { width: '15%' }]}>Dépenses</Text>
                <Text style={[styles.categoryHeaderCell, { width: '10%' }]}>Statut</Text>
              </View>
              
              {/* Lignes des catégories */}
              {expenseStats.categoryAnalysis.map((item, index) => {
                const percentage = expenseStats.total > 0 ? (item.total / expenseStats.total) * 100 : 0;
                return (
                  <View key={item.category} style={styles.categoryRow}>
                    <Text style={[styles.categoryCellCenter, { width: '8%' }]}>
                      {index + 1}
                    </Text>
                    <Text style={[styles.categoryCell, { width: '32%' }]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.categoryCellCenter, { width: '20%' }]}>
                      {formatAmount(item.total)}
                    </Text>
                    <Text style={[styles.categoryCellCenter, { width: '15%' }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                    <Text style={[styles.categoryCellCenter, { width: '15%' }]}>
                      {item.count}
                    </Text>
                    <Text style={[styles.categoryCellCenter, { width: '10%' }]}>
                      <Text style={[styles.statusBadge, styles.statusApproved]}>
                        Actif
                      </Text>
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Section 5: Tableau des dépenses */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>DÉTAIL DES DÉPENSES</Text>
          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '5%' }]}>N°</Text>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Date</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Titre</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Catégorie</Text>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Fournisseur</Text>
              <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Montant</Text>
              <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Méthode</Text>
              <Text style={[styles.tableHeaderCell, { width: '11%' }]}>Statut</Text>
            </View>
            
            {/* Lignes des dépenses */}
            {expenses.map((expense, index) => (
              <View key={expense.id} style={styles.tableRow}>
                <Text style={[styles.tableCellCenter, { width: '5%' }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '12%' }]}>
                  {formatDate(expense.date)}
                </Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>
                  {expense.title}
                </Text>
                <Text style={[styles.tableCell, { width: '15%' }]}>
                  {expenseCategories.find(cat => cat.id === expense.category)?.name || expense.category}
                </Text>
                <Text style={[styles.tableCell, { width: '12%' }]}>
                  {expense.vendor || ' - '}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '15%' }]}>
                  {formatAmount(expense.amount)}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '10%' }]}>
                  {getPaymentMethodLabel(expense.paymentMethod)}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '11%' }]}>
                  <Text style={getStatusStyle(expense.status)}>
                    {getStatusLabel(expense.status)}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Généré par Academia Hub, le {new Date().toLocaleString('fr-FR')}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFExpenseSummary;