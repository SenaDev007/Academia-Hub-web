import React from 'react';
import { BookOpen } from 'lucide-react';

interface SelecteurMatiereProps {
  value: string;
  onChange: (value: string) => void;
  matieres?: string[];
}

const SelecteurMatiere: React.FC<SelecteurMatiereProps> = ({ value, onChange, matieres = [] }) => {
  const matieresDisponibles = matieres.length > 0 ? matieres : [
    'Mathématiques',
    'Français',
    'Anglais',
    'Histoire-Géographie',
    'Sciences de la Vie et de la Terre (SVT)',
    'Physique-Chimie',
    'Éducation Civique et Morale',
    'Éducation Physique et Sportive',
    'Arts Plastiques',
    'Musique',
    'Technologie',
    'Informatique'
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <BookOpen className="h-4 w-4 inline mr-1" />
        Matière *
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        required
      >
        <option value="">Sélectionner une matière</option>
        {matieresDisponibles.map(matiere => (
          <option key={matiere} value={matiere}>{matiere}</option>
        ))}
      </select>
    </div>
  );
};

export default SelecteurMatiere;