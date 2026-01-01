import React, { useState } from 'react';
import { useAcademicYearState } from '../../hooks/useAcademicYearState';
import AcademicYearSelector from '../common/AcademicYearSelector';
import CurrentAcademicYearDisplay from '../common/CurrentAcademicYearDisplay';
import { Heart, Plus, Search, Filter, Calendar, Users, AlertTriangle, CheckCircle, Settings, Pill, FileText, Phone, Clock, Activity, Shield, TrendingUp, BarChart3, Eye, Edit, Download, Upload, Thermometer, Stethoscope, Ban as Bandage } from 'lucide-react';
import { MedicalRecordModal } from '../modals';

const Health: React.FC = () => {
  const [activeTab, setActiveTab] = useState('records');
  const [isMedicalRecordModalOpen, setIsMedicalRecordModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Gestion de l'année scolaire
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('health');

  const healthStats = [
    {
      title: 'Consultations/mois',
      value: '234',
      change: '+12',
      icon: Stethoscope,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Élèves suivis',
      value: '1,247',
      change: '+45',
      icon: Users,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Urgences traitées',
      value: '8',
      change: '-3',
      icon: AlertTriangle,
      color: 'from-red-600 to-red-700'
    },
    {
      title: 'Taux de vaccination',
      value: '98.5%',
      change: '+1.2%',
      icon: Shield,
      color: 'from-purple-600 to-purple-700'
    }
  ];

  const medicalRecords = [
    {
      id: 'MED-2024-00001',
      studentName: 'Marie Dubois',
      class: '3ème A',
      birthDate: '2009-03-15',
      bloodType: 'A+',
      allergies: ['Arachides', 'Pénicilline'],
      chronicConditions: ['Asthme léger'],
      medications: ['Ventoline'],
      lastVisit: '2024-01-15',
      vaccinations: 'À jour',
      emergencyContact: 'Jean Dubois - 06 12 34 56 78'
    },
    {
      id: 'MED-2024-00002',
      studentName: 'Pierre Martin',
      class: '2nde B',
      birthDate: '2008-07-22',
      bloodType: 'O-',
      allergies: ['Aucune'],
      chronicConditions: ['Aucune'],
      medications: ['Aucun'],
      lastVisit: '2024-01-10',
      vaccinations: 'À jour',
      emergencyContact: 'Sophie Martin - 06 98 76 54 32'
    },
    {
      id: 'MED-2024-00003',
      studentName: 'Sophie Lambert',
      class: '1ère C',
      birthDate: '2007-11-08',
      bloodType: 'B+',
      allergies: ['Lactose'],
      chronicConditions: ['Diabète type 1'],
      medications: ['Insuline'],
      lastVisit: '2024-01-18',
      vaccinations: 'À renouveler',
      emergencyContact: 'Michel Lambert - 06 55 66 77 88'
    }
  ];

  const consultations = [
    {
      id: 'CONS-2024-001',
      studentName: 'Marie Dubois',
      class: '3ème A',
      date: '2024-01-20',
      time: '10:30',
      reason: 'Maux de tête',
      symptoms: ['Céphalées', 'Fatigue'],
      treatment: 'Repos, hydratation',
      medication: 'Paracétamol 500mg',
      followUp: 'Surveillance 24h',
      severity: 'low',
      status: 'completed'
    },
    {
      id: 'CONS-2024-002',
      studentName: 'Pierre Martin',
      class: '2nde B',
      date: '2024-01-20',
      time: '14:15',
      reason: 'Chute en sport',
      symptoms: ['Douleur genou', 'Œdème'],
      treatment: 'Glace, bandage',
      medication: 'Anti-inflammatoire',
      followUp: 'Contrôle demain',
      severity: 'medium',
      status: 'in-progress'
    },
    {
      id: 'CONS-2024-003',
      studentName: 'Sophie Lambert',
      class: '1ère C',
      date: '2024-01-19',
      time: '09:45',
      reason: 'Contrôle diabète',
      symptoms: ['Aucun'],
      treatment: 'Contrôle glycémie',
      medication: 'Ajustement insuline',
      followUp: 'Suivi hebdomadaire',
      severity: 'medium',
      status: 'completed'
    }
  ];

  const medications = [
    {
      id: 'MED-STOCK-001',
      name: 'Paracétamol 500mg',
      category: 'Antalgique',
      quantity: 150,
      unit: 'comprimés',
      expiryDate: '2025-06-15',
      supplier: 'Pharmacie Centrale',
      cost: 0.15,
      minStock: 50,
      status: 'good'
    },
    {
      id: 'MED-STOCK-002',
      name: 'Désinfectant',
      category: 'Antiseptique',
      quantity: 12,
      unit: 'flacons',
      expiryDate: '2024-12-20',
      supplier: 'Matériel Médical',
      cost: 3.50,
      minStock: 5,
      status: 'good'
    },
    {
      id: 'MED-STOCK-003',
      name: 'Pansements adhésifs',
      category: 'Matériel',
      quantity: 25,
      unit: 'boîtes',
      expiryDate: '2026-03-10',
      supplier: 'Pharmacie Centrale',
      cost: 2.80,
      minStock: 10,
      status: 'low'
    }
  ];

  const emergencyProtocols = [
    {
      id: 'PROT-001',
      title: 'Crise d\'asthme',
      severity: 'high',
      steps: [
        'Calmer l\'élève, position assise',
        'Administrer bronchodilatateur si disponible',
        'Appeler les secours si aggravation',
        'Contacter les parents'
      ],
      equipment: ['Ventoline', 'Chambre d\'inhalation'],
      contacts: ['SAMU: 15', 'Parents']
    },
    {
      id: 'PROT-002',
      title: 'Crise d\'épilepsie',
      severity: 'high',
      steps: [
        'Protéger la tête, écarter les objets',
        'Ne pas maintenir, chronométrer',
        'Position latérale de sécurité après',
        'Appeler secours si > 5min'
      ],
      equipment: ['Coussin', 'Chronomètre'],
      contacts: ['SAMU: 15', 'Parents']
    },
    {
      id: 'PROT-003',
      title: 'Hypoglycémie',
      severity: 'medium',
      steps: [
        'Vérifier glycémie si possible',
        'Donner sucre rapide si conscient',
        'Position allongée jambes surélevées',
        'Surveiller évolution'
      ],
      equipment: ['Glucomètre', 'Sucre', 'Glucagon'],
      contacts: ['Infirmière', 'Parents']
    }
  ];

  const vaccinations = [
    {
      studentName: 'Marie Dubois',
      class: '3ème A',
      vaccines: {
        'DTP': { date: '2023-05-15', nextDue: '2033-05-15', status: 'up-to-date' },
        'ROR': { date: '2022-03-10', nextDue: 'N/A', status: 'up-to-date' },
        'Hépatite B': { date: '2023-01-20', nextDue: 'N/A', status: 'up-to-date' }
      },
      overallStatus: 'complete'
    },
    {
      studentName: 'Pierre Martin',
      class: '2nde B',
      vaccines: {
        'DTP': { date: '2023-08-12', nextDue: '2033-08-12', status: 'up-to-date' },
        'ROR': { date: '2022-06-05', nextDue: 'N/A', status: 'up-to-date' },
        'Hépatite B': { date: '2022-12-15', nextDue: 'N/A', status: 'up-to-date' }
      },
      overallStatus: 'complete'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'good': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'up-to-date': return 'bg-green-100 text-green-800';
      case 'due': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'complete': return 'bg-green-100 text-green-800';
      case 'incomplete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewMedicalRecord = () => {
    setIsEditMode(false);
    setSelectedRecord(null);
    setIsMedicalRecordModalOpen(true);
  };

  const handleEditMedicalRecord = (record: any) => {
    setIsEditMode(true);
    setSelectedRecord(record);
    setIsMedicalRecordModalOpen(true);
  };

  const handleSaveMedicalRecord = (recordData: any) => {
    console.log('Saving medical record:', recordData);
    setIsMedicalRecordModalOpen(false);
    // Ici, vous implémenteriez la logique pour sauvegarder le dossier médical
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Infirmerie & Santé</h1>
          <p className="text-gray-600">Suivi médical et gestion des soins</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Affichage de l'année scolaire actuelle */}
          <CurrentAcademicYearDisplay variant="compact" />
          
          {/* Sélecteur d'année scolaire */}
          <AcademicYearSelector
            value={selectedAcademicYear}
            onChange={setSelectedAcademicYear}
            className="w-full sm:w-auto min-w-[200px]"
          />
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Shield className="w-4 h-4 mr-2" />
            Protocoles urgence
          </button>
          <button 
            onClick={handleNewMedicalRecord}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle consultation
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'records', label: 'Dossiers médicaux', icon: FileText },
              { id: 'consultations', label: 'Consultations', icon: Stethoscope },
              { id: 'medications', label: 'Pharmacie', icon: Pill },
              { id: 'vaccinations', label: 'Vaccinations', icon: Shield },
              { id: 'emergency', label: 'Protocoles urgence', icon: AlertTriangle },
              { id: 'analytics', label: 'Statistiques', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'records' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Dossiers médicaux des élèves</h3>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher élève..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{record.studentName}</h4>
                          <p className="text-sm text-gray-600">{record.class} • {record.id}</p>
                          <p className="text-sm text-gray-500">Né(e) le: {record.birthDate} • Groupe: {record.bloodType}</p>
                          <p className="text-sm text-gray-500">Contact urgence: {record.emergencyContact}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Allergies</p>
                          <p className="text-sm font-medium text-red-600">
                            {record.allergies.length > 0 ? record.allergies.join(', ') : 'Aucune'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Pathologies</p>
                          <p className="text-sm font-medium text-yellow-600">
                            {record.chronicConditions.length > 0 ? record.chronicConditions.join(', ') : 'Aucune'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Traitements</p>
                          <p className="text-sm font-medium text-blue-600">
                            {record.medications.length > 0 ? record.medications.join(', ') : 'Aucun'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Dernière visite: {record.lastVisit}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.vaccinations === 'À jour' ? 'up-to-date' : 'due')}`}>
                          Vaccins: {record.vaccinations}
                        </span>
                        <div className="flex space-x-2 mt-3">
                          <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            onClick={() => handleEditMedicalRecord(record)}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Registre des soins</h3>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Nouvelle consultation
                </button>
              </div>

              <div className="grid gap-4">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{consultation.studentName}</h4>
                          <p className="text-sm text-gray-600">{consultation.class} • {consultation.id}</p>
                          <p className="text-sm text-gray-500">{consultation.date} à {consultation.time}</p>
                          <p className="text-sm text-gray-500">Motif: {consultation.reason}</p>
                        </div>
                      </div>
                      
                      <div className="flex-1 mx-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Symptômes:</p>
                            <p className="text-gray-900">{consultation.symptoms.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Traitement:</p>
                            <p className="text-gray-900">{consultation.treatment}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Médicament:</p>
                            <p className="text-gray-900">{consultation.medication}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Suivi:</p>
                            <p className="text-gray-900">{consultation.followUp}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(consultation.severity)}`}>
                          {consultation.severity === 'low' ? 'Bénin' : 
                           consultation.severity === 'medium' ? 'Modéré' : 'Grave'}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                            {consultation.status === 'completed' ? 'Terminé' : 'En cours'}
                          </span>
                        </p>
                        <div className="flex space-x-2 mt-3">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                            Voir détails
                          </button>
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200">
                            Suivi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'medications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion de la pharmacie</h3>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Inventaire
                  </button>
                  <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Pill className="w-4 h-4 mr-2" />
                    Nouveau médicament
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {medications.map((medication) => (
                  <div key={medication.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                          <Pill className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{medication.name}</h4>
                          <p className="text-sm text-gray-600">{medication.category} • {medication.id}</p>
                          <p className="text-sm text-gray-500">Fournisseur: {medication.supplier}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Stock</p>
                          <p className="text-lg font-bold text-blue-600">{medication.quantity} {medication.unit}</p>
                          <p className="text-xs text-gray-500">Min: {medication.minStock}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Expiration</p>
                          <p className="text-sm font-medium text-gray-900">{medication.expiryDate}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Coût unitaire</p>
                          <p className="text-lg font-bold text-green-600">€{medication.cost}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Statut</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(medication.status)}`}>
                            {medication.status === 'good' ? 'Bon' : 
                             medication.status === 'low' ? 'Stock faible' : 'Expiré'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Alertes pharmacie</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Stock faible - Pansements adhésifs</p>
                      <p className="text-xs text-gray-600">25 boîtes restantes (min: 10)</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Commande reçue - Paracétamol</p>
                      <p className="text-xs text-gray-600">Stock reconstitué</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vaccinations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Suivi des vaccinations</h3>
                <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Shield className="w-4 h-4 mr-2" />
                  Campagne vaccination
                </button>
              </div>

              <div className="grid gap-4">
                {vaccinations.map((vaccination, index) => (
                  <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{vaccination.studentName}</h4>
                          <p className="text-sm text-gray-600">{vaccination.class}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vaccination.overallStatus)}`}>
                            {vaccination.overallStatus === 'complete' ? 'À jour' : 'Incomplet'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 mx-6">
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(vaccination.vaccines).map(([vaccine, info]) => (
                            <div key={vaccine} className="text-center p-3 bg-white rounded-lg">
                              <p className="text-sm font-medium text-gray-900">{vaccine}</p>
                              <p className="text-xs text-gray-600">Fait le: {info.date}</p>
                              {info.nextDue !== 'N/A' && (
                                <p className="text-xs text-gray-500">Rappel: {info.nextDue}</p>
                              )}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(info.status)}`}>
                                {info.status === 'up-to-date' ? 'À jour' : 'À faire'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200">
                          Mettre à jour
                        </button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                          Certificat
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Couverture vaccinale</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">98.5%</p>
                    <p className="text-sm text-gray-600">DTP à jour</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">96.2%</p>
                    <p className="text-sm text-gray-600">ROR à jour</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">94.8%</p>
                    <p className="text-sm text-gray-600">Hépatite B à jour</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Protocoles d'urgence</h3>
                <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Nouveau protocole
                </button>
              </div>

              <div className="grid gap-4">
                {emergencyProtocols.map((protocol) => (
                  <div key={protocol.id} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{protocol.title}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(protocol.severity)}`}>
                            Urgence {protocol.severity === 'high' ? 'élevée' : 'modérée'}
                          </span>
                          
                          <div className="mt-4 grid md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Étapes à suivre:</h5>
                              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                                {protocol.steps.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ol>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-gray-900 mb-2">Matériel nécessaire:</h5>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {protocol.equipment.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                              
                              <h5 className="font-medium text-gray-900 mb-2 mt-4">Contacts d'urgence:</h5>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                {protocol.contacts.map((contact, index) => (
                                  <li key={index}>{contact}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                          Imprimer
                        </button>
                        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                          Former personnel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl p-6 border border-yellow-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Numéros d'urgence</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Phone className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">SAMU</h5>
                    <p className="text-2xl font-bold text-red-600">15</p>
                  </div>
                  <div className="text-center">
                    <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Pompiers</h5>
                    <p className="text-2xl font-bold text-blue-600">18</p>
                  </div>
                  <div className="text-center">
                    <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900">Centre antipoison</h5>
                    <p className="text-lg font-bold text-green-600">01 40 05 48 48</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Statistiques sanitaires</h3>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Consultations</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">234</p>
                      <p className="text-sm text-gray-600">Ce mois</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">12.5</p>
                      <p className="text-sm text-gray-600">Moyenne/jour</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">18.7%</p>
                      <p className="text-sm text-gray-600">Taux de fréquentation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Pathologies fréquentes</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Maux de tête</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full w-3/5"></div>
                        </div>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Maux de ventre</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-600 h-2 rounded-full w-1/4"></div>
                        </div>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Blessures sport</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-red-600 h-2 rounded-full w-1/5"></div>
                        </div>
                        <span className="text-sm font-medium">20%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Indicateurs santé</h4>
                  <div className="space-y-4">
                    <div className="text-center">
                      <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Couverture vaccinale</p>
                      <p className="text-2xl font-bold text-green-600">98.5%</p>
                    </div>
                    <div className="text-center">
                      <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Urgences ce mois</p>
                      <p className="text-2xl font-bold text-yellow-600">8</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Medical Record Modal */}
      <MedicalRecordModal
        isOpen={isMedicalRecordModalOpen}
        onClose={() => setIsMedicalRecordModalOpen(false)}
        onSave={handleSaveMedicalRecord}
        record={selectedRecord}
        isEdit={isEditMode}
        students={[
          { id: 'STD-001', name: 'Marie Dubois' },
          { id: 'STD-002', name: 'Pierre Martin' },
          { id: 'STD-003', name: 'Sophie Lambert' }
        ]}
      />
    </div>
  );
};

export default Health;