# 🚀 Déploiement Vercel - Academia Hub Web

## ✅ Application Prête pour Vercel

L'application a été complètement préparée pour un déploiement sur Vercel.

---

## 📋 Configuration Vercel

### Variables d'Environnement Requises

Dans le dashboard Vercel, configurez :

```bash
VITE_PLATFORM=web
VITE_API_URL=https://api.academiahub.com
VITE_PUBLIC_URL=https://app.academiahub.com
VITE_ENV=production
```

### Configuration du Projet

- **Root Directory**: `apps/web-app`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite
- **Install Command**: `npm install`

---

## 🚀 Déploiement

### Option 1 : Vercel Dashboard

1. Aller sur [vercel.com](https://vercel.com)
2. "New Project"
3. Importer le repository
4. Configurer comme ci-dessus
5. Ajouter les variables d'environnement
6. Déployer

### Option 2 : Vercel CLI

```bash
cd apps/web-app
npm i -g vercel
vercel login
vercel --prod
```

---

## ✅ Vérifications

- ✅ `vercel.json` configuré
- ✅ `vite.config.ts` optimisé pour Vercel
- ✅ Variables d'environnement migrées (`VITE_*`)
- ✅ Références Electron remplacées par HTTP
- ✅ Routing configuré (React Router)
- ✅ Build optimisé

---

**Prêt pour production** ✅

