import React from 'react';
import { useState } from 'react';
import { ArrowLeft, Edit, Download, Send, Calendar, Clock, BookOpen, Target, Users, FileText, Eye, MessageCircle } from 'lucide-react';
import { CahierJournalEntry } from './types';
import { NotificationService } from "./services/NotificationService";
import ValidationWorkflow from './ValidationWorkflow';

interface CahierJournalViewProps {
  entry: CahierJournalEntry;
  onEdit: () => void;
  onBack: () => void;
}

const CahierJournalView: React.FC<CahierJournalViewProps> = ({ entry, onEdit, onBack }) => {
  const [showValidation, setShowValidation] = useState(false);

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'Planifiée';
      case 'en_cours': return 'En cours';
      case 'realise': return 'Réalisée';
      case 'reporte': return 'Reportée';
      case 'valide': return 'Validée';
      default: return statut;
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'bg-blue-100 text-blue-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'realise': return 'bg-green-100 text-green-800';
      case 'reporte': return 'bg-orange-100 text-orange-800';
      case 'valide': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitForValidation = (entry: CahierJournalEntry, comment?: string) => {
    const notificationService = NotificationService.getInstance();
    const message = notificationService.generateWhatsAppMessage(
      'submit',
      entry,
      entry.enseignant,
      comment
    );
    
    notificationService.sendWhatsAppNotification(
      '22997123456', // Numéro du directeur
      message,
      entry.id
    ).then(result => {
      if (result.success) {
        alert('✅ Séance soumise pour validation. Le directeur a été notifié par WhatsApp.');
      } else {
        alert(`⚠️ Séance soumise mais erreur d'envoi WhatsApp: ${result.error}`);
      }
    });
  };

  const handleApprove = (workflowId: string, comment?: string) => {
    const notificationService = NotificationService.getInstance();
    const message = notificationService.generateWhatsAppMessage(
      'approve',
      entry,
      'Directeur',
      comment
    );
    
    notificationService.sendWhatsAppNotification(
      '22912345678', // Numéro de l'enseignant
      message,
      entry.id
    ).then(result => {
      if (result.success) {
        alert('✅ Séance approuvée. L\'enseignant a été notifié par WhatsApp.');
      } else {
        alert(`⚠️ Séance approuvée mais erreur d'envoi WhatsApp: ${result.error}`);
      }
    });
  };

  const handleReject = (workflowId: string, comment: string) => {
    const notificationService = NotificationService.getInstance();
    const message = notificationService.generateWhatsAppMessage(
      'reject',
      entry,
      'Directeur',
      comment
    );
    
    notificationService.sendWhatsAppNotification(
      '22912345678', // Numéro de l'enseignant
      message,
      entry.id
    ).then(result => {
      if (result.success) {
        alert('❌ Séance rejetée. L\'enseignant a été notifié par WhatsApp.');
      } else {
        alert(`⚠️ Séance rejetée mais erreur d'envoi WhatsApp: ${result.error}`);
      }
    });
  };

  const handleReturn = (workflowId: string, comment: string) => {
    const notificationService = NotificationService.getInstance();
    const message = notificationService.generateWhatsAppMessage(
      'return',
      entry,
      'Directeur',
      comment
    );
    
    notificationService.sendWhatsAppNotification(
      '22912345678', // Numéro de l'enseignant
      message,
      entry.id
    ).then(result => {
      if (result.success) {
        alert('🔄 Séance retournée pour révision. L\'enseignant a été notifié par WhatsApp.');
      } else {
        alert(`⚠️ Séance retournée mais erreur d'envoi WhatsApp: ${result.error}`);
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <BookOpen className="text-blue-600" />
                  {entry.matiere} - {entry.classe}
                </h1>
                <p className="text-gray-600 mt-1">
                  {new Date(entry.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(entry.statut)}`}>
                {getStatutLabel(entry.statut)}
              </span>
              <button
                onClick={onEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mr-2"
              >
                <Edit size={16} />
                Modifier
              </button>
              <button
                onClick={() => setShowValidation(!showValidation)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <MessageCircle size={16} />
                Validation
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Validation Workflow */}
          {showValidation && (
            <ValidationWorkflow
              entry={entry}
              onSubmitForValidation={handleSubmitForValidation}
              onApprove={handleApprove}
              onReject={handleReject}
              onReturn={handleReturn}
              currentUserRole="enseignant"
            />
          )}

          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar size={16} />
                <span className="text-sm font-medium">Date</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {new Date(entry.date).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Users size={16} />
                <span className="text-sm font-medium">Classe</span>
              </div>
              <p className="text-gray-900 font-semibold">{entry.classe}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <BookOpen size={16} />
                <span className="text-sm font-medium">Matière</span>
              </div>
              <p className="text-gray-900 font-semibold">{entry.matiere}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Clock size={16} />
                <span className="text-sm font-medium">Durée</span>
              </div>
              <p className="text-gray-900 font-semibold">{entry.duree} minutes</p>
            </div>
          </div>

          {/* Objectifs pédagogiques */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="text-blue-600" size={20} />
              Objectifs pédagogiques
            </h3>
            <p className="text-gray-700 leading-relaxed">{entry.objectifs}</p>
          </div>

          {/* Compétences visées */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compétences visées</h3>
            <div className="flex flex-wrap gap-3">
              {entry.competences.map((competence, index) => (
                <span key={index} className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {competence}
                </span>
              ))}
            </div>
          </div>

          {/* Déroulement prévu */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="text-gray-600" size={20} />
              Déroulement prévu
            </h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                {entry.deroulement}
              </pre>
            </div>
          </div>

          {/* Supports et matériels */}
          {entry.supports && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Supports et matériels</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700">{entry.supports}</p>
              </div>
            </div>
          )}

          {/* Modalités d'évaluation */}
          {entry.evaluation && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="text-gray-600" size={20} />
                Modalités d'évaluation
              </h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-700">{entry.evaluation}</p>
              </div>
            </div>
          )}

          {/* Observations */}
          {entry.observations && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Observations et adaptations</h3>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-gray-700">{entry.observations}</p>
              </div>
            </div>
          )}

          {/* Métadonnées */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                <p>Enseignant: <span className="font-medium">{entry.enseignant}</span></p>
                <p>Créé le: {new Date(entry.createdAt).toLocaleDateString('fr-FR')} à {new Date(entry.createdAt).toLocaleTimeString('fr-FR')}</p>
                {entry.updatedAt !== entry.createdAt && (
                  <p>Modifié le: {new Date(entry.updatedAt).toLocaleDateString('fr-FR')} à {new Date(entry.updatedAt).toLocaleTimeString('fr-FR')}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  onClick={() => handleSubmitForValidation(entry, 'Séance prête pour validation')}
                  <Send size={16} />
                  Envoyer pour validation
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  onClick={() => {
                    alert('Export PDF en cours...');
                    setTimeout(() => alert('PDF généré avec succès !'), 1500);
                  }}
                  <Download size={16} />
                  Exporter PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CahierJournalView;