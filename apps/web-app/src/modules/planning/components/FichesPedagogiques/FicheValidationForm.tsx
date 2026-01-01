import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Send, AlertTriangle, Award, Clock, User } from 'lucide-react';

const FicheValidationForm = ({ fiche, onValidated, onClose }) => {
  const [action, setAction] = useState('');
  const [commentaires, setCommentaires] = useState('');
  const [corrections, setCorrections] = useState({
    competences: '',
    objectifs: '',
    deroulement: '',
    strategies: '',
    general: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const ficheData = fiche || {
    id: 1,
    titre: "Les fractions - Addition et soustraction",
    enseignant: "M. KOUASSI Jean",
    matiere: "Mathématiques",
    classe: "6ème",
    saNumero: "SA 3",
    dateEnvoi: "2025-01-18 14:30",
    commentaireEnseignant: "Première version de ma fiche sur les fractions"
  };

  const actionsDisponibles = [
    {
      id: 'valider',
      nom: 'Valider la fiche',
      description: 'Approuver la fiche sans modifications',
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-900'
    },
    {
      id: 'corriger',
      nom: 'Demander des corrections',
      description: 'Renvoyer avec des corrections à apporter',
      icon: MessageSquare,
      color: 'orange',
      bgColor: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-900'
    },
    {
      id: 'rejeter',
      nom: 'Rejeter la fiche',
      description: 'Refuser la fiche (à revoir complètement)',
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-900'
    }
  ];

  const sectionsCorrections = [
    { id: 'competences', nom: 'Compétences', description: 'Corrections sur les compétences définies' },
    { id: 'objectifs', nom: 'Objectifs spécifiques', description: 'Corrections sur les objectifs' },
    { id: 'deroulement', nom: 'Déroulement', description: 'Corrections sur les phases et activités' },
    { id: 'strategies', nom: 'Stratégies d\'enseignement', description: 'Corrections sur les méthodes pédagogiques' },
    { id: 'general', nom: 'Remarques générales', description: 'Autres observations et conseils' }
  ];

  const handleSubmit = async () => {
    if (!action) {
      alert('Veuillez sélectionner une action');
      return;
    }

    if (action !== 'valider' && !commentaires.trim()) {
      alert('Veuillez ajouter des commentaires pour cette action');
      return;
    }

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulation de l'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Préparer les données de validation
      const validationData = {
        ficheId: ficheData.id,
        action,
        commentaires,
        corrections: action === 'corriger' ? corrections : {},
        directeur: 'Directeur ASSOGBA Pierre',
        dateValidation: new Date().toISOString()
      };

      console.log('Validation envoyée:', validationData);

      // Notification de succès
      let message = '';
      switch (action) {
        case 'valider':
          message = '✅ Fiche validée avec succès !\n\nL\'enseignant a été notifié par WhatsApp de la validation.';
          break;
        case 'corriger':
          message = '📝 Corrections envoyées avec succès !\n\nL\'enseignant a été notifié par WhatsApp des corrections à apporter.';
          break;
        case 'rejeter':
          message = '❌ Fiche rejetée avec succès !\n\nL\'enseignant a été notifié par WhatsApp du rejet avec les motifs.';
          break;
      }

      alert(message);
      onValidated();

    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('❌ Erreur lors de l\'envoi de la validation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showConfirmation) {
    const selectedAction = actionsDisponibles.find(a => a.id === action);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowConfirmation(false)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h2 className="text-xl font-semibold">Confirmer la validation</h2>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              action === 'valider' ? 'bg-green-100' :
              action === 'corriger' ? 'bg-orange-100' : 'bg-red-100'
            }`}>
              <selectedAction.icon className={`w-6 h-6 ${
                action === 'valider' ? 'text-green-600' :
                action === 'corriger' ? 'text-orange-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{selectedAction.nom}</h3>
              <p className="text-sm text-gray-600">{selectedAction.description}</p>
            </div>
          </div>

          {/* Résumé de la fiche */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium mb-2">Fiche concernée :</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Titre:</span> {ficheData.titre}</p>
              <p><span className="font-medium">Enseignant:</span> {ficheData.enseignant}</p>
              <p><span className="font-medium">Matière/Classe:</span> {ficheData.matiere} - {ficheData.classe}</p>
              <p><span className="font-medium">SA N°:</span> {ficheData.saNumero}</p>
            </div>
          </div>

          {/* Résumé des commentaires */}
          {commentaires && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Vos commentaires :</h4>
              <div className="text-sm text-blue-800 whitespace-pre-wrap">{commentaires}</div>
            </div>
          )}

          {/* Résumé des corrections */}
          {action === 'corriger' && Object.values(corrections).some(c => c.trim()) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-orange-900 mb-2">Corrections détaillées :</h4>
              <div className="space-y-2 text-sm text-orange-800">
                {sectionsCorrections.map(section => (
                  corrections[section.id] && (
                    <div key={section.id}>
                      <span className="font-medium">{section.nom}:</span> {corrections[section.id]}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Ce qui va se passer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Ce qui va se passer :</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• L'enseignant recevra une notification sur la plateforme</p>
              <p>• Une notification WhatsApp sera envoyée automatiquement</p>
              <p>• Le statut de la fiche sera mis à jour</p>
              {action === 'valider' && <p>• La fiche sera marquée comme validée définitivement</p>}
              {action === 'corriger' && <p>• L'enseignant pourra modifier et renvoyer la fiche</p>}
              {action === 'rejeter' && <p>• L'enseignant devra créer une nouvelle fiche</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirmation(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 ${
                action === 'valider' ? 'bg-green-600' :
                action === 'corriger' ? 'bg-orange-600' : 'bg-red-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Confirmer {selectedAction.nom.toLowerCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <h2 className="text-xl font-semibold">Validation de la fiche</h2>
      </div>

      {/* Informations de la fiche */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Fiche à valider</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Titre:</span> {ficheData.titre}</div>
            <div><span className="font-medium">Enseignant:</span> {ficheData.enseignant}</div>
            <div><span className="font-medium">Matière:</span> {ficheData.matiere}</div>
            <div><span className="font-medium">Classe:</span> {ficheData.classe}</div>
          </div>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">SA N°:</span> {ficheData.saNumero}</div>
            <div><span className="font-medium">Reçue le:</span> {ficheData.dateEnvoi}</div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="text-orange-600 font-medium">En attente depuis 2 jours</span>
            </div>
          </div>
        </div>

        {ficheData.commentaireEnseignant && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-sm font-medium text-blue-900 mb-1">Message de l'enseignant:</div>
            <div className="text-sm text-blue-800 italic">"{ficheData.commentaireEnseignant}"</div>
          </div>
        )}
      </div>

      {/* Sélection de l'action */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Décision de validation</h3>
        
        <div className="space-y-3">
          {actionsDisponibles.map(actionItem => {
            const Icon = actionItem.icon;
            
            return (
              <div
                key={actionItem.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  action === actionItem.id
                    ? `${actionItem.bgColor} border-${actionItem.color}-300`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setAction(actionItem.id)}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${
                    action === actionItem.id 
                      ? `text-${actionItem.color}-600` 
                      : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <div className={`font-medium ${
                      action === actionItem.id ? actionItem.textColor : 'text-gray-900'
                    }`}>
                      {actionItem.nom}
                    </div>
                    <div className="text-sm text-gray-600">{actionItem.description}</div>
                  </div>
                  {action === actionItem.id && (
                    <CheckCircle className={`w-5 h-5 text-${actionItem.color}-600`} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commentaires généraux */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Commentaires et observations</h3>
        
        <textarea
          value={commentaires}
          onChange={(e) => setCommentaires(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
          rows="4"
          placeholder={
            action === 'valider' ? 'Commentaires positifs ou suggestions d\'amélioration (optionnel)...' :
            action === 'corriger' ? 'Décrivez les corrections à apporter...' :
            action === 'rejeter' ? 'Expliquez les motifs du rejet...' :
            'Sélectionnez d\'abord une action ci-dessus...'
          }
          disabled={!action}
        />
        
        {action && action !== 'valider' && (
          <div className="mt-2 text-sm text-gray-600">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Ces commentaires seront envoyés à l'enseignant par notification et WhatsApp
          </div>
        )}
      </div>

      {/* Corrections détaillées (si action = corriger) */}
      {action === 'corriger' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Corrections détaillées par section</h3>
          
          <div className="space-y-4">
            {sectionsCorrections.map(section => (
              <div key={section.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {section.nom}
                </label>
                <textarea
                  value={corrections[section.id]}
                  onChange={(e) => setCorrections({
                    ...corrections,
                    [section.id]: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                  rows="2"
                  placeholder={section.description}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
            <div className="text-sm text-orange-800">
              <strong>Note:</strong> Ces corrections détaillées aideront l'enseignant à améliorer sa fiche de manière ciblée.
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!action || (action !== 'valider' && !commentaires.trim())}
          className={`px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
            action === 'valider' ? 'bg-green-600' :
            action === 'corriger' ? 'bg-orange-600' :
            action === 'rejeter' ? 'bg-red-600' : 'bg-gray-400'
          }`}
        >
          {action === 'valider' ? 'Valider la fiche' :
           action === 'corriger' ? 'Envoyer les corrections' :
           action === 'rejeter' ? 'Rejeter la fiche' : 'Sélectionner une action'}
        </button>
      </div>
    </div>
  );
};

export default FicheValidationForm;