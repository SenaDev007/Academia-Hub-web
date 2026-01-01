/**
 * ACADEMIA HUB — DESIGN TOKENS
 * 
 * Tokens de design officiels pour la plateforme Academia Hub.
 * Ces tokens sont la source de vérité pour tous les composants.
 * 
 * Voir DESIGN-SYSTEM.md pour les règles d'utilisation complètes.
 */

// ============================================================================
// COULEURS PRINCIPALES
// ============================================================================

export const colors = {
  // Midnight Navy — Couleur principale (autorité & structure)
  navy: {
    900: '#0B1F3B', // Base — Usage principal (60-70%)
    800: '#0F2A4F', // Hover states
    700: '#133563', // Active states
    600: '#174077', // Borders
  },
  
  // Pure White — Structure et respiration
  white: '#FFFFFF',
  
  // Slate Gray — Texte secondaire et structure
  slate: {
    700: '#4B5563', // Foncé
    600: '#6B7280', // Base
    500: '#9CA3AF', // Léger
    400: '#CBD5E1', // Très léger
  },
  
  // Soft Gold — Accent premium (usage très limité < 5%)
  gold: {
    600: '#B8913A', // Foncé
    500: '#C9A24D', // Base — ACCENT UNIQUEMENT
    400: '#D4B366', // Hover léger
  },
  
  // Deep Crimson — CTA et alertes critiques
  crimson: {
    700: '#721818', // Active/Pressed
    600: '#8B1E1E', // Base — CTA principaux uniquement
    500: '#A02828', // Hover
  },
  
  // Palette gris complémentaire
  gray: {
    50: '#F9FAFB',  // Fond très léger
    100: '#F3F4F6', // Fond léger
    200: '#E5E7EB', // Bordures très légères
    300: '#D1D5DB', // Bordures légères
    400: '#9CA3AF', // Texte secondaire léger
    500: '#6B7280', // Slate Gray base (alias)
    600: '#4B5563', // Texte secondaire foncé
    700: '#374151', // Texte tertiaire
    800: '#1F2937', // Texte sur fond clair
    900: '#111827', // Texte principal
  },
} as const;

// ============================================================================
// TYPOGRAPHIE
// ============================================================================

export const typography = {
  fontFamily: {
    sans: [
      'Inter',
      'Montserrat',
      'Poppins',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(', '),
  },
  
  fontSize: {
    h1: { size: '32px', lineHeight: '40px', weight: 700 },
    h2: { size: '24px', lineHeight: '32px', weight: 700 },
    h3: { size: '20px', lineHeight: '28px', weight: 600 },
    h4: { size: '18px', lineHeight: '24px', weight: 600 },
    bodyLarge: { size: '16px', lineHeight: '24px', weight: 400 },
    body: { size: '14px', lineHeight: '20px', weight: 400 },
    bodySmall: { size: '12px', lineHeight: '16px', weight: 400 },
    label: { size: '14px', lineHeight: '20px', weight: 500 },
    caption: { size: '12px', lineHeight: '16px', weight: 400 },
  },
  
  // Couleurs de texte
  textColor: {
    primary: colors.gray[900],      // Texte principal
    secondary: colors.slate[600],   // Texte secondaire
    tertiary: colors.gray[500],      // Texte tertiaire
    onNavy: colors.white,            // Texte sur Navy
    disabled: colors.gray[400],     // Texte désactivé
  },
} as const;

// ============================================================================
// ESPACEMENT (SPACING)
// ============================================================================

export const spacing = {
  0: '0px',
  1: '4px',   // 0.25rem
  2: '8px',   // 0.5rem
  3: '12px',  // 0.75rem
  4: '16px',  // 1rem
  5: '20px',  // 1.25rem
  6: '24px',  // 1.5rem
  8: '32px',  // 2rem
  10: '40px', // 2.5rem
  12: '48px', // 3rem
  16: '64px', // 4rem
  20: '80px', // 5rem
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  subtle: '6px',  // Boutons, inputs
  card: '8px',    // Cartes
  modal: '12px',  // Modales
} as const;

// ============================================================================
// OMBRES (SHADOWS)
// ============================================================================

export const shadows = {
  subtle: '0 1px 3px rgba(0, 0, 0, 0.1)',
  card: '0 1px 3px rgba(0, 0, 0, 0.1)',
  cardHover: '0 4px 6px rgba(0, 0, 0, 0.1)',
} as const;

// ============================================================================
// BREAKPOINTS (RESPONSIVE)
// ============================================================================

export const breakpoints = {
  sm: '640px',   // Mobile large
  md: '768px',   // Tablette
  lg: '1024px',  // Desktop
  xl: '1280px',  // Desktop large
  '2xl': '1536px', // Desktop très large
} as const;

// ============================================================================
// COMPOSANTS — BOUTONS
// ============================================================================

export const button = {
  primary: {
    background: colors.crimson[600],
    color: colors.white,
    padding: '12px 24px',
    borderRadius: borderRadius.subtle,
    fontWeight: 600,
    hover: {
      background: colors.crimson[500],
    },
    active: {
      background: colors.crimson[700],
    },
  },
  secondary: {
    background: 'transparent',
    border: `2px solid ${colors.navy[900]}`,
    color: colors.navy[900],
    padding: '12px 24px',
    borderRadius: borderRadius.subtle,
    fontWeight: 600,
    hover: {
      background: colors.gray[50],
    },
  },
  tertiary: {
    background: 'transparent',
    border: `1px solid ${colors.slate[600]}`,
    color: colors.slate[600],
    padding: '10px 20px',
    borderRadius: borderRadius.subtle,
    fontWeight: 500,
  },
} as const;

// ============================================================================
// COMPOSANTS — CARTES
// ============================================================================

export const card = {
  background: colors.white,
  border: `1px solid ${colors.gray[200]}`,
  borderRadius: borderRadius.card,
  shadow: shadows.card,
  padding: spacing[6], // 24px
  hover: {
    shadow: shadows.cardHover,
  },
} as const;

// ============================================================================
// COMPOSANTS — INPUTS
// ============================================================================

export const input = {
  border: `1px solid ${colors.gray[300]}`,
  borderRadius: borderRadius.subtle,
  padding: '12px 16px',
  focus: {
    border: `2px solid ${colors.navy[900]}`,
  },
  error: {
    border: `2px solid ${colors.crimson[600]}`,
  },
  textColor: colors.gray[900],
  placeholderColor: colors.gray[400],
} as const;

// ============================================================================
// NAVIGATION
// ============================================================================

export const navigation = {
  background: colors.navy[900],
  textColor: colors.white,
  active: {
    background: colors.navy[700],
  },
  hover: {
    background: colors.navy[800],
  },
  separator: colors.navy[600],
} as const;

// ============================================================================
// MODE SOMBRE (DARK MODE)
// ============================================================================

export const darkMode = {
  background: {
    primary: colors.gray[900],
    secondary: colors.gray[800],
    tertiary: colors.gray[700],
  },
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[400],
  },
  navy: {
    // Légèrement éclairci pour contraste
    900: '#133563',
  },
  gold: {
    // Légèrement assombri
    500: '#B8913A',
  },
  crimson: {
    // Légèrement éclairci
    600: '#A02828',
  },
} as const;

// ============================================================================
// EXPORT GLOBAL
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  button,
  card,
  input,
  navigation,
  darkMode,
} as const;

export default designTokens;

