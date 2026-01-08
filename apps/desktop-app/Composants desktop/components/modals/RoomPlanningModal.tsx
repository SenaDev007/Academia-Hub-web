import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, BookOpen, Plus, Edit, Trash2, Check, AlertTriangle } from 'lucide-react';
import { PlanningRoom } from '../../types/planning';
import { reservationService, Reservation, CreateReservationData } from '../../services/reservationService';
import { useUser } from '../../contexts/UserContext';
import EnhancedRoomReservationModal from './EnhancedRoomReservationModal';

interface RoomPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: PlanningRoom;
}

interface Reservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  class: string;
  type: 'cours' | 'examen' | 'réunion' | 'maintenance';
  status: 'confirmé' | 'en_attente' | 'annulé';
}

const RoomPlanningModal: React.FC<RoomPlanningModalProps> = ({
  isOpen,
  onClose,
  room
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'reservations' | 'conflicts'>('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const { user } = useUser();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [conflicts, setConflicts] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmé': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'annulé': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cours': return <BookOpen className="w-4 h-4" />;
      case 'examen': return <AlertTriangle className="w-4 h-4" />;
      case 'réunion': return <User className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const handleNewReservation = () => {
    setIsReservationModalOpen(true);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsReservationModalOpen(true);
  };

  const handleSaveReservation = async (reservationData: any) => {
    try {
      if (selectedReservation) {
        // Mode édition
        await reservationService.updateReservation(selectedReservation.id, {
          room_id: reservationData.roomId,
          date: reservationData.date,
          start_time: reservationData.startTime,
          end_time: reservationData.endTime,
          subject: reservationData.title,
          teacher_id: reservationData.teacherId,
          class_id: reservationData.classId,
          type: 'cours',
          status: 'en_attente',
          description: reservationData.notes,
          school_id: user?.schoolId
        });
      } else {
        // Mode création
        await reservationService.createReservation({
          room_id: reservationData.roomId,
          date: reservationData.date,
          start_time: reservationData.startTime,
          end_time: reservationData.endTime,
          subject: reservationData.title,
          teacher_id: reservationData.teacherId,
          class_id: reservationData.classId,
          type: 'cours',
          status: 'en_attente',
          description: reservationData.notes,
          school_id: user?.schoolId
        });
      }
      
      // Recharger les données
      await loadReservations();
      await loadConflicts();
      
      // Fermer le modal
      setIsReservationModalOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la réservation:', error);
      setError('Erreur lors de la sauvegarde de la réservation');
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        await reservationService.deleteReservation(reservationId);
        await loadReservations();
        await loadConflicts();
      } catch (error) {
        console.error('Erreur lors de la suppression de la réservation:', error);
        setError('Erreur lors de la suppression de la réservation');
      }
    }
  };

  const handleConfirmReservation = async (reservationId: string) => {
    try {
      await reservationService.confirmReservation(reservationId);
      await loadReservations();
      await loadConflicts();
    } catch (error) {
      console.error('Erreur lors de la confirmation de la réservation:', error);
      setError('Erreur lors de la confirmation de la réservation');
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (isOpen && room) {
      loadReservations();
      loadConflicts();
    }
  }, [isOpen, room]);

  const loadReservations = async () => {
    if (!room) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await reservationService.getReservationsByRoom(room.id);
      setReservations(data);
    } catch (err) {
      setError('Erreur lors du chargement des réservations');
      console.error('Erreur chargement réservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConflicts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reservationService.getConflicts();
      setConflicts(data);
    } catch (err) {
      setError('Erreur lors du chargement des conflits');
      console.error('Erreur chargement conflits:', err);
    } finally {
      setLoading(false);
    }
  };





  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Planning de la salle
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {room.name} • {room.type} • Capacité: {room.capacity} places
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Emploi du temps
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'reservations'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Réservations
            </button>
            <button
              onClick={() => setActiveTab('conflicts')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'conflicts'
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Conflits ({conflicts.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Affichage des erreurs */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Indicateur de chargement */}
            {loading && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-800 dark:text-blue-200">Chargement en cours...</span>
                </div>
              </div>
            )}
            {/* Emploi du temps */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Emploi du temps du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h4>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reservations
                    .filter(r => r.date === selectedDate)
                    .map((reservation) => (
                      <div key={reservation.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                            {reservation.status}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditReservation(reservation)}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteReservation(reservation.id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {reservation.start_time} - {reservation.end_time}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {reservation.subject}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {reservation.teacher_name || 'Enseignant non spécifié'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            Classe: {reservation.class_name || 'Classe non spécifiée'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                {reservations.filter(r => r.date === selectedDate).length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>Aucune réservation pour cette date</p>
                  </div>
                )}
              </div>
            )}

            {/* Réservations */}
            {activeTab === 'reservations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Toutes les réservations
                  </h4>
                  <button
                    onClick={handleNewReservation}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle réservation
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Horaire
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Matière
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Enseignant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Classe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reservations.map((reservation) => (
                        <tr key={reservation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {new Date(reservation.date).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {reservation.start_time} - {reservation.end_time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {reservation.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {reservation.teacher_name || 'Enseignant non spécifié'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {reservation.class_name || 'Classe non spécifiée'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                              {reservation.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {reservation.status === 'en_attente' && (
                                <button
                                  onClick={() => handleConfirmReservation(reservation.id)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Confirmer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditReservation(reservation)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReservation(reservation.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Conflits */}
            {activeTab === 'conflicts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Conflits de réservation
                  </h4>
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-sm font-medium">
                    {conflicts.length} conflit(s) détecté(s)
                  </span>
                </div>
                
                {conflicts.length > 0 ? (
                  <div className="space-y-4">
                    {conflicts.map((conflict) => (
                      <div key={conflict.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-red-800 dark:text-red-200">
                              Conflit de réservation
                            </h5>
                            <p className="text-sm text-red-700 dark:text-red-300">
                              {conflict.date} • {conflict.start_time} - {conflict.end_time}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-red-700 dark:text-red-300">
                              <strong>Matière:</strong> {conflict.subject}
                            </p>
                            <p className="text-red-300">
                              <strong>Enseignant:</strong> {conflict.teacher_name || 'Enseignant non spécifié'}
                            </p>
                          </div>
                          <div>
                            <p className="text-red-700 dark:text-red-300">
                              <strong>Classe:</strong> {conflict.class_name || 'Classe non spécifiée'}
                            </p>
                            <p className="text-red-700 dark:text-red-300">
                              <strong>Type:</strong> {conflict.type}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => handleEditReservation(conflict)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Résoudre le conflit
                          </button>
                          <button
                            onClick={() => handleDeleteReservation(conflict.id)}
                            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Check className="w-12 h-12 mx-auto mb-3 text-green-300 dark:text-green-600" />
                    <p>Aucun conflit détecté</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de réservation */}
      <EnhancedRoomReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => {
          setIsReservationModalOpen(false);
          setSelectedReservation(null);
        }}
        onSave={handleSaveReservation}
        reservationData={selectedReservation}
        isEdit={!!selectedReservation}
      />
    </div>
  );
};

export default RoomPlanningModal;
