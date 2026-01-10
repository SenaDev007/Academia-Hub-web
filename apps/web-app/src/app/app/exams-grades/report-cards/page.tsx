/**
 * ============================================================================
 * MODULE 3 : BULLETINS
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { FileCheck, Download, CheckCircle, Clock, Plus } from 'lucide-react';
import {
  ModuleContainer,
  FormModal,
  ConfirmModal,
  ReadOnlyModal,
  CriticalModal,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';

interface ReportCard {
  id: string;
  type: string;
  overallAverage: number;
  rank?: number;
  status: string;
  filePath?: string;
  generatedAt?: string;
  validatedAt?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  quarter?: {
    id: string;
    name: string;
  };
}

export default function ReportCardsPage() {
  const { academicYear, schoolLevel } = useModuleContext();
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    if (academicYear) {
      loadReportCards();
    }
  }, [academicYear, schoolLevel, filters]);

  const loadReportCards = async () => {
    if (!academicYear) return;

    setIsLoading(true);
    try {
      // TODO: Implémenter la récupération des bulletins
      // Pour l'instant, on simule
      setReportCards([]);
    } catch (error) {
      console.error('Failed to load report cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'VALIDATED':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Brouillon',
      VALIDATED: 'Validé',
      PUBLISHED: 'Publié',
    };
    return labels[status] || status;
  };

  const draftCount = reportCards.filter((rc) => rc.status === 'DRAFT').length;
  const validatedCount = reportCards.filter((rc) => rc.status === 'VALIDATED').length;
  const publishedCount = reportCards.filter((rc) => rc.status === 'PUBLISHED').length;

  return (
    <>
      <ModuleContainer
        header={{
          title: 'Bulletins',
          description: 'Génération, validation et publication des bulletins officiels',
          icon: 'fileCheck',
          kpis: [
            {
              label: 'Brouillons',
              value: draftCount,
              icon: 'clock',
              trend: 'warning',
            },
            {
              label: 'Validés',
              value: validatedCount,
              icon: 'checkCircle',
              trend: 'up',
            },
            {
              label: 'Publiés',
              value: publishedCount,
              icon: 'fileCheck',
              trend: 'neutral',
            },
          ],
          actions: (
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Générer un bulletin</span>
            </button>
          ),
        }}
        content={{
          layout: 'table',
          filters: (
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un bulletin..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Rechercher"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="DRAFT">Brouillon</option>
                <option value="VALIDATED">Validé</option>
                <option value="PUBLISHED">Publié</option>
              </select>
            </div>
          ),
          isLoading,
          children: (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Moyenne
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportCards.map((card) => (
                  <tr key={card.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {card.student?.firstName} {card.student?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.quarter?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {card.overallAverage.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {card.rank || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          card.status
                        )}`}
                      >
                        {getStatusLabel(card.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReportCard(card);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir"
                          aria-label="Voir le bulletin"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                        {card.status === 'DRAFT' && (
                          <button
                            onClick={() => {
                              setSelectedReportCard(card);
                              setIsValidateModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Valider"
                            aria-label="Valider le bulletin"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {card.status === 'PUBLISHED' && card.filePath && (
                          <a
                            href={card.filePath}
                            download
                            className="text-blue-600 hover:text-blue-900"
                            title="Télécharger"
                            aria-label="Télécharger le bulletin"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
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
        title="Générer un bulletin"
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        size="md"
        actions={
          <>
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={async () => {
                // TODO: Implémenter la génération
                setIsGenerateModalOpen(false);
                loadReportCards();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Générer
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de bulletin *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Type de bulletin"
            >
              <option value="">Sélectionner</option>
              <option value="QUARTERLY">Trimestriel</option>
              <option value="SEMESTER">Semestriel</option>
              <option value="ANNUAL">Annuel</option>
            </select>
          </div>
        </div>
      </FormModal>

      <ReadOnlyModal
        title={`Bulletin : ${selectedReportCard?.student?.firstName} ${selectedReportCard?.student?.lastName}`}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedReportCard(null);
        }}
        size="lg"
      >
        {selectedReportCard && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moyenne générale</label>
                <p className="text-sm text-gray-900 font-semibold">
                  {selectedReportCard.overallAverage.toFixed(2)} / 20
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rang</label>
                <p className="text-sm text-gray-900">{selectedReportCard.rank || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    selectedReportCard.status
                  )}`}
                >
                  {getStatusLabel(selectedReportCard.status)}
                </span>
              </div>
            </div>
          </div>
        )}
      </ReadOnlyModal>

      <CriticalModal
        title="Valider le bulletin"
        message={`Vous êtes sur le point de valider le bulletin de ${selectedReportCard?.student?.firstName} ${selectedReportCard?.student?.lastName}.`}
        warning="Une fois validé, le bulletin pourra être publié et généré en PDF."
        isOpen={isValidateModalOpen}
        onConfirm={async () => {
          if (selectedReportCard) {
            try {
              await fetch(`/api/report-cards/${selectedReportCard.id}/validate`, {
                method: 'POST',
              });
              setIsValidateModalOpen(false);
              setSelectedReportCard(null);
              loadReportCards();
            } catch (error) {
              console.error('Failed to validate report card:', error);
            }
          }
        }}
        onCancel={() => {
          setIsValidateModalOpen(false);
          setSelectedReportCard(null);
        }}
        confirmLabel="Valider"
      />
    </>
  );
}

