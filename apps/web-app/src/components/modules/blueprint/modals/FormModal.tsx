/**
 * ============================================================================
 * FORM MODAL - MODAL DE FORMULAIRE STANDARDISÉ
 * ============================================================================
 * 
 * Modal réutilisable pour les formulaires CRUD
 * Utilise BaseModal pour la structure standardisée
 * 
 * Usage :
 * - Créer
 * - Modifier
 * - Paramétrer
 * 
 * ============================================================================
 */

'use client';

import { ReactNode } from 'react';
import BaseModal from './BaseModal';

export interface FormModalProps {
  /** Titre du modal */
  title: string;
  /** Sous-titre métier (optionnel) */
  subtitle?: string;
  /** Contenu du formulaire */
  children: ReactNode;
  /** Ouvert/fermé */
  isOpen: boolean;
  /** Callback de fermeture */
  onClose: () => void;
  /** Actions (boutons) */
  actions?: ReactNode;
  /** Taille */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Afficher le contexte */
  showContext?: boolean;
}

export default function FormModal({
  title,
  subtitle,
  children,
  isOpen,
  onClose,
  actions,
  size = 'md',
  showContext = true,
}: FormModalProps) {
  return (
    <BaseModal
      title={title}
      subtitle={subtitle}
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      showContext={showContext}
      footer={actions}
    >
      {children}
    </BaseModal>
  );
}

