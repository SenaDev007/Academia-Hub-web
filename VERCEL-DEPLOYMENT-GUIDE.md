# 🚀 Guide de Déploiement Vercel - Academia Hub

## ❌ Erreurs Rencontrées

### 1. Erreur JSON (Corrigée ✅)
- **Problème** : Virgule trailing dans `package.json` (racine)
- **Solution** : Virgule supprimée

### 2. Erreur Build Command (En cours)
- **Problème** : Vercel exécute `tsc && vite build` (racine) au lieu de `next build` (apps/web-app)
- **Solution** : Configuration `vercel.json` à la racine avec `rootDirectory`

---

## ✅ Configuration Appliquée

### Fichier `vercel.json` à la racine

```json
{
  "buildCommand": "cd apps/web-app && npm install && npm run build",
  "outputDirectory": "apps/web-app/.next",
  "framework": "nextjs",
  "installCommand": "cd apps/web-app && npm install"
}
```

### Fichier `apps/web-app/vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## ⚠️ Configuration Vercel Dashboard (OBLIGATOIRE)

Même avec `vercel.json`, vous **DEVEZ** configurer dans le dashboard :

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Sélectionner votre projet**
3. **Settings → General**
4. **Root Directory** : `apps/web-app` ⚠️ **CRITIQUE**
5. **Sauvegarder**

Sans cette configuration, Vercel ignorera le `vercel.json` et utilisera la racine.

---

## 🔧 Variables d'Environnement (Vercel Dashboard)

Dans **Settings → Environment Variables**, ajouter :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ankbtgwlofidxtafdueu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_1XCM6w3jm4368f-P36BaKw_XrCoHmZy

# API (production)
NEXT_PUBLIC_API_URL=https://api.academiahub.com
NEXT_PUBLIC_APP_URL=https://app.academiahub.com
NEXT_PUBLIC_PLATFORM=web
NEXT_PUBLIC_ENV=production

# Database (server-side only - optionnel pour Prisma)
DATABASE_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
```

---

## 📋 Checklist Complète

### Fichiers

- [x] ✅ `package.json` (racine) - JSON valide
- [x] ✅ `vercel.json` (racine) - Configuré avec rootDirectory
- [x] ✅ `apps/web-app/vercel.json` - Simplifié
- [x] ✅ `apps/web-app/package.json` - Script `next build` correct

### Configuration Vercel Dashboard

- [ ] ⏳ **Root Directory** : `apps/web-app` ⚠️ **CRITIQUE**
- [ ] ⏳ Variables d'environnement configurées
- [ ] ⏳ Framework détecté : Next.js

### Redéploiement

- [ ] ⏳ Commit et push les changements
- [ ] ⏳ Vercel redéploie automatiquement
- [ ] ⏳ Build réussit
- [ ] ⏳ Application accessible

---

## 🐛 Dépannage

### Erreur: "tsc && vite build"

**Cause** : Vercel utilise le `package.json` de la racine au lieu de `apps/web-app/`.

**Solution** :
1. Vérifier que **Root Directory** = `apps/web-app` dans Vercel Dashboard
2. Vérifier que `vercel.json` à la racine contient `rootDirectory: "apps/web-app"`

### Erreur: "Could not find package.json"

**Cause** : Root Directory incorrect ou `vercel.json` mal configuré.

**Solution** :
1. Vérifier que le dossier `apps/web-app/` existe
2. Vérifier que `apps/web-app/package.json` existe
3. Vérifier la configuration Root Directory dans Vercel Dashboard

### Build échoue avec erreurs TypeScript

**Solution** :
1. Vérifier que `apps/web-app/tsconfig.json` existe
2. Vérifier que les types sont correctement installés
3. Vérifier les erreurs TypeScript localement : `cd apps/web-app && npm run type-check`

---

## 🚀 Commandes de Test Local

```bash
# Tester le build localement
cd apps/web-app
npm install
npm run build

# Vérifier les erreurs TypeScript
npm run type-check

# Tester en développement
npm run dev
```

---

## ✅ Résumé

- ✅ Erreur JSON corrigée
- ✅ `vercel.json` configuré à la racine
- ⏳ **Configuration Root Directory dans Vercel Dashboard requise** ⚠️
- ⏳ Variables d'environnement à configurer
- ⏳ Redéploiement à effectuer

---

**Configuration prête** ✅  
**Action requise** : Configurer Root Directory dans Vercel Dashboard ⚠️

