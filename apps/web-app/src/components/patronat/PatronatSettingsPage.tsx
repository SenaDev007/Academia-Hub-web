/**
 * PatronatSettingsPage Component
 * 
 * Paramètres avec onglets
 */

'use client';

import { useState } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

type Tab = 'info' | 'users' | 'subscription' | 'audit';

export default function PatronatSettingsPage({ tenantId, user }: { tenantId: string; user: User }) {
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const tabs: Array<{ id: Tab; label: string; icon: string }> = [
    { id: 'info', label: 'Informations Patronat', icon: 'building' },
    { id: 'users', label: 'Utilisateurs & rôles', icon: 'user' },
    { id: 'subscription', label: 'Abonnement & paiement', icon: 'finance' },
    { id: 'audit', label: 'Audit logs', icon: 'document' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Gérez les paramètres de votre patronat</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Informations Patronat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du patronat</label>
                <input
                  type="text"
                  defaultValue="Patronat des Écoles Privées"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Région / Département</label>
                <input
                  type="text"
                  defaultValue="Atlantique"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email institutionnel</label>
                <input
                  type="email"
                  defaultValue="contact@patronat.bj"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  defaultValue="+229 XX XX XX XX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-800">
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Abonnement & Paiement</h2>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Abonnement Mensuel</h3>
                  <p className="text-sm text-gray-600">50 000 FCFA / mois</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Actif
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-2">Prochain paiement :</p>
                <p className="text-lg font-semibold text-gray-900">15 Février 2024</p>
              </div>
              <div className="mt-6">
                <button className="px-6 py-2 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-800">
                  Renouveler l'abonnement
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des paiements</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Janvier 2024</p>
                    <p className="text-sm text-gray-600">15 Jan 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">50 000 FCFA</p>
                    <span className="text-xs text-green-600">Payé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Utilisateurs & Rôles</h2>
              <button className="px-4 py-2 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-800">
                Ajouter un utilisateur
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Jean Dupont</p>
                  <p className="text-sm text-gray-600">jean.dupont@patronat.bj</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  PATRONAT_ADMIN
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
            <div className="space-y-2">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Création d'examen</p>
                  <span className="text-xs text-gray-500">20 Jan 2024, 14:30</span>
                </div>
                <p className="text-sm text-gray-600">Utilisateur: Jean Dupont</p>
                <p className="text-sm text-gray-600">Action: Création de l'examen "CEP 2024"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

