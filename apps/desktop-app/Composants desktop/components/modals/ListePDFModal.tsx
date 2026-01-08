import React, { useState, useEffect } from 'react';
import { X, Download, Printer, FileText, Users, Calendar, GraduationCap, MapPin, Phone, Mail, Globe, Loader2 } from 'lucide-react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import PDFStudentList from '../receipts/PDFStudentList';

interface ListePDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  onDownload: () => void;
  listData: {
    title: string;
    academicYear: string;
    level: string;
    className: string;
    includePhoto?: boolean;
    includeContact?: boolean;
    students: Array<{
      id: string;
      number: number;
      firstName: string;
      lastName: string;
      gender: string;
      birthDate: string;
      birthPlace: string;
      status: 'Ancien' | 'Nouveau';
      academicStatus: 'Passant' | 'Redoublant';
      photo?: string;
      parentPhone?: string;
    }>;
  };
  schoolSettings?: {
    logo?: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
}

const ListePDFModal: React.FC<ListePDFModalProps> = ({ 
  isOpen, 
  onClose, 
  onPrint, 
  onDownload, 
  listData, 
  schoolSettings 
}) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Simuler un délai d'impression
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Déclencher le téléchargement du PDF (même que le bouton télécharger)
      const downloadButton = document.querySelector('[data-pdf-download]') as HTMLAnchorElement;
      if (downloadButton) {
        // Cloner le lien et modifier son comportement pour l'impression
        const printLink = downloadButton.cloneNode(true) as HTMLAnchorElement;
        printLink.target = '_blank';
        printLink.onclick = (e) => {
          e.preventDefault();
          // Ouvrir le PDF dans une nouvelle fenêtre
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            // Le PDF s'ouvrira dans la nouvelle fenêtre
            newWindow.location.href = printLink.href;
            // Attendre que le PDF soit chargé puis déclencher l'impression
            setTimeout(() => {
              newWindow.print();
            }, 2000);
          }
        };
        printLink.click();
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    // Remettre l'état à false après un délai pour permettre le téléchargement
    setTimeout(() => {
      setIsDownloading(false);
    }, 3000);
  };

  const generateFileName = () => {
    const date = new Date().toISOString().split('T')[0];
    const level = listData.level ? `-${listData.level}` : '';
    const className = listData.className ? `-${listData.className}` : '';
    return `liste-eleves${level}${className}-${date}.pdf`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col border border-gray-200/20 dark:border-gray-700/50">
        {/* Header avec gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-8 text-white rounded-t-3xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Aperçu de la Liste</h2>
                  <p className="text-purple-100 text-lg">Prévisualisation avant impression/téléchargement</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                title="Fermer"
                aria-label="Fermer le modal"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          {/* Décoration */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        {/* Contenu du PDF */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* En-tête de l'école */}
            <div className="text-center mb-8 border-b-2 border-gray-200 dark:border-gray-700 pb-6">
              {schoolSettings?.logo && (
                <div className="mb-4">
                  <img 
                    src={schoolSettings.logo} 
                    alt="Logo de l'école" 
                    className="h-20 w-auto mx-auto object-contain"
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {schoolSettings?.name || 'Nom de l\'école'}
              </h1>
              <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-500 mb-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{schoolSettings?.address || 'Adresse de l\'école'}</span>
                </div>
              </div>
              <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-500">
                {schoolSettings?.primaryPhone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{schoolSettings.primaryPhone}</span>
                  </div>
                )}
                {schoolSettings?.primaryEmail && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{schoolSettings.primaryEmail}</span>
                  </div>
                )}
                {schoolSettings?.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{schoolSettings.website}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Titre du document */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {listData.title}
              </h2>
              <div className="flex justify-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Année scolaire: {listData.academicYear}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Niveau: {listData.level}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Classe: {listData.className}</span>
                </div>
              </div>
            </div>

            {/* Tableau des élèves */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">N°</th>
                      {listData.includePhoto && (
                        <th className="px-6 py-4 text-center font-semibold">Photo</th>
                      )}
                      <th className="px-6 py-4 text-left font-semibold">Nom et Prénoms</th>
                      <th className="px-6 py-4 text-center font-semibold">Sexe</th>
                      <th className="px-6 py-4 text-left font-semibold">Date de naissance</th>
                      <th className="px-6 py-4 text-left font-semibold">Lieu de naissance</th>
                      <th className="px-6 py-4 text-center font-semibold">Ancienneté</th>
                      <th className="px-6 py-4 text-center font-semibold">Statut</th>
                      {listData.includeContact && (
                        <th className="px-6 py-4 text-left font-semibold">Contacts</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {listData.students.map((student, index) => (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                          {student.number}
                        </td>
                        {listData.includePhoto && (
                          <td className="px-6 py-4 text-center">
                            {student.photo ? (
                              <img 
                                src={student.photo} 
                                alt={`Photo de ${student.firstName} ${student.lastName}`}
                                className="w-12 h-12 rounded-full object-cover mx-auto border-2 border-gray-200 dark:border-gray-600"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mx-auto">
                                <Users className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                          <div className="font-medium">
                            {student.lastName} {student.firstName}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.gender === 'M' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                          }`}>
                            {student.gender === 'M' ? 'M' : 'F'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {student.birthDate}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {student.birthPlace}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.status === 'Ancien'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.academicStatus === 'Passant'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {student.academicStatus}
                          </span>
                        </td>
                        {listData.includeContact && (
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {student.parentPhone ? (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{student.parentPhone}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Non renseigné</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pied de page */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-500">
                <div>
                  <p>Généré le {new Date().toLocaleDateString('fr-FR')}</p>
                  <p>Total: {listData.students.length} élève(s)</p>
                </div>
                <div className="text-right">
                  <p>Direction de l'établissement</p>
                  <p className="font-semibold">{schoolSettings?.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 p-8 border-t-2 border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-8 py-4 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
          >
            Annuler
          </button>
          
          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {isPrinting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Printer className="w-4 h-4 mr-2" />
            )}
            {isPrinting ? 'Impression...' : 'Imprimer PDF'}
          </button>

          <PDFDownloadLink
            document={<PDFStudentList listData={listData} schoolSettings={schoolSettings} />}
            fileName={generateFileName()}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={handleDownloadPDF}
            data-pdf-download
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? 'Génération...' : 'Télécharger PDF'}
          </PDFDownloadLink>
        </div>
      </div>
    </div>
  );
};

export default ListePDFModal;
