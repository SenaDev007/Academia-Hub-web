# 🚀 Préparation Vercel - Academia Hub Next.js

## ✅ Application Prête pour Vercel

L'application **Next.js** (`apps/web-app/`) a été préparée pour un déploiement propre sur Vercel.

---

## 📋 Clarification de l'Architecture

### `apps/web-app/` - **FRONTEND WEB (PRODUCTION)**

✅ **Application Web Next.js** déployée sur Vercel  
✅ **Fichiers source** : `apps/web-app/src/`  
✅ **Base de données** : API REST uniquement (PostgreSQL via backend)

### `apps/desktop-app/` - **VERSION DESKTOP (MODÈLE/RÉFÉRENCE)**

⚠️ **Application Desktop Electron** (modèle de référence)  
⚠️ **Fichiers source** : `apps/desktop-app/src/`  
⚠️ **Usage** : Sert de modèle pour certaines fonctionnalités

---

## 📦 Fichiers Modifiés/Créés

### Configuration

1. ✅ **`vercel.json`** - Créé
   - Configuration Next.js pour Vercel
   - Headers de cache
   - Rewrites pour SPA

2. ✅ **`next.config.js`** - Mis à jour
   - Variables d'environnement `NEXT_PUBLIC_*`
   - Output `standalone` pour Vercel

### Code Source

3. ✅ **`src/utils/platform.ts`** - Créé
   - Détection de plateforme (Web/Desktop/Mobile)
   - Helpers pour logique conditionnelle

4. ✅ **`src/utils/electron-compat.ts`** - Créé
   - Wrapper Electron → HTTP
   - Compatibilité Web uniquement (Next.js)

5. ✅ **`src/lib/offline/local-db.service.ts`** - Mis à jour
   - SQLite désactivé pour Next.js
   - IndexedDB uniquement (côté client)

### Variables d'Environnement

6. ✅ **`.env.example`** - Créé
7. ✅ **`.env.production`** - Créé

---

## 🔐 Variables d'Environnement (Vercel)

### Obligatoires

```bash
NEXT_PUBLIC_PLATFORM=web
NEXT_PUBLIC_API_URL=https://api.academiahub.com
NEXT_PUBLIC_APP_URL=https://app.academiahub.com
NEXT_PUBLIC_ENV=production
```

### Optionnelles

```bash
API_URL=https://api.academiahub.com
NODE_ENV=production
```

---

## 🚫 Points Désactivés Côté Web (Next.js)

- ❌ **SQLite** → Désactivé (Next.js = Web uniquement)
- ❌ **Electron API direct** → Remplacé par wrapper HTTP
- ❌ **better-sqlite3** → Non utilisé
- ❌ **Accès filesystem** → Désactivé
- ❌ **IPC** → Désactivé

**Logique conditionnelle** :
```typescript
import { isWeb, onWeb } from '@/utils/platform';

// Next.js = toujours Web
if (isWeb()) {
  // Utilise API HTTP
}
```

---

## 🚀 Instructions de Déploiement Vercel

### Via Vercel Dashboard

1. Aller sur [vercel.com](https://vercel.com)
2. "New Project" → Importer repository
3. Configurer :
   - **Framework Preset** : `Next.js`
   - **Root Directory** : `apps/web-app`
   - **Build Command** : `npm run build` (auto-détecté)
   - **Output Directory** : `.next` (auto-détecté)
4. Ajouter les variables d'environnement
5. Déployer

### Via Vercel CLI

```bash
cd apps/web-app
npm i -g vercel
vercel login
vercel --prod
```

---

## ✅ Vérifications

### Build Local

```bash
cd apps/web-app
npm install
npm run build
```

**Résultat attendu** :
- ✅ Dossier `.next/` créé
- ✅ Pas d'erreurs
- ✅ Pas de références Electron

### Déploiement Vercel

**Vérifier** :
- ✅ Build réussit
- ✅ Application accessible
- ✅ Routes fonctionnent
- ✅ API calls fonctionnent

---

## 📋 Checklist

- [x] ✅ `vercel.json` créé
- [x] ✅ `next.config.js` configuré
- [x] ✅ Variables d'environnement migrées (`NEXT_PUBLIC_*`)
- [x] ✅ SQLite désactivé
- [x] ✅ Wrapper Electron créé
- [x] ✅ Documentation complète

---

**Application Next.js prête pour Vercel** ✅

