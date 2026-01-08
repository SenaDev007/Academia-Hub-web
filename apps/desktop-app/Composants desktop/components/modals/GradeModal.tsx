import React, { useState } from 'react';
import FormModal from './FormModal';
import { Save, BookOpen, Brain } from 'lucide-react';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  evaluationData?: any;
  isEdit?: boolean;
}

const GradeModal: React.FC<GradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  evaluationData,
  isEdit = false
}) => {
  // Niveaux d'enseignement
  const educationLevels = [
    { id: 'preschool', name: 'Maternelle' },
    { id: 'primary', name: 'Primaire' },
    { id: 'secondary', name: 'Secondaire' }
  ];

  // Classes par niveau
  const classes = {
    preschool: ['Petite Section', 'Moyenne Section', 'Grande Section'],
    primary: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
    secondary: ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']
  };

  // Matières par niveau
  const subjects = {
    preschool: [
      'Développement corporel et moteur',
      'Développement socio-affectif',
      'Développement cognitif et langagier',
      'Développement artistique et esthétique'
    ],
    primary: [
      'Communication orale',
      'Expression écrite',
      'Lecture',
      'Dictée',
      'Mathématiques',
      'Education Scientifique et Technologique',
      'Education Sociale',
      'EA (Dessin/Couture)',
      'EA (Poésie/Chant/Conte)',
      'Anglais',
      'Entrepreneuriat',
      'Education Physique et Sportive',
      'Langues Nationales'
    ],
    secondary: [
      'Mathématiques',
      'Sciences Physiques',
      'Sciences Naturelles',
      'Français',
      'Philosophie',
      'Histoire-Géographie',
      'Anglais',
      'Allemand/Espagnol',
      'EPS',
      'Arts Plastiques'
    ]
  };

  // Types d'évaluation par niveau
  const evaluationTypes = {
    preschool: ['Observation continue'],
    primary: ['Évaluation Mensuelle 1', 'Évaluation Mensuelle 2', 'Évaluation Certificative'],
    secondary: ['Interrogation Écrite 1', 'Interrogation Écrite 2', 'Devoir Surveillé 1', 'Devoir Surveillé 2']
  };

  // Périodes d'évaluation
  const evaluationPeriods = [
    { id: 'trimester1', name: '1er Trimestre' },
    { id: 'trimester2', name: '2ème Trimestre' },
    { id: 'trimester3', name: '3ème Trimestre' }
  ];

  // État initial du formulaire
  const [formData, setFormData] = useState({
    level: evaluationData?.level || 'secondary',
    class: evaluationData?.class || '',
    subject: evaluationData?.subject || '',
    evaluationType: evaluationData?.evaluationType || '',
    period: evaluationData?.period || 'trimester1',
    date: evaluationData?.date || new Date().toISOString().split('T')[0],
    maxScore: evaluationData?.maxScore || 20,
    students: evaluationData?.students || []
  });

  // Gestion des changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'level') {
      // Réinitialiser la classe et la matière si le niveau change
      setFormData({
        ...formData,
        level: value,
        class: '',
        subject: '',
        evaluationType: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Gestion des notes des élèves
  const handleStudentGradeChange = (studentId: number, field: string, value: string) => {
    const numValue = parseFloat(value);
    
    setFormData(prev => ({
      ...prev,
      students: prev.students.map((student: any) => 
        student.id === studentId 
          ? { ...student, [field]: isNaN(numValue) ? '' : numValue } 
          : student
      )
    }));
  };

  // Calcul de la moyenne pour le niveau primaire
  const calculatePrimaryAverage = (em1: number, em2: number, ec: number) => {
    if (isNaN(em1) || isNaN(em2) || isNaN(ec)) return '';
    
    const emAverage = (em1 + em2) / 2;
    return ((emAverage + ec) / 2).toFixed(2);
  };

  // Calcul de la moyenne pour le niveau secondaire
  const calculateSecondaryAverage = (ie1: number, ie2: number, ds1: number, ds2: number) => {
    // Vérifier si toutes les notes sont disponibles
    const validValues = [ie1, ie2, ds1, ds2].filter(val => !isNaN(val));
    if (validValues.length === 0) return '';
    
    // Si certaines notes manquent, calculer avec celles disponibles
    if (validValues.length < 4) {
      return (validValues.reduce((sum, val) => sum + val, 0) / validValues.length).toFixed(2);
    }
    
    // Calcul complet
    const ieAverage = (ie1 + ie2) / 2;
    return ((ieAverage + 2 * ((ds1 + ds2) / 2)) / 3).toFixed(2);
  };

  // Obtenir l'appréciation basée sur la note
  const getAppreciation = (grade: number) => {
    if (isNaN(grade)) return { mention: '', emoji: '' };
    
    if (formData.level === 'primary') {
      if (grade >= 18) return { mention: 'Excellent', emoji: '🌟' };
      if (grade >= 16) return { mention: 'Très Bien', emoji: '😊' };
      if (grade >= 14) return { mention: 'Bien', emoji: '👍' };
      if (grade >= 12) return { mention: 'Assez Bien', emoji: '😐' };
      if (grade >= 10) return { mention: 'Passable', emoji: '⚠️' };
      if (grade >= 8) return { mention: 'Insuffisant', emoji: '❌' };
      return { mention: 'Très Insuffisant', emoji: '🚫' };
    } else {
      if (grade >= 18) return { mention: 'Excellent', emoji: '' };
      if (grade >= 16) return { mention: 'Très Bien', emoji: '' };
      if (grade >= 14) return { mention: 'Bien', emoji: '' };
      if (grade >= 12) return { mention: 'Assez Bien', emoji: '' };
      if (grade >= 10) return { mention: 'Passable', emoji: '' };
      if (grade >= 8) return { mention: 'Faible', emoji: '' };
      return { mention: 'Très Faible', emoji: '' };
    }
  };

  // Obtenir la couleur basée sur la note
  const getGradeColor = (grade: number) => {
    if (isNaN(grade)) return '';
    
    if (grade >= 16) return 'text-green-600 dark:text-green-400';
    if (grade >= 14) return 'text-blue-600 dark:text-blue-400';
    if (grade >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Données fictives d'élèves pour la démonstration
  const mockStudents = [
    { id: 1, name: 'Marie Dubois', class: 'Terminale S' },
    { id: 2, name: 'Pierre Martin', class: 'Terminale S' },
    { id: 3, name: 'Sophie Lambert', class: 'Terminale S' },
    { id: 4, name: 'Lucas Bernard', class: 'Terminale S' },
    { id: 5, name: 'Emma Rodriguez', class: 'Terminale S' }
  ];

  // Initialiser les élèves si nécessaire
  React.useEffect(() => {
    if (formData.students.length === 0) {
      setFormData(prev => ({
        ...prev,
        students: mockStudents.map(student => ({
          ...student,
          em1: '',
          em2: '',
          ec: '',
          ie1: '',
          ie2: '',
          ds1: '',
          ds2: '',
          grade: '',
          appreciation: ''
        }))
      }));
    }
  }, [formData.students.length]);

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
            form="grade-form"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      }
    >
      <form id="grade-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Niveau d'enseignement*
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {educationLevels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Classe*
            </label>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Sélectionner une classe</option>
              {classes[formData.level as keyof typeof classes]?.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Matière*
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Sélectionner une matière</option>
              {subjects[formData.level as keyof typeof subjects]?.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="evaluationType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type d'évaluation*
            </label>
            <select
              id="evaluationType"
              name="evaluationType"
              value={formData.evaluationType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Sélectionner un type</option>
              {evaluationTypes[formData.level as keyof typeof evaluationTypes]?.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Période*
            </label>
            <select
              id="period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {evaluationPeriods.map(period => (
                <option key={period.id} value={period.id}>{period.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date de l'évaluation*
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
        </div>
        
        {formData.level === 'preschool' ? (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Évaluation qualitative - Maternelle</h5>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Pour le niveau maternelle, l'évaluation se fait par compétences avec les codes suivants:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-200 dark:border-blue-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300">TB</span> - Très Bien (Compétence maîtrisée)
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-200 dark:border-blue-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300">B</span> - Bien (Compétence en cours d'acquisition)
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-200 dark:border-blue-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300">AB</span> - Assez Bien (Compétence partiellement acquise)
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded border border-blue-200 dark:border-blue-800">
                  <span className="font-bold text-blue-800 dark:text-blue-300">I</span> - Insuffisant (Compétence non acquise)
                </div>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Élève
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Évaluation
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Observations
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {formData.students.map((student: any) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{student.class}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={student.grade || ''}
                        onChange={(e) => handleStudentGradeChange(student.id, 'grade', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Sélectionner</option>
                        <option value="TB">TB - Très Bien</option>
                        <option value="B">B - Bien</option>
                        <option value="AB">AB - Assez Bien</option>
                        <option value="I">I - Insuffisant</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <textarea
                        value={student.observation || ''}
                        onChange={(e) => handleStudentGradeChange(student.id, 'observation', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Observations sur l'élève..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : formData.level === 'primary' ? (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-green-800 dark:text-green-300 mb-2">Évaluation primaire - Notes sur 20</h5>
              <p className="text-sm text-green-700 dark:text-green-400">
                Pour le niveau primaire, l'évaluation comprend deux évaluations mensuelles (EM1, EM2) et une évaluation certificative (EC).
                La moyenne est calculée selon la formule: ((EM1 + EM2) / 2 + EC) / 2
              </p>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Élève
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    EM1
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    EM2
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    EC
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Moyenne
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Appréciation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {formData.students.map((student: any) => {
                  const em1 = parseFloat(student.em1);
                  const em2 = parseFloat(student.em2);
                  const ec = parseFloat(student.ec);
                  const average = calculatePrimaryAverage(em1, em2, ec);
                  const appreciation = getAppreciation(parseFloat(average));
                  
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.class}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          value={student.em1 || ''}
                          onChange={(e) => handleStudentGradeChange(student.id, 'em1', e.target.value)}
                          min="0"
                          max="20"
                          step="0.25"
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          value={student.em2 || ''}
                          onChange={(e) => handleStudentGradeChange(student.id, 'em2', e.target.value)}
                          min="0"
                          max="20"
                          step="0.25"
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          value={student.ec || ''}
                          onChange={(e) => handleStudentGradeChange(student.id, 'ec', e.target.value)}
                          min="0"
                          max="20"
                          step="0.25"
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-bold ${getGradeColor(parseFloat(average))}`}>
                          {average || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {average && (
                          <div className="flex items-center">
                            <span className="text-lg mr-1">{appreciation.emoji}</span>
                            <span className="text-sm font-medium">{appreciation.mention}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 dark:text-blue-300 flex items-center mb-2">
                <Brain className="w-5 h-5 mr-2" />
                Suggestions IA pour les commentaires
              </h5>
              <div className="space-y-2">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">Marie Dubois:</span> Excellente progression ce trimestre. Continue à maintenir ce niveau d'excellence et à participer activement en classe.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    <span className="font-medium">Pierre Martin:</span> Bon travail, mais des difficultés persistent dans certains domaines. Un travail plus régulier et des exercices supplémentaires sont recommandés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h5 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Évaluation secondaire - Notes sur 20 avec coefficients</h5>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                Pour le niveau secondaire, l'évaluation comprend deux interrogations écrites (IE1, IE2) et deux devoirs surveillés (DS1, DS2).
                La moyenne est calculée selon la formule: ((IE1 + IE2) / 2 + (DS1 + DS2)) / 3
              </p>
              {formData.subject && (
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mt-2">
                  Coefficient pour {formData.subject}: {
                    formData.subject === 'Mathématiques' ? '7' :
                    formData.subject === 'Sciences Physiques' ? '6' :
                    formData.subject === 'Sciences Naturelles' ? '3' :
                    formData.subject === 'Français' ? '3' :
                    formData.subject === 'Philosophie' ? '2' :
                    formData.subject === 'Histoire-Géographie' ? '2' :
                    formData.subject === 'Anglais' ? '2' :
                    formData.subject === 'Allemand/Espagnol' ? '2' :
                    formData.subject === 'EPS' ? '1' :
                    formData.subject === 'Arts Plastiques' ? '1' : 'N/A'
                  }
                </p>
              )}
            </div>
            
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Élève
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IE1
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IE2
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    DS1
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    DS2
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Moyenne
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Appréciation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {formData.students.map((student: any) => {
                  const ie1 = parseFloat(student.ie1);
                  const ie2 = parseFloat(student.ie2);
                  const ds1 = parseFloat(student.ds1);
                  const ds2 = parseFloat(student.ds2);
                  const average = calculateSecondaryAverage(ie1, ie2, ds1, ds2);
                  const appreciation = getAppreciation(parseFloat(average));
                  
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.class}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          value={student.ie1 || ''}
                          onChange={(e) => handleStudentGradeChange(student.id, 'ie1', e.target.value)}
                          min="0"
                          max="20"
                          step="0.25"
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          value={student.ie2 || ''}
                          onChange={(e) => handleStudentGradeChange(student.id, 'ie2', e.target.value)}
                          min="0"
                          max="20"
                          step="0.25"
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          value={student.ds1 || ''}
                          onChange={(e) => handleStudentGradeChange(student.id, 'ds1', e.target.value)}
                          min="0"
                          max="20"
                          step="0.25"
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="number"
                          value={student.ds2 || ''}
                          onChange={(e) => handleStudentGradeChange(student.id, 'ds2', e.target.value)}
                          min="0"
                          max="20"
                          step="0.25"
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-center"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-bold ${getGradeColor(parseFloat(average))}`}>
                          {average || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium">
                          {appreciation.mention}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex items-start space-x-3">
          <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">Information sur le système d'évaluation</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {formData.level === 'preschool' && "Le niveau maternelle utilise une évaluation qualitative par compétences avec les codes TB, B, AB et I."}
              {formData.level === 'primary' && "Le niveau primaire utilise des notes sur 20 sans coefficient. La moyenne est calculée selon la formule: ((EM1 + EM2) / 2 + EC) / 2."}
              {formData.level === 'secondary' && "Le niveau secondaire utilise des notes sur 20 avec coefficients par matière. La moyenne est calculée selon la formule: ((IE1 + IE2) / 2 + (DS1 + DS2)) / 3."}
            </p>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default GradeModal;