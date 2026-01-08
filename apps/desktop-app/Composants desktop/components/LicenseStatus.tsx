import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, AlertCircle, Clock, XCircle, Info } from 'lucide-react';
import LicenseService, { SchoolLicenseStatus } from '../services/licenseService';

interface LicenseStatusProps {
  schoolId: string;
}

const LicenseStatus: React.FC<LicenseStatusProps> = ({ schoolId }) => {
  const [licenseStatus, setLicenseStatus] = useState<SchoolLicenseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLicenseStatus();
  }, [schoolId]);

  const loadLicenseStatus = async () => {
    try {
      setIsLoading(true);
      const status = await LicenseService.checkSchoolLicenseStatus(schoolId);
      setLicenseStatus(status);
    } catch (err) {
      setError('Erreur lors du chargement du statut de la licence');
      console.error('Error loading license status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'expired':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expirée';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center text-red-600 mb-2">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Erreur</span>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={loadLicenseStatus}
          className="mt-3 text-red-600 hover:text-red-700 text-sm underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!licenseStatus || !licenseStatus.hasLicense) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Key className="w-6 h-6 text-gray-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Statut de la licence</h3>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center text-yellow-800 mb-2">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Aucune licence active</span>
          </div>
          <p className="text-yellow-700 text-sm">
            Votre école n'a pas encore de licence active. 
            Veuillez contacter notre équipe pour obtenir une licence.
          </p>
        </div>
      </div>
    );
  }

  const { license } = licenseStatus;
  const isExpired = license?.status === 'expired';
  const daysLeft = license?.daysUntilExpiration || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Key className="w-6 h-6 text-gray-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Statut de la licence</h3>
        </div>
        
        <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(license?.status || '')}`}>
          {getStatusIcon(license?.status || '')}
          <span className="ml-2 text-sm font-medium">
            {getStatusText(license?.status || '')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Type de licence</div>
          <div className="font-medium text-gray-900 capitalize">
            {license?.type === 'demo' ? 'Démonstration' : 'Complète'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Installations</div>
          <div className="font-medium text-gray-900">
            {license?.currentInstallations} / {license?.maxInstallations}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Date d'activation</div>
          <div className="font-medium text-gray-900">
            {license?.activationDate ? new Date(license.activationDate).toLocaleDateString('fr-FR') : 'N/A'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Date d'expiration</div>
          <div className="font-medium text-gray-900">
            {license?.expirationDate ? new Date(license.expirationDate).toLocaleDateString('fr-FR') : 'N/A'}
          </div>
        </div>
      </div>

      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center text-red-800 mb-2">
            <XCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Licence expirée</span>
          </div>
          <p className="text-red-700 text-sm">
            Votre licence a expiré. Veuillez la renouveler pour continuer à utiliser Academia Hub.
          </p>
        </div>
      )}

      {!isExpired && daysLeft <= 30 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center text-yellow-800 mb-2">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">Expiration proche</span>
          </div>
          <p className="text-yellow-700 text-sm">
            Votre licence expire dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}. 
            Pensez à la renouveler.
          </p>
        </div>
      )}

      {license?.type === 'demo' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center text-blue-800 mb-2">
            <Info className="w-5 h-5 mr-2" />
            <span className="font-medium">Mode démonstration</span>
          </div>
          <p className="text-blue-700 text-sm">
            Vous utilisez actuellement la version de démonstration d'Academia Hub. 
            Pour accéder à toutes les fonctionnalités, veuillez activer une licence complète.
          </p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={loadLicenseStatus}
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Actualiser le statut
        </button>
      </div>
    </div>
  );
};

export default LicenseStatus;
