import React, { useEffect, useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
    padding: 20,
    fontFamily: 'Helvetica',
  },
  // Dimensions professionnelles d'une carte (85.6mm x 53.98mm)
  card: {
    width: 240, // 85.6mm en points
    height: 152, // 53.98mm en points
    border: '1 solid #e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // En-tête avec logo et informations de l'école
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#1e40af',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginBottom: 8,
  },
  schoolLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderRadius: 4,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  schoolDetails: {
    fontSize: 7,
    color: '#e0e7ff',
    marginBottom: 1,
  },
  // Section principale avec photo et informations
  mainSection: {
    flexDirection: 'row',
    padding: 8,
    flex: 1,
  },
  studentPhoto: {
    width: 40,
    height: 50,
    marginRight: 8,
    border: '1 solid #e5e7eb',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  photoPlaceholder: {
    fontSize: 6,
    color: '#9ca3af',
    textAlign: 'center',
  },
  studentInfo: {
    flex: 1,
    marginRight: 8,
  },
  studentName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  studentDetails: {
    fontSize: 8,
    color: '#374151',
    marginBottom: 2,
  },
  studentClass: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e40af',
    marginTop: 4,
  },
  // Section QR Code
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  qrCode: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  qrText: {
    fontSize: 6,
    color: '#6b7280',
    textAlign: 'center',
  },
  // Pied de page avec informations de validité
  footer: {
    padding: 6,
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 7,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 2,
  },
  validityText: {
    fontSize: 6,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Styles pour les éléments décoratifs
  decorativeLine: {
    height: 2,
    backgroundColor: '#1e40af',
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e40af',
    textAlign: 'right',
    marginBottom: 4,
  },
});

interface PDFStudentCardProps {
  studentData: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: string;
    birthPlace: string;
    className: string;
    academicYear: string;
    photo?: string;
  };
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

const PDFStudentCard: React.FC<PDFStudentCardProps> = ({
  studentData,
  schoolSettings,
  cardType,
  includePhoto,
  includeQRCode,
  includeBarcode
}) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');

  const getCardTypeLabel = () => {
    switch (cardType) {
      case 'student': return 'CARTE D\'ÉLÈVE';
      case 'library': return 'CARTE BIBLIOTHÈQUE';
      case 'canteen': return 'CARTE CANTINE';
      case 'transport': return 'CARTE TRANSPORT';
      default: return 'CARTE SCOLAIRE';
    }
  };

  // Générer un QR code dynamique avec les informations de l'élève
  const generateQRCodeData = () => {
    const qrData = {
      type: 'student_card',
      studentId: studentData.id,
      name: `${studentData.firstName} ${studentData.lastName}`,
      class: studentData.className,
      academicYear: studentData.academicYear,
      school: schoolSettings?.name || 'École',
      generatedAt: new Date().toISOString(),
      cardType: cardType
    };
    return JSON.stringify(qrData);
  };

  // Générer un numéro de carte unique
  const generateCardNumber = () => {
    const year = new Date().getFullYear();
    const studentId = studentData.id.substring(0, 8).toUpperCase();
    return `${year}-${studentId}`;
  };

  // Générer le QR code réel
  useEffect(() => {
    const generateQRCode = async () => {
      if (includeQRCode) {
        try {
          const qrData = generateQRCodeData();
          const qrCodeDataURL = await QRCode.toDataURL(qrData, {
            width: 40,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            errorCorrectionLevel: 'M'
          });
          setQrCodeDataURL(qrCodeDataURL);
        } catch (error) {
          console.error('Erreur lors de la génération du QR code:', error);
        }
      }
    };

    generateQRCode();
  }, [includeQRCode, studentData, schoolSettings, cardType]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          {/* En-tête avec logo et informations de l'école */}
          <View style={styles.header}>
            {schoolSettings?.logo && (
              <Image 
                style={styles.schoolLogo} 
                src={schoolSettings.logo} 
              />
            )}
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>
                {schoolSettings?.name || 'ÉCOLE'}
              </Text>
              {schoolSettings?.address && (
                <Text style={styles.schoolDetails}>
                  {schoolSettings.address}
                </Text>
              )}
              {schoolSettings?.primaryPhone && (
                <Text style={styles.schoolDetails}>
                  Tél: {schoolSettings.primaryPhone}
                </Text>
              )}
            </View>
            <Text style={styles.cardNumber}>
              {generateCardNumber()}
            </Text>
          </View>

          {/* Ligne décorative */}
          <View style={styles.decorativeLine} />

          {/* Section principale avec photo et informations */}
          <View style={styles.mainSection}>
            {/* Photo de l'élève */}
            {includePhoto && (
              <View style={styles.studentPhoto}>
                {studentData.photo ? (
                  <Image 
                    style={{ width: 38, height: 48 }} 
                    src={studentData.photo} 
                  />
                ) : (
                  <Text style={styles.photoPlaceholder}>Photo</Text>
                )}
              </View>
            )}
            
            {/* Informations de l'élève */}
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {studentData.firstName.toUpperCase()} {studentData.lastName.toUpperCase()}
              </Text>
              <Text style={styles.studentDetails}>
                Sexe: {studentData.gender === 'M' ? 'Masculin' : 'Féminin'}
              </Text>
              <Text style={styles.studentDetails}>
                Né(e): {studentData.birthDate}
              </Text>
              <Text style={styles.studentDetails}>
                Lieu: {studentData.birthPlace}
              </Text>
              <Text style={styles.studentClass}>
                {studentData.className}
              </Text>
              <Text style={styles.studentDetails}>
                Année: {studentData.academicYear}
              </Text>
            </View>

            {/* QR Code dynamique */}
            {includeQRCode && (
              <View style={styles.qrSection}>
                {qrCodeDataURL ? (
                  <Image 
                    style={styles.qrCode} 
                    src={qrCodeDataURL} 
                  />
                ) : (
                  <View style={styles.qrCode}>
                    <Text style={styles.qrText}>
                      QR Code
                    </Text>
                  </View>
                )}
                <Text style={styles.qrText}>
                  {getCardTypeLabel()}
                </Text>
              </View>
            )}
          </View>

          {/* Pied de page avec informations de validité */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {getCardTypeLabel()}
            </Text>
            <Text style={styles.validityText}>
              Valide pour l'année scolaire {studentData.academicYear}
            </Text>
            <Text style={styles.validityText}>
              Émise le {new Date().toLocaleDateString('fr-FR')}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFStudentCard;
