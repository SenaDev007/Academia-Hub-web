import React, { useState } from 'react';
import FormModal from './FormModal';
import { Save, Star, User, Calendar, Target, MessageSquare } from 'lucide-react';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (evaluationData: any) => void;
  evaluationData?: any;
  isEdit?: boolean;
  employees?: any[];
}

const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  evaluationData,
  isEdit = false,
  employees = []
}) => {
  const defaultEmployees = [
    { id: 'PER-2024-00001', name: 'Marie Dubois', position: 'Professeur de Français' },
    { id: 'PER-2024-00002', name: 'Pierre Martin', position: 'Professeur de Mathématiques' },
    { id: 'PER-2024-00003', name: 'Sophie Laurent', position: 'Secrétaire administrative' }
  ];

  const allEmployees = employees.length > 0 ? employees : defaultEmployees;

  const [formData, setFormData] = useState({
    id: evaluationData?.id || `EVAL-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    employeeId: evaluationData?.employeeId || '',
    employeeName: evaluationData?.employeeName || '',
    position: evaluationData?.position || '',
    evaluationDate: evaluationData?.evaluationDate || new Date().toISOString().split('T')[0],
    evaluator: evaluationData?.evaluator || '',
    criteria: {
      pedagogy: evaluationData?.criteria?.pedagogy || 0,
      communication: evaluationData?.criteria?.communication || 0,
      teamwork: evaluationData?.criteria?.teamwork || 0,
      innovation: evaluationData?.criteria?.innovation || 0,
      punctuality: evaluationData?.criteria?.punctuality || 0
    },
    overallScore: evaluationData?.overallScore || 0,
    strengths: evaluationData?.strengths || '',
    areasForImprovement: evaluationData?.areasForImprovement || '',
    objectives: evaluationData?.objectives || '',
    employeeComments: evaluationData?.employeeComments || '',
    nextEvaluation: evaluationData?.nextEvaluation || (() => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date.toISOString().split('T')[0];
    })()
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employeeId = e.target.value;
    const employee = allEmployees.find(emp => emp.id === employeeId);
    
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId,
        employeeName: employee.name,
        position: employee.position
      }));
    }
  };

  // Calcul du score global
  const calculateOverallScore = () => {
    const { pedagogy, communication, teamwork, innovation, punctuality } = formData.criteria;
    const sum = pedagogy + communication + teamwork + innovation + punctuality;
    const count = Object.values(formData.criteria).filter(val => val > 0).length;
    
    if (count === 0) return 0;
    return parseFloat((sum / count).toFixed(1));
  };

  // Mise à jour du score global lorsque les critères changent
  React.useEffect(() => {
    const overallScore = calculateOverallScore();
    setFormData(prev => ({
      ...prev,
      overallScore
    }));
  }, [formData.criteria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier une évaluation" : "Nouvelle évaluation"}
      size="xl"
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
            form="evaluation-form"
            className="px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      }
    >
      <form id="evaluation-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Informations de l'évaluation
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Employé*
              </label>
              <select
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleEmployeeChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner un employé</option>
                {allEmployees.map(employee => (
                  <option key={employee.id} value={employee.id}>{employee.name} ({employee.position})</option>
                ))}
              </select>
            </div>
            
            {formData.employeeId && (
              <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Employé:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formData.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Poste:</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formData.position}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="evaluationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'évaluation*
              </label>
              <input
                type="date"
                id="evaluationDate"
                name="evaluationDate"
                value={formData.evaluationDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="evaluator" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Évaluateur*
              </label>
              <input
                type="text"
                id="evaluator"
                name="evaluator"
                value={formData.evaluator}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Directeur pédagogique"
              />
            </div>
            
            <div>
              <label htmlFor="nextEvaluation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prochaine évaluation
              </label>
              <input
                type="date"
                id="nextEvaluation"
                name="nextEvaluation"
                value={formData.nextEvaluation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
        
        {/* Critères d'évaluation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            Critères d'évaluation
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="criteria.pedagogy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pédagogie (1-5)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="criteria.pedagogy"
                  name="criteria.pedagogy"
                  value={formData.criteria.pedagogy}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 w-10 text-center font-medium text-gray-900 dark:text-gray-100">
                  {formData.criteria.pedagogy}
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="criteria.communication" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Communication (1-5)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="criteria.communication"
                  name="criteria.communication"
                  value={formData.criteria.communication}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 w-10 text-center font-medium text-gray-900 dark:text-gray-100">
                  {formData.criteria.communication}
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="criteria.teamwork" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Travail d'équipe (1-5)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="criteria.teamwork"
                  name="criteria.teamwork"
                  value={formData.criteria.teamwork}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 w-10 text-center font-medium text-gray-900 dark:text-gray-100">
                  {formData.criteria.teamwork}
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="criteria.innovation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Innovation (1-5)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="criteria.innovation"
                  name="criteria.innovation"
                  value={formData.criteria.innovation}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 w-10 text-center font-medium text-gray-900 dark:text-gray-100">
                  {formData.criteria.innovation}
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="criteria.punctuality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ponctualité et assiduité (1-5)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="criteria.punctuality"
                  name="criteria.punctuality"
                  value={formData.criteria.punctuality}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-3 w-10 text-center font-medium text-gray-900 dark:text-gray-100">
                  {formData.criteria.punctuality}
                </span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Note globale
                </label>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formData.overallScore}/5
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Commentaires et objectifs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Commentaires et objectifs
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Points forts
              </label>
              <textarea
                id="strengths"
                name="strengths"
                value={formData.strengths}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Points forts observés..."
              />
            </div>
            
            <div>
              <label htmlFor="areasForImprovement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Axes d'amélioration
              </label>
              <textarea
                id="areasForImprovement"
                name="areasForImprovement"
                value={formData.areasForImprovement}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Points à améliorer..."
              />
            </div>
            
            <div>
              <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Objectifs pour la prochaine période
              </label>
              <textarea
                id="objectives"
                name="objectives"
                value={formData.objectives}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Objectifs à atteindre..."
              />
            </div>
            
            <div>
              <label htmlFor="employeeComments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Commentaires de l'employé
              </label>
              <textarea
                id="employeeComments"
                name="employeeComments"
                value={formData.employeeComments}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Réactions et commentaires de l'employé..."
              />
            </div>
          </div>
        </div>
        
        {/* Récapitulatif */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-900/30">
          <h4 className="text-lg font-medium text-orange-900 dark:text-orange-300 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Récapitulatif de l'évaluation
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-orange-800 dark:text-orange-300">Employé:</span>
                <span className="font-bold text-orange-900 dark:text-orange-200">
                  {formData.employeeName || 'Non sélectionné'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-orange-800 dark:text-orange-300">Date d'évaluation:</span>
                <span className="font-medium text-orange-900 dark:text-orange-200">{formData.evaluationDate}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-orange-800 dark:text-orange-300">Évaluateur:</span>
                <span className="font-medium text-orange-900 dark:text-orange-200">{formData.evaluator || 'Non renseigné'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-orange-800 dark:text-orange-300">Note globale:</span>
                <span className="font-bold text-orange-900 dark:text-orange-200">{formData.overallScore}/5</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-orange-800 dark:text-orange-300">Prochaine évaluation:</span>
                <span className="font-medium text-orange-900 dark:text-orange-200">{formData.nextEvaluation}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-orange-800 dark:text-orange-300">Référence:</span>
                <span className="font-medium text-orange-900 dark:text-orange-200">{formData.id}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default EvaluationModal;