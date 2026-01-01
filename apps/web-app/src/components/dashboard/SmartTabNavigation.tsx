import React from 'react';
import { 
  Users, 
  FileSpreadsheet, 
  Presentation, 
  Award, 
  Calculator, 
  PieChart,
  ExternalLink
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  count?: number | null;
  color: string;
  isExternal?: boolean;
  externalModule?: string;
  externalTab?: string;
}

interface SmartTabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onExternalNavigation: (module: string, tab?: string) => void;
}

const SmartTabNavigation: React.FC<SmartTabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onExternalNavigation
}) => {
  const handleTabClick = (tab: TabItem) => {
    if (tab.isExternal && tab.externalModule) {
      onExternalNavigation(tab.externalModule, tab.externalTab);
    } else {
      onTabChange(tab.id);
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isExternal = tab.isExternal;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex items-center transition-all duration-200 ${
                isActive
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className={`p-2 rounded-lg mr-2 transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="mr-2">{tab.label}</span>
              
              {/* Indicateur externe */}
              {isExternal && (
                <ExternalLink className="w-3 h-3 text-gray-400 ml-1" />
              )}
              
              {/* Compteur */}
              {tab.count !== null && tab.count !== undefined && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SmartTabNavigation;
