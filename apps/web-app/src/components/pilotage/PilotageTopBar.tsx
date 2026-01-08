/**
 * ============================================================================
 * PILOTAGE TOP BAR - CONTEXTE & MAÎTRISE
 * ============================================================================
 * 
 * Top Bar qui rappelle TOUJOURS où on se trouve.
 * Aucune action sans contexte.
 * 
 * Philosophie : Montrer avant de demander
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bell, RefreshCw, User, LogOut, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AcademicYearSelector from './AcademicYearSelector';
import SchoolLevelSelector from './SchoolLevelSelector';
import AcademicTrackSelector from '../dashboard/AcademicTrackSelector';
import { useOffline, useSyncStatus } from '@/hooks/useOffline';
import type { User, Tenant } from '@/types';

interface PilotageTopBarProps {
  user: User;
  tenant: Tenant;
}

export default function PilotageTopBar({ user, tenant }: PilotageTopBarProps) {
  const router = useRouter();
  const isOnline = useOffline();
  const { isSyncing, pendingCount } = useSyncStatus();
  const [orionAlertsCount, setOrionAlertsCount] = useState(0);

  // Charger les alertes ORION
  useEffect(() => {
    const loadOrionAlerts = async () => {
      try {
        const response = await fetch('/api/orion/alerts?status=active');
        if (response.ok) {
          const alerts = await response.json();
          setOrionAlertsCount(alerts.length || 0);
        }
      } catch (error) {
        console.error('Failed to load ORION alerts:', error);
      }
    };

    loadOrionAlerts();
    const interval = setInterval(loadOrionAlerts, 60000); // Toutes les minutes
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      router.push('/login');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Gauche : Logo + Contexte */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Image
                src="/images/logo-Academia Hub.png"
                alt="Academia Hub"
                width={32}
                height={32}
                className="rounded"
              />
              <span className="text-lg font-bold text-navy-900 hidden sm:block">
                Academia Hub
              </span>
            </div>

            {/* Séparateur */}
            <div className="h-6 w-px bg-gray-300" />

            {/* Sélecteurs de Contexte */}
            <div className="flex items-center space-x-4">
              <AcademicYearSelector />
              <SchoolLevelSelector />
              <AcademicTrackSelector />
            </div>
          </div>

          {/* Droite : Actions & Profil */}
          <div className="flex items-center space-x-4">
            {/* Indicateur Offline/Online */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="hidden sm:inline">Sync...</span>
                    </>
                  ) : pendingCount > 0 ? (
                    <>
                      <Wifi className="w-4 h-4 text-yellow-600" />
                      <span className="hidden sm:inline">{pendingCount} en attente</span>
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 text-green-600" />
                      <span className="hidden sm:inline">En ligne</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-orange-600">
                  <WifiOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Hors ligne</span>
                </div>
              )}
            </div>

            {/* Alertes ORION */}
            {orionAlertsCount > 0 && (
              <button
                onClick={() => router.push('/app/orion/alerts')}
                className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
                title="Alertes ORION"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {orionAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {orionAlertsCount > 9 ? '9+' : orionAlertsCount}
                  </span>
                )}
              </button>
            )}

            {/* Profil */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="w-9 h-9 bg-navy-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

