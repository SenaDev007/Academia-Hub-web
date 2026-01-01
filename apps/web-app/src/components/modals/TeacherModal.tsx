import React, { useState, useEffect, useMemo } from 'react';
import { Save, User, Calendar, Phone, Mail, MapPin, GraduationCap, Briefcase, Clock, Calculator, FileText, Shield, Building2, Award, UserCheck, AlertCircle, X, Camera, Upload, RefreshCw } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { planningService } from '../../services/planningService';
import { PlanningSubject } from '../../types/planning';
import { api } from '../../lib/api/client';

interface Position {
  id: string;
  name: string;
  category: string;
}

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacherData: any) => void;
  teacherData?: any;
  isEdit?: boolean;
  isView?: boolean;
  departments?: any[];
  subjects?: any[];
}

const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teacherData,
  isEdit = false,
  isView = false,
  departments = [],
  subjects = []
}) => {
  const { user } = useUser();
  const [subjectsFromDB, setSubjectsFromDB] = useState<PlanningSubject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Données par défaut pour les départements
  const defaultDepartments = [
    { id: 'DEPT-001', name: 'Département Pédagogique (Maternelle & Primaire)' },
    { id: 'DEPT-002', name: 'Département Pédagogique (Collège & Lycée)' },
    { id: 'DEPT-003', name: 'Département Administratif (M&P)' },
    { id: 'DEPT-004', name: 'Département Administratif (C&L)' },
    { id: 'DEPT-005', name: 'Département Technique' },
    { id: 'DEPT-006', name: 'Département Hygiène & Sécurité' }
  ];

  // Données par défaut pour les postes
  const defaultPositions = [
    // 1. Département Pédagogique (Maternelle & Primaire)
    { id: 'POS-001', name: 'Enseignant(e) Maternelle', department: 'Département Pédagogique (Maternelle & Primaire)' },
    { id: 'POS-002', name: 'Enseignant(e) Primaire', department: 'Département Pédagogique (Maternelle & Primaire)' },
    
    // 2. Département Pédagogique (Collège & Lycée)
    { id: 'POS-003', name: 'Professeur', department: 'Département Pédagogique (Collège & Lycée)' },
    
    // 3. Département Administratif (M&P)
    { id: 'POS-004', name: 'Directeur(trice) M&P', department: 'Département Administratif (M&P)' },
    { id: 'POS-005', name: 'Secrétaire', department: 'Département Administratif (M&P)' },
    { id: 'POS-006', name: 'Comptable', department: 'Département Administratif (M&P)' },
    { id: 'POS-007', name: 'Secrétaire-Comptable', department: 'Département Administratif (M&P)' },
    
    // 4. Département Administratif (C&L)
    { id: 'POS-008', name: 'Directeur(trice)', department: 'Département Administratif (C&L)' },
    { id: 'POS-009', name: 'Secrétaire', department: 'Département Administratif (C&L)' },
    { id: 'POS-010', name: 'Comptable', department: 'Département Administratif (C&L)' },
    { id: 'POS-011', name: 'Secrétaire-Comptable', department: 'Département Administratif (C&L)' },
    { id: 'POS-012', name: 'Censeur', department: 'Département Administratif (C&L)' },
    { id: 'POS-013', name: 'Surveillant(e)', department: 'Département Administratif (C&L)' },
    
    // 5. Département Technique
    { id: 'POS-014', name: 'Technicien informatique', department: 'Département Technique' },
    
    // 6. Département Hygiène & Sécurité
    { id: 'POS-015', name: 'Agent de sécurité', department: 'Département Hygiène & Sécurité' },
    { id: 'POS-016', name: 'Agent d\'entretien', department: 'Département Hygiène & Sécurité' }
  ];

  const allDepartments = departments.length > 0 ? departments : defaultDepartments;

  // Synchroniser les données du formulaire seulement lors de l'ouverture du modal
  useEffect(() => {
    console.log('🔄 TeacherModal useEffect - isOpen:', isOpen, 'teacherData:', teacherData);
    
    if (isOpen) {
      if (teacherData) {
        console.log('TeacherModal: Mode édition - teacherData reçu:', teacherData);
        console.log('TeacherModal: Détails des données reçues:');
        console.log('- departmentId:', teacherData.departmentId);
        console.log('- departmentName:', teacherData.departmentName);
        console.log('- positionId:', teacherData.positionId);
        console.log('- position:', teacherData.position);
      
      // Mapping des champs avec fallback intelligent
      const mappedData = {
        matricule: teacherData.matricule || '',
        firstName: teacherData.firstName || '',
        lastName: teacherData.lastName || '',
        gender: teacherData.gender || '',
        dateOfBirth: teacherData.dateOfBirth || '',
        address: teacherData.address || '',
        phone: teacherData.phone ? (typeof teacherData.phone === 'string' ? teacherData.phone.replace('+229', '') : '') : '',
        email: teacherData.email || '',
        
          // Mapping intelligent des relations (utiliser d'abord les IDs, puis les labels)
          departmentId: teacherData.departmentId || 
            (teacherData.departmentName ? 
              defaultDepartments.find(d => d.name === teacherData.departmentName)?.id || teacherData.departmentName 
              : ''),
          positionId: teacherData.positionId || 
            (teacherData.position ? 
              defaultPositions.find(p => p.name === teacherData.position)?.id || teacherData.position 
              : ''),
        subjectId: teacherData.subjectId || teacherData.subjectName || '',
        
        // Autres champs
        qualifications: teacherData.qualifications || '',
          experienceYears: teacherData.experienceYears || '',
        hireDate: teacherData.hireDate || '',
        description: teacherData.description || '',
        emergencyContact: teacherData.emergencyContact || '',
        nationality: teacherData.nationality || '',
        photo: teacherData.photo || null
      };
      
        console.log('TeacherModal: Données mappées pour édition:', mappedData);
      setFormData(mappedData);
      } else {
        console.log('TeacherModal: Mode création - initialisation avec valeurs par défaut');
      // Mode création - initialiser avec des valeurs par défaut
      setFormData({
        matricule: '',
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        email: '',
        departmentId: '',
        positionId: '',
        subjectId: '',
        qualifications: '',
        experienceYears: '',
        hireDate: new Date().toISOString().split('T')[0],
        description: '',
        emergencyContact: '',
          nationality: '',
          photo: null
      });
    }
    }
  }, [isOpen, teacherData]);

  // Fonction pour générer un matricule unique au format PER-025026-000
  const generateMatricule = async () => {
    // Obtenir l'année scolaire en cours (format 6 chiffres: 025026)
    const currentYear = new Date().getFullYear();
    const academicYear = `0${currentYear.toString().slice(-2)}0${(currentYear + 1).toString().slice(-2)}`;
    
    try {
      // Récupérer tous les enseignants existants avec le schoolId
      const schoolId = user?.schoolId || 'school-1';
      console.log('🔍 Génération matricule - schoolId utilisé:', schoolId);
      
      const response = await api.hr.getTeachers(schoolId);
      console.log('🔍 Réponse API getTeachers:', response);
      
      const existingTeachers = response.data?.data || response.data || [];
      
      console.log('Enseignants existants récupérés:', existingTeachers.length);
      console.log('Détails des enseignants:', existingTeachers);
      console.log('Matricules existants:', existingTeachers.map((t: any) => t.matricule));
      
      // Extraire tous les matricules existants pour cette année scolaire
      const existingMatricules = existingTeachers
        .filter((teacher: any) => {
          console.log('Filtrage enseignant:', teacher.matricule, 'contient', academicYear, '?', teacher.matricule && teacher.matricule.includes(academicYear));
          return teacher.matricule && teacher.matricule.includes(academicYear);
        })
        .map((teacher: any) => teacher.matricule)
        .sort();
      
      console.log('Matricules existants pour l\'année', academicYear, ':', existingMatricules);
      
      // Trouver le prochain numéro d'ordre disponible
      let nextOrderNumber = 1;
      let matricule = `PER-${academicYear}-${nextOrderNumber.toString().padStart(3, '0')}`;
      
      // Vérifier l'unicité et incrémenter jusqu'à trouver un matricule libre
      while (existingMatricules.includes(matricule)) {
        nextOrderNumber++;
        matricule = `PER-${academicYear}-${nextOrderNumber.toString().padStart(3, '0')}`;
      }
      
      console.log('Nouveau matricule généré:', matricule);
      return matricule;
    } catch (error) {
      console.error('Erreur lors de la génération du matricule:', error);
      // En cas d'erreur, utiliser un timestamp comme fallback
      const timestamp = Date.now();
      const fallbackNumber = (timestamp % 1000).toString().padStart(3, '0');
      return `PER-${academicYear}-${fallbackNumber}`;
    }
  };

  const [formData, setFormData] = useState({
    matricule: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    email: '',
    departmentId: '',
    positionId: '',
    subjectId: '',
    qualifications: '',
    experienceYears: '',
    hireDate: new Date().toISOString().split('T')[0],
    description: '',
    emergencyContact: '',
    nationality: '',
    photo: null as string | null
  });

  // Réinitialiser le poste quand le département change
  useEffect(() => {
    if (formData.departmentId && formData.positionId) {
      const selectedPosition = defaultPositions.find(pos => pos.id === formData.positionId);
      const selectedDepartment = defaultDepartments.find(dept => dept.id === formData.departmentId);
      
      if (selectedPosition && selectedDepartment && selectedPosition.department !== selectedDepartment.name) {
        console.log('🔄 Département changé, réinitialisation du poste');
        console.log('- poste actuel:', selectedPosition.name, 'département:', selectedPosition.department);
        console.log('- nouveau département:', selectedDepartment.name);
        
        setFormData(prev => ({
          ...prev,
          positionId: '',
          subjectId: '' // Réinitialiser aussi la matière
        }));
      }
    }
  }, [formData.departmentId]);

  // Charger les matières depuis la base de données
  useEffect(() => {
    const loadSubjects = async () => {
      if (user?.schoolId) {
      setLoadingSubjects(true);
      try {
          const subjects = await planningService.getSubjects(user.schoolId);
          setSubjectsFromDB(subjects);
      } catch (error) {
          console.error('Erreur lors du chargement des matières:', error);
      } finally {
        setLoadingSubjects(false);
        }
      }
    };

    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen, user?.schoolId]);

  // Générer le matricule au chargement du modal
  useEffect(() => {
    const initializeMatricule = async () => {
      if (isOpen && !teacherData) {
        try {
          console.log('Génération d\'un nouveau matricule...');
          const matricule = await generateMatricule();
          setFormData(prev => ({
            ...prev,
            matricule
          }));
          console.log('Matricule initialisé:', matricule);
        } catch (error) {
          console.error('Erreur lors de la génération du matricule:', error);
        }
      }
    };

    initializeMatricule();
  }, [isOpen, teacherData]);

  // Fonction pour régénérer le matricule manuellement
  const regenerateMatricule = async () => {
    try {
      console.log('Régénération du matricule...');
      const newMatricule = await generateMatricule();
      setFormData(prev => ({
        ...prev,
        matricule: newMatricule
      }));
      console.log('Nouveau matricule généré:', newMatricule);
    } catch (error) {
      console.error('Erreur lors de la régénération du matricule:', error);
    }
  };

  // Filtrer les postes selon le département sélectionné
  const filteredPositions = useMemo(() => {
    if (!formData.departmentId) return defaultPositions;
    
    // Trouver le nom du département à partir de l'ID
    const selectedDepartment = defaultDepartments.find(dept => dept.id === formData.departmentId);
    const departmentName = selectedDepartment ? selectedDepartment.name : formData.departmentId;
    
    console.log('🔍 Filtrage des postes:');
    console.log('- departmentId sélectionné:', formData.departmentId);
    console.log('- nom du département:', departmentName);
    
    const filtered = defaultPositions.filter(pos => pos.department === departmentName);
    console.log('- postes filtrés:', filtered.length, filtered.map(p => p.name));
    
    return filtered;
  }, [formData.departmentId]);

  // Déterminer si le sélecteur de matière doit être affiché
  const shouldShowSubjectSelector = useMemo(() => {
    if (!formData.positionId) return false;
    const selectedPosition = defaultPositions.find(pos => pos.id === formData.positionId);
    // Seuls les professeurs du secondaire et directeurs secondaires ont besoin de sélectionner une matière spécifique
    return selectedPosition?.name === 'Professeur' || 
           selectedPosition?.name === 'Directeur d\'établissement (Secondaire)';
  }, [formData.positionId]);

  // Déterminer si la matière est obligatoire
  const isSubjectRequired = useMemo(() => {
    if (!formData.positionId) return false;
    const selectedPosition = defaultPositions.find(pos => pos.id === formData.positionId);
    // Seuls les professeurs du secondaire et directeurs secondaires ont une matière obligatoire
    return selectedPosition?.name === 'Professeur' || 
           selectedPosition?.name === 'Directeur d\'établissement (Secondaire)';
  }, [formData.positionId]);

  // Filtrer les matières selon le niveau (seulement pour les postes secondaires)
  const filteredSubjects = useMemo(() => {
    if (!formData.positionId) return [];
    
    const selectedPosition = defaultPositions.find(pos => pos.id === formData.positionId);
    if (!selectedPosition) return [];
    
    // Seuls les professeurs et directeurs secondaires ont besoin de sélectionner une matière
    if (selectedPosition.name === 'Professeur' || selectedPosition.name === 'Directeur d\'établissement (Secondaire)') {
      // Filtrer les matières du secondaire
      const secondaireSubjects = subjectsFromDB.filter(subject => 
        subject.level === '1er cycle secondaire' || 
        subject.level === '2nd cycle secondaire' ||
        subject.level === 'secondaire_1er_cycle' ||
        subject.level === 'secondaire_2nd_cycle' ||
        subject.level === '1er_cycle' ||
        subject.level === '2nd_cycle'
      );
      
      // Éliminer les doublons basés sur l'ID et le nom
      const uniqueSubjects = secondaireSubjects.reduce((acc, current) => {
        const existingSubject = acc.find(subject => 
          subject.id === current.id || 
          subject.name === current.name
        );
        if (!existingSubject) {
          acc.push(current);
        }
        return acc;
      }, [] as typeof secondaireSubjects);
      
      return uniqueSubjects;
    }

    return [];
  }, [formData.positionId, subjectsFromDB]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de la photo ne doit pas dépasser 5MB');
        return;
      }
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      try {
        // Convertir le fichier en base64 (comme dans StudentModal)
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          setFormData(prev => ({
            ...prev,
            photo: base64String
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Erreur lors de la conversion de la photo:', error);
        alert('Erreur lors du traitement de la photo');
      }
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: null
    }));
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
          ...prev,
      departmentId: value,
          positionId: '', // Réinitialiser le poste
          subjectId: '' // Réinitialiser la matière
    }));
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      positionId: value,
      subjectId: '' // Réinitialiser la matière
    }));
  };

  // Fonction pour formater les noms
  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === 'firstName') {
      // Capitaliser chaque mot du prénom
      formattedValue = value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    } else if (name === 'lastName') {
      // Mettre le nom en majuscules
      formattedValue = value.toUpperCase();
    }
    
    if (formattedValue !== value) {
      setFormData(prev => ({
          ...prev,
        [name]: formattedValue
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || 
        !formData.departmentId || !formData.positionId || !formData.hireDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      alert('Veuillez saisir une adresse email valide');
      return;
    }
    
    // Validation du téléphone
    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      alert('Le numéro de téléphone doit contenir exactement 10 chiffres');
      return;
    }
    
    // S'assurer que les IDs sont corrects (pas de conversion si c'est déjà un ID)
    const getDepartmentId = (value: string) => {
      // Si c'est déjà un ID (commence par DEPT-), le retourner tel quel
      if (value.startsWith('DEPT-')) {
        return value;
      }
      // Sinon, chercher par nom
      const dept = defaultDepartments.find(d => d.name === value);
      return dept ? dept.id : value;
    };
    
    const getPositionId = (value: string) => {
      // Si c'est déjà un ID (commence par POS-), le retourner tel quel
      if (value.startsWith('POS-')) {
        return value;
      }
      // Sinon, chercher par nom
      const pos = defaultPositions.find(p => p.name === value);
      return pos ? pos.id : value;
    };
    
    // Préparer les données pour l'envoi
    const dataToSave = {
      ...formData,
      phone: `+229${formData.phone}`, // Ajouter le préfixe +229
      // S'assurer que les IDs sont corrects
      departmentId: getDepartmentId(formData.departmentId),
      positionId: getPositionId(formData.positionId),
      // Ajouter des informations supplémentaires
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.id || 'system',
      schoolId: user?.schoolId || null
    };

    console.log('TeacherModal: Données à sauvegarder:', dataToSave);
    console.log('TeacherModal: positionId dans dataToSave:', dataToSave.positionId);
    console.log('TeacherModal: departmentId dans dataToSave:', dataToSave.departmentId);
    
    // Logs de débogage pour vérifier la cohérence
    const selectedPosition = defaultPositions.find(p => p.id === dataToSave.positionId);
    const selectedDepartment = defaultDepartments.find(d => d.id === dataToSave.departmentId);
    console.log('TeacherModal: Poste sélectionné:', selectedPosition?.name, '(ID:', dataToSave.positionId, ')');
    console.log('TeacherModal: Département sélectionné:', selectedDepartment?.name, '(ID:', dataToSave.departmentId, ')');
    onSave(dataToSave);
  };

  // Déterminer le titre et la description du modal
  const getModalTitle = () => {
    if (isView) return 'Consultation du Personnel';
    if (isEdit) return 'Modification du Personnel';
    return 'Nouveau Personnel';
  };

  const getModalDescription = () => {
    if (isView) return 'Consultez les informations du membre du personnel';
    if (isEdit) return 'Modifiez les informations du membre du personnel';
    return 'Ajoutez un nouveau membre au personnel de l\'établissement';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
            </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {getModalTitle()}
                </h2>
                <p className="text-blue-100 text-sm">
                  {getModalDescription()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
      <form id="teacher-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Désactiver tous les champs en mode lecture */}
          <div className={isView ? 'pointer-events-none opacity-75' : ''}>
              
              {/* === INFORMATIONS PERSONNELLES === */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                    <User className="w-5 h-5 text-white" />
                  </div>
            <div>
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Informations Personnelles
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Données d'identité et de contact
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Matricule */}
                  <div className="lg:col-span-1">
                    <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Matricule <span className="text-red-500">*</span>
              </label>
                    <div className="flex space-x-2">
              <input
                type="text"
                id="matricule"
                name="matricule"
                value={formData.matricule}
                readOnly
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm"
                      />
                      {!teacherData && (
                        <button
                          type="button"
                          onClick={regenerateMatricule}
                          className="px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                          title="Régénérer le matricule"
                          aria-label="Régénérer le matricule"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {teacherData ? 'Matricule existant' : 'Généré automatiquement'}
                    </p>
                  </div>

                  {/* Photo */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Photo du personnel
                    </label>
                    <div className="flex items-center space-x-4">
                      {/* Aperçu de la photo */}
                      <div className="relative">
                        {formData.photo ? (
                          <div className="relative">
                            <img
                              src={formData.photo}
                              alt="Aperçu de la photo"
                              className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300 dark:border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              title="Supprimer la photo"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                            <Camera className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Bouton d'upload */}
                      <div className="flex-1">
                        <input
                          type="file"
                          id="photo"
                          name="photo"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="photo"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {formData.photo ? 'Changer la photo' : 'Ajouter une photo'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Formats acceptés: JPG, PNG, GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
            
                  {/* Prénom */}
            <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleNameBlur}
                required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                      placeholder="Entrez le prénom"
              />
            </div>
            
                  {/* Nom */}
            <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleNameBlur}
                required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                      placeholder="Entrez le nom"
              />
            </div>
            
                  {/* Civilité */}
            <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Civilité
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              >
                <option value="">Sélectionner la civilité</option>
                <option value="M.">M.</option>
                <option value="Mlle.">Mlle.</option>
                <option value="Mme.">Mme.</option>
              </select>
            </div>
            
                  {/* Date de naissance */}
            <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              />
            </div>
            
                  {/* Nationalité */}
                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nationalité
              </label>
                    <input
                      type="text"
                      id="nationality"
                      name="nationality"
                      value={formData.nationality}
                onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                      placeholder="Ex: Béninoise"
              />
            </div>
            
                  {/* Téléphone */}
            <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                      <span className="inline-flex items-center px-3 py-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm font-medium">
                  +229
                </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                        pattern="[0-9]{10}"
                        maxLength="10"
                        placeholder="XXXXXXXXXX"
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              />
              </div>
                    <p className="text-xs text-gray-500 mt-1">Format: 10 chiffres (ex: 01XXXXXXXX)</p>
            </div>
            
                  {/* Email */}
            <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 ${
                        formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                          ? 'border-red-500 dark:border-red-400'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                placeholder="exemple@domaine.com"
                    />
                    {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Format d'email invalide
                      </p>
                    )}
            </div>
            
                  {/* Contact d'urgence */}
            <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact d'urgence
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                placeholder="Nom et téléphone"
              />
            </div>
                  
                  {/* Adresse - Pleine largeur */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse complète
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 resize-none"
                      placeholder="Adresse complète du domicile"
                    />
                  </div>
          </div>
        </div>
        
              {/* === INFORMATIONS PROFESSIONNELLES === */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-green-900 dark:text-green-100">
                      Informations Professionnelles
          </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Poste, département et responsabilités
                    </p>
                  </div>
                </div>
          
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Département */}
            <div>
                    <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Département <span className="text-red-500">*</span>
              </label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                      onChange={handleDepartmentChange}
                required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              >
                <option value="">Sélectionner un département</option>
                {allDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
                  {/* Poste */}
            <div>
                    <label htmlFor="positionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poste <span className="text-red-500">*</span>
              </label>
              <select
                id="positionId"
                name="positionId"
                value={formData.positionId}
                      onChange={handlePositionChange}
                required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              >
                <option value="">Sélectionner un poste</option>
                {filteredPositions.map(pos => (
                  <option key={pos.id} value={pos.id}>{pos.name}</option>
                ))}
              </select>
            </div>
            
                  {/* Matière enseignée - Pour les enseignants */}
            {shouldShowSubjectSelector && (
            <div>
                      <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Matière enseignée{isSubjectRequired && <span className="text-red-500"> *</span>}
              </label>
                {loadingSubjects ? (
                        <div className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Chargement des matières...
                  </div>
                ) : (
              <select
                id="subjectId"
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                    required={isSubjectRequired}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              >
                <option value="">Sélectionner une matière</option>
                    {filteredSubjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
              </select>
                )}
                      {formData.positionId && (
                        <p className="text-xs text-gray-500 mt-2">
                          {(() => {
                            const selectedPosition = defaultPositions.find(pos => pos.id === formData.positionId);
                            if (selectedPosition?.name === 'Professeur') {
                              if (loadingSubjects) {
                                return 'Chargement des matières du secondaire...';
                              } else if (filteredSubjects.length === 0) {
                                return 'Aucune matière du secondaire trouvée dans la base de données';
                              } else {
                                return `Secondaire : ${filteredSubjects.length} matière(s) disponible(s) - Sélectionnez une matière spécifique à enseigner`;
                              }
                            } else if (selectedPosition?.name === 'Directeur d\'établissement (Secondaire)') {
                              if (loadingSubjects) {
                                return 'Chargement des matières du secondaire...';
                              } else if (filteredSubjects.length === 0) {
                                return 'Aucune matière du secondaire trouvée dans la base de données';
                              } else {
                                return `Secondaire : ${filteredSubjects.length} matière(s) disponible(s) - Sélectionnez une matière spécifique à enseigner (Direction + Enseignement)`;
                              }
                            }
                            return '';
                          })()}
                        </p>
                      )}
            </div>
            )}
            
                  {/* Date d'embauche */}
            <div>
                    <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date d'embauche <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
              />
        </div>
        
                  {/* Qualifications */}
            <div>
                    <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Qualifications
                </label>
                <input
                      type="text"
                      id="qualifications"
                      name="qualifications"
                      value={formData.qualifications}
                  onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                      placeholder="Ex: Doctorat en Mathématiques"
                />
        </div>
        
                  {/* Années d'expérience */}
            <div>
                    <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Années d'expérience
              </label>
              <input
                type="number"
                      id="experienceYears"
                      name="experienceYears"
                      value={formData.experienceYears}
                onChange={handleChange}
                min="0"
                      max="50"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                      placeholder="0"
              />
            </div>
            
                  {/* Description du poste - Pleine largeur */}
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description du poste
                </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                  onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 resize-none"
                      placeholder="Décrivez les responsabilités et missions du poste"
                />
          </div>
            </div>
            </div>
            
                </div>
          </form>
                </div>
                
        {/* Footer */}
        <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Annuler
            </button>
            {!isView && (
              <button
                type="submit"
                form="teacher-form"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Mettre à jour' : 'Enregistrer'}</span>
              </button>
            )}
            </div>
            </div>
          </div>
          </div>
  );
};

export default TeacherModal;