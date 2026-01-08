import React, { useState } from 'react';
import FormModal from './FormModal';
import { MessageSquare, Send, Users, Mail, Phone, Bell } from 'lucide-react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: any) => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  onSend
}) => {
  const [formData, setFormData] = useState({
    type: 'email',
    recipients: 'all',
    subject: '',
    content: '',
    schedule: false,
    scheduleDate: '',
    scheduleTime: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend(formData);
    onClose();
  };

  const getTypeIcon = () => {
    switch (formData.type) {
      case 'sms':
        return <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'notification':
        return <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Composer un message"
      size="lg"
      footer={
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
            form="message-form"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            Envoyer
          </button>
        </div>
      }
    >
      <form id="message-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de message*
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="notification">Notification push</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Destinataires*
            </label>
            <select
              id="recipients"
              name="recipients"
              value={formData.recipients}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tous les parents</option>
              <option value="class_3a">Parents 3ème A</option>
              <option value="class_2b">Parents 2nde B</option>
              <option value="class_1c">Parents 1ère C</option>
              <option value="teachers">Tous les enseignants</option>
              <option value="custom">Sélection personnalisée</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Objet*
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Objet du message..."
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contenu du message*
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Tapez votre message ici..."
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="schedule"
            name="schedule"
            checked={formData.schedule}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="schedule" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Programmer l'envoi
          </label>
        </div>
        
        {formData.schedule && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date d'envoi*
              </label>
              <input
                type="date"
                id="scheduleDate"
                name="scheduleDate"
                value={formData.scheduleDate}
                onChange={handleChange}
                required={formData.schedule}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure d'envoi*
              </label>
              <input
                type="time"
                id="scheduleTime"
                name="scheduleTime"
                value={formData.scheduleTime}
                onChange={handleChange}
                required={formData.schedule}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            {getTypeIcon()}
            <span className="ml-2">Aperçu du message</span>
          </h4>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              À: {formData.recipients === 'all' ? 'Tous les parents' : 
                  formData.recipients === 'teachers' ? 'Tous les enseignants' : 
                  formData.recipients.startsWith('class_') ? `Parents ${formData.recipients.replace('class_', '').toUpperCase()}` : 
                  'Sélection personnalisée'}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {formData.subject || 'Objet du message'}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {formData.content || 'Votre message apparaîtra ici...'}
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Destinataires estimés:</span>
              <span className="font-medium">1,247 parents</span>
            </div>
            {formData.type === 'sms' && (
              <div className="flex justify-between mt-1">
                <span>Coût estimé:</span>
                <span className="font-medium">€12.47</span>
              </div>
            )}
            <div className="flex justify-between mt-1">
              <span>Taux de lecture prévu:</span>
              <span className="font-medium text-green-600 dark:text-green-400">92%</span>
            </div>
          </div>
        </div>
      </form>
    </FormModal>
  );
};

export default MessageModal;