import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { hrService } from '../../services/hrService';
import { generateOptimalReceiptName, formatReceiptNameForDisplay } from '../../utils/receiptNameGenerator';

// Enregistrer les polices
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

// Police manuscrite pour la signature - Signatura Monoline (locale)
Font.register({
  family: 'Handwriting',
  fonts: [
    { src: '/fonts/signatura-monoline/Signatura Monoline.ttf', fontWeight: 400 },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 5,
    lineHeight: 1.1,
    width: '100%',
    height: '100%',
  },
  // Bordure autour de la page (sera remplacée par dynamicStyles.border)
  border: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    bottom: 15,
    border: '2px solid #2563eb', // Sera remplacé par dynamicStyles
  },
  // En-tête avec fond coloré (sera remplacé par dynamicStyles.header)
  header: {
    backgroundColor: '#2563eb', // Sera remplacé par dynamicStyles
    padding: 4,
    marginBottom: 4,
    borderRadius: 2,
  },
  receiptTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    marginBottom: 4,
  },
  schoolName: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
  },
  // Ligne de séparation
  separator: {
    height: 1,
    backgroundColor: '#64748b',
    marginVertical: 4,
  },
  // Section
  section: {
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  // Ligne d'information
  infoRow: {
    flexDirection: 'row',
    marginBottom: 1.5,
  },
  infoLabel: {
    fontSize: 5,
    color: '#64748b',
    width: 50,
  },
  infoValue: {
    fontSize: 5,
    color: '#1e293b',
    flex: 1,
  },
  // Montant en gras
  amountValue: {
    fontSize: 5,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  // Pied de page
  footer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  thankMessage: {
    fontSize: 7,
    color: '#64748b',
    marginBottom: 5,
  },
  generationDate: {
    fontSize: 5,
    color: '#9ca3af',
    marginTop: 2,
  },
  // Filigrane
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 50,
    color: '#000000',
    opacity: 0.10,
    zIndex: -1,
  },
  // Signature
  signatureSection: {
    marginTop: 10,
    borderTop: '1px dashed #1e40af', // Couleur secondaire par défaut
    paddingTop: 8,
    textAlign: 'center',
  },
  signatureLabel: {
    fontSize: 7,
    color: '#64748b',
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 14,
    fontFamily: 'Brush Script MT, Lucida Handwriting, Comic Sans MS, cursive',
    color: '#1e293b',
    fontStyle: 'italic',
    letterSpacing: 1,
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  signatureLine: {
    height: 1,
    backgroundColor: '#cbd5e0',
    marginTop: 5,
  },
  // Cachet électronique
  electronicStamp: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 120,
    height: 50,
    border: '4px solid #dc2626',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    opacity: 0.95,
    transform: 'rotate(-2deg)',
    boxShadow: '3px 3px 6px rgba(0,0,0,0.4), inset 0 0 10px rgba(220,38,38,0.1), inset 0 0 0 3px #dc2626',
    filter: 'contrast(1.1) saturate(1.2)',
  },
  stampText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    textAlign: 'center',
    lineHeight: 1.0,
    textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 8px rgba(220,38,38,0.3)',
    filter: 'contrast(1.2)',
    letterSpacing: '1px',
  },
  stampDate: {
    fontSize: 5,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 2,
    textShadow: '1px 1px 3px rgba(0,0,0,0.3), 0 0 6px rgba(220,38,38,0.2)',
    filter: 'contrast(1.1)',
    letterSpacing: '0.5px',
  },
});

interface PDFReceiptProps {
  payment: {
    id: string;
    studentName: string;
    class: string;
    amount: number;
    date: string;
    method: string;
    type: string;
    status: string;
    reference?: string;
    reduction?: number;
    amountGiven?: number;
    change?: number;
    parentName?: string;
    parentPhone?: string;
    address?: string;
    dateOfBirth?: string;
    schoolYear?: string;
    studentData?: {
      id: string;
      name: string;
      class: string;
      matricule: string;
      parentName: string;
      parentPhone: string;
      address: string;
      schoolYear: string;
      totalExpected: number;
      totalPaid: number;
      totalRemaining: number;
    };
    // Données du reçu WhatsApp
    receiptNumber?: string;
    paymentDate?: string;
    paymentTime?: string;
    paymentMethod?: string;
    totalExpected?: number;
    totalPaid?: number;
    totalRemaining?: number;
    schoolName?: string;
    schoolPhone?: string;
    schoolEmail?: string;
    // Informations du comptable
    accountantName?: string;
    accountantPosition?: string;
  };
  schoolSettings?: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  logo?: string;
  name?: string;
  abbreviation?: string;
  };
}

const PDFReceipt: React.FC<PDFReceiptProps> = React.memo(({ payment, schoolSettings }) => {
  // Log pour déboguer les données reçues
  console.log('🔄 PDFReceipt - RENDER - Données reçues:', JSON.parse(JSON.stringify(payment)));
  console.log('🔄 PDFReceipt - RENDER - schoolSettings:', schoolSettings);
  
  // Couleurs statiques pour éviter les re-renders
  const primaryColor = schoolSettings?.primaryColor || '#2563eb';
  const secondaryColor = schoolSettings?.secondaryColor || '#1e40af';
  const accentColor = schoolSettings?.accentColor || '#3b82f6';
  
  // État pour le nom du comptable
  const [accountantName, setAccountantName] = useState('Comptable');
  const [isAccountantLoaded, setIsAccountantLoaded] = useState(false);

  // Récupérer le nom du comptable depuis HR
  useEffect(() => {
    const fetchAccountantName = async () => {
      if (isAccountantLoaded) return;
      
      try {
        console.log('🔍 PDFReceipt - Récupération du nom du comptable...');
        const schoolId = schoolSettings?.id || 'school-1';
        const accountantInfo = await hrService.getAccountantInfo(schoolId);
        if (accountantInfo?.name) {
          setAccountantName(accountantInfo.name);
          console.log('✅ PDFReceipt - Nom du comptable récupéré:', accountantInfo.name);
        } else {
          console.log('⚠️ PDFReceipt - Aucun comptable trouvé, utilisation du nom par défaut');
        }
        setIsAccountantLoaded(true);
    } catch (error) {
        console.error('❌ PDFReceipt - Erreur lors de la récupération du comptable:', error);
        setIsAccountantLoaded(true);
      }
    };

    fetchAccountantName();
  }, [isAccountantLoaded, schoolSettings?.id]);
  
  // Les couleurs sont maintenant mémorisées au début du composant

  // Styles dynamiques basés sur les couleurs de l'école - mémorisés
  const dynamicStyles = React.useMemo(() => StyleSheet.create({
    page: {
      backgroundColor: '#ffffff',
      padding: 20,
      fontFamily: 'Helvetica',
      fontSize: 5,
      lineHeight: 1.1,
      width: '100%',
      height: '100%',
    },
    border: {
      position: 'absolute',
      top: 15,
      left: 15,
      right: 15,
      bottom: 15,
      border: `2px solid ${primaryColor}`,
    },
    header: {
      backgroundColor: primaryColor,
      padding: 4,
      marginBottom: 4,
      borderRadius: 2,
    },
    receiptTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 4,
    },
    schoolName: {
      fontSize: 8,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 2,
    },
    schoolContact: {
      fontSize: 6,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 2,
    },
    contactRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 15,
      marginTop: 2,
    },
    separator: {
      height: 1,
      backgroundColor: primaryColor,
      marginVertical: 4,
    },
    sectionTitle: {
      fontSize: 7,
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: 3,
      textTransform: 'uppercase',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 1.5,
    },
    infoLabel: {
      fontSize: 6,
      color: '#374151',
      fontWeight: 'normal',
    },
    infoValue: {
      fontSize: 6,
      color: '#111827',
      fontWeight: 'normal',
    },
    amountValue: {
      fontSize: 6,
      color: primaryColor,
      fontWeight: 'bold',
    },
    section: {
      marginBottom: 3,
    },
    footer: {
      marginTop: 6,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: 8,
      color: '#059669',
      fontWeight: 'bold',
      marginBottom: 4,
    },
    thankMessage: {
      fontSize: 7,
      color: '#374151',
      marginBottom: 5,
    },
    generationDate: {
      fontSize: 5,
      color: '#6b7280',
      marginTop: 2,
    },
    // Styles pour le filigrane logo
    watermarkLogo: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.15,
      zIndex: -1,
    },
    watermarkImage: {
      width: 150,
      height: 150,
      objectFit: 'contain',
    },
    watermarkText: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-45deg)',
      fontSize: 30, // Taille augmentée
      color: '#dc2626', // Rouge vif
      opacity: 0.3, // Opacité réduite pour plus de subtilité
      fontWeight: 'bold',
      textShadow: '2px 2px 4px rgba(0,0,0,0.2)', // Ombre augmentée
      letterSpacing: '3px', // Espacement augmenté
      textAlign: 'center', // Centrage du texte
      width: '100%', // Largeur complète pour le centrage
    },
    signatureSection: {
      marginTop: 8,
      borderTop: `1px dashed ${secondaryColor}`,
      paddingTop: 10,
      textAlign: 'center',
    },
    signatureLabel: {
      fontSize: 7,
      color: '#374151',
      marginBottom: 3,
    },
    signatureText: {
      fontSize: 15,
      color: '#000000',
      fontWeight: 'bold',
      fontFamily: 'Brush Script MT, Lucida Handwriting, Comic Sans MS, cursive',
      fontStyle: 'italic',
      marginBottom: 6,
      letterSpacing: 1,
      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
    },
    // Cachet électronique dynamique
    electronicStamp: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 120,
      height: 50,
      border: '4px solid #dc2626',
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      opacity: 0.95,
      transform: 'rotate(-2deg)',
      boxShadow: '3px 3px 6px rgba(0,0,0,0.4), inset 0 0 10px rgba(220,38,38,0.1), inset 0 0 0 3px #dc2626',
      filter: 'contrast(1.1) saturate(1.2)',
    },
    stampText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#dc2626',
      textAlign: 'center',
      lineHeight: 1.0,
      textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 8px rgba(220,38,38,0.3)',
      filter: 'contrast(1.2)',
      letterSpacing: '1px',
    },
    stampDate: {
      fontSize: 5,
      color: '#dc2626',
      textAlign: 'center',
      marginTop: 2,
      textShadow: '1px 1px 3px rgba(0,0,0,0.3), 0 0 6px rgba(220,38,38,0.2)',
      filter: 'contrast(1.1)',
      letterSpacing: '0.5px',
    },
  }), [primaryColor, secondaryColor, accentColor]);

  // Fonction pour formater les montants
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true
    }).format(amount).replace(/\s/g, '.');
  };

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString === 'Invalid Date') {
        return new Date().toLocaleDateString('fr-FR');
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString('fr-FR');
      }
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return new Date().toLocaleDateString('fr-FR');
    }
  };

  // Fonction pour formater l'heure
  const formatTime = (dateString: string) => {
    try {
      if (!dateString || dateString === 'Invalid Date') {
        return new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };


  // Générer un nom de reçu professionnel
  const generatedReceiptName = generateOptimalReceiptName({
    schoolName: payment?.schoolName || 'ACADEMIA',
    studentName: payment?.studentName || 'ELEVE',
    paymentDate: payment?.paymentDate || payment?.date || new Date().toISOString(),
    paymentAmount: payment?.amount || 0,
    paymentMethod: payment?.paymentMethod || payment?.method || 'CASH'
  });

  // Normaliser la méthode de paiement
  const normalizePaymentMethod = (method: string | undefined) => {
    if (!method) return 'cash';
    const methodLower = method.toLowerCase();
    if (methodLower.includes('cash') || methodLower.includes('espèces') || methodLower === 'cash') {
      return 'cash';
    }
    if (methodLower.includes('momo') || methodLower.includes('mtn') || methodLower === 'mtn_withdrawal') {
      return 'mtn_withdrawal';
    }
    return 'cash'; // Par défaut
  };

  const normalizedPaymentMethod = normalizePaymentMethod(payment?.paymentMethod || payment?.method);

  // Log des données reçues pour débogage
  console.log('🔍 PDFReceipt - Données reçues:', {
    payment: payment,
    class: payment?.class,
    className: payment?.className,
    classLevel: payment?.classLevel,
    studentClass: payment?.studentClass,
    studentData: payment?.studentData,
    studentName: payment?.studentName,
    receiptNumber: payment?.receiptNumber,
    schoolName: payment?.schoolName,
    schoolPhone: payment?.schoolPhone,
    schoolEmail: payment?.schoolEmail
  });

  // Données du reçu avec valeurs par défaut
  const receiptData = {
    schoolName: schoolSettings?.name || payment?.schoolName || 'École',
    studentName: payment?.studentName || 'Non spécifié',
    studentClass: payment?.className || payment?.classLevel || payment?.class || payment?.studentData?.class || 'Non affecté',
    receiptNumber: payment?.receiptNumber || generatedReceiptName || 'N/A',
    paymentDate: formatDate(payment?.paymentDate || payment?.date || new Date().toISOString()),
    paymentTime: formatTime(payment?.paymentTime || payment?.date || new Date().toISOString()),
    amount: payment?.amount || 0,
    paymentMethod: normalizedPaymentMethod,
    amountGiven: payment?.amountGiven || payment?.amount || 0,
    change: payment?.change || 0,
    totalExpected: payment?.totalExpected || payment?.studentData?.totalExpected || 0,
    totalPaid: payment?.totalPaid || payment?.studentData?.totalPaid || 0,
    totalRemaining: payment?.totalRemaining || payment?.studentData?.totalRemaining || 0,
    schoolPhone: schoolSettings?.primaryPhone || payment?.schoolPhone || 'Non configuré',
    schoolEmail: schoolSettings?.primaryEmail || payment?.schoolEmail || 'Non configuré'
  };

  // Log des données finales pour débogage
  console.log('✅ PDFReceipt - Données finales:', {
    schoolName: receiptData.schoolName,
    schoolPhone: receiptData.schoolPhone,
    schoolEmail: receiptData.schoolEmail,
    studentClass: receiptData.studentClass,
    accountantName: accountantName,
    schoolSettings: schoolSettings
  });

  // Gestion d'erreur pour le logo
  const renderWatermark = () => {
    try {
      if (schoolSettings?.logo && schoolSettings.logo.startsWith('data:image/')) {
        return (
          <View style={dynamicStyles.watermarkLogo}>
            <Image 
              src={schoolSettings.logo} 
              style={dynamicStyles.watermarkImage}
              onError={() => {
                console.log('Erreur de chargement du logo filigrane, fallback vers PAYÉ');
              }}
            />
          </View>
        );
      }
    } catch (error) {
      console.log('Erreur lors du rendu du logo filigrane:', error);
    }
    
    return (
      <Text style={dynamicStyles.watermarkText}>
        PAYÉ
      </Text>
    );
  };

  return (
    <Document>
      <Page size="A6" orientation="landscape" style={styles.page}>
        {/* Bordure autour de la page */}
        <View style={dynamicStyles.border} />
        
        {/* Filigrane - Logo de l'école ou "PAYÉ" */}
        {renderWatermark()}
        
        {/* En-tête avec contacts */}
        <View style={dynamicStyles.header}>
          <Text style={dynamicStyles.receiptTitle}>REÇU DE PAIEMENT</Text>
          <Text style={dynamicStyles.schoolName}>{receiptData.schoolName}</Text>
          <View style={dynamicStyles.contactRow}>
              <Text style={dynamicStyles.schoolContact}>Tel: {receiptData.schoolPhone}</Text>
            <Text style={dynamicStyles.schoolContact}>Email: {receiptData.schoolEmail}</Text>
          </View>
        </View>

        {/* Ligne de séparation */}
        <View style={dynamicStyles.separator} />

        {/* Informations élève */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>INFORMATIONS ÉLÈVE</Text>
          <View style={dynamicStyles.infoRow}>
            <Text style={dynamicStyles.infoLabel}>Nom et prénoms:</Text>
            <Text style={dynamicStyles.infoValue}>{receiptData.studentName}</Text>
          </View>
          <View style={dynamicStyles.infoRow}>
            <Text style={dynamicStyles.infoLabel}>Classe:</Text>
            <Text style={dynamicStyles.infoValue}>{receiptData.studentClass}</Text>
          </View>
        </View>

        {/* Ligne de séparation */}
        <View style={dynamicStyles.separator} />

        {/* Layout en deux colonnes pour détails et bilan */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          {/* Colonne gauche - Détails du paiement */}
          <View style={{ width: '48%' }}>
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>DÉTAILS DU PAIEMENT</Text>
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>N° Reçu:</Text>
                <Text style={dynamicStyles.infoValue}>{formatReceiptNameForDisplay(receiptData.receiptNumber)}</Text>
              </View>
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Date:</Text>
                <Text style={dynamicStyles.infoValue}>{receiptData.paymentDate} à {receiptData.paymentTime}</Text>
              </View>
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Montant:</Text>
                <Text style={dynamicStyles.amountValue}>{formatAmount(receiptData.amount)} F CFA</Text>
              </View>
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Méthode:</Text>
                <Text style={dynamicStyles.infoValue}>{receiptData.paymentMethod === 'cash' ? 'Espèces' : 'MoMo MTN'}</Text>
              </View>
              {receiptData.paymentMethod === 'cash' && receiptData.amountGiven && receiptData.amountGiven > 0 && (
                <>
                  <View style={dynamicStyles.infoRow}>
                    <Text style={dynamicStyles.infoLabel}>Somme remise:</Text>
                    <Text style={dynamicStyles.amountValue}>{formatAmount(receiptData.amountGiven)} F CFA</Text>
                  </View>
                  <View style={dynamicStyles.infoRow}>
                    <Text style={dynamicStyles.infoLabel}>Reliquat:</Text>
                    <Text style={dynamicStyles.amountValue}>{formatAmount(receiptData.change)} F CFA</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Colonne droite - Bilan de scolarité */}
          <View style={{ width: '48%' }}>
            <View style={dynamicStyles.section}>
              <Text style={dynamicStyles.sectionTitle}>BILAN DE SCOLARITÉ</Text>
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Total attendu:</Text>
                <Text style={dynamicStyles.amountValue}>{formatAmount(receiptData.totalExpected)} F CFA</Text>
              </View>
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Total versé:</Text>
                <Text style={dynamicStyles.amountValue}>{formatAmount(receiptData.totalPaid + receiptData.amount)} F CFA</Text>
              </View>
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Restant à payer:</Text>
                <Text style={dynamicStyles.amountValue}>{formatAmount(Math.max(0, receiptData.totalRemaining - receiptData.amount))} F CFA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Signature du comptable */}
        <View style={dynamicStyles.signatureSection}>
          <Text style={dynamicStyles.signatureLabel}>Signature du comptable :</Text>
          <View style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <Text style={dynamicStyles.signatureText}>
              {accountantName}
            </Text>
          </View>
        </View>

        {/* Pied de page */}
        <View style={dynamicStyles.footer}>
          <Text style={dynamicStyles.successMessage}>Paiement enregistré avec succès !</Text>
          <Text style={dynamicStyles.thankMessage}>Merci pour votre confiance !</Text>
          <Text style={dynamicStyles.generationDate}>
            Généré par Academia Hub, le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Cachet électronique */}
        <View style={dynamicStyles.electronicStamp}>
          <Text style={dynamicStyles.stampText}>PAYÉ</Text>
          <Text style={dynamicStyles.stampDate}>
            {receiptData.paymentDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
}, (prevProps, nextProps) => {
  // Fonction de comparaison personnalisée pour éviter les re-renders inutiles
  return (
    prevProps.payment?.id === nextProps.payment?.id &&
    prevProps.payment?.studentName === nextProps.payment?.studentName &&
    prevProps.payment?.amount === nextProps.payment?.amount &&
    prevProps.schoolSettings?.primaryColor === nextProps.schoolSettings?.primaryColor &&
    prevProps.schoolSettings?.secondaryColor === nextProps.schoolSettings?.secondaryColor
  );
});

export default PDFReceipt;
