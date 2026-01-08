import React, { useState } from 'react';
import FormModal from './FormModal';
import { FileText, Download, Printer, Send, Star } from 'lucide-react';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: any;
}

const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  studentData
}) => {
  const [showPreview, setShowPreview] = useState(true);
  
  // Fonction pour obtenir la couleur basée sur la note
  const getGradeColor = (grade: number) => {
    if (grade >= 16) return 'text-green-600 dark:text-green-400';
    if (grade >= 14) return 'text-blue-600 dark:text-blue-400';
    if (grade >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Fonction pour obtenir l'appréciation basée sur la note
  const getAppreciation = (grade: number) => {
    if (grade >= 18) return { mention: 'Excellent', emoji: '🌟' };
    if (grade >= 16) return { mention: 'Très Bien', emoji: '😊' };
    if (grade >= 14) return { mention: 'Bien', emoji: '👍' };
    if (grade >= 12) return { mention: 'Assez Bien', emoji: '😐' };
    if (grade >= 10) return { mention: 'Passable', emoji: '⚠️' };
    if (grade >= 8) return { mention: 'Insuffisant', emoji: '❌' };
    return { mention: 'Très Insuffisant', emoji: '🚫' };
  };

  // Données fictives pour le bulletin
  const reportCardData = {
    student: {
      name: studentData?.name || 'Marie Dubois',
      class: studentData?.class || 'Terminale S',
      matricule: studentData?.id || 'MAT-2024-00001',
      birthDate: '15/03/2006',
      schoolYear: '2023-2024',
      period: '1er Trimestre'
    },
    grades: [
      { subject: 'Mathématiques', coefficient: 7, grade: 16.5, classAverage: 14.2, teacherComment: 'Excellent travail, continue ainsi.' },
      { subject: 'Sciences Physiques', coefficient: 6, grade: 15.0, classAverage: 13.8, teacherComment: 'Bon travail, mais peut mieux faire en électricité.' },
      { subject: 'Sciences Naturelles', coefficient: 3, grade: 14.5, classAverage: 13.5, teacherComment: 'Participation active en classe.' },
      { subject: 'Français', coefficient: 3, grade: 13.0, classAverage: 12.8, teacherComment: 'Des progrès en expression écrite.' },
      { subject: 'Philosophie', coefficient: 2, grade: 12.5, classAverage: 11.9, teacherComment: 'Doit approfondir ses analyses.' },
      { subject: 'Histoire-Géographie', coefficient: 2, grade: 14.0, classAverage: 13.2, teacherComment: 'Bon niveau général.' },
      { subject: 'Anglais', coefficient: 2, grade: 15.5, classAverage: 14.0, teacherComment: 'Très bonne participation orale.' },
      { subject: 'EPS', coefficient: 1, grade: 17.0, classAverage: 15.5, teacherComment: 'Excellente implication.' }
    ],
    summary: {
      generalAverage: 15.2,
      classAverage: 13.8,
      rank: '3/30',
      absences: 2,
      lateArrivals: 1,
      principalComment: "Très bon trimestre dans l'ensemble. Marie doit maintenir ses efforts et améliorer sa régularité dans le travail personnel."
    }
  };

  // Calcul de la moyenne générale pondérée
  const calculateWeightedAverage = () => {
    const totalPoints = reportCardData.grades.reduce((sum, subject) => sum + (subject.grade * subject.coefficient), 0);
    const totalCoefficients = reportCardData.grades.reduce((sum, subject) => sum + subject.coefficient, 0);
    return (totalPoints / totalCoefficients).toFixed(2);
  };

  // Obtenir l'appréciation générale
  const generalAppreciation = getAppreciation(reportCardData.summary.generalAverage);

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulletin de notes"
      size="xl"
      footer={
        <div className="flex justify-between">
          <div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {showPreview ? "Afficher les options" : "Afficher l'aperçu"}
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Envoyer aux parents
            </button>
          </div>
        </div>
      }
    >
      {showPreview ? (
        <div className="space-y-6">
          {/* En-tête du bulletin */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">École Exemple</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">123 Rue de l'Éducation, 75001 Paris</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Année scolaire: {reportCardData.student.schoolYear}</p>
              </div>
              <div className="text-right">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Bulletin de notes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{reportCardData.student.period}</p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Élève: <span className="font-medium text-gray-900 dark:text-gray-100">{reportCardData.student.name}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Classe: <span className="font-medium text-gray-900 dark:text-gray-100">{reportCardData.student.class}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Matricule: <span className="font-medium text-gray-900 dark:text-gray-100">{reportCardData.student.matricule}</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date de naissance: <span className="font-medium text-gray-900 dark:text-gray-100">{reportCardData.student.birthDate}</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Effectif de la classe: <span className="font-medium text-gray-900 dark:text-gray-100">30 élèves</span></p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Professeur principal: <span className="font-medium text-gray-900 dark:text-gray-100">M. Dubois</span></p>
              </div>
            </div>
          </div>
          
          {/* Tableau des notes */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Matière
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Coef.
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Note /20
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Moy. Classe
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Note × Coef.
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Appréciation du professeur
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reportCardData.grades.map((subject, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {subject.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                      {subject.coefficient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`text-sm font-bold ${getGradeColor(subject.grade)}`}>
                        {subject.grade.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                      {subject.classAverage.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                      {(subject.grade * subject.coefficient).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {subject.teacherComment}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100">
                    TOTAUX
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-bold ${getGradeColor(reportCardData.summary.generalAverage)}`}>
                      {reportCardData.summary.generalAverage.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 text-center">
                    {reportCardData.summary.classAverage.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-gray-100 text-center">
                    {reportCardData.grades.reduce((sum, subject) => sum + (subject.grade * subject.coefficient), 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Résumé et appréciation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Résultats</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Moyenne générale:</span>
                  <span className={`font-bold ${getGradeColor(reportCardData.summary.generalAverage)}`}>
                    {reportCardData.summary.generalAverage.toFixed(2)}/20
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Moyenne de la classe:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {reportCardData.summary.classAverage.toFixed(2)}/20
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Rang:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {reportCardData.summary.rank}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mention:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
                    {generalAppreciation.emoji} {generalAppreciation.mention}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Vie scolaire</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Absences:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {reportCardData.summary.absences} demi-journées
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Retards:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {reportCardData.summary.lateArrivals}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sanctions:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Aucune
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Appréciation générale */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Appréciation générale</h4>
            <p className="text-gray-700 dark:text-gray-300">
              {reportCardData.summary.principalComment}
            </p>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Le Directeur</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-2">M. Bernard</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Le Professeur Principal</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-2">M. Dubois</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Les Parents</p>
                <div className="h-8 mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Options du bulletin</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Période
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="trimester1">1er Trimestre</option>
                  <option value="trimester2">2ème Trimestre</option>
                  <option value="trimester3">3ème Trimestre</option>
                  <option value="annual">Annuel</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Format du bulletin
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="standard">Standard</option>
                  <option value="detailed">Détaillé</option>
                  <option value="simplified">Simplifié</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Inclure
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" checked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Graphiques de progression</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Commentaires des professeurs</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Vie scolaire (absences, retards)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Appréciation générale</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Signature électronique
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" checked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Directeur</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Professeur principal</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Options d'envoi</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Méthode d'envoi
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="email">Email</option>
                  <option value="sms">SMS (lien)</option>
                  <option value="portal">Portail parents</option>
                  <option value="print">Impression uniquement</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message d'accompagnement
                </label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  defaultValue="Chers parents, veuillez trouver ci-joint le bulletin de notes de votre enfant pour le 1er trimestre de l'année scolaire 2023-2024. N'hésitez pas à prendre rendez-vous avec le professeur principal pour en discuter."
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Demander un accusé de réception</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </FormModal>
  );
};

export default ReportCardModal;