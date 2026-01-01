# 🎨 ACADEMIA HUB — DESIGN SYSTEM OFFICIEL

**Version 1.0.0** | **Directeur Artistique Senior** | **2025**

---

## 📐 PHILOSOPHIE DE DESIGN

### Positionnement Visuel

Academia Hub incarne l'**autorité institutionnelle** et la **rigueur académique**. Notre identité visuelle communique :

- **Autorité** : Une présence forte et structurée
- **Stabilité** : Une base solide et fiable
- **Confiance** : Une transparence et une clarté totale
- **Lisibilité** : Une accessibilité optimale de l'information
- **Sérieux** : Un professionnalisme sans compromis

### Principes Fondamentaux

1. **Cohérence Absolue** : Chaque élément respecte le système
2. **Hiérarchie Claire** : L'information est organisée par importance
3. **Simplicité Élégante** : Moins est plus, mais avec sophistication
4. **Accessibilité** : Conforme WCAG 2.1 AA minimum
5. **Intemporalité** : Un design qui résiste aux modes

---

## 🎨 PALETTE DE COULEURS OFFICIELLE

### Couleurs Principales

#### 1. Midnight Navy — Couleur Principale
**HEX : `#0B1F3B`** | **RGB : `11, 31, 59`**

**Usage** : Couleur dominante (60-70% de l'interface)
- Headers, navigation principale
- Fond de cartes importantes
- Textes de titre
- Bordures structurelles

**Variantes** :
- `navy-900`: `#0B1F3B` (Base)
- `navy-800`: `#0F2A4F` (Hover states)
- `navy-700`: `#133563` (Active states)
- `navy-600`: `#174077` (Borders)

**Contraste** : ✅ AAA avec blanc (`#FFFFFF`)

---

#### 2. Pure White — Couleur Secondaire
**HEX : `#FFFFFF`** | **RGB : `255, 255, 255`**

**Usage** : Structure et respiration (20-30% de l'interface)
- Fond principal de l'application
- Fond de cartes et modales
- Espaces négatifs
- Textes sur fonds sombres

**Règle** : Toujours en contraste maximum avec Midnight Navy

---

#### 3. Slate Gray — Gris Institutionnel
**HEX : `#6B7280`** | **RGB : `107, 114, 128`**

**Usage** : Structure et texte secondaire
- Textes secondaires, labels
- Bordures subtiles
- États désactivés
- Séparateurs

**Variantes** :
- `slate-600`: `#6B7280` (Base)
- `slate-500`: `#9CA3AF` (Léger)
- `slate-700`: `#4B5563` (Foncé)
- `slate-400`: `#CBD5E1` (Très léger)

**Contraste** : ✅ AA avec blanc pour textes ≥ 14px

---

### Couleurs d'Accent

#### 4. Soft Gold — Accent Premium
**HEX : `#C9A24D`** | **RGB : `201, 162, 77`**

**Usage** : **ACCENT UNIQUEMENT** (usage très limité, < 5%)
- Badges de statut premium
- Icônes de valeur ajoutée
- Bordures subtiles sur éléments importants
- **INTERDIT** : Fonds, grands blocs, dégradés

**Variantes** :
- `gold-500`: `#C9A24D` (Base)
- `gold-400`: `#D4B366` (Hover léger)
- `gold-600`: `#B8913A` (Foncé)

**Règle Absolue** : Jamais utilisé comme couleur principale ou de fond

---

#### 5. Deep Crimson — Accent Critique / CTA
**HEX : `#8B1E1E`** | **RGB : `139, 30, 30`**

**Usage** : Actions critiques et alertes
- Boutons CTA principaux
- Alertes critiques (erreurs graves)
- Indicateurs de danger
- Actions destructives

**Variantes** :
- `crimson-600`: `#8B1E1E` (Base)
- `crimson-500`: `#A02828` (Hover)
- `crimson-700`: `#721818` (Active/Pressed)

**Règle** : Utilisé avec parcimonie, uniquement pour actions critiques

---

### Palette Étendue (Gris Nuancés)

Pour les besoins de l'interface, une palette de gris complémentaire :

```css
gray-50:  #F9FAFB  /* Fond très léger */
gray-100: #F3F4F6  /* Fond léger */
gray-200: #E5E7EB  /* Bordures très légères */
gray-300: #D1D5DB  /* Bordures légères */
gray-400: #9CA3AF  /* Texte secondaire léger */
gray-500: #6B7280  /* Slate Gray base */
gray-600: #4B5563  /* Texte secondaire foncé */
gray-700: #374151  /* Texte tertiaire */
gray-800: #1F2937  /* Texte sur fond clair */
gray-900: #111827  /* Texte principal */
```

---

## 📏 RÈGLES D'UTILISATION STRICTES

### Distribution des Couleurs

| Couleur | Usage | Pourcentage Max |
|---------|-------|-----------------|
| Midnight Navy | Dominante | 60-70% |
| Pure White | Structure | 20-30% |
| Slate Gray | Secondaire | 5-10% |
| Soft Gold | Accent | < 5% |
| Deep Crimson | CTA/Critique | < 2% |

### Règles Absolues

#### ✅ AUTORISÉ

- Midnight Navy en fond de navigation, headers, cartes importantes
- Blanc pour espaces négatifs et fonds de contenu
- Slate Gray pour textes secondaires et bordures subtiles
- Soft Gold pour badges premium, icônes de valeur (usage minimal)
- Deep Crimson pour CTA principaux uniquement

#### ❌ INTERDIT

- Dégradés flashy ou colorés
- Couleurs vives inutiles (vert, bleu vif, orange, etc.)
- Style enfantin ou "gaming"
- Effets décoratifs gratuits
- Utilisation de Gold comme couleur principale
- Utilisation de Crimson pour éléments non-critiques
- Arc-en-ciel de couleurs
- Fond coloré pour grandes surfaces (sauf Navy)

---

## 🔤 TYPOGRAPHIE

### Police Principale

**Inter** (ou équivalent : Montserrat, Poppins)

**Caractéristiques** :
- Sans-serif moderne et sérieuse
- Excellente lisibilité à toutes tailles
- Support multilingue complet
- Poids disponibles : 400, 500, 600, 700

### Hiérarchie Typographique

```css
/* Titres */
h1: 32px / 40px (2rem / 2.5rem) — Font-weight: 700
h2: 24px / 32px (1.5rem / 2rem) — Font-weight: 700
h3: 20px / 28px (1.25rem / 1.75rem) — Font-weight: 600
h4: 18px / 24px (1.125rem / 1.5rem) — Font-weight: 600

/* Corps de texte */
body-large: 16px / 24px (1rem / 1.5rem) — Font-weight: 400
body: 14px / 20px (0.875rem / 1.25rem) — Font-weight: 400
body-small: 12px / 16px (0.75rem / 1rem) — Font-weight: 400

/* Labels et métadonnées */
label: 14px / 20px — Font-weight: 500
caption: 12px / 16px — Font-weight: 400
```

### Couleurs de Texte

- **Texte Principal** : `gray-900` (`#111827`) sur fond blanc
- **Texte Secondaire** : `slate-600` (`#6B7280`) sur fond blanc
- **Texte Tertiaire** : `gray-500` (`#6B7280`) sur fond blanc
- **Texte sur Navy** : `white` (`#FFFFFF`)
- **Texte Désactivé** : `gray-400` (`#9CA3AF`)

---

## 📐 ESPACEMENT (SPACING)

### Système de Spacing (8px base)

```css
spacing-0:  0px
spacing-1:  4px   (0.25rem)
spacing-2:  8px   (0.5rem)
spacing-3:  12px  (0.75rem)
spacing-4:  16px  (1rem)
spacing-5:  20px  (1.25rem)
spacing-6:  24px  (1.5rem)
spacing-8:  32px  (2rem)
spacing-10: 40px  (2.5rem)
spacing-12: 48px  (3rem)
spacing-16: 64px  (4rem)
spacing-20: 80px  (5rem)
```

### Règles d'Application

- **Padding interne** : Minimum 16px (spacing-4)
- **Marges entre sections** : 32px-48px (spacing-8 à spacing-12)
- **Espacement entre éléments** : 16px-24px (spacing-4 à spacing-6)
- **Espacement généreux** : Privilégier la respiration

---

## 🔲 COMPOSANTS DE BASE

### Boutons

#### Bouton Principal (CTA)
- **Fond** : Deep Crimson (`#8B1E1E`)
- **Texte** : Blanc
- **Padding** : 12px 24px
- **Border-radius** : 6px (subtile)
- **Font-weight** : 600
- **Hover** : `crimson-500` (`#A02828`)
- **Active** : `crimson-700` (`#721818`)

#### Bouton Secondaire
- **Fond** : Transparent
- **Bordure** : Midnight Navy (`#0B1F3B`) — 2px
- **Texte** : Midnight Navy
- **Padding** : 12px 24px
- **Border-radius** : 6px
- **Font-weight** : 600
- **Hover** : Fond `navy-50` (`#F9FAFB`)

#### Bouton Tertiaire
- **Fond** : Transparent
- **Bordure** : Slate Gray (`#6B7280`) — 1px
- **Texte** : Slate Gray
- **Padding** : 10px 20px
- **Border-radius** : 6px
- **Font-weight** : 500

### Cartes (Cards)

- **Fond** : Blanc (`#FFFFFF`)
- **Bordure** : `gray-200` (`#E5E7EB`) — 1px
- **Border-radius** : 8px
- **Ombre** : Subtile (`0 1px 3px rgba(0, 0, 0, 0.1)`)
- **Padding** : 24px (spacing-6)
- **Hover** : Ombre légèrement renforcée

### Inputs / Formulaires

- **Bordure** : `gray-300` (`#D1D5DB`) — 1px
- **Border-radius** : 6px
- **Padding** : 12px 16px
- **Focus** : Bordure Midnight Navy (`#0B1F3B`) — 2px
- **Erreur** : Bordure Deep Crimson (`#8B1E1E`) — 2px
- **Texte** : `gray-900` (`#111827`)
- **Placeholder** : `gray-400` (`#9CA3AF`)

### Navigation

- **Fond** : Midnight Navy (`#0B1F3B`)
- **Texte** : Blanc
- **Item actif** : `navy-700` (`#133563`)
- **Hover** : `navy-800` (`#0F2A4F`)
- **Séparateurs** : `navy-600` (`#174077`)

---

## 🎯 HIÉRARCHIE VISUELLE

### Niveaux d'Importance

1. **Niveau 1 — Critique** : Deep Crimson, taille importante, contraste maximum
2. **Niveau 2 — Important** : Midnight Navy, taille moyenne, contraste élevé
3. **Niveau 3 — Standard** : Slate Gray, taille normale, contraste moyen
4. **Niveau 4 — Secondaire** : Gray-500, taille réduite, contraste faible

### Règles de Hiérarchie

- **Un seul élément de niveau 1** par écran
- **Maximum 3 éléments de niveau 2** par section
- **Utilisation cohérente** des tailles et poids de police
- **Contraste respecté** pour chaque niveau

---

## 🌓 MODE SOMBRE (Dark Mode)

### Adaptation de la Palette

#### Couleurs Principales (Dark)
- **Fond Principal** : `gray-900` (`#111827`)
- **Fond Secondaire** : `gray-800` (`#1F2937`)
- **Fond Tertiaire** : `gray-700` (`#374151`)
- **Texte Principal** : `gray-50` (`#F9FAFB`)
- **Texte Secondaire** : `gray-400` (`#9CA3AF`)

#### Couleurs d'Accent (Dark)
- **Midnight Navy** : Légèrement éclairci pour contraste (`#133563`)
- **Soft Gold** : Légèrement assombri (`#B8913A`)
- **Deep Crimson** : Légèrement éclairci (`#A02828`)

### Règles Dark Mode

- **Contraste minimum** : WCAG AA (4.5:1)
- **Éviter les fonds 100% noirs** : Utiliser `gray-900`
- **Bordures subtiles** : `gray-700` au lieu de `gray-200`

---

## ♿ ACCESSIBILITÉ

### Contraste Minimum (WCAG 2.1 AA)

- **Texte normal** : 4.5:1 minimum
- **Texte large** (≥ 18px) : 3:1 minimum
- **Éléments interactifs** : 3:1 minimum

### Vérifications

| Combinaison | Ratio | Statut |
|-------------|-------|--------|
| Navy sur Blanc | 12.5:1 | ✅ AAA |
| Blanc sur Navy | 12.5:1 | ✅ AAA |
| Slate-600 sur Blanc | 4.8:1 | ✅ AA |
| Crimson sur Blanc | 5.2:1 | ✅ AA |
| Gold sur Navy | 2.8:1 | ⚠️ Utiliser avec précaution |

### Focus States

- **Outline** : 2px solid Midnight Navy
- **Offset** : 2px
- **Toujours visible** : Même en mode sombre

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

```css
sm:  640px   /* Mobile large */
md:  768px   /* Tablette */
lg:  1024px  /* Desktop */
xl:  1280px  /* Desktop large */
2xl: 1536px  /* Desktop très large */
```

### Règles Responsive

- **Mobile First** : Design pour mobile, puis adaptation desktop
- **Spacing adaptatif** : Réduire de 20-30% sur mobile
- **Typographie adaptative** : Réduire de 1-2px sur mobile
- **Navigation** : Sidebar → Menu hamburger sur mobile

---

## 🎨 EXEMPLES D'APPLICATION

### Page de Connexion

- **Fond** : Blanc pur
- **Carte centrale** : Fond blanc, bordure `gray-200`, ombre subtile
- **Logo** : Midnight Navy
- **Titre** : Midnight Navy, 32px, font-weight 700
- **Bouton CTA** : Deep Crimson
- **Liens** : Midnight Navy

### Dashboard

- **Sidebar** : Midnight Navy
- **Header** : Blanc, bordure `gray-200`
- **Cartes** : Fond blanc, bordure `gray-200`
- **Badges premium** : Soft Gold (usage minimal)
- **Boutons actions** : Midnight Navy (secondaire) ou Deep Crimson (principal)

### Tableaux de Données

- **En-têtes** : Fond `gray-50`, texte `gray-900`, font-weight 600
- **Lignes alternées** : Fond `gray-50` / Blanc
- **Bordures** : `gray-200`
- **Actions** : Icônes Midnight Navy

---

## ✅ CHECKLIST DE CONFORMITÉ

Avant de déployer un composant, vérifier :

- [ ] Utilisation de la palette officielle uniquement
- [ ] Respect des règles d'utilisation des couleurs
- [ ] Hiérarchie visuelle claire
- [ ] Contraste WCAG AA minimum
- [ ] Espacement cohérent (système 8px)
- [ ] Typographie conforme
- [ ] Border-radius uniforme (6px-8px)
- [ ] États hover/focus/active définis
- [ ] Mode sombre testé (si applicable)
- [ ] Responsive testé (mobile/tablette/desktop)

---

## 📚 RESSOURCES

### Outils de Vérification

- **Contraste** : [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Palette** : [Coolors.co](https://coolors.co) pour générer variantes
- **Accessibilité** : [WAVE](https://wave.webaim.org/) pour audit

### Documentation Technique

- **Tailwind Config** : `apps/web-app/tailwind.config.js`
- **Tokens Design** : `apps/web-app/src/styles/design-tokens.ts` (à créer)

---

## 🔄 VERSIONING

**Version 1.0.0** — 2025-01-XX
- Initialisation du design system
- Palette officielle définie
- Principes de base établis

---

**© 2025 Academia Hub — Tous droits réservés**

*Ce document est la référence absolue pour toute création visuelle de la plateforme Academia Hub.*

