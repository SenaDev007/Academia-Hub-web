import React, { useState, useEffect } from 'react';
import { Save, MapPin, Calendar, Clock, BookOpen, User, X, Plus, CheckCircle, AlertCircle, Users, Building, RefreshCw, Info } from 'lucide-react';
import { planningService } from '../../services/planningService';
import { useUser } from '../../contexts/UserContext';

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  subject: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  level: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
  room_id?: string;
}

interface EnhancedRoomReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reservationData: any) => void;
  reservationData?: any;
  isEdit?: boolean;
  classes?: Class[];
  rooms?: Room[];
  teachers?: Teacher[];
  subjects?: Subject[];
}

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`p-4 rounded-lg shadow-lg flex items-center space-x-3 ${
        type === 'success' 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700" title="Fermer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const EnhancedRoomReservationModal: React.FC<EnhancedRoomReservationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  reservationData,
  isEdit = false,
  classes = [],
  rooms = [],
  teachers = [],
  subjects = []
}) => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Fonction pour déterminer le type de salle selon le niveau scolaire
  const getRoomTypeForClass = (classLevel: string): 'fixed' | 'flexible' | 'mixed' => {
    const level = classLevel.toLowerCase();
    
    // Maternelle et Primaire : salles fixes
    if (level.includes('maternelle') || level.includes('primaire')) {
      return 'fixed';
    }
    
    // Secondaire : logique mixte (à configurer par l'école)
    if (level.includes('secondaire') || level.includes('6') || level.includes('5') || 
        level.includes('4') || level.includes('3') || level.includes('2nde') || 
        level.includes('1ère') || level.includes('tle')) {
      return 'mixed';
    }
    
    return 'flexible';
  };

  // Fonction pour vérifier si une classe nécessite des réservations de salles
  const requiresRoomReservation = (classLevel: string): boolean => {
    const roomType = getRoomTypeForClass(classLevel);
    return roomType === 'flexible' || roomType === 'mixed';
  };

  // Fonction pour obtenir les salles disponibles pour une classe selon son type
  const getAvailableRoomsForClass = (classId: string): Room[] => {
    if (!rooms || !classes) return [];
    
    const classObj = classes.find(c => c.id === classId);
    if (!classObj) return [];
    
    // Retourner toutes les salles disponibles pour permettre à l'utilisateur de choisir librement
    return rooms;
  };

  const [formData, setFormData] = useState({
    roomId: reservationData?.roomId || '',
    teacherId: reservationData?.teacherId || '',
    subjectId: reservationData?.subjectId || '',
    classId: reservationData?.classId || '',
    date: reservationData?.date || new Date().toISOString().split('T')[0],
    startTime: reservationData?.startTime || '08:00',
    endTime: reservationData?.endTime || '09:00',
    isRecurring: reservationData?.isRecurring || false,
    recurrencePattern: reservationData?.recurrencePattern || 'weekly',
    recurrenceEndDate: reservationData?.recurrenceEndDate || (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date.toISOString().split('T')[0];
    })(),
    notes: reservationData?.notes || ''
  });

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

  // Variables calculées
  const selectedClass = classes.find(c => c.id === formData.classId);
  const selectedTeacher = teachers.find(t => t.id === formData.teacherId);
  const roomType = selectedClass ? getRoomTypeForClass(selectedClass.level) : 'flexible';

  // Fonction pour vérifier si un enseignant est pour maternelle/primaire
  const isTeacherForMaternellePrimaire = (teacher: Teacher): boolean => {
    if (!selectedClass) return false;
    const classLevel = selectedClass.level.toLowerCase();
    return classLevel.includes('maternelle') || classLevel.includes('primaire');
  };


  useEffect(() => {
    if (isOpen && formData.classId) {
      const rooms = getAvailableRoomsForClass(formData.classId);
      setAvailableRooms(rooms);
      
      // Si une seule salle disponible (salle fixe), la sélectionner automatiquement
      if (rooms.length === 1) {
        setFormData(prev => ({ ...prev, roomId: rooms[0].id }));
      }
    }
  }, [formData.classId, isOpen]);

  useEffect(() => {
    if (formData.classId) {
      const classObj = classes.find(c => c.id === formData.classId);
      
      if (classObj) {
        // Filtrer les enseignants selon le niveau de la classe
        const classLevel = classObj.level.toLowerCase();
        
        const filtered = teachers.filter(teacher => {
          // Logique de filtrage des enseignants selon le niveau
          return true; // Pour l'instant, tous les enseignants
        });
        setFilteredTeachers(filtered);

        // Filtrer les matières selon le niveau de la classe
        const subjectFiltered = subjects.filter(subject => {
          if (classLevel.includes('maternelle')) {
            return subject.level === 'maternelle';
          } else if (classLevel.includes('primaire')) {
            return subject.level === 'primaire';
          } else if (classLevel.includes('secondaire') || classLevel.includes('6') || 
                     classLevel.includes('5') || classLevel.includes('4') || 
                     classLevel.includes('3') || classLevel.includes('2nde') || 
                     classLevel.includes('1ère') || classLevel.includes('tle')) {
            return subject.level === 'secondaire_1er_cycle' || subject.level === 'secondaire_2nd_cycle';
          }
          return true;
        });
        setFilteredSubjects(subjectFiltered);
      }
    } else {
      // Si aucune classe sélectionnée, afficher tous les enseignants
      setFilteredTeachers(teachers);
      setFilteredSubjects(subjects);
    }
  }, [formData.classId, classes, teachers, subjects]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Gérer le cas des enseignants polyvalents (maternelle/primaire)
      const isPolyvalentTeacher = selectedTeacher && isTeacherForMaternellePrimaire(selectedTeacher);
      const subjectName = isPolyvalentTeacher ? 'Toutes les matières' : subjects.find(s => s.id === formData.subjectId)?.name;
      
      const reservationData = {
        ...formData,
        schoolId: user?.schoolId,
        teacherName: selectedTeacher ? `${selectedTeacher.first_name || ''} ${selectedTeacher.last_name || ''}`.trim() : '',
        roomName: rooms.find(r => r.id === formData.roomId)?.name,
        className: selectedClass?.name,
        subjectName: subjectName,
        subjectId: isPolyvalentTeacher ? 'all-subjects' : formData.subjectId,
        status: 'en_attente'
      };

      await onSave(reservationData);
      setToastMessage(isEdit ? 'Réservation modifiée avec succès' : 'Réservation créée avec succès');
      setToastType('success');
      setShowToast(true);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setToastMessage('Erreur lors de la sauvegarde de la réservation');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const needsReservation = selectedClass ? requiresRoomReservation(selectedClass.level) : false;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {isEdit ? 'Modifier la réservation' : 'Nouvelle réservation de salle'}
                  </h2>
                  <p className="text-emerald-100 text-sm">
                    {isEdit ? 'Modifiez les détails de la réservation' : 'Planifiez l\'utilisation d\'une salle selon le type de classe'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200"
                title="Fermer le modal"
                aria-label="Fermer le modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations de base */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informations de base</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Classe */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Classe *
                    </label>
                    <select
                      name="classId"
                      value={formData.classId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                      aria-label="Sélectionner une classe"
                    >
                      <option value="">Sélectionner une classe</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.level}) - {getRoomTypeForClass(cls.level) === 'fixed' ? 'Salle fixe' : 'Réservation requise'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Salle */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Salle *
                    </label>
                    <select
                      name="roomId"
                      value={formData.roomId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                      aria-label="Sélectionner une salle"
                      disabled={!formData.classId}
                    >
                      <option value="">
                        {!formData.classId ? 'Sélectionnez d\'abord une classe' : 'Sélectionner une salle'}
                      </option>
                      {availableRooms.map(room => (
                        <option key={room.id} value={room.id}>
                          {room.name} ({room.type}) - {room.capacity} places
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Enseignant */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enseignant *
                    </label>
                    <select
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                      aria-label="Sélectionner un enseignant"
                      disabled={!formData.classId}
                    >
                      <option value="">
                        {!formData.classId ? 'Sélectionnez d\'abord une classe' : 'Sélectionner un enseignant'}
                      </option>
                      {filteredTeachers.length > 0 ? (
                        filteredTeachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim()} - {teacher.subject || 'Aucune matière'}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          Aucun enseignant disponible
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Matière */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Matière {selectedTeacher && isTeacherForMaternellePrimaire(selectedTeacher) ? '' : '*'}
                    </label>
                    <select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required={!selectedTeacher || !isTeacherForMaternellePrimaire(selectedTeacher)}
                      aria-label="Sélectionner une matière"
                      disabled={!formData.classId || (selectedTeacher && isTeacherForMaternellePrimaire(selectedTeacher))}
                    >
                      <option value="">
                        {!formData.classId ? 'Sélectionnez d\'abord une classe' : 
                         selectedTeacher && isTeacherForMaternellePrimaire(selectedTeacher) ? 
                         'Toutes les matières (enseignant polyvalent)' : 'Sélectionner une matière'}
                      </option>
                      {!selectedTeacher || !isTeacherForMaternellePrimaire(selectedTeacher) ? (
                        filteredSubjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </option>
                        ))
                      ) : (
                        <option value="all-subjects" disabled>
                          Enseignant polyvalent - Toutes les matières
                        </option>
                      )}
                    </select>
                    {selectedTeacher && isTeacherForMaternellePrimaire(selectedTeacher) && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Cet enseignant enseigne toutes les matières de la classe
                      </p>
                    )}
                  </div>
                </div>

                {/* Information sur le type de salle */}
                {selectedClass && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                          Type de salle pour {selectedClass.name}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          {roomType === 'fixed' && 'Cette classe a une salle fixe. Toutes les matières se déroulent dans la même salle.'}
                          {roomType === 'flexible' && 'Cette classe nécessite des réservations de salles polyvalentes pour chaque cours.'}
                          {roomType === 'mixed' && 'Cette classe peut utiliser sa salle attitrée ou des salles polyvalentes selon la matière.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Planification */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Planification</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                      aria-label="Date de la réservation"
                      title="Sélectionnez la date de la réservation"
                    />
                  </div>

                  {/* Heure de début */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Heure de début *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                      aria-label="Heure de début"
                      title="Sélectionnez l'heure de début"
                    />
                  </div>

                  {/* Heure de fin */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Heure de fin *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      required
                      aria-label="Heure de fin"
                      title="Sélectionnez l'heure de fin"
                    />
                  </div>
                </div>

                {/* Récurrence */}
                <div className="mt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleChange}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      title="Activer la réservation récurrente"
                    />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Réservation récurrente
                    </label>
                  </div>

                  {formData.isRecurring && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Fréquence
                        </label>
                        <select
                          name="recurrencePattern"
                          value={formData.recurrencePattern}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          title="Sélectionnez la fréquence de récurrence"
                        >
                          <option value="daily">Quotidienne</option>
                          <option value="weekly">Hebdomadaire</option>
                          <option value="monthly">Mensuelle</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          name="recurrenceEndDate"
                          value={formData.recurrenceEndDate}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                          title="Sélectionnez la date de fin de récurrence"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h3>
                </div>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                  placeholder="Ajoutez des notes ou des instructions spéciales pour cette réservation..."
                  aria-label="Notes de la réservation"
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-500 transition-all duration-200 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Modifier la réservation' : 'Créer la réservation'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default EnhancedRoomReservationModal;
