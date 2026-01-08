import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import NotificationService from './services/NotificationService';

interface User {
  id: string;
  name: string;
  role: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur';
  matieres?: string[];
  classes?: string[];
}

interface CalendrierScolaireProps {
  user: User;
}

interface EvenementScolaire {
  id: string;
  titre: string;
  type: 'conge' | 'examen' | 'reunion' | 'formation' | 'evenement';
  dateDebut: string;
  dateFin: string;
  description?: string;
  couleur: string;
}

interface JourCalendrier {
  date: Date;
  estAujourdhui: boolean;
  estAutreMois: boolean;
  evenements: EvenementScolaire[];
  aCours: boolean;
}

const CalendrierScolaire: React.FC<CalendrierScolaireProps> = ({ user }) => {
  const [dateActuelle, setDateActuelle] = useState(new Date());
  const [vueType, setVueType] = useState<'mois' | 'semaine'>('mois');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EvenementScolaire | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    titre: '',
    type: 'evenement',
    dateDebut: '',
    dateFin: '',
    description: ''
  });

  // Événements simulés du calendrier scolaire béninois
  const evenements: EvenementScolaire[] = [
    {
      id: '1',
      titre: 'Rentrée scolaire 2024-2025',
      type: 'evenement',
      dateDebut: '2024-09-16',
      dateFin: '2024-09-16',
      description: 'Début de l\'année scolaire 2024-2025',
      couleur: 'bg-blue-500'
    },
    {
      id: '2',
      titre: 'Vacances de Toussaint',
      type: 'conge',
      dateDebut: '2024-10-28',
      dateFin: '2024-11-05',
      description: 'Congés de Toussaint',
      couleur: 'bg-orange-500'
    },
    {
      id: '3',
      titre: 'Compositions du 1er trimestre',
      type: 'examen',
      dateDebut: '2024-12-09',
      dateFin: '2024-12-14',
      description: 'Évaluations trimestrielles',
      couleur: 'bg-red-500'
    },
    {
      id: '4',
      titre: 'Vacances de Noël',
      type: 'conge',
      dateDebut: '2024-12-21',
      dateFin: '2025-01-07',
      description: 'Congés de fin d\'année',
      couleur: 'bg-green-500'
    },
    {
      id: '5',
      titre: 'Conseil pédagogique',
      type: 'reunion',
      dateDebut: '2025-01-25',
      dateFin: '2025-01-25',
      description: 'Réunion mensuelle du conseil pédagogique',
      couleur: 'bg-purple-500'
    },
    {
      id: '6',
      titre: 'Formation APC',
      type: 'formation',
      dateDebut: '2025-02-15',
      dateFin: '2025-02-16',
      description: 'Formation sur l\'Approche Par Compétences',
      couleur: 'bg-indigo-500'
    }
  ];

  const typesEvenement = [
    { value: 'conge', label: 'Congés', couleur: 'bg-orange-500' },
    { value: 'examen', label: 'Examens', couleur: 'bg-red-500' },
    { value: 'reunion', label: 'Réunions', couleur: 'bg-purple-500' },
    { value: 'formation', label: 'Formations', couleur: 'bg-indigo-500' },
    { value: 'evenement', label: 'Événements', couleur: 'bg-blue-500' }
  ];

  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const joursNoms = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const ajouterEvenement = () => {
    if (!newEvent.titre || !newEvent.dateDebut || !newEvent.dateFin) {
      NotificationService.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const nouvelEvenement: EvenementScolaire = {
      id: 'event_' + Date.now(),
      ...newEvent,
      couleur: typesEvenement.find(t => t.value === newEvent.type)?.couleur || 'bg-blue-500'
    };
    
    // Ajouter à la liste (en production, sauvegarder en base)
    evenements.push(nouvelEvenement);
    
    NotificationService.showSuccess('Événement ajouté avec succès');
    setShowAddEventModal(false);
    setNewEvent({
      titre: '',
      type: 'evenement',
      dateDebut: '',
      dateFin: '',
      description: ''
    });
  };

  const modifierEvenement = (event: EvenementScolaire) => {
    setNewEvent({
      titre: event.titre,
      type: event.type,
      dateDebut: event.dateDebut,
      dateFin: event.dateFin,
      description: event.description || ''
    });
    setSelectedEvent(event);
    setShowAddEventModal(true);
  };

  const supprimerEvenement = (eventId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      const index = evenements.findIndex(e => e.id === eventId);
      if (index !== -1) {
        evenements.splice(index, 1);
        NotificationService.showSuccess('Événement supprimé avec succès');
      }
    }
  };

  const genererCalendrierMois = (): JourCalendrier[] => {
    const annee = dateActuelle.getFullYear();
    const mois = dateActuelle.getMonth();
    const premierJour = new Date(annee, mois, 1);
    const dernierJour = new Date(annee, mois + 1, 0);
    const premierJourSemaine = premierJour.getDay();
    const nombreJours = dernierJour.getDate();

    const jours: JourCalendrier[] = [];
    const aujourd_hui = new Date();

    // Jours du mois précédent
    const moisPrecedent = new Date(annee, mois - 1, 0);
    for (let i = premierJourSemaine - 1; i >= 0; i--) {
      const date = new Date(annee, mois - 1, moisPrecedent.getDate() - i);
      jours.push({
        date,
        estAujourdhui: false,
        estAutreMois: true,
        evenements: getEvenementsJour(date),
        aCours: false
      });
    }

    // Jours du mois actuel
    for (let jour = 1; jour <= nombreJours; jour++) {
      const date = new Date(annee, mois, jour);
      jours.push({
        date,
        estAujourdhui: date.toDateString() === aujourd_hui.toDateString(),
        estAutreMois: false,
        evenements: getEvenementsJour(date),
        aCours: estJourCours(date)
      });
    }

    // Jours du mois suivant pour compléter la grille
    const joursRestants = 42 - jours.length; // 6 semaines * 7 jours
    for (let jour = 1; jour <= joursRestants; jour++) {
      const date = new Date(annee, mois + 1, jour);
      jours.push({
        date,
        estAujourdhui: false,
        estAutreMois: true,
        evenements: getEvenementsJour(date),
        aCours: false
      });
    }

    return jours;
  };

  const getEvenementsJour = (date: Date): EvenementScolaire[] => {
    return evenements.filter(event => {
      const dateDebut = new Date(event.dateDebut);
      const dateFin = new Date(event.dateFin);
      return date >= dateDebut && date <= dateFin;
    });
  };

  const estJourCours = (date: Date): boolean => {
    const jour = date.getDay();
    // Pas de cours le dimanche (0) et le samedi (6)
    if (jour === 0 || jour === 6) return false;
    
    // Vérifier s'il y a des congés ce jour
    return !getEvenementsJour(date).some(event => event.type === 'conge');
  };

  const changerMois = (direction: number) => {
    setDateActuelle(new Date(dateActuelle.getFullYear(), dateActuelle.getMonth() + direction, 1));
  };

  const allerAujourdhui = () => {
    setDateActuelle(new Date());
  };

  const jours = genererCalendrierMois();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendrier Scolaire</h2>
          <p className="text-gray-600">Année scolaire 2024-2025 - République du Bénin</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVueType('mois')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                vueType === 'mois' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setVueType('semaine')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                vueType === 'semaine' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Semaine
            </button>
          </div>
          {(user.role === 'directeur' || user.role === 'administrateur') && (
            <button
              onClick={() => setShowAddEventModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvel événement
            </button>
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Légende</h3>
        <div className="flex flex-wrap gap-4">
          {typesEvenement.map(type => (
            <div key={type.value} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${type.couleur} mr-2`}></div>
              <span className="text-sm text-gray-600">{type.label}</span>
            </div>
          ))}
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-gray-300 mr-2"></div>
            <span className="text-sm text-gray-600">Jours sans cours</span>
          </div>
        </div>
      </div>

      {/* Navigation du calendrier */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => changerMois(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              {moisNoms[dateActuelle.getMonth()]} {dateActuelle.getFullYear()}
            </h3>
            <button
              onClick={() => changerMois(1)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={allerAujourdhui}
            className="bg-blue-600 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Grille du calendrier */}
        <div className="p-4">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {joursNoms.map(jour => (
              <div key={jour} className="p-2 text-center text-sm font-medium text-gray-700 bg-gray-50 rounded-md">
                {jour}
              </div>
            ))}
          </div>

          {/* Jours du calendrier */}
          <div className="grid grid-cols-7 gap-px">
            {jours.map((jour, index) => (
              <div
                key={index}
                className={`min-h-24 p-2 bg-white border border-gray-200 rounded-md ${
                  jour.estAutreMois ? 'opacity-40' : ''
                } ${jour.estAujourdhui ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  jour.estAujourdhui ? 'text-blue-600' : 
                  jour.aCours ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {jour.date.getDate()}
                </div>
                
                {/* Événements du jour */}
                <div className="space-y-1">
                  {jour.evenements.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs text-white px-2 py-1 rounded-md truncate cursor-pointer ${event.couleur}`}
                      onClick={() => setSelectedEvent(event)}
                      title={event.titre}
                    >
                      {event.titre}
                    </div>
                  ))}
                  {jour.evenements.length > 2 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{jour.evenements.length - 2} autres
                    </div>
                  )}
                </div>

                {/* Indicateur jour de cours */}
                {jour.aCours && jour.evenements.length === 0 && (
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-1"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Événements à venir */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
            Événements à venir
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {evenements
              .filter(event => new Date(event.dateDebut) >= new Date())
              .slice(0, 5)
              .map(event => (
                <div key={event.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                  <div className={`w-4 h-4 rounded-full ${event.couleur} mr-3`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.titre}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.dateDebut).toLocaleDateString('fr-FR')}
                      {event.dateDebut !== event.dateFin && 
                        ` - ${new Date(event.dateFin).toLocaleDateString('fr-FR')}`
                      }
                    </p>
                  </div>
                  {(user.role === 'directeur' || user.role === 'administrateur') && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => modifierEvenement(event)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => supprimerEvenement(event.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modal détail événement */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedEvent.titre}</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Type: </span>
                <span className="text-sm text-gray-600 capitalize">{selectedEvent.type}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Date: </span>
                <span className="text-sm text-gray-600">
                  {new Date(selectedEvent.dateDebut).toLocaleDateString('fr-FR')}
                  {selectedEvent.dateDebut !== selectedEvent.dateFin && 
                    ` - ${new Date(selectedEvent.dateFin).toLocaleDateString('fr-FR')}`
                  }
                </span>
              </div>
              {selectedEvent.description && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Description: </span>
                  <p className="text-sm text-gray-600 mt-1">{selectedEvent.description}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout/modification événement */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={newEvent.titre}
                  onChange={(e) => setNewEvent({...newEvent, titre: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Titre de l'événement"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {typesEvenement.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début *</label>
                  <input
                    type="date"
                    value={newEvent.dateDebut}
                    onChange={(e) => setNewEvent({...newEvent, dateDebut: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin *</label>
                  <input
                    type="date"
                    value={newEvent.dateFin}
                    onChange={(e) => setNewEvent({...newEvent, dateFin: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Description de l'événement"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddEventModal(false);
                  setSelectedEvent(null);
                  setNewEvent({
                    titre: '',
                    type: 'evenement',
                    dateDebut: '',
                    dateFin: '',
                    description: ''
                  });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={ajouterEvenement}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {selectedEvent ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendrierScolaire;