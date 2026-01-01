import React, { useState } from 'react';
import { Save, Send, Calendar, Clock, BookOpen, FileText, Plus, Trash2, Eye, Upload, CheckCircle } from 'lucide-react';
import EditorRiche from './EditorRiche';
import SelecteurMatiere from './SelecteurMatiere';
import NotificationService from './services/NotificationService';
import CahierTexteService from './services/CahierTexteService';

interface User {
  id: string;
  name: string;
  role: 'enseignant' | 'directeur' | 'conseiller' | 'administrateur';
  matieres?: string[];
  classes?: string[];
}

interface CahierTexteEntryProps {
  user: User;
}

interface Competence {
  id: string;
  libelle: string;
  niveau: 'acquis' | 'en_cours' | 'non_acquis';
}

interface Devoir {
  id: string;
  type: 'exercice' | 'composition' | 'expose' | 'recherche';
  titre: string;
  description: string;
  dateRendu: string;
  notesSur: number;
}

const CahierTexteEntry: React.FC<CahierTexteEntryProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    matiere: '',
    classe: '',
    heureDebut: '08:00',
    heureFin: '10:00',
    dureeEffective: '2',
    typeSeance: 'cours',
    theme: '',
    sousTitre: '',
    objectifs: '',
    contenuEnseigne: '',
    methodesUtilisees: 'Cours magistral',
    materielsUtilises: '',
    evaluationFormative: '',
    observationsEleves: '',
    difficultes: '',
    remediation: '',
    statut: 'brouillon'
  });

  const [competences, setCompetences] = useState<Competence[]>([]);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const typesSeance = [
    { value: 'cours', label: 'Cours magistral' },
    { value: 'tp', label: 'Travaux pratiques' },
    { value: 'td', label: 'Travaux dirigés' },
    { value: 'evaluation', label: 'Évaluation' },
    { value: 'remediation', label: 'Remédiation' },
    { value: 'sortie', label: 'Sortie pédagogique' }
  ];

  const methodesOptions = [
    'Cours magistral',
    'Travail de groupe',
    'Méthode interrogative',
    'Méthode démonstrative',
    'Méthode active',
    'Approche par compétences (APC)',
    'Pédagogie différenciée'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const ajouterCompetence = () => {
    const nouvelleCompetence: Competence = {
      id: Date.now().toString(),
      libelle: '',
      niveau: 'en_cours'
    };
    setCompetences([...competences, nouvelleCompetence]);
  };

  const modifierCompetence = (id: string, field: keyof Competence, value: string) => {
    setCompetences(competences.map(comp => 
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
  };

  const supprimerCompetence = (id: string) => {
    setCompetences(competences.filter(comp => comp.id !== id));
  };

  const ajouterDevoir = () => {
    const nouveauDevoir: Devoir = {
      id: Date.now().toString(),
      type: 'exercice',
      titre: '',
      description: '',
      dateRendu: '',
      notesSur: 20
    };
    setDevoirs([...devoirs, nouveauDevoir]);
  };

  const modifierDevoir = (id: string, field: keyof Devoir, value: string | number) => {
    setDevoirs(devoirs.map(devoir => 
      devoir.id === id ? { ...devoir, [field]: value } : devoir
    ));
  };

  const supprimerDevoir = (id: string) => {
    setDevoirs(devoirs.filter(devoir => devoir.id !== id));
  };

  const sauvegarder = async (statut: 'brouillon' | 'soumis') => {
    setIsSubmitting(true);
    
    const donneesComplete = {
      ...formData,
      statut,
      competences,
      devoirs,
      dateCreation: new Date().toISOString(),
      enseignantId: user.id
    };
    
    try {
      if (statut === 'soumis') {
        // Envoyer à l'administration
        await CahierTexteService.soumettreVersAdministration(donneesComplete);
        NotificationService.envoyerNotificationAdministration(donneesComplete, user);
        setShowSuccessModal(true);
      } else {
        // Sauvegarder en brouillon
        await CahierTexteService.sauvegarderBrouillon(donneesComplete);
        NotificationService.showSuccess('Brouillon sauvegardé avec succès');
      }
      
      // Réinitialiser le formulaire après soumission
      if (statut === 'soumis') {
        resetForm();
      }
    } catch (error) {
      NotificationService.showError('Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      matiere: '',
      classe: '',
      heureDebut: '08:00',
      heureFin: '10:00',
      dureeEffective: '2',
      typeSeance: 'cours',
      theme: '',
      sousTitre: '',
      objectifs: '',
      contenuEnseigne: '',
      methodesUtilisees: 'Cours magistral',
      materielsUtilises: '',
      evaluationFormative: '',
      observationsEleves: '',
      difficultes: '',
      remediation: '',
      statut: 'brouillon'
    });
    setCompetences([]);
    setDevoirs([]);
  };

  const validerFormulaire = () => {
    const champsObligatoires = ['date', 'matiere', 'classe', 'theme', 'objectifs', 'contenuEnseigne'];
    const champsManquants = champsObligatoires.filter(champ => !formData[champ as keyof typeof formData]);
    
    if (champsManquants.length > 0) {
      NotificationService.showError(`Champs obligatoires manquants: ${champsManquants.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const handleSauvegarder = (statut: 'brouillon' | 'soumis') => {
    if (statut === 'soumis' && !validerFormulaire()) {
      return;
    }
    sauvegarder(statut);
  };

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Aperçu du Cahier de Texte</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Retour à l'édition
          </button>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 print:shadow-none">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">RÉPUBLIQUE DU BÉNIN</h1>
            <p className="text-lg text-gray-700">CAHIER DE TEXTE ÉLECTRONIQUE</p>
            <p className="text-sm text-gray-600 mt-2">Academia Hub - Année scolaire 2024-2025</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p><strong>Enseignant :</strong> {user.name}</p>
              <p><strong>Matière :</strong> {formData.matiere}</p>
              <p><strong>Classe :</strong> {formData.classe}</p>
            </div>
            <div>
              <p><strong>Date :</strong> {new Date(formData.date).toLocaleDateString('fr-FR')}</p>
              <p><strong>Horaires :</strong> {formData.heureDebut} - {formData.heureFin}</p>
              <p><strong>Durée effective :</strong> {formData.dureeEffective}h</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">THÈME ET SOUS-TITRE</h3>
              <p>{formData.theme}</p>
              {formData.sousTitre && <p className="text-sm text-gray-600">{formData.sousTitre}</p>}
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-2">OBJECTIFS PÉDAGOGIQUES</h3>
              <p>{formData.objectifs}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-2">CONTENU ENSEIGNÉ</h3>
              <div dangerouslySetInnerHTML={{ __html: formData.contenuEnseigne }} />
            </div>
            
            {competences.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">COMPÉTENCES VISÉES</h3>
                <ul className="list-disc pl-5">
                  {competences.map(comp => (
                    <li key={comp.id} className="mb-1">
                      {comp.libelle} 
                      <span className={`ml-2 px-2 py-1 text-xs rounded ${
                        comp.niveau === 'acquis' ? 'bg-green-100 text-green-800' :
                        comp.niveau === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {comp.niveau === 'acquis' ? 'Acquis' : 
                         comp.niveau === 'en_cours' ? 'En cours' : 'Non acquis'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {devoirs.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">DEVOIRS DONNÉS</h3>
                {devoirs.map(devoir => (
                  <div key={devoir.id} className="mb-3 p-3 bg-gray-50 rounded">
                    <p><strong>{devoir.titre}</strong> ({devoir.type})</p>
                    <p className="text-sm text-gray-600">{devoir.description}</p>
                    <p className="text-sm">À rendre le : {new Date(devoir.dateRendu).toLocaleDateString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saisie Quotidienne</h2>
          <p className="text-gray-600">Enregistrez votre séance pédagogique</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowPreview(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center"
          >
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </button>
          <button
            onClick={() => sauvegarder('brouillon')}
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Sauvegarde...' : 'Brouillon'}
          </button>
          <button
            onClick={() => handleSauvegarder('soumis')}
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isSubmitting ? 'Envoi...' : 'Soumettre à l\'administration'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <SelecteurMatiere
                value={formData.matiere}
                onChange={(value) => handleInputChange('matiere', value)}
                matieres={user.matieres || []}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classe *
              </label>
              <select
                value={formData.classe}
                onChange={(e) => handleInputChange('classe', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Sélectionner une classe</option>
                {user.classes?.map(classe => (
                  <option key={classe} value={classe}>{classe}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Horaires et durée */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure début
              </label>
              <input
                type="time"
                value={formData.heureDebut}
                onChange={(e) => handleInputChange('heureDebut', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heure fin
              </label>
              <input
                type="time"
                value={formData.heureFin}
                onChange={(e) => handleInputChange('heureFin', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée effective (h)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="8"
                value={formData.dureeEffective}
                onChange={(e) => handleInputChange('dureeEffective', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de séance
              </label>
              <select
                value={formData.typeSeance}
                onChange={(e) => handleInputChange('typeSeance', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {typesSeance.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Thème et objectifs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thème principal *
              </label>
              <input
                type="text"
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                placeholder="Ex: Les nombres décimaux"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sous-titre
              </label>
              <input
                type="text"
                value={formData.sousTitre}
                onChange={(e) => handleInputChange('sousTitre', e.target.value)}
                placeholder="Ex: Addition et soustraction"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectifs pédagogiques *
            </label>
            <textarea
              value={formData.objectifs}
              onChange={(e) => handleInputChange('objectifs', e.target.value)}
              placeholder="Décrivez les objectifs de la séance selon l'approche par compétences (APC)"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Contenu enseigné */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu enseigné *
            </label>
            <EditorRiche
              value={formData.contenuEnseigne}
              onChange={(value) => handleInputChange('contenuEnseigne', value)}
              placeholder="Détaillez le contenu de votre cours..."
            />
          </div>

          {/* Compétences */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Compétences visées (APC)</h3>
              <button
                onClick={ajouterCompetence}
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {competences.map((competence) => (
                <div key={competence.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <input
                    type="text"
                    value={competence.libelle}
                    onChange={(e) => modifierCompetence(competence.id, 'libelle', e.target.value)}
                    placeholder="Libellé de la compétence"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={competence.niveau}
                    onChange={(e) => modifierCompetence(competence.id, 'niveau', e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="non_acquis">Non acquis</option>
                    <option value="en_cours">En cours</option>
                    <option value="acquis">Acquis</option>
                  </select>
                  <button
                    onClick={() => supprimerCompetence(competence.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Devoirs */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Devoirs donnés</h3>
              <button
                onClick={ajouterDevoir}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </button>
            </div>
            <div className="space-y-4">
              {devoirs.map((devoir) => (
                <div key={devoir.id} className="p-4 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <select
                      value={devoir.type}
                      onChange={(e) => modifierDevoir(devoir.id, 'type', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="exercice">Exercice</option>
                      <option value="composition">Composition</option>
                      <option value="expose">Exposé</option>
                      <option value="recherche">Recherche</option>
                    </select>
                    <input
                      type="date"
                      value={devoir.dateRendu}
                      onChange={(e) => modifierDevoir(devoir.id, 'dateRendu', e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={devoir.notesSur}
                        onChange={(e) => modifierDevoir(devoir.id, 'notesSur', parseInt(e.target.value))}
                        min="1"
                        max="20"
                        className="w-16 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-600">/ 20</span>
                      <button
                        onClick={() => supprimerDevoir(devoir.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={devoir.titre}
                    onChange={(e) => modifierDevoir(devoir.id, 'titre', e.target.value)}
                    placeholder="Titre du devoir"
                    className="w-full mb-2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <textarea
                    value={devoir.description}
                    onChange={(e) => modifierDevoir(devoir.id, 'description', e.target.value)}
                    placeholder="Description détaillée du devoir"
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Méthodes et matériels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Méthodes utilisées
              </label>
              <select
                value={formData.methodesUtilisees}
                onChange={(e) => handleInputChange('methodesUtilisees', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {methodesOptions.map(methode => (
                  <option key={methode} value={methode}>{methode}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matériels utilisés
              </label>
              <input
                type="text"
                value={formData.materielsUtilises}
                onChange={(e) => handleInputChange('materielsUtilises', e.target.value)}
                placeholder="Ex: Tableau, projecteur, supports..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Observations et difficultés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observations sur les élèves
              </label>
              <textarea
                value={formData.observationsEleves}
                onChange={(e) => handleInputChange('observationsEleves', e.target.value)}
                placeholder="Participation, comportement, niveau de compréhension..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficultés rencontrées
              </label>
              <textarea
                value={formData.difficultes}
                onChange={(e) => handleInputChange('difficultes', e.target.value)}
                placeholder="Difficultés pédagogiques, techniques, ou organisationnelles..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remédiation prévue
            </label>
            <textarea
              value={formData.remediation}
              onChange={(e) => handleInputChange('remediation', e.target.value)}
              placeholder="Actions correctives et mesures d'accompagnement..."
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Modal de succès */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Cahier envoyé avec succès !</h3>
              <p className="text-gray-600 mb-4">
                Votre cahier de texte a été transmis à l'administration pour validation.
                Vous recevrez une notification dès qu'il sera traité.
              </p>
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Prochaines étapes :</strong><br/>
                  1. Validation par le directeur<br/>
                  2. Approbation par le conseiller pédagogique<br/>
                  3. Archivage dans le dossier officiel
                </p>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CahierTexteEntry;