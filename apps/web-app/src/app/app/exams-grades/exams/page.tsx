/**
 * ============================================================================
 * MODULE 3 : EXAMENS - GESTION DES EXAMENS
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Edit, Trash2, Eye, Calendar, BookOpen } from 'lucide-react';
import {
  ModuleContainer,
  FormModal,
  ConfirmModal,
  ReadOnlyModal,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';

interface Exam {
  id: string;
  name: string;
  examType: string;
  examDate: string;
  maxScore: number;
  coefficient: number;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  quarter?: {
    id: string;
    name: string;
  };
}

export default function ExamsPage() {
  const { academicYear, schoolLevel } = useModuleContext();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [filters, setFilters] = useState({
    examType: '',
    search: '',
  });

  useEffect(() => {
    if (academicYear) {
      loadExams();
    }
  }, [academicYear, schoolLevel, filters]);

  const loadExams = async () => {
    if (!academicYear) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        academicYearId: academicYear.id,
        ...(schoolLevel && { schoolLevelId: schoolLevel.id }),
        ...(filters.examType && { examType: filters.examType }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/exams?${params}`);
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExamTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DEVOIR: 'Devoir',
      COMPOSITION: 'Composition',
      ORAL: 'Oral',
      PRATIQUE: 'Pratique',
    };
    return labels[type] || type;
  };

  return (
    <>
      <ModuleContainer
        header={{
          title: 'Examens',
          description: 'Gestion des examens : devoir, composition, oral, pratique',
          icon: 'fileText',
          actions: (
            <button
              onClick={() => {
                setSelectedExam(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel examen</span>
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
                  placeholder="Rechercher un examen..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Rechercher"
                />
              </div>
              <select
                value={filters.examType}
                onChange={(e) => setFilters({ ...filters, examType: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par type"
              >
                <option value="">Tous les types</option>
                <option value="DEVOIR">Devoir</option>
                <option value="COMPOSITION">Composition</option>
                <option value="ORAL">Oral</option>
                <option value="PRATIQUE">Pratique</option>
              </select>
            </div>
          ),
          isLoading,
          children: (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Matière
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Note max
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {exam.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getExamTypeLabel(exam.examType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.subject?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exam.examDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {exam.maxScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir"
                          aria-label="Voir l'examen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsEditModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Modifier"
                          aria-label="Modifier l'examen"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExam(exam);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                          aria-label="Supprimer l'examen"
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
        title={selectedExam ? 'Modifier l\'examen' : 'Créer un examen'}
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedExam(null);
        }}
        size="lg"
        actions={
          <>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedExam(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={async () => {
                // TODO: Implémenter la sauvegarde
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedExam(null);
                loadExams();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {selectedExam ? 'Modifier' : 'Créer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              defaultValue={selectedExam?.name || ''}
              placeholder="Ex: Composition de Mathématiques"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Nom de l'examen"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                defaultValue={selectedExam?.examType || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Type d'examen"
              >
                <option value="">Sélectionner</option>
                <option value="DEVOIR">Devoir</option>
                <option value="COMPOSITION">Composition</option>
                <option value="ORAL">Oral</option>
                <option value="PRATIQUE">Pratique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                defaultValue={selectedExam?.examDate ? new Date(selectedExam.examDate).toISOString().split('T')[0] : ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Date de l'examen"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note maximale
              </label>
              <input
                type="number"
                min="1"
                defaultValue={selectedExam?.maxScore || 20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Note maximale"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coefficient
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                defaultValue={selectedExam?.coefficient || 1.0}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Coefficient"
              />
            </div>
          </div>
        </div>
      </FormModal>

      <ReadOnlyModal
        title={`Examen : ${selectedExam?.name}`}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedExam(null);
        }}
        size="lg"
      >
        {selectedExam && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <p className="text-sm text-gray-900">{getExamTypeLabel(selectedExam.examType)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedExam.examDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note maximale</label>
                <p className="text-sm text-gray-900">{selectedExam.maxScore}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coefficient</label>
                <p className="text-sm text-gray-900">{selectedExam.coefficient}</p>
              </div>
            </div>
          </div>
        )}
      </ReadOnlyModal>

      <ConfirmModal
        title="Supprimer l'examen"
        message={`Êtes-vous sûr de vouloir supprimer "${selectedExam?.name}" ?`}
        type="danger"
        isOpen={isDeleteModalOpen}
        onConfirm={async () => {
          if (selectedExam) {
            try {
              await fetch(`/api/exams/${selectedExam.id}`, {
                method: 'DELETE',
              });
              setIsDeleteModalOpen(false);
              setSelectedExam(null);
              loadExams();
            } catch (error) {
              console.error('Failed to delete exam:', error);
            }
          }
        }}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedExam(null);
        }}
        confirmLabel="Supprimer"
      />
    </>
  );
}

