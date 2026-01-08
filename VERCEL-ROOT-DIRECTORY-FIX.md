# 🔧 Correction Configuration Vercel - Root Directory

## ❌ Problème Identifié

Vercel exécute le build à la racine du projet au lieu de `apps/web-app`, ce qui cause l'erreur :

```
> academia-hub@1.0.0 build
> tsc && vite build
```

Ce script est pour un projet Vite (racine), pas pour Next.js (`apps/web-app`).

---

## ✅ Solutions Appliquées

### 1. Fichier `vercel.json` à la racine

Un fichier `vercel.json` a été créé à la racine pour indiquer à Vercel d'utiliser `apps/web-app` :

```json
{
  "buildCommand": "cd apps/web-app && npm run build",
  "outputDirectory": "apps/web-app/.next",
  "framework": "nextjs",
  "installCommand": "cd apps/web-app && npm install",
  "devCommand": "cd apps/web-app && npm run dev",
  "rootDirectory": "apps/web-app"
}
```

### 2. Configuration dans Vercel Dashboard

⚠️ **IMPORTANT** : Vous devez également configurer dans le dashboard Vercel :

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Sélectionner votre projet**
3. **Settings → General**
4. **Root Directory** : `apps/web-app` ⚠️ **CRITIQUE**
5. **Sauvegarder**

---

## 🔄 Alternative : Configuration via Dashboard uniquement

Si vous préférez ne pas avoir de `vercel.json` à la racine, vous pouvez :

1. **Supprimer** `vercel.json` à la racine
2. **Configurer uniquement dans Vercel Dashboard** :
   - **Root Directory** : `apps/web-app`
   - Vercel détectera automatiquement Next.js et utilisera les bons scripts

---

## ✅ Vérification

Après configuration, Vercel devrait :

1. ✅ Installer les dépendances dans `apps/web-app/`
2. ✅ Exécuter `npm run build` dans `apps/web-app/` (Next.js)
3. ✅ Utiliser `.next` comme output directory
4. ✅ Déployer correctement l'application Next.js

---

## 📋 Checklist

- [x] ✅ `vercel.json` créé à la racine avec `rootDirectory: "apps/web-app"`
- [x] ✅ `apps/web-app/vercel.json` simplifié
- [ ] ⏳ **Configurer Root Directory dans Vercel Dashboard** : `apps/web-app` ⚠️ **CRITIQUE**
- [ ] ⏳ Variables d'environnement configurées
- [ ] ⏳ Redéployer

---

## 🚀 Redéploiement

1. **Commit et push** :
   ```bash
   git add vercel.json apps/web-app/vercel.json
   git commit -m "fix: configure Vercel pour utiliser apps/web-app comme root directory"
   git push
   ```

2. **Vérifier dans Vercel Dashboard** :
   - Root Directory = `apps/web-app`
   - Variables d'environnement configurées

3. **Redéployer** :
   - Vercel redéploiera automatiquement
   - Ou déclencher manuellement : Deployments → Redeploy

---

**Configuration corrigée** ✅  
**Prêt pour redéploiement** ✅

