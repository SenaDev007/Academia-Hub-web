/**
 * ============================================================================
 * MODULE 3 : EXAMENS, NOTES & BULLETINS - PAGE PRINCIPALE
 * ============================================================================
 */

'use client';

import { useState } from 'react';
import { FileText, ClipboardList, Award, FileCheck, Users, CheckCircle } from 'lucide-react';
import {
  ModuleContainer,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';
import Link from 'next/link';

export default function ExamsGradesPage() {
  const { academicYear, schoolLevel } = useModuleContext();

  const subModules = [
    {
      id: 'exams',
      label: 'Examens',
      href: '/app/exams-grades/exams',
      icon: 'fileText',
      description: 'Gestion des examens (devoir, composition, oral, pratique)',
    },
    {
      id: 'scores',
      label: 'Saisie des notes',
      href: '/app/exams-grades/scores',
      icon: 'clipboardList',
      description: 'Saisie et validation des notes',
    },
    {
      id: 'report-cards',
      label: 'Bulletins',
      href: '/app/exams-grades/report-cards',
      icon: 'fileCheck',
      description: 'Génération et validation des bulletins',
    },
    {
      id: 'honor-rolls',
      label: 'Tableaux d\'honneur',
      href: '/app/exams-grades/honor-rolls',
      icon: 'award',
      description: 'Tableaux d\'honneur et mentions',
    },
    {
      id: 'council-decisions',
      label: 'Décisions de conseil',
      href: '/app/exams-grades/council-decisions',
      icon: 'users',
      description: 'Décisions des conseils de classe',
    },
  ];

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      fileText: FileText,
      clipboardList: ClipboardList,
      award: Award,
      fileCheck: FileCheck,
      users: Users,
    };
    return icons[iconName] || FileText;
  };

  return (
    <ModuleContainer
      header={{
        title: 'Examens, Notes & Bulletins',
        description: 'Gestion complète de l\'évaluation : examens, notes, bulletins, tableaux d\'honneur',
        icon: 'fileText',
      }}
      subModules={{
        modules: subModules.map((m) => ({
          id: m.id,
          label: m.label,
          href: m.href,
        })),
      }}
      content={{
        layout: 'grid',
        children: subModules.map((module) => {
          const Icon = getIcon(module.icon);
          return (
            <Link
              key={module.id}
              href={module.href}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {module.label}
                  </h3>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
              </div>
            </Link>
          );
        }),
      }}
    />
  );
}

