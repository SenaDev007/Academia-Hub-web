import React, { useState } from 'react';
import FormModal from './FormModal';
import { Save, UserCheck, ArrowRight, MessageSquare } from 'lucide-react';

interface ClassTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transferData: any) => void;
  transferData?: any;
  students?: any[];
  classes?: any[];
}

const ClassTransferModal: React.FC<ClassTransferModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transferData,
  students = [],
  classes = []
}) => {
  // Utiliser les vraies données de la base de données
  const allStudents = students;
  const allClasses = classes;

  const [formData, setFormData] = useState({
    studentId: transferData?.studentId || '',
    studentName: transferData?.studentName || '',
    currentClass: transferData?.currentClass || '',
    fromClassId: transferData?.fromClassId || '',
    targetClassId: transferData?.targetClassId || '',
    transferDate: transferData?.transferDate || new Date().toISOString().split('T')[0],
    reason: transferData?.reason || '',
    notifyParent: transferData?.notifyParent !== undefined ? transferData.notifyParent : true,
    comments: transferData?.comments || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Filtrer les élèves par classe d'origine
  const filteredStudents = formData.fromClassId 
    ? allStudents.filter(student => student.classId === formData.fromClassId || student.class === formData.fromClassId)
    : allStudents;

  const handleFromClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const fromClassId = e.target.value;
    const fromClass = allClasses.find(c => c.id === fromClassId);
    
    setFormData(prev => ({
      ...prev,
      fromClassId,
      studentId: '', // Réinitialiser la sélection d'élève
      studentName: '',
      currentClass: fromClass?.name || '',
      // Réinitialiser la classe de destination si elle devient la même que l'origine
      targetClassId: prev.targetClassId === fromClassId ? '' : prev.targetClassId
    }));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = e.target.value;
    const student = filteredStudents.find(s => s.id === studentId);
    
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId,
        studentName: student.name,
        currentClass: student.class
      }));
    }
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
      title="Transfert d'élève"
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
            form="transfer-form"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Enregistrer
          </button>
        </div>
      }
    >
      <form id="transfer-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de l'élève */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Élève à transférer
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromClassId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Classe d'origine*
              </label>
              <select
                id="fromClassId"
                name="fromClassId"
                value={formData.fromClassId}
                onChange={handleFromClassChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">
                  {allClasses.length === 0 ? "Aucune classe disponible" : "Sélectionner une classe"}
                </option>
                {allClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Élève*
              </label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleStudentChange}
                required
                disabled={!formData.fromClassId}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.fromClassId 
                    ? "Sélectionnez d'abord une classe" 
                    : filteredStudents.length === 0 
                      ? "Aucun élève dans cette classe"
                      : `Sélectionner un élève (${filteredStudents.length} disponible${filteredStudents.length > 1 ? 's' : ''})`
                  }
                </option>
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.name} ({student.class})</option>
                ))}
              </select>
            </div>
            
            {formData.studentId && (
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Élève sélectionné:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formData.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Classe actuelle:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formData.currentClass}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Détails du transfert */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <ArrowRight className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Détails du transfert
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="targetClassId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Classe de destination*
              </label>
              <select
                id="targetClassId"
                name="targetClassId"
                value={formData.targetClassId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">
                  {allClasses.length === 0 ? "Aucune classe disponible" : "Sélectionner une classe"}
                </option>
                {allClasses.map(cls => (
                  <option 
                    key={cls.id} 
                    value={cls.id}
                    disabled={cls.id === formData.fromClassId}
                  >
                    {cls.name}{cls.id === formData.fromClassId ? ' (classe d\'origine)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="transferDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date du transfert*
              </label>
              <input
                type="date"
                id="transferDate"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Motif du transfert*
              </label>
              <select
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner un motif</option>
                <option value="Rééquilibrage des effectifs">Rééquilibrage des effectifs</option>
                <option value="Changement d'option">Changement d'option</option>
                <option value="Demande des parents">Demande des parents</option>
                <option value="Problèmes disciplinaires">Problèmes disciplinaires</option>
                <option value="Niveau inadapté">Niveau inadapté</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Notifications et commentaires */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Notifications et commentaires
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyParent"
                name="notifyParent"
                checked={formData.notifyParent}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="notifyParent" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Notifier le parent/tuteur du transfert
              </label>
            </div>
            
            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commentaires
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Commentaires supplémentaires..."
              />
            </div>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default ClassTransferModal;