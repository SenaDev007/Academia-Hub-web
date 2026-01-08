import React, { useState } from 'react';
import { Search, BookOpen, Clock, Users, ChevronDown, Check } from 'lucide-react';
import { useReferentielScolaire } from '../../hooks/useReferentielScolaire';

interface Matiere {
  id: string;
  nom: string;
  code: string;
  couleur: string;
  dureeStandard: number;
  niveaux: string[];
  competencesBase: string[];
  description: string;
  coefficient: number;
}

interface SelecteurMatiereProps {
  selectedMatiere?: string;
  selectedNiveau?: string;
  onMatiereChange: (matiere: any) => void;
  onNiveauChange: (niveau: string) => void;
  className?: string;
}

const SelecteurMatiere: React.FC<SelecteurMatiereProps> = ({
  selectedMatiere,
  selectedNiveau,
  onMatiereChange,
  onNiveauChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { referentiel, loading } = useReferentielScolaire();

  const filteredMatieres = referentiel.matieres.filter(matiere =>
    matiere.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    matiere.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedMatiereData = referentiel.matieres.find(m => m.nom === selectedMatiere);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sélecteur de matière */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <BookOpen size={16} className="inline mr-1" />
          Matière *
        </label>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {selectedMatiereData && (
                <div className={`w-3 h-3 rounded-full ${selectedMatiereData.couleur}`}></div>
              )}
              <span className={selectedMatiere ? 'text-gray-900' : 'text-gray-500'}>
                {selectedMatiere || 'Sélectionner une matière'}
              </span>
            </div>
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Barre de recherche */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une matière..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Liste des matières */}
              <div className="max-h-60 overflow-y-auto">
                {filteredMatieres.map((matiere) => (
                  <button
                    key={matiere.id}
                    type="button"
                    onClick={() => {
                      onMatiereChange(matiere);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${matiere.couleur}`}></div>
                      <div>
                        <div className="font-medium text-gray-900">{matiere.nom}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {matiere.dureeStandard}min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={12} />
                            Coef. {matiere.coefficient}
                          </span>
                        </div>
                      </div>
                    </div>
                    {selectedMatiere === matiere.nom && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </button>
                ))}
              </div>

              {filteredMatieres.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  Aucune matière trouvée
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sélecteur de niveau */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Users size={16} className="inline mr-1" />
          Niveau de classe *
        </label>
        <select
          value={selectedNiveau || ''}
          onChange={(e) => onNiveauChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Sélectionner un niveau</option>
          {referentiel.niveaux
            .filter(niveau => !selectedMatiereData || selectedMatiereData.niveaux.includes(niveau))
            .map(niveau => (
              <option key={niveau} value={niveau}>{niveau}</option>
            ))}
        </select>
      </div>

      {/* Informations sur la matière sélectionnée */}
      {selectedMatiereData && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Informations sur la matière</h4>
          <p className="text-sm text-gray-600 mb-3">{selectedMatiereData.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Durée standard:</span>
              <span className="ml-2 text-gray-600">{selectedMatiereData.dureeStandard} minutes</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Coefficient:</span>
              <span className="ml-2 text-gray-600">{selectedMatiereData.coefficient}</span>
            </div>
          </div>

          <div className="mt-3">
            <span className="font-medium text-gray-700 text-sm">Compétences de base:</span>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedMatiereData.competencesBase.slice(0, 4).map((competence, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {competence}
                </span>
              ))}
              {selectedMatiereData.competencesBase.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{selectedMatiereData.competencesBase.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelecteurMatiere;