import React, { useState } from 'react';
import { MessageSquare, Send, User, Clock, CheckCircle, AlertCircle, Edit3, Trash2 } from 'lucide-react';

const CommentaireValidator = ({ fiche, commentaires, onAddComment, onUpdateComment, onDeleteComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('suggestion');
  const [editingComment, setEditingComment] = useState(null);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      contenu: newComment,
      type: commentType,
      auteur: currentUser.nom,
      role: currentUser.role,
      date: new Date().toISOString(),
      ficheId: fiche.id,
      statut: 'actif'
    };

    onAddComment(comment);
    setNewComment('');
    setCommentType('suggestion');
  };

  const handleUpdateComment = (commentId, newContent) => {
    onUpdateComment(commentId, {
      contenu: newContent,
      dateModification: new Date().toISOString()
    });
    setEditingComment(null);
  };

  const getCommentIcon = (type) => {
    switch (type) {
      case 'correction':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'validation':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'question':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCommentColor = (type) => {
    switch (type) {
      case 'correction':
        return 'border-l-red-500 bg-red-50';
      case 'validation':
        return 'border-l-green-500 bg-green-50';
      case 'question':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Directeur':
        return 'bg-purple-100 text-purple-800';
      case 'Conseiller pédagogique':
        return 'bg-blue-100 text-blue-800';
      case 'Enseignant':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Commentaires et Corrections ({commentaires.length})
        </h3>
      </div>

      {/* Formulaire d'ajout de commentaire */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">{currentUser.nom}</span>
              <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.role}
              </span>
            </div>
            
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="suggestion">Suggestion</option>
              <option value="correction">Correction requise</option>
              <option value="validation">Validation</option>
              <option value="question">Question</option>
            </select>
          </div>
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ajoutez votre commentaire, suggestion ou correction..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            rows="3"
          />
          
          <div className="flex justify-end">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Send className="w-4 h-4" />
              Envoyer le commentaire
            </button>
          </div>
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-4">
        {commentaires.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun commentaire pour cette fiche</p>
            <p className="text-sm">Soyez le premier à ajouter un commentaire ou une suggestion</p>
          </div>
        ) : (
          commentaires.map(comment => (
            <div
              key={comment.id}
              className={`border-l-4 pl-4 py-3 rounded-r-lg ${getCommentColor(comment.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCommentIcon(comment.type)}
                    <span className="font-medium text-sm">{comment.auteur}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(comment.role)}`}>
                      {comment.role}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.date).toLocaleString()}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      comment.type === 'correction' ? 'bg-red-100 text-red-800' :
                      comment.type === 'validation' ? 'bg-green-100 text-green-800' :
                      comment.type === 'question' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {comment.type === 'correction' ? 'Correction' :
                       comment.type === 'validation' ? 'Validation' :
                       comment.type === 'question' ? 'Question' : 'Suggestion'}
                    </span>
                  </div>
                  
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        defaultValue={comment.contenu}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        rows="3"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleUpdateComment(comment.id, e.target.value);
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            const textarea = e.target.closest('.space-y-2').querySelector('textarea');
                            handleUpdateComment(comment.id, textarea.value);
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.contenu}</p>
                  )}
                  
                  {comment.dateModification && (
                    <p className="text-xs text-gray-500 mt-1">
                      Modifié le {new Date(comment.dateModification).toLocaleString()}
                    </p>
                  )}
                </div>
                
                {(currentUser.id === comment.auteurId || currentUser.role === 'Directeur') && (
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => setEditingComment(comment.id)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                      title="Modifier"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistiques des commentaires */}
      {commentaires.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Résumé des commentaires</h4>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {commentaires.filter(c => c.type === 'correction').length}
              </div>
              <div className="text-gray-600">Corrections</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {commentaires.filter(c => c.type === 'suggestion').length}
              </div>
              <div className="text-gray-600">Suggestions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {commentaires.filter(c => c.type === 'validation').length}
              </div>
              <div className="text-gray-600">Validations</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {commentaires.filter(c => c.type === 'question').length}
              </div>
              <div className="text-gray-600">Questions</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentaireValidator;