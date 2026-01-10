/**
 * ============================================================================
 * MODULE 2 : ORGANISATION PÉDAGOGIQUE - EMPLOIS DU TEMPS
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2 } from 'lucide-react';
import {
  ModuleContainer,
  FormModal,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';

interface Timetable {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export default function TimetablesPage() {
  const { academicYear, schoolLevel } = useModuleContext();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (academicYear && schoolLevel) {
      loadTimetables();
    }
  }, [academicYear, schoolLevel]);

  const loadTimetables = async () => {
    if (!academicYear || !schoolLevel) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        academicYearId: academicYear.id,
        schoolLevelId: schoolLevel.id,
      });

      const response = await fetch(`/api/timetables?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTimetables(data);
      }
    } catch (error) {
      console.error('Failed to load timetables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ModuleContainer
        header={{
          title: 'Emplois du temps',
          description: 'Gestion des emplois du temps par classe',
          icon: 'calendar',
          actions: (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel emploi du temps</span>
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
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Période
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timetables.map((timetable) => (
                  <tr key={timetable.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {timetable.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {timetable.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          timetable.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {timetable.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(timetable.startDate).toLocaleDateString('fr-FR')}
                      {timetable.endDate &&
                        ` - ${new Date(timetable.endDate).toLocaleDateString('fr-FR')}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ),
        }}
      />

      <FormModal
        title="Créer un emploi du temps"
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
                loadTimetables();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Créer
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
              placeholder="Ex: Emploi du temps 6ème A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Nom de l'emploi du temps"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Description de l'emploi du temps"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Description"
            />
          </div>
        </div>
      </FormModal>
    </>
  );
}

