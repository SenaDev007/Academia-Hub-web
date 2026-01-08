import React, { useState } from 'react';
import { Share2, Link, Mail, MessageSquare, Users, Lock, Eye, Copy, Check } from 'lucide-react';

const ShareFiche = ({ fiche, onShare }) => {
  const [shareOptions, setShareOptions] = useState({
    type: 'link',
    permissions: 'view',
    expiration: '30days',
    password: '',
    requireAuth: false,
    allowComments: true,
    allowDownload: true,
    notifyChanges: false
  });

  const [recipients, setRecipients] = useState([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const shareTypes = [
    {
      id: 'link',
      nom: 'Lien de partage',
      description: 'Générer un lien sécurisé pour partager la fiche',
      icon: Link
    },
    {
      id: 'email',
      nom: 'Par email',
      description: 'Envoyer la fiche par email à des destinataires',
      icon: Mail
    },
    {
      id: 'whatsapp',
      nom: 'WhatsApp',
      description: 'Partager via WhatsApp avec un lien',
      icon: MessageSquare
    },
    {
      id: 'colleagues',
      nom: 'Collègues',
      description: 'Partager avec d\'autres enseignants de l\'établissement',
      icon: Users
    }
  ];

  const permissionLevels = [
    { id: 'view', nom: 'Lecture seule', description: 'Peut seulement consulter la fiche' },
    { id: 'comment', nom: 'Lecture + Commentaires', description: 'Peut consulter et commenter' },
    { id: 'edit', nom: 'Modification', description: 'Peut modifier la fiche (enseignants uniquement)' }
  ];

  const expirationOptions = [
    { id: '1day', nom: '1 jour', description: 'Expire dans 24 heures' },
    { id: '7days', nom: '7 jours', description: 'Expire dans une semaine' },
    { id: '30days', nom: '30 jours', description: 'Expire dans un mois' },
    { id: 'never', nom: 'Jamais', description: 'Lien permanent' }
  ];

  const addRecipient = () => {
    if (newRecipient.trim() && !recipients.includes(newRecipient.trim())) {
      setRecipients([...recipients, newRecipient.trim()]);
      setNewRecipient('');
    }
  };

  const removeRecipient = (email) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const generateShareLink = async () => {
    setIsSharing(true);
    
    try {
      // Simulation de génération de lien
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const linkId = Math.random().toString(36).substring(2, 15);
      const baseUrl = window.location.origin;
      const generatedLink = `${baseUrl}/shared/fiche/${linkId}`;
      
      setShareLink(generatedLink);
      
    } catch (error) {
      console.error('Erreur lors de la génération du lien:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      const shareData = {
        fiche,
        options: shareOptions,
        recipients: shareOptions.type === 'email' ? recipients : [],
        shareLink: shareLink,
        timestamp: new Date().toISOString()
      };
      
      await onShare(shareData);
      
      // Simulation d'envoi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Fiche partagée:', shareData);
      
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const renderShareTypeContent = () => {
    switch (shareOptions.type) {
      case 'link':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium mb-2">Lien de partage</h5>
              {shareLink ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      linkCopied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateShareLink}
                  disabled={isSharing}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSharing ? 'Génération...' : 'Générer le lien'}
                </button>
              )}
            </div>
          </div>
        );
        
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinataires
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                  placeholder="email@exemple.com"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={addRecipient}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Ajouter
                </button>
              </div>
              
              {recipients.length > 0 && (
                <div className="space-y-1">
                  {recipients.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
                      <span className="text-sm">{email}</span>
                      <button
                        onClick={() => removeRecipient(email)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
        
      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Partage WhatsApp</h5>
              <p className="text-sm text-green-800 mb-3">
                Un lien sera généré et formaté pour WhatsApp avec un aperçu de la fiche.
              </p>
              <button
                onClick={() => {
                  const message = `📚 Fiche Pédagogique: ${fiche.titre}\n\n` +
                                `Matière: ${fiche.matiere}\n` +
                                `Classe: ${fiche.classe}\n` +
                                `Date: ${fiche.date}\n\n` +
                                `Consultez la fiche complète: ${shareLink || '[Lien à générer]'}`;
                  
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                disabled={!shareLink}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Ouvrir WhatsApp
              </button>
            </div>
          </div>
        );
        
      case 'colleagues':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Partage avec les collègues</h5>
              <p className="text-sm text-blue-800 mb-3">
                La fiche sera partagée dans l'espace collaboratif de votre établissement.
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Notifier tous les enseignants de la matière</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Ajouter à la bibliothèque partagée</span>
                </label>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Partager la fiche pédagogique
        </h3>
      </div>

      {/* Informations de la fiche */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Fiche à partager</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><span className="font-medium">Titre:</span> {fiche.titre}</p>
          <p><span className="font-medium">Matière:</span> {fiche.matiere}</p>
          <p><span className="font-medium">Classe:</span> {fiche.classe}</p>
          <p><span className="font-medium">Date:</span> {fiche.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Types de partage */}
        <div className="space-y-3">
          <h4 className="font-medium">Mode de partage</h4>
          {shareTypes.map(type => {
            const Icon = type.icon;
            
            return (
              <div
                key={type.id}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  shareOptions.type === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setShareOptions({...shareOptions, type: type.id})}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm">{type.nom}</div>
                    <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contenu spécifique au type */}
        <div className="col-span-2 space-y-4">
          {renderShareTypeContent()}
          
          {/* Options de sécurité */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Options de sécurité
            </h5>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau de permission
                </label>
                <select
                  value={shareOptions.permissions}
                  onChange={(e) => setShareOptions({...shareOptions, permissions: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {permissionLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.nom} - {level.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration
                </label>
                <select
                  value={shareOptions.expiration}
                  onChange={(e) => setShareOptions({...shareOptions, expiration: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  {expirationOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.nom} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe (optionnel)
                </label>
                <input
                  type="password"
                  value={shareOptions.password}
                  onChange={(e) => setShareOptions({...shareOptions, password: e.target.value})}
                  placeholder="Laisser vide pour aucun mot de passe"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shareOptions.requireAuth}
                    onChange={(e) => setShareOptions({
                      ...shareOptions,
                      requireAuth: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Exiger une authentification</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shareOptions.allowComments}
                    onChange={(e) => setShareOptions({
                      ...shareOptions,
                      allowComments: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Autoriser les commentaires</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shareOptions.allowDownload}
                    onChange={(e) => setShareOptions({
                      ...shareOptions,
                      allowDownload: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Autoriser le téléchargement</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shareOptions.notifyChanges}
                    onChange={(e) => setShareOptions({
                      ...shareOptions,
                      notifyChanges: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm">Notifier les modifications</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleShare}
          disabled={isSharing || (shareOptions.type === 'email' && recipients.length === 0)}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSharing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Partage en cours...
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Partager la fiche
            </>
          )}
        </button>
      </div>

      {/* Conseils de sécurité */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Conseils de sécurité</h4>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>• Utilisez des mots de passe pour les contenus sensibles</p>
          <p>• Définissez une date d'expiration pour les liens temporaires</p>
          <p>• Vérifiez les permissions avant de partager</p>
          <p>• Surveillez qui accède à vos fiches partagées</p>
        </div>
      </div>
    </div>
  );
};

export default ShareFiche;