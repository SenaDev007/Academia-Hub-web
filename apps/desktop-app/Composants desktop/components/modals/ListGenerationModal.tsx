import React, { useState, useEffect } from 'react';
import { X, Users, Download, Printer, Eye } from 'lucide-react';
import ListePDFModal from './ListePDFModal';
import { useSchoolSettings } from '../../hooks/useSchoolSettings';
import { api } from '../../lib/api/client';

interface ListGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: any) => void;
  students?: any[];
  classes?: any[];
}

const ListGenerationModal: React.FC<ListGenerationModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  students = [],
  classes = []
}) => {
  // Générer les années scolaires dynamiquement
  const getCurrentAcademicYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    
    // Si on est entre septembre et décembre, on est dans l'année scolaire en cours
    if (currentMonth >= 9) {
      return `${currentYear}-${currentYear + 1}`;
    } else {
      // Si on est entre janvier et août, on est dans l'année scolaire précédente
      return `${currentYear - 1}-${currentYear}`;
    }
  };

  const generateAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Générer 5 années : 2 précédentes, actuelle, 2 suivantes
    for (let i = -2; i <= 2; i++) {
      const year = currentYear + i;
      years.push(`${year}-${year + 1}`);
    }
    
    return years;
  };

  const [formData, setFormData] = useState({
    academicYear: getCurrentAcademicYear(),
    listType: 'class',
    classId: '',
    level: '',
    includePhoto: false,
    includeContact: false,
    sortBy: 'name',
    format: 'pdf'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const { settings: schoolSettings } = useSchoolSettings();

  const listTypes = [
    { value: 'class', label: 'Liste par classe' },
    { value: 'level', label: 'Liste par niveau' },
    { value: 'all', label: 'Liste générale' },
    { value: 'custom', label: 'Liste personnalisée' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Par nom' },
    { value: 'class', label: 'Par classe' },
    { value: 'level', label: 'Par niveau' },
    { value: 'age', label: 'Par âge' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'word', label: 'Word' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [listStudents, setListStudents] = useState<any[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);

  // Filtrer les classes selon l'année scolaire
  useEffect(() => {
    if (classes && formData.academicYear) {
      // Récupérer l'ID de l'année scolaire depuis la base de données
        const filterClassesByAcademicYear = async () => {
        try {
          // TODO: Utiliser un endpoint API spécifique pour récupérer l'année scolaire
          // Les requêtes SQL directes ne sont pas recommandées dans le Web SaaS
          try {
            // Utiliser un endpoint API dédié à la place
            throw new Error('Direct SQL queries are not allowed. Use specific API endpoints instead.');
            // const yearResult = await api.academicYears.getByName(formData.academicYear);
            
            console.log('🔍 Requête année scolaire:', {
              query: yearQuery,
              academicYear: formData.academicYear,
              result: yearResult
            });
            
            if (yearResult && yearResult.results && yearResult.results.length > 0) {
              const academicYearId = yearResult.results[0].id;
              console.log('🔍 Academic Year ID trouvé:', academicYearId, 'pour l\'année:', formData.academicYear);
              
              // TODO: Utiliser un endpoint API spécifique pour récupérer les classes par année scolaire
              // Les requêtes SQL directes ne sont pas recommandées dans le Web SaaS
              throw new Error('Direct SQL queries are not allowed. Use specific API endpoints instead.');
              // const classesByAcademicYearResult = await api.classes.getByAcademicYear(academicYearId);
              
              console.log('🔍 Classes par academicYearId:', {
                academicYearId,
                classesFound: classesByAcademicYearResult?.results?.length || 0,
                classes: classesByAcademicYearResult?.results
              });
              
              if (classesByAcademicYearResult && classesByAcademicYearResult.results && classesByAcademicYearResult.results.length > 0) {
                // Mapper les résultats de la requête vers le format attendu
                const filteredClasses = classesByAcademicYearResult.results.map((cls: any) => ({
                  id: cls.id,
                  name: cls.name,
                  level: cls.level,
                  academicYearId: cls.academicYearId,
                  schoolId: cls.schoolId
                }));
                
                console.log('🔍 Classes filtrées par academicYearId:', filteredClasses.length);
                setFilteredClasses(filteredClasses);
              } else {
                console.log('⚠️ Aucune classe trouvée avec academicYearId, vérification des classes disponibles...');
                
                // TODO: Utiliser un endpoint API spécifique pour récupérer toutes les classes
                // Les requêtes SQL directes ne sont pas recommandées dans le Web SaaS
                throw new Error('Direct SQL queries are not allowed. Use specific API endpoints instead.');
                // const allClassesResult = await api.classes.getAll();
                console.log('🔍 Toutes les classes disponibles:', {
                  total: allClassesResult?.results?.length || 0,
                  classes: allClassesResult?.results?.map((cls: any) => ({
                    name: cls.name,
                    academicYearId: cls.academicYearId
                  }))
                });
                
                // Si aucune classe trouvée pour cette année, vérifier si toutes les classes appartiennent à une autre année
                const uniqueAcademicYearIds = [...new Set(allClassesResult?.results?.map((cls: any) => cls.academicYearId))];
                console.log('🔍 AcademicYearIds uniques dans les classes:', uniqueAcademicYearIds);
                
                if (uniqueAcademicYearIds.length === 1) {
                  const existingAcademicYearId = uniqueAcademicYearIds[0];
                  console.log('⚠️ Toutes les classes appartiennent à l\'année:', existingAcademicYearId);
                  console.log('⚠️ Année demandée:', academicYearId);
                  
                  if (existingAcademicYearId === academicYearId) {
                    console.log('✅ Les classes correspondent à l\'année demandée - affichage de toutes les classes');
                    // Afficher toutes les classes car elles correspondent à l'année demandée
                    const allClasses = allClassesResult.results.map((cls: any) => ({
                      id: cls.id,
                      name: cls.name,
                      level: cls.level,
                      academicYearId: cls.academicYearId,
                      schoolId: cls.schoolId || 'school-1'
                    }));
                    setFilteredClasses(allClasses);
                    return;
                  } else {
                    console.log('⚠️ Aucune classe pour cette année scolaire - liste vide');
                    setFilteredClasses([]);
                    return;
                  }
                }
                
                console.log('⚠️ Essai avec les élèves...');
                
                // Fallback: essayer avec les élèves
                const classesWithStudentsQuery = `
                  SELECT DISTINCT c.id, c.name, c.level, c.academicYearId, c.schoolId
                  FROM classes c
                  INNER JOIN students s ON c.id = s.classId
                  WHERE s.academicYearId = ?
                  ORDER BY c.name
                `;
                
                const classesWithStudentsResult = await api.database.executeQuery(classesWithStudentsQuery, [academicYearId]);
                
                console.log('🔍 Classes avec élèves pour cette année:', {
                  academicYearId,
                  classesFound: classesWithStudentsResult?.results?.length || 0,
                  classes: classesWithStudentsResult?.results
                });
                
                if (classesWithStudentsResult && classesWithStudentsResult.results && classesWithStudentsResult.results.length > 0) {
                  // Mapper les résultats de la requête vers le format attendu
                  const filteredClasses = classesWithStudentsResult.results.map((cls: any) => ({
                    id: cls.id,
                    name: cls.name,
                    level: cls.level,
                    academicYearId: cls.academicYearId,
                    schoolId: cls.schoolId
                  }));
                  
                  console.log('🔍 Classes filtrées par élèves:', filteredClasses.length);
                  setFilteredClasses(filteredClasses);
                } else {
                  console.log('⚠️ Aucune classe trouvée avec des élèves pour cette année scolaire');
                  
                  // Vérifier s'il y a des élèves pour cette année
                  const allStudentsForYearQuery = `SELECT COUNT(*) as count FROM students WHERE academicYearId = ?`;
                  const allStudentsForYearResult = await api.database.executeQuery(allStudentsForYearQuery, [academicYearId]);
                  console.log('🔍 Total d\'élèves pour cette année:', allStudentsForYearResult?.results?.[0]?.count || 0);
                  
                  // Si il y a des élèves mais pas de classes trouvées, c'est un problème de jointure
                  if (allStudentsForYearResult?.results?.[0]?.count > 0) {
                    console.log('⚠️ Il y a des élèves pour cette année mais pas de classes trouvées - problème de jointure');
                    // Essayer une approche alternative: récupérer toutes les classes et laisser l'utilisateur choisir
                    setFilteredClasses(classes);
                  } else {
                    console.log('⚠️ Aucun élève trouvé pour cette année scolaire');
                    // Si vraiment aucun élève, prendre toutes les classes
                    setFilteredClasses(classes);
                  }
                }
              }
            } else {
              console.log('⚠️ Aucune année scolaire trouvée pour:', formData.academicYear);
              
              // Lister toutes les années scolaires disponibles pour débogage
              try {
                const allYearsQuery = 'SELECT id, name FROM academic_years ORDER BY name';
                const allYearsResult = await api.database.executeQuery(allYearsQuery, []);
                console.log('🔍 Toutes les années scolaires disponibles:', allYearsResult);
              } catch (debugError) {
                console.error('❌ Erreur lors de la récupération des années:', debugError);
              }
              
              // Si aucune année trouvée, prendre toutes les classes
              setFilteredClasses(classes);
            }
          } else {
            // Fallback: prendre toutes les classes
            setFilteredClasses(classes);
          }
        } catch (error) {
          console.error('❌ Erreur lors du filtrage des classes:', error);
          // En cas d'erreur, prendre toutes les classes
          setFilteredClasses(classes);
        }
      };
      
      filterClassesByAcademicYear();
    } else {
      // Si pas d'année sélectionnée, prendre toutes les classes
      setFilteredClasses(classes);
    }
  }, [classes, formData.academicYear]);

  // Réinitialiser la classe sélectionnée quand l'année scolaire change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      classId: ''
    }));
  }, [formData.academicYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // Récupérer les vraies données des élèves depuis la base de données
      let studentsData = [];
      
      // Utiliser l'API HTTP
      try {
        const result = await api.students.getAll();
        if (result && result.success && Array.isArray(result.data)) {
          let filteredStudents = result.data;
          
          // Filtrer selon le type de liste
          if (formData.listType === 'class' && formData.classId) {
            // Liste par classe spécifique
            filteredStudents = result.data.filter((student: any) => student.classId === formData.classId);
          } else if (formData.listType === 'level' && formData.level) {
            // Liste par niveau - filtrer par niveau de classe
            filteredStudents = result.data.filter((student: any) => {
              // Trouver la classe de l'élève pour vérifier son niveau
              const studentClass = classes.find(c => c.id === student.classId);
              return studentClass && studentClass.level === formData.level;
            });
          }
          // Si listType === 'all', on prend tous les élèves
          
          // Transformer les données
          studentsData = filteredStudents.map((student: any, index: number) => ({
            id: student.id,
            number: index + 1,
            firstName: student.firstName,
            lastName: student.lastName,
            gender: student.gender || 'M',
            birthDate: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('fr-FR') : 'Non spécifié',
            birthPlace: student.placeOfBirth || 'Non spécifié',
            status: student.seniority === 'new' ? 'Nouveau' : 'Ancien',
            academicStatus: student.academicStatus || 'Passant',
            photo: student.photo || student.avatar || '',
            parentPhone: student.parentPhone || student.parent_phone || ''
          }));
          
          console.log('🔍 Données des élèves filtrées:', {
            listType: formData.listType,
            classId: formData.classId,
            level: formData.level,
            totalStudents: studentsData.length
          });
          
          // Log des données transformées pour débogage
          if (studentsData.length > 0) {
            console.log('🔍 Premier élève (données transformées):', studentsData[0]);
            console.log('🔍 Photo transformée:', studentsData[0].photo);
            console.log('🔍 Téléphone parent transformé:', studentsData[0].parentPhone);
          }
          
          // Log des données brutes pour débogage
          if (filteredStudents.length > 0) {
            console.log('🔍 Premier élève (données brutes):', filteredStudents[0]);
            console.log('🔍 Colonnes disponibles:', Object.keys(filteredStudents[0]));
            console.log('🔍 Photo disponible:', filteredStudents[0].photo || filteredStudents[0].avatar);
            console.log('🔍 Téléphone parent:', filteredStudents[0].parentPhone || filteredStudents[0].parent_phone);
          }
        }
      }
      
      setListStudents(studentsData);
      setIsPDFModalOpen(true);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    console.log('Impression de la liste...');
    // Logique d'impression
  };

  const handleDownload = async () => {
    console.log('Téléchargement du PDF...');
    // Logique de téléchargement
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col border border-gray-200/20 dark:border-gray-700/50">
        {/* Header avec gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white rounded-t-3xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Génération de Liste</h2>
                  <p className="text-purple-100 text-lg">Créez une liste d'élèves personnalisée</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          {/* Décoration */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
          {/* Année scolaire - EN PREMIER */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Année scolaire *
            </label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Sélectionner une année</option>
              {generateAcademicYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Type de liste */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de liste *
            </label>
            <select
              name="listType"
              value={formData.listType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {listTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Classe (si applicable) */}
          {formData.listType === 'class' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Classe * 
                {filteredClasses.length !== classes.length && (
                  <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">
                    ({filteredClasses.length} classe{filteredClasses.length > 1 ? 's' : ''} pour {formData.academicYear})
                  </span>
                )}
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionner une classe</option>
                {filteredClasses.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              {filteredClasses.length === 0 && formData.academicYear && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  ⚠️ Aucune classe trouvée pour l'année scolaire {formData.academicYear}
                </p>
              )}
            </div>
          )}

          {/* Niveau (si applicable) */}
          {formData.listType === 'level' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Niveau *
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Sélectionner un niveau</option>
                <option value="maternelle">Maternelle</option>
                <option value="primaire">Primaire</option>
                <option value="1er-cycle-secondaire">1er cycle secondaire</option>
                <option value="2nd-cycle-secondaire">2nd cycle secondaire</option>
              </select>
            </div>
          )}


          {/* Tri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trier par
            </label>
            <select
              name="sortBy"
              value={formData.sortBy}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format de sortie
            </label>
            <select
              name="format"
              value={formData.format}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {formatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Options</h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="includePhoto"
                checked={formData.includePhoto}
                onChange={handleInputChange}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Inclure les photos des élèves
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="includeContact"
                checked={formData.includeContact}
                onChange={handleInputChange}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Inclure les informations de contact
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Générer la liste</span>
                </>
              )}
            </button>
          </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal PDF */}
      <ListePDFModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        onPrint={handlePrint}
        onDownload={handleDownload}
        listData={{
          title: formData.listType === 'class' ? 'Liste des élèves par classe' : 
                 formData.listType === 'level' ? 'Liste des élèves par niveau' : 
                 'Liste générale des élèves',
          academicYear: formData.academicYear,
          level: formData.level || 'Tous niveaux',
          className: formData.classId ? classes.find(c => c.id === formData.classId)?.name || 'Classe sélectionnée' : 'Toutes classes',
          includePhoto: formData.includePhoto,
          includeContact: formData.includeContact,
          students: listStudents
        }}
        schoolSettings={schoolSettings}
      />
    </div>
  );
};

export default ListGenerationModal;
