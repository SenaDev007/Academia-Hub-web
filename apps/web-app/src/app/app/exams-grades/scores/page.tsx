/**
 * ============================================================================
 * MODULE 3 : SAISIE DES NOTES
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, ClipboardList, CheckCircle, XCircle, Eye, Edit } from 'lucide-react';
import {
  ModuleContainer,
  FormModal,
  ConfirmModal,
  CriticalModal,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';

interface ExamScore {
  id: string;
  score: number;
  maxScore: number;
  isValidated: boolean;
  validatedAt?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  exam?: {
    id: string;
    name: string;
    examType: string;
  };
  subject?: {
    id: string;
    name: string;
  };
}

export default function ScoresPage() {
  const { academicYear, schoolLevel } = useModuleContext();
  const [scores, setScores] = useState<ExamScore[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);
  const [selectedScore, setSelectedScore] = useState<ExamScore | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedScores, setSelectedScores] = useState<string[]>([]);

  useEffect(() => {
    if (academicYear) {
      loadExams();
    }
  }, [academicYear, schoolLevel]);

  useEffect(() => {
    if (selectedExamId) {
      loadScores();
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    if (!academicYear) return;

    try {
      const params = new URLSearchParams({
        academicYearId: academicYear.id,
        ...(schoolLevel && { schoolLevelId: schoolLevel.id }),
      });

      const response = await fetch(`/api/exams?${params}`);
      if (response.ok) {
        const data = await response.json();
        setExams(data);
        if (data.length > 0 && !selectedExamId) {
          setSelectedExamId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load exams:', error);
    }
  };

  const loadScores = async () => {
    if (!selectedExamId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/exam-scores/exam/${selectedExamId}`);
      if (response.ok) {
        const data = await response.json();
        setScores(data);
      }
    } catch (error) {
      console.error('Failed to load scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateScores = async () => {
    if (selectedScores.length === 0) return;

    try {
      await fetch('/api/exam-scores/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreIds: selectedScores }),
      });
      setIsValidateModalOpen(false);
      setSelectedScores([]);
      loadScores();
    } catch (error) {
      console.error('Failed to validate scores:', error);
    }
  };

  const pendingCount = scores.filter((s) => !s.isValidated).length;
  const validatedCount = scores.filter((s) => s.isValidated).length;

  return (
    <>
      <ModuleContainer
        header={{
          title: 'Saisie des notes',
          description: 'Saisie et validation des notes d\'examen',
          icon: 'clipboardList',
          kpis: [
            {
              label: 'Notes saisies',
              value: scores.length,
              icon: 'clipboardList',
              trend: 'neutral',
            },
            {
              label: 'En attente',
              value: pendingCount,
              icon: 'clock',
              trend: 'warning',
            },
            {
              label: 'Validées',
              value: validatedCount,
              icon: 'checkCircle',
              trend: 'up',
            },
          ],
          actions: (
            <div className="flex items-center space-x-2">
              {selectedScores.length > 0 && (
                <button
                  onClick={() => setIsValidateModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Valider ({selectedScores.length})</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedScore(null);
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Saisir une note</span>
              </button>
            </div>
          ),
        }}
        content={{
          layout: 'table',
          filters: (
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <select
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Sélectionner un examen"
                >
                  <option value="">Sélectionner un examen</option>
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} - {new Date(exam.examDate).toLocaleDateString('fr-FR')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ),
          isLoading,
          children: (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScores(
                            scores.filter((s) => !s.isValidated).map((s) => s.id)
                          );
                        } else {
                          setSelectedScores([]);
                        }
                      }}
                      className="rounded border-gray-300"
                      aria-label="Sélectionner tout"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Note
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
                {scores.map((score) => (
                  <tr key={score.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!score.isValidated && (
                        <input
                          type="checkbox"
                          checked={selectedScores.includes(score.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScores([...selectedScores, score.id]);
                            } else {
                              setSelectedScores(selectedScores.filter((id) => id !== score.id));
                            }
                          }}
                          className="rounded border-gray-300"
                          aria-label={`Sélectionner ${score.student?.firstName} ${score.student?.lastName}`}
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {score.student?.firstName} {score.student?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {score.score} / {score.maxScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {score.isValidated ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Validée
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!score.isValidated && (
                          <button
                            onClick={() => {
                              setSelectedScore(score);
                              setIsEditModalOpen(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Modifier"
                            aria-label="Modifier la note"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
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
        title={selectedScore ? 'Modifier la note' : 'Saisir une note'}
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedScore(null);
        }}
        size="md"
        actions={
          <>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedScore(null);
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
                setSelectedScore(null);
                loadScores();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {selectedScore ? 'Modifier' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note *
            </label>
            <input
              type="number"
              min="0"
              max={selectedScore?.maxScore || 20}
              step="0.1"
              defaultValue={selectedScore?.score || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Note"
            />
          </div>
        </div>
      </FormModal>

      <CriticalModal
        title="Valider les notes"
        message={`Vous êtes sur le point de valider ${selectedScores.length} note(s).`}
        warning="Une fois validées, les notes ne pourront plus être modifiées sans autorisation."
        isOpen={isValidateModalOpen}
        onConfirm={handleValidateScores}
        onCancel={() => {
          setIsValidateModalOpen(false);
        }}
        confirmLabel="Valider"
      />
    </>
  );
}

