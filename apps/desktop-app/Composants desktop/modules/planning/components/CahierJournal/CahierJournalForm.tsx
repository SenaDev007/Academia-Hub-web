import React, { useState } from 'react';
import { Save, X, Upload, Calendar, Clock, BookOpen, Target, Users, FileText, Eye, Palette } from 'lucide-react';
import { CahierJournalEntry } from '../types';
import SelecteurMatiere from './SelecteurMatiere';
import EditorRiche from './EditorRiche';

interface CahierJournalFormProps {
  entry?: CahierJournalEntry;
  onSubmit: (entry: Omit<CahierJournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CahierJournalForm: React.FC<CahierJournalFormProps> = ({ entry, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    date: entry?.date || new Date().toISOString().split('T')[0],
    classe: entry?.classe || '',
    matiere: entry?.matiere || '',
    duree: entry?.duree || 60,
    objectifs: entry?.objectifs || '',
    competences: entry?.competences || [],
    deroulement: entry?.deroulement || '',
    supports: entry?.supports || '',
    evaluation: entry?.evaluation || '',
    observations: entry?.observations || '',
    statut: entry?.statut || 'planifie',
    enseignant: entry?.enseignant || 'Marie KOUASSI'
  });

  const [useRichEditor, setUseRichEditor] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const classes = ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'];
  const matieres = ['Français', 'Mathématiques', 'Sciences', 'Histoire-Géographie', 'Éducation Civique', 'Arts Plastiques', 'Éducation Physique'];
  const competencesDisponibles = ['Lecture', 'Écriture', 'Calcul', 'Compréhension', 'Expression orale', 'Expression écrite', 'Résolution de problèmes'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'La date est obligatoire';
    if (!formData.classe) newErrors.classe = 'La classe est obligatoire';
    if (!formData.matiere) newErrors.matiere = 'La matière est obligatoire';
    if (formData.duree <= 0) newErrors.duree = 'La durée doit être positive';
    if (!formData.objectifs.trim()) newErrors.objectifs = 'Les objectifs sont obligatoires';
    if (formData.competences.length === 0) newErrors.competences = 'Au moins une compétence doit être sélectionnée';
    if (!formData.deroulement.trim()) newErrors.deroulement = 'Le déroulement est obligatoire';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData as Omit<CahierJournalEntry, 'id' | 'createdAt' | 'updatedAt'>);
    }
  };

  const handleCompetenceToggle = (competence: string) => {
    const newCompetences = formData.competences.includes(competence)
      ? formData.competences.filter(c => c !== competence)
      : [...formData.competences, competence];
    
    setFormData({ ...formData, competences: newCompetences });
  };

  const handleMatiereChange = (matiere: any) => {
    setFormData({ 
      ...formData, 
      matiere: matiere.nom,
      duree: matiere.dureeStandard,
      competences: matiere.competencesBase.slice(0, 3) // Sélectionner les 3 premières compétences par défaut
    });
  };

  const handleNiveauChange = (niveau: string) => {
    setFormData({ ...formData, classe: niveau });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="text-blue-600" />
                {entry ? 'Modifier la Séance' : 'Nouvelle Séance'}
              </h2>
              <p className="text-gray-600 mt-1">Planification pédagogique conforme aux programmes officiels</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Date de la séance *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div className="col-span-2">
              <SelecteurMatiere
                selectedMatiere={formData.matiere}
                selectedNiveau={formData.classe}
                onMatiereChange={handleMatiereChange}
                onNiveauChange={handleNiveauChange}
              />
              {errors.matiere && <p className="text-red-500 text-xs mt-1">{errors.matiere}</p>}
              {errors.classe && <p className="text-red-500 text-xs mt-1">{errors.classe}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} className="inline mr-1" />
                Durée (minutes) *
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={formData.duree}
                onChange={(e) => setFormData({ ...formData, duree: parseInt(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.duree ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.duree && <p className="text-red-500 text-xs mt-1">{errors.duree}</p>}
            </div>
          </div>

          {/* Objectifs pédagogiques */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target size={16} className="inline mr-1" />
              Objectifs pédagogiques *
            </label>
            <textarea
              value={formData.objectifs}
              onChange={(e) => setFormData({ ...formData, objectifs: e.target.value })}
              rows={3}
              placeholder="À la fin de cette séance, l'élève sera capable de..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.objectifs ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.objectifs && <p className="text-red-500 text-xs mt-1">{errors.objectifs}</p>}
          </div>

          {/* Compétences visées */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compétences visées *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {competencesDisponibles.map(competence => (
                <label key={competence} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.competences.includes(competence)}
                    onChange={() => handleCompetenceToggle(competence)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{competence}</span>
                </label>
              ))}
            </div>
            {errors.competences && <p className="text-red-500 text-xs mt-1">{errors.competences}</p>}
          </div>

          {/* Déroulement */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                <FileText size={16} className="inline mr-1" />
                Déroulement prévu *
              </label>
              <button
                type="button"
                onClick={() => setUseRichEditor(!useRichEditor)}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Palette size={14} />
                {useRichEditor ? 'Éditeur simple' : 'Éditeur riche'}
              </button>
            </div>
            
            {useRichEditor ? (
              <EditorRiche
                value={formData.deroulement}
                onChange={(value) => setFormData({ ...formData, deroulement: value })}
                placeholder="1. Introduction (5 min)&#10;2. Développement (40 min)&#10;3. Synthèse (10 min)&#10;4. Évaluation (5 min)"
                className={errors.deroulement ? 'border-red-500' : ''}
                minHeight="200px"
              />
            ) : (
              <textarea
                value={formData.deroulement}
                onChange={(e) => setFormData({ ...formData, deroulement: e.target.value })}
                rows={6}
                placeholder="1. Introduction (5 min)&#10;2. Développement (40 min)&#10;3. Synthèse (10 min)&#10;4. Évaluation (5 min)"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.deroulement ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            )}
            {errors.deroulement && <p className="text-red-500 text-xs mt-1">{errors.deroulement}</p>}
          </div>

          {/* Supports et matériels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload size={16} className="inline mr-1" />
              Supports et matériels
            </label>
            <textarea
              value={formData.supports}
              onChange={(e) => setFormData({ ...formData, supports: e.target.value })}
              rows={2}
              placeholder="Tableau, cahiers, fiches d'exercices, images, objets..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Évaluation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Eye size={16} className="inline mr-1" />
              Modalités d'évaluation
            </label>
            <textarea
              value={formData.evaluation}
              onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
              rows={2}
              placeholder="Questions orales, exercices d'application, observation des comportements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observations et adaptations
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              rows={2}
              placeholder="Difficultés anticipées, adaptations pour les élèves en difficulté..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              {entry ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CahierJournalForm;