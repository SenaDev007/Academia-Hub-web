import { 
  User, 
  UserRole, 
  UserStatus, 
  UserSession, 
  LoginAttempt, 
  TwoFactorAuth,
  PasswordReset,
  UserActivity,
  UserInvitation,
  UserRegistrationData,
  UserLoginData,
  UserProfileData,
  PasswordChangeData,
  TwoFactorSetupData,
  AuthResponse,
  UserListResponse,
  UserFilters,
  UserStats,
  ValidationResult,
  SecurityAlert,
  SystemNotification
} from '../types/user';

class UserService {
  private baseUrl = '/api/users';

  // ===== AUTHENTIFICATION =====
  
  async register(userData: UserRegistrationData): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      const response = await api.user.register(userData);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw new Error('Erreur lors de l\'inscription');
    }
  }

  async login(loginData: UserLoginData): Promise<AuthResponse> {
    try {
      const response = await api.user.login(loginData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw new Error('Erreur lors de la connexion');
    }
  }

  async logout(): Promise<{ success: boolean }> {
    try {
      const response = await api.user.logout();
      return response;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; expiresAt: Date }> {
    try {
      const response = await api.user.refreshToken(refreshToken);
      return response;
    } catch (error) {
      console.error('Erreur lors du refresh du token:', error);
      throw new Error('Erreur lors du refresh du token');
    }
  }

  // ===== GESTION DES UTILISATEURS =====

  async getUsers(filters: UserFilters = {}, page = 1, limit = 20): Promise<UserListResponse> {
    try {
      const response = await api.user.getUsers({ filters, page, limit });
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await api.user.getUserById(userId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.user.createUser(userData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.user.updateUser(userId, userData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.user.deleteUser(userId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw new Error('Erreur lors de la suppression de l\'utilisateur');
    }
  }

  async updateUserStatus(userId: string, status: UserStatus, reason?: string): Promise<{ success: boolean }> {
    try {
      const response = await api.user.updateUserStatus(userId, status, reason);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  }

  // ===== PROFIL UTILISATEUR =====

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.user.getCurrentUser();
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw new Error('Erreur lors de la récupération du profil');
    }
  }

  async updateProfile(profileData: UserProfileData): Promise<User> {
    try {
      const response = await api.user.updateProfile(profileData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw new Error('Erreur lors de la mise à jour du profil');
    }
  }

  async changePassword(passwordData: PasswordChangeData): Promise<{ success: boolean }> {
    try {
      const response = await api.user.changePassword(passwordData);
      return response;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      throw new Error('Erreur lors du changement de mot de passe');
    }
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const response = await api.user.uploadAvatar(file);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
      throw new Error('Erreur lors de l\'upload de l\'avatar');
    }
  }

  // ===== AUTHENTIFICATION À DEUX FACTEURS =====

  async setupTwoFactor(twoFactorData: TwoFactorSetupData): Promise<{ secret?: string; qrCode?: string; backupCodes: string[] }> {
    try {
      const response = await api.user.setupTwoFactor(twoFactorData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la configuration 2FA:', error);
      throw new Error('Erreur lors de la configuration 2FA');
    }
  }

  async verifyTwoFactor(code: string): Promise<{ success: boolean }> {
    try {
      const response = await api.user.verifyTwoFactor(code);
      return response;
    } catch (error) {
      console.error('Erreur lors de la vérification 2FA:', error);
      throw new Error('Erreur lors de la vérification 2FA');
    }
  }

  async disableTwoFactor(): Promise<{ success: boolean }> {
    try {
      const response = await api.user.disableTwoFactor();
      return response;
    } catch (error) {
      console.error('Erreur lors de la désactivation 2FA:', error);
      throw new Error('Erreur lors de la désactivation 2FA');
    }
  }

  // ===== RÉCUPÉRATION DE MOT DE PASSE =====

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.user.requestPasswordReset(email);
      return response;
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      throw new Error('Erreur lors de la demande de réinitialisation');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    try {
      const response = await api.user.resetPassword(token, newPassword);
      return response;
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      throw new Error('Erreur lors de la réinitialisation');
    }
  }

  // ===== INVITATIONS =====

  async inviteUser(email: string, role: UserRole, schoolId?: string): Promise<{ success: boolean; invitationId: string }> {
    try {
      const response = await api.user.inviteUser(email, role, schoolId);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'invitation:', error);
      throw new Error('Erreur lors de l\'invitation');
    }
  }

  async acceptInvitation(token: string, userData: Partial<UserRegistrationData>): Promise<{ success: boolean; user: User }> {
    try {
      const response = await api.user.acceptInvitation(token, userData);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      throw new Error('Erreur lors de l\'acceptation de l\'invitation');
    }
  }

  // ===== STATISTIQUES ET ACTIVITÉ =====

  async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.user.getUserStats();
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  async getUserActivity(userId: string, limit = 50): Promise<UserActivity[]> {
    try {
      const response = await api.user.getUserActivity(userId, limit);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'activité:', error);
      throw new Error('Erreur lors de la récupération de l\'activité');
    }
  }

  async getLoginAttempts(userId?: string, limit = 50): Promise<LoginAttempt[]> {
    try {
      const response = await api.user.getLoginAttempts(userId, limit);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des tentatives de connexion:', error);
      throw new Error('Erreur lors de la récupération des tentatives de connexion');
    }
  }

  // ===== SÉCURITÉ =====

  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    try {
      const response = await api.user.getSecurityAlerts();
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes de sécurité:', error);
      throw new Error('Erreur lors de la récupération des alertes de sécurité');
    }
  }

  async markSecurityAlertAsRead(alertId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.user.markSecurityAlertAsRead(alertId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'alerte:', error);
      throw new Error('Erreur lors de la mise à jour de l\'alerte');
    }
  }

  async forceLogout(userId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.user.forceLogout(userId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la déconnexion forcée:', error);
      throw new Error('Erreur lors de la déconnexion forcée');
    }
  }

  // ===== NOTIFICATIONS =====

  async getNotifications(): Promise<SystemNotification[]> {
    try {
      const response = await api.user.getNotifications();
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw new Error('Erreur lors de la récupération des notifications');
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.user.markNotificationAsRead(notificationId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
      throw new Error('Erreur lors de la mise à jour de la notification');
    }
  }

  // ===== VALIDATION =====

  validateRegistrationData(data: UserRegistrationData): ValidationResult {
    const errors: Record<string, string> = {};

    // Validation du nom
    if (!data.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    } else if (data.firstName.length < 2) {
      errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (!data.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    } else if (data.lastName.length < 2) {
      errors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation de l'email
    if (!data.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    // Validation du téléphone (optionnel)
    if (data.phone && !/^(\+229|229)?[0-9]{8}$/.test(data.phone.replace(/\s/g, ''))) {
      errors.phone = 'Le numéro de téléphone n\'est pas valide';
    }

    // Validation du mot de passe
    if (!data.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (data.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(data.password)) {
      errors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial';
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Validation du rôle
    if (!data.role) {
      errors.role = 'Le rôle est requis';
    }

    // Validation des conditions
    if (!data.acceptTerms) {
      errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    if (!data.acceptPrivacy) {
      errors.acceptPrivacy = 'Vous devez accepter la politique de confidentialité';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  validateLoginData(data: UserLoginData): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.identifier.trim()) {
      errors.identifier = 'L\'email ou le téléphone est requis';
    }

    if (!data.password) {
      errors.password = 'Le mot de passe est requis';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  validatePasswordChangeData(data: PasswordChangeData): ValidationResult {
    const errors: Record<string, string> = {};

    if (!data.currentPassword) {
      errors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!data.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (data.newPassword.length < 8) {
      errors.newPassword = 'Le nouveau mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(data.newPassword)) {
      errors.newPassword = 'Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial';
    }

    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Les nouveaux mots de passe ne correspondent pas';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export const userService = new UserService();
