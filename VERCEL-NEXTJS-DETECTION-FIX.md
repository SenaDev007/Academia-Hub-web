# 🔧 Correction Détection Next.js - Vercel

## ❌ Erreur Rencontrée

```
Warning: Could not identify Next.js version, ensure it is defined as a project dependency.
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

## 🔍 Analyse

Vercel ne détecte pas Next.js car :
1. Le Root Directory n'est pas correctement configuré dans Vercel Dashboard
2. Vercel cherche `package.json` à la racine au lieu de `apps/web-app/package.json`

## ✅ Solutions Appliquées

### 1. Fichier `vercel.json` à la racine

Le fichier `vercel.json` a été mis à jour pour être plus simple et explicite :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "rootDirectory": "apps/web-app"
}
```

**Note** : Les commandes sont relatives au `rootDirectory`, donc `npm run build` s'exécutera dans `apps/web-app/`.

### 2. Vérification `package.json`

Le fichier `apps/web-app/package.json` contient bien :
- ✅ `"next": "^14.2.0"` dans `dependencies`
- ✅ Script `"build": "next build"`

---

## ⚠️ ACTION CRITIQUE - Vercel Dashboard

**Vous DEVEZ configurer le Root Directory dans Vercel Dashboard** :

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Sélectionner votre projet**
3. **Settings → General**
4. **Root Directory** : `apps/web-app` ⚠️ **CRITIQUE**
5. **Sauvegarder**

**Sans cette configuration, Vercel ignorera le `vercel.json` et cherchera à la racine.**

---

## 🔄 Alternative : Supprimer `vercel.json` à la racine

Si vous préférez configurer uniquement via le dashboard :

1. **Supprimer** `vercel.json` à la racine
2. **Configurer dans Vercel Dashboard** :
   - **Root Directory** : `apps/web-app`
   - Vercel détectera automatiquement Next.js

---

## ✅ Vérification

Après configuration du Root Directory dans Vercel Dashboard, Vercel devrait :

1. ✅ Détecter Next.js automatiquement
2. ✅ Installer les dépendances dans `apps/web-app/`
3. ✅ Exécuter `next build` (pas `tsc && vite build`)
4. ✅ Utiliser `.next` comme output directory

---

## 📋 Checklist

- [x] ✅ `vercel.json` mis à jour avec `rootDirectory: "apps/web-app"`
- [x] ✅ `apps/web-app/package.json` contient `next` dans dependencies
- [ ] ⏳ **Configurer Root Directory dans Vercel Dashboard** : `apps/web-app` ⚠️ **CRITIQUE**
- [ ] ⏳ Variables d'environnement configurées
- [ ] ⏳ Redéployer

---

## 🚀 Redéploiement

1. **Commit et push** :
   ```bash
   git add vercel.json
   git commit -m "fix: configure rootDirectory dans vercel.json"
   git push
   ```

2. **Configurer dans Vercel Dashboard** :
   - Root Directory = `apps/web-app` ⚠️ **OBLIGATOIRE**

3. **Redéployer** :
   - Vercel redéploiera automatiquement
   - Ou déclencher manuellement : Deployments → Redeploy

---

## 🐛 Si l'erreur persiste

### Option 1 : Vérifier le Root Directory

Dans Vercel Dashboard → Settings → General, vérifier que :
- **Root Directory** = `apps/web-app` (exactement, sans slash final)

### Option 2 : Supprimer `vercel.json` à la racine

Si le `vercel.json` cause des problèmes :

1. Supprimer `vercel.json` à la racine
2. Configurer uniquement dans Vercel Dashboard :
   - Root Directory : `apps/web-app`
   - Build Command : (laisser vide, auto-détecté)
   - Output Directory : (laisser vide, auto-détecté)

### Option 3 : Vérifier les dépendances

```bash
cd apps/web-app
npm list next
```

Devrait afficher : `next@14.2.0` (ou version similaire)

---

**Configuration corrigée** ✅  
**Action requise** : Configurer Root Directory dans Vercel Dashboard ⚠️

