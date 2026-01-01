import React, { useState, useMemo } from 'react';
import { FileText, Download, Eye, X } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  url?: string;
  data?: string;
  size?: number;
}

interface DocumentViewerProps {
  documents: Document[];
  maxDisplay?: number;
  showPreview?: boolean;
  onDownload?: (document: Document) => void;
  onView?: (document: Document) => void;
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents = [],
  maxDisplay = 3,
  showPreview = false,
  onDownload,
  onView,
  className = ""
}) => {
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Optimisation : ne traiter que les documents visibles
  const visibleDocuments = useMemo(() => {
    if (!Array.isArray(documents)) return [];
    return showAll ? documents : documents.slice(0, maxDisplay);
  }, [documents, showAll, maxDisplay]);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('doc')) return '📝';
    if (type.includes('excel') || type.includes('sheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = (document: Document) => {
    if (onDownload) {
      onDownload(document);
    } else {
      // Téléchargement par défaut
      if (document.data) {
        const link = document.createElement('a');
        link.href = document.data;
        link.download = document.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleView = (document: Document) => {
    if (onView) {
      onView(document);
    } else if (showPreview) {
      setPreviewDocument(document);
    }
  };

  if (!Array.isArray(documents) || documents.length === 0) {
    return (
      <div className={`text-gray-500 dark:text-gray-400 text-sm ${className}`}>
        Aucun document
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-1 ${className}`}>
        {visibleDocuments.map((doc, index) => (
          <div
            key={doc.id || index}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className="text-lg flex-shrink-0">
                {getFileIcon(doc.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {doc.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {doc.type} {doc.size && `• ${formatFileSize(doc.size)}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              {showPreview && (
                <button
                  onClick={() => handleView(doc)}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Aperçu"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDownload(doc)}
                className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {documents.length > maxDisplay && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-2"
          >
            Voir {documents.length - maxDisplay} document(s) de plus
          </button>
        )}

        {showAll && documents.length > maxDisplay && (
          <button
            onClick={() => setShowAll(false)}
            className="w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 py-2"
          >
            Voir moins
          </button>
        )}
      </div>

      {/* Modal de prévisualisation */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {previewDocument.name}
              </h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {previewDocument.data ? (
                <iframe
                  src={previewDocument.data}
                  className="w-full h-96 border-0"
                  title={previewDocument.name}
                />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <FileText className="w-16 h-16 mx-auto mb-4" />
                  <p>Aperçu non disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentViewer;
