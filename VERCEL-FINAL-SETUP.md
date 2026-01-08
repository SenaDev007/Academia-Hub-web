# 🚀 Configuration Finale Vercel - Academia Hub

## ❌ Problème Actuel

Vercel ne détecte pas Next.js car il cherche le `package.json` à la racine au lieu de `apps/web-app/`.

---

## ✅ Solution Définitive

### Option 1 : Configuration via Vercel Dashboard (RECOMMANDÉ)

**Cette option est la plus fiable** :

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Sélectionner votre projet**
3. **Settings → General**
4. **Root Directory** : `apps/web-app` ⚠️ **CRITIQUE**
5. **Sauvegarder**

Après cette configuration, Vercel :
- ✅ Détectera automatiquement Next.js
- ✅ Utilisera `apps/web-app/package.json`
- ✅ Exécutera `next build` (pas `tsc && vite build`)

### Option 2 : Supprimer `vercel.json` à la racine

Si le `vercel.json` cause des conflits :

1. **Supprimer** `vercel.json` à la racine
2. **Configurer uniquement dans Vercel Dashboard** :
   - Root Directory : `apps/web-app`
   - Tous les autres paramètres seront auto-détectés

---

## 📋 Configuration Vercel Dashboard

### Settings → General

- **Root Directory** : `apps/web-app` ⚠️ **OBLIGATOIRE**
- **Framework Preset** : Next.js (auto-détecté)
- **Build Command** : (laisser vide, auto-détecté = `next build`)
- **Output Directory** : (laisser vide, auto-détecté = `.next`)
- **Install Command** : (laisser vide, auto-détecté = `npm install`)

### Settings → Environment Variables

Ajouter toutes les variables :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ankbtgwlofidxtafdueu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_1XCM6w3jm4368f-P36BaKw_XrCoHmZy
NEXT_PUBLIC_API_URL=https://api.academiahub.com
NEXT_PUBLIC_APP_URL=https://app.academiahub.com
NEXT_PUBLIC_PLATFORM=web
NEXT_PUBLIC_ENV=production
```

---

## ✅ Vérification

### Local

```bash
cd apps/web-app
npm list next
```

Devrait afficher : `next@14.2.35` (ou version similaire)

### Vercel

Après configuration du Root Directory, Vercel devrait :
1. ✅ Détecter Next.js automatiquement
2. ✅ Installer les dépendances dans `apps/web-app/`
3. ✅ Exécuter `next build`
4. ✅ Déployer avec succès

---

## 🐛 Dépannage

### Erreur: "No Next.js version detected"

**Cause** : Root Directory non configuré ou incorrect.

**Solution** :
1. Vérifier que **Root Directory** = `apps/web-app` dans Vercel Dashboard
2. Vérifier que `apps/web-app/package.json` contient `"next": "^14.2.0"`
3. Redéployer

### Erreur: "Could not identify Next.js version"

**Cause** : Vercel cherche à la racine.

**Solution** :
1. Configurer Root Directory dans Vercel Dashboard
2. Supprimer `vercel.json` à la racine si nécessaire
3. Redéployer

---

## 📋 Checklist Finale

- [x] ✅ `apps/web-app/package.json` contient `next` dans dependencies
- [x] ✅ Next.js installé localement (`next@14.2.35`)
- [x] ✅ `vercel.json` configuré avec `rootDirectory`
- [ ] ⏳ **Root Directory configuré dans Vercel Dashboard** : `apps/web-app` ⚠️ **CRITIQUE**
- [ ] ⏳ Variables d'environnement configurées
- [ ] ⏳ Redéployer et vérifier

---

## 🚀 Action Immédiate

**La seule action requise** :

1. **Aller sur Vercel Dashboard**
2. **Settings → General**
3. **Root Directory** : `apps/web-app`
4. **Sauvegarder**
5. **Redéployer**

---

**Configuration prête** ✅  
**Action requise** : Configurer Root Directory dans Vercel Dashboard ⚠️

