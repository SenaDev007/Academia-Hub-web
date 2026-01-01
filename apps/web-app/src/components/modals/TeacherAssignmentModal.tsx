import React, { useEffect, useMemo, useState } from 'react';
import FormModal from './FormModal';
import { Save, User, BookOpen, Clock, Calendar } from 'lucide-react';

interface TeacherAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignmentData: any) => void;
  assignmentData?: any;
  isEdit?: boolean;
  teachers?: any[];
  subjects?: any[];
  classes?: any[];
  schoolYears?: any[];
}

const TeacherAssignmentModal: React.FC<TeacherAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assignmentData,
  isEdit = false,
  teachers = [],
  subjects = [],
  classes = [],
  schoolYears = []
}) => {
  const defaultTeachers = [
    { id: 'TCH-001', name: 'M. Dubois', subject: 'Mathématiques' },
    { id: 'TCH-002', name: 'Mme Martin', subject: 'Français' },
    { id: 'TCH-003', name: 'M. Laurent', subject: 'Histoire-Géographie' }
  ];

  const defaultSubjects = [
    { id: 'SUB-001', name: 'Mathématiques', code: 'MATH' },
    { id: 'SUB-002', name: 'Français', code: 'FR' },
    { id: 'SUB-003', name: 'Histoire-Géographie', code: 'HIST-GEO' },
    { id: 'SUB-004', name: 'Sciences Physiques', code: 'PHYS' },
    { id: 'SUB-005', name: 'SVT', code: 'SVT' }
  ];

  const defaultClasses = [
    { id: 'CLS-001', name: '6ème A' },
    { id: 'CLS-002', name: '5ème B' },
    { id: 'CLS-003', name: '4ème A' },
    { id: 'CLS-004', name: '3ème A' },
    { id: 'CLS-005', name: '2nde B' }
  ];

  const defaultSchoolYears = [
    { id: 'SY-001', name: '2023-2024', isActive: true },
    { id: 'SY-002', name: '2022-2023', isActive: false }
  ];

  const allTeachers = useMemo(() => (teachers.length > 0 ? teachers : defaultTeachers), [teachers]);
  const allSubjects = useMemo(() => (subjects.length > 0 ? subjects : defaultSubjects), [subjects]);
  
  // Fonction pour trier les classes dans l'ordre logique
  const sortClassesByOrder = (classesList: any[]) => {
    const classOrder = [
      'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2',
      '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle', 'Terminale'
    ];
    
    return classesList.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      
      // Extraire le niveau de classe (ex: "CP" de "CP A")
      const levelA = nameA.split(' ')[0];
      const levelB = nameB.split(' ')[0];
      
      const indexA = classOrder.indexOf(levelA);
      const indexB = classOrder.indexOf(levelB);
      
      // Si les deux classes sont dans l'ordre défini, trier par index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Si une seule classe est dans l'ordre, la mettre en premier
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Sinon, trier alphabétiquement
      return nameA.localeCompare(nameB);
    });
  };
  
  const allClasses = useMemo(() => {
    const classesList = classes.length > 0 ? classes : defaultClasses;
    return sortClassesByOrder(classesList);
  }, [classes]);
  
  const allSchoolYears = schoolYears.length > 0 ? schoolYears : defaultSchoolYears;

  const [formData, setFormData] = useState({
    mode: assignmentData?.mode || '', // 'primaire' | 'maternelle' | 'secondaire'
    teacherId: assignmentData?.teacherId || assignmentData?.id || '',
    classId: assignmentData?.classId || '',
    subjectId: assignmentData?.subjectId || '',
    classIds: assignmentData?.classIds || [], // multi-classes pour secondaire
    schoolYearId: assignmentData?.schoolYearId || allSchoolYears.find(sy => sy.isActive)?.id || '',
    hoursPerWeek: assignmentData?.hoursPerWeek || 1,
    isMainTeacher: assignmentData?.isMainTeacher || false,
    startDate: assignmentData?.startDate || new Date().toISOString().split('T')[0],
    endDate: assignmentData?.endDate || '',
    notes: assignmentData?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const detectModeFromClassId = (cid: string): 'maternelle' | 'primaire' | 'secondaire' | '' => {
    if (!cid) return '';
    const cls = allClasses.find((c: any) => c.id === cid);
    const level = (cls?.level || '').toString().toLowerCase();
    if (!level) return '';
    if (level.includes('maternelle')) return 'maternelle';
    if (level.includes('primaire')) return 'primaire';
    return 'secondaire';
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      teacherId: prev.teacherId || assignmentData?.id || '',
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentData?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }));
    if (name === 'classId') {
      const mode = detectModeFromClassId(value);
      if (mode && mode !== 'secondaire') {
        setFormData(prev => ({ ...prev, mode }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.teacherId) newErrors.teacherId = 'Sélectionnez un enseignant';
    if (!formData.mode) newErrors.mode = 'Sélectionnez le cycle';
    if (formData.mode === 'secondaire') {
      if (!formData.subjectId) newErrors.subjectId = 'Sélectionnez une matière';
      if (!formData.classIds || formData.classIds.length === 0) newErrors.classIds = 'Sélectionnez au moins une classe';
    } else {
      if (!formData.classId) newErrors.classId = 'Sélectionnez une classe';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSave(formData);
    onClose();
  };

  // Vérifier la charge horaire de l'enseignant
  const checkTeacherWorkload = () => {
    // Dans une implémentation réelle, vous feriez une vérification côté serveur
    // Ici, on simule une vérification
    const teacher = allTeachers.find(t => t.id === formData.teacherId);
    if (!teacher) return { isOverloaded: false, currentHours: 0, maxHours: 0 };
    
    // Simulation de la charge horaire actuelle
    const currentHours = 15; // Heures déjà assignées
    const maxHours = 20; // Maximum d'heures autorisées
    
    return {
      isOverloaded: (currentHours + formData.hoursPerWeek) > maxHours,
      currentHours,
      maxHours
    };
  };

  const workload = checkTeacherWorkload();

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier une affectation" : "Nouvelle affectation d'enseignant"}
      size="lg"
      footer={
        <div className="flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="teacher-assignment-form"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-800 dark:hover:to-indigo-800 flex items-center shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Mettre à jour" : "Enregistrer"}
          </button>
        </div>
      }
    >
      <form id="teacher-assignment-form" onSubmit={handleSubmit} className="space-y-6">
        {/* En-tête moderne */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 p-5 flex items-start gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Configuration de l'affectation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Définissez le cycle, l'enseignant, la ou les classes et la période d'intervention.</p>
            {/* Steps */}
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">1. Cycle</span>
              <span className="text-gray-300">→</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">2. Détails</span>
              <span className="text-gray-300">→</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">3. Période</span>
              <span className="text-gray-300">→</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700">4. Validation</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/15 px-4 py-3">
          <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">Règles d'affectation</p>
          <ul className="mt-1 text-xs text-blue-800 dark:text-blue-400 list-disc pl-5 space-y-1">
            <li>Primaire/Maternelle: enseignant → classe (toutes matières du niveau automatiquement).</li>
            <li>Secondaire: enseignant → matière → classes multiples.</li>
            <li>Astuce: maintenez Ctrl/Cmd pour sélectionner plusieurs classes.</li>
          </ul>
        </div>
        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Informations de l'affectation
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cycle*
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                title="En primaire/maternelle la matière est auto-assignée"
                disabled={!!formData.classId && (() => { const l=(allClasses.find((c:any)=>c.id===formData.classId)?.level||'').toString().toLowerCase(); return l.includes('maternelle')||l.includes('primaire'); })()}
              >
                <option value="">Sélectionner un cycle</option>
                <option value="maternelle">Maternelle</option>
                <option value="primaire">Primaire</option>
                <option value="secondaire">Secondaire</option>
              </select>
            </div>
            <div>
              <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Enseignant*
              </label>
              <select
                id="teacherId"
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner un enseignant</option>
                {allTeachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.subject})</option>
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
                required={formData.mode === 'secondaire'}
                disabled={formData.mode !== 'secondaire'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                title={formData.mode !== 'secondaire' ? 'Désactivé en primaire/maternelle' : 'Choisissez la matière à affecter'}
              >
                <option value="">Sélectionner une matière</option>
                {allSubjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name} ({subject.code})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Classe*
              </label>
              {formData.mode === 'secondaire' ? (
                <select
                  multiple
                  id="classIds"
                  name="classIds"
                  value={formData.classIds}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions).map(o => o.value);
                    setFormData(prev => ({ ...prev, classIds: options }));
                  }}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 h-32"
                  title="Maintenez Ctrl/Cmd pour choisir plusieurs classes"
                >
                  {allClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              ) : (
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
              )}
            </div>
            
            <div>
              <label htmlFor="schoolYearId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Année scolaire*
              </label>
              <select
                id="schoolYearId"
                name="schoolYearId"
                value={formData.schoolYearId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Sélectionner une année scolaire</option>
                {allSchoolYears.map(year => (
                  <option key={year.id} value={year.id}>{year.name} {year.isActive ? '(Actuelle)' : ''}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heures par semaine*
              </label>
              <input
                type="number"
                id="hoursPerWeek"
                name="hoursPerWeek"
                value={formData.hoursPerWeek}
                onChange={handleChange}
                required
                min="1"
                max="30"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isMainTeacher"
                name="isMainTeacher"
                checked={formData.isMainTeacher}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label htmlFor="isMainTeacher" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Professeur principal de la classe
              </label>
            </div>
          </div>
        </div>
        
        {/* Période */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Période d'affectation
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de début*
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de fin (optionnelle)
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
          
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Informations complémentaires..."
            />
          </div>
        </div>
        
        {/* Vérification de la charge horaire */}
        <div className={`rounded-lg p-6 border ${
          workload.isOverloaded 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30' 
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/30'
        }`}>
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Clock className={`w-5 h-5 mr-2 ${
              workload.isOverloaded 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-blue-600 dark:text-blue-400'
            }`} />
            Charge horaire de l'enseignant
          </h4>
          
          {formData.teacherId ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`${
                  workload.isOverloaded 
                    ? 'text-red-800 dark:text-red-300' 
                    : 'text-blue-800 dark:text-blue-300'
                }`}>
                  Charge actuelle:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {workload.currentHours}h / {workload.maxHours}h
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={`${
                  workload.isOverloaded 
                    ? 'text-red-800 dark:text-red-300' 
                    : 'text-blue-800 dark:text-blue-300'
                }`}>
                  Heures à ajouter:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formData.hoursPerWeek}h
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className={`${
                  workload.isOverloaded 
                    ? 'text-red-800 dark:text-red-300' 
                    : 'text-blue-800 dark:text-blue-300'
                }`}>
                  Nouvelle charge:
                </span>
                <span className={`font-bold ${
                  workload.isOverloaded 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {workload.currentHours + formData.hoursPerWeek}h / {workload.maxHours}h
                </span>
              </div>
              
              {workload.isOverloaded && (
                <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">
                    Attention: Cette affectation dépasse la charge horaire maximale de l'enseignant.
                    Veuillez ajuster les heures ou obtenir une autorisation spéciale.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Veuillez sélectionner un enseignant pour voir sa charge horaire.
            </p>
          )}
        </div>
      </form>
    </FormModal>
  );
};

export default TeacherAssignmentModal;