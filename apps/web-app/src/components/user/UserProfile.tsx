import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Settings, 
  Camera, 
  Save, 
  Edit, 
  Lock, 
  Bell, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfileData, PasswordChangeData, UserPreferences, NotificationSettings } from '../../types/user';
import { userService } from '../../services/userService';
import { useUser } from '../../contexts/UserContext';

const UserProfile: React.FC = () => {
  const { user, updateProfile, changePassword, isLoading, error, clearError } = useUser();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Données du profil
  const [profileData, setProfileData] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    department: '',
    position: '',
    preferences: {
      language: 'fr',
      theme: 'auto',
      notifications: {
        email: true,
        sms: false,
        push: true,
        loginAlerts: true,
        securityAlerts: true,
        systemUpdates: true,
        marketing: false
      },
      timezone: 'Africa/Porto-Novo',
      dateFormat: 'DD/MM/YYYY',
      currency: 'XOF'
    }
  });

  // Données de changement de mot de passe
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [validation, setValidation] = useState<{ [key: string]: string }>({});

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || '',
        department: user.department || '',
        position: user.position || '',
        preferences: user.preferences
      });
    }
  }, [user]);

  // Gestion des changements de profil
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('preferences.')) {
      const prefKey = name.replace('preferences.', '');
      setProfileData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.startsWith('notifications.')) {
      const notifKey = name.replace('notifications.', '');
      setProfileData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notifications: {
            ...prev.preferences.notifications,
            [notifKey]: checked
          }
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Nettoyer les erreurs de validation
    if (validation[name]) {
      setValidation(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Gestion des changements de mot de passe
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (validation[name]) {
      setValidation(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Sauvegarde du profil
  const handleSaveProfile = async () => {
    try {
      const success = await updateProfile(profileData);
      if (success) {
        setIsEditing(false);
        setValidation({});
      }
    } catch (error: any) {
      setValidation({ general: error.message });
    }
  };

  // Changement de mot de passe
  const handleChangePassword = async () => {
    try {
      const result = userService.validatePasswordChangeData(passwordData);
      if (!result.isValid) {
        setValidation(result.errors);
        return;
      }

      const success = await changePassword(passwordData);
      if (success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
        setValidation({});
      }
    } catch (error: any) {
      setValidation({ general: error.message });
    }
  };

  // Upload d'avatar
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const result = await userService.uploadAvatar(file);
        setProfileData(prev => ({ ...prev, avatar: result.avatarUrl }));
      } catch (error: any) {
        setValidation({ avatar: error.message });
      }
    }
  };

  // Obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Obtenir le libellé du rôle
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Administrateur',
      hr_manager: 'Responsable RH',
      finance_manager: 'Responsable Finances',
      teacher: 'Enseignant',
      staff: 'Personnel',
      parent: 'Parent',
      student: 'Élève'
    };
    return labels[role] || role;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête du profil */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                user.firstName[0] + user.lastName[0]
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Informations principales */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.fullName}
              </h1>
              {getStatusIcon(user.status)}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                {getRoleLabel(user.role)}
              </div>
              
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {user.email}
              </div>
              
              {user.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {user.phone}
                </div>
              )}
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Membre depuis {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profil', icon: User },
              { id: 'security', label: 'Sécurité', icon: Lock },
              { id: 'preferences', label: 'Préférences', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
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
          {/* Onglet Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600'
                    } text-gray-900 dark:text-white`}
                  />
                  {validation.firstName && (
                    <p className="mt-1 text-sm text-red-600">{validation.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600'
                    } text-gray-900 dark:text-white`}
                  />
                  {validation.lastName && (
                    <p className="mt-1 text-sm text-red-600">{validation.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600'
                    } text-gray-900 dark:text-white`}
                  />
                  {validation.email && (
                    <p className="mt-1 text-sm text-red-600">{validation.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600'
                    } text-gray-900 dark:text-white`}
                    placeholder="+229 XX XX XX XX"
                  />
                  {validation.phone && (
                    <p className="mt-1 text-sm text-red-600">{validation.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Département
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600'
                    } text-gray-900 dark:text-white`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Poste
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={profileData.position}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isEditing 
                        ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600'
                    } text-gray-900 dark:text-white`}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Pour des raisons de sécurité, la modification de l'email nécessite une vérification.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Changer le mot de passe
                </h3>
                
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </button>
                ) : (
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mot de passe actuel *
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validation.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{validation.currentPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nouveau mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validation.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{validation.newPassword}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmer le nouveau mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {validation.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{validation.confirmPassword}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Changement...' : 'Changer le mot de passe'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setValidation({});
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Préférences */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Langue
                  </label>
                  <select
                    name="preferences.language"
                    value={profileData.preferences.language}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thème
                  </label>
                  <select
                    name="preferences.theme"
                    value={profileData.preferences.theme}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Notifications
                </h3>
                <div className="space-y-4">
                  {Object.entries(profileData.preferences.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        {key === 'email' && 'Notifications par email'}
                        {key === 'sms' && 'Notifications par SMS'}
                        {key === 'push' && 'Notifications push'}
                        {key === 'loginAlerts' && 'Alertes de connexion'}
                        {key === 'securityAlerts' && 'Alertes de sécurité'}
                        {key === 'systemUpdates' && 'Mises à jour système'}
                        {key === 'marketing' && 'Communications marketing'}
                      </label>
                      <input
                        type="checkbox"
                        name={`notifications.${key}`}
                        checked={value}
                        onChange={handleProfileChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
