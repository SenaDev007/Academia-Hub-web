import React, { useState } from 'react';
import { X, Download, Printer, FileText, Calendar, User, DollarSign } from 'lucide-react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import PDFRevenueReport from '../receipts/PDFRevenueReport';

interface RevenueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenueData: any[];
  revenueStats: any;
  selectedYear: any;
  selectedPeriod: string;
  schoolInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const RevenueReportModal: React.FC<RevenueReportModalProps> = ({
  isOpen,
  onClose,
  revenueData,
  revenueStats,
  selectedYear,
  selectedPeriod,
  schoolInfo
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const getPeriodText = (period: string) => {
    const periodMap: { [key: string]: string } = {
      'all': 'Toutes les périodes',
      'current': 'Mois en cours',
      'last': 'Mois précédent',
      'quarter': 'Trimestre',
      'year': 'Année en cours'
    };
    return periodMap[period] || period;
  };

  const reportData = {
    title: 'Rapport des Recettes',
    period: getPeriodText(selectedPeriod),
    academicYear: selectedYear?.name || 'Non spécifiée',
    generatedDate: new Date().toISOString(),
    revenues: revenueData.map(revenue => ({
      id: revenue.id,
      reference: revenue.reference,
      description: revenue.description,
      studentName: revenue.studentName,
      className: revenue.className,
      type: revenue.type,
      amount: revenue.amount,
      date: revenue.date,
      paymentMethod: revenue.paymentMethod,
      status: revenue.status
    })),
    stats: {
      total: revenueStats?.total || 0,
      completed: revenueStats?.completed || 0,
      pending: revenueStats?.pending || 0,
      count: revenueStats?.count || 0
    }
  };

  const handleDownload = () => {
    setIsGenerating(true);
    // Le téléchargement se déclenche automatiquement via PDFDownloadLink
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handlePrint = () => {
    setIsGenerating(true);
    // Ouvrir le PDF dans une nouvelle fenêtre pour l'impression
    const pdfWindow = window.open('', '_blank');
    if (pdfWindow) {
      pdfWindow.document.write(`
        <html>
          <head>
            <title>Rapport des Recettes</title>
          </head>
          <body>
            <div id="pdf-container"></div>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@react-pdf/renderer@3.1.14/dist/react-pdf.browser.umd.js"></script>
          </body>
        </html>
      `);
    }
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Génération du Rapport des Recettes</h3>
                <p className="text-sm text-gray-600">Aperçu et téléchargement du rapport PDF</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Informations du rapport */}
          <div className="w-80 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Informations générales */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-green-600" />
                  Informations du Rapport
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Période</label>
                    <p className="text-sm text-gray-900">{getPeriodText(selectedPeriod)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Année Scolaire</label>
                    <p className="text-sm text-gray-900">{selectedYear?.name || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date de Génération</label>
                    <p className="text-sm text-gray-900">{new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Statistiques
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Général:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.stats.total.toLocaleString()} F CFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Encaissées:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {reportData.stats.completed.toLocaleString()} F CFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">En Attente:</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {reportData.stats.pending.toLocaleString()} F CFA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nombre Total:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {reportData.stats.count} recette{reportData.stats.count > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
                <div className="space-y-3">
                  <PDFDownloadLink
                    document={<PDFRevenueReport schoolInfo={schoolInfo} reportData={reportData} />}
                    fileName={`rapport-recettes-${selectedYear?.name || 'general'}-${new Date().toISOString().split('T')[0]}.pdf`}
                  >
                    {({ blob, url, loading, error }) => (
                      <button
                        onClick={handleDownload}
                        disabled={loading || isGenerating}
                        className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {loading || isGenerating ? 'Génération...' : 'Télécharger PDF'}
                      </button>
                    )}
                  </PDFDownloadLink>

                  <button
                    onClick={handlePrint}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Génération...' : 'Imprimer'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal - Aperçu PDF */}
          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-full">
                <PDFViewer width="100%" height="100%">
                  <PDFRevenueReport schoolInfo={schoolInfo} reportData={reportData} />
                </PDFViewer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReportModal;
