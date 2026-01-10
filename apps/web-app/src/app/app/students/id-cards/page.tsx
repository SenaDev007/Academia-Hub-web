/**
 * ============================================================================
 * STUDENTS ID CARDS PAGE - MODULE 1
 * ============================================================================
 */

'use client';

import { ModuleContainer } from '@/components/modules/blueprint';
import StudentIdCardsSection from '@/components/students/StudentIdCardsSection';

export default function StudentsIdCardsPage() {
  return (
    <ModuleContainer
      header={{
        title: 'Cartes Scolaires',
        description: 'Génération et gestion des cartes d\'identité scolaires officielles',
        icon: 'users',
        kpis: [],
      }}
      content={{
        layout: 'default',
        children: <StudentIdCardsSection />,
      }}
    />
  );
}

