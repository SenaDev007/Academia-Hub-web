/**
 * ============================================================================
 * HR MODULE - ATTENDANCE PAGE
 * ============================================================================
 */

'use client';

import { Clock, Plus } from 'lucide-react';
import { ModuleContainer, ModuleHeader } from '@/components/modules/blueprint';

export default function AttendancePage() {
  return (
    <ModuleContainer>
      <ModuleHeader
        title="Présences & Temps de travail"
        description="Gestion des présences et heures supplémentaires"
        icon={Clock}
      />
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4 inline mr-2" />
            Enregistrer présence
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600">Interface de gestion des présences en cours de développement...</p>
        </div>
      </div>
    </ModuleContainer>
  );
}

