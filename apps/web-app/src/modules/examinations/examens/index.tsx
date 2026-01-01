import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import SaisieNotes from './components/SaisieNotesWrapper';
import BordereauNotes from './components/BordereauNotesWrapper';
import ConseilsClasse from './components/ConseilsClasseWrapper';
import BulletinsNotes from './components/BulletinsNotesWrapper';
import StatistiquesNotes from './components/StatistiquesNotesWrapper';
import TableauxHonneur from './components/TableauxHonneurWrapper';

type ActiveView = 'dashboard' | 'saisie' | 'bordereau' | 'conseils' | 'bulletins' | 'statistiques' | 'tableaux';

const ExamensModule: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={setActiveView} />;
      case 'saisie':
        return <SaisieNotes />;
      case 'bordereau':
        return <BordereauNotes />;
      case 'conseils':
        return <ConseilsClasse />;
      case 'bulletins':
        return <BulletinsNotes />;
      case 'statistiques':
        return <StatistiquesNotes />;
      case 'tableaux':
        return <TableauxHonneur />;
      default:
        return <Dashboard onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default ExamensModule;
