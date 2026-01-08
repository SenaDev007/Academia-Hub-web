import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Loader2 } from 'lucide-react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import PDFReceipt from '../receipts/PDFReceipt';
import { hrService } from '../../services/hrService';
import { generateAutoSequenceReceiptNumber } from '../../utils/receiptNameGenerator';
import { api } from '../../lib/api/client';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    parentName?: string;
    parentPhone?: string;
    address?: string;
    dateOfBirth?: string;
    schoolYear?: string;
    amountGiven?: number;
    change?: number;
    totalExpected?: number;
    totalPaid?: number;
    totalRemaining?: number;
    studentData?: {
      id: string;
      name: string;
      class: string;
      matricule: string;
      parentName: string;
      parentPhone: string;
      address: string;
      dateOfBirth: string;
      schoolYear: string;
      totalExpected: number;
      totalPaid: number;
      totalRemaining: number;
      status: string;
    };
  } | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, payment }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const [accountantInfo, setAccountantInfo] = useState<any>(null);
  const [schoolColors, setSchoolColors] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Charger les paramètres de l'école et les informations du comptable
  React.useEffect(() => {
    const loadData = async () => {
      setIsDataLoaded(false);
      try {
        // Charger les paramètres de l'école
        const settings = await api.school.getSettings();
        setSchoolSettings(settings);
        
        // Extraire les couleurs et le logo de l'école
        setSchoolColors({
          primaryColor: settings?.primaryColor || '#2563eb',
          secondaryColor: settings?.secondaryColor || '#1e40af',
          accentColor: settings?.accentColor || '#3b82f6',
          logo: settings?.logo
        });

        // Charger les informations du comptable
        const schoolId = 'school-1'; // Utiliser l'ID de l'école par défaut
        const personnel = await hrService.getTeachers(schoolId);
        
        // Filtrer pour trouver le comptable ou secrétaire-comptable
        const accountant = personnel.find((person: any) => 
          person.position?.toLowerCase().includes('comptable') || 
          person.position?.toLowerCase().includes('secrétaire-comptable')
        );

        if (accountant) {
          setAccountantInfo({
            name: `${accountant.firstName} ${accountant.lastName}`,
            position: accountant.position || 'Comptable'
          });
        } else {
          // Valeur par défaut si aucun comptable trouvé
          setAccountantInfo({
            name: 'Comptable',
            position: 'Comptable'
          });
        }
        
        // Marquer les données comme chargées
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Valeurs par défaut en cas d'erreur
        setAccountantInfo({
          name: 'Comptable',
          position: 'Comptable'
        });
        setIsDataLoaded(true);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Charger les données de l'élève
  React.useEffect(() => {
    const loadStudentData = async () => {
      if (payment?.studentId) {
        try {
          const result = await api.students.getById(payment.studentId);
          if (result.data) {
            setStudentData(result.data?.data || result.data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données de l\'élève:', error);
        }
      }
    };

    if (isOpen && payment?.studentId) {
      loadStudentData();
    }
  }, [isOpen, payment?.studentId]);

  // Réinitialiser l'état de chargement quand le modal se ferme
  React.useEffect(() => {
    if (!isOpen) {
      setIsDataLoaded(false);
    }
  }, [isOpen]);

  if (!isOpen || !payment) return null;

  // Ajouter un log pour déboguer les données reçues
  console.log('Données reçues dans ReceiptModal:', JSON.parse(JSON.stringify(payment)));
  console.log('Données chargées:', { isDataLoaded, schoolSettings, accountantInfo, schoolColors });

  // Formater la date et l'heure
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
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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

  // Créer un objet de données complet avec le format du reçu WhatsApp
  const receiptData = {
    ...payment,
    // Informations de base
    studentName: payment.studentName || 'Non spécifié',
    class: payment.class || studentData?.class || payment.studentData?.class || 'Non affecté',
    amount: payment.amount || 0,
    date: payment.date || new Date().toISOString(),
    method: payment.method || 'Non spécifié',
    status: payment.status || 'completed',
    
    // Données formatées pour le reçu WhatsApp
    schoolName: schoolSettings?.name || 'École',
    receiptNumber: payment.receiptNumber || generateAutoSequenceReceiptNumber('2025-2026', payment.class || payment.className || 'CI'),
    paymentDate: formatDate(payment.date || new Date().toISOString()),
    paymentTime: formatTime(payment.date || new Date().toISOString()),
    paymentMethod: payment.method === 'cash' ? 'Espèces' : 'MoMo MTN',
    amountGiven: (payment as any).amountGiven || payment.amount || 0,
    change: (payment as any).change || 0,
    
    // Bilan de scolarité
    totalExpected: payment.studentData?.totalExpected || (payment as any).totalExpected || 0,
    totalPaid: payment.studentData?.totalPaid || (payment as any).totalPaid || 0,
    totalRemaining: payment.studentData?.totalRemaining || (payment as any).totalRemaining || 0,
    
    // Contact école
    schoolPhone: schoolSettings?.primaryPhone || 'Non configuré',
    schoolEmail: schoolSettings?.primaryEmail || 'Non configuré',
    
    // Informations du comptable
    accountantName: accountantInfo?.name || 'Comptable',
    accountantPosition: accountantInfo?.position || 'Comptable',
    
    // Autres informations
    parentName: payment.parentName || 'Parent non spécifié',
    parentPhone: payment.parentPhone || 'Non spécifié',
    address: payment.address || 'Non spécifié',
    dateOfBirth: payment.dateOfBirth || 'Non spécifié',
    schoolYear: payment.schoolYear || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
  };

  console.log('Données envoyées à PDFReceipt:', JSON.parse(JSON.stringify(receiptData)));

  // Générer le nom de fichier du reçu
  const generateReceiptFilename = () => {
    if (!receiptData) return 'recu.pdf';
    
    // Récupérer le numéro de reçu (format REC-025026-000-classe)
    const receiptNumber = receiptData.receiptNumber || 'REC-000000-000-UNKNOWN';
    
    // Nettoyer le nom de l'élève pour le nom de fichier
    const cleanStudentName = receiptData.studentName
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .toUpperCase();
    
    return `${receiptNumber}-${cleanStudentName}.pdf`;
  };

  const handlePrint = () => {
    setIsPrinting(true);
    // Laisser le temps au PDF de se charger avant d'imprimer
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 1000);
  };


  return (
    <>
      <style>
        {`
          .pdf-viewer-custom .react-pdf__Toolbar {
            position: relative;
          }
          .pdf-viewer-custom .react-pdf__Toolbar button[title*="Download"],
          .pdf-viewer-custom .react-pdf__Toolbar button[title*="Télécharger"],
          .pdf-viewer-custom .react-pdf__Toolbar button[title*="Print"],
          .pdf-viewer-custom .react-pdf__Toolbar button[title*="Imprimer"],
          .pdf-viewer-custom .react-pdf__Toolbar button[aria-label*="Download"],
          .pdf-viewer-custom .react-pdf__Toolbar button[aria-label*="Print"] {
            display: none !important;
          }
        `}
      </style>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Aperçu du reçu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isPrinting || isDownloading}
            title="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {!isDataLoaded ? (
              <div className="flex items-center justify-center h-96 bg-gray-50">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Chargement des données du reçu...</p>
                </div>
              </div>
            ) : (
              <PDFViewer 
                width="100%" 
                height="500px" 
                className="border-0 pdf-viewer-custom"
                showToolbar={true}
              >
                {receiptData && schoolColors && (
                  <PDFReceipt payment={receiptData} schoolSettings={schoolColors} />
                )}
              </PDFViewer>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={handlePrint}
            disabled={isPrinting || isDownloading || !isDataLoaded}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 ${
              isPrinting || isDownloading || !isDataLoaded ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            {isPrinting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Impression...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </>
            )}
          </button>

          {isDataLoaded && schoolColors ? (
            <PDFDownloadLink
              document={<PDFReceipt payment={receiptData} schoolSettings={schoolColors} />}
              fileName={generateReceiptFilename()}
              onClick={() => {
                setIsDownloading(true);
                // Timeout de sécurité pour réinitialiser l'état après 10 secondes
                setTimeout(() => {
                  setIsDownloading(false);
                }, 10000);
                return true;
              }}
              className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg ${
                isDownloading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {({ loading }) => (
                <>
                  {loading || isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Préparation...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger le PDF
                    </>
                  )}
                </>
              )}
            </PDFDownloadLink>
          ) : (
            <button
              disabled
              className="inline-flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg opacity-50 cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le PDF
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default ReceiptModal;
