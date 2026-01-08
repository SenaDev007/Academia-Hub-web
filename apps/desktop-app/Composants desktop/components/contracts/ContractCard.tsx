import React from 'react';
import { 
  User, Calendar, DollarSign, Clock, Building2, FileCheck, 
  MapPin, Shield, FileText, TrendingUp, Calculator, Users 
} from 'lucide-react';
import { Contract } from '../../services/hrService';

interface ContractCardProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onView: (contract: Contract) => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onEdit, onView }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'terminated': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case 'permanent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'vacataire': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateTotalBenefits = () => {
    return (contract.housingAllowance || 0) + (contract.transportAllowance || 0) + (contract.fixedBonuses || 0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{contract.employeeName}</h3>
              <p className="text-indigo-100">{contract.position}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
              {contract.status === 'active' ? 'Actif' : 
               contract.status === 'expired' ? 'Expiré' :
               contract.status === 'terminated' ? 'Résilié' : 'En attente'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getContractTypeColor(contract.contractType)}`}>
              {contract.contractType === 'permanent' ? 'Permanent' : 'Vacataire'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Début</p>
              <p className="font-medium">{new Date(contract.startDate).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          {contract.endDate && (
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fin</p>
                <p className="font-medium">{new Date(contract.endDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Durée</p>
              <p className="font-medium">{contract.contractDuration}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Temps de travail</p>
              <p className="font-medium">{contract.workTimeType === 'plein-temps' ? 'Plein temps' : 'Temps partiel'}</p>
            </div>
          </div>
        </div>

        {/* Rémunération */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-3">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <h4 className="font-semibold text-green-900 dark:text-green-100">Rémunération</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">Salaire de base</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                {formatCurrency(contract.baseSalary || 0)}
              </p>
            </div>
            {contract.hourlyRate > 0 && (
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Taux horaire</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(contract.hourlyRate)}/h
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">Heures/semaine</p>
              <p className="font-medium text-green-900 dark:text-green-100">
                {contract.workingHours}h
              </p>
            </div>
            {calculateTotalBenefits() > 0 && (
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Avantages totaux</p>
                <p className="font-medium text-green-900 dark:text-green-100">
                  {formatCurrency(calculateTotalBenefits())}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Déclarations sociales */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center mb-3">
            <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
            <h4 className="font-semibold text-amber-900 dark:text-amber-100">Déclarations sociales</h4>
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${contract.cnssDeclaration ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-amber-700 dark:text-amber-300">CNSS</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${contract.irppDeclaration ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-amber-700 dark:text-amber-300">IRPP</span>
            </div>
          </div>
        </div>

        {/* Conditions de travail */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Conditions de travail</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Horaire</p>
              <p className="font-medium text-blue-900 dark:text-blue-100">{contract.workSchedule}</p>
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Lieu</p>
              <p className="font-medium text-blue-900 dark:text-blue-100">{contract.workLocation || 'Non spécifié'}</p>
            </div>
            {contract.remoteWork && (
              <div className="md:col-span-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  Télétravail autorisé
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        {(contract.identityDocumentType || contract.ifuNumber || (contract.uploadedDocuments && contract.uploadedDocuments.length > 0)) && (
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center mb-3">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400 mr-2" />
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">Documents</h4>
            </div>
            <div className="space-y-2">
              {contract.identityDocumentType && (
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Pièce d'identité:</strong> {contract.identityDocumentType}
                </p>
              )}
              {contract.ifuNumber && (
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>IFU:</strong> {contract.ifuNumber}
                </p>
              )}
              {contract.uploadedDocuments && contract.uploadedDocuments.length > 0 && (
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <strong>Fichiers:</strong> {contract.uploadedDocuments.length} document(s)
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => onView(contract)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Voir
          </button>
          <button
            onClick={() => onEdit(contract)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
