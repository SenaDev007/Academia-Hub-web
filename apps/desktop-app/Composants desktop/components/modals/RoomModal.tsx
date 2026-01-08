import React, { useState, useEffect } from 'react';
import { Save, Building, MapPin, Users, Settings, CheckCircle, AlertCircle, Check, X, Plus, Trash2, Wifi, Monitor, Thermometer, Lightbulb, Shield, Zap, FileText } from 'lucide-react';
import { PlanningRoom } from '../../types/planning';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roomData: Partial<PlanningRoom>) => void;
  roomData?: PlanningRoom | null;
  isEdit?: boolean;
}

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

// Équipements prédéfinis par type de salle
const PREDEFINED_EQUIPMENT = {
  'Salle de classe': [
    'Tableau noir',
    'Tableaux blancs',
    'Vidéoprojecteur',
    'Écran de projection',
    'Climatisation',
    'Éclairage LED',
    'Prises électriques',
    'WiFi',
    'Système audio'
  ],
  'Laboratoire': [
    'Paillasses',
    'Éviers',
    'Hottes de sécurité',
    'Matériel scientifique',
    'Microscopes',
    'Équipements de mesure',
    'Armoires de rangement',
    'Extincteurs'
  ],
  'Salle informatique': [
    'Tableau noir',
    'Ordinateurs Windows',
    'Projecteur interactif',
    'Écran tactile',
    'Logiciels bureautique',
    'Logiciels de programmation',
    'Imprimante réseau',
    'Scanner',
    'Câbles réseau'
  ],
  'Amphithéâtre': [
    'Gradins confortables',
    'Micros sans fil',
    'Vidéoprojecteur',
    'Écran géant',
    'Système audio surround',
    'Éclairage scénique',
    'Tableau noir',
    'Tableau blanc',
    'Pupitre conférencier'
  ],
  'Gymnase': [
    'Parquet sportif',
    'Paniers de basket',
    'Filets de volley',
    'Équipements de musculation',
    'Matériel de gymnastique',
    'Vestiaires',
    'Douches',
    'Système de son'
  ],
  'Salle de réunion': [
    'Table ovale',
    'Chaises confortables',
    'Vidéoprojecteur',
    'Tableau noir',
    'Tableau blanc interactif',
    'Système de visioconférence',
    'Prises électriques',
    'WiFi',
    'Climatisation'
  ],
  'Bibliothèque': [
    'Tableau noir',
    'Rayonnages',
    'Places assises',
    'Tables de travail',
    'Prises électriques',
    'WiFi',
    'Ordinateurs de recherche',
    'Imprimante',
    'Scanner'
  ],
  'Salle spécialisée': [
    'Tableau noir',
    'Tables de dessin',
    'Éclairage naturel',
    'Point d\'eau',
    'Matériel artistique',
    'Étagères de rangement',
    'Prises électriques',
    'Ventilation',
    'Évier'
  ],
  'Bureau': [
    'Tableau noir',
    'Bureau individuel',
    'Chaise ergonomique',
    'Armoire de rangement',
    'Éclairage naturel',
    'Climatisation',
    'Prises électriques',
    'WiFi',
    'Téléphone'
  ]
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'success' 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${
            type === 'success' 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-red-800 dark:text-red-200'
          }`}>
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 ${
              type === 'success' 
                ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30' 
                : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
            }`}
          >
            <span className="sr-only">Fermer</span>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  roomData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState<Partial<PlanningRoom>>({
    name: '',
    type: '',
    capacity: 0,
    equipment: [],
    status: 'available',
    description: ''
  });

  const [equipmentInput, setEquipmentInput] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);
  const [isDescriptionManuallyEdited, setIsDescriptionManuallyEdited] = useState(false);

  // Fonction pour générer une description automatique basée sur le type de salle
  const generateDescription = (roomType: string, capacity: number): string => {
    const descriptions: Record<string, string> = {
      'Salle de classe': `Salle de classe moderne d'une capacité de ${capacity} places. Équipée d'un tableau interactif, d'un système de projection et d'un éclairage LED optimisé. Climatisée et dotée de prises électriques pour tous les élèves. Idéale pour les cours théoriques et les présentations.`,
      
      'Laboratoire': `Laboratoire scientifique de ${capacity} places avec paillasses, éviers et hottes de sécurité. Équipé de matériel scientifique de pointe, microscopes et équipements de mesure. Armoires de rangement sécurisées et extincteurs. Conforme aux normes de sécurité pour les expériences de chimie et biologie.`,
      
      'Salle informatique': `Salle informatique de ${capacity} places avec postes de travail individuels. Équipée d'ordinateurs performants, projecteur interactif et écran tactile. Logiciels bureautiques et de programmation installés. Réseau WiFi haute vitesse et imprimante réseau. Idéale pour les cours d'informatique et de programmation.`,
      
      'Amphithéâtre': `Grand amphithéâtre de ${capacity} places avec gradins confortables et vue panoramique. Équipé de micros sans fil, système audio surround et écran géant. Éclairage scénique professionnel et pupitre conférencier. Idéal pour les conférences, présentations et événements importants.`,
      
      'Gymnase': `Gymnase multisport de ${capacity} places avec parquet sportif professionnel. Équipé de paniers de basket, filets de volley et matériel de gymnastique. Vestiaires et douches disponibles. Système de son pour les cours de sport. Parfait pour l'éducation physique et les activités sportives.`,
      
      'Salle de réunion': `Salle de réunion de ${capacity} places avec table ovale et chaises confortables. Équipée d'un système de visioconférence, projecteur et tableau blanc interactif. Climatisation et WiFi haute vitesse. Idéale pour les réunions d'équipe et les présentations professionnelles.`,
      
      'Bibliothèque': `Espace de travail calme de ${capacity} places avec places assises confortables. Rayonnages pour collections spécialisées, tables de travail et prises électriques. WiFi gratuit et ordinateurs de recherche. Environnement propice à l'étude et à la recherche documentaire.`,
      
      'Salle spécialisée': `Salle spécialisée de ${capacity} places avec tables de dessin et éclairage naturel optimisé. Point d'eau et matériel artistique disponible. Étagères de rangement et ventilation adaptée. Parfaite pour les cours d'arts plastiques et les activités créatives.`,
      
      'Bureau': `Bureau individuel de ${capacity} places avec mobilier ergonomique et éclairage naturel. Armoire de rangement sécurisée et climatisation. Prises électriques et WiFi. Environnement professionnel pour le travail administratif et les entretiens.`
    };

    return descriptions[roomType] || `Salle de type ${roomType} d'une capacité de ${capacity} places. Équipée selon les standards modernes pour répondre aux besoins pédagogiques et professionnels.`;
  };

  useEffect(() => {
    if (isOpen) {
    if (roomData && isEdit) {
        // Parse equipment if it's a JSON string, otherwise use as array
        let equipmentArray: string[] = [];
        if (roomData.equipment) {
          if (typeof roomData.equipment === 'string') {
            try {
              equipmentArray = JSON.parse(roomData.equipment);
            } catch (error) {
              console.warn('Failed to parse equipment JSON:', error);
              equipmentArray = [];
            }
          } else if (Array.isArray(roomData.equipment)) {
            equipmentArray = roomData.equipment;
          }
        }

      setFormData({
        name: roomData.name || '',
        type: roomData.type || '',
          capacity: roomData.capacity || 0,
          equipment: equipmentArray,
        status: roomData.status || 'available',
          description: roomData.description || ''
      });
    } else {
      setFormData({
        name: '',
        type: '',
          capacity: 0,
        equipment: [],
        status: 'available',
        description: ''
      });
    }
      setEquipmentInput('');
      setIsDescriptionManuallyEdited(false);
    }
  }, [isOpen, roomData, isEdit]);

  // Générer automatiquement la description quand le type ou la capacité change
  useEffect(() => {
    if (formData.type && formData.capacity && formData.capacity > 0 && !isDescriptionManuallyEdited) {
      const autoDescription = generateDescription(formData.type, formData.capacity);
      setFormData(prev => ({
        ...prev,
        description: autoDescription
      }));
    }
  }, [formData.type, formData.capacity, isDescriptionManuallyEdited]);

  const handleInputChange = (field: keyof PlanningRoom, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Marquer la description comme modifiée manuellement si l'utilisateur la change
    if (field === 'description') {
      setIsDescriptionManuallyEdited(true);
    }
  };

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setFormData(prev => ({
        ...prev,
        equipment: [...(prev.equipment || []), equipmentInput.trim()]
      }));
      setEquipmentInput('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment?.filter((_, i) => i !== index) || []
    }));
  };

  const addPredefinedEquipment = (equipment: string[]) => {
    setFormData(prev => ({
      ...prev,
      equipment: [...(prev.equipment || []), ...equipment]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      showToastMessage('Le nom de la salle est requis', 'error');
      return;
    }

    if (!formData.type?.trim()) {
      showToastMessage('Le type de salle est requis', 'error');
      return;
    }

    if (!formData.capacity || formData.capacity <= 0) {
      showToastMessage('La capacité doit être supérieure à 0', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      showToastMessage(
        isEdit ? 'Salle modifiée avec succès' : 'Salle créée avec succès',
        'success'
      );
      setTimeout(() => {
        onClose();
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      showToastMessage('Erreur lors de la sauvegarde', 'error');
      setIsLoading(false);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {isEdit ? 'Modifier la salle' : 'Ajouter une nouvelle salle'}
                  </h2>
                  <p className="text-purple-100 text-sm">
                    {isEdit ? 'Modifiez les informations de la salle' : 'Configurez une nouvelle salle pour votre établissement'}
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
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Informations de base</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom de la salle */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nom de la salle *
              </label>
              <input
                type="text"
                  value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Ex: Salle 101, Laboratoire de Physique"
                required
              />
            </div>
            
                  {/* Type de salle */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type de salle *
              </label>
              <select
                  value={formData.type || ''}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                required
                      aria-label="Type de salle"
              >
                <option value="">Sélectionner un type</option>
                      <option value="Salle de classe">Salle de classe</option>
                      <option value="Laboratoire">Laboratoire</option>
                      <option value="Salle informatique">Salle informatique</option>
                      <option value="Amphithéâtre">Amphithéâtre</option>
                      <option value="Gymnase">Gymnase</option>
                      <option value="Salle de réunion">Salle de réunion</option>
                      <option value="Bibliothèque">Bibliothèque</option>
                      <option value="Salle spécialisée">Salle spécialisée</option>
              </select>
            </div>
            
                  {/* Capacité */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Capacité (nombre de places) *
              </label>
              <input
                type="number"
                      min="1"
                  value={formData.capacity || ''}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      placeholder="Ex: 30"
                required
              />
            </div>
            
                  {/* Statut */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Statut
              </label>
              <select
                  value={formData.status || 'available'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                      aria-label="Statut de la salle"
              >
                <option value="available">Disponible</option>
                <option value="occupied">Occupée</option>
                <option value="maintenance">En maintenance</option>
                  <option value="reserved">Réservée</option>
              </select>
            </div>
          </div>
        </div>
        
              {/* Équipements prédéfinis */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Équipements prédéfinis</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Object.entries(PREDEFINED_EQUIPMENT).map(([type, equipment]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addPredefinedEquipment(equipment)}
                      className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {type}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {equipment.length} équipements
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Équipements personnalisés */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Équipements personnalisés</h3>
                </div>

                <div className="flex space-x-3 mb-4">
              <input
                type="text"
                    value={equipmentInput}
                    onChange={(e) => setEquipmentInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                    placeholder="Ajouter un équipement personnalisé"
              />
              <button
                type="button"
                    onClick={addEquipment}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
              </button>
            </div>
            
                {/* Liste des équipements */}
                {formData.equipment && Array.isArray(formData.equipment) && formData.equipment.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Équipements sélectionnés ({formData.equipment.length})
                    </div>
                    {formData.equipment.map((equipment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-lg flex items-center justify-center">
                            <Check className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {equipment}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEquipment(index)}
                          className="w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200"
                          title="Supprimer cet équipement"
                          aria-label={`Supprimer l'équipement ${equipment}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Générée automatiquement selon le type et la capacité
                      </p>
                    </div>
                  </div>
                    <button
                      type="button"
                    onClick={() => {
                      const autoDescription = generateDescription(formData.type || '', formData.capacity || 0);
                      handleInputChange('description', autoDescription);
                      setIsDescriptionManuallyEdited(false);
                    }}
                    className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200 text-sm font-medium"
                  >
                    Régénérer
                    </button>
                </div>

                <div className="space-y-3">
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200 resize-none"
                    placeholder="Décrivez les caractéristiques particulières de cette salle..."
                  />
                  <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Description personnalisable - Modifiez selon vos besoins</span>
                  </div>
                </div>
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
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? 'Modifier la salle' : 'Créer la salle'}</span>
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

export default RoomModal;