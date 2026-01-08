/**
 * ============================================================================
 * MODULE QHSE (Qualité, Hygiène, Sécurité, Environnement)
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, ShieldCheck, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';
import ModulePageLayout from './ModulePageLayout';

interface Inspection {
  id: string;
  type: 'QUALITY' | 'HYGIENE' | 'SAFETY' | 'ENVIRONMENT';
  date: string;
  inspector: string;
  status: 'PENDING' | 'COMPLETED' | 'NON_COMPLIANT';
  findings: string;
  actions: string;
}

export default function QHSEModulePage() {
  const { currentYear } = useAcademicYear();
  const { currentLevel } = useSchoolLevel();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInspections = async () => {
      if (!currentYear || !currentLevel) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/qhse/inspections?academicYearId=${currentYear.id}&schoolLevelId=${currentLevel.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setInspections(data);
        }
      } catch (error) {
        console.error('Failed to load inspections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInspections();
  }, [currentYear, currentLevel]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      QUALITY: 'Qualité',
      HYGIENE: 'Hygiène',
      SAFETY: 'Sécurité',
      ENVIRONMENT: 'Environnement',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'NON_COMPLIANT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <ModulePageLayout
      title="QHSE"
      subtitle={`${currentLevel?.code === 'MATERNELLE' ? 'Maternelle' :
                 currentLevel?.code === 'PRIMAIRE' ? 'Primaire' :
                 currentLevel?.code === 'SECONDAIRE' ? 'Secondaire' : currentLevel?.code} | ${currentYear?.name || ''}`}
      actions={
        <>
          <button className="flex items-center space-x-2 px-4 py-2 bg-navy-900 text-white rounded-md hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouvelle inspection</span>
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total</p>
              <ShieldCheck className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : inspections.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Complétées</p>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : inspections.filter(i => i.status === 'COMPLETED').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Non conformes</p>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : inspections.filter(i => i.status === 'NON_COMPLIANT').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">En attente</p>
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : inspections.filter(i => i.status === 'PENDING').length}
            </p>
          </div>
        </div>

        {/* Liste des inspections */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-navy-900">Inspections</h3>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-gray-400">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inspecteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Constats
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inspections.map((inspection) => (
                    <tr key={inspection.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getTypeLabel(inspection.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inspection.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inspection.inspector}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            inspection.status
                          )}`}
                        >
                          {inspection.status === 'COMPLETED'
                            ? 'Complétée'
                            : inspection.status === 'NON_COMPLIANT'
                            ? 'Non conforme'
                            : 'En attente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {inspection.findings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ModulePageLayout>
  );
}

