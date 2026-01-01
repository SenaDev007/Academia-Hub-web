import React, { useState } from 'react';
import FormModal from './FormModal';
import { Save, BookOpen, Calendar, Clock, Target, Users, FileText, Send, Eye, MessageSquare } from 'lucide-react';

interface CahierJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (journalData: any) => void;
  journalData?: any;
  isEdit?: boolean;
  classes?: any[];
  subjects?: any[];
  userRole?: string;
}

const CahierJournalModal: React.FC<CahierJournalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  journalData,
  isEdit = false,
  classes = [],
  subjects = [],
  userRole = 'teacher'
}) => {
  const [formData, setFormData] = useState({
    // Informations générales
    date: journalData?.date || new Date().toISOString().split('T')[0],
    classId: journalData?.classId || '',
    subjectId: journalData?.subjectId || '',
    duration: journalData?.duration || 60,
    startTime: journalData?.startTime || '08:00',
    endTime: journalData?.endTime || '09:00',
    
    // Objectifs pédagogiques
    objectifGeneral: journalData?.objectifGeneral || '',
    objectifsSpecifiques: journalData?.objectifsSpecifiques || [''],
    
    // Compétences visées (APC)
    competencesDisciplinaires: journalData?.competencesDisciplinaires || [''],
    competencesTransversales: journalData?.competencesTransversales || [''],
    
    // Déroulement prévu
    etapes: journalData?.etapes || [
      { nom: 'Mise en situation', duree: 10, activites: '', materiel: '' },
      { nom: 'Développement', duree: 35, activites: '', materiel: '' },
      { nom: 'Synthèse', duree: 10, activites: '', materiel: '' },
      { nom: 'Évaluation', duree: 5, activites: '', materiel: '' }
    ],
    
    // Supports et matériels
    supports: journalData?.supports || '',
    materiels: journalData?.materiels || '',
    
    // Évaluation prévue
    typeEvaluation: journalData?.typeEvaluation || 'formative',
    critereEvaluation: journalData?.critereEvaluation || '',
    
    // Observations
    observations: journalData?.observations || '',
    difficultesPrevisibles: journalData?.difficultesPrevisibles || '',
    
    // Métadonnées
    status: journalData?.status || 'planifie',
    template: journalData?.template || '',
    
    // Validation (pour directeur)
    commentaireDirecteur: journalData?.commentaireDirecteur || '',
    validationStatus: journalData?.validationStatus || 'en_attente'
  });

  const [activeSection, setActiveSection] = useState('general');

  const defaultClasses = [
    { id: 'CLS-001', name: '6ème A', level: 'secondaire_1er_cycle' },
    { id: 'CLS-002', name: '5ème B', level: 'secondaire_1er_cycle' },
    { id: 'CLS-003', name: '2nde A', level: 'secondaire_2nd_cycle' },
    { id: 'CLS-004', name: '1ère S', level: 'secondaire_2nd_cycle' }
  ];

  const defaultSubjects = [
    { id: 'SUB-001', name: 'Mathématiques', level: 'secondaire' },
    { id: 'SUB-002', name: 'Français', level: 'secondaire' },
    { id: 'SUB-003', name: 'Histoire-Géographie', level: 'secondaire' }
  ];

  const allClasses = classes.length > 0 ? classes : defaultClasses;
  const allSubjects = subjects.length > 0 ? subjects : defaultSubjects;

  const templates = [
    {
      id: 'math_secondaire',
      name: 'Mathématiques - Secondaire',
      objectifGeneral: 'Développer les compétences mathématiques selon l\'APC',
      etapes: [
        { nom: 'Révision/Prérequis', duree: 10, activites: 'Rappel des notions antérieures', materiel: 'Tableau, cahiers' },
        { nom: 'Présentation', duree: 15, activites: 'Introduction de la nouvelle notion', materiel: 'Supports visuels' },
        { nom: 'Développement', duree: 25, activites: 'Exercices d\'application', materiel: 'Manuel, exercices' },
        { nom: 'Synthèse', duree: 8, activites: 'Résumé et fixation', materiel: 'Tableau de synthèse' },
        { nom: 'Évaluation', duree: 2, activites: 'Questions de vérification', materiel: 'Grille d\'évaluation' }
      ]
    },
    {
      id: 'francais_secondaire',
      name: 'Français - Secondaire',
      objectifGeneral: 'Développer les compétences de communication selon l\'APC',
      etapes: [
        { nom: 'Motivation', duree: 5, activites: 'Mise en situation', materiel: 'Support déclencheur' },
        { nom: 'Observation', duree: 15, activites: 'Analyse du corpus', materiel: 'Textes, documents' },
        { nom: 'Conceptualisation', duree: 20, activites: 'Dégagement des règles', materiel: 'Tableau, schémas' },
        { nom: 'Application', duree: 15, activites: 'Exercices pratiques', materiel: 'Cahiers, fiches' },
        { nom: 'Évaluation', duree: 5, activites: 'Vérification des acquis', materiel: 'Questions orales' }
      ]
    }
  ];

  const sections = [
    { id: 'general', name: 'Informations générales', icon: Calendar },
    { id: 'objectifs', name: 'Objectifs pédagogiques', icon: Target },
    { id: 'competences', name: 'Compétences APC', icon: Users },
    { id: 'deroulement', name: 'Déroulement prévu', icon: Clock },
    { id: 'evaluation', name: 'Évaluation', icon: FileText },
    { id: 'observations', name: 'Observations', icon: MessageSquare }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: string, i: number) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleEtapeChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      etapes: prev.etapes.map((etape: any, i: number) => 
        i === index ? { ...etape, [field]: value } : etape
      )
    }));
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        objectifGeneral: template.objectifGeneral,
        etapes: template.etapes,
        template: templateId
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const sendWhatsAppNotification = async (phoneNumber: string, message: string) => {
    // Simulation d'envoi WhatsApp
    console.log('Envoi WhatsApp:', { to: phoneNumber, message });
  };

  const handleValidation = async (action: 'approve' | 'reject') => {
    const updatedData = {
      ...formData,
      validationStatus: action === 'approve' ? 'valide' : 'rejete',
      status: action === 'approve' ? 'valide' : 'a_revoir'
    };

    // Envoyer notification WhatsApp à l'enseignant
    const teacherPhone = '97123456'; // À récupérer depuis les données enseignant
    const message = `
📚 CAHIER JOURNAL - ${action === 'approve' ? 'VALIDÉ' : 'À REVOIR'}

Classe: ${allClasses.find(c => c.id === formData.classId)?.name}
Matière: ${allSubjects.find(s => s.id === formData.subjectId)?.name}
Date: ${formData.date}

${action === 'approve' 
  ? '✅ Votre cahier journal a été validé par le directeur.'
  : '❌ Votre cahier journal nécessite des modifications.'}

${formData.commentaireDirecteur ? `💬 Commentaire: ${formData.commentaireDirecteur}` : ''}

Consultez votre espace enseignant pour plus de détails.
École Exemple
    `.trim();

    await sendWhatsAppNotification(teacherPhone, message);
    onSave(updatedData);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier le cahier journal" : "Nouveau cahier journal"}
      size="xl"
      footer={
        <div className="flex justify-between">
          <div>
            {userRole === 'director' && formData.status === 'en_validation' && (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleValidation('approve')}
                  className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 flex items-center"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Valider
                </button>
                <button
                  type="button"
                  onClick={() => handleValidation('reject')}
                  className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Rejeter
                </button>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="cahier-journal-form"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </div>
      }
    >
      <form id="cahier-journal-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Navigation par sections */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                      activeSection === section.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {section.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Section Informations générales */}
            {activeSection === 'general' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Informations générales</h4>
                
                {/* Templates */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Utiliser un modèle prédéfini
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => applyTemplate(template.id)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left"
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100">{template.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Modèle structuré APC</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date de la séance*
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
                    <label htmlFor="classId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Classe*
                    </label>
                    <select
                      id="classId"
                      name="classId"
                      value={formData.classId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Sélectionner une classe</option>
                      {allClasses.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Matière*
                    </label>
                    <select
                      id="subjectId"
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Sélectionner une matière</option>
                      {allSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Durée (minutes)*
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Section Objectifs pédagogiques */}
            {activeSection === 'objectifs' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Objectifs pédagogiques</h4>
                
                <div>
                  <label htmlFor="objectifGeneral" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Objectif général*
                  </label>
                  <textarea
                    id="objectifGeneral"
                    name="objectifGeneral"
                    value={formData.objectifGeneral}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="À la fin de cette séance, l'apprenant sera capable de..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Objectifs spécifiques*
                  </label>
                  {formData.objectifsSpecifiques.map((objectif: string, index: number) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={objectif}
                        onChange={(e) => handleArrayChange('objectifsSpecifiques', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder={`Objectif spécifique ${index + 1}`}
                        required
                      />
                      {formData.objectifsSpecifiques.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('objectifsSpecifiques', index)}
                          className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('objectifsSpecifiques')}
                    className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                  >
                    + Ajouter un objectif
                  </button>
                </div>
              </div>
            )}

            {/* Section Compétences APC */}
            {activeSection === 'competences' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Compétences visées (APC)</h4>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                  <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Approche Par Compétences (APC)</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    L'APC privilégie le développement de compétences disciplinaires et transversales chez l'apprenant.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Compétences disciplinaires*
                  </label>
                  {formData.competencesDisciplinaires.map((competence: string, index: number) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={competence}
                        onChange={(e) => handleArrayChange('competencesDisciplinaires', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder={`Compétence disciplinaire ${index + 1}`}
                        required
                      />
                      {formData.competencesDisciplinaires.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('competencesDisciplinaires', index)}
                          className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('competencesDisciplinaires')}
                    className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                  >
                    + Ajouter une compétence
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Compétences transversales
                  </label>
                  {formData.competencesTransversales.map((competence: string, index: number) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={competence}
                        onChange={(e) => handleArrayChange('competencesTransversales', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder={`Compétence transversale ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('competencesTransversales', index)}
                        className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('competencesTransversales')}
                    className="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                  >
                    + Ajouter une compétence
                  </button>
                </div>
              </div>
            )}

            {/* Section Déroulement prévu */}
            {activeSection === 'deroulement' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Déroulement prévu (étapes chronologiques)</h4>
                
                {formData.etapes.map((etape: any, index: number) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nom de l'étape*
                        </label>
                        <input
                          type="text"
                          value={etape.nom}
                          onChange={(e) => handleEtapeChange(index, 'nom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Durée (min)*
                        </label>
                        <input
                          type="number"
                          value={etape.duree}
                          onChange={(e) => handleEtapeChange(index, 'duree', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Matériel
                        </label>
                        <input
                          type="text"
                          value={etape.materiel}
                          onChange={(e) => handleEtapeChange(index, 'materiel', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Activités prévues*
                        </label>
                        <textarea
                          value={etape.activites}
                          onChange={(e) => handleEtapeChange(index, 'activites', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Durée totale: {formData.etapes.reduce((total: number, etape: any) => total + etape.duree, 0)} minutes
                  </p>
                </div>
              </div>
            )}

            {/* Section Évaluation */}
            {activeSection === 'evaluation' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Évaluation prévue</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="typeEvaluation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type d'évaluation*
                    </label>
                    <select
                      id="typeEvaluation"
                      name="typeEvaluation"
                      value={formData.typeEvaluation}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="formative">Évaluation formative</option>
                      <option value="sommative">Évaluation sommative</option>
                      <option value="diagnostique">Évaluation diagnostique</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="critereEvaluation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Critères d'évaluation*
                  </label>
                  <textarea
                    id="critereEvaluation"
                    name="critereEvaluation"
                    value={formData.critereEvaluation}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Définir les critères d'évaluation selon l'APC..."
                  />
                </div>
              </div>
            )}

            {/* Section Observations */}
            {activeSection === 'observations' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Observations et notes</h4>
                
                <div>
                  <label htmlFor="observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observations générales
                  </label>
                  <textarea
                    id="observations"
                    name="observations"
                    value={formData.observations}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Notes personnelles, adaptations prévues..."
                  />
                </div>
                
                <div>
                  <label htmlFor="difficultesPrevisibles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficultés prévisibles
                  </label>
                  <textarea
                    id="difficultesPrevisibles"
                    name="difficultesPrevisibles"
                    value={formData.difficultesPrevisibles}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Anticiper les difficultés et prévoir des solutions..."
                  />
                </div>

                {/* Section validation pour directeur */}
                {userRole === 'director' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Validation du directeur</h5>
                    <textarea
                      name="commentaireDirecteur"
                      value={formData.commentaireDirecteur}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Commentaires et suggestions pour l'enseignant..."
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Conformité APC */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-900/30">
          <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">Conformité système éducatif béninois</h5>
          <p className="text-sm text-green-700 dark:text-green-400">
            Ce cahier journal respecte l'Approche Par Compétences (APC) et les directives du MEMP.
            Toutes les sections sont conformes aux exigences pédagogiques officielles.
          </p>
        </div>
      </form>
    </FormModal>
  );
};

export default CahierJournalModal;