import React from 'react';
import { Upload, X } from 'lucide-react';

import { WatermarkConfig as WatermarkConfigType } from '../../types/documentSettings';

interface WatermarkConfigProps {
  config: WatermarkConfigType;
  onChange: (config: WatermarkConfigType) => void;
}

const WatermarkConfig: React.FC<WatermarkConfigProps> = ({ config, onChange }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange({
          ...config,
          type: 'image',
          content: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onChange({
      ...config,
      type: 'text',
      content: 'CONFIDENTIEL'
    });
  };

  return (
    <div className="space-y-4">
      {/* Activation du filigrane */}
      <div className="flex items-center">
        <input
          id="watermarkEnabled"
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="watermarkEnabled" className="ml-2 text-sm font-medium text-gray-700">
          Activer le filigrane
        </label>
      </div>

      {config.enabled && (
        <div className="space-y-4 pl-6 border-l-2 border-gray-200">
          {/* Type de filigrane */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de filigrane</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="text"
                  checked={config.type === 'text'}
                  onChange={(e) => onChange({ ...config, type: e.target.value as 'text' | 'image' })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Texte</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="image"
                  checked={config.type === 'image'}
                  onChange={(e) => onChange({ ...config, type: e.target.value as 'text' | 'image' })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Image</span>
              </label>
            </div>
          </div>

          {/* Contenu du filigrane */}
          {config.type === 'text' ? (
            <div>
              <label htmlFor="watermarkContent" className="block text-sm font-medium text-gray-700 mb-1">
                Texte du filigrane
              </label>
              <input
                id="watermarkContent"
                type="text"
                value={config.content}
                onChange={(e) => onChange({ ...config, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: CONFIDENTIEL"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image du filigrane
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Cliquez pour sélectionner une image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </label>
                {config.content && config.type === 'image' && (
                  <div className="relative">
                    <img
                      src={config.content}
                      alt="Filigrane"
                      className="w-16 h-16 object-contain border border-gray-300 rounded"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Position */}
          <div>
            <label htmlFor="watermarkPosition" className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              id="watermarkPosition"
              value={config.position}
                                onChange={(e) => onChange({ ...config, position: e.target.value as WatermarkConfigType['position'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="center">Centre</option>
              <option value="diagonal">Diagonale</option>
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>

          {/* Taille */}
          <div>
            <label htmlFor="watermarkSize" className="block text-sm font-medium text-gray-700 mb-1">
              Taille
            </label>
            <select
              id="watermarkSize"
              value={config.size}
                                onChange={(e) => onChange({ ...config, size: e.target.value as WatermarkConfigType['size'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Petite</option>
              <option value="medium">Moyenne</option>
              <option value="large">Grande</option>
            </select>
          </div>

          {/* Opacité */}
          <div>
            <label htmlFor="watermarkOpacity" className="block text-sm font-medium text-gray-700 mb-1">
              Opacité: {Math.round(config.opacity * 100)}%
            </label>
            <input
              id="watermarkOpacity"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.opacity}
              onChange={(e) => onChange({ ...config, opacity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Couleur (pour le texte) */}
          {config.type === 'text' && (
            <div>
              <label htmlFor="watermarkColor" className="block text-sm font-medium text-gray-700 mb-1">
                Couleur
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="watermarkColor"
                  type="color"
                  value={config.color}
                  onChange={(e) => onChange({ ...config, color: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={config.color}
                  onChange={(e) => onChange({ ...config, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="#000000"
                />
              </div>
            </div>
          )}

          {/* Rotation */}
          <div>
            <label htmlFor="watermarkRotation" className="block text-sm font-medium text-gray-700 mb-1">
              Rotation: {config.rotation || 0}°
            </label>
            <input
              id="watermarkRotation"
              type="range"
              min="-180"
              max="180"
              step="15"
              value={config.rotation || 0}
              onChange={(e) => onChange({ ...config, rotation: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WatermarkConfig;