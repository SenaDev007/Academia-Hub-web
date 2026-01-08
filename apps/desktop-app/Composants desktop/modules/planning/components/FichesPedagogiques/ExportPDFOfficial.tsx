import React, { useState } from 'react';
import { Download, FileText, Printer, Share2, Settings, Eye } from 'lucide-react';
import { pdfService } from '../../../../services/pdfService';

const ExportPDFOfficial = ({ fiche, onExport }) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'officiel',
    includeCommentaires: false,
    includeHistorique: false,
    includeAnalyseAPC: true,
    qualite: 'haute',
    orientation: 'portrait',
    marges: 'normales'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const formatsDisponibles = [
    {
      id: 'officiel',
      nom: 'Format officiel MEMP',
      description: 'Format standardisé conforme aux directives du Ministère',
      icon: FileText
    },
    {
      id: 'simplifie',
      nom: 'Format simplifié',
      description: 'Version allégée pour usage quotidien',
      icon: FileText
    },
    {
      id: 'complet',
      nom: 'Format complet',
      description: 'Inclut tous les détails et analyses',
      icon: FileText
    },
    {
      id: 'presentation',
      nom: 'Format présentation',
      description: 'Optimisé pour projection et formation',
      icon: Printer
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const pdfData = await pdfService.generatePedagogicalSheet(fiche, {
        format: exportOptions.format,
        orientation: exportOptions.orientation,
        quality: exportOptions.qualite,
        margins: {
          top: exportOptions.marges === 'wide' ? 30 : exportOptions.marges === 'narrow' ? 10 : 20,
          bottom: exportOptions.marges === 'wide' ? 30 : exportOptions.marges === 'narrow' ? 10 : 20,
          left: exportOptions.marges === 'wide' ? 30 : exportOptions.marges === 'narrow' ? 10 : 20,
          right: exportOptions.marges === 'wide' ? 30 : exportOptions.marges === 'narrow' ? 10 : 20
        },
        includeHeader: true,
        includeFooter: true
      });

      const filename = `fiche_${fiche.saNumero}_${fiche.classe}_${fiche.matiere.replace(/\s+/g, '_')}.pdf`;

      const filePath = await pdfService.savePDF(pdfData, filename, 'fiches-pedagogiques');
      
      onExport({
        fiche,
        options: exportOptions,
        timestamp: new Date().toISOString(),
        filename: filePath
      });
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderPreview = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Aperçu avant export</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Simulation de l'aperçu PDF */}
          <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold">RÉPUBLIQUE DU BÉNIN</h1>
              <p className="text-sm">Ministère de l'Enseignement Maternel et Primaire</p>
              <h2 className="text-lg font-bold mt-4">FICHE PÉDAGOGIQUE</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mb-8 text-sm">
              <div className="space-y-2">
                <div className="flex border-b border-black">
                  <span className="font-medium w-20">SA N° :</span>
                  <span className="flex-1 px-2">{fiche.saNumero}</span>
                </div>
                <div className="flex border-b border-black">
                  <span className="font-medium w-20">Date :</span>
                  <span className="flex-1 px-2">{fiche.date}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex border-b border-black">
                  <span className="font-medium w-24">SÉQUENCE N° :</span>
                  <span className="flex-1 px-2">{fiche.sequenceNumero}</span>
                </div>
                <div className="flex border-b border-black">
                  <span className="font-medium w-24">Durée :</span>
                  <span className="flex-1 px-2">{fiche.duree} min</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex border-b border-black">
                  <span className="font-medium w-16">Classe :</span>
                  <span className="flex-1 px-2">{fiche.classe}</span>
                </div>
                <div className="flex border-b border-black">
                  <span className="font-medium w-16">Matière :</span>
                  <span className="flex-1 px-2">{fiche.matiere}</span>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <div className="font-bold">TITRE :</div>
              <div className="border border-black p-4 mt-2">
                {fiche.titre}
              </div>
            </div>
            
            <div className="text-sm text-gray-600 text-center">
              [Aperçu partiel - Le document complet sera généré lors de l'export]
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={() => setShowPreview(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Fermer
          </button>
          <button
            onClick={() => {
              setShowPreview(false);
              handleExport();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Confirmer l'export
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export PDF Officiel
        </h3>
      </div>

      {/* Sélection du format */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium mb-4">Format d'export</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {formatsDisponibles.map(format => {
            const Icon = format.icon;
            
            return (
              <div
                key={format.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  exportOptions.format === format.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setExportOptions({...exportOptions, format: format.id})}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">{format.nom}</div>
                    <div className="text-sm text-gray-600 mt-1">{format.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Options d'export */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Options d'export
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qualité
              </label>
              <select
                value={exportOptions.qualite}
                onChange={(e) => setExportOptions({...exportOptions, qualite: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="haute">Haute qualité (impression)</option>
                <option value="moyenne">Qualité moyenne (partage)</option>
                <option value="basse">Basse qualité (aperçu)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Orientation
              </label>
              <select
                value={exportOptions.orientation}
                onChange={(e) => setExportOptions({...exportOptions, orientation: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="portrait">Portrait</option>
                <option value="paysage">Paysage</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marges
            </label>
            <select
              value={exportOptions.marges}
              onChange={(e) => setExportOptions({...exportOptions, marges: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="normales">Marges normales (2.5cm)</option>
              <option value="reduites">Marges réduites (1.5cm)</option>
              <option value="larges">Marges larges (3.5cm)</option>
            </select>
          </div>
          
          <div className="space-y-3">
            <h5 className="font-medium text-sm">Contenu à inclure</h5>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAnalyseAPC}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeAnalyseAPC: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm">Inclure l'analyse de conformité APC</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeCommentaires}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeCommentaires: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm">Inclure les commentaires de validation</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeHistorique}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    includeHistorique: e.target.checked
                  })}
                  className="rounded"
                />
                <span className="text-sm">Inclure l'historique des modifications</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Informations sur le fichier */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Informations du fichier</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Nom du fichier:</span> fiche_{fiche.saNumero}_{fiche.classe}_{fiche.matiere.replace(/\s+/g, '_')}.pdf</p>
          <p><span className="font-medium">Format:</span> {formatsDisponibles.find(f => f.id === exportOptions.format)?.nom}</p>
          <p><span className="font-medium">Taille estimée:</span> {
            exportOptions.qualite === 'haute' ? '2-3 MB' :
            exportOptions.qualite === 'moyenne' ? '1-2 MB' : '500 KB - 1 MB'
          }</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <Eye className="w-4 h-4" />
          Aperçu
        </button>
        
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Génération en cours...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Exporter en PDF
            </>
          )}
        </button>
        
        <button
          onClick={() => {/* Logique de partage */}}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Share2 className="w-4 h-4" />
          Partager
        </button>
      </div>

      {/* Conseils d'export */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Conseils pour l'export</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Utilisez la haute qualité pour l'impression officielle</p>
          <p>• Le format officiel MEMP est requis pour les soumissions administratives</p>
          <p>• Incluez l'analyse APC pour démontrer la conformité</p>
          <p>• Vérifiez l'aperçu avant l'export final</p>
        </div>
      </div>

      {showPreview && renderPreview()}
    </div>
  );
};

export default ExportPDFOfficial;