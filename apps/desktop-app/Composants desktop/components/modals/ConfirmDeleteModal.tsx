import React, { useEffect, useState } from 'react';
import { AlertTriangle, X, Trash2, Shield, AlertCircle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop avec animation */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-red-900/20 via-black/40 to-red-900/20 backdrop-blur-md transition-all duration-500 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal avec animations avancées */}
      <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-500 ${
        isAnimating 
          ? 'scale-100 opacity-100 translate-y-0' 
          : 'scale-95 opacity-0 translate-y-4'
      }`}>
        {/* Header avec gradient et animation */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-600/5 to-red-500/10" />
          <div className="relative flex items-center justify-between p-6 border-b border-red-200/50 dark:border-red-800/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {title}
                </h3>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                  Action irréversible
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content avec design moderne */}
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/30 rounded-xl flex items-center justify-center shadow-lg">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-red-600 rounded-xl opacity-20 blur-sm" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                  {message}
                </p>
                <div className="mt-3 flex items-center space-x-2 text-xs text-amber-600 dark:text-amber-400">
                  <Shield className="w-3 h-3" />
                  <span className="font-medium">Cette action ne peut pas être annulée</span>
                </div>
              </div>
              
              {itemName && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-xl blur-sm" />
                  <div className="relative p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-800/10 rounded-lg border border-red-200/50 dark:border-red-800/30">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                          Élément à supprimer
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                          {itemName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer avec design moderne */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 via-gray-100/30 to-gray-50/50 dark:from-gray-800/50 dark:via-gray-700/30 dark:to-gray-800/50" />
          <div className="relative flex items-center justify-between p-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Confirmez votre choix</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border-2 border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="relative px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 flex items-center space-x-2 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Suppression...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 group-hover:animate-pulse" />
                    <span>Supprimer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
