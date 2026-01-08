import React, { useState } from 'react';
import { BookOpen, FileText, Book } from 'lucide-react';
import CahierJournalDashboard from './CahierJournal/CahierJournalDashboard';
import CahierJournal from './CahierJournal';
import FichesPedagogiques from './FichesPedagogiques';
import CahierDeTextes from './CahierDeTextes';

interface PlanningTabsProps {
  tenantId: string;
}

const PlanningTabs: React.FC<PlanningTabsProps> = ({ tenantId }) => {
  const [activeTab, setActiveTab] = useState('cahier-journal');

  const tabs = [
    { 
      id: 'cahier-journal', 
      label: 'Cahier Journal', 
      icon: BookOpen,
      component: <CahierJournalDashboard tenantId={tenantId} />
    },
    { 
      id: 'fiches-pedagogiques', 
      label: 'Fiches Pédagogiques', 
      icon: FileText,
      component: <FichesPedagogiques tenantId={tenantId} />
    },
    { 
      id: 'cahier-textes', 
      label: 'Cahier de Textes', 
      icon: Book,
      component: <CahierDeTextes tenantId={tenantId} />
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default PlanningTabs;
