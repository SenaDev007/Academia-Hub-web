import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { Phone, AlertTriangle, Shield, User, BarChart3, Calculator, MessageSquare } from 'lucide-react';
import { electronMtnSmsService } from '../../services/electronMtnSmsService';
import { generateAutoSequenceReceiptNumber } from '../../utils/receiptNameGenerator';
import { api } from '../../lib/api/client';
import { mtnMomo, argentEspeces } from '../../utils/imagePaths';

// Fonction pour générer un numéro de reçu basé sur la base de données
const generateReceiptNumberFromDB = async (academicYear: string = '2025-2026', className: string = 'CI') => {
  try {
    // Récupérer les paiements existants depuis l'API
    const response = await api.finance.getPayments();
    const existingPayments = response.data?.data || response.data || [];
    
    // Filtrer les paiements de l'année scolaire et classe en cours
    const yearCode = academicYear.replace('-', '');
    const classKey = className.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    const currentYearPayments = existingPayments.filter((payment: any) => {
      if (payment.receiptNumber) {
        return payment.receiptNumber.includes(yearCode) && payment.receiptNumber.includes(classKey);
      }
      return false;
    });
    
    // Le prochain numéro d'ordre sera le nombre d'enregistrements + 1
    const nextOrderNumber = (currentYearPayments.length + 1).toString().padStart(3, '0');
    
    // Formater l'année scolaire (ex: 2025-2026 -> 025026)
    const years = academicYear.split('-');
    const year1 = years[0].slice(-3).padStart(3, '0');
    const year2 = years[1].slice(-3).padStart(3, '0');
    const academicYearCode = `${year1}${year2}`;
    
    // Nettoyer le nom de la classe
    let cleanClassName = className.toUpperCase();
    if (cleanClassName.includes('MATERNELLE')) {
      const match = cleanClassName.match(/MATERNELLE\s*(\d+)/);
      if (match) {
        cleanClassName = `MAT${match[1]}`;
      } else {
        cleanClassName = 'MAT';
      }
    } else {
      cleanClassName = cleanClassName
        .replace(/1ÈRE/g, '1ERE')
        .replace(/2NDE/g, '2NDE')
        .replace(/TLE/g, 'TLE')
        .replace(/ème/g, 'EME')
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 10);
    }
    
    return `REC-${academicYearCode}-${nextOrderNumber}-${cleanClassName}`;
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de reçu:', error);
    // Fallback vers l'ancienne méthode
    return generateAutoSequenceReceiptNumber(academicYear, className);
  }
};

interface SchoolFeesPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  studentData?: any;
}

