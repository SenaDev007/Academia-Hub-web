/** @type {import('tailwindcss').Config} */
/**
 * ACADEMIA HUB — DESIGN SYSTEM OFFICIEL
 * 
 * Palette de couleurs institutionnelle :
 * - Midnight Navy (#0B1F3B) : Couleur principale (autorité)
 * - Pure White (#FFFFFF) : Structure et respiration
 * - Slate Gray (#6B7280) : Texte secondaire et structure
 * - Soft Gold (#C9A24D) : Accent premium (usage limité)
 * - Deep Crimson (#8B1E1E) : CTA et alertes critiques
 * 
 * Voir DESIGN-SYSTEM.md pour les règles d'utilisation complètes
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleur principale — Midnight Navy (autorité & structure)
        navy: {
          900: '#0B1F3B', // Base — Usage principal (60-70%)
          800: '#0F2A4F', // Hover states
          700: '#133563', // Active states
          600: '#174077', // Borders
        },
        // Couleur secondaire — Pure White (structure & respiration)
        white: {
          DEFAULT: '#FFFFFF',
        },
        // Gris institutionnel — Slate Gray (texte secondaire)
        slate: {
          700: '#4B5563', // Foncé
          600: '#6B7280', // Base
          500: '#9CA3AF', // Léger
          400: '#CBD5E1', // Très léger
        },
        // Accent premium — Soft Gold (usage très limité < 5%)
        gold: {
          600: '#B8913A', // Foncé
          500: '#C9A24D', // Base — ACCENT UNIQUEMENT
          400: '#D4B366', // Hover léger
        },
        // Accent critique — Deep Crimson (CTA & alertes critiques)
        crimson: {
          700: '#721818', // Active/Pressed
          600: '#8B1E1E', // Base — CTA principaux uniquement
          500: '#A02828', // Hover
        },
        // Palette gris complémentaire (pour besoins interface)
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
        // Alias pour compatibilité (déprécié — utiliser navy)
        primary: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#0B1F3B', // Midnight Navy
        },
      },
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
        ],
      },
      fontSize: {
        // Hiérarchie typographique officielle
        'h1': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h4': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body-large': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'label': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      borderRadius: {
        'subtle': '6px',  // Boutons, inputs
        'card': '8px',    // Cartes
        'modal': '12px',  // Modales
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        // Système de spacing basé sur 8px
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Activation du mode sombre via classe
}

