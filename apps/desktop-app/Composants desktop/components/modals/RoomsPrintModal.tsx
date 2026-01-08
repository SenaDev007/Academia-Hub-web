import React, { useState } from 'react';
import { X, Printer, Loader2, Building, Settings } from 'lucide-react';
import { PlanningRoom } from '../../types/planning';

interface RoomsPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: PlanningRoom[];
}

interface PrintOptions {
  includeEquipment: boolean;
  includeDescription: boolean;
  includeStatus: boolean;
  format: 'A4' | 'A5' | 'letter';
  orientation: 'portrait' | 'landscape';
  showLogo: boolean;
  showFooter: boolean;
  language: 'fr' | 'en';
}

const RoomsPrintModal: React.FC<RoomsPrintModalProps> = ({ isOpen, onClose, rooms }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [options, setOptions] = useState<PrintOptions>({
    includeEquipment: true,
    includeDescription: true,
    includeStatus: true,
    format: 'A4',
    orientation: 'portrait',
    showLogo: true,
    showFooter: true,
    language: 'fr'
  });

  if (!isOpen || !rooms || rooms.length === 0) return null;

  // Fonction utilitaire pour formater les équipements
  const formatEquipment = (equipment: any): string => {
    if (!equipment) return 'Aucun équipement';
    
    if (Array.isArray(equipment)) {
      return equipment.length > 0 ? equipment.join(', ') : 'Aucun équipement';
    }
    
    if (typeof equipment === 'string') {
      try {
        const parsed = JSON.parse(equipment);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed.join(', ') : 'Aucun équipement';
        }
      } catch (e) {
        return equipment || 'Aucun équipement';
      }
    }
    
    return 'Aucun équipement';
  };

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Créer le contenu HTML pour l'impression
    const printContent = generatePrintContent();
    
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis imprimer
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      };
    } else {
      // Fallback si popup bloqué
      const printFrame = document.createElement('iframe');
      printFrame.style.display = 'none';
      document.body.appendChild(printFrame);
      printFrame.contentDocument?.write(printContent);
      printFrame.contentDocument?.close();
      
      setTimeout(() => {
        printFrame.contentWindow?.print();
        document.body.removeChild(printFrame);
        setIsPrinting(false);
      }, 500);
    }
  };

  const generatePrintContent = () => {
    const currentDate = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liste des Salles - Academia Hub</title>
          <style>
            @page {
              size: ${options.format} ${options.orientation};
              margin: 20mm;
            }
            
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
              color: #333;
            }
            
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #2563eb; 
              padding-bottom: 20px; 
            }
            
            .header h1 { 
              color: #2563eb; 
              margin: 0; 
              font-size: 28px;
              font-weight: bold;
            }
            
            .header p { 
              color: #666; 
              margin: 5px 0; 
              font-size: 14px;
            }
            
            .summary {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 25px;
              border-left: 4px solid #2563eb;
            }
            
            .summary h3 {
              margin: 0 0 10px 0;
              color: #1e40af;
              font-size: 18px;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
            }
            
            .summary-item {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .summary-item:last-child {
              border-bottom: none;
            }
            
            .room { 
              margin-bottom: 25px; 
              padding: 20px; 
              border: 2px solid #e2e8f0; 
              border-radius: 12px; 
              background: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .room h3 { 
              color: #2563eb; 
              margin: 0 0 15px 0; 
              font-size: 20px;
              font-weight: bold;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 10px;
            }
            
            .room-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin-bottom: 15px; 
            }
            
            .room-info div { 
              padding: 8px 0; 
              border-bottom: 1px solid #f1f5f9;
            }
            
            .room-info strong { 
              color: #475569; 
              font-weight: 600;
            }
            
            .equipment { 
              background: #f8fafc; 
              padding: 15px; 
              border-radius: 8px; 
              margin-top: 15px; 
              border-left: 4px solid #10b981;
            }
            
            .equipment h4 { 
              margin: 0 0 10px 0; 
              color: #047857; 
              font-size: 16px;
              font-weight: 600;
            }
            
            .description { 
              margin-top: 15px; 
              padding: 15px; 
              background: #fef3c7; 
              border-radius: 8px; 
              border-left: 4px solid #f59e0b;
            }
            
            .description h4 { 
              margin: 0 0 10px 0; 
              color: #d97706; 
              font-size: 16px;
              font-weight: 600;
            }
            
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #64748b; 
              font-size: 12px; 
              border-top: 2px solid #e2e8f0;
              padding-top: 20px;
            }
            
            .status-available { color: #059669; font-weight: 600; }
            .status-occupied { color: #dc2626; font-weight: 600; }
            .status-maintenance { color: #d97706; font-weight: 600; }
            .status-reserved { color: #7c3aed; font-weight: 600; }
            
            @media print {
              .room { break-inside: avoid; }
              body { margin: 15mm; }
              .header { border-bottom-color: #2563eb; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📚 Liste des Salles</h1>
            <p>Academia Hub - Système de Gestion Scolaire</p>
            <p>Généré le ${currentDate}</p>
          </div>
          
          <div class="summary">
            <h3>📊 Résumé</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span>Total des salles:</span>
                <strong>${rooms.length}</strong>
              </div>
              <div class="summary-item">
                <span>Types de salles:</span>
                <strong>${[...new Set(rooms.map(r => r.type))].length}</strong>
              </div>
              <div class="summary-item">
                <span>Capacité totale:</span>
                <strong>${rooms.reduce((sum, r) => sum + (r.capacity || 0), 0)} places</strong>
              </div>
              <div class="summary-item">
                <span>Date de génération:</span>
                <strong>${new Date().toLocaleDateString('fr-FR')}</strong>
              </div>
            </div>
          </div>
          
          ${rooms.map(room => `
            <div class="room">
              <h3>🏫 ${room.name}</h3>
              <div class="room-info">
                <div><strong>Type:</strong> ${room.type || 'Non spécifié'}</div>
                <div><strong>Capacité:</strong> ${room.capacity || 'Non spécifiée'} places</div>
                                 ${options.includeStatus ? `<div><strong>Statut:</strong> <span class="status-${room.status || 'available'}">${room.status || 'Disponible'}</span></div>` : ''}
              </div>
              ${options.includeEquipment && room.equipment ? `
                <div class="equipment">
                  <h4>🔧 Équipement</h4>
                  <p>${formatEquipment(room.equipment)}</p>
                </div>
              ` : ''}
              ${options.includeDescription && room.description ? `
                <div class="description">
                  <h4>📝 Description</h4>
                  <p>${room.description}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
          
          <div class="footer">
            <p>Document généré le ${new Date().toLocaleString('fr-FR')}</p>
            <p>Academia Hub - Système de gestion scolaire intelligent</p>
            <p>Page 1 sur 1</p>
          </div>
        </body>
      </html>
    `;
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Aperçu d'impression des Salles
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isPrinting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Options d'impression */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Options d'impression</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeEquipment}
                onChange={(e) => setOptions(prev => ({ ...prev, includeEquipment: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Équipement</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeDescription}
                onChange={(e) => setOptions(prev => ({ ...prev, includeDescription: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Description</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.includeStatus}
                onChange={(e) => setOptions(prev => ({ ...prev, includeStatus: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Statut</span>
            </label>

          </div>
        </div>

        {/* Aperçu */}
        <div className="flex-1 overflow-auto p-4">
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Aperçu de l'impression</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {rooms.length} salle(s) • Format: {options.format.toUpperCase()} • Orientation: {options.orientation}
              </p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: generatePrintContent() }} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg ${
              isPrinting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
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
        </div>
      </div>
    </div>
  );
};

export default RoomsPrintModal;
