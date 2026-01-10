/**
 * ============================================================================
 * SOUS-MODULE : DOCUMENTS ADMINISTRATIFS
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Upload, FileText, Download, Trash2 } from 'lucide-react';
import {
  ModuleContainer,
  FormModal,
  ConfirmModal,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';

interface StudentDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export default function DocumentsPage() {
  const { academicYear, schoolLevel } = useModuleContext();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StudentDocument | null>(null);

  useEffect(() => {
    if (academicYear && schoolLevel) {
      loadDocuments();
    }
  }, [academicYear, schoolLevel]);

  const loadDocuments = async () => {
    if (!academicYear || !schoolLevel) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        academicYearId: academicYear.id,
        schoolLevelId: schoolLevel.id,
      });

      const response = await fetch(`/api/students/documents?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BIRTH_CERTIFICATE: 'Acte de naissance',
      ID_CARD: "Carte d'identité",
      PHOTO: 'Photo',
      MEDICAL_CERTIFICATE: 'Certificat médical',
    };
    return labels[type] || type;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <ModuleContainer
        header={{
          title: 'Documents administratifs',
          description: 'Gestion des documents des élèves (upload et génération)',
          icon: 'fileText',
          actions: (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" />
              <span>Uploader un document</span>
            </button>
          ),
        }}
        content={{
          layout: 'table',
          isLoading,
          children: (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fichier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDocumentTypeLabel(doc.documentType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ),
        }}
      />

      <FormModal
        title="Uploader un document"
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        size="lg"
        actions={
          <>
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                // TODO: Implémenter l'upload
                setIsUploadModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Uploader
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de document
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Type de document"
            >
              <option value="">Sélectionner</option>
              <option value="BIRTH_CERTIFICATE">Acte de naissance</option>
              <option value="ID_CARD">Carte d'identité</option>
              <option value="PHOTO">Photo</option>
              <option value="MEDICAL_CERTIFICATE">Certificat médical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fichier
            </label>
            <input
              type="file"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </FormModal>

      <ConfirmModal
        title="Supprimer le document"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedDocument?.fileName}" ?`}
        type="danger"
        isOpen={isDeleteModalOpen}
        onConfirm={async () => {
          if (selectedDocument) {
            // TODO: Implémenter la suppression
            setIsDeleteModalOpen(false);
            setSelectedDocument(null);
            loadDocuments();
          }
        }}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedDocument(null);
        }}
        confirmLabel="Supprimer"
      />
    </>
  );
}

