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
  
  // Section 1: En-tête de l'école (identique au modal Récapitulatif des Paiements)
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
  
  // Section 3: Composition du conseil
  compositionSection: {
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    border: '1 solid #e5e7eb',
  },
  compositionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  compositionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compositionColumn: {
    width: '48%',
  },
  compositionItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  compositionLabel: {
    fontSize: 8,
    color: '#6b7280',
    width: '45%',
  },
  compositionValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1f2937',
    width: '55%',
  },
  
  // Section 4: Statistiques
  statsSection: {
    marginBottom: 15,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    border: '1 solid #e5e7eb',
  },
  statsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '23%',
    backgroundColor: '#ffffff',
    padding: 6,
    marginBottom: 6,
    borderRadius: 3,
    border: '1 solid #e5e7eb',
  },
  statLabel: {
    fontSize: 7,
    color: '#6b7280',
    marginBottom: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
  },
  statValueSuccess: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#059669',
  },
  statValueWarning: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#d97706',
  },
  statValueDanger: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#dc2626',
  },
  
  // Section 5: Tableau des élèves
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
    padding: 6,
    fontSize: 8,
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
    padding: 4,
    fontSize: 7,
    color: '#374151',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableCellCenter: {
    padding: 4,
    fontSize: 7,
    color: '#374151',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    textAlign: 'center',
  },
  studentName: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  studentNumber: {
    fontSize: 6,
    color: '#6b7280',
  },
  
  // Section 6: Détail des moyennes par matière
  subjectsSection: {
    marginBottom: 20,
  },
  subjectsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  studentSubjects: {
    marginBottom: 15,
    border: '1 solid #e5e7eb',
    borderRadius: 4,
    padding: 8,
  },
  studentSubjectsHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: '23%',
    backgroundColor: '#f8fafc',
    padding: 4,
    marginBottom: 4,
    borderRadius: 3,
    border: '1 solid #e5e7eb',
  },
  subjectName: {
    fontSize: 6,
    color: '#6b7280',
    marginBottom: 2,
    textAlign: 'center',
  },
  subjectAverage: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  
  // Section 7: Signature et cachet (identique au modal)
  signatureSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: 9,
    marginBottom: 10,
    color: '#6b7280',
  },
  signatureLine: {
    borderBottom: '1 solid #000000',
    height: 40,
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 8,
    color: '#6b7280',
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

interface PDFConseilPVProps {
  students: Array<{
    id: string;
    firstName: string;
    lastName: string;
    educmasterNumber: string;
    average: number | string;
    rank: number;
    decision: string;
    observations: string;
    assiduite?: string;
    comportement?: string;
    gender?: string;
    subjects: Array<{
      name: string;
      average: number | string;
    }>;
  }>;
  conseilData: {
    directeur: string;
    enseignantTitulaire: string;
    representantParents: string;
    delegueEleves: string;
    dateConseil: string;
  };
  conseilStats: {
    effectif: number;
    presents: number;
    moyenneClasse: number | string;
    tauxReussite: number;
    decisions: {
      admis: number;
      encouragements: number;
      avertissement: number;
      redoublement: number;
    };
  };
  selectedClass: string;
  selectedLevel: string;
  selectedEvaluation: string;
  schoolSettings?: {
    name?: string;
    abbreviation?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    motto?: string;
    logo?: string;
  };
}

const PDFConseilPV: React.FC<PDFConseilPVProps> = ({
  students,
  conseilData,
  conseilStats,
  selectedClass,
  selectedLevel,
  selectedEvaluation,
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

  // Fonction pour formater le rang
  const formatRang = (rang: number, gender?: string) => {
    if (rang <= 0) return '-';
    if (rang === 1) {
      return gender === 'F' ? '1ère' : '1er';
    }
    return `${rang}ème`;
  };

  // Fonction pour obtenir le style de la décision
  const getDecisionStyle = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'admis':
      case 'ts':
        return [styles.statValueSuccess];
      case 'encouragements':
      case 's':
        return [styles.statValueWarning];
      case 'avertissement':
        return [styles.statValueWarning];
      case 'redoublement':
      case 'ps':
        return [styles.statValueDanger];
      default:
        return [styles.statValue];
    }
  };

  // Fonction pour obtenir le style de l'assiduité
  const getAssiduiteStyle = (assiduite: string) => {
    switch (assiduite?.toLowerCase()) {
      case 'excellent':
        return [styles.statValueSuccess];
      case 'bon':
        return [styles.statValue];
      case 'moyen':
        return [styles.statValueWarning];
      case 'faible':
        return [styles.statValueDanger];
      default:
        return [styles.statValue];
    }
  };

  // Fonction pour obtenir le style du comportement
  const getComportementStyle = (comportement: string) => {
    switch (comportement?.toLowerCase()) {
      case 'excellent':
        return [styles.statValueSuccess];
      case 'bon':
        return [styles.statValue];
      case 'moyen':
        return [styles.statValueWarning];
      case 'faible':
        return [styles.statValueDanger];
      default:
        return [styles.statValue];
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Section 1: En-tête de l'école (identique au modal Récapitulatif des Paiements) */}
        <View style={styles.schoolHeader}>
          <View style={styles.schoolHeaderContent}>
            {schoolSettings.logo && (
              <Image style={styles.schoolLogo} src={schoolSettings.logo} />
            )}
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>
                {schoolSettings.name || 'Academia Hub'}
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
            PROCÈS-VERBAL DU CONSEIL DE CLASSE
          </Text>
          <Text style={styles.subtitle}>
            Classe: {selectedClass} | Niveau: {selectedLevel} | Évaluation: {selectedEvaluation}
          </Text>
        </View>

        {/* Section 3: Composition du conseil */}
        <View style={styles.compositionSection}>
          <Text style={styles.compositionTitle}>COMPOSITION DU CONSEIL</Text>
          <View style={styles.compositionGrid}>
            <View style={styles.compositionColumn}>
              <View style={styles.compositionItem}>
                <Text style={styles.compositionLabel}>Directeur(trice):</Text>
                <Text style={styles.compositionValue}>{conseilData.directeur}</Text>
              </View>
              <View style={styles.compositionItem}>
                <Text style={styles.compositionLabel}>Enseignant titulaire:</Text>
                <Text style={styles.compositionValue}>{conseilData.enseignantTitulaire}</Text>
              </View>
            </View>
            <View style={styles.compositionColumn}>
              <View style={styles.compositionItem}>
                <Text style={styles.compositionLabel}>Représentant parents:</Text>
                <Text style={styles.compositionValue}>{conseilData.representantParents}</Text>
              </View>
              <View style={styles.compositionItem}>
                <Text style={styles.compositionLabel}>Délégué élèves:</Text>
                <Text style={styles.compositionValue}>{conseilData.delegueEleves}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 4: Statistiques */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>RÉSUMÉ STATISTIQUE</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Effectif</Text>
              <Text style={styles.statValue}>{conseilStats.effectif}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Présents</Text>
              <Text style={styles.statValue}>{conseilStats.presents}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Moyenne classe</Text>
              <Text style={styles.statValue}>
                {typeof conseilStats.moyenneClasse === 'number' 
                  ? conseilStats.moyenneClasse.toFixed(2) 
                  : conseilStats.moyenneClasse}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Taux de réussite</Text>
              <Text style={styles.statValue}>{conseilStats.tauxReussite.toFixed(1)}%</Text>
            </View>
            {selectedLevel === 'maternelle' ? (
              <>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Élèves excellents (TS)</Text>
                  <Text style={styles.statValueSuccess}>{conseilStats.decisions.admis}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Élèves satisfaisants (S)</Text>
                  <Text style={styles.statValueWarning}>{conseilStats.decisions.encouragements}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Élèves en difficulté (PS)</Text>
                  <Text style={styles.statValueDanger}>{conseilStats.decisions.redoublement}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Élèves excellents (≥16)</Text>
                  <Text style={styles.statValueSuccess}>{conseilStats.decisions.admis}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Élèves encouragements (12-16)</Text>
                  <Text style={styles.statValueWarning}>{conseilStats.decisions.encouragements}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Élèves moyens (10-12)</Text>
                  <Text style={styles.statValueWarning}>{conseilStats.decisions.avertissement}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Élèves en difficulté (&lt;10)</Text>
                  <Text style={styles.statValueDanger}>{conseilStats.decisions.redoublement}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Section 5: Tableau des élèves */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>DÉCISIONS DU CONSEIL DE CLASSE</Text>
          <View style={styles.table}>
            {/* En-tête du tableau */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: '6%' }]}>Rang</Text>
              <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Élève</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>N° Educmaster</Text>
              <Text style={[styles.tableHeaderCell, { width: '8%' }]}>Moyenne</Text>
              <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Assiduité</Text>
              <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Comportement</Text>
              <Text style={[styles.tableHeaderCell, { width: '12%' }]}>Décision</Text>
              <Text style={[styles.tableHeaderCell, { width: '26%' }]}>Observations</Text>
            </View>
            
            {/* Lignes des élèves */}
            {students.map((student, index) => (
              <View key={student.id} style={styles.tableRow}>
                <Text style={[styles.tableCellCenter, { width: '6%' }]}>
                  {formatRang(student.rank, student.gender)}
                </Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>
                  <Text style={styles.studentName}>
                    {student.firstName} {student.lastName}
                  </Text>
                  <Text style={styles.studentNumber}>
                    {'\n'}{student.educmasterNumber}
                  </Text>
                </Text>
                <Text style={[styles.tableCellCenter, { width: '8%' }]}>
                  {typeof student.average === 'number' 
                    ? student.average.toFixed(2) 
                    : student.average}
                </Text>
                <Text style={[styles.tableCellCenter, { width: '10%' }]}>
                  <Text style={getAssiduiteStyle(student.assiduite || '')}>
                    {student.assiduite || '-'}
                  </Text>
                </Text>
                <Text style={[styles.tableCellCenter, { width: '10%' }]}>
                  <Text style={getComportementStyle(student.comportement || '')}>
                    {student.comportement || '-'}
                  </Text>
                </Text>
                <Text style={[styles.tableCellCenter, { width: '12%' }]}>
                  <Text style={getDecisionStyle(student.decision)}>
                    {student.decision}
                  </Text>
                </Text>
                <Text style={[styles.tableCell, { width: '26%' }]}>
                  {student.observations || '-'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 6: Détail des moyennes par matière */}
        <View style={styles.subjectsSection}>
          <Text style={styles.subjectsTitle}>DÉTAIL DES MOYENNES PAR MATIÈRE</Text>
          {students.map((student) => (
            <View key={student.id} style={styles.studentSubjects}>
              <Text style={styles.studentSubjectsHeader}>
                {student.firstName} {student.lastName} - Moyenne générale: {typeof student.average === 'number' ? student.average.toFixed(2) : student.average}
              </Text>
              <View style={styles.subjectsGrid}>
                {student.subjects.map((subject, index) => (
                  <View key={index} style={styles.subjectCard}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={styles.subjectAverage}>
                      {typeof subject.average === 'number' 
                        ? subject.average.toFixed(2) 
                        : subject.average}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Section 7: Signature et cachet (identique au modal) */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Le Directeur(trice)</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureName}>{conseilData.directeur}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Date du conseil</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureName}>{conseilData.dateConseil}</Text>
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

export default PDFConseilPV;
