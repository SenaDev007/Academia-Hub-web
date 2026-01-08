import React, { useState, useEffect } from 'react';
import FormModal from './FormModal';
import { Save, User, Calendar, Phone, Mail, MapPin, Upload, Heart, BookOpen, AlertCircle, CheckCircle, X, DollarSign, Calculator, RefreshCw } from 'lucide-react';
import { compressImage, isValidImageFile, isValidFileSize, createImagePreview } from '../../utils/imageCompression';
import { financeService } from '../../services/api/finance';
import { useUser } from '../../contexts/UserContext';
import { useAcademicYear } from '../../hooks/useAcademicYear';
import { api } from '../../lib/api/client';
import { generateEducmasterNumberAsync, generateEducmasterNumberFormattedAsync, validateEducmasterNumber, decodeEducmasterNumber, getCycleFromClassName, DEPARTMENT_CODES, CYCLE_CODES, getEnrollmentYear } from '../../utils/educmasterGenerator';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: any) => void;
  studentData?: any;
  isEdit?: boolean;
  isReadOnly?: boolean;
  classes?: any[];
  currentAcademicYear?: string; // Année académique en cours
}

interface ValidationErrors {
  [key: string]: string;
}

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'success' 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${
            type === 'success' 
              ? 'text-green-800 dark:text-green-200' 
              : 'text-red-800 dark:text-red-200'
          }`}>
            {message}
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 ${
              type === 'success' 
                ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30' 
                : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
            }`}
          >
            <span className="sr-only">Fermer</span>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentData,
  isEdit = false,
  isReadOnly = false,
  classes = [],
  currentAcademicYear
}) => {
  const { user } = useUser();
  const { academicYears } = useAcademicYear();
  
  // Fonction pour formater l'année académique
  const formatAcademicYear = (academicYearId: string) => {
    if (!academicYearId) return 'Chargement...';
    
    // Chercher d'abord le pattern academic-year-YYYY-YYYY
    const match = academicYearId.match(/academic-year-(\d{4}-\d{4})/);
    if (match) {
      return match[1]; // Retourne "2025-2026"
    }
    
    // Si c'est un UUID, chercher l'année académique correspondante
    if (academicYears && academicYears.length > 0) {
      const year = academicYears.find(y => (y as any).id === academicYearId);
      if (year && (year as any).name) {
        return (year as any).name;
      }
    }
    
    // Fallback : retourner l'ID tel quel
    return academicYearId;
  };
  
  const [formData, setFormData] = useState({
    educmasterNumber: studentData?.educmasterNumber || '',
    firstName: studentData?.firstName || '',
    lastName: studentData?.lastName || '',
    gender: studentData?.gender || '',
    dateOfBirth: studentData?.dateOfBirth || '',
    placeOfBirth: studentData?.placeOfBirth || '',
    classId: studentData?.classId || '',
    enrollmentDate: studentData?.enrollmentDate || new Date().toISOString().split('T')[0],
    status: studentData?.status || 'passant',
    photo: studentData?.photo || null,
    parentName: studentData?.parentName || '',
    parentPhone: studentData?.parentPhone || '',
    parentEmail: studentData?.parentEmail || '',
    parentAddress: studentData?.parentAddress || '',
    parentProfession: studentData?.parentProfession || '',
    parentRelationship: studentData?.parentRelationship || '',
    bloodType: studentData?.bloodType || '',
    allergies: studentData?.allergies || '',
    chronicConditions: studentData?.chronicConditions || '',
    medications: studentData?.medications || '',
    emergencyContact: studentData?.emergencyContact || '',
    documents: Array.isArray(studentData?.documents) ? studentData.documents : [],
    notes: studentData?.notes || '',
    // Nouveaux champs pour les frais scolaires
    seniority: studentData?.seniority || 'new', // 'new' ou 'old'
    inscriptionFee: studentData?.inscriptionFee || 0,
    reinscriptionFee: studentData?.reinscriptionFee || 0,
    tuitionFee: studentData?.tuitionFee || 0,
    totalSchoolFees: studentData?.totalSchoolFees || 0
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(studentData?.photo || null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // États pour la gestion des frais scolaires
  const [feeConfigurations, setFeeConfigurations] = useState<any[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [academicYearState, setAcademicYearState] = useState<string>('');
  
  // États pour la génération du numéro Educmaster
  const [isGeneratingEducmaster, setIsGeneratingEducmaster] = useState(false);
  const [educmasterPreview, setEducmasterPreview] = useState<string>('');

  // Charger les configurations de frais et l'année académique
  useEffect(() => {
    const loadFeeConfigurations = async () => {
      if (isOpen && currentAcademicYear && user?.schoolId) {
        setLoadingFees(true);
        try {
          setAcademicYearState(currentAcademicYear);
          
          // Charger les configurations de frais pour l'année académique en cours
          const response = await financeService.getFeeConfigurations(user.schoolId, currentAcademicYear);
          if (response.success) {
            setFeeConfigurations(response.data || []);
            console.log('✅ Configurations de frais chargées:', response.data?.length, 'configurations');
            console.log('📊 Détail des configurations:', response.data);
          } else {
            console.warn('⚠️ Aucune configuration de frais trouvée pour cette année');
          }
        } catch (error) {
          console.error('Erreur lors du chargement des configurations de frais:', error);
        } finally {
          setLoadingFees(false);
        }
      }
    };
    
    loadFeeConfigurations();
  }, [isOpen, currentAcademicYear, user?.schoolId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
            setFormData({
        educmasterNumber: studentData?.educmasterNumber || '',
    firstName: studentData?.firstName || '',
    lastName: studentData?.lastName || '',
    gender: studentData?.gender || '',
    dateOfBirth: studentData?.dateOfBirth || '',
    placeOfBirth: studentData?.placeOfBirth || '',
    classId: studentData?.classId || '',
    enrollmentDate: studentData?.enrollmentDate || new Date().toISOString().split('T')[0],
    status: studentData?.status || 'passant',
        photo: studentData?.photo || null,
        parentName: studentData?.parentName || '',
        parentPhone: studentData?.parentPhone || '',
        parentEmail: studentData?.parentEmail || '',
        parentAddress: studentData?.parentAddress || '',
        parentProfession: studentData?.parentProfession || '',
        parentRelationship: studentData?.parentRelationship || '',
        bloodType: studentData?.bloodType || '',
        allergies: studentData?.allergies || '',
        chronicConditions: studentData?.chronicConditions || '',
        medications: studentData?.medications || '',
        emergencyContact: studentData?.emergencyContact || '',
    documents: Array.isArray(studentData?.documents) ? studentData.documents : [],
    notes: studentData?.notes || '',
    // Nouveaux champs pour les frais scolaires
    seniority: studentData?.seniority || 'new', // 'new' ou 'old'
    inscriptionFee: studentData?.inscriptionFee || 0,
    reinscriptionFee: studentData?.reinscriptionFee || 0,
    tuitionFee: studentData?.tuitionFee || 0,
    totalSchoolFees: studentData?.totalSchoolFees || 0
  });
      setPhotoPreview(studentData?.photo || null);
      setErrors({});
    }
  }, [isOpen, studentData]);



  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Format attendu: +2290XXXXXXXX (13 caractères au total: +229 + 0 + 9 chiffres)
    const phoneRegex = /^\+2290[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  // Fonction pour formater le numéro de téléphone
  const formatPhoneNumber = (phone: string): string => {
    // Supprimer tous les caractères non numériques
    const numbers = phone.replace(/\D/g, '');
    
    // Si le numéro commence par 2290, on le garde tel quel
    if (numbers.startsWith('2290') && numbers.length === 13) {
      return `+${numbers}`;
    }
    
    // Si le numéro commence par 0, on remplace par +2290
    if (numbers.startsWith('0') && numbers.length === 10) {
      return `+229${numbers}`;
    }
    
    // Si le numéro a 9 chiffres, on ajoute +2290
    if (numbers.length === 9) {
      return `+2290${numbers}`;
    }
    
    // Si le numéro a 10 chiffres et ne commence pas par 0, on ajoute +2290
    if (numbers.length === 10 && !numbers.startsWith('0')) {
      return `+2290${numbers}`;
    }
    
    return phone; // Retourner tel quel si le format n'est pas reconnu
  };

  const validateDateOfBirth = (date: string): boolean => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 3 && age <= 25;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Required fields validation
    if (!formData.educmasterNumber.trim()) {
      newErrors.educmasterNumber = 'Le N° Educmaster est requis';
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.gender) {
      newErrors.gender = 'Le genre est requis';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'La date de naissance est requise';
    } else if (!validateDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'L\'âge doit être entre 3 et 25 ans';
    }
    if (!formData.classId) {
      newErrors.classId = 'La classe est requise';
    }
    if (!formData.enrollmentDate) {
      newErrors.enrollmentDate = 'La date d\'inscription est requise';
    }

    // Validation des frais scolaires
    if (!formData.seniority) {
      newErrors.seniority = 'L\'ancienneté est requise';
    }
    if (formData.seniority === 'new' && (!formData.inscriptionFee || formData.inscriptionFee <= 0)) {
      newErrors.inscriptionFee = 'Les frais d\'inscription sont requis pour un nouvel élève';
    }
    if (formData.seniority === 'old' && (!formData.reinscriptionFee || formData.reinscriptionFee < 0)) {
      newErrors.reinscriptionFee = 'Les frais de réinscription sont requis pour un ancien élève';
    }
    if (!formData.tuitionFee || formData.tuitionFee <= 0) {
      newErrors.tuitionFee = 'Les frais de scolarité sont requis';
    }
    if (!formData.totalSchoolFees || formData.totalSchoolFees <= 0) {
      newErrors.totalSchoolFees = 'Le total des frais scolaires doit être calculé';
    }

    // Parent info validation
    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Le nom du parent est requis';
    }
    if (!formData.parentRelationship) {
      newErrors.parentRelationship = 'Le lien de parenté est requis';
    }
    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = 'Le téléphone du parent est requis';
    } else if (!validatePhone(formData.parentPhone)) {
      newErrors.parentPhone = 'Format de téléphone invalide (ex: +2290XXXXXXXX)';
    }
    if (formData.parentEmail && !validateEmail(formData.parentEmail)) {
      newErrors.parentEmail = 'Format d\'email invalide (ex: nom@domaine.com)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculer si le formulaire est valide
  const isFormValid = React.useMemo(() => {
    const checks = {
      educmasterNumber: formData.educmasterNumber.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth && validateDateOfBirth(formData.dateOfBirth),
      classId: formData.classId,
      enrollmentDate: formData.enrollmentDate,
      seniority: formData.seniority,
      inscriptionFee: formData.seniority !== 'new' || (formData.inscriptionFee && formData.inscriptionFee > 0),
      reinscriptionFee: formData.seniority !== 'old' || (formData.reinscriptionFee && formData.reinscriptionFee >= 0),
      tuitionFee: formData.tuitionFee > 0,
      totalSchoolFees: formData.totalSchoolFees > 0,
      parentName: formData.parentName.trim(),
      parentRelationship: formData.parentRelationship,
      parentPhone: formData.parentPhone.trim() && validatePhone(formData.parentPhone),
      parentEmail: !formData.parentEmail || validateEmail(formData.parentEmail)
    };
    
    console.log('🔍 Validation du formulaire:', checks);
    console.log('💰 Frais scolaires:', {
      seniority: formData.seniority,
      inscriptionFee: formData.inscriptionFee,
      reinscriptionFee: formData.reinscriptionFee,
      tuitionFee: formData.tuitionFee,
      totalSchoolFees: formData.totalSchoolFees
    });
    
    // Identifier les champs qui échouent
    const failedChecks = Object.entries(checks).filter(([key, value]) => !value);
    if (failedChecks.length > 0) {
      console.log('❌ Champs qui échouent:', failedChecks);
    }
    
    const isValid = Object.values(checks).every(Boolean);
    console.log('✅ Formulaire valide:', isValid);
    
    return isValid;
  }, [formData]);

  // Fonction pour récupérer les frais d'une classe
  const getFeesForClass = (classId: string) => {
    // Filtrer les configurations valides (avec classId non null) et prendre la plus récente
    const validConfigs = feeConfigurations
      .filter(fee => fee.classId === classId && fee.classId !== null)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
    
    console.log(`🔍 Recherche frais pour classe ${classId}:`, validConfigs.length, 'configurations trouvées');
    if (validConfigs.length > 0) {
      console.log('✅ Configuration sélectionnée:', validConfigs[0]);
    }
    
    return validConfigs.length > 0 ? validConfigs[0] : null;
  };

  // Fonction pour calculer les frais selon l'ancienneté
  const calculateFees = (classId: string, seniority: string) => {
    const fees = getFeesForClass(classId);
    if (!fees) {
      console.log('Aucune configuration de frais trouvée pour la classe:', classId);
      return { inscriptionFee: 0, reinscriptionFee: 0, tuitionFee: 0, totalSchoolFees: 0 };
    }

    // Gérer tuitionFees (array) - prendre la première valeur ou 0
    const tuitionFee = Array.isArray(fees.tuitionFees) && fees.tuitionFees.length > 0 
      ? fees.tuitionFees[0] 
      : (fees.tuitionFee || 0);
    
    console.log('Frais calculés pour la classe:', classId, 'ancienneté:', seniority, 'frais:', fees);
    
    if (seniority === 'new') {
      const inscriptionFee = fees.inscriptionFee || 0;
      const total = inscriptionFee + tuitionFee;
      return {
        inscriptionFee: inscriptionFee,
        reinscriptionFee: 0,
        tuitionFee: tuitionFee,
        totalSchoolFees: total
      };
    } else {
      const reinscriptionFee = fees.reinscriptionFee || 0;
      const total = reinscriptionFee + tuitionFee;
      return {
        inscriptionFee: 0,
        reinscriptionFee: reinscriptionFee,
        tuitionFee: tuitionFee,
        totalSchoolFees: total
      };
    }
  };

  // Fonction pour générer automatiquement le numéro Educmaster
  const generateEducmaster = async () => {
    if (!currentAcademicYear || !formData.classId) {
      setToast({ message: 'Veuillez sélectionner une classe et une année académique', type: 'error' });
      return;
    }

    setIsGeneratingEducmaster(true);
    
    try {
      // Récupérer les informations de l'école (département)
      const schoolSettingsResponse = await api.school.getSettings();
      const schoolSettings = schoolSettingsResponse.data?.data || schoolSettingsResponse.data;
      const department = schoolSettings?.department || 'littoral'; // Littoral par défaut
      console.log('🏫 Département de l\'école:', department);
      
      // Récupérer les informations de la classe
      const selectedClass = classes.find(c => c.id === formData.classId);
      if (!selectedClass) {
        throw new Error('Classe non trouvée');
      }
      console.log('📚 Classe sélectionnée:', {
        name: selectedClass.name,
        level: selectedClass.level,
        id: selectedClass.id
      });
      
      // Récupérer tous les étudiants existants pour trouver le prochain numéro séquentiel
      const schoolId = user?.schoolId || 'school-1';
      console.log('🔍 Génération Educmaster - schoolId utilisé:', schoolId);
      
      const response = await api.students.getAll();
      console.log('🔍 Réponse API getStudents:', response);
      
      const existingStudents = response.data?.data || response.data || [];
      console.log('Étudiants existants récupérés:', existingStudents.length);
      console.log('Numéros Educmaster existants:', existingStudents.map((s: any) => s.educmasterNumber).filter(Boolean));
      
      // Déterminer le cycle à partir du niveau de la classe
      const cycle = getCycleFromClassName(selectedClass.name, selectedClass.level);
      const cycleCode = CYCLE_CODES[cycle];
      console.log('🎓 Cycle déterminé:', { 
        className: selectedClass.name, 
        classLevel: selectedClass.level, 
        cycle, 
        cycleCode 
      });
      
      // Construire le préfixe du numéro Educmaster (département + année + cycle)
      const departmentCode = DEPARTMENT_CODES[department.toLowerCase()] || '08';
      const enrollmentYear = getEnrollmentYear(currentAcademicYear);
      const prefix = `${departmentCode}${enrollmentYear}${cycleCode}`;
      console.log('🔢 Préfixe Educmaster:', prefix);
      
      // Filtrer les numéros Educmaster existants qui correspondent au préfixe
      const existingEducmasterNumbers = existingStudents
        .filter((student: any) => {
          const educmasterNumber = student.educmasterNumber;
          if (!educmasterNumber) return false;
          // Supprimer les tirets pour la comparaison
          const cleanNumber = educmasterNumber.replace(/-/g, '');
          return cleanNumber.startsWith(prefix);
        })
        .map((student: any) => student.educmasterNumber)
        .sort();
      
      console.log('Numéros Educmaster existants pour le préfixe', prefix, ':', existingEducmasterNumbers);
      
      // Trouver le prochain numéro séquentiel disponible
      let nextSequentialNumber = 1;
      let educmasterNumber = `${prefix}${nextSequentialNumber.toString().padStart(6, '0')}`;
      let formattedNumber = `${educmasterNumber.slice(0, 2)}-${educmasterNumber.slice(2, 6)}-${educmasterNumber.slice(6)}`;
      
      // Vérifier l'unicité et incrémenter jusqu'à trouver un numéro libre
      while (existingEducmasterNumbers.includes(formattedNumber)) {
        nextSequentialNumber++;
        educmasterNumber = `${prefix}${nextSequentialNumber.toString().padStart(6, '0')}`;
        formattedNumber = `${educmasterNumber.slice(0, 2)}-${educmasterNumber.slice(2, 6)}-${educmasterNumber.slice(6)}`;
      }
      
      console.log('Nouveau numéro Educmaster généré:', formattedNumber);
      
      setFormData(prev => ({
        ...prev,
        educmasterNumber: formattedNumber
      }));
      
      setEducmasterPreview(formattedNumber);
      setToast({ message: `Numéro Educmaster généré: ${formattedNumber}`, type: 'success' });
      
    } catch (error) {
      console.error('Erreur lors de la génération du numéro Educmaster:', error);
      setToast({ message: 'Erreur lors de la génération du numéro Educmaster', type: 'error' });
    } finally {
      setIsGeneratingEducmaster(false);
    }
  };

  // Fonction pour valider le numéro Educmaster
  const validateEducmaster = (educmasterNumber: string): boolean => {
    return validateEducmasterNumber(educmasterNumber);
  };

  // Fonction pour décoder le numéro Educmaster
  const decodeEducmaster = (educmasterNumber: string) => {
    return decodeEducmasterNumber(educmasterNumber);
  };

  // Fonction pour capitaliser les textes
  const capitalizeText = (text: string, type: 'firstName' | 'lastName' | 'parentName' | 'educmasterNumber' | 'other'): string => {
    if (!text) return text;
    
    switch (type) {
      case 'firstName':
        // Première lettre en majuscule pour les prénoms
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      case 'lastName':
        // Tout en majuscules pour les noms
        return text.toUpperCase();
      case 'parentName':
        // Pour le nom complet du parent : nom en majuscules, prénom avec première lettre en majuscule
        const words = text.split(' ');
        return words.map((word, index) => {
          if (index === 0) {
            // Premier mot (prénom) : première lettre en majuscule
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          } else {
            // Autres mots (noms) : tout en majuscules
            return word.toUpperCase();
          }
        }).join(' ');
      case 'educmasterNumber':
        // N° Educmaster : tout en majuscules, accepte lettres, chiffres et tirets
        return text.toUpperCase();
      case 'other':
        // Première lettre en majuscule pour les autres champs
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
      default:
        return text;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Appliquer la capitalisation et le formatage selon le type de champ
    let processedValue = value;
    
    if (name === 'firstName') {
      processedValue = capitalizeText(value, 'firstName');
    } else if (name === 'lastName') {
      processedValue = capitalizeText(value, 'lastName');
    } else     if (name === 'educmasterNumber') {
      processedValue = capitalizeText(value, 'educmasterNumber');
      
      // Validation automatique du numéro Educmaster
      if (processedValue && processedValue.length >= 12) {
        const isValid = validateEducmaster(processedValue);
        if (isValid) {
          const decoded = decodeEducmaster(processedValue);
          console.log('Numéro Educmaster valide:', decoded);
        } else {
          console.warn('Numéro Educmaster invalide:', processedValue);
        }
      }
    } else if (name === 'parentName') {
      processedValue = capitalizeText(value, 'parentName');
    } else if (['placeOfBirth', 'city', 'country', 'parentProfession', 'parentAddress'].includes(name)) {
      processedValue = capitalizeText(value, 'other');
    } else if (name === 'parentPhone') {
      // Formater le numéro de téléphone du parent
      processedValue = formatPhoneNumber(value);
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: processedValue
      };
      
      // Recalculer les frais si la classe ou l'ancienneté change
      if (name === 'classId' || name === 'seniority') {
        console.log('🔄 Recalcul des frais pour:', { classId: newData.classId, seniority: newData.seniority });
        const fees = calculateFees(newData.classId, newData.seniority);
        console.log('💰 Frais calculés:', fees);
        return {
          ...newData,
          ...fees
        };
      }
      
      return newData;
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validation du type de fichier
      if (!isValidImageFile(file)) {
        setErrors(prev => ({ ...prev, photo: 'Veuillez sélectionner une image valide (JPEG, PNG, GIF, WebP)' }));
        return;
      }
      
      // Validation de la taille (max 5MB)
      if (!isValidFileSize(file, 5)) {
        setErrors(prev => ({ ...prev, photo: 'La taille de l\'image ne doit pas dépasser 5MB' }));
        return;
      }

      try {
        // Créer un aperçu immédiat
        const preview = await createImagePreview(file, 200, 200);
        setPhotoPreview(preview);

        // Compresser l'image en arrière-plan
        const compressionResult = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 600,
          quality: 0.8,
          format: 'jpeg'
        });

        // Mettre à jour avec l'image compressée
        setFormData(prev => ({ ...prev, photo: compressionResult.compressedDataUrl }));
        
        // Afficher les informations de compression dans la console (debug)
        console.log(`Image compressée: ${compressionResult.originalSize} → ${compressionResult.compressedSize} bytes (${compressionResult.compressionRatio.toFixed(1)}% de réduction)`);
        
        // Effacer les erreurs
        setErrors(prev => ({ ...prev, photo: '' }));
      } catch (error) {
        console.error('Erreur lors de la compression de l\'image:', error);
        setErrors(prev => ({ ...prev, photo: 'Erreur lors du traitement de l\'image' }));
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setFormData(prev => ({ ...prev, photo: null }));
    setErrors(prev => ({ ...prev, photo: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newDocuments = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file)
      }));
      
      setFormData(prev => ({
        ...prev,
        documents: [...(Array.isArray(prev.documents) ? prev.documents : []), ...newDocuments]
      }));
    }
  };

  const handleRemoveDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: (Array.isArray(prev.documents) ? prev.documents : []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== DEBUG handleSubmit ===');
    console.log('formData avant validation:', formData);
    
    if (!validateForm()) {
      console.log('❌ Validation échouée');
      return;
    }

    console.log('✅ Validation réussie');
    console.log('formData final:', formData);
    
    setIsSubmitting(true);
    
    try {
      console.log('📤 Envoi des données à onSave...');
      await onSave(formData);
      console.log('✅ onSave terminé avec succès');
      setToast({
        message: isEdit ? 'Élève mis à jour avec succès !' : 'Élève créé avec succès !',
        type: 'success'
      });
      setTimeout(() => {
    onClose();
      }, 1000);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setToast({
        message: 'Erreur lors de la sauvegarde de l\'élève',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName: string): string => {
    return errors[fieldName] || '';
  };

  const getFieldClassName = (fieldName: string): string => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100";
    const readOnlyClass = "bg-gray-50 dark:bg-gray-800 cursor-not-allowed";
    
    let className = errors[fieldName] 
      ? `${baseClass} border-red-500 focus:ring-red-500` 
      : `${baseClass} border-gray-300 dark:border-gray-600`;
    
    if (isReadOnly) {
      className += ` ${readOnlyClass}`;
    }
    
    return className;
  };

  const getFieldProps = () => {
    return isReadOnly ? { readOnly: true, disabled: true } : {};
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {!isOpen ? null : (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
          </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {isReadOnly ? "Détails de l'élève" : isEdit ? "Modifier un élève" : "Ajouter un nouvel élève"}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {isReadOnly 
                        ? "Consultez les informations détaillées de l'élève" 
                        : isEdit 
                          ? "Modifiez les informations de l'élève" 
                          : "Enregistrez un nouvel élève dans le système"
                      }
                    </p>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-white/5 rounded-full blur-xl"></div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
      <form id="student-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Message d'erreur global */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-red-800 dark:text-red-200">{errors.submit}</p>
            </div>
          </div>
        )}


        {/* Informations de base */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Informations de l'élève
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prénom*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={getFieldClassName('firstName')}
                {...getFieldProps()}
              />
              {getFieldError('firstName') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('firstName')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom*
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={getFieldClassName('lastName')}
                {...getFieldProps()}
              />
              {getFieldError('lastName') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('lastName')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Genre*
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className={getFieldClassName('gender')}
                {...getFieldProps()}
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              {getFieldError('gender') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('gender')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date de naissance*
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className={getFieldClassName('dateOfBirth')}
                {...getFieldProps()}
              />
              {getFieldError('dateOfBirth') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('dateOfBirth')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lieu de naissance
              </label>
              <input
                type="text"
                id="placeOfBirth"
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleChange}
                className={getFieldClassName('placeOfBirth')}
                {...getFieldProps()}
              />
              {getFieldError('placeOfBirth') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('placeOfBirth')}
                </p>
              )}
            </div>
            
            

            

            
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Photo
              </label>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Photo de profil" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                  <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex items-center">
                  <label className="px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 cursor-pointer flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                  <span>Choisir une photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="ml-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      title="Supprimer la photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
              </div>
              </div>
              {getFieldError('photo') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('photo')}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Informations scolaires */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            Informations scolaires
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                className={getFieldClassName('classId')}
                {...getFieldProps()}
              >
                <option value="">Sélectionner une classe</option>
                {classes.sort((a, b) => {
                  // Trier selon l'ordre logique des niveaux
                  const classOrder = [
                    'CI', 'CP', 'CE1', 'CE2', 'CM1', 'CM2',
                    '6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Tle', 'Terminale'
                  ];
                  
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
                }).map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              {getFieldError('classId') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('classId')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="educmasterNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                N° Educmaster*
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="educmasterNumber"
                  name="educmasterNumber"
                  value={formData.educmasterNumber}
                  onChange={handleChange}
                  required
                  className={`${getFieldClassName('educmasterNumber')} flex-1`}
                  placeholder="Ex: 08-2501-000045"
                  {...getFieldProps()}
                />
                <button
                  type="button"
                  onClick={generateEducmaster}
                  disabled={isGeneratingEducmaster || !currentAcademicYear || !formData.classId}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                  title="Générer automatiquement le numéro Educmaster"
                >
                  {isGeneratingEducmaster ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4" />
                  )}
                  {isGeneratingEducmaster ? 'Génération...' : 'Générer'}
                </button>
              </div>
              {getFieldError('educmasterNumber') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('educmasterNumber')}
                </p>
              )}
              {educmasterPreview && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  ✅ Numéro généré: {educmasterPreview}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="enrollmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'inscription*
              </label>
              <input
                type="date"
                id="enrollmentDate"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleChange}
                required
                className={getFieldClassName('enrollmentDate')}
                {...getFieldProps()}
              />
              {getFieldError('enrollmentDate') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('enrollmentDate')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Statut*
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={getFieldClassName('status')}
                {...getFieldProps()}
              >
                <option value="passant">Passant(e)</option>
                <option value="redoublant">Redoublant(e)</option>
              </select>
              {getFieldError('status') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('status')}
                </p>
              )}
            </div>
          </div>
          
          {/* Section des frais scolaires */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h5 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
              Frais scolaires
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Ancienneté */}
              <div>
                <label htmlFor="seniority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ancienneté*
                </label>
                <select
                  id="seniority"
                  name="seniority"
                  value={formData.seniority}
                  onChange={handleChange}
                  required
                  className={getFieldClassName('seniority')}
                  {...getFieldProps()}
                >
                  <option value="new">Nouveau</option>
                  <option value="old">Ancien</option>
                </select>
                {getFieldError('seniority') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {getFieldError('seniority')}
                  </p>
                )}
              </div>
              
            </div>
            
            {/* Détail des frais */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Frais d'inscription (visible si nouveau) */}
              {formData.seniority === 'new' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frais d'inscription
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.inscriptionFee.toLocaleString('fr-FR') + ' F CFA'}
                      readOnly
                      aria-label="Frais d'inscription"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-semibold text-right"
                    />
                  </div>
                </div>
              )}
              
              {/* Frais de réinscription (visible si ancien) */}
              {formData.seniority === 'old' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frais de réinscription
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.reinscriptionFee.toLocaleString('fr-FR') + ' F CFA'}
                      readOnly
                      aria-label="Frais de réinscription"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 font-semibold text-right"
                    />
                  </div>
                </div>
              )}
              
              {/* Frais de scolarité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frais de scolarité
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.tuitionFee.toLocaleString('fr-FR') + ' F CFA'}
                    readOnly
                    aria-label="Frais de scolarité"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 font-semibold text-right"
                  />
                </div>
              </div>
              
              {/* Total frais scolaires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total frais scolaires
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.totalSchoolFees.toLocaleString('fr-FR') + ' F CFA'}
                    readOnly
                    aria-label="Total des frais scolaires"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-semibold text-right"
                  />
                </div>
              </div>
            </div>
            
            {/* Message d'information */}
            {loadingFees && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Chargement des configurations de frais...
                </p>
              </div>
            )}
            
            {!loadingFees && academicYearState && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Frais basés sur l'année scolaire : {formatAcademicYear(academicYearState)}
                </p>
              </div>
            )}
            
            {!loadingFees && formData.classId && !getFeesForClass(formData.classId) && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Aucune configuration de frais trouvée pour cette classe. Veuillez configurer les frais dans l'onglet Finance.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Informations des parents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            Informations du parent/tuteur
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom complet du parent*
              </label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                required
                className={getFieldClassName('parentName')}
                {...getFieldProps()}
                placeholder="Ex: Jean Dupont"
              />
              {getFieldError('parentName') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('parentName')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="parentRelationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lien de parenté*
              </label>
              <select
                id="parentRelationship"
                name="parentRelationship"
                value={formData.parentRelationship}
                onChange={handleChange}
                required
                className={getFieldClassName('parentRelationship')}
                {...getFieldProps()}
              >
                <option value="">Sélectionner</option>
                <option value="Père">Père</option>
                <option value="Mère">Mère</option>
                <option value="Tuteur">Tuteur</option>
                <option value="Autre">Autre</option>
              </select>
              {getFieldError('parentRelationship') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('parentRelationship')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Téléphone*
              </label>
              <input
                type="tel"
                id="parentPhone"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                required
                className={getFieldClassName('parentPhone')}
                {...getFieldProps()}
                placeholder="Ex: +2290XXXXXXXX"
              />
              {getFieldError('parentPhone') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('parentPhone')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="parentEmail"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                className={getFieldClassName('parentEmail')}
                {...getFieldProps()}
              />
              {getFieldError('parentEmail') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('parentEmail')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="parentProfession" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profession
              </label>
              <input
                type="text"
                id="parentProfession"
                name="parentProfession"
                value={formData.parentProfession}
                onChange={handleChange}
                className={getFieldClassName('parentProfession')}
                {...getFieldProps()}
              />
              {getFieldError('parentProfession') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('parentProfession')}
                </p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="parentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Adresse
              </label>
              <textarea
                id="parentAddress"
                name="parentAddress"
                value={formData.parentAddress}
                onChange={handleChange}
                rows={2}
                className={getFieldClassName('parentAddress')}
                {...getFieldProps()}
              />
              {getFieldError('parentAddress') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('parentAddress')}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Informations médicales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
            Informations médicales
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Groupe sanguin
              </label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className={getFieldClassName('bloodType')}
                {...getFieldProps()}
              >
                <option value="">Sélectionner</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {getFieldError('bloodType') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('bloodType')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Allergies
              </label>
              <input
                type="text"
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className={getFieldClassName('allergies')}
                {...getFieldProps()}
                placeholder="Séparées par des virgules"
              />
              {getFieldError('allergies') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('allergies')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="chronicConditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Conditions chroniques
              </label>
              <input
                type="text"
                id="chronicConditions"
                name="chronicConditions"
                value={formData.chronicConditions}
                onChange={handleChange}
                className={getFieldClassName('chronicConditions')}
                {...getFieldProps()}
                placeholder="Ex: Asthme, diabète, etc."
              />
              {getFieldError('chronicConditions') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('chronicConditions')}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="medications" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Médicaments
              </label>
              <input
                type="text"
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                className={getFieldClassName('medications')}
                {...getFieldProps()}
                placeholder="Médicaments réguliers"
              />
              {getFieldError('medications') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('medications')}
                </p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact d'urgence
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className={getFieldClassName('emergencyContact')}
                {...getFieldProps()}
                placeholder="Nom et téléphone"
              />
              {getFieldError('emergencyContact') && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {getFieldError('emergencyContact')}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Documents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
            Documents
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 cursor-pointer flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                <span>Ajouter des documents</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                Formats acceptés: PDF, JPG, PNG (max 5MB)
              </span>
            </div>
            
            {formData.documents.length > 0 ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Nom
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Taille
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {(Array.isArray(formData.documents) ? formData.documents : []).map((doc, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {doc.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {doc.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(doc.size / 1024).toFixed(2)} KB
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveDocument(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                Aucun document ajouté
              </div>
            )}
          </div>
        </div>
        
        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Notes et observations
          </h4>
          
          <div>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className={getFieldClassName('notes')}
              placeholder="Notes supplémentaires sur l'élève..."
              {...getFieldProps()}
            />
            {getFieldError('notes') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {getFieldError('notes')}
              </p>
            )}
          </div>
        </div>
      </form>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              {isReadOnly ? (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    form="student-form"
                    disabled={isSubmitting || !isFormValid}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 ${
                      isFormValid
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{isEdit ? 'Modification...' : 'Enregistrement...'}</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{isEdit ? 'Modifier' : 'Enregistrer'}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentModal;