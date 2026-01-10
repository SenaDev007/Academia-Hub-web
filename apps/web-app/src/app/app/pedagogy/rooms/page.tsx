/**
 * ============================================================================
 * MODULE 2 : ORGANISATION PÉDAGOGIQUE - SALLES & INFRASTRUCTURES
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus, Building2, Calendar, AlertTriangle, Edit, Trash2, Eye, Wrench } from 'lucide-react';
import {
  ModuleContainer,
  FormModal,
  ConfirmModal,
  ReadOnlyModal,
  CriticalModal,
} from '@/components/modules/blueprint';
import { useModuleContext } from '@/hooks/useModuleContext';

interface Room {
  id: string;
  roomCode: string;
  roomName: string;
  roomType: string;
  capacity?: number;
  status: string;
  equipment?: string[];
  schoolLevel?: {
    id: string;
    code: string;
    label: string;
  };
}

export default function RoomsPage() {
  const { academicYear, schoolLevel } = useModuleContext();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filters, setFilters] = useState({
    roomType: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    if (academicYear) {
      loadRooms();
      loadStatistics();
    }
  }, [academicYear, schoolLevel, filters]);

  const loadRooms = async () => {
    if (!academicYear) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        academicYearId: academicYear.id,
        ...(schoolLevel && { schoolLevelId: schoolLevel.id }),
        ...(filters.roomType && { roomType: filters.roomType }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/rooms?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    if (!academicYear) return;

    try {
      const params = new URLSearchParams({
        academicYearId: academicYear.id,
      });

      const response = await fetch(`/api/rooms/statistics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const getRoomTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CLASSROOM: 'Classe',
      LAB: 'Laboratoire',
      IT: 'Salle informatique',
      EXAM: 'Salle d\'examen',
      OTHER: 'Autre',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNAVAILABLE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ACTIVE: 'Active',
      MAINTENANCE: 'En maintenance',
      UNAVAILABLE: 'Indisponible',
    };
    return labels[status] || status;
  };

  return (
    <>
      <ModuleContainer
        header={{
          title: 'Salles & Infrastructures',
          description: 'Gestion des salles, occupation et planning',
          icon: 'building',
          kpis: statistics
            ? [
                {
                  label: 'Salles actives',
                  value: statistics.totalRooms || 0,
                  icon: 'building',
                  trend: 'neutral',
                },
                {
                  label: 'Allocations',
                  value: statistics.totalAllocations || 0,
                  icon: 'calendar',
                  trend: 'up',
                },
                {
                  label: 'Taux occupation',
                  value: `${statistics.occupancyRate?.toFixed(1) || 0}%`,
                  icon: 'trendingUp',
                  trend: 'neutral',
                },
              ]
            : [],
          actions: (
            <button
              onClick={() => {
                setSelectedRoom(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle salle</span>
            </button>
          ),
        }}
        content={{
          layout: 'table',
          filters: (
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher une salle..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Rechercher"
                />
              </div>
              <select
                value={filters.roomType}
                onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par type"
              >
                <option value="">Tous les types</option>
                <option value="CLASSROOM">Classe</option>
                <option value="LAB">Laboratoire</option>
                <option value="IT">Salle informatique</option>
                <option value="EXAM">Salle d'examen</option>
                <option value="OTHER">Autre</option>
              </select>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filtrer par statut"
              >
                <option value="">Tous les statuts</option>
                <option value="ACTIVE">Active</option>
                <option value="MAINTENANCE">En maintenance</option>
                <option value="UNAVAILABLE">Indisponible</option>
              </select>
            </div>
          ),
          isLoading,
          children: (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Capacité
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
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {room.roomCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.roomName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRoomTypeLabel(room.roomType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.capacity || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          room.status
                        )}`}
                      >
                        {getStatusLabel(room.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir"
                          aria-label="Voir la salle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setIsEditModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Modifier"
                          aria-label="Modifier la salle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {room.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsMaintenanceModalOpen(true);
                            }}
                            className="text-orange-600 hover:text-orange-900"
                            title="Mettre en maintenance"
                            aria-label="Mettre en maintenance"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ),
        }}
      />

      <FormModal
        title={selectedRoom ? 'Modifier la salle' : 'Créer une salle'}
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedRoom(null);
        }}
        size="lg"
        actions={
          <>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedRoom(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={async () => {
                // TODO: Implémenter la sauvegarde
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedRoom(null);
                loadRooms();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {selectedRoom ? 'Modifier' : 'Créer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code *
              </label>
              <input
                type="text"
                defaultValue={selectedRoom?.roomCode || ''}
                placeholder="Ex: Salle A1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Code de la salle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                defaultValue={selectedRoom?.roomName || ''}
                placeholder="Ex: Salle de classe A1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Nom de la salle"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                defaultValue={selectedRoom?.roomType || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Type de salle"
              >
                <option value="">Sélectionner</option>
                <option value="CLASSROOM">Classe</option>
                <option value="LAB">Laboratoire</option>
                <option value="IT">Salle informatique</option>
                <option value="EXAM">Salle d'examen</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité
              </label>
              <input
                type="number"
                min="1"
                defaultValue={selectedRoom?.capacity || ''}
                placeholder="Ex: 40"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Capacité"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              defaultValue={selectedRoom?.status || 'ACTIVE'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Statut"
            >
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">En maintenance</option>
              <option value="UNAVAILABLE">Indisponible</option>
            </select>
          </div>
        </div>
      </FormModal>

      <ReadOnlyModal
        title={`Salle : ${selectedRoom?.roomName}`}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRoom(null);
        }}
        size="lg"
      >
        {selectedRoom && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <p className="text-sm text-gray-900 font-mono">{selectedRoom.roomCode}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <p className="text-sm text-gray-900">{getRoomTypeLabel(selectedRoom.roomType)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                <p className="text-sm text-gray-900">{selectedRoom.capacity || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    selectedRoom.status
                  )}`}
                >
                  {getStatusLabel(selectedRoom.status)}
                </span>
              </div>
            </div>
          </div>
        )}
      </ReadOnlyModal>

      <CriticalModal
        title="Mettre la salle en maintenance"
        message={`Vous êtes sur le point de mettre "${selectedRoom?.roomName}" en maintenance.`}
        warning="Toutes les allocations futures seront automatiquement annulées."
        isOpen={isMaintenanceModalOpen}
        onConfirm={async () => {
          if (selectedRoom) {
            try {
              await fetch(`/api/rooms/${selectedRoom.id}/maintenance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'Maintenance programmée' }),
              });
              setIsMaintenanceModalOpen(false);
              setSelectedRoom(null);
              loadRooms();
              loadStatistics();
            } catch (error) {
              console.error('Failed to set maintenance:', error);
            }
          }
        }}
        onCancel={() => {
          setIsMaintenanceModalOpen(false);
          setSelectedRoom(null);
        }}
        confirmLabel="Mettre en maintenance"
      />
    </>
  );
}

