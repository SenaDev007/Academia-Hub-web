import React, { useState } from 'react';
import { Download, FileText, Calendar, User, School, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { CahierJournalEntry } from '../types';
import { pdfService } from '../../../../services/pdfService';
import { useNotification } from '../../../../hooks/useNotification';

interface ExportPDFProps {
  entries: CahierJournalEntry[];
  selectedEntries?: string[];
  schoolInfo: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    director?: string;
  };
  onClose: () => void;
}

interface ExportConfig {
  format: 'A4' | 'A5' | 'letter';
  orientation: 'portrait' | 'landscape';
  dateRange: {
    start: string;
    end: string;
  };
  includeDetails: {
    objectifs: boolean;
    competences: boolean;
    deroulement: boolean;
    supports: boolean;
    evaluation: boolean;
    observations: boolean;
  };
  template: 'standard' | 'official' | 'minimal';
  quality: 'high' | 'medium' | 'low';
  includeSignature: boolean;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const ExportPDF: React.FC<ExportPDFProps> = ({ entries, selectedEntries, schoolInfo, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [config, setConfig] = useState<ExportConfig>({
    format: 'A4',
    orientation: 'portrait',
    dateRange: {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    includeDetails: {
      objectifs: true,
      competences: true,
      deroulement: true,
      supports: true,
      evaluation: true,
      observations: false
    },
    template: 'standard',
    quality: 'high',
    includeSignature: true,
    margins: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    }
  });

  const { showNotification } = useNotification();

  const handleExport = async (action: 'download' | 'preview' | 'print') => {
    setLoading(true);
    
    try {
      // Filtrer les entrées selon la période
      let filteredEntries = entries;

      if (selectedEntries && selectedEntries.length > 0) {
        filteredEntries = entries.filter(entry => selectedEntries.includes(entry.id));
      }

      if (config.format !== 'custom') {
        const start = new Date(config.dateRange.start);
        const end = new Date(config.dateRange.end);
        filteredEntries = filteredEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });
      }

      if (filteredEntries.length === 0) {
        showNotification({
          type: 'warning',
          message: 'Aucune entrée trouvée pour la période sélectionnée'
        });
        return;
      }

      const pdfData = await pdfService.generateCahierJournal({
        entries: filteredEntries,
        schoolInfo,
        period: config.dateRange,
        format: config.template === 'individual' ? 'individual' : 'monthly'
      }, {
        format: config.format,
        orientation: config.orientation,
        margins: config.margins,
        quality: config.quality,
        includeHeader: true,
        includeFooter: true
      });

      const filename = `cahier-journal-${new Date().toISOString().split('T')[0]}.pdf`;

      switch (action) {
        case 'download':
          const filePath = await pdfService.savePDF(pdfData, filename, 'cahier-journal');
          showNotification({
            type: 'success',
            message: `Cahier journal exporté avec succès: ${filePath}`
          });
          break;
          
        case 'preview':
          await pdfService.previewPDF(pdfData, filename);
          break;
          
        case 'print':
          await pdfService.printPDF(pdfData, filename);
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      showNotification({
        type: 'error',
        message: `Erreur lors de l'export: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates: Partial<ExportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateIncludeDetails = (key: keyof ExportConfig['includeDetails'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      includeDetails: {
        ...prev.includeDetails,
        [key]: value
      }
    }));
  };

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const start = new Date(config.dateRange.start);
    const end = new Date(config.dateRange.end);
    return entryDate >= start && entryDate <= end;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="text-blue-600" />
                Exporter en PDF
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredEntries.length} séance(s) sélectionnée(s) pour l'export
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar avec onglets */}
          <div className="w-64 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => updateConfig({ format: 'A4', orientation: 'portrait' })}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    config.format === 'A4' && config.orientation === 'portrait'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Calendar size={16} className="inline mr-2" />
                  Format A4 Portrait
                </button>
                <button
                  onClick={() => updateConfig({ format: 'A5', orientation: 'landscape' })}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    config.format === 'A5' && config.orientation === 'landscape'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText size={16} className="inline mr-2" />
                  Format A5 Paysage
                </button>
                <button
                  onClick={() => updateConfig({ format: 'letter', orientation: 'portrait' })}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    config.format === 'letter' && config.orientation === 'portrait'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={16} className="inline mr-2" />
                  Format Lettre Portrait
                </button>
              </nav>
            </div>

            {/* Aperçu des séances */}
            <div className="p-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Séances à exporter</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filteredEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="text-sm p-2 bg-white rounded border">
                    <div className="font-medium text-gray-900">{entry.matiere}</div>
                    <div className="text-gray-600">{entry.classe} - {new Date(entry.date).toLocaleDateString('fr-FR')}</div>
                  </div>
                ))}
                {filteredEntries.length > 5 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{filteredEntries.length - 5} autres séances
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Période</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
                    <input
                      type="date"
                      value={config.dateRange.start}
                      onChange={(e) => updateConfig({
                        dateRange: { ...config.dateRange, start: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
                    <input
                      type="date"
                      value={config.dateRange.end}
                      onChange={(e) => updateConfig({
                        dateRange: { ...config.dateRange, end: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails à inclure</h3>
                <div className="space-y-3">
                  {Object.entries(config.includeDetails).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateIncludeDetails(key as any, e.target.checked)}
                        className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 capitalize">
                        {key === 'objectifs' ? 'Objectifs pédagogiques' :
                         key === 'competences' ? 'Compétences visées' :
                         key === 'deroulement' ? 'Déroulement de la séance' :
                         key === 'supports' ? 'Supports et matériels' :
                         key === 'evaluation' ? 'Modalités d\'évaluation' :
                         'Observations et adaptations'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Options supplémentaires</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.includeSignature}
                      onChange={(e) => updateConfig({ includeSignature: e.target.checked })}
                      className="mr-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Espace pour signature</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle size={16} className="text-green-500" />
              Configuration prête pour l'export
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleExport('download')}
                disabled={filteredEntries.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Exporter PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPDF;