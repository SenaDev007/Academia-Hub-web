import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  AcademicCapIcon, 
  ChartBarIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { PDFIconDetailed, ExcelIconDetailed, CSVIconDetailed } from '../icons/FormatIcons';

interface AbsenceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport: (options: {
    fromDate: string;
    toDate: string;
    classId: string;
    format: 'pdf' | 'excel' | 'csv';
    includeDetails: boolean;
  }) => void;
  classes: Array<{ id: string; name: string; }>;
  isGenerating: boolean;
}

export default function AbsenceReportModal({ 
  isOpen, 
  onClose, 
  onGenerateReport, 
  classes, 
  isGenerating 
}: AbsenceReportModalProps) {
  const [reportOptions, setReportOptions] = useState({
    fromDate: '',
    toDate: '',
    classId: 'all',
    format: 'pdf' as 'pdf' | 'excel' | 'csv',
    includeDetails: true
  });

  // Initialiser les dates par défaut
  React.useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setReportOptions(prev => ({
        ...prev,
        fromDate: firstDayOfMonth.toISOString().split('T')[0],
        toDate: lastDayOfMonth.toISOString().split('T')[0]
      }));
    }
  }, [isOpen]);

  const handleGenerate = () => {
    if (!reportOptions.fromDate || !reportOptions.toDate) {
      return;
    }
    
    onGenerateReport({
      fromDate: reportOptions.fromDate,
      toDate: reportOptions.toDate,
      classId: reportOptions.classId,
      format: reportOptions.format,
      includeDetails: reportOptions.includeDetails
    });
  };

  const handleOptionChange = (key: string, value: any) => {
    setReportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Transition appear show={isOpen}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100 flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <DocumentTextIcon className="w-6 h-6 text-white" />
                    </div>
                    Rapport d'Assiduité
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Période du rapport */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      Période du rapport
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                          Date de début
                        </label>
                        <input
                          type="date"
                          value={reportOptions.fromDate}
                          onChange={(e) => handleOptionChange('fromDate', e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                          Date de fin
                        </label>
                        <input
                          type="date"
                          value={reportOptions.toDate}
                          onChange={(e) => handleOptionChange('toDate', e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filtres */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                        <AcademicCapIcon className="w-5 h-5 text-white" />
                      </div>
                      Filtres
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Classe
                        </label>
                        <select
                          value={reportOptions.classId}
                          onChange={(e) => handleOptionChange('classId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                        >
                          <option value="all">Toutes les classes</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Options d'export */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <ChartBarIcon className="w-5 h-5 text-white" />
                      </div>
                      Options d'export
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                          Format du rapport
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { 
                              value: 'pdf', 
                              label: 'PDF', 
                              icon: PDFIconDetailed,
                              description: 'Document formaté',
                              color: 'red'
                            },
                            { 
                              value: 'excel', 
                              label: 'Excel', 
                              icon: ExcelIconDetailed,
                              description: 'Tableur Excel',
                              color: 'green'
                            },
                            { 
                              value: 'csv', 
                              label: 'CSV', 
                              icon: CSVIconDetailed,
                              description: 'Données brutes',
                              color: 'purple'
                            }
                          ].map((format) => {
                            const IconComponent = format.icon;
                            return (
                              <button
                                key={format.value}
                                onClick={() => handleOptionChange('format', format.value)}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 group ${
                                  reportOptions.format === format.value
                                    ? `border-${format.color}-500 bg-${format.color}-100 dark:bg-${format.color}-900/30 text-${format.color}-700 dark:text-${format.color}-300 shadow-lg ring-2 ring-${format.color}-200 dark:ring-${format.color}-800`
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/10 text-gray-700 dark:text-gray-300 hover:shadow-md'
                                }`}
                              >
                                {/* Indicateur de sélection */}
                                {reportOptions.format === format.value && (
                                  <div className={`absolute -top-1 -right-1 w-6 h-6 bg-${format.color}-500 rounded-full flex items-center justify-center`}>
                                    <CheckIcon className="w-4 h-4 text-white" />
                                  </div>
                                )}
                                
                                <div className="flex flex-col items-center space-y-3">
                                  <div className={`p-3 rounded-xl transition-colors ${
                                    reportOptions.format === format.value
                                      ? `bg-${format.color}-200 dark:bg-${format.color}-800`
                                      : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                                  }`}>
                                    <IconComponent className="w-7 h-7" />
                                  </div>
                                  <div className="text-sm font-semibold">{format.label}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center leading-tight">
                                    {format.description}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="includeDetails"
                            checked={reportOptions.includeDetails}
                            onChange={(e) => handleOptionChange('includeDetails', e.target.checked)}
                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                          />
                          {reportOptions.includeDetails && (
                            <CheckIcon className="absolute top-0.5 left-0.5 w-3 h-3 text-white pointer-events-none" />
                          )}
                        </div>
                        <label htmlFor="includeDetails" className="ml-3 text-sm font-medium text-green-700 dark:text-green-300 cursor-pointer">
                          Inclure les détails des absences
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    onClick={onClose}
                    disabled={isGenerating}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !reportOptions.fromDate || !reportOptions.toDate}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Génération...
                      </>
                    ) : (
                      <>
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                        Générer le rapport
                      </>
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
