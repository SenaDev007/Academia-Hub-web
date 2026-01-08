import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  schoolHeader: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2 solid #2563eb',
    paddingBottom: 12,
  },
  schoolInfo: {
    flex: 1,
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
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
    lineHeight: 1.1,
  },
  schoolContact: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: '#6b7280',
  },
  filterInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  filterText: {
    fontSize: 10,
    color: '#6b7280',
    marginHorizontal: 10,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    minHeight: 30,
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableRowOdd: {
    backgroundColor: '#ffffff',
  },
  tableHeader: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tableCell: {
    fontSize: 9,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    flex: 1,
  },
  tableCellName: {
    fontSize: 9,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    flex: 1,
    maxWidth: 120,
    textAlign: 'left',
  },
  tableCellNumber: {
    fontSize: 9,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    width: 30,
    textAlign: 'center',
  },
  tableCellPhoto: {
    fontSize: 9,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    width: 50,
    textAlign: 'center',
  },
  tableCellContact: {
    fontSize: 9,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    width: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8,
    color: '#6b7280',
  },
  signature: {
    textAlign: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: 100,
    marginBottom: 5,
  },
});

interface PDFStudentListProps {
  listData: {
    title: string;
    academicYear: string;
    level?: string;
    className?: string;
    includePhoto?: boolean;
    includeContact?: boolean;
    students: Array<{
      id: string;
      number: number;
      firstName: string;
      lastName: string;
      gender: string;
      birthDate: string;
      birthPlace: string;
      status: string;
      academicStatus: string;
      photo?: string;
      parentPhone?: string;
    }>;
  };
  schoolSettings?: {
    logo?: string;
    name: string;
    address: string;
    primaryPhone: string;
    primaryEmail: string;
    website?: string;
  };
}

const PDFStudentList: React.FC<PDFStudentListProps> = ({ listData, schoolSettings }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const totalStudents = listData.students.length;

  // Fonction pour nettoyer les données des élèves
  const cleanStudentData = (students: any[]) => {
    return students.map(student => ({
      ...student,
      photo: student.photo && student.photo.startsWith('data:image') ? student.photo : null
    }));
  };

  const cleanedStudents = cleanStudentData(listData.students);

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
                {schoolSettings?.name || 'Academia Hub'}
              </Text>
            </View>
          </View>
          
          {/* Contacts sur la même ligne */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 4 }}>
            {schoolSettings?.primaryPhone && (
              <Text style={styles.schoolContact}>
                Tél: {schoolSettings.primaryPhone}
              </Text>
            )}
            {schoolSettings?.primaryEmail && schoolSettings?.primaryPhone && (
              <Text style={[styles.schoolContact, { marginLeft: 10 }]}>
                | Email: {schoolSettings.primaryEmail}
              </Text>
            )}
            {schoolSettings?.website && (schoolSettings?.primaryPhone || schoolSettings?.primaryEmail) && (
              <Text style={[styles.schoolContact, { marginLeft: 10 }]}>
                | Site web: {schoolSettings.website}
              </Text>
            )}
          </View>
          
          {schoolSettings?.address && (
            <Text style={styles.schoolContact}>
              Adresse: {schoolSettings.address}
            </Text>
          )}
        </View>

        {/* Titre */}
        <Text style={styles.title}>{listData.title}</Text>
        
        {/* Informations de filtrage */}
        <View style={styles.filterInfo}>
          <Text style={styles.filterText}>Année scolaire: {listData.academicYear}</Text>
          <Text style={styles.filterText}>Classe: {listData.className || 'Toutes les classes'}</Text>
        </View>

        {/* Tableau des élèves */}
        <View style={styles.table}>
          {/* En-tête du tableau */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCellNumber}>N°</Text>
            <Text style={styles.tableCellName}>Nom et Prénoms</Text>
            <Text style={styles.tableCell}>Sexe</Text>
            <Text style={styles.tableCell}>Date de naissance</Text>
            <Text style={styles.tableCell}>Lieu de naissance</Text>
            <Text style={styles.tableCell}>Ancienneté</Text>
            <Text style={styles.tableCell}>Statut</Text>
            {listData.includeContact && (
              <Text style={styles.tableCellContact}>Contacts</Text>
            )}
          </View>

          {/* Lignes des élèves */}
          {cleanedStudents.map((student, index) => (
            <View key={student.id} style={[
              styles.tableRow,
              index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
            ]}>
              <Text style={styles.tableCellNumber}>{student.number}</Text>
              <Text style={styles.tableCellName}>{student.lastName} {student.firstName}</Text>
              <Text style={styles.tableCell}>{student.gender}</Text>
              <Text style={styles.tableCell}>{student.birthDate}</Text>
              <Text style={styles.tableCell}>{student.birthPlace}</Text>
              <Text style={styles.tableCell}>{student.status}</Text>
              <Text style={styles.tableCell}>{student.academicStatus}</Text>
              {listData.includeContact && (
                <Text style={styles.tableCellContact}>{student.parentPhone || 'N/A'}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Généré le {currentDate}</Text>
          <Text>Total: {totalStudents} élève{totalStudents > 1 ? 's' : ''}</Text>
          <View style={styles.signature}>
            <Text>Signature</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFStudentList;
