/**
 * ============================================================================
 * MODULE 2 : ORGANISATION PÉDAGOGIQUE & ÉTUDES - PAGE PRINCIPALE
 * ============================================================================
 */

'use client';

import { useState } from 'react';
import { BookOpen, Users, Calendar, FileText, Book, Building2 } from 'lucide-react';
import {
  ModuleContainer,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';
import Link from 'next/link';

export default function PedagogyPage() {
  const { academicYear, schoolLevel } = useModuleContext();

  const subModules = [
    {
      id: 'subjects',
      label: 'Matières',
      href: '/app/pedagogy/subjects',
      icon: 'bookOpen',
      description: 'Gestion des matières par niveau',
    },
    {
      id: 'teachers',
      label: 'Enseignants',
      href: '/app/pedagogy/teachers',
      icon: 'users',
      description: 'Gestion des enseignants et habilitations',
    },
    {
      id: 'rooms',
      label: 'Salles & Infrastructures',
      href: '/app/pedagogy/rooms',
      icon: 'building',
      description: 'Gestion des salles, occupation et planning',
    },
    {
      id: 'timetables',
      label: 'Emplois du temps',
      href: '/app/pedagogy/timetables',
      icon: 'calendar',
      description: 'Gestion des emplois du temps',
    },
    {
      id: 'lesson-plans',
      label: 'Fiches pédagogiques',
      href: '/app/pedagogy/lesson-plans',
      icon: 'fileText',
      description: 'Fiches pédagogiques par matière',
    },
    {
      id: 'daily-logs',
      label: 'Cahiers journaux',
      href: '/app/pedagogy/daily-logs',
      icon: 'bookOpen',
      description: 'Journal quotidien des enseignants',
    },
    {
      id: 'class-diaries',
      label: 'Cahiers de textes',
      href: '/app/pedagogy/class-diaries',
      icon: 'book',
      description: 'Devoirs et notes pour les élèves',
    },
  ];

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      bookOpen: BookOpen,
      users: Users,
      calendar: Calendar,
      fileText: FileText,
      book: Book,
      building: Building2,
    };
    return icons[iconName] || BookOpen;
  };

  return (
    <ModuleContainer
      header={{
        title: 'Organisation Pédagogique & Études',
        description: 'Gestion complète de la pédagogie : matières, enseignants, emplois du temps, fiches pédagogiques',
        icon: 'bookOpen',
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

