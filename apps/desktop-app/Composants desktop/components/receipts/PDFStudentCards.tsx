import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { memp, mestfp } from '../../utils/imagePaths';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  // Dimensions standard d'une carte ID (85.6mm x 53.98mm)
  card: {
    width: 240, // 85.6mm en points
    height: 152, // 53.98mm en points - dimensions standard
    border: '2 solid #1e40af',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  // En-tête moderne avec armoiries et informations de l'école
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    backgroundColor: '#f8fafc',
    borderBottom: '1 solid #e5e7eb',
    height: 30,
  },
  coatOfArms: {
    width: 25,
    height: 25,
    marginRight: 6,
  },
  schoolInfo: {
    flex: 1,
    paddingLeft: 3,
  },
  schoolName: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 1,
    textAlign: 'left',
  },
  schoolMotto: {
    fontSize: 4,
    color: '#374151',
    textAlign: 'left',
    fontStyle: 'italic',
    marginBottom: 1,
  },
  schoolContact: {
    fontSize: 3,
    color: '#6b7280',
    textAlign: 'left',
  },
  // Section titre de la carte
  cardTitleSection: {
    padding: 3,
    backgroundColor: '#ffffff',
    borderBottom: '1 solid #e5e7eb',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  academicYear: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center',
  },
  // Section principale moderne avec photo et informations
  mainSection: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: '#ffffff',
    flex: 1,
  },
  studentPhoto: {
    width: 30,
    height: 40,
    marginRight: 6,
    border: '1 solid #1e40af',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  photoPlaceholder: {
    fontSize: 4,
    color: '#9ca3af',
    textAlign: 'center',
  },
  studentInfo: {
    flex: 1,
    marginRight: 6,
  },
  studentDetails: {
    fontSize: 4,
    color: '#374151',
    marginBottom: 0.5,
    lineHeight: 1.1,
  },
  studentName: {
    fontSize: 5,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 1,
  },
  studentClass: {
    fontSize: 4,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 1,
    backgroundColor: '#fef2f2',
    padding: 1,
    borderRadius: 2,
    textAlign: 'center',
  },
  // Section QR Code moderne
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 35,
  },
  qrCode: {
    width: 30,
    height: 30,
    marginBottom: 1,
    border: '1 solid #1e40af',
    borderRadius: 3,
  },
  qrText: {
    fontSize: 3,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Pied de page moderne
  footer: {
    padding: 3,
    backgroundColor: '#f8fafc',
    borderTop: '1 solid #e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 15,
  },
  matricule: {
    fontSize: 4,
    fontWeight: 'bold',
    color: '#1f2937',
    backgroundColor: '#dbeafe',
    padding: 1,
    borderRadius: 2,
    border: '1 solid #3b82f6',
  },
  signature: {
    fontSize: 3,
    color: '#6b7280',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  // Bande tricolore béninoise moderne
  beninFlag: {
    height: 5,
    backgroundColor: '#00a651', // Vert
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  // Styles pour l'affichage multiple
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
});

interface PDFStudentCardsProps {
  studentsData: Array<{
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: string;
    birthPlace: string;
    className: string;
    academicYear: string;
    photo?: string;
  }>;
  schoolSettings?: {
    name?: string;
    address?: string;
    primaryPhone?: string;
    primaryEmail?: string;
    website?: string;
    logo?: string;
  };
  cardType: string;
  includePhoto: boolean;
  includeQRCode: boolean;
  includeBarcode: boolean;
}

const PDFStudentCards: React.FC<PDFStudentCardsProps> = ({
  studentsData,
  schoolSettings,
  cardType,
  includePhoto,
  includeQRCode,
  includeBarcode
}) => {
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});

  const getCardTypeLabel = () => {
    switch (cardType) {
      case 'student': return 'CARTE D\'IDENTITE SCOLAIRE';
      case 'library': return 'CARTE BIBLIOTHÈQUE';
      case 'canteen': return 'CARTE CANTINE';
      case 'transport': return 'CARTE TRANSPORT';
      default: return 'CARTE D\'IDENTITE SCOLAIRE';
    }
  };

  // Déterminer l'armoirie selon le niveau de classe
  const getCoatOfArms = (className: string) => {
    const level = className.toLowerCase();
    
    // Niveaux maternel et primaire
    if (level.includes('maternelle') || level.includes('primaire') || 
        level.includes('cp') || level.includes('ce1') || level.includes('ce2') || 
        level.includes('cm1') || level.includes('cm2') || level.includes('6ème')) {
      return memp;
    }
    
    // Niveaux secondaire (1er cycle et 2nd cycle)
    if (level.includes('5ème') || level.includes('4ème') || level.includes('3ème') ||
        level.includes('2nde') || level.includes('1ère') || level.includes('terminale') ||
        level.includes('tle') || level.includes('cycle')) {
      return mestfp;
    }
    
    // Par défaut, utiliser l'armoirie du secondaire
    return mestfp;
  };

  // Générer un QR code dynamique avec les informations de l'élève
  const generateQRCodeData = (student: any) => {
    const qrData = {
      type: 'student_card',
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      class: student.className,
      academicYear: student.academicYear,
      school: schoolSettings?.name || 'École',
      generatedAt: new Date().toISOString(),
      cardType: cardType
    };
    return JSON.stringify(qrData);
  };

  // Générer un numéro de carte unique
  const generateCardNumber = (student: any) => {
    const year = new Date().getFullYear();
    const studentId = student.id.substring(0, 8).toUpperCase();
    return `${year}-${studentId}`;
  };

  // Générer les QR codes pour tous les élèves
  useEffect(() => {
    const generateAllQRCodes = async () => {
      if (includeQRCode) {
        const qrCodesData: { [key: string]: string } = {};
        
        for (const student of studentsData) {
          try {
            const qrData = generateQRCodeData(student);
            const qrCodeDataURL = await QRCode.toDataURL(qrData, {
              width: 40,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              },
              errorCorrectionLevel: 'M'
            });
            qrCodesData[student.id] = qrCodeDataURL;
          } catch (error) {
            console.error(`Erreur lors de la génération du QR code pour ${student.firstName} ${student.lastName}:`, error);
          }
        }
        
        setQrCodes(qrCodesData);
      }
    };

    generateAllQRCodes();
  }, [includeQRCode, studentsData, schoolSettings, cardType]);

  const renderStudentCard = (student: any) => (
    <View key={student.id} style={styles.card}>
      {/* En-tête avec armoiries et informations de l'école */}
      <View style={styles.header}>
        <Image 
          style={styles.coatOfArms} 
          src={getCoatOfArms(student.className)} 
        />
        <View style={styles.schoolInfo}>
          <Text style={styles.schoolName}>
            {schoolSettings?.name || 'NOM DE L\'ÉCOLE'}
          </Text>
          <Text style={styles.schoolMotto}>
            {(schoolSettings as any)?.motto || 'Devise de l\'école'}
          </Text>
          {schoolSettings?.primaryPhone && (
            <Text style={styles.schoolContact}>
              Tél: {schoolSettings.primaryPhone}
            </Text>
          )}
          {schoolSettings?.address && (
            <Text style={styles.schoolContact}>
              {schoolSettings.address}
            </Text>
          )}
        </View>
      </View>

      {/* Section titre de la carte */}
      <View style={styles.cardTitleSection}>
        <Text style={styles.cardTitle}>
          CARTE D'IDENTITE SCOLAIRE
        </Text>
        <Text style={styles.academicYear}>
          {student.academicYear}
        </Text>
      </View>


      {/* Section principale avec photo et informations */}
      <View style={styles.mainSection}>
        {/* Photo de l'élève */}
        {includePhoto && (
          <View style={styles.studentPhoto}>
            {student.photo ? (
              <Image 
                style={{ 
                  width: 28, 
                  height: 38,
                  objectFit: 'cover',
                  borderRadius: 2
                }} 
                src={student.photo} 
              />
            ) : (
              <Text style={styles.photoPlaceholder}>Photo</Text>
            )}
          </View>
        )}
        
        {/* Informations de l'élève */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentDetails}>
            Nom : {student.lastName.toUpperCase()}
          </Text>
          <Text style={styles.studentDetails}>
            Prénom(s) : {student.firstName}
          </Text>
          <Text style={styles.studentDetails}>
            Né(e) le : {student.birthDate} à {student.birthPlace}
          </Text>
          <Text style={styles.studentDetails}>
            Sexe : {student.gender === 'M' ? 'Masculin' : 'Féminin'}
          </Text>
          <Text style={styles.studentDetails}>
            Nationalité : Béninoise
          </Text>
          <Text style={styles.studentDetails}>
            Adresse : {student.birthPlace}
          </Text>
          <Text style={styles.studentClass}>
            {student.className}
          </Text>
        </View>

        {/* QR Code dynamique */}
        {includeQRCode && (
          <View style={styles.qrSection}>
            {qrCodes[student.id] ? (
              <Image 
                style={styles.qrCode} 
                src={qrCodes[student.id]} 
              />
            ) : (
              <View style={styles.qrCode}>
                <Text style={styles.qrText}>
                  QR Code
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Pied de page avec matricule et signature */}
      <View style={styles.footer}>
        <Text style={styles.matricule}>
          Mle : {generateCardNumber(student)}
        </Text>
        <Text style={styles.signature}>
          Signature de l'apprenant
        </Text>
      </View>

      {/* Bande tricolore béninoise */}
      <View style={styles.beninFlag} />
    </View>
  );

  // Si un seul élève, centrer la carte sur la page
  if (studentsData.length === 1) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.pageTitle}>
            {getCardTypeLabel()} - {studentsData[0].firstName} {studentsData[0].lastName}
          </Text>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: 20
          }}>
            {renderStudentCard(studentsData[0])}
          </View>
        </Page>
      </Document>
    );
  }

  // Si plusieurs élèves, affichage en grille
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageTitle}>
          {getCardTypeLabel()} - {studentsData.length} carte{studentsData.length > 1 ? 's' : ''}
        </Text>
        <View style={styles.cardsContainer}>
          {studentsData.map(renderStudentCard)}
        </View>
      </Page>
    </Document>
  );
};

export default PDFStudentCards;
