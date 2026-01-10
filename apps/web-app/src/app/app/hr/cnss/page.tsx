/**
 * ============================================================================
 * HR MODULE - CNSS PAGE
 * ============================================================================
 */

'use client';

import { Shield, Plus } from 'lucide-react';
import { ModuleContainer, ModuleHeader } from '@/components/modules/blueprint';

export default function CNSSPage() {
  return (
    <ModuleContainer>
      <ModuleHeader
        title="CNSS & Déclarations sociales"
        description="Gestion des déclarations CNSS et conformité sociale"
        icon={Shield}
      />
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4 inline mr-2" />
            Nouvelle déclaration
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600">Interface de gestion CNSS en cours de développement...</p>
        </div>
      </div>
    </ModuleContainer>
  );
}

