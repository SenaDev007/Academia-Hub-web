import React, { useState } from 'react';
import { Calendar, BookOpen, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, FileText, Download } from 'lucide-react';
import CahierTexteService from './services/CahierTexteService';
import NotificationService from './services/NotificationService';

interface User {
  id: string;
  name: string;
  role: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur';
  matieres?: string[];
  classes?: string[];
}

interface CahierTexteBoardProps {
  user: User;
}

const CahierTexteBoard: React.FC<CahierTexteBoardProps> = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('semaine');

  // Données simulées
  const stats = {
    coursEnseigne: 24,
    devoirsDonnes: 18,
    heuresEffectives: 32,
    tauxAvancement: 78,
    coursPrevus: 28,
    coursValides: 22,
    enAttente: 5,
    alertes: 3
  };

  const recentActivities = [
    {
      id: 1,
      type: 'cours',
      matiere: 'Mathématiques',
      classe: '6èmeA',
      date: '2025-01-20',
      titre: 'Les nombres décimaux - Addition et soustraction',
      statut: 'validé',
      duree: '2h'
    },
    {
      id: 2,
      type: 'devoir',
      matiere: 'Physique',
      classe: '5èmeB',
      date: '2025-01-19',
      titre: 'Exercices sur la masse volumique',
      statut: 'en_attente',
      duree: '1h'
    },
    {
      id: 3,
      type: 'cours',
      matiere: 'Mathématiques',
      classe: '4èmeC',
      date: '2025-01-18',
      titre: 'Théorème de Pythagore - Applications',
      statut: 'validé',
      duree: '2h'
    }
  ];

  const exporterTableauBord = async () => {
    try {
      NotificationService.showInfo('Génération du rapport tableau de bord...');
      
      const dashboardData = {
        stats,
        recentActivities,
        periode: selectedPeriod,
        user: user.name,
        dateGeneration: new Date().toISOString()
      };
      
      const blob = await CahierTexteService.exporterPDF(dashboardData, 'rapport');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `tableau_bord_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      NotificationService.showSuccess('Rapport tableau de bord exporté avec succès');
    } catch (error) {
      NotificationService.showError('Erreur lors de l\'export');
      console.error('Erreur export dashboard:', error);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'validé': return 'text-green-600 bg-green-100';
      case 'en_attente': return 'text-yellow-600 bg-yellow-100';
      case 'refusé': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'validé': return 'Validé';
      case 'en_attente': return 'En attente';
      case 'refusé': return 'Refusé';
      default: return 'Brouillon';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec période */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord</h2>
          <p className="text-gray-600">Vue d'ensemble de votre activité pédagogique</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center" onClick={exporterTableauBord}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cours enseignés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.coursEnseigne}</p>
              <p className="text-sm text-gray-600">sur {stats.coursPrevus} prévus</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${(stats.coursEnseigne / stats.coursPrevus) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Devoirs donnés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.devoirsDonnes}</p>
              <p className="text-sm text-gray-600">ce mois</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Heures effectives</p>
              <p className="text-2xl font-bold text-gray-900">{stats.heuresEffectives}h</p>
              <p className="text-sm text-gray-600">cette semaine</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taux d'avancement</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tauxAvancement}%</p>
              <p className="text-sm text-gray-600">du programme</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statuts et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            Statut des validations
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cours validés</span>
              <span className="text-sm font-medium text-green-600">{stats.coursValides}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En attente</span>
              <span className="text-sm font-medium text-yellow-600">{stats.enAttente}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">À corriger</span>
              <span className="text-sm font-medium text-red-600">2</span>
            </div>
          </div>
        </div>

        {user.role !== 'enseignant' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              Vue administrative
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Enseignants actifs</span>
                <span className="text-sm font-medium text-blue-600">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Classes suivies</span>
                <span className="text-sm font-medium text-blue-600">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Retards de saisie</span>
                <span className="text-sm font-medium text-red-600">5</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            Alertes et notifications
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">Saisie en retard pour la classe 5èmeB</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">Nouveau programme disponible en Mathématiques</p>
            </div>
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">Rapport mensuel généré avec succès</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activités récentes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'cours' ? (
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.titre}</p>
                    <p className="text-sm text-gray-600">
                      {activity.matiere} • {activity.classe} • {activity.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">{activity.duree}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.statut)}`}>
                    {getStatusText(activity.statut)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CahierTexteBoard;