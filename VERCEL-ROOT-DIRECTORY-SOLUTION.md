# 🔧 Solution Définitive - Root Directory Vercel

## ❌ Problème

Vercel ne détecte pas Next.js car il cherche le `package.json` à la racine au lieu de `apps/web-app/`.

**Erreur** :
```
Warning: Could not identify Next.js version
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

---

## ✅ Solution : Configuration Vercel Dashboard

**Le `vercel.json` seul ne suffit pas.** Vous **DEVEZ** configurer dans Vercel Dashboard :

### Étapes Détaillées

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Se connecter** à votre compte
3. **Sélectionner le projet** "Academia-Hub-web" (ou le nom de votre projet)
4. **Cliquer sur "Settings"** (en haut à droite)
5. **Dans le menu de gauche, cliquer sur "General"**
6. **Scroller jusqu'à "Root Directory"**
7. **Cliquer sur "Edit"**
8. **Entrer** : `apps/web-app` (sans slash final)
9. **Cliquer sur "Save"**

### Vérification

Après avoir configuré le Root Directory, vous devriez voir :
- ✅ **Root Directory** : `apps/web-app`
- ✅ **Framework Preset** : Next.js (auto-détecté)
- ✅ **Build Command** : `next build` (auto-détecté)
- ✅ **Output Directory** : `.next` (auto-détecté)

---

## 🔄 Alternative : Supprimer `vercel.json` à la racine

Si le `vercel.json` cause des conflits, vous pouvez :

1. **Supprimer** `vercel.json` à la racine
2. **Configurer uniquement dans Vercel Dashboard** :
   - Root Directory : `apps/web-app`
   - Tous les autres paramètres seront auto-détectés par Vercel

---

## 📋 Variables d'Environnement

Dans **Settings → Environment Variables**, ajouter :

### Production

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ankbtgwlofidxtafdueu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_1XCM6w3jm4368f-P36BaKw_XrCoHmZy
NEXT_PUBLIC_API_URL=https://api.academiahub.com
NEXT_PUBLIC_APP_URL=https://app.academiahub.com
NEXT_PUBLIC_PLATFORM=web
NEXT_PUBLIC_ENV=production
```

### Preview (optionnel)

Les mêmes variables pour les preview deployments.

---

## ✅ Vérification Post-Configuration

Après avoir configuré le Root Directory dans Vercel Dashboard :

1. **Redéployer** :
   - Aller dans **Deployments**
   - Cliquer sur **"..."** → **"Redeploy"**
   - Ou faire un nouveau commit/push

2. **Vérifier les logs** :
   - Le build devrait maintenant :
     - ✅ Installer les dépendances dans `apps/web-app/`
     - ✅ Détecter Next.js automatiquement
     - ✅ Exécuter `next build` (pas `tsc && vite build`)
     - ✅ Déployer avec succès

---

## 🐛 Si l'erreur persiste

### Vérifier le Root Directory

Dans Vercel Dashboard → Settings → General :
- **Root Directory** doit être exactement : `apps/web-app`
- **Pas de slash final** : `apps/web-app/` ❌
- **Pas d'espace** : `apps/web-app ` ❌

### Vérifier les fichiers

```bash
# Vérifier que le package.json existe
ls apps/web-app/package.json

# Vérifier que Next.js est dans les dépendances
grep '"next"' apps/web-app/package.json
```

### Supprimer le cache Vercel

1. **Settings → General**
2. **Clear Build Cache** (si disponible)
3. **Redéployer**

---

## 📋 Checklist Finale

- [x] ✅ `vercel.json` configuré avec `rootDirectory: "apps/web-app"`
- [x] ✅ `apps/web-app/package.json` contient `next` dans dependencies
- [x] ✅ Next.js installé localement
- [ ] ⏳ **Root Directory configuré dans Vercel Dashboard** : `apps/web-app` ⚠️ **CRITIQUE**
- [ ] ⏳ Variables d'environnement configurées
- [ ] ⏳ Redéployer et vérifier

---

## 🚀 Action Immédiate

**La seule action requise pour résoudre le problème** :

1. **Aller sur Vercel Dashboard**
2. **Settings → General**
3. **Root Directory** : `apps/web-app`
4. **Sauvegarder**
5. **Redéployer**

**C'est tout !** Après cette configuration, Vercel détectera automatiquement Next.js.

---

**Configuration prête** ✅  
**Action requise** : Configurer Root Directory dans Vercel Dashboard ⚠️

