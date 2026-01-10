/**
 * ============================================================================
 * SOUS-MODULE : TRANSFERTS
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  ModuleContainer,
  FormModal,
  ConfirmModal,
  CriticalModal,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';

interface TransferRequest {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentCode?: string;
  };
  fromClassId: string;
  toClassId: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function TransfersPage() {
  const { academicYear, schoolLevel } = useModuleContext();
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRequest | null>(null);

  useEffect(() => {
    if (academicYear && schoolLevel) {
      loadTransfers();
    }
  }, [academicYear, schoolLevel]);

  const loadTransfers = async () => {
    if (!academicYear || !schoolLevel) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        academicYearId: academicYear.id,
        schoolLevelId: schoolLevel.id,
      });

      const response = await fetch(`/api/transfers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransfers(data);
      }
    } catch (error) {
      console.error('Failed to load transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (transfer: TransferRequest) => {
    setSelectedTransfer(transfer);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedTransfer) return;

    try {
      const response = await fetch(`/api/transfers/${selectedTransfer.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'current-user-id' }),
      });
      if (response.ok) {
        setIsApproveModalOpen(false);
        setSelectedTransfer(null);
        loadTransfers();
      }
    } catch (error) {
      console.error('Failed to approve transfer:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      <ModuleContainer
        header={{
          title: 'Transferts',
          description: 'Gestion des changements de classe des élèves',
          icon: 'arrowRight',
          actions: (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau transfert</span>
            </button>
          ),
        }}
        content={{
          layout: 'table',
          isLoading,
          children: (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    De
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Raison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transfer.student.lastName} {transfer.student.firstName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transfer.student.studentCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Classe {transfer.fromClassId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          Classe {transfer.toClassId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transfer.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${getStatusColor(
                          transfer.status
                        )}`}
                      >
                        {getStatusIcon(transfer.status)}
                        <span>{transfer.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {transfer.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(transfer)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approuver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ),
        }}
      />

      <FormModal
        title="Nouveau transfert"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="lg"
        actions={
          <>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                // TODO: Implémenter la création
                setIsCreateModalOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Créer
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Formulaire de transfert à implémenter
          </p>
        </div>
      </FormModal>

      <CriticalModal
        title="Approuver le transfert"
        message={`Vous êtes sur le point d'approuver le transfert de ${selectedTransfer?.student.lastName} ${selectedTransfer?.student.firstName}.`}
        warning="Cette action est irréversible et modifiera l'inscription de l'élève."
        isOpen={isApproveModalOpen}
        onConfirm={handleConfirmApprove}
        onCancel={() => {
          setIsApproveModalOpen(false);
          setSelectedTransfer(null);
        }}
        confirmLabel="Approuver le transfert"
      />
    </>
  );
}

