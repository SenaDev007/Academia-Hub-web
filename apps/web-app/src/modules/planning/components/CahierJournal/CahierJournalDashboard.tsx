import React, { useState, useEffect } from 'react';
import { Calendar, Plus, BookOpen, Clock, CheckCircle, AlertCircle, Users, FileText, Layout, BookTemplate as Template, Download, UserCheck } from 'lucide-react';
import CahierJournalForm from './CahierJournalForm';
import CahierJournalList from './CahierJournalList';
import CalendrierScolaire from './CalendrierScolaire';
import DirectorDashboard from './DirectorDashboard';
import PlanificationSemaine from './PlanificationSemaine';
import TemplateSelection from './TemplateSelection';
import { CahierJournalEntry } from '../types';
import { useCahierJournalData, createCahierJournalEntry, updateCahierJournalEntry, duplicateCahierJournalEntry, createCahierJournalEntryFromTemplate } from '../../hooks/useCahierJournalData';

const CahierJournalDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'list' | 'calendar' | 'director' | 'planning' | 'templates'>('dashboard');
  const [currentUserRole, setCurrentUserRole] = useState<'enseignant' | 'directeur'>(localStorage.getItem('role') as 'enseignant' | 'directeur' || 'enseignant');
  
  // Utiliser les données réelles depuis le hook
  const { data: entries, loading, error, refetch } = useCahierJournalData();

  // Notifications dynamiques
  const notifications = {
    validationEnAttente: entries.filter(e => e.statut === 'en_attente_validation').length,
    seancesDemain: entries.filter(e => {
      const demain = new Date();
      demain.setDate(demain.getDate() + 1);
      return e.date === demain.toISOString().split('T')[0];
    }).length,
    seancesApprouvees: entries.filter(e => e.statut === 'valide').length
  };

  const stats = {
    totalSeances: entries.length,
    planifiees: entries.filter(e => e.statut === 'planifie').length,
    realisees: entries.filter(e => e.statut === 'realise').length,
    annulees: entries.filter(e => e.statut === 'annule').length,
    reportees: entries.filter(e => e.statut === 'reporte').length,
    enAttenteValidation: entries.filter(e => e.statut === 'en_attente_validation').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const handleCreateEntry = async (entry: Omit<CahierJournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newEntry = await createCahierJournalEntry(entry);
      // Rafraîchir les données après création
      refetch();
      setActiveView('dashboard');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleUpdateEntry = async (updatedEntry: CahierJournalEntry) => {
    try {
      await updateCahierJournalEntry(updatedEntry);
      // Rafraîchir les données après mise à jour
      refetch();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDuplicateEntry = async (entry: CahierJournalEntry) => {
    try {
      await duplicateCahierJournalEntry(entry);
      // Rafraîchir les données après duplication
      refetch();
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
    }
  };

  const handleSelectTemplate = async (template: any) => {
    try {
      await createCahierJournalEntryFromTemplate(template);
      // Rafraîchir les données après création depuis template
      refetch();
      setActiveView('create');
    } catch (error) {
      console.error('Erreur lors de la création depuis template:', error);
    }
  };

  if (activeView === 'create') {
    return (
      <CahierJournalForm 
        onSubmit={handleCreateEntry}
        onCancel={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'list') {
    return (
      <CahierJournalList 
        entries={entries}
        onUpdateEntry={handleUpdateEntry}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'calendar') {
    return (
      <CalendrierScolaire 
        entries={entries}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'director') {
    return (
      <DirectorDashboard 
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'planning') {
    return (
      <PlanificationSemaine 
        entries={entries}
        onCreateEntry={handleCreateEntry}
        onUpdateEntry={handleUpdateEntry}
        onDuplicateEntry={handleDuplicateEntry}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  if (activeView === 'templates') {
    return (
      <TemplateSelection 
        onSelectTemplate={handleSelectTemplate}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BookOpen className="text-blue-600" />
              Cahier Journal
            </h1>
            <p className="text-gray-600 mt-2">Planification et suivi des séances pédagogiques</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rôle:</span>
              <select
                value={currentUserRole}
                onChange={(e) => {
                  setCurrentUserRole(e.target.value as 'enseignant' | 'directeur');
                  localStorage.setItem('role', e.target.value);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="enseignant">Enseignant</option>
                <option value="directeur">Directeur</option>
              </select>
            </div>
            <button
              onClick={() => setActiveView('create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nouvelle Séance
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'dashboard' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Tableau de Bord
          </button>
          <button
            onClick={() => setActiveView('planning')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'planning' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Planification
          </button>
          <button
            onClick={() => setActiveView('templates')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'templates' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Modèles
          </button>
          <button
            onClick={() => setActiveView('list')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'list' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Mes Séances
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'calendar' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Calendrier
          </button>
          <button
            onClick={() => setActiveView('director')}
            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeView === 'director' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              Espace Directeur
              {currentUserRole === 'directeur' && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  2
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Séances</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSeances}</p>
            </div>
            <FileText className="text-gray-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planifiées</p>
              <p className="text-3xl font-bold text-blue-600">{stats.planifiees}</p>
            </div>
            <Clock className="text-blue-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Réalisées</p>
              <p className="text-3xl font-bold text-green-600">{stats.realisees}</p>
            </div>
            <CheckCircle className="text-green-400" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-3xl font-bold text-orange-600">{stats.reportees}</p>
            </div>
            <AlertCircle className="text-orange-400" size={24} />
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Séances Récentes</h3>
          <div className="space-y-4">
            {entries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{entry.matiere} - {entry.classe}</p>
                  <p className="text-sm text-gray-600">{new Date(entry.date).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  entry.statut === 'planifie' 
                    ? 'bg-blue-100 text-blue-800'
                    : entry.statut === 'realise'
                    ? 'bg-green-100 text-green-800'
                    : entry.statut === 'en_cours'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {entry.statut === 'planifie' ? 'Planifiée' :
                   entry.statut === 'realise' ? 'Réalisée' :
                   entry.statut === 'en_cours' ? 'En cours' : 'Reportée'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            {notifications.validationEnAttente > 0 && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Validation en attente</p>
                  <p className="text-xs text-gray-600">{notifications.validationEnAttente} séance(s) en attente de validation</p>
                </div>
              </div>
            )}
            {notifications.seancesDemain > 0 && (
              <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Rappel</p>
                  <p className="text-xs text-gray-600">{notifications.seancesDemain} séance(s) à préparer pour demain</p>
                </div>
              </div>
            )}
            {notifications.seancesApprouvees > 0 && (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Séance approuvée</p>
                  <p className="text-xs text-gray-600">{notifications.seancesApprouvees} séance(s) approuvée(s)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CahierJournalDashboard;