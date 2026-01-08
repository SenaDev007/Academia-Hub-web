import React, { useState } from 'react';
import FormModal from './FormModal';
import { UtensilsCrossed, Save } from 'lucide-react';

interface Menu {
  id?: string;
  date: string;
  type: string;
  starter: string;
  main: string;
  side: string;
  dessert: string;
  nutritionalScore: string;
  allergens: string[];
  cost: number;
}

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (menu: Menu) => void;
  menu?: Menu;
  isEdit?: boolean;
}

const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  onSave,
  menu,
  isEdit = false
}) => {
  const allergenOptions = [
    'Gluten', 'Lactose', 'Œufs', 'Poisson', 'Crustacés', 'Arachides', 
    'Fruits à coque', 'Soja', 'Céleri', 'Moutarde', 'Sésame', 'Sulfites'
  ];

  const [formData, setFormData] = useState<Menu>(
    menu || {
      date: new Date().toISOString().split('T')[0],
      type: 'Déjeuner',
      starter: '',
      main: '',
      side: '',
      dessert: '',
      nutritionalScore: 'A',
      allergens: [],
      cost: 0
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'allergens') {
      // Handle allergens checkbox
      const allergen = value;
      const isChecked = (e.target as HTMLInputElement).checked;
      
      setFormData(prev => ({
        ...prev,
        allergens: isChecked 
          ? [...prev.allergens, allergen]
          : prev.allergens.filter(a => a !== allergen)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
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
      title={isEdit ? "Modifier un menu" : "Ajouter un nouveau menu"}
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
            form="menu-form"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      }
    >
      <form id="menu-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date*
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de repas*
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="Déjeuner">Déjeuner</option>
              <option value="Dîner">Dîner</option>
              <option value="Collation">Collation</option>
              <option value="Petit-déjeuner">Petit-déjeuner</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="starter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Entrée*
            </label>
            <input
              type="text"
              id="starter"
              name="starter"
              value={formData.starter}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="main" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plat principal*
            </label>
            <input
              type="text"
              id="main"
              name="main"
              value={formData.main}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="side" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Accompagnement*
            </label>
            <input
              type="text"
              id="side"
              name="side"
              value={formData.side}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="dessert" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dessert*
            </label>
            <input
              type="text"
              id="dessert"
              name="dessert"
              value={formData.dessert}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label htmlFor="nutritionalScore" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Score nutritionnel*
            </label>
            <select
              id="nutritionalScore"
              name="nutritionalScore"
              value={formData.nutritionalScore}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="A">Nutri-Score A</option>
              <option value="B">Nutri-Score B</option>
              <option value="C">Nutri-Score C</option>
              <option value="D">Nutri-Score D</option>
              <option value="E">Nutri-Score E</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coût par portion (€)*
            </label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Allergènes présents
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {allergenOptions.map(allergen => (
              <label key={allergen} className="flex items-center">
                <input
                  type="checkbox"
                  name="allergens"
                  value={allergen}
                  checked={formData.allergens.includes(allergen)}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{allergen}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-start space-x-3">
          <UtensilsCrossed className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <p className="text-sm text-green-800 dark:text-green-300 font-medium">Information</p>
            <p className="text-sm text-green-700 dark:text-green-400">
              {isEdit 
                ? "La modification de ce menu sera enregistrée dans l'historique des changements."
                : "Un identifiant unique au format MENU-YYYY-MM-DD-NNN sera automatiquement généré pour ce nouveau menu."}
            </p>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default MenuModal;