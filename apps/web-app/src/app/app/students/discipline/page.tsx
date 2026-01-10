/**
 * ============================================================================
 * SOUS-MODULE : DISCIPLINE
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertTriangle, Ban, XCircle } from 'lucide-react';
import {
  ModuleContainer,
  FormModal,
  CriticalModal,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';

interface DisciplinaryAction {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentCode?: string;
  };
  actionType: string;
  description: string;
  actionDate: string;
  duration?: number;
  status: string;
}

export default function DisciplinePage() {
  const { academicYear, schoolLevel } = useModuleContext();
  const [actions, setActions] = useState<DisciplinaryAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<DisciplinaryAction | null>(null);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);

  useEffect(() => {
    if (academicYear && schoolLevel) {
      loadDisciplinaryActions();
    }
  }, [academicYear, schoolLevel]);

  const loadDisciplinaryActions = async () => {
    if (!academicYear || !schoolLevel) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        academicYearId: academicYear.id,
        schoolLevelId: schoolLevel.id,
      });

      const response = await fetch(`/api/discipline?${params}`);
      if (response.ok) {
        const data = await response.json();
        setActions(data);
      }
    } catch (error) {
      console.error('Failed to load disciplinary actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENSION':
        return 'bg-orange-100 text-orange-800';
      case 'EXPULSION':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      WARNING: 'Avertissement',
      SUSPENSION: 'Suspension',
      EXPULSION: 'Expulsion',
    };
    return labels[type] || type;
  };

  return (
    <>
      <ModuleContainer
        header={{
          title: 'Discipline',
          description: 'Gestion des incidents disciplinaires et actions',
          icon: 'alertTriangle',
          actions: (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel incident</span>
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
                    Élève
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type d'action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actions.map((action) => (
                  <tr key={action.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {action.student.lastName} {action.student.firstName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {action.student.studentCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getActionTypeColor(
                          action.actionType
                        )}`}
                      >
                        {getActionTypeLabel(action.actionType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {action.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(action.actionDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          action.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {action.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ),
        }}
      />

      <FormModal
        title="Nouvel incident disciplinaire"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="lg"
        actions={
          <>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                // TODO: Implémenter la création
                setIsCreateModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Formulaire d'incident disciplinaire à implémenter
          </p>
        </div>
      </FormModal>
    </>
  );
}

