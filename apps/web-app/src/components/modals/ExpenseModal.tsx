import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Tag, User, CreditCard, FileText, AlertCircle } from 'lucide-react';

interface Expense {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  subcategory: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  vendor: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'mobile_money';
  receiptNumber: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  subcategories: string[];
}

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  expense?: Expense | null;
  categories: ExpenseCategory[];
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expense,
  categories
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    date: '',
    status: 'pending' as const,
    vendor: '',
    paymentMethod: 'cash' as const,
    receiptNumber: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialiser le formulaire avec les données de la dépense existante
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        description: expense.description,
        amount: expense.amount.toString(),
        category: expense.category,
        subcategory: expense.subcategory,
        date: expense.date,
        status: expense.status,
        vendor: expense.vendor,
        paymentMethod: expense.paymentMethod,
        receiptNumber: expense.receiptNumber
      });
    } else {
      // Réinitialiser le formulaire pour une nouvelle dépense
      setFormData({
        title: '',
        description: '',
        amount: '',
        category: '',
        subcategory: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        vendor: '',
        paymentMethod: 'cash',
        receiptNumber: ''
      });
    }
    setErrors({});
  }, [expense, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Le montant doit être un nombre positif';
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!formData.subcategory) {
      newErrors.subcategory = 'La sous-catégorie est requise';
    }

    if (!formData.date) {
      newErrors.date = 'La date est requise';
    }

    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Le fournisseur est requis';
    }

    if (!formData.receiptNumber.trim()) {
      newErrors.receiptNumber = 'Le numéro de reçu est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData = {
        ...formData,
        amount: Number(formData.amount)
      };

      await onSave(expenseData);
    onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);
  const availableSubcategories = Array.isArray(selectedCategory?.subcategories) ? selectedCategory.subcategories : [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {expense ? 'Modifier la dépense' : 'Nouvelle dépense'}
                </h2>
                <p className="text-red-100 text-sm">
                  {expense ? 'Modifiez les informations de la dépense' : 'Enregistrez une nouvelle dépense'}
                </p>
              </div>
            </div>
          <button
            onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
          >
              <X className="w-5 h-5" />
          </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titre et Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Titre de la dépense *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 ${
                  errors.title 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
                placeholder="Ex: Achat de livres de mathématiques"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Montant (F CFA) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 ${
                  errors.amount 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
                placeholder="150000"
                min="0"
                step="100"
              />
              {errors.amount && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 resize-none ${
                errors.description 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
              }`}
              placeholder="Décrivez la dépense en détail..."
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Catégorie et Sous-catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  handleInputChange('category', e.target.value);
                  handleInputChange('subcategory', ''); // Reset subcategory
                }}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 ${
                  errors.category 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.category}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sous-catégorie *
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                disabled={!formData.category}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 ${
                  errors.subcategory 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                } ${!formData.category ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Sélectionner une sous-catégorie</option>
                {availableSubcategories.map(subcategory => (
                  <option key={subcategory} value={subcategory}>
                    {subcategory}
                  </option>
                ))}
              </select>
              {errors.subcategory && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.subcategory}
                </p>
              )}
            </div>
            </div>
            
          {/* Date et Statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 ${
                  errors.date 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
              />
              {errors.date && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.date}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="pending">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
                <option value="paid">Payé</option>
              </select>
            </div>
            </div>
            
          {/* Fournisseur et Méthode de paiement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fournisseur *
              </label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 ${
                  errors.vendor 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                }`}
                placeholder="Ex: Librairie Éducative"
              />
              {errors.vendor && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.vendor}
                </p>
              )}
            </div>
            
              <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Méthode de paiement
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="cash">Espèces</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="check">Chèque</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
          </div>
        </div>
        
          {/* Numéro de reçu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Numéro de reçu *
            </label>
            <input
              type="text"
              value={formData.receiptNumber}
              onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 ${
                errors.receiptNumber 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
              }`}
              placeholder="Ex: RCP-EDU-001"
            />
            {errors.receiptNumber && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.receiptNumber}
              </p>
            )}
        </div>
        
          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {expense ? 'Modifier' : 'Enregistrer'}
                </>
              )}
            </button>
              </div>
        </form>
          </div>
        </div>
  );
};

export default ExpenseModal;