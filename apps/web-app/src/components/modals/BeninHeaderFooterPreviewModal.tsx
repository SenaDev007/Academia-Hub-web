import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { HeaderConfig, FooterConfig } from '../../types/documentSettings';
import BeninOfficialHeader from '../templates/BeninOfficialHeader';
import BeninOfficialFooter from '../templates/BeninOfficialFooter';

interface BeninHeaderFooterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerConfig?: HeaderConfig;
  footerConfig?: FooterConfig;
  title?: string;
}

const BeninHeaderFooterPreviewModal: React.FC<BeninHeaderFooterPreviewModalProps> = ({
  isOpen,
  onClose,
  headerConfig,
  footerConfig,
  title = 'Aperçu du document officiel'
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implémenter le téléchargement
    console.log('Télécharger le document');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Imprimer"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Aperçu du document */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            {/* En-tête */}
            {headerConfig && (
              <BeninOfficialHeader
                headerConfig={headerConfig}
                showLogos={true}
                className="mb-8"
              />
            )}

            {/* Contenu du document (exemple) */}
            <div className="min-h-[400px] space-y-4">
              <div className="text-center text-gray-500 italic">
                [Contenu du document - Bulletin de notes, Certificat, etc.]
              </div>
              
              {/* Exemple de contenu pour un bulletin */}
              {headerConfig?.type === 'bulletin' && (
                <div className="space-y-4">
                  <div className="text-center font-semibold text-lg">
                    BULLETIN DE NOTES - TRIMESTRE 1
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    Élève: <span className="font-medium">Jean KOUAGOU</span><br />
                    Classe: <span className="font-medium">6ème A</span><br />
                    Année scolaire: <span className="font-medium">2024-2025</span>
                  </div>
                  
                  <div className="mt-6">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left">Matières</th>
                          <th className="border border-gray-300 px-3 py-2 text-center">Notes</th>
                          <th className="border border-gray-300 px-3 py-2 text-center">Coeff.</th>
                          <th className="border border-gray-300 px-3 py-2 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2">Mathématiques</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">15/20</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">3</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">45</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2">Français</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">12/20</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">3</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">36</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2">Histoire-Géographie</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">14/20</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">2</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">28</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Exemple de contenu pour un certificat */}
              {headerConfig?.type === 'certificat' && (
                <div className="space-y-4">
                  <div className="text-center font-semibold text-lg">
                    CERTIFICAT DE SCOLARITÉ
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    L'élève <span className="font-medium">Jean KOUAGOU</span><br />
                    Né(e) le <span className="font-medium">15 mars 2010</span> à <span className="font-medium">Cotonou</span><br />
                    A fréquenté la classe de <span className="font-medium">6ème A</span> pendant l'année scolaire <span className="font-medium">2024-2025</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pied de page */}
            {footerConfig && (
              <BeninOfficialFooter
                footerConfig={footerConfig}
                className="mt-8"
              />
            )}
          </div>

          {/* Informations sur le template */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Informations du template</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {headerConfig && (
                <div>
                  <strong>En-tête:</strong> {headerConfig.name} ({headerConfig.type})
                </div>
              )}
              {footerConfig && (
                <div>
                  <strong>Pied de page:</strong> {footerConfig.name} ({footerConfig.type})
                </div>
              )}
              <div>
                <strong>Niveau:</strong> {
                  headerConfig?.slogan?.includes('Maternel et Primaire') ? 'Maternelle/Primaire' :
                  headerConfig?.slogan?.includes('Secondaire') ? 'Secondaire' : 'Non spécifié'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeninHeaderFooterPreviewModal;
