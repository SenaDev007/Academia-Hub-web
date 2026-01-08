# ⚙️ Configuration Vercel - Academia Hub

## ✅ Erreur JSON Corrigée

L'erreur dans `package.json` (virgule trailing) a été corrigée. Le fichier est maintenant valide.

---

## 🔧 Configuration Vercel Requise

### 1. Root Directory (CRITIQUE)

⚠️ **IMPORTANT** : Dans le dashboard Vercel, configurez :

- **Root Directory** : `apps/web-app`

Sans cette configuration, Vercel cherchera `package.json` à la racine du monorepo et échouera.

### 2. Framework Preset

- **Framework Preset** : `Next.js` (auto-détecté)

### 3. Build Settings

- **Build Command** : `npm run build` (auto-détecté)
- **Output Directory** : `.next` (auto-détecté)
- **Install Command** : `npm install` (auto-détecté)

### 4. Variables d'Environnement

Configurez ces variables dans **Vercel Dashboard → Settings → Environment Variables** :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ankbtgwlofidxtafdueu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_1XCM6w3jm4368f-P36BaKw_XrCoHmZy

# API (production)
NEXT_PUBLIC_API_URL=https://api.academiahub.com
NEXT_PUBLIC_APP_URL=https://app.academiahub.com
NEXT_PUBLIC_PLATFORM=web
NEXT_PUBLIC_ENV=production

# Database (server-side only - pour Prisma si nécessaire)
# ⚠️ Ne pas exposer avec NEXT_PUBLIC_
DATABASE_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
```

---

## 📋 Checklist de Déploiement

### Avant Déploiement

- [x] ✅ Erreur JSON corrigée dans `package.json` (racine)
- [x] ✅ `package.json` validé
- [x] ✅ `vercel.json` configuré dans `apps/web-app/`
- [x] ✅ `next.config.js` optimisé pour Vercel
- [ ] ⏳ **Root Directory configuré** : `apps/web-app` ⚠️ **CRITIQUE**
- [ ] ⏳ Variables d'environnement ajoutées dans Vercel Dashboard

### Configuration Vercel Dashboard

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Sélectionner votre projet**
3. **Settings → General**
4. **Root Directory** : `apps/web-app` ⚠️ **IMPORTANT**
5. **Settings → Environment Variables**
6. **Ajouter toutes les variables** (voir ci-dessus)

### Redéploiement

1. **Push les changements** sur GitHub (commit avec la correction JSON)
2. **Vercel redéploiera automatiquement**
3. **Ou déclencher manuellement** : Deployments → Redeploy

---

## 🐛 Dépannage

### Erreur: "Could not read package.json"

**Cause** : Root Directory non configuré ou incorrect.

**Solution** :
1. Vérifier que **Root Directory** = `apps/web-app` dans Vercel Dashboard
2. Vérifier que le fichier `apps/web-app/package.json` existe et est valide

### Erreur: "Expected double-quoted property name"

**Cause** : Virgule trailing ou syntaxe JSON invalide.

**Solution** : ✅ **Déjà corrigé** - Le `package.json` à la racine a été corrigé.

### Build échoue

**Solutions** :
1. Vérifier que toutes les variables `NEXT_PUBLIC_*` sont configurées
2. Vérifier que `npm install` fonctionne localement
3. Vérifier les logs de build dans Vercel Dashboard

---

## ✅ Vérification Post-Déploiement

1. **Application accessible** sur l'URL Vercel
2. **Routes fonctionnent** (Next.js App Router)
3. **Pas d'erreurs console**
4. **Supabase connecté** (tester avec `/api/supabase-example`)

---

**Configuration prête** ✅  
**Erreur corrigée** ✅  
**Prêt pour redéploiement** ✅

