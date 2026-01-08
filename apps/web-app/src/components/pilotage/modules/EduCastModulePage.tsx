/**
 * ============================================================================
 * MODULE EDUCAST
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Radio, Play, Users, TrendingUp } from 'lucide-react';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';
import ModulePageLayout from './ModulePageLayout';

interface Broadcast {
  id: string;
  title: string;
  type: 'LIVE' | 'PODCAST' | 'VIDEO';
  scheduledAt: string;
  views: number;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
}

export default function EduCastModulePage() {
  const { currentYear } = useAcademicYear();
  const { currentLevel } = useSchoolLevel();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBroadcasts = async () => {
      if (!currentYear || !currentLevel) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/educast/broadcasts?academicYearId=${currentYear.id}&schoolLevelId=${currentLevel.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setBroadcasts(data);
        }
      } catch (error) {
        console.error('Failed to load broadcasts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBroadcasts();
  }, [currentYear, currentLevel]);

  return (
    <ModulePageLayout
      title="EduCast"
      subtitle={`${currentLevel?.code === 'MATERNELLE' ? 'Maternelle' :
                 currentLevel?.code === 'PRIMAIRE' ? 'Primaire' :
                 currentLevel?.code === 'SECONDAIRE' ? 'Secondaire' : currentLevel?.code} | ${currentYear?.name || ''}`}
      actions={
        <>
          <button className="flex items-center space-x-2 px-4 py-2 bg-navy-900 text-white rounded-md hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouvelle diffusion</span>
          </button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total diffusions</p>
              <Radio className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : broadcasts.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Vues totales</p>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : broadcasts.reduce((sum, b) => sum + b.views, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">En direct</p>
              <Play className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : broadcasts.filter(b => b.status === 'LIVE').length}
            </p>
          </div>
        </div>

        {/* Liste des diffusions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-navy-900">Diffusions</h3>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-gray-400">Chargement...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {broadcasts.map((broadcast) => (
                <div key={broadcast.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Radio className="w-5 h-5 text-gray-400" />
                        <h4 className="text-base font-semibold text-navy-900">{broadcast.title}</h4>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            broadcast.status === 'LIVE'
                              ? 'bg-red-100 text-red-800'
                              : broadcast.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {broadcast.status === 'LIVE'
                            ? 'En direct'
                            : broadcast.status === 'SCHEDULED'
                            ? 'Planifiée'
                            : 'Terminée'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{broadcast.type}</span>
                        <span>•</span>
                        <span>{new Date(broadcast.scheduledAt).toLocaleString('fr-FR')}</span>
                        <span>•</span>
                        <span>{broadcast.views} vues</span>
                      </div>
                    </div>
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

