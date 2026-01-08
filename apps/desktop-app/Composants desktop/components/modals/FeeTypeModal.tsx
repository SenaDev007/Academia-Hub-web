import React, { useState } from 'react';
import FormModal from './FormModal';
import { DollarSign, Save, Building, Target } from 'lucide-react';

interface FeeTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feeTypeData: any) => void;
  feeTypeData?: any;
  isEdit?: boolean;
  educationLevels?: any[];
  classes?: any[];
}

const FeeTypeModal: React.FC<FeeTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  feeTypeData,
  isEdit = false,
  educationLevels = [],
  classes = []
}) => {
  const [formData, setFormData] = useState({
    name: feeTypeData?.name || '',
    code: feeTypeData?.code || '',
    amount: feeTypeData?.amount || 0,
    description: feeTypeData?.description || '',
    isMandatory: feeTypeData?.isMandatory !== undefined ? feeTypeData.isMandatory : true,
    appliesTo: feeTypeData?.appliesTo || 'all',
    targetId: feeTypeData?.targetId || '',
    isRecurring: feeTypeData?.isRecurring || false,
    frequency: feeTypeData?.frequency || 'once',
    startDate: feeTypeData?.startDate || '',
    endDate: feeTypeData?.endDate || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Générer un code basé sur le nom si le code est vide
  const generateCode = () => {
    if (!formData.code && formData.name) {
      const code = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8);
      
      setFormData(prev => ({
        ...prev,
        code
      }));
    }
  };

  // Formatage des montants en F CFA
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier un type de frais" : "Nouveau type de frais"}
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
            form="fee-type-form"
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      }
    >
      <form id="fee-type-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Informations du type de frais
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={generateCode}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Frais de scolarité"
              />
            </div>
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code*
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Ex: SCOL"
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Montant (F CFA)*
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isMandatory"
                  name="isMandatory"
                  checked={formData.isMandatory}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="isMandatory" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Frais obligatoire
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="isRecurring" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Frais récurrent
                </label>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Description détaillée du type de frais..."
              />
            </div>
          </div>
        </div>
        
        {/* Application et récurrence */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Application et récurrence
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="appliesTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                S'applique à*
              </label>
              <select
                id="appliesTo"
                name="appliesTo"
                value={formData.appliesTo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">Tous les élèves</option>
                <option value="level">Niveau spécifique</option>
                <option value="class">Classe spécifique</option>
              </select>
            </div>
            
            {formData.appliesTo !== 'all' && (
              <div>
                <label htmlFor="targetId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {formData.appliesTo === 'level' ? 'Niveau*' : 'Classe*'}
                </label>
                <select
                  id="targetId"
                  name="targetId"
                  value={formData.targetId}
                  onChange={handleChange}
                  required={formData.appliesTo !== 'all'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Sélectionner</option>
                  {formData.appliesTo === 'level' ? (
                    educationLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))
                  ) : (
                    classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))
                  )}
                </select>
              </div>
            )}
            
            {formData.isRecurring && (
              <>
                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fréquence*
                  </label>
                  <select
                    id="frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required={formData.isRecurring}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="once">Une seule fois</option>
                    <option value="monthly">Mensuel</option>
                    <option value="quarterly">Trimestriel</option>
                    <option value="yearly">Annuel</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Récapitulatif */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-900/30">
          <h4 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Récapitulatif
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Nom:</span>
                <span className="font-bold text-blue-900 dark:text-blue-200">
                  {formData.name || 'Non renseigné'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Code:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">{formData.code || 'Non renseigné'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Montant:</span>
                <span className="font-bold text-blue-900 dark:text-blue-200">
                  {formatAmount(formData.amount)} F CFA
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Type:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  {formData.isMandatory ? 'Obligatoire' : 'Optionnel'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Application:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  {formData.appliesTo === 'all' ? 'Tous les élèves' : 
                   formData.appliesTo === 'level' ? 'Niveau spécifique' : 'Classe spécifique'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-blue-800 dark:text-blue-300">Récurrence:</span>
                <span className="font-medium text-blue-900 dark:text-blue-200">
                  {formData.isRecurring ? (
                    formData.frequency === 'once' ? 'Une seule fois' :
                    formData.frequency === 'monthly' ? 'Mensuel' :
                    formData.frequency === 'quarterly' ? 'Trimestriel' : 'Annuel'
                  ) : 'Non récurrent'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default FeeTypeModal;