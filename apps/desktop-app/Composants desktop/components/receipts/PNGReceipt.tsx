import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { hrService } from '../../services/hrService';
import { formatReceiptNameForDisplay } from '../../utils/receiptNameGenerator';

interface PNGReceiptProps {
  payment: any;
  schoolSettings: any;
}

const PNGReceipt: React.FC<PNGReceiptProps> = ({ payment, schoolSettings }) => {
  // État pour le nom du comptable
  const [accountantName, setAccountantName] = useState('Comptable');
  const [isAccountantLoaded, setIsAccountantLoaded] = useState(false);

  // Récupérer le nom du comptable depuis HR
  useEffect(() => {
    const fetchAccountantName = async () => {
      if (isAccountantLoaded) return;
      
      try {
        const schoolId = schoolSettings?.id || 'school-1';
        const accountantInfo = await hrService.getAccountantInfo(schoolId);
        if (accountantInfo?.name) {
          setAccountantName(accountantInfo.name);
        }
        setIsAccountantLoaded(true);
      } catch (error) {
        console.error('Erreur lors de la récupération du comptable:', error);
        setIsAccountantLoaded(true);
      }
    };

    fetchAccountantName();
  }, [isAccountantLoaded, schoolSettings?.id]);

  // Couleurs dynamiques basées sur les paramètres de l'école
  const primaryColor = schoolSettings?.primaryColor || '#2563eb';
  const secondaryColor = schoolSettings?.secondaryColor || '#1e40af';
  const accentColor = schoolSettings?.accentColor || '#3b82f6';

  // Fonctions de formatage identiques au PDFReceipt
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(/\s/g, '.');
  };

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

  // Normaliser la méthode de paiement comme PDFReceipt
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

  // Données du reçu avec valeurs par défaut (exactement comme PDFReceipt)
  const receiptData = {
    schoolName: schoolSettings?.name || payment?.schoolName || 'École',
    studentName: payment?.studentName || 'Non spécifié',
    studentClass: payment?.className || payment?.classLevel || payment?.class || payment?.studentData?.class || 'Non affecté',
    receiptNumber: payment?.receiptNumber || 'N/A',
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

  // Styles identiques au PDFReceipt
  const styles = StyleSheet.create({
    container: {
      width: 420,
      height: 297,
      backgroundColor: '#ffffff',
      padding: 20,
      fontFamily: 'Arial',
      fontSize: 5,
      lineHeight: 1.1,
    },
    border: {
      position: 'absolute',
      top: 15,
      left: 15,
      right: 15,
      bottom: 15,
      borderWidth: 2,
      borderColor: primaryColor,
    },
    watermarkLogo: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.15,
      zIndex: -1,
    },
    watermarkImage: {
      width: 150,
      height: 150,
      resizeMode: 'contain',
    },
    watermarkText: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -50 }, { translateY: -50 }, { rotate: '-45deg' }],
      fontSize: 30,
      color: '#dc2626',
      opacity: 0.3,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      letterSpacing: 3,
      textAlign: 'center',
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
    section: {
      marginBottom: 3,
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
    signatureSection: {
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: secondaryColor,
      borderStyle: 'dashed',
      paddingTop: 10,
      alignItems: 'center',
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
    electronicStamp: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 120,
      height: 50,
      borderWidth: 4,
      borderColor: '#dc2626',
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      opacity: 0.95,
      transform: [{ rotate: '-2deg' }],
      shadowColor: '#000',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 8,
    },
    innerBorder: {
      position: 'absolute',
      top: 8,
      left: 8,
      right: 8,
      bottom: 8,
      borderWidth: 2,
      borderColor: '#dc2626',
      borderRadius: 4,
    },
    stampText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#dc2626',
      textAlign: 'center',
      lineHeight: 20,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      letterSpacing: 1,
    },
    stampDate: {
      fontSize: 5,
      color: '#dc2626',
      textAlign: 'center',
      marginTop: 2,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
      letterSpacing: 0.5,
    },
    footer: {
      marginTop: 6,
      alignItems: 'center',
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
  });

  // Gestion d'erreur pour le logo (identique au PDFReceipt)
  const renderWatermark = () => {
    try {
      if (schoolSettings?.logo && schoolSettings.logo.startsWith('data:image/')) {
        return (
          <View style={styles.watermarkLogo}>
            <Image 
              source={{ uri: schoolSettings.logo }} 
              style={styles.watermarkImage}
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
      <Text style={styles.watermarkText}>
        PAYÉ
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Bordure autour de la page */}
      <View style={styles.border} />
      
      {/* Filigrane - Logo de l'école ou "PAYÉ" */}
      {renderWatermark()}
      
      {/* En-tête avec contacts */}
      <View style={styles.header}>
        <Text style={styles.receiptTitle}>REÇU DE PAIEMENT</Text>
        <Text style={styles.schoolName}>{receiptData.schoolName}</Text>
        <View style={styles.contactRow}>
          <Text style={styles.schoolContact}>Tel: {receiptData.schoolPhone}</Text>
          <Text style={styles.schoolContact}>Email: {receiptData.schoolEmail}</Text>
        </View>
      </View>

      {/* Ligne de séparation */}
      <View style={styles.separator} />

      {/* Informations élève */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMATIONS ÉLÈVE</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nom et prénoms:</Text>
          <Text style={styles.infoValue}>{receiptData.studentName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Classe:</Text>
          <Text style={styles.infoValue}>{receiptData.studentClass}</Text>
        </View>
      </View>

      {/* Ligne de séparation */}
      <View style={styles.separator} />

      {/* Layout en deux colonnes pour détails et bilan */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        {/* Colonne gauche - Détails du paiement */}
        <View style={{ width: '48%' }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DÉTAILS DU PAIEMENT</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>N° Reçu:</Text>
              <Text style={styles.infoValue}>{formatReceiptNameForDisplay(receiptData.receiptNumber)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{receiptData.paymentDate} à {receiptData.paymentTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Montant:</Text>
              <Text style={styles.amountValue}>{formatAmount(receiptData.amount)} F CFA</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Méthode:</Text>
              <Text style={styles.infoValue}>{receiptData.paymentMethod === 'cash' ? 'Espèces' : 'MoMo MTN'}</Text>
            </View>
            {receiptData.paymentMethod === 'cash' && receiptData.amountGiven && receiptData.amountGiven > 0 && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Somme remise:</Text>
                  <Text style={styles.amountValue}>{formatAmount(receiptData.amountGiven)} F CFA</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Reliquat:</Text>
                  <Text style={styles.amountValue}>{formatAmount(receiptData.change)} F CFA</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Colonne droite - Bilan de scolarité */}
        <View style={{ width: '48%' }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BILAN DE SCOLARITÉ</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total attendu:</Text>
              <Text style={styles.amountValue}>{formatAmount(receiptData.totalExpected)} F CFA</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total versé:</Text>
              <Text style={styles.amountValue}>{formatAmount(receiptData.totalPaid + receiptData.amount)} F CFA</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Restant à payer:</Text>
              <Text style={styles.amountValue}>{formatAmount(Math.max(0, receiptData.totalRemaining - receiptData.amount))} F CFA</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Signature du comptable */}
      <View style={styles.signatureSection}>
        <Text style={styles.signatureLabel}>Signature du comptable :</Text>
        <View style={{ alignItems: 'center', marginBottom: 4 }}>
          <Text style={styles.signatureText}>
            {accountantName}
          </Text>
        </View>
      </View>

      {/* Cachet électronique */}
      <View style={styles.electronicStamp}>
        <View style={styles.innerBorder} />
        <Text style={styles.stampText}>PAYÉ</Text>
        <Text style={styles.stampDate}>{receiptData.paymentDate}</Text>
      </View>

      {/* Pied de page */}
      <View style={styles.footer}>
        <Text style={styles.successMessage}>Paiement enregistré avec succès !</Text>
        <Text style={styles.thankMessage}>Merci pour votre confiance !</Text>
        <Text style={styles.generationDate}>
          Généré par Academia Hub, le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

export default PNGReceipt;