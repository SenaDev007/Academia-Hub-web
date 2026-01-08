/**
 * ============================================================================
 * MODULE COMMUNICATION
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Send, MessageSquare, Bell, Mail } from 'lucide-react';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useSchoolLevel } from '@/hooks/useSchoolLevel';
import ModulePageLayout from './ModulePageLayout';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'NOTIFICATION';
  status: 'DRAFT' | 'SENT' | 'SCHEDULED';
  createdAt: string;
}

export default function CommunicationModulePage() {
  const { currentYear } = useAcademicYear();
  const { currentLevel } = useSchoolLevel();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!currentYear || !currentLevel) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/communication/announcements?academicYearId=${currentYear.id}&schoolLevelId=${currentLevel.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Failed to load announcements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnnouncements();
  }, [currentYear, currentLevel]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SMS':
        return MessageSquare;
      case 'EMAIL':
        return Mail;
      case 'WHATSAPP':
        return MessageSquare;
      case 'NOTIFICATION':
        return Bell;
      default:
        return MessageSquare;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SMS: 'SMS',
      EMAIL: 'Email',
      WHATSAPP: 'WhatsApp',
      NOTIFICATION: 'Notification',
    };
    return labels[type] || type;
  };

  return (
    <ModulePageLayout
      title="Communication"
      subtitle={`${currentLevel?.code === 'MATERNELLE' ? 'Maternelle' :
                 currentLevel?.code === 'PRIMAIRE' ? 'Primaire' :
                 currentLevel?.code === 'SECONDAIRE' ? 'Secondaire' : currentLevel?.code} | ${currentYear?.name || ''}`}
      actions={
        <>
          <button className="flex items-center space-x-2 px-4 py-2 bg-navy-900 text-white rounded-md hover:bg-navy-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nouvelle annonce</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Send className="w-4 h-4" />
            <span>Envoyer un message</span>
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
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : announcements.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Envoyées</p>
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : announcements.filter(a => a.status === 'SENT').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Brouillons</p>
              <MessageSquare className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : announcements.filter(a => a.status === 'DRAFT').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Planifiées</p>
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-navy-900">
              {isLoading ? '—' : announcements.filter(a => a.status === 'SCHEDULED').length}
            </p>
          </div>
        </div>

        {/* Liste des annonces */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-navy-900">Annonces</h3>
          </div>
          {isLoading ? (
            <div className="p-6 text-center text-gray-400">Chargement...</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {announcements.map((announcement) => {
                const Icon = getTypeIcon(announcement.type);
                return (
                  <div
                    key={announcement.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Icon className="w-5 h-5 text-gray-400" />
                          <h4 className="text-base font-semibold text-navy-900">
                            {announcement.title}
                          </h4>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {getTypeLabel(announcement.type)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              announcement.status === 'SENT'
                                ? 'bg-green-100 text-green-800'
                                : announcement.status === 'SCHEDULED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {announcement.status === 'SENT'
                              ? 'Envoyée'
                              : announcement.status === 'SCHEDULED'
                              ? 'Planifiée'
                              : 'Brouillon'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{announcement.content}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(announcement.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ModulePageLayout>
  );
}

