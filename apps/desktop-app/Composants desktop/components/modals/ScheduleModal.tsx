import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, Printer, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface TuitionStatus {
  id: string;
  studentId: string;
  studentName: string;
  level: string;
  className: string;
  expectedTuition: number;
  paidTuition: number;
  remainingTuition: number;
  status: 'not_started' | 'partial' | 'completed';
  phoneNumber?: string;
  lastPaymentDate?: string;
  nextDueDate?: string;
}

interface Installment {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: TuitionStatus | null;
  onGenerate: (student: TuitionStatus) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  student,
  onGenerate
}) => {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      generateSchedule();
    }
  }, [student, isOpen]);

  const generateSchedule = () => {
    if (!student) return;

    setIsGenerating(true);
    
    // Simuler la génération d'un échéancier
    setTimeout(() => {
      const totalAmount = student.remainingTuition;
      const installmentCount = 3; // 3 échéances par défaut
      const installmentAmount = Math.ceil(totalAmount / installmentCount);
      
      const today = new Date();
      const newInstallments: Installment[] = [];
      
      for (let i = 0; i < installmentCount; i++) {
        const dueDate = new Date(today);
        dueDate.setMonth(today.getMonth() + i + 1);
        dueDate.setDate(1); // Premier du mois
        
        const isLastInstallment = i === installmentCount - 1;
        const amount = isLastInstallment ? totalAmount - (installmentAmount * (installmentCount - 1)) : installmentAmount;
        
        newInstallments.push({
          id: `installment-${i + 1}`,
          amount: amount,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'pending',
          description: `Échéance ${i + 1} - ${getMonthName(dueDate.getMonth())} ${dueDate.getFullYear()}`
        });
      }
      
      setInstallments(newInstallments);
      setIsGenerating(false);
      setIsGenerated(true);
    }, 1500);
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'overdue':
        return 'En retard';
      default:
        return 'En attente';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!student) return;

    const scheduleData = {
      student: {
        name: student.studentName,
        level: student.level,
        className: student.className,
        phoneNumber: student.phoneNumber
      },
      tuition: {
        expected: student.expectedTuition,
        paid: student.paidTuition,
        remaining: student.remainingTuition
      },
      installments: installments.map(installment => ({
        description: installment.description,
        amount: installment.amount,
        dueDate: formatDate(installment.dueDate),
        status: getStatusText(installment.status)
      })),
      generatedAt: new Date().toLocaleDateString('fr-FR')
    };

    const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echeancier-${student.studentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Échéancier de scolarité</h3>
              <p className="text-purple-100 mt-1">
                Plan de paiement pour {student.studentName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              title="Fermer"
              aria-label="Fermer la modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations de l'élève */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Informations de l'élève</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nom complet</p>
                <p className="font-medium text-gray-900">{student.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Classe</p>
                <p className="font-medium text-gray-900">{student.level} - {student.className}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Scolarité totale</p>
                <p className="font-medium text-gray-900">{student.expectedTuition.toLocaleString()} F CFA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reste à payer</p>
                <p className="font-medium text-red-600">{student.remainingTuition.toLocaleString()} F CFA</p>
              </div>
            </div>
          </div>

          {/* Échéancier */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Plan de paiement</h4>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </button>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimer
                </button>
              </div>
            </div>

            {isGenerating ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Génération de l'échéancier...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {installments.map((installment, index) => (
                  <div
                    key={installment.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{installment.description}</p>
                          <p className="text-sm text-gray-500">
                            Échéance: {formatDate(installment.dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {installment.amount.toLocaleString()} F CFA
                          </p>
                        </div>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(installment.status)}`}>
                          {getStatusText(installment.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Résumé */}
          {isGenerated && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Résumé de l'échéancier</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{installments.length}</div>
                  <div className="text-sm text-gray-600">Échéances</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {student.remainingTuition.toLocaleString()} F CFA
                  </div>
                  <div className="text-sm text-gray-600">Total à payer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.ceil(student.remainingTuition / installments.length).toLocaleString()} F CFA
                  </div>
                  <div className="text-sm text-gray-600">Montant moyen</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Fermer
          </button>
          {isGenerated && (
            <button
              onClick={() => onGenerate(student)}
              className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmer l'échéancier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
