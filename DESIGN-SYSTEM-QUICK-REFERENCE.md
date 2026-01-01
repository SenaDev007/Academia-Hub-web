# 🎨 ACADEMIA HUB — QUICK REFERENCE

**Guide rapide du design system pour développeurs**

---

## 🎨 COULEURS — USAGE RAPIDE

### Couleurs Principales

```tsx
// Midnight Navy — Couleur principale (60-70%)
className="bg-navy-900 text-white"        // Navigation, headers
className="text-navy-900"                 // Titres, textes importants

// Pure White — Structure (20-30%)
className="bg-white"                      // Fonds, cartes

// Slate Gray — Texte secondaire (5-10%)
className="text-slate-600"                // Labels, textes secondaires
className="border-slate-600"               // Bordures subtiles
```

### Couleurs d'Accent

```tsx
// Soft Gold — Accent premium (< 5% — usage très limité)
className="text-gold-500"                  // Badges premium uniquement
// ⚠️ INTERDIT : Fonds, grands blocs

// Deep Crimson — CTA critiques (< 2%)
className="bg-crimson-600 text-white"     // Boutons CTA principaux
className="border-crimson-600"             // Alertes critiques
```

---

## 🔤 TYPOGRAPHIE

```tsx
// Titres
<h1 className="text-h1">Titre Principal</h1>
<h2 className="text-h2">Titre Secondaire</h2>
<h3 className="text-h3">Titre Tertiaire</h3>
<h4 className="text-h4">Titre Niveau 4</h4>

// Corps de texte
<p className="text-body-large">Texte large</p>
<p className="text-body">Texte normal</p>
<p className="text-body-small">Texte petit</p>

// Variantes
<span className="text-secondary">Texte secondaire</span>
<span className="text-tertiary">Texte tertiaire</span>
<span className="text-disabled">Texte désactivé</span>
```

---

## 🔲 COMPOSANTS

### Boutons

```tsx
// Bouton Principal (CTA)
<button className="btn-primary">
  Action Principale
</button>

// Bouton Secondaire
<button className="btn-secondary">
  Action Secondaire
</button>

// Bouton Tertiaire
<button className="btn-tertiary">
  Action Tertiaire
</button>
```

### Cartes

```tsx
<div className="card">
  <h3 className="text-h3">Titre de la carte</h3>
  <p className="text-body">Contenu de la carte</p>
</div>
```

### Inputs

```tsx
<input 
  type="text" 
  className="input" 
  placeholder="Placeholder"
/>

// Input avec erreur
<input 
  type="text" 
  className="input input-error" 
/>
```

---

## 📐 ESPACEMENT

```tsx
// Utiliser les classes Tailwind standard
<div className="p-4">Padding 16px</div>
<div className="m-6">Margin 24px</div>
<div className="space-y-4">Espacement vertical 16px</div>
```

---

## ✅ CHECKLIST RAPIDE

Avant de commit :

- [ ] Utilise les couleurs officielles uniquement
- [ ] Respecte la hiérarchie typographique
- [ ] Contraste WCAG AA minimum
- [ ] Espacement cohérent (système 8px)
- [ ] Border-radius uniforme (6px-8px)
- [ ] États hover/focus définis

---

## 📚 RESSOURCES

- **Documentation complète** : `DESIGN-SYSTEM.md`
- **Tokens TypeScript** : `apps/web-app/src/styles/design-tokens.ts`
- **CSS Classes** : `apps/web-app/src/styles/design-system.css`
- **Tailwind Config** : `apps/web-app/tailwind.config.js`

---

**© 2025 Academia Hub**

