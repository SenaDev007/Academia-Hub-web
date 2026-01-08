# 🚀 Guide de Déploiement Vercel - Academia Hub Web

## ✅ Préparation Complète Effectuée

L'application Academia Hub Web a été préparée pour un déploiement propre sur Vercel.

---

## 📦 Fichiers Modifiés

### Configuration

1. **`vercel.json`** ✅ Créé
   - Rewrites pour React Router
   - Headers de cache pour assets
   - Configuration build

2. **`vite.config.ts`** ✅ Mis à jour
   - `base: '/'` (au lieu de `'./'`)
   - `sourcemap: false` en production
   - Suppression de `process.env` dans `define`
   - Ajout de `__VITE_PLATFORM__`

3. **`package.json`** ✅ Mis à jour
   - Script `build` simplifié (sans `tsc`)
   - Script `build:check` pour vérification TypeScript

### Code Source

4. **`src/utils/platform.ts`** ✅ Créé
   - Détection de plateforme (Web/Desktop/Mobile)
   - Helpers pour logique conditionnelle

5. **`src/utils/electron-compat.ts`** ✅ Créé
   - Wrapper de compatibilité Electron → HTTP
   - Remplace toutes les références `window.electronAPI`
   - Fallback automatique vers API REST

6. **`src/main.tsx`** ✅ Mis à jour
   - Import du wrapper de compatibilité

7. **`src/config/mtnConfig.ts`** ✅ Mis à jour
   - `process.env` → `import.meta.env.VITE_*`

8. **`src/components/performance/PerformanceMonitor.tsx`** ✅ Mis à jour
   - `process.env.NODE_ENV` → `import.meta.env.DEV`

9. **`src/components/loading/ErrorBoundary.tsx`** ✅ Mis à jour
   - `process.env.NODE_ENV` → `import.meta.env.DEV`

10. **`src/services/treasuryService.ts`** ✅ Mis à jour
    - Utilisation du wrapper de compatibilité

### Variables d'Environnement

11. **`.env.example`** ✅ Créé
    - Template pour variables d'environnement

12. **`.env.production`** ✅ Créé
    - Variables pour production Vercel

---

## 🔧 Configuration Vercel

### Variables d'Environnement à Configurer

Dans le dashboard Vercel, ajoutez :

```
VITE_PLATFORM=web
VITE_API_URL=https://api.academiahub.com
VITE_PUBLIC_URL=https://app.academiahub.com
VITE_ENV=production
VITE_SOURCEMAP=false
```

**Optionnel (MTN SMS)** :
```
VITE_MTN_CONSUMER_KEY=your_key
VITE_MTN_CONSUMER_SECRET=your_secret
VITE_MTN_SERVICE_CODE=ACAD-HUB
VITE_MTN_SENDER_ADDRESS=ACAD-HUB
VITE_MTN_TEST_MODE=false
```

---

## 🚀 Instructions de Déploiement

### Option 1 : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
cd apps/web-app
vercel

# Déployer en production
vercel --prod
```

### Option 2 : Via GitHub Integration

1. **Connecter le repository** sur Vercel
2. **Configurer le projet** :
   - Root Directory: `apps/web-app`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **Ajouter les variables d'environnement** (voir ci-dessus)
4. **Déployer** : Push sur `main` déclenche automatiquement le déploiement

### Option 3 : Via Vercel Dashboard

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "New Project"
3. Importer le repository GitHub
4. Configurer :
   - **Framework Preset**: Vite
   - **Root Directory**: `apps/web-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Ajouter les variables d'environnement
6. Cliquer sur "Deploy"

---

## ✅ Points Désactivés Côté Web

### Electron / Desktop

- ❌ `window.electronAPI` → Remplacé par wrapper HTTP
- ❌ SQLite local → Utilise API REST uniquement
- ❌ Accès filesystem → Désactivé
- ❌ IPC (Inter-Process Communication) → Désactivé
- ❌ Preload scripts → Désactivés

### Logique Conditionnelle

Toute logique conditionnelle utilise maintenant :

```typescript
import { isWeb, isDesktop, onWeb, onDesktop } from '@/utils/platform';

if (isWeb()) {
  // Logique Web uniquement
}

onWeb(() => {
  // Code exécuté uniquement sur Web
}, fallbackValue);
```

---

## 🔍 Vérifications Post-Déploiement

### 1. Build Local

```bash
cd apps/web-app
npm run build
```

**Vérifier** :
- ✅ Pas d'erreurs TypeScript
- ✅ Dossier `dist/` créé
- ✅ `dist/index.html` présent
- ✅ `dist/assets/` contient JS/CSS

### 2. Preview Local

```bash
npm run preview
```

**Vérifier** :
- ✅ Application accessible sur `http://localhost:4173`
- ✅ Routes fonctionnent (`/`, `/dashboard`, etc.)
- ✅ Pas d'erreurs console liées à Electron
- ✅ API calls fonctionnent

### 3. Déploiement Vercel

**Vérifier** :
- ✅ Build réussit sur Vercel
- ✅ Application accessible sur l'URL Vercel
- ✅ Routes fonctionnent (SPA)
- ✅ Variables d'environnement configurées
- ✅ API calls pointent vers la bonne URL

---

## 📋 Checklist de Déploiement

### Avant Déploiement

- [x] ✅ `vercel.json` créé
- [x] ✅ `vite.config.ts` configuré pour Vercel
- [x] ✅ Variables d'environnement migrées vers `VITE_*`
- [x] ✅ Références Electron remplacées par HTTP
- [x] ✅ `process.env` remplacé par `import.meta.env`
- [x] ✅ Build local fonctionne (`npm run build`)
- [x] ✅ Preview local fonctionne (`npm run preview`)

### Configuration Vercel

- [ ] Variables d'environnement ajoutées
- [ ] Root Directory configuré (`apps/web-app`)
- [ ] Build Command configuré (`npm run build`)
- [ ] Output Directory configuré (`dist`)
- [ ] Framework Preset configuré (Vite)

### Post-Déploiement

- [ ] Application accessible
- [ ] Routes fonctionnent
- [ ] API calls fonctionnent
- [ ] Pas d'erreurs console
- [ ] Performance acceptable

---

## 🐛 Dépannage

### Build échoue sur Vercel

**Vérifier** :
1. Variables d'environnement présentes
2. `package.json` contient toutes les dépendances
3. `vite.config.ts` n'a pas d'erreurs
4. Pas de références à `process.env` (utiliser `import.meta.env`)

### Routes ne fonctionnent pas

**Vérifier** :
1. `vercel.json` contient les rewrites
2. `vite.config.ts` a `base: '/'`
3. React Router utilise `BrowserRouter` (pas `HashRouter`)

### API calls échouent

**Vérifier** :
1. `VITE_API_URL` configuré correctement
2. CORS configuré côté backend
3. Headers d'authentification présents

---

## 📚 Documentation Complémentaire

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/start/overview#deploying)

---

**Application prête pour Vercel** ✅  
**Configuration complète** ✅  
**Code nettoyé** ✅