const SchoolFeesPaymentModal: React.FC<SchoolFeesPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  studentData
}) => {
  const { addToast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mtn_withdrawal'>('cash');
  const [sendSMSNotification, setSendSMSNotification] = useState(true);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentTime, setPaymentTime] = useState(new Date().toTimeString().slice(0, 5));
  const [paymentAmount, setPaymentAmount] = useState(amount || 0);
  const [amountGiven, setAmountGiven] = useState(amount || 0);
  const [change, setChange] = useState(0);
  const [schoolWhatsAppNumber, setSchoolWhatsAppNumber] = useState('');
  const [savedSchoolWhatsAppNumber, setSavedSchoolWhatsAppNumber] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolSecondaryPhone, setSchoolSecondaryPhone] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolWebsite, setSchoolWebsite] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [showFullyPaidModal, setShowFullyPaidModal] = useState(false);
  const [showAmountErrorModal, setShowAmountErrorModal] = useState(false);

  // États pour les données des élèves et classes
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(false);

  // Réinitialiser le formulaire quand le modal s'ouvre
  React.useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsUpdatingBalance(false);
      
      // Si pas de données d'élève (mode création), réinitialiser le formulaire
      if (!studentData) {
        setSelectedStudentId('');
        setSelectedStudent(null);
        setPaymentAmount(amount || 0);
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentTime(new Date().toTimeString().slice(0, 5));
        setPaymentMethod('cash');
        setSendSMSNotification(true);
        setAmountGiven(amount || 0);
        setChange(0);
        
        // Générer un nouveau numéro de reçu selon le format REC-0AA0AA-000-Classe
        const generateReceiptNumber = async () => {
          return await generateReceiptNumberFromDB('2025-2026', 'CI');
        };
        generateReceiptNumber().then(setReceiptNumber);
      }
    }
  }, [isOpen, studentData, amount]);

  // Charger les données des élèves et classes
  React.useEffect(() => {
    const loadData = async () => {
      setStudentsLoading(true);
      setClassesLoading(true);
      
      try {
        // Charger les élèves
        // Utiliser l'API HTTP
        try {
          const studentsResult = await api.students.getAll();
          if (studentsResult.success) {
            setStudents(studentsResult.data || []);
          }
        }
        
        // Charger les classes
        try {
          const classesResult = await api.classes.getAll();
          if (classesResult.data) {
            setClasses(classesResult.data?.data || classesResult.data || []);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des classes:', error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setStudentsLoading(false);
        setClassesLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Charger le numéro WhatsApp de l'école depuis la base de données
  React.useEffect(() => {
    console.log('=== SchoolFeesPaymentModal useEffect ===');
    console.log('studentData reçu:', studentData);
    console.log('amount:', amount);
    
    const loadSchoolSettings = async () => {
      try {
        // Récupérer les paramètres de l'école depuis la base de données
        const schoolSettingsResponse = await api.school.getSettings();
        const schoolSettings = schoolSettingsResponse.data?.data || schoolSettingsResponse.data;
        console.log('Paramètres de l\'école récupérés:', schoolSettings);
        console.log('Téléphone principal:', schoolSettings?.primaryPhone);
        console.log('Téléphone secondaire:', schoolSettings?.secondaryPhone);
        console.log('Email:', schoolSettings?.primaryEmail);
        console.log('Site web:', schoolSettings?.website);
        console.log('Adresse:', schoolSettings?.address);
        console.log('WhatsApp:', schoolSettings?.whatsapp);

        // Sauvegarder les paramètres dans l'état
        setSchoolSettings(schoolSettings);

        if (schoolSettings) {
          // Charger le nom de l'école
          if (schoolSettings.name) {
            setSchoolName(schoolSettings.name);
            console.log('Nom de l\'école chargé:', schoolSettings.name);
          }
          
          // Charger le numéro de téléphone
          if (schoolSettings.primaryPhone) {
            setSchoolPhone(schoolSettings.primaryPhone);
            console.log('Téléphone de l\'école chargé:', schoolSettings.primaryPhone);
          }
          
          // Charger le téléphone secondaire
          if (schoolSettings.secondaryPhone) {
            setSchoolSecondaryPhone(schoolSettings.secondaryPhone);
            console.log('Téléphone secondaire de l\'école chargé:', schoolSettings.secondaryPhone);
          }
          
          // Charger l'email
          if (schoolSettings.primaryEmail) {
            setSchoolEmail(schoolSettings.primaryEmail);
            console.log('Email de l\'école chargé:', schoolSettings.primaryEmail);
          }
          
          // Charger le site web
          if (schoolSettings.website) {
            setSchoolWebsite(schoolSettings.website);
            console.log('Site web de l\'école chargé:', schoolSettings.website);
          }
          
          // Charger l'adresse
          if (schoolSettings.address) {
            setSchoolAddress(schoolSettings.address);
            console.log('Adresse de l\'école chargée:', schoolSettings.address);
          }
          
          // Charger le numéro WhatsApp
          if (schoolSettings.whatsapp) {
            setSchoolWhatsAppNumber(schoolSettings.whatsapp);
            setSavedSchoolWhatsAppNumber(schoolSettings.whatsapp);
            console.log('Numéro WhatsApp de l\'école chargé:', schoolSettings.whatsapp);
          } else {
            console.log('Aucun numéro WhatsApp trouvé dans les paramètres de l\'école');
            // Fallback sur localStorage si pas de données en base
    const savedNumber = localStorage.getItem('schoolWhatsAppNumber');
    if (savedNumber) {
      setSchoolWhatsAppNumber(savedNumber);
      setSavedSchoolWhatsAppNumber(savedNumber);
            }
          }
        } else {
          console.log('Aucun paramètre d\'école trouvé');
          // Fallback sur localStorage si pas de données en base
          const savedNumber = localStorage.getItem('schoolWhatsAppNumber');
          if (savedNumber) {
            setSchoolWhatsAppNumber(savedNumber);
            setSavedSchoolWhatsAppNumber(savedNumber);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres de l\'école:', error);
        // Fallback sur localStorage en cas d'erreur
        const savedNumber = localStorage.getItem('schoolWhatsAppNumber');
        if (savedNumber) {
          setSchoolWhatsAppNumber(savedNumber);
          setSavedSchoolWhatsAppNumber(savedNumber);
        }
      }
    };
    
    if (isOpen) {
      loadSchoolSettings();
    }

    }, [isOpen, studentData, amount]);

  // useEffect séparé pour gérer la mise à jour de selectedStudent en mode édition
  React.useEffect(() => {
    console.log('🔄 useEffect selectedStudent - studentData:', studentData);
    if (studentData) {
      console.log('Mode édition détecté, initialisation avec:', studentData);
      console.log('🔍 Détails des données reçues:');
      console.log('- studentName:', studentData.studentName);
      console.log('- className:', studentData.className);
      console.log('- parentName:', studentData.parentName);
      console.log('- parentPhone:', studentData.parentPhone);
      console.log('- amount:', studentData.amount);
      console.log('- paymentMethod:', studentData.paymentMethod);
      console.log('- method:', studentData.method);
      console.log('- date:', studentData.date);
      console.log('- paymentDate:', studentData.paymentDate);
      console.log('- dateOfBirth:', studentData.dateOfBirth);
      console.log('- educmasterNumber:', studentData.educmasterNumber);
      console.log('- matricule:', studentData.matricule);
      console.log('- academicYear:', studentData.academicYear);
      console.log('- academicYearId:', studentData.academicYearId);
      console.log('- student object:', studentData.student);
      
      // Mettre à jour les informations de l'étudiant
      const studentInfo = {
        id: studentData.studentId || studentData.id,
        name: studentData.studentName || studentData.student?.name || 'Étudiant',
        studentName: studentData.studentName || studentData.student?.name || 'Étudiant',
        class: studentData.className || studentData.student?.class || 'Non spécifiée',
        classId: studentData.classId || studentData.student?.classId,
        matricule: studentData.educmasterNumber || studentData.student?.educmasterNumber || studentData.student?.matricule || studentData.matricule || studentData.studentId || studentData.id,
        dateOfBirth: (studentData.dateOfBirth && studentData.dateOfBirth.trim() !== '') ? studentData.dateOfBirth : (studentData.student?.dateOfBirth && studentData.student.dateOfBirth.trim() !== '') ? studentData.student.dateOfBirth : '',
        parentName: studentData.parentName || studentData.student?.parentName || '',
        parentPhone: studentData.parentPhone || studentData.student?.parentPhone || '',
        parentEmail: studentData.parentEmail || studentData.student?.parentEmail || '',
        address: studentData.address || studentData.student?.address || 'Adresse non renseignée',
        schoolYear: studentData.student?.academicYear || studentData.academicYear || '2025-2026',
        status: studentData.student?.status || 'Actif',
        seniority: studentData.seniority || studentData.student?.seniority || 'new',
        inscriptionFee: studentData.inscriptionFee || studentData.student?.inscriptionFee || 0,
        reinscriptionFee: studentData.reinscriptionFee || studentData.student?.reinscriptionFee || 0,
        tuitionFee: studentData.tuitionFee || studentData.student?.tuitionFee || 0,
        totalSchoolFees: studentData.totalSchoolFees || studentData.student?.totalSchoolFees || 0,
        totalExpected: studentData.totalExpected || 0,
        totalPaid: studentData.totalPaid || 0,
        totalRemaining: studentData.totalRemaining || 0
      };
      
      console.log('Student info:', studentInfo);
      console.log('🔍 Détails de l\'étudiant final:');
      console.log('- dateOfBirth final:', studentInfo.dateOfBirth);
      console.log('- dateOfBirth type:', typeof studentInfo.dateOfBirth);
      console.log('- dateOfBirth length:', studentInfo.dateOfBirth?.length);
      console.log('- matricule final:', studentInfo.matricule);
      console.log('- schoolYear final:', studentInfo.schoolYear);
      setSelectedStudent(studentInfo);
      setSelectedStudentId(studentInfo.id);
      console.log('✅ selectedStudent mis à jour avec:', studentInfo);
    }
  }, [studentData]);

  // Mettre à jour les champs de paiement quand studentData change
  React.useEffect(() => {
    if (studentData) {
      // Mettre à jour les champs de paiement
      const paymentAmountValue = Number(studentData.amount) || Number(amount) || 0;
      const paymentDateValue = studentData.paymentDate || studentData.date || new Date().toISOString().split('T')[0];
      // Extraire l'heure de la date si elle contient l'heure, sinon utiliser l'heure actuelle
      let paymentTimeValue = new Date().toTimeString().slice(0, 5);
      if (studentData.time) {
        paymentTimeValue = studentData.time;
      } else if (studentData.date && studentData.date.includes('T')) {
        // Si la date contient l'heure (format ISO)
        const dateObj = new Date(studentData.date);
        paymentTimeValue = dateObj.toTimeString().slice(0, 5);
      } else if (studentData.paymentDate && studentData.paymentDate.includes('T')) {
        // Si paymentDate contient l'heure
        const dateObj = new Date(studentData.paymentDate);
        paymentTimeValue = dateObj.toTimeString().slice(0, 5);
      }
      // Convertir la méthode de paiement formatée en valeur du state
      let paymentMethodValue: 'cash' | 'mtn_withdrawal' = 'cash';
      if (studentData.paymentMethod) {
        if (studentData.paymentMethod.toLowerCase().includes('momo') || studentData.paymentMethod.toLowerCase().includes('mtn')) {
          paymentMethodValue = 'mtn_withdrawal';
        } else if (studentData.paymentMethod.toLowerCase().includes('espèces') || studentData.paymentMethod.toLowerCase().includes('cash')) {
          paymentMethodValue = 'cash';
        }
      } else if (studentData.method) {
        if (studentData.method === 'mtn_withdrawal') {
          paymentMethodValue = 'mtn_withdrawal';
        } else {
          paymentMethodValue = 'cash';
        }
      }
      
      console.log('Setting payment fields:', {
        amount: paymentAmountValue,
        date: paymentDateValue,
        time: paymentTimeValue,
        method: paymentMethodValue
      });
      
      setPaymentAmount(paymentAmountValue);
      setPaymentDate(paymentDateValue);
      setPaymentTime(paymentTimeValue);
      setPaymentMethod(paymentMethodValue);
      setAmountGiven(Number(studentData.amountGiven) || paymentAmountValue);
      setChange(Number(studentData.change) || 0);
      
      // Si un numéro de reçu existe déjà, le conserver
      if (studentData.receiptNumber) {
        setReceiptNumber(studentData.receiptNumber);
      } else {
        const generateReceiptNumber = async () => {
          return await generateReceiptNumberFromDB('2025-2026', 'CI');
        };
        generateReceiptNumber().then(setReceiptNumber);
      }
      
      // Pour le retrait MTN, initialiser les numéros de téléphone
      // Pas de champs spécifiques pour les nouvelles méthodes de paiement
      
      console.log('Formulaire initialisé avec succès');
    } else {
      console.log('Mode création détecté');
      // Mode création
      const generateReceiptNumber = async () => {
        return await generateReceiptNumberFromDB('2025-2026', 'CI');
      };
      generateReceiptNumber().then(setReceiptNumber);
      
      setPaymentAmount(Number(amount) || 0);
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentTime(new Date().toTimeString().slice(0, 5));
      setPaymentMethod('cash');
      setAmountGiven(Number(amount) || 0);
      setChange(0);
      setSelectedStudent(null);
      setSelectedStudentId('');
    }
  }, [studentData, amount, savedSchoolWhatsAppNumber]);

  // Recalculer le bilan quand un élève est sélectionné
  React.useEffect(() => {
    if (selectedStudent && selectedStudent.id) {
      console.log('🔄 Élève sélectionné détecté, recalcul du bilan...');
      recalculateStudentBalance(selectedStudent.id);
    }
  }, [selectedStudent?.id]);

  // Afficher le modal d'information si l'élève est entièrement payé
  React.useEffect(() => {
    if (selectedStudent && (selectedStudent.totalRemaining || 0) <= 0) {
      console.log('💰 Élève entièrement payé détecté, affichage du modal d\'information');
      setShowFullyPaidModal(true);
    } else {
      // Fermer le modal si l'élève n'est pas entièrement payé
      setShowFullyPaidModal(false);
    }
  }, [selectedStudent?.totalRemaining]);

  // Fermer le modal d'erreur de montant quand l'élève change
  React.useEffect(() => {
    if (showAmountErrorModal) {
      setShowAmountErrorModal(false);
    }
  }, [selectedStudent?.id]);

  // Générer automatiquement le numéro de reçu quand les données changent
  React.useEffect(() => {
    if (selectedStudent && schoolSettings) {
      // Utiliser la classe de l'élève sélectionné pour générer le numéro de reçu
      const studentClassName = selectedStudent?.class || selectedStudent?.className || 'CI';
      generateReceiptNumberFromDB('2025-2026', studentClassName).then(setReceiptNumber);
    }
  }, [selectedStudent, schoolSettings, paymentDate, paymentAmount, paymentMethod]);

  // Utiliser les vraies données des élèves
  const allStudents = students.map((student: any) => ({
    id: student.id,
    name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
    studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(), // Ajout pour la sauvegarde
    class: student.className || 'Non assigné',
    classId: student.classId,
    matricule: student.educmasterNumber || student.id,
    dateOfBirth: student.dateOfBirth || '',
    parentName: student.parentName || '',
    parentPhone: student.parentPhone || '',
    parentEmail: student.parentEmail || '',
    address: student.parentAddress ? student.parentAddress : 'Adresse non renseignée',
    schoolYear: student.academicYear || '2025-2026',
    status: student.status || 'Actif',
    // Ancienneté
    seniority: student.seniority || 'new',
    // Frais scolaires
    inscriptionFee: student.inscriptionFee || 0,
    reinscriptionFee: student.reinscriptionFee || 0,
    tuitionFee: student.tuitionFee || 0,
    totalSchoolFees: student.totalSchoolFees || 0,
    // Bilan scolarité
    totalExpected: student.totalSchoolFees || 0,
    totalPaid: 0, // À calculer selon les paiements existants
    totalRemaining: student.totalSchoolFees || 0
  }));

  // Filter students based on search term and selected class
  const filteredStudents = allStudents.filter((student: any) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !selectedClassId || student.classId === selectedClassId;
    
    return matchesSearch && matchesClass;
  });

  // Calculate change when amount given changes
  React.useEffect(() => {
    if (paymentMethod === 'cash') {
      const calculatedChange = (amountGiven || 0) - (paymentAmount || 0);
      setChange(calculatedChange > 0 ? calculatedChange : 0);
    } else {
      setAmountGiven(paymentAmount || 0);
      setChange(0);
    }
  }, [amountGiven, paymentAmount, paymentMethod]);

  // Fonction pour valider le montant de paiement
  const validatePaymentAmount = (amount: number) => {
    if (selectedStudent && amount > (selectedStudent.totalRemaining || 0)) {
      setShowAmountErrorModal(true);
      return false;
    }
    return true;
  };

  // Fonction pour gérer le changement de montant avec validation
  const handlePaymentAmountChange = (value: number) => {
    setPaymentAmount(value);
    
    // Fermer le modal d'erreur si le montant devient valide
    if (showAmountErrorModal && selectedStudent && value <= (selectedStudent.totalRemaining || 0)) {
      setShowAmountErrorModal(false);
    }
    
    // Valider le montant seulement si un élève est sélectionné
    if (selectedStudent && value > 0) {
      validatePaymentAmount(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    
    try {
      // Validation des données de paiement
      if (!selectedStudent) {
        throw new Error('Veuillez sélectionner un élève');
      }

      // Vérifier si l'élève est entièrement payé
      if ((selectedStudent.totalRemaining || 0) <= 0) {
        setShowFullyPaidModal(true);
        setIsProcessing(false);
        return;
      }
      
      // Valider le montant du paiement
      if (selectedStudent && (paymentAmount || 0) > (selectedStudent.totalRemaining || 0)) {
        setShowAmountErrorModal(true);
        setIsProcessing(false);
        return;
      }
      
      // Valider que tous les champs requis sont remplis
      if (!selectedStudentId) {
        throw new Error('Veuillez sélectionner un élève');
      }
      
      // Générer automatiquement un numéro de reçu selon le format REC-0AA0AA-000-Classe
      let finalReceiptNumber = receiptNumber.trim();
      if (!finalReceiptNumber) {
        const studentClassName = selectedStudent?.class || selectedStudent?.className || 'CI';
        finalReceiptNumber = await generateReceiptNumberFromDB('2025-2026', studentClassName);
      }
      
      if (!paymentDate) {
        throw new Error('Veuillez sélectionner une date de paiement');
      }
      
      // Préparer les données du paiement pour la sauvegarde
      const paymentData = {
        studentId: selectedStudentId,
        studentName: selectedStudent?.studentName || '',
        parentName: selectedStudent?.parentName || null,
        parentPhone: selectedStudent?.parentPhone || null,
        parentEmail: selectedStudent?.parentEmail || null,
        address: selectedStudent?.address || null,
        classId: selectedStudent?.classId || '',
        className: selectedStudent?.className || null,
        classLevel: selectedStudent?.classLevel || null,
        academicYearId: selectedStudent?.academicYearId || 'academic-year-2025-2026',
        // Frais scolaires
        inscriptionFee: selectedStudent?.inscriptionFee || 0,
        reinscriptionFee: selectedStudent?.reinscriptionFee || 0,
        tuitionFee: selectedStudent?.tuitionFee || 0,
        totalSchoolFees: selectedStudent?.totalSchoolFees || 0,
        seniority: selectedStudent?.seniority || 'new',
        // Bilan scolarité
        totalExpected: selectedStudent?.totalExpected || 0,
        totalPaid: selectedStudent?.totalPaid || 0,
        totalRemaining: selectedStudent?.totalRemaining || 0,
        // Récapitulatif paiement
        amount: paymentAmount || 0,
        reduction: 0,
        method: paymentMethod,
        reference: null,
        receiptNumber: finalReceiptNumber,
        status: 'completed',
        date: paymentDate,
        time: paymentTime || null,
        // Informations de paiement spécifiques (simplifiées)
        senderPhone: null,
        receiverPhone: null,
        phoneNumber: null,
        amountGiven: (paymentMethod as string) === 'cash' ? amountGiven : 0,
        change: (paymentMethod as string) === 'cash' ? change : 0,
        // Informations de contact de l'école
        schoolPhone: schoolPhone || null,
        schoolEmail: schoolEmail || null,
        schoolWhatsApp: schoolWhatsAppNumber || null,
        schoolId: 'school-1'
      };
      
      console.log('Sending payment data:', paymentData);
      
      // Appel API pour sauvegarder le paiement
      if (typeof window !== 'undefined' && (window as any).electronAPI?.finance) {
        console.log('💾 Sauvegarde du paiement via Electron API...');
        const response = await api.finance.createPayment(paymentData);
        console.log('✅ Réponse de sauvegarde:', response);
        
        if (response.success) {
          console.log('✅ Paiement sauvegardé avec succès');
        } else {
          throw new Error(response.error || 'Erreur lors de la sauvegarde du paiement');
        }
      } else {
        throw new Error('API Electron non disponible');
      }
      
      // Envoyer le reçu par SMS/WhatsApp si nécessaire
      console.log('🔄 Appel de sendNotificationSMS...');
      await sendNotificationSMS();
      
      // Recalculer le bilan de scolarité de l'élève AVANT de fermer le modal
      if (selectedStudentId) {
        await recalculateStudentBalance(selectedStudentId);
        
        // Afficher un toast de succès
        addToast({
          title: 'Encaissement réussi',
          message: `Reçu N° ${receiptNumber} pour ${selectedStudent?.studentName || 'l\'élève'} - ${formatAmount(paymentAmount || 0)} F CFA`,
          type: 'success'
        });
        
        // Afficher le toast d'image juste après
        addToast({
          title: 'Image du reçu',
          message: 'L\'image du reçu a été générée et sera envoyée par WhatsApp !',
          type: 'info'
        });
        
        // Attendre un court délai pour que l'utilisateur puisse voir la mise à jour du bilan
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Appeler la fonction de succès passée en prop
      onSuccess();
      
      // Fermer le modal après la mise à jour
        onClose();
      
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du paiement:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'enregistrement du paiement';
      setError(errorMessage);
      
      // Afficher un toast d'erreur
      addToast({
        title: 'Erreur d\'encaissement',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction pour formater le numéro de téléphone pour WhatsApp au Bénin
  const formatPhoneForWhatsApp = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    
    // Supprimer tous les espaces, tirets et caractères spéciaux
    let cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    
    // Si le numéro commence par 01, le remplacer par 229
    if (cleanNumber.startsWith('01')) {
      cleanNumber = '229' + cleanNumber.substring(2);
    }
    
    // Si le numéro commence par +229, supprimer le +
    if (cleanNumber.startsWith('+229')) {
      cleanNumber = cleanNumber.substring(1);
    }
    
    // Si le numéro commence par 229, le garder tel quel
    if (!cleanNumber.startsWith('229')) {
      cleanNumber = '229' + cleanNumber;
    }
    
    console.log(`📱 Formatage numéro: ${phoneNumber} → ${cleanNumber}`);
    return cleanNumber;
  };

  // Fonctions pour dessiner des icônes SVG sur le canvas
  const drawIcon = (ctx: CanvasRenderingContext2D, iconType: string, x: number, y: number, size: number, color: string) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    switch (iconType) {
      case 'student':
        // Icône d'étudiant (personne avec livre)
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/3, size/4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/3, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.fillRect(x + size/2 - size/8, y + size/2, size/4, size/3);
        break;
        
      case 'payment':
        // Icône de paiement (billet avec symbole $)
        ctx.fillRect(x, y, size, size/2);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${size/3}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('$', x + size/2, y + size/3);
        break;
        
      case 'balance':
        // Icône de bilan (graphique en barres)
        const barWidth = size/6;
        const barHeight1 = size/3;
        const barHeight2 = size/2;
        const barHeight3 = size/4;
        
        ctx.fillRect(x + barWidth, y + size - barHeight1, barWidth, barHeight1);
        ctx.fillRect(x + barWidth * 2.5, y + size - barHeight2, barWidth, barHeight2);
        ctx.fillRect(x + barWidth * 4, y + size - barHeight3, barWidth, barHeight3);
        break;
        
      case 'contact':
        // Icône de contact (téléphone)
        ctx.beginPath();
        ctx.roundRect(x + size/6, y + size/6, size * 2/3, size * 2/3, size/8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/8, 0, 2 * Math.PI);
        ctx.fill();
        break;
        
      case 'success':
        // Icône de succès (coche)
        ctx.beginPath();
        ctx.moveTo(x + size/4, y + size/2);
        ctx.lineTo(x + size/2, y + size * 3/4);
        ctx.lineTo(x + size * 3/4, y + size/4);
        ctx.stroke();
        break;
        
      case 'school':
        // Icône d'école (bâtiment)
        ctx.fillRect(x + size/4, y + size/2, size/2, size/2);
        ctx.beginPath();
        ctx.moveTo(x, y + size/2);
        ctx.lineTo(x + size/2, y + size/4);
        ctx.lineTo(x + size, y + size/2);
        ctx.stroke();
        break;
    }
    
    ctx.restore();
  };


  const generateReceiptImage = async (payment: any, schoolLogo?: string, schoolSettings: any): Promise<string | null> => {
    try {
      console.log('🎨 Génération de l\'image du reçu identique au PDF...');
      
      // Créer un canvas pour générer l'image du reçu
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Impossible de créer le contexte canvas');
      }
      
      // Dimensions pour format A6 paysage (comme PDFReceipt)
      const scale = 2; // Facteur de mise à l'échelle pour HD
      const baseWidth = 420; // A6 landscape width
      const baseHeight = 297; // A6 landscape height
      const width = baseWidth * scale;
      const height = baseHeight * scale;
      canvas.width = width;
      canvas.height = height;
      
      // Mise à l'échelle du contexte pour HD
      ctx.scale(scale, scale);
      
      // Utiliser les dimensions de base pour tous les calculs
      const canvasWidth = baseWidth;
      const canvasHeight = baseHeight;
      
      // Couleurs (utiliser celles de l'école si disponibles)
      const primaryColor = schoolSettings?.primaryColor || '#2563eb';
      const secondaryColor = schoolSettings?.secondaryColor || '#1e40af';
      const backgroundColor = '#ffffff';
      const textColor = '#1e293b';

      // Fonctions de formatage identiques au PDFReceipt
      const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount).replace(/\s/g, '.');
      };

      const formatDate = (dateString: string) => {
        try {
          if (!dateString || dateString === 'Invalid Date') {
            return new Date().toLocaleDateString('fr-FR');
          }
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            return new Date().toLocaleDateString('fr-FR');
          }
          return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
        } catch (error) {
          return new Date().toLocaleDateString('fr-FR');
        }
      };

      const formatTime = (dateString: string) => {
        try {
          if (!dateString || dateString === 'Invalid Date') {
            return new Date().toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            return new Date().toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
          }
          return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } catch (error) {
          return new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
      };

      // Normaliser la méthode de paiement comme PDFReceipt
      const normalizePaymentMethod = (method: string | undefined) => {
        if (!method) return 'cash';
        const methodLower = method.toLowerCase();
        if (methodLower.includes('cash') || methodLower.includes('espèces') || methodLower === 'cash') {
          return 'cash';
        }
        if (methodLower.includes('momo') || methodLower.includes('mtn') || methodLower === 'mtn_withdrawal') {
          return 'mtn_withdrawal';
        }
        return 'cash'; // Par défaut
      };

      // Récupérer le nom du comptable depuis HR (comme PDFReceipt)
      let accountantName = 'Comptable';
      try {
        const { hrService } = await import('../../services/hrService');
        const schoolId = schoolSettings?.id || 'school-1';
        const accountantInfo = await hrService.getAccountantInfo(schoolId);
        if (accountantInfo?.name) {
          accountantName = accountantInfo.name;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du comptable:', error);
      }

      // Construire les données exactement comme PDFReceipt
      const normalizedPaymentMethod = normalizePaymentMethod(payment?.paymentMethod || payment?.method);
      const processedReceiptData = {
        schoolName: schoolSettings?.name || payment?.schoolName || 'École',
        studentName: payment?.studentName || 'Non spécifié',
        studentClass: payment?.className || payment?.classLevel || payment?.class || payment?.studentData?.class || 'Non affecté',
        receiptNumber: payment?.receiptNumber || 'N/A',
        paymentDate: formatDate(payment?.paymentDate || payment?.date || new Date().toISOString()),
        paymentTime: formatTime(payment?.paymentTime || payment?.date || new Date().toISOString()),
        amount: payment?.amount || 0,
        paymentMethod: normalizedPaymentMethod,
        amountGiven: payment?.amountGiven || payment?.amount || 0,
        change: payment?.change || 0,
        totalExpected: payment?.totalExpected || payment?.studentData?.totalExpected || 0,
        totalPaid: payment?.totalPaid || payment?.studentData?.totalPaid || 0,
        totalRemaining: payment?.totalRemaining || payment?.studentData?.totalRemaining || 0,
        schoolPhone: schoolSettings?.primaryPhone || payment?.schoolPhone || 'Non configuré',
        schoolEmail: schoolSettings?.primaryEmail || payment?.schoolEmail || 'Non configuré',
        accountantName: accountantName
      };

      // Log des données finales pour débogage (comme PDFReceipt)
      console.log('✅ generateReceiptImage - Données finales:', {
        schoolName: processedReceiptData.schoolName,
        schoolPhone: processedReceiptData.schoolPhone,
        schoolEmail: processedReceiptData.schoolEmail,
        studentClass: processedReceiptData.studentClass,
        accountantName: processedReceiptData.accountantName,
        schoolSettings: schoolSettings,
        payment: payment
      });
      
      // Fond blanc
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Bordure autour de la page
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(15, 15, canvasWidth - 30, canvasHeight - 30);
      
      // Filigrane - Logo de l'école ou "PAYÉ"
      ctx.save();
      ctx.globalAlpha = 0.15;
      
      if (schoolLogo && schoolLogo.startsWith('data:image/')) {
        try {
          // Créer une promesse pour charger l'image
          const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => resolve(img);
              img.onerror = reject;
              img.src = src;
            });
          };
          
          // Charger l'image de manière synchrone
          const img = await loadImage(schoolLogo);
          ctx.drawImage(img, canvasWidth/2 - 75, canvasHeight/2 - 75, 150, 150);
        } catch (error) {
          console.log('Erreur de chargement du logo filigrane, fallback vers PAYÉ');
          // Fallback vers "PAYÉ"
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 60px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.translate(canvasWidth / 2, canvasHeight / 2);
          ctx.rotate(-Math.PI / 4);
          ctx.fillText('PAYÉ', 0, 0);
        }
      } else {
        // Fallback vers "PAYÉ"
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(canvasWidth / 2, canvasHeight / 2);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText('PAYÉ', 0, 0);
      }
      
      ctx.restore();
      
      // En-tête avec fond coloré (comme PDFReceipt)
      ctx.fillStyle = primaryColor;
      ctx.fillRect(20, 20, canvasWidth - 40, 40);
      
      // Titre
      ctx.fillStyle = backgroundColor;
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('REÇU DE PAIEMENT', canvasWidth / 2, 35);
      
      // Nom de l'école
      ctx.font = 'bold 8px Arial';
      ctx.fillText(processedReceiptData.schoolName, canvasWidth / 2, 50);
      
      // Contacts de l'école sur une ligne (avec espacement du bord)
      ctx.font = '6px Arial';
      ctx.fillText(`Tel: ${processedReceiptData.schoolPhone}`, canvasWidth / 2 - 50, 58);
      ctx.fillText(`Email: ${processedReceiptData.schoolEmail}`, canvasWidth / 2 + 50, 58);
      
      // Ligne de séparation
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(25, 70);
      ctx.lineTo(canvasWidth - 25, 70);
      ctx.stroke();
      
      // Informations élève
      let y = 80;
      ctx.fillStyle = primaryColor; // Couleur primaire comme PDFReceipt
      ctx.font = 'bold 7px Arial';
      ctx.textAlign = 'left';
      
      // Section Informations élève
      ctx.fillText('INFORMATIONS ÉLÈVE', 25, y);
      y += 12;
      
      // InfoRow avec layout space-between comme PDFReceipt
      ctx.font = '6px Arial';
      ctx.fillStyle = '#374151'; // Couleur des labels
      ctx.fillText('Nom et prénoms:', 25, y);
      ctx.fillStyle = '#111827'; // Couleur des valeurs
      ctx.fillText(processedReceiptData.studentName, 25 + 80, y);
      y += 8;
      
      ctx.fillStyle = '#374151';
      ctx.fillText('Classe:', 25, y);
      ctx.fillStyle = '#111827';
      ctx.fillText(processedReceiptData.studentClass, 25 + 80, y);
      y += 12;
      
      // Ligne de séparation
      ctx.strokeStyle = primaryColor; // Couleur primaire comme PDFReceipt
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(25, y);
      ctx.lineTo(canvasWidth - 25, y);
      ctx.stroke();
      y += 12;
      
      // Layout en deux colonnes côte à côte (format A6 paysage)
      const leftColumnX = 25;
      const rightColumnX = canvasWidth / 2 + 10;
      const columnWidth = (canvasWidth - 50) / 2 - 10;
      
      // Colonne gauche - Détails du paiement
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 7px Arial';
      ctx.fillText('DÉTAILS DU PAIEMENT', leftColumnX, y);
      
      // Colonne droite - Bilan de scolarité (même niveau)
      ctx.fillText('BILAN DE SCOLARITÉ', rightColumnX, y);
      y += 12;
      
      // Colonne gauche - Détails du paiement
      let leftY = y;
      ctx.font = '6px Arial';
      ctx.fillStyle = '#374151';
      ctx.fillText('N° Reçu:', leftColumnX, leftY);
      ctx.fillStyle = '#111827';
      ctx.fillText(processedReceiptData.receiptNumber, leftColumnX + 60, leftY);
      leftY += 8;
      
      ctx.fillStyle = '#374151';
      ctx.fillText('Date:', leftColumnX, leftY);
      ctx.fillStyle = '#111827';
      ctx.fillText(`${processedReceiptData.paymentDate} à ${processedReceiptData.paymentTime}`, leftColumnX + 60, leftY);
      leftY += 8;
      
      ctx.fillStyle = '#374151';
      ctx.fillText('Montant:', leftColumnX, leftY);
      ctx.fillStyle = primaryColor; // Montant en couleur primaire
      ctx.font = 'bold 6px Arial';
      ctx.fillText(`${formatAmount(processedReceiptData.amount)} F CFA`, leftColumnX + 60, leftY);
      leftY += 8;
      
      ctx.font = '6px Arial';
      ctx.fillStyle = '#374151';
      ctx.fillText('Méthode:', leftColumnX, leftY);
      ctx.fillStyle = '#111827';
      ctx.fillText(processedReceiptData.paymentMethod === 'cash' ? 'Espèces' : 'MoMo MTN', leftColumnX + 60, leftY);
      leftY += 8;
      
      if (processedReceiptData.paymentMethod === 'cash' && processedReceiptData.amountGiven && processedReceiptData.amountGiven > 0) {
        ctx.fillStyle = '#374151';
        ctx.fillText('Somme remise:', leftColumnX, leftY);
        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 6px Arial';
        ctx.fillText(`${formatAmount(processedReceiptData.amountGiven)} F CFA`, leftColumnX + 60, leftY);
        leftY += 8;
        
        ctx.font = '6px Arial';
        ctx.fillStyle = '#374151';
        ctx.fillText('Reliquat:', leftColumnX, leftY);
        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 6px Arial';
        ctx.fillText(`${formatAmount(processedReceiptData.change)} F CFA`, leftColumnX + 60, leftY);
        leftY += 8;
      }
      
      // Colonne droite - Bilan de scolarité (même niveau que la colonne gauche)
      let rightY = y;
      ctx.font = '6px Arial';
      ctx.fillStyle = '#374151';
      ctx.fillText('Total attendu:', rightColumnX, rightY);
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 6px Arial';
      ctx.fillText(`${formatAmount(processedReceiptData.totalExpected)} F CFA`, rightColumnX + 60, rightY);
      rightY += 8;
      
      ctx.font = '6px Arial';
      ctx.fillStyle = '#374151';
      ctx.fillText('Total versé:', rightColumnX, rightY);
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 6px Arial';
      ctx.fillText(`${formatAmount(processedReceiptData.totalPaid + processedReceiptData.amount)} F CFA`, rightColumnX + 60, rightY);
      rightY += 8;
      
      ctx.font = '6px Arial';
      ctx.fillStyle = '#374151';
      ctx.fillText('Restant à payer:', rightColumnX, rightY);
      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 6px Arial';
      ctx.fillText(`${formatAmount(Math.max(0, processedReceiptData.totalRemaining - processedReceiptData.amount))} F CFA`, rightColumnX + 60, rightY);
      
      // Utiliser la position la plus basse des deux colonnes
      y = Math.max(leftY, rightY);
      
      // Signature du comptable (comme PDFReceipt)
      y = Math.max(y, 160);
      
      // Ligne pointillée en couleur secondaire
      ctx.strokeStyle = secondaryColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]); // Ligne pointillée comme PDFReceipt
      ctx.beginPath();
      ctx.moveTo(25, y);
      ctx.lineTo(canvasWidth - 25, y);
      ctx.stroke();
      ctx.setLineDash([]); // Reset
      y += 10; // paddingTop: 10 comme PDFReceipt
      
      ctx.font = '7px Arial';
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'center';
      ctx.fillText('Signature du comptable :', canvasWidth / 2, y);
      y += 12;
      
      // Charger la police Signatura Monoline pour la signature
      const signatureFont = new FontFace('SignaturaMonoline', 'url(/fonts/signatura-monoline/Signatura Monoline.ttf)');
      
      try {
        await signatureFont.load();
        document.fonts.add(signatureFont);
        console.log('Police Signatura Monoline chargée avec succès');
      } catch (error) {
        console.log('Erreur de chargement de la police Signatura Monoline, utilisation d\'Arial:', error);
      }
      
      // Police manuscrite Signatura Monoline (style "Marie")
      ctx.font = 'bold 15px SignaturaMonoline, cursive'; // Police manuscrite Signatura Monoline
      ctx.fillStyle = '#000000';
      ctx.fillText(processedReceiptData.accountantName, canvasWidth / 2, y);
      y += 20;
      
      // Pied de page (comme PDFReceipt)
      ctx.font = 'bold 8px Arial';
      ctx.fillStyle = '#059669';
      ctx.fillText('Paiement enregistré avec succès !', canvasWidth / 2, y);
      y += 8;
      
      ctx.font = '7px Arial';
      ctx.fillStyle = '#374151';
      ctx.fillText('Merci pour votre confiance !', canvasWidth / 2, y);
      y += 8;
      
      ctx.font = '5px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`Généré par Academia Hub, le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, canvasWidth / 2, y);
      
      // Cachet électronique (format A6 paysage) - plus petit et plus haut
      const stampX = canvasWidth - 100; // right: 20, largeur réduite
      const stampY = canvasHeight - 90; // poussé vers le haut (plus d'espace du bord)
      const stampWidth = 80; // largeur réduite
      const stampHeight = 50; // height: 50
      
      // Sauvegarder le contexte pour la rotation
      ctx.save();
      
      // Appliquer la rotation (-2deg comme PDFReceipt)
      ctx.translate(stampX + stampWidth/2, stampY + stampHeight/2);
      ctx.rotate(-2 * Math.PI / 180);
      
      // Fond du cachet avec coins arrondis
      ctx.fillStyle = '#ffffff';
      const cornerRadius = 8; // Rayon des coins arrondis
      ctx.beginPath();
      ctx.roundRect(-stampWidth/2, -stampHeight/2, stampWidth, stampHeight, cornerRadius);
      ctx.fill();
      
      // Bordure du cachet (4px solid #dc2626) avec coins arrondis
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(-stampWidth/2, -stampHeight/2, stampWidth, stampHeight, cornerRadius);
      ctx.stroke();
      
      // Bordure intérieure (inset 0 0 0 3px #dc2626) avec coins arrondis
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-stampWidth/2 + 3, -stampHeight/2 + 3, stampWidth - 6, stampHeight - 6, cornerRadius - 2);
      ctx.stroke();
      
      // Texte "PAYÉ" (adapté à la largeur réduite)
      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 16px Arial'; // Taille réduite pour s'adapter
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAYÉ', 0, -5);
      
      // Date du cachet (fontSize: 5, #dc2626)
      ctx.font = '5px Arial';
      ctx.fillText(processedReceiptData.paymentDate, 0, 10);
      
      // Restaurer le contexte
      ctx.restore();
      
      // Convertir le canvas en image HD
      const imageDataUrl = canvas.toDataURL('image/png', 1.0);
      
      console.log('✅ Image du reçu générée avec succès');
      return imageDataUrl;
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération de l\'image:', error);
      return null;
    }
  };

  const sendNotificationSMS = async () => {
    if (!selectedStudent) {
      console.log('❌ Aucun élève sélectionné pour l\'envoi de SMS');
      return;
    }
    
    console.log('🔍 Vérification des conditions SMS:');
    console.log('- sendSMSNotification:', sendSMSNotification);
    console.log('- selectedStudent:', selectedStudent);
    console.log('- electronMtnSmsService configuré:', electronMtnSmsService.isConfigured());
    
    // Récupérer le numéro de téléphone parent (même logique que WhatsApp)
    const parentPhone = selectedStudent.parentPhone || selectedStudent.phone || selectedStudent.contactPhone;
    console.log('- parentPhone récupéré:', parentPhone);
    
    if (!parentPhone) {
      console.log('❌ Aucun numéro de téléphone parent trouvé');
      addToast({
        title: 'SMS non envoyé',
        message: 'Aucun numéro de téléphone parent trouvé pour cet élève.',
        type: 'warning'
      });
      return;
    }
    
    // Récupérer le numéro de téléphone de l'école (même logique que WhatsApp)
    let currentSchoolPhone = schoolPhone;
    
    if (!currentSchoolPhone) {
      // Essayer de recharger les paramètres de l'école
      try {
        const schoolSettings = await api.school.getSettings();
        if (schoolSettings) {
          currentSchoolPhone = schoolSettings.primaryPhone;
          console.log('✅ Numéro de téléphone de l\'école rechargé:', currentSchoolPhone);
        }
      } catch (error) {
        console.error('❌ Erreur lors du rechargement des paramètres de l\'école:', error);
      }
    }
    
    if (!currentSchoolPhone) {
      console.log('❌ Numéro de téléphone de l\'école non configuré');
      addToast({
        title: 'SMS non envoyé',
        message: 'Numéro de téléphone de l\'école non configuré.',
        type: 'warning'
      });
      return;
    }
    
    // Envoyer SMS via MTN si activé
    if (sendSMSNotification) {
      try {
        console.log('📱 Envoi SMS via MTN...');
        console.log('📱 Depuis l\'école:', currentSchoolPhone);
        console.log('📱 Vers le parent:', parentPhone);
        
        await electronMtnSmsService.sendPaymentNotificationSMS({
          parentPhone: parentPhone,
          studentName: selectedStudent.studentName || selectedStudent.name,
          amount: paymentAmount || 0,
          receiptNumber: receiptNumber,
          schoolName: schoolName || 'École',
          transactionId: `PAY-${receiptNumber}`,
          amountGiven: amountGiven || paymentAmount || 0,
          change: change || 0,
          totalExpected: selectedStudent.totalExpected || 0,
          totalPaid: (selectedStudent.totalPaid || 0) + (paymentAmount || 0),
          totalRemaining: (selectedStudent.totalRemaining || 0) - (paymentAmount || 0)
        });
        console.log('✅ SMS envoyé avec succès');
        
        addToast({
          title: 'SMS envoyé',
          message: `Notification SMS envoyée au parent (${parentPhone})`,
          type: 'success'
        });
      } catch (error) {
        console.error('❌ Erreur envoi SMS:', error);
        addToast({
          title: 'Erreur SMS',
          message: 'Impossible d\'envoyer le SMS. Vérifiez la configuration MTN.',
          type: 'error'
        });
      }
    } else {
      console.log('❌ SMS désactivé par l\'utilisateur');
    }
    
    // Recharger tous les paramètres de l'école pour s'assurer qu'ils sont à jour
    let currentSchoolSettings = {
      name: schoolName,
      phone: schoolPhone,
      secondaryPhone: schoolSecondaryPhone,
      email: schoolEmail,
      website: schoolWebsite,
      address: schoolAddress,
      whatsapp: schoolWhatsAppNumber
    };
    
    try {
      const schoolSettings = await api.school.getSettings();
      console.log('🔍 Paramètres de l\'école récupérés pour notification:', schoolSettings);
      
      if (schoolSettings) {
        currentSchoolSettings = {
          name: schoolSettings.name || schoolName,
          phone: schoolSettings.primaryPhone || schoolPhone,
          secondaryPhone: schoolSettings.secondaryPhone || schoolSecondaryPhone,
          email: schoolSettings.primaryEmail || schoolEmail,
          website: schoolSettings.website || schoolWebsite,
          address: schoolSettings.address || schoolAddress,
          whatsapp: schoolSettings.whatsapp || schoolWhatsAppNumber
        };
        
        // Mettre à jour les états si nécessaire
        if (schoolSettings.name && schoolSettings.name !== schoolName) {
          setSchoolName(schoolSettings.name);
        }
        if (schoolSettings.primaryPhone && schoolSettings.primaryPhone !== schoolPhone) {
          setSchoolPhone(schoolSettings.primaryPhone);
        }
        if (schoolSettings.secondaryPhone && schoolSettings.secondaryPhone !== schoolSecondaryPhone) {
          setSchoolSecondaryPhone(schoolSettings.secondaryPhone);
        }
        if (schoolSettings.primaryEmail && schoolSettings.primaryEmail !== schoolEmail) {
          setSchoolEmail(schoolSettings.primaryEmail);
        }
        if (schoolSettings.website && schoolSettings.website !== schoolWebsite) {
          setSchoolWebsite(schoolSettings.website);
        }
        if (schoolSettings.address && schoolSettings.address !== schoolAddress) {
          setSchoolAddress(schoolSettings.address);
        }
        if (schoolSettings.whatsapp && schoolSettings.whatsapp !== schoolWhatsAppNumber) {
          setSchoolWhatsAppNumber(schoolSettings.whatsapp);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du rechargement des paramètres de l\'école:', error);
    }
    
    // Données pour la génération de l'image du reçu
    const receiptImageData = {
      schoolName: currentSchoolSettings.name,
      studentMatricule: selectedStudent.matricule,
      studentName: selectedStudent.name,
      studentClass: selectedStudent.class,
      receiptNumber: receiptNumber,
      paymentDate: `${paymentDate} à ${paymentTime}`,
      amount: formatAmount(paymentAmount || 0),
      paymentMethod: paymentMethod === 'cash' ? 'Espèces' : 'MoMo MTN',
      amountGiven: amountGiven ? formatAmount(amountGiven) : null,
      change: change ? formatAmount(change) : null,
      totalExpected: formatAmount(selectedStudent.totalExpected),
      totalPaid: formatAmount((selectedStudent.totalPaid || 0) + (paymentAmount || 0)),
      totalRemaining: formatAmount((selectedStudent.totalRemaining || 0) - (paymentAmount || 0)),
      schoolPhone: currentSchoolSettings.phone,
      schoolEmail: currentSchoolSettings.email
    };

    // Récupérer le logo de l'école depuis les paramètres
    let schoolLogoUrl = null;
    try {
      const schoolSettings = await api.school.getSettings();
      if (schoolSettings?.logo) {
        schoolLogoUrl = schoolSettings.logo;
        console.log('🏫 Logo de l\'école récupéré:', schoolLogoUrl);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer le logo de l\'école:', error);
    }

    // Récupérer les couleurs de l'école
    let schoolColors = null;
    try {
      const schoolSettings = await api.school.getSettings();
      if (schoolSettings?.primaryColor || schoolSettings?.secondaryColor) {
        schoolColors = {
          primaryColor: schoolSettings.primaryColor,
          secondaryColor: schoolSettings.secondaryColor
        };
        console.log('🎨 Couleurs de l\'école récupérées:', schoolColors);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer les couleurs de l\'école:', error);
    }

    // Construire les données de paiement pour generateReceiptImage
    const paymentDataForImage = {
      studentName: selectedStudent.studentName || selectedStudent.name,
      className: selectedStudent.class || selectedStudent.className,
      classLevel: selectedStudent.classLevel,
      studentData: selectedStudent.studentData,
      receiptNumber: receiptNumber,
      paymentDate: paymentDate,
      paymentTime: paymentTime,
      amount: paymentAmount,
      paymentMethod: paymentMethod,
      amountGiven: amountGiven,
      change: change,
      totalExpected: selectedStudent.totalExpected,
      totalPaid: selectedStudent.totalPaid,
      totalRemaining: selectedStudent.totalRemaining,
      schoolName: currentSchoolSettings.name,
      schoolPhone: currentSchoolSettings.phone,
      schoolEmail: currentSchoolSettings.email
    };

    // Générer l'image du reçu avec les données construites
    const receiptImage = await generateReceiptImage(paymentDataForImage, schoolLogoUrl || undefined, {
      ...schoolColors,
      name: currentSchoolSettings.name,
      primaryPhone: currentSchoolSettings.phone,
      primaryEmail: currentSchoolSettings.email
    });
    
    // Contenu du reçu de paiement
    const receiptContent = `
*REÇU DE PAIEMENT*
*${currentSchoolSettings.name || 'École'}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*INFORMATIONS ÉLÈVE*
• *Nom et prénoms:* ${selectedStudent.name}
• *Classe:* ${selectedStudent.class}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*DÉTAILS DU PAIEMENT*
• *N° Reçu:* ${receiptNumber}
• *Date:* ${paymentDate} à ${paymentTime}
• *Montant:* ${formatAmount(paymentAmount || 0)} F CFA
• *Méthode:* ${paymentMethod === 'cash' ? 'Espèces' : 'MoMo MTN'}${paymentMethod === 'cash' && amountGiven ? `
• *Somme remise:* ${formatAmount(amountGiven)} F CFA
• *Reliquat:* ${formatAmount(change || 0)} F CFA` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*BILAN DE SCOLARITÉ*
• *Total attendu:* ${formatAmount(selectedStudent.totalExpected)} F CFA
• *Total versé:* ${formatAmount((selectedStudent.totalPaid || 0) + (paymentAmount || 0))} F CFA
• *Restant à payer:* ${formatAmount((selectedStudent.totalRemaining || 0) - (paymentAmount || 0))} F CFA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*CONTACT ÉCOLE*
• *Téléphone:* ${currentSchoolSettings.phone || ''}${currentSchoolSettings.phone && currentSchoolSettings.secondaryPhone ? ' / ' : ''}${currentSchoolSettings.secondaryPhone || ''}
• *Email:* ${currentSchoolSettings.email || 'Non configuré'}
${currentSchoolSettings.website ? `• *Site web:* ${currentSchoolSettings.website}` : ''}
${currentSchoolSettings.address ? `• *Adresse:* ${currentSchoolSettings.address}` : ''}
${currentSchoolSettings.whatsapp ? `• *WhatsApp:* ${currentSchoolSettings.whatsapp}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*Paiement enregistré avec succès !*
*Merci pour votre confiance !*

*Généré par Academia Hub, le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}*
    `.trim();
    
    try {
      // Formater le numéro de téléphone du parent pour WhatsApp
      const formattedParentPhone = formatPhoneForWhatsApp(selectedStudent.parentPhone);
      
      if (!formattedParentPhone) {
        throw new Error('Numéro de téléphone du parent non disponible');
      }
      
      // Vérifier que le numéro WhatsApp de l'école est disponible
      let currentSchoolWhatsApp = schoolWhatsAppNumber;
      
      if (!currentSchoolWhatsApp) {
        // Essayer de recharger les paramètres de l'école
        try {
          const schoolSettings = await api.school.getSettings();
          if (schoolSettings?.whatsapp) {
            currentSchoolWhatsApp = schoolSettings.whatsapp;
            console.log('✅ Numéro WhatsApp de l\'école rechargé dans sendSMSNotification:', currentSchoolWhatsApp);
          }
        } catch (error) {
          console.error('❌ Erreur lors du rechargement des paramètres de l\'école:', error);
        }
      }
      
      if (!currentSchoolWhatsApp) {
        throw new Error('Numéro WhatsApp de l\'école non configuré');
      }
      
      // Formater le numéro WhatsApp de l'école
      const formattedSchoolWhatsApp = formatPhoneForWhatsApp(currentSchoolWhatsApp);
      
      console.log('📱 Envoi depuis l\'école:', formattedSchoolWhatsApp);
      console.log('📱 Vers le parent:', formattedParentPhone);
      
      // Envoi par SMS géré par le service MTN SMS
      console.log('✅ SMS géré par le service MTN SMS');
      
      // Envoi par WhatsApp (depuis l'école vers le parent)
      await sendWhatsApp(formattedParentPhone, receiptContent, formattedSchoolWhatsApp, receiptImage ?? undefined);
      console.log('✅ WhatsApp envoyé avec succès depuis l\'école vers le parent');
      
      // Afficher un toast d'information pour l'envoi des notifications
      addToast({
        title: 'Notification envoyée',
        message: `Reçu envoyé automatiquement par WhatsApp au parent (${formattedParentPhone})`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications:', error);
      // En cas d'erreur, on continue quand même le processus de paiement
      
      // Afficher un toast d'avertissement pour l'échec des notifications
      addToast({
        title: 'Avertissement',
        message: 'Paiement enregistré mais échec de l\'envoi des notifications',
        type: 'warning'
      });
    }
  };

  // Fonction sendSMS supprimée - remplacée par le service MTN SMS


  const sendWhatsApp = async (phoneNumber: string, message: string, senderNumber?: string, imageDataUrl?: string | null) => {
    console.log('📱 Ouverture WhatsApp depuis:', senderNumber || 'École');
    console.log('📱 Ouverture WhatsApp vers:', phoneNumber);
    console.log('📝 Message:', message);
    
    try {
      // Si une image est fournie, essayer de la copier dans le presse-papiers
      if (imageDataUrl) {
        console.log('🖼️ Image du reçu générée - tentative de copie dans le presse-papiers...');
        
        try {
          // Convertir l'image en blob
          const response = await fetch(imageDataUrl);
          const blob = await response.blob();
          
          // Créer un objet ClipboardItem
          const clipboardItem = new ClipboardItem({
            'image/png': blob
          });
          
          // Copier dans le presse-papiers
          await navigator.clipboard.write([clipboardItem]);
          
          console.log('✅ Image copiée dans le presse-papiers');
          
          // Ouvrir WhatsApp d'abord
          const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          window.open(whatsappLink, '_blank');
          
          // Pas de toast ici - déjà affiché après validation
          
        } catch (clipboardError) {
          console.warn('⚠️ Impossible de copier dans le presse-papiers, téléchargement manuel...', clipboardError);
          
          // Fallback : télécharger l'image
          const link = document.createElement('a');
          link.href = imageDataUrl;
          link.download = `recu-paiement-${receiptNumber || 'receipt'}.png`;
          link.click();
          
          // Ouvrir WhatsApp d'abord
          const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
          
          // Pas de toast ici - déjà affiché après validation
        }
        
      } else {
        // Pas d'image, utiliser le lien normal
        const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, '_blank');
      }
    
    // Sauvegarder le numéro WhatsApp de l'école si nécessaire
    if (schoolWhatsAppNumber && schoolWhatsAppNumber !== savedSchoolWhatsAppNumber) {
      setSavedSchoolWhatsAppNumber(schoolWhatsAppNumber);
      localStorage.setItem('schoolWhatsAppNumber', schoolWhatsAppNumber);
    }
    
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ WhatsApp ouvert dans un nouvel onglet');
      return { success: true, message: 'WhatsApp ouvert - vous pouvez choisir l\'application ou le web' };
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'ouverture WhatsApp:', error);
      throw error;
    }
  };

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Fonction pour recalculer le bilan de scolarité d'un élève
  const recalculateStudentBalance = async (studentId: string) => {
    try {
      console.log('🔄 Recalcul du bilan pour l\'élève:', studentId);
      setIsUpdatingBalance(true);
      
      try {
        const result = await api.finance.getStudentBalance(studentId, 'academic-year-2025-2026');
        if (result.data) {
          const balanceData = result.data?.data || result.data;
          console.log('✅ Bilan recalculé pour l\'élève:', balanceData);
          
          // Mettre à jour l'élève sélectionné avec les nouvelles données
          // Trouver l'élève dans la liste des élèves filtrés
          const currentStudent = filteredStudents.find((s: any) => s.id === studentId);
          if (currentStudent) {
            const updatedStudent = {
              ...currentStudent,
              totalExpected: balanceData.totalExpected || 0,
              totalPaid: balanceData.totalPaid || 0,
              totalRemaining: balanceData.totalRemaining || 0
            };
            
            console.log('📊 Mise à jour de l\'élève sélectionné:', updatedStudent);
            setSelectedStudent(updatedStudent);
            
            // Ajuster le montant de paiement si nécessaire
            const currentPaymentAmount = paymentAmount || 0;
            const maxPaymentAmount = updatedStudent.totalRemaining || 0;
            if (currentPaymentAmount > maxPaymentAmount) {
              setPaymentAmount(maxPaymentAmount);
            }
            
            console.log('✅ Bilan mis à jour dans le modal');
          } else {
            console.warn('⚠️ Élève non trouvé dans la liste filtrée:', studentId);
          }
        } else {
          console.error('❌ Erreur lors de la récupération du bilan:', result.error);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du recalcul du bilan:', error);
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
        </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Encaissement des frais de scolarité
                  </h2>
                  <p className="text-green-100 text-sm">
                    Enregistrez les paiements des élèves et gérez les encaissements
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
        <form id="school-fees-payment-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection de l'élève */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Sélection de l'élève
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <span>Choisissez l'élève pour lequel effectuer l'encaissement</span>
              {(studentsLoading || classesLoading) && (
                    <span className="ml-2 inline-flex items-center">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </span>
              )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {/* Sélecteur de classe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline-block w-4 h-4 mr-2" />
                  Classe
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => {
                    setSelectedClassId(e.target.value);
                    setSelectedStudentId('');
                    setSelectedStudent(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={classesLoading}
                  title="Sélectionner une classe pour filtrer les élèves"
                >
                  <option value="">
                    {classesLoading 
                      ? 'Chargement des classes...' 
                      : 'Toutes les classes'}
                  </option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} {cls.level ? `(${cls.level})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recherche d'élève */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <User className="inline-block w-4 h-4 mr-2" />
                  Rechercher un élève
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher par nom, N° Educmaster, classe ou parent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
                <select
                  value={selectedStudentId}
                  onChange={async (e) => {
                    const studentId = e.target.value;
                    setSelectedStudentId(studentId);
                    const student = filteredStudents.find((s: any) => s.id === studentId);
                    setSelectedStudent(student || null);
                    
                    // Fermer le modal d'information quand un nouvel élève est sélectionné
                    setShowFullyPaidModal(false);
                    
                    if (student) {
                      setPaymentAmount(Math.min(amount || 0, student.totalRemaining));
                      
                      // Recalculer le bilan de scolarité pour s'assurer que les données sont à jour
                      await recalculateStudentBalance(studentId);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={filteredStudents.length === 0 || studentsLoading}
                  aria-label="Sélectionner un élève pour le paiement des frais"
                  title="Sélectionner un élève pour le paiement des frais"
                >
                  <option value="">
                    {studentsLoading 
                      ? 'Chargement des élèves...'
                      : filteredStudents.length === 0 
                      ? 'Aucun élève trouvé' 
                      : filteredStudents.length === allStudents.length 
                        ? 'Sélectionner un élève' 
                        : `${filteredStudents.length} élève(s) trouvé(s)`}
                  </option>
                  {filteredStudents.map((student: any) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.class} (N° Educmaster: {student.matricule})
                    </option>
                  ))}
                </select>
                {selectedClassId && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Filtrage par classe : {classes.find((cls: any) => cls.id === selectedClassId)?.name || 'Classe sélectionnée'}
                  </p>
                )}
              </div>
            </div>
          </div>


          {/* Informations de l'élève (chargées après sélection) */}
          {selectedStudent && (
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                Informations de l'élève
              </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    Détails personnels et académiques de l'élève sélectionné
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Informations personnelles</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Nom complet:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date de naissance:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedStudent.dateOfBirth && selectedStudent.dateOfBirth.trim() !== '' && selectedStudent.dateOfBirth !== 'Non assigné' ? 
                          (() => {
                            try {
                              const date = new Date(selectedStudent.dateOfBirth);
                              // Vérifier si la date est valide
                              if (isNaN(date.getTime())) {
                                return selectedStudent.dateOfBirth;
                              }
                              return date.toLocaleDateString('fr-FR');
                            } catch (error) {
                              console.log('Erreur formatage date:', error, 'Date originale:', selectedStudent.dateOfBirth);
                              return selectedStudent.dateOfBirth;
                            }
                          })() 
                          : 'Non renseignée'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Parent/Tuteur:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Téléphone parent:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.parentPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Email parent:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.parentEmail || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Adresse parent:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.address}</span>
                    </div>
                  </div>
                </div>
                
                {/* Informations académiques */}
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Informations académiques</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">N° Educmaster:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.matricule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Classe:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.class}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Année scolaire:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{selectedStudent.schoolYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Frais scolaires */}
          {selectedStudent && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                Frais scolaires
              </h4>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex justify-center items-center gap-32">
                  {/* Frais d'inscription (visible si nouvel élève) */}
                  {selectedStudent.seniority === 'new' && (
                    <div className="text-center">
                      <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Frais d'inscription</div>
                      <div className="text-lg font-bold text-orange-900 dark:text-orange-200">
                        {formatAmount(selectedStudent.inscriptionFee || 0)} F CFA
                      </div>
                    </div>
                  )}
                  
                  {/* Frais de réinscription (visible si ancien élève) */}
                  {selectedStudent.seniority === 'old' && (
                    <div className="text-center">
                      <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Frais de réinscription</div>
                      <div className="text-lg font-bold text-orange-900 dark:text-orange-200">
                        {formatAmount(selectedStudent.reinscriptionFee || 0)} F CFA
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Scolarité</div>
                    <div className="text-lg font-bold text-orange-900 dark:text-orange-200">
                      {formatAmount(selectedStudent.tuitionFee || 0)} F CFA
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-700">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-orange-800 dark:text-orange-200">Total frais scolaires:</span>
                    <span className="text-xl font-bold text-orange-900 dark:text-orange-100">
                      {formatAmount(selectedStudent.totalSchoolFees || 0)} F CFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bilan scolarité */}
          {selectedStudent && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                Bilan scolarité
                {isUpdatingBalance && (
                  <div className="ml-2 w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </h4>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total attendu</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatAmount(selectedStudent.totalExpected)} F CFA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total versé</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatAmount(selectedStudent.totalPaid)} F CFA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total restant</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatAmount(selectedStudent.totalRemaining)} F CFA</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Paiement */}
          {selectedStudent && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg mr-3">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                Détails du paiement
              </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Configurez les informations de l'encaissement
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      N° Reçu (généré automatiquement)
                    </label>
                    <input
                      type="text"
                      id="receiptNumber"
                      value={receiptNumber || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date de paiement*
                      </label>
                      <input
                        type="date"
                        id="paymentDate"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="paymentTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Heure de paiement*
                      </label>
                      <input
                        type="time"
                        id="paymentTime"
                        value={paymentTime}
                        onChange={(e) => setPaymentTime(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Montant (F CFA)*
                    </label>
                    <input
                      type="number"
                      id="paymentAmount"
                      value={paymentAmount || 0}
                      onChange={(e) => handlePaymentAmountChange(parseInt(e.target.value) || 0)}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value > 0) {
                          validatePaymentAmount(value);
                        }
                      }}
                      max={selectedStudent?.totalRemaining || 0}
                      min="0"
                      required
                      disabled={(selectedStudent?.totalRemaining || 0) <= 0}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 ${
                        (selectedStudent?.totalRemaining || 0) <= 0 
                          ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-50' 
                          : 'bg-white dark:bg-gray-700'
                      }`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Maximum : {formatAmount(selectedStudent?.totalRemaining || 0)} F CFA
                    </p>
                  </div>
                  
                </div>
                
                {/* Méthode de paiement et détails */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Méthode de paiement*
                    </label>
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mtn_withdrawal')}
                        className={`w-20 h-20 rounded-l-lg border-2 border-r-0 flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'mtn_withdrawal'
                            ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                        }`}
                      >
                        <img 
                          src={mtnMomo} 
                          alt="MTN Mobile Money" 
                          className="w-12 h-8 mb-1 object-contain"
                        />
                        <span className="text-xs font-medium text-center">MoMo MTN</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`w-20 h-20 rounded-r-lg border-2 flex flex-col items-center justify-center transition-all ${
                          paymentMethod === 'cash'
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                        }`}
                      >
                        <img 
                          src={argentEspeces} 
                          alt="Argent en espèces" 
                          className="w-10 h-10 mb-1 object-contain"
                        />
                        <span className="text-xs font-medium text-center">Espèces</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Option d'envoi de SMS */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="sendSMS"
                      checked={sendSMSNotification}
                      onChange={(e) => setSendSMSNotification(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="sendSMS" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                      Envoyer SMS de confirmation au parent
                        </label>
                      </div>
                      
                  
                  
                  {/* Champs spécifiques Espèces */}
                  {paymentMethod === 'cash' && (
                    <>
                      <div>
                        <label htmlFor="amountGiven" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Somme remise (F CFA)*
                        </label>
                        <input
                          type="number"
                          id="amountGiven"
                          value={amountGiven || 0}
                          onChange={(e) => setAmountGiven(parseInt(e.target.value) || 0)}
                          min={paymentAmount || 0}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="change" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Reliquat (F CFA)
                        </label>
                        <input
                          type="number"
                          id="change"
                          value={change || 0}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Récapitulatif du paiement */}
          {selectedStudent && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-900/30">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Récapitulatif du paiement
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-300">Élève:</span>
                    <span className="font-bold text-blue-900 dark:text-blue-200">{selectedStudent.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-300">N° Reçu:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-200">{receiptNumber}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-300">Date et heure:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-200">{paymentDate} à {paymentTime}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-300">Méthode:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-200">
                      {paymentMethod === 'cash' ? 'Espèces' : 'MoMo MTN'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-300">Montant initial:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-200">{formatAmount(paymentAmount || 0)} F CFA</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-300">Montant net:</span>
                    <span className="font-bold text-blue-900 dark:text-blue-200">{formatAmount(paymentAmount || 0)} F CFA</span>
                  </div>
                  
                  {paymentMethod === 'cash' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-800 dark:text-blue-300">Somme remise:</span>
                        <span className="font-medium text-blue-900 dark:text-blue-200">{formatAmount(amountGiven || 0)} F CFA</span>
                      </div>
                      
                      {(change || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-800 dark:text-blue-300">Reliquat:</span>
                          <span className="font-bold text-green-600 dark:text-green-400">{formatAmount(change || 0)} F CFA</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}
          
          {/* Security Notice */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Toutes les transactions sont sécurisées et un reçu sera automatiquement généré.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Le reçu de paiement sera automatiquement envoyé par SMS et WhatsApp au parent d'élève.
                </p>
              </div>
            </div>
          </div>
        </form>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="school-fees-payment-form"
                disabled={isProcessing || !selectedStudent || (selectedStudent?.totalRemaining || 0) <= 0}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 ${
                  (selectedStudent?.totalRemaining || 0) <= 0
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    <span>Encaisser</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'information pour élève entièrement payé */}
      {showFullyPaidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Paiement Complet</h3>
                  <p className="text-green-100 text-sm">Aucun paiement requis</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Félicitations !
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  <strong>{selectedStudent?.name}</strong> a déjà payé tous ses frais de scolarité.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-medium">Solde : 0 F CFA</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Tous les frais de scolarité sont à jour</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Aucun paiement supplémentaire requis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>L'élève peut continuer ses études normalement</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowFullyPaidModal(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowFullyPaidModal(false);
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  Compris
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'erreur pour montant supérieur au maximum */}
      {showAmountErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Montant invalide</h3>
                  <p className="text-red-100 text-sm">Le montant saisi dépasse le maximum autorisé</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Attention !
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Le montant saisi <strong>{formatAmount(paymentAmount || 0)} F CFA</strong> est supérieur au montant restant à payer pour <strong>{selectedStudent?.name}</strong>.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-red-700 dark:text-red-300">Montant saisi :</span>
                      <span className="font-bold text-red-900 dark:text-red-200">{formatAmount(paymentAmount || 0)} F CFA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-700 dark:text-red-300">Montant maximum :</span>
                      <span className="font-bold text-red-900 dark:text-red-200">{formatAmount(selectedStudent?.totalRemaining || 0)} F CFA</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-red-200 dark:border-red-700 pt-2">
                      <span className="text-red-700 dark:text-red-300">Excédent :</span>
                      <span className="font-bold text-red-900 dark:text-red-200">
                        {formatAmount((paymentAmount || 0) - (selectedStudent?.totalRemaining || 0))} F CFA
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Le montant ne peut pas dépasser le solde restant de l'élève</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Veuillez saisir un montant inférieur ou égal à {formatAmount(selectedStudent?.totalRemaining || 0)} F CFA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Le montant sera automatiquement ajusté au maximum autorisé</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-2xl">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAmountErrorModal(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    // Ajuster le montant au maximum autorisé
                    setPaymentAmount(selectedStudent?.totalRemaining || 0);
                    setShowAmountErrorModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                >
                  Ajuster au maximum
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SchoolFeesPaymentModal;