/**
 * ============================================================================
 * USER ROLE ENUM - HIÉRARCHIE OFFICIELLE
 * ============================================================================
 * 
 * Ordre hiérarchique strict (du plus puissant au plus restreint)
 * 
 * ============================================================================
 */

export enum UserRole {
  // 🟥 NIVEAU PLATEFORME (GLOBAL)
  SUPER_ADMIN = 'SUPER_ADMIN', // Academia Hub - Plateforme interne

  // 🟧 NIVEAU ÉCOLE — GOUVERNANCE
  PROMOTEUR = 'PROMOTEUR', // Propriétaire établissement
  DIRECTEUR = 'DIRECTEUR', // Gestion opérationnelle

  // 🟩 NIVEAU ÉCOLE — ADMINISTRATION
  SECRETAIRE = 'SECRETAIRE', // Administration scolaire
  COMPTABLE = 'COMPTABLE', // Finances uniquement
  SECRETAIRE_COMPTABLE = 'SECRETAIRE_COMPTABLE', // Fusion Secrétaire + Comptable

  // 🟦 NIVEAU PÉDAGOGIQUE — SECONDAIRE
  CENSEUR = 'CENSEUR', // Discipline secondaire
  SURVEILLANT = 'SURVEILLANT', // Vie scolaire secondaire

  // 🟨 NIVEAU ENSEIGNEMENT
  ENSEIGNANT = 'ENSEIGNANT', // Instituteur/Professeur

  // 🟩 NIVEAU FAMILLE
  PARENT = 'PARENT', // Parent/Tuteur
  ELEVE = 'ELEVE', // Élève
}

/**
 * Portails d'accès autorisés
 */
export enum Portal {
  PLATEFORME = 'PLATEFORME', // Plateforme interne (Super Admin)
  ECOLE = 'ECOLE', // Portail École
  ENSEIGNANT = 'ENSEIGNANT', // Portail Enseignant
  PARENT_ELEVE = 'PARENT_ELEVE', // Portail Parents & Élèves
}

/**
 * Association stricte Rôle ↔ Portail
 */
export const ROLE_PORTAL_MAP: Record<UserRole, Portal> = {
  [UserRole.SUPER_ADMIN]: Portal.PLATEFORME,
  [UserRole.PROMOTEUR]: Portal.ECOLE,
  [UserRole.DIRECTEUR]: Portal.ECOLE,
  [UserRole.SECRETAIRE]: Portal.ECOLE,
  [UserRole.COMPTABLE]: Portal.ECOLE,
  [UserRole.SECRETAIRE_COMPTABLE]: Portal.ECOLE,
  [UserRole.CENSEUR]: Portal.ECOLE,
  [UserRole.SURVEILLANT]: Portal.ECOLE,
  [UserRole.ENSEIGNANT]: Portal.ENSEIGNANT,
  [UserRole.PARENT]: Portal.PARENT_ELEVE,
  [UserRole.ELEVE]: Portal.PARENT_ELEVE,
};

/**
 * Hiérarchie des rôles (niveau de pouvoir)
 * Plus le nombre est élevé, plus le rôle est puissant
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.PROMOTEUR]: 90,
  [UserRole.DIRECTEUR]: 80,
  [UserRole.SECRETAIRE_COMPTABLE]: 70,
  [UserRole.SECRETAIRE]: 60,
  [UserRole.COMPTABLE]: 60,
  [UserRole.CENSEUR]: 50,
  [UserRole.SURVEILLANT]: 40,
  [UserRole.ENSEIGNANT]: 30,
  [UserRole.PARENT]: 20,
  [UserRole.ELEVE]: 10,
};

/**
 * Vérifie si un rôle a un niveau hiérarchique supérieur ou égal à un autre
 */
export function hasRoleHierarchy(role: UserRole, minRole: UserRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Vérifie si un rôle peut accéder à un portail
 */
export function canAccessPortal(role: UserRole, portal: Portal): boolean {
  return ROLE_PORTAL_MAP[role] === portal;
}
