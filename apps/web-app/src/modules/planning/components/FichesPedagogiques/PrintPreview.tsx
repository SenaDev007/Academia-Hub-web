import React, { useState } from 'react';
import { Printer, Eye, Settings, Download } from 'lucide-react';

const PrintPreview = ({ fiche, onPrint }) => {
  const [printOptions, setPrintOptions] = useState({
    format: 'A4',
    orientation: 'portrait',
    marges: 'normales',
    couleur: true,
    recto_verso: false,
    copies: 1,
    pages: 'toutes'
  });

  const [showPreview, setShowPreview] = useState(true);

  const handlePrint = () => {
    const printData = {
      fiche,
      options: printOptions,
      timestamp: new Date().toISOString()
    };
    
    onPrint(printData);
    
    // Ouvrir la boîte de dialogue d'impression du navigateur
    window.print();
  };

  const renderFichePreview = () => (
    <div className="bg-white shadow-lg mx-auto" style={{ 
      width: printOptions.format === 'A4' ? '210mm' : '297mm',
      minHeight: printOptions.format === 'A4' ? '297mm' : '210mm',
      transform: 'scale(0.7)',
      transformOrigin: 'top center'
    }}>
      <div className="p-8">
        {/* En-tête officiel */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold">RÉPUBLIQUE DU BÉNIN</h1>
          <p className="text-sm">Ministère de l'Enseignement Maternel et Primaire</p>
          <p className="text-sm">Direction Départementale de l'Enseignement Maternel et Primaire</p>
          <h2 className="text-lg font-bold mt-4 underline">FICHE PÉDAGOGIQUE</h2>
        </div>
        
        {/* Informations générales */}
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
            <div className="flex border-b border-black">
              <span className="font-medium w-20">Durée :</span>
              <span className="flex-1 px-2">{fiche.duree} min</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex border-b border-black">
              <span className="font-medium w-24">SÉQUENCE N° :</span>
              <span className="flex-1 px-2">{fiche.sequenceNumero}</span>
            </div>
            <div className="flex border-b border-black">
              <span className="font-medium w-24">Cours :</span>
              <span className="flex-1 px-2">{fiche.cours}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex border-b border-black">
              <span className="font-medium w-16">Classe :</span>
              <span className="flex-1 px-2">{fiche.classe}</span>
            </div>
            <div className="flex border-b border-black">
              <span className="font-medium w-16">Enseignant :</span>
              <span className="flex-1 px-2">{fiche.enseignant}</span>
            </div>
          </div>
        </div>
        
        {/* Titre */}
        <div className="text-center mb-8">
          <div className="font-bold text-lg">TITRE :</div>
          <div className="border border-black p-4 mt-2 min-h-[60px] flex items-center justify-center">
            {fiche.titre}
          </div>
        </div>
        
        {/* Section I - Éléments de planification */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-center mb-6 underline">I - ÉLÉMENTS DE PLANIFICATION</h2>
          
          <div className="space-y-6 text-sm">
            {/* Compétences */}
            <div>
              <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">1. Compétences</h3>
              <div className="space-y-2">
                {(fiche.competences || []).map((comp, index) => (
                  <div key={index} className="flex">
                    <span className="font-medium w-32 capitalize">{comp.type} :</span>
                    <span className="flex-1">{comp.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Objectifs spécifiques */}
            <div>
              <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">2. Objectifs spécifiques</h3>
              <div className="space-y-1">
                {(fiche.objectifsSpecifiques || []).map((obj, index) => (
                  <div key={index}>• {obj.description}</div>
                ))}
              </div>
            </div>

            {/* Prérequis */}
            <div>
              <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">3. Prérequis</h3>
              <div className="space-y-1">
                {(fiche.prerequis || []).map((req, index) => (
                  <div key={index}>• {req.description}</div>
                ))}
              </div>
            </div>

            {/* Matériel didactique */}
            <div>
              <h3 className="font-semibold mb-3 pb-1 border-b border-gray-300">4. Matériel didactique</h3>
              <div className="grid grid-cols-2 gap-4">
                {(fiche.materielDidactique || []).map((mat, index) => (
                  <div key={index} className="flex">
                    <span className="flex-1">{mat.nom}</span>
                    <span className="text-gray-600">({mat.quantite})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Section II - Déroulement */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-center mb-6 underline">II - DÉROULEMENT</h2>
          
          <div className="border border-black">
            <div className="bg-gray-100 grid grid-cols-12 border-b border-black">
              <div className="col-span-1 p-3 border-r border-black font-semibold text-center">N°</div>
              <div className="col-span-6 p-3 border-r border-black font-semibold text-center">Consignes</div>
              <div className="col-span-5 p-3 font-semibold text-center">Résultats attendus</div>
            </div>
            
            {Object.entries(fiche.deroulement || {}).map(([phase, data], index) => (
              <div key={phase} className="grid grid-cols-12 border-b border-black last:border-b-0 min-h-[100px]">
                <div className="col-span-1 p-3 border-r border-black text-center bg-gray-50">
                  <div className="font-semibold">{index + 1}</div>
                  <div className="text-xs text-gray-600 mt-1">{data.duree}min</div>
                </div>
                <div className="col-span-6 p-3 border-r border-black">
                  <div className="font-semibold text-sm mb-2 capitalize">{phase}</div>
                  <div className="text-sm text-justify">{data.consignes}</div>
                </div>
                <div className="col-span-5 p-3">
                  <div className="text-sm text-justify">{data.resultats}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pied de page */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>Fiche générée le {new Date().toLocaleDateString()} - Academia Hub</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Aperçu avant impression
        </h3>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showPreview 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Masquer aperçu' : 'Voir aperçu'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Options d'impression */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Options d'impression
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format papier
              </label>
              <select
                value={printOptions.format}
                onChange={(e) => setPrintOptions({...printOptions, format: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="A3">A3 (297 × 420 mm)</option>
                <option value="Letter">Letter (216 × 279 mm)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientation
              </label>
              <select
                value={printOptions.orientation}
                onChange={(e) => setPrintOptions({...printOptions, orientation: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="portrait">Portrait</option>
                <option value="paysage">Paysage</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marges
              </label>
              <select
                value={printOptions.marges}
                onChange={(e) => setPrintOptions({...printOptions, marges: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="normales">Normales (2.5cm)</option>
                <option value="reduites">Réduites (1.5cm)</option>
                <option value="larges">Larges (3.5cm)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de copies
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={printOptions.copies}
                onChange={(e) => setPrintOptions({...printOptions, copies: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={printOptions.couleur}
                  onChange={(e) => setPrintOptions({...printOptions, couleur: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Impression couleur</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={printOptions.recto_verso}
                  onChange={(e) => setPrintOptions({...printOptions, recto_verso: e.target.checked})}
                  className="rounded"
                />
                <span className="text-sm">Recto-verso</span>
              </label>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        <div className="col-span-3">
          {showPreview ? (
            <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-[800px]">
              <div className="text-center mb-4">
                <h4 className="font-medium">Aperçu de la fiche pédagogique</h4>
                <p className="text-sm text-gray-600">
                  Format {printOptions.format} - {printOptions.orientation}
                </p>
              </div>
              
              {renderFichePreview()}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Printer className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Aperçu masqué</h4>
              <p className="text-gray-600 mb-4">
                Cliquez sur "Voir aperçu" pour visualiser la fiche avant impression
              </p>
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Voir l'aperçu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Informations d'impression */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Conseils d'impression</h4>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>• Utilisez du papier de qualité pour les documents officiels</p>
          <p>• Vérifiez que votre imprimante est configurée correctement</p>
          <p>• L'impression couleur améliore la lisibilité des tableaux</p>
          <p>• Conservez une copie numérique avant impression</p>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;