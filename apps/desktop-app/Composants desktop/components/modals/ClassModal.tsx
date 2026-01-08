import React, { useState, useEffect } from 'react';
import FormModal from './FormModal';
import { Save, Building, Users, BookOpen, Lightbulb, FileText, Target, Users2, Settings, Calendar, Info } from 'lucide-react';
import { EDUCATION_LEVELS } from '../../constants/educationLevels';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: any) => void;
  classData?: any;
  isEdit?: boolean;
  educationLevels?: any[];
  teachers?: any[];
  rooms?: any[];
}

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  classData,
  isEdit = false,
  educationLevels = [],
  teachers = [],
  rooms = []
}) => {
  const allEducationLevels = EDUCATION_LEVELS;
  const allTeachers = teachers.length > 0 ? teachers : [];
  const allRooms = rooms.length > 0 ? rooms : [];

  // Fonction pour générer des exemples de descriptions selon le niveau d'éducation
  const getDescriptionExample = (levelId: string): string => {
    const examples: Record<string, string> = {
      'maternelle': 'Classe de maternelle avec espace de jeux, coin lecture et activités manuelles. Effectif limité pour un suivi personnalisé. Activités d\'éveil et de socialisation.',
      'primaire': 'Classe de primaire avec tables individuelles, coin bibliothèque et espace de travail en groupe. Matériel pédagogique adapté au cycle. Activités artistiques et sportives incluses.',
      '1er-cycle-secondaire': 'Classe de collège avec tables en îlots, projecteur et tableau interactif. Travaux de groupe et projets interdisciplinaires. Préparation au brevet.',
      '2nd-cycle-secondaire': 'Classe de lycée avec tables en U, équipements numériques et espace de travail collaboratif. Préparation aux examens et orientation post-bac.'
    };
    
    return examples[levelId] || 'Décrivez les spécificités de cette classe, son projet pédagogique et ses particularités...';
  };

  const [formData, setFormData] = useState({
    name: classData?.name || '',
    
    educationLevelId: classData?.educationLevelId || '',
    capacity: classData?.capacity || 30,
    mainTeacherId: classData?.mainTeacherId || '',
    room: classData?.room || '',
    description: classData?.description || '',
    isActive: classData?.isActive !== undefined ? classData.isActive : true
  });

  // Synchroniser le formulaire avec les données de la classe
  useEffect(() => {
    console.log('=== DEBUG ClassModal useEffect ===');
    console.log('classData reçu:', classData);
    console.log('isEdit:', isEdit);
    
    if (classData) {
      const newFormData = {
        name: classData.name || '',

        educationLevelId: classData.educationLevelId || classData.level || '',
        capacity: classData.capacity || 30,
        mainTeacherId: classData.mainTeacherId || classData.main_teacher_id || '',
        room: classData.room || classData.room_id || '',
        description: classData.description || '',

      };
      
      console.log('Nouveau formData:', newFormData);
      setFormData(newFormData);
    } else {
      // Réinitialiser le formulaire pour une nouvelle classe
      const emptyFormData = {
        name: '',

        educationLevelId: '',
        capacity: 30,
        mainTeacherId: '',
        room: '',
        description: '',

      };
      
      console.log('Formulaire vide:', emptyFormData);
      setFormData(emptyFormData);
    }
  }, [classData, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    console.log('=== DEBUG handleChange ===');
    console.log('Champ modifié:', name);
    console.log('Valeur:', value);
    console.log('Type:', type);
    console.log('Checked:', checked);
    
    const newValue = type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value;
    
    console.log('Nouvelle valeur calculée:', newValue);
    
    setFormData(prev => {
      const newFormData = {
      ...prev,
        [name]: newValue
      };
      console.log('Nouveau formData:', newFormData);
      return newFormData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DEBUG handleSubmit ===');
    console.log('formData à envoyer:', formData);
    console.log('isActive:', formData.isActive);
    console.log('Type de isActive:', typeof formData.isActive);
    
    onSave(formData);
    onClose();
  };



  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier une classe" : "Créer une nouvelle classe"}
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="class-form"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      }
    >
      <form id="class-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Informations de la classe
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom de la classe*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}

                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: 6ème A"
              />
            </div>
            

            
            <div>
              <label htmlFor="educationLevelId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Niveau d'éducation*
              </label>
              <select
                id="educationLevelId"
                name="educationLevelId"
                value={formData.educationLevelId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner un niveau</option>
                {allEducationLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Capacité*
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="mainTeacherId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enseignant titulaire
              </label>
              <select
                id="mainTeacherId"
                name="mainTeacherId"
                value={formData.mainTeacherId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner un enseignant</option>
                {allTeachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.subject})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="room" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salle
              </label>
              <select
                id="room"
                name="room"
                value={formData.room}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner une salle</option>
                {allRooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name} ({room.type})</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description <span className="text-gray-500 font-normal">(recommandée)</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Décrivez les spécificités de cette classe, son projet pédagogique et ses particularités..."
              />
              
              {/* Exemple de description selon le niveau d'éducation */}
              {formData.educationLevelId && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                    <Lightbulb className="w-3 h-3 mr-1.5 text-blue-600 dark:text-blue-400" />
                    Exemple de description pour ce niveau :
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 italic">
                    {getDescriptionExample(formData.educationLevelId)}
                  </p>
                </div>
              )}
            </div>
            

          </div>
        </div>

        {/* Guide pour la description de classe */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
            Guide pour la description de classe
          </h5>
          <div className="text-xs text-green-700 dark:text-green-400 space-y-2">
            <div className="flex items-center space-x-2">
              <Target className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span><strong>Projet pédagogique :</strong> Spécificités de la classe, options, spécialisations</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users2 className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span><strong>Organisation :</strong> Effectif, répartition, travaux de groupe</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span><strong>Équipements :</strong> Matériel spécifique, technologies utilisées</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span><strong>Activités :</strong> Sorties, projets, événements particuliers</span>
              </div>
            <div className="flex items-center space-x-2">
              <Info className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span><strong>Notes :</strong> Informations importantes pour les enseignants</span>
            </div>
          </div>
        </div>
        
      </form>
    </FormModal>
  );
};

export default ClassModal;