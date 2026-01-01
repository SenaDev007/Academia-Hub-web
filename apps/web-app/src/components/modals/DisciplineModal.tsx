import React, { useState } from 'react';
import FormModal from './FormModal';
import { Save, AlertTriangle, Calendar, User, MessageSquare } from 'lucide-react';

interface DisciplineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (incidentData: any) => void;
  incidentData?: any;
  isEdit?: boolean;
  students?: any[];
}

const DisciplineModal: React.FC<DisciplineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  incidentData,
  isEdit = false,
  students = []
}) => {
  const defaultStudents = [
    { id: 'STD-001', name: 'Marie Dubois', class: '3ème A' },
    { id: 'STD-002', name: 'Pierre Martin', class: '2nde B' },
    { id: 'STD-003', name: 'Sophie Lambert', class: '1ère C' }
  ];

  const allStudents = students.length > 0 ? students : defaultStudents;

  const [formData, setFormData] = useState({
    studentId: incidentData?.studentId || '',
    studentName: incidentData?.studentName || '',
    studentClass: incidentData?.studentClass || '',
    incidentDate: incidentData?.incidentDate || new Date().toISOString().split('T')[0],
    type: incidentData?.type || '',
    description: incidentData?.description || '',
    severity: incidentData?.severity || 'minor',
    location: incidentData?.location || '',
    witnesses: incidentData?.witnesses || '',
    actionTaken: incidentData?.actionTaken || '',
    parentNotified: incidentData?.parentNotified !== undefined ? incidentData.parentNotified : true,
    followUp: incidentData?.followUp || '',
    reportedBy: incidentData?.reportedBy || '',
    attachments: incidentData?.attachments || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    const student = allStudents.find(s => s.id === studentId);
    
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId,
        studentName: student.name,
        studentClass: student.class
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        // Dans une implémentation réelle, vous téléchargeriez le fichier et stockeriez l'URL
        url: URL.createObjectURL(file)
      }));
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier un incident disciplinaire" : "Signaler un nouvel incident"}
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
            form="discipline-form"
            className="px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      }
    >
      <form id="discipline-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de l'élève */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Élève concerné
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Élève*
              </label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleStudentChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner un élève</option>
                {allStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.name} ({student.class})</option>
                ))}
              </select>
            </div>
            
            {formData.studentId && (
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Élève:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formData.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Classe:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formData.studentClass}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Détails de l'incident */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
            Détails de l'incident
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de l'incident*
              </label>
              <input
                type="date"
                id="incidentDate"
                name="incidentDate"
                value={formData.incidentDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type d'incident*
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner un type</option>
                <option value="Perturbation en cours">Perturbation en cours</option>
                <option value="Comportement inapproprié">Comportement inapproprié</option>
                <option value="Violence verbale">Violence verbale</option>
                <option value="Violence physique">Violence physique</option>
                <option value="Dégradation de matériel">Dégradation de matériel</option>
                <option value="Tricherie">Tricherie</option>
                <option value="Retards répétés">Retards répétés</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gravité*
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="minor">Mineure</option>
                <option value="major">Majeure</option>
                <option value="severe">Grave</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lieu de l'incident
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Salle de classe, cour de récréation, etc."
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description détaillée*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Décrivez l'incident en détail..."
              />
            </div>
            
            <div>
              <label htmlFor="witnesses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Témoins
              </label>
              <input
                type="text"
                id="witnesses"
                name="witnesses"
                value={formData.witnesses}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Noms des témoins éventuels"
              />
            </div>
            
            <div>
              <label htmlFor="reportedBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Signalé par*
              </label>
              <input
                type="text"
                id="reportedBy"
                name="reportedBy"
                value={formData.reportedBy}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Nom de la personne signalant l'incident"
              />
            </div>
          </div>
        </div>
        
        {/* Actions et suivi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Actions et suivi
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="actionTaken" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Action prise*
              </label>
              <select
                id="actionTaken"
                name="actionTaken"
                value={formData.actionTaken}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner une action</option>
                <option value="Avertissement">Avertissement</option>
                <option value="Retenue">Retenue</option>
                <option value="Convocation des parents">Convocation des parents</option>
                <option value="Exclusion temporaire">Exclusion temporaire</option>
                <option value="Conseil de discipline">Conseil de discipline</option>
                <option value="Travail supplémentaire">Travail supplémentaire</option>
                <option value="Médiation">Médiation</option>
                <option value="Aucune">Aucune action immédiate</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="followUp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Suivi prévu
              </label>
              <textarea
                id="followUp"
                name="followUp"
                value={formData.followUp}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Actions de suivi prévues..."
              />
            </div>
            
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="parentNotified"
                  name="parentNotified"
                  checked={formData.parentNotified}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="parentNotified" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Notifier le parent/tuteur
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pièces jointes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Pièces jointes
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ajouter des pièces justificatives
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-50 file:text-blue-700
                  dark:file:bg-blue-900/30 dark:file:text-blue-300
                  hover:file:bg-blue-100 dark:hover:file:bg-blue-900/40"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Formats acceptés: PDF, JPG, PNG (max 5MB)
              </p>
            </div>
            
            {formData.attachments.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Nom
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Taille
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {formData.attachments.map((attachment, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {attachment.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {attachment.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(attachment.size / 1024).toFixed(2)} KB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default DisciplineModal;