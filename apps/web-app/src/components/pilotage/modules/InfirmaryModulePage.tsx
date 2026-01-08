/**
 * ============================================================================
 * MODULE INFIRMERIE
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, HeartPulse, AlertCircle, FileText, Calendar } from 'lucide-react';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';
import ModulePageLayout from './ModulePageLayout';

interface MedicalVisit {
  id: string;
  studentName: string;
  date: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export default function InfirmaryModulePage() {
  const { currentYear } = useAcademicYear();
  const { currentLevel } = useSchoolLevel();
  const [visits, setVisits] = useState<MedicalVisit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVisits = async () => {
      if (!currentYear || !currentLevel) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/infirmary/visits?academicYearId=${currentYear.id}&schoolLevelId=${currentLevel.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setVisits(data);
        }
      } catch (error) {
        console.error('Failed to load medical visits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVisits();
  }, [currentYear, currentLevel]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <ModulePageLayout
      title="Infirmerie"
      subtitle={`${currentLevel?.code === 'MATERNELLE' ? 'Maternelle' :
                 currentLevel?.code === 'PRIMAIRE' ? 'Primaire' :
                 currentLevel?.code === 'SECONDAIRE' ? 'Secondaire' : currentLevel?.code} | ${currentYear?.name || ''}`}
      actions={
        <>
          <button className="flex items-center space-x-2 px-4 py-2 bg-navy-900 text-white rounded-md hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouvelle visite</span>
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Visites totales</p>
              <HeartPulse className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : visits.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Urgences</p>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : visits.filter(v => v.severity === 'URGENT').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Dossiers médicaux</p>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : new Set(visits.map(v => v.studentName)).size}
            </p>
          </div>
        </div>

        {/* Liste des visites */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-navy-900">Visites médicales</h3>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-gray-400">Chargement...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className={`p-6 border-l-4 ${getSeverityColor(visit.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-navy-900 mb-1">{visit.studentName}</h4>
                      <p className="text-sm text-gray-600 mb-2">{visit.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">
                        {new Date(visit.date).toLocaleDateString('fr-FR')}
                      </p>
                      <span className="text-xs font-medium px-2 py-1 rounded">
                        {visit.severity}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Diagnostic :</span> {visit.diagnosis}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Traitement :</span> {visit.treatment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModulePageLayout>
  );
}

