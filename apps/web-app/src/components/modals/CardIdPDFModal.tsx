import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { X, Download, Printer } from 'lucide-react';
import PDFStudentCards from '../receipts/PDFStudentCards';

interface CardIdPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: {
    students: Array<{
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
    cardType: string;
    includePhoto: boolean;
    includeQRCode: boolean;
    includeBarcode: boolean;
  };
  schoolSettings?: {
    name?: string;
    address?: string;
    primaryPhone?: string;
    primaryEmail?: string;
    website?: string;
    logo?: string;
  };
}

const CardIdPDFModal: React.FC<CardIdPDFModalProps> = ({
  isOpen,
  onClose,
  cardData,
  schoolSettings
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    console.log('Impression des cartes...');
    window.print();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      console.log('Téléchargement du PDF des cartes...');
      // Le téléchargement sera géré par PDFDownloadLink
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Génération de Cartes ID</h2>
                <p className="text-blue-100 text-sm">
                  {cardData.students.length === 1 
                    ? `Carte pour ${cardData.students[0].firstName} ${cardData.students[0].lastName}`
                    : `${cardData.students.length} cartes à générer`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Barre d'outils */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Type: {cardData.cardType === 'student' ? 'Carte d\'élève' : 
                         cardData.cardType === 'library' ? 'Carte de bibliothèque' :
                         cardData.cardType === 'canteen' ? 'Carte de cantine' :
                         cardData.cardType === 'transport' ? 'Carte de transport' : 'Carte d\'identité'}
                </span>
                {cardData.students.length === 1 && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Élève: {cardData.students[0].firstName} {cardData.students[0].lastName} - {cardData.students[0].className}
                  </span>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Options: {cardData.includePhoto ? 'Photo ' : ''}
                          {cardData.includeQRCode ? 'QR Code ' : ''}
                          {cardData.includeBarcode ? 'Code-barres' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer</span>
                </button>
                <PDFDownloadLink
                  document={
                    <PDFStudentCards
                      studentsData={cardData.students}
                      schoolSettings={schoolSettings}
                      cardType={cardData.cardType}
                      includePhoto={cardData.includePhoto}
                      includeQRCode={cardData.includeQRCode}
                      includeBarcode={cardData.includeBarcode}
                    />
                  }
                  fileName={
                    cardData.students.length === 1 
                      ? `carte-${cardData.students[0].firstName.toLowerCase()}-${cardData.students[0].lastName.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
                      : `cartes-id-${new Date().toISOString().split('T')[0]}.pdf`
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {({ blob, url, loading, error }) => (
                    <button
                      onClick={handleDownloadPDF}
                      disabled={loading || isDownloading}
                      className="flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {loading || isDownloading ? 'Génération...' : 'Télécharger'}
                      </span>
                    </button>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          </div>

          {/* Aperçu PDF */}
          <div className="flex-1 overflow-hidden">
            <PDFViewer
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            >
              <PDFStudentCards
                studentsData={cardData.students}
                schoolSettings={schoolSettings}
                cardType={cardData.cardType}
                includePhoto={cardData.includePhoto}
                includeQRCode={cardData.includeQRCode}
                includeBarcode={cardData.includeBarcode}
              />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardIdPDFModal;
