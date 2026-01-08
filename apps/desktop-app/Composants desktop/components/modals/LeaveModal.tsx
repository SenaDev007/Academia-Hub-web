import React, { useState, useEffect } from 'react';
import FormModal from './FormModal';
import { Save, Calendar, User, Clock, FileText, Upload, AlertCircle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import hrService, { Leave } from '../../services/hrService';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  leaveData?: Leave | null;
  isEdit?: boolean;
  isView?: boolean;
  employees?: any[];
}

const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  leaveData,
  isEdit = false,
  isView = false,
  employees = []
}) => {
  const { user } = useUser();
  
  const defaultEmployees = [
    { id: 'PER-2024-00001', name: 'Marie Dubois', position: 'Professeur de Français' },
    { id: 'PER-2024-00002', name: 'Pierre Martin', position: 'Professeur de Mathématiques' },
    { id: 'PER-2024-00003', name: 'Sophie Laurent', position: 'Secrétaire administrative' }
  ];

  const allEmployees = employees.length > 0 ? employees : defaultEmployees;

  const [formData, setFormData] = useState({
    id: leaveData?.id || `LEAVE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    employeeId: leaveData?.employeeId || '',
    employeeName: leaveData?.employeeName || '',
    position: leaveData?.position || '',
    leaveType: leaveData?.leaveType || 'annual',
    startDate: leaveData?.startDate || '',
    endDate: leaveData?.endDate || '',
    duration: leaveData?.duration || 0,
    reason: leaveData?.reason || '',
    status: leaveData?.status || 'pending',
    requestedDate: leaveData?.requestedDate || new Date().toISOString().split('T')[0],
    approvedBy: leaveData?.approvedBy || '',
    approvedDate: leaveData?.approvedDate || '',
    rejectionReason: leaveData?.rejectionReason || '',
    attachments: leaveData?.attachments || [],
    notes: leaveData?.notes || ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Synchroniser les données du formulaire
  useEffect(() => {
    if (leaveData && isOpen) {
      setFormData({
        id: leaveData.id,
        employeeId: leaveData.employeeId,
        employeeName: leaveData.employeeName,
        position: leaveData.position,
        leaveType: leaveData.leaveType,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        duration: leaveData.duration,
        reason: leaveData.reason,
        status: leaveData.status,
        requestedDate: leaveData.requestedDate,
        approvedBy: leaveData.approvedBy || '',
        approvedDate: leaveData.approvedDate || '',
        rejectionReason: leaveData.rejectionReason || '',
        attachments: leaveData.attachments || [],
        notes: leaveData.notes || ''
      });
    } else if (isOpen && !isEdit) {
      // Nouvelle demande
      setFormData({
        id: `LEAVE-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        employeeId: '',
        employeeName: '',
        position: '',
        leaveType: 'annual',
        startDate: '',
        endDate: '',
        duration: 0,
        reason: '',
        status: 'pending',
        requestedDate: new Date().toISOString().split('T')[0],
        approvedBy: '',
        approvedDate: '',
        rejectionReason: '',
        attachments: [],
        notes: ''
      });
    }
    setErrors({});
  }, [leaveData, isOpen, isEdit]);

  // Calculer la durée automatiquement
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de fin
      setFormData(prev => ({ ...prev, duration: diffDays }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseFloat(value) : 0) : value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const employeeId = e.target.value;
    const employee = allEmployees.find(emp => emp.id === employeeId);
    
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId,
        employeeName: employee.name,
        position: employee.position
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file)
      }));
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'L\'employé est requis';
    }

    if (!formData.leaveType) {
      newErrors.leaveType = 'Le type de congé est requis';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La date de début est requise';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La date de fin est requise';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'La date de fin doit être postérieure à la date de début';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'La raison est requise';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'La durée doit être supérieure à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Empêcher la soumission en mode lecture
    if (isView) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    try {
      const leaveData = {
        ...formData,
        schoolId: user?.schoolId || '',
        requestedDate: formData.requestedDate || new Date().toISOString().split('T')[0]
      };

      if (isEdit) {
        await hrService.updateLeave(formData.id, leaveData);
      } else {
        await hrService.createLeave(leaveData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'annual': return 'Congés annuels';
      case 'sick': return 'Congés maladie';
      case 'maternity': return 'Congés maternité';
      case 'paternity': return 'Congés paternité';
      case 'personal': return 'Congés personnels';
      case 'unpaid': return 'Congés sans solde';
      case 'compensatory': return 'Congés compensatoires';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isView 
          ? "Consulter la demande de congé" 
          : isEdit 
            ? "Modifier la demande de congé" 
            : "Nouvelle demande de congé"
      }
      size="xl"
      footer={
        isView ? (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="leave-form"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEdit ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        )
      }
    >
      <form id="leave-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Désactiver tous les champs en mode lecture */}
        <div className={isView ? 'pointer-events-none opacity-75' : ''}>
          
          {/* Informations de base */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Informations de base
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Employé*
                </label>
                <select
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleEmployeeChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Sélectionner un employé</option>
                  {allEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.position})
                    </option>
                  ))}
                </select>
                {errors.employeeId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.employeeId}</p>
                )}
              </div>
              
              {formData.employeeId && (
                <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Employé:</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{formData.employeeName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Poste:</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{formData.position}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type de congé*
                </label>
                <select
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="annual">Congés annuels</option>
                  <option value="sick">Congés maladie</option>
                  <option value="maternity">Congés maternité</option>
                  <option value="paternity">Congés paternité</option>
                  <option value="personal">Congés personnels</option>
                  <option value="unpaid">Congés sans solde</option>
                  <option value="compensatory">Congés compensatoires</option>
                </select>
                {errors.leaveType && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.leaveType}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Dates et durée */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Période de congé
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de début*
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date de fin*
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durée (jours)*
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Calculé automatiquement
                </p>
              </div>
            </div>
          </div>
          
          {/* Raison et détails */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Détails de la demande
            </h4>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Raison du congé*
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Décrivez la raison de votre demande de congé..."
                />
                {errors.reason && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes supplémentaires
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Informations complémentaires..."
                />
              </div>
            </div>
          </div>
          
          {/* Pièces jointes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
              Pièces jointes
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <label className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 cursor-pointer flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  <span>Ajouter des fichiers</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                  Formats acceptés: PDF, DOCX, JPG, PNG (max 10MB)
                </span>
              </div>
              
              {formData.attachments.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Nom
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Taille
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {formData.attachments.map((attachment, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {attachment.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {attachment.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {(attachment.size / 1024).toFixed(2)} KB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(index)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Informations d'approbation (si applicable) */}
          {(formData.status === 'approved' || formData.status === 'rejected') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                Informations d'approbation
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {formData.status === 'approved' ? 'Approuvé par' : 'Rejeté par'}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{formData.approvedBy || 'Non renseigné'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date de {formData.status === 'approved' ? 'approbation' : 'rejet'}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formData.approvedDate ? new Date(formData.approvedDate).toLocaleDateString('fr-FR') : 'Non renseignée'}
                  </p>
                </div>
                
                {formData.status === 'rejected' && formData.rejectionReason && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Raison du rejet
                    </label>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{formData.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Récapitulatif */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-900/30">
            <h4 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Récapitulatif de la demande
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Employé:</span>
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    {formData.employeeName || 'Non sélectionné'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Type de congé:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">
                    {getLeaveTypeLabel(formData.leaveType)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Période:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">
                    {formData.startDate && formData.endDate 
                      ? `${new Date(formData.startDate).toLocaleDateString('fr-FR')} - ${new Date(formData.endDate).toLocaleDateString('fr-FR')}`
                      : 'Non renseignée'
                    }
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Durée:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">
                    {formData.duration} jour{formData.duration > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Statut:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">
                    {getStatusLabel(formData.status)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-blue-800 dark:text-blue-300">Référence:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-200">{formData.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default LeaveModal;
