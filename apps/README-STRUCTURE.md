# 📁 Structure des Applications - Academia Hub

## 🎯 Clarification de l'Architecture

### `apps/web-app/` - **FRONTEND WEB (PRODUCTION)**

**Type** : Next.js App Router  
**Usage** : Application Web SaaS déployée sur Vercel  
**Public** : Oui (accessible via navigateur)  
**Base de données** : API REST uniquement (PostgreSQL via backend)

**Fichiers** : `apps/web-app/src/`

**Déploiement** : Vercel (production)

---

### `apps/desktop-app/` - **VERSION DESKTOP (MODÈLE)**

**Type** : Vite + React  
**Usage** : Application Desktop Electron (référence/modèle)  
**Public** : Non (application locale)  
**Base de données** : SQLite local + API REST

**Fichiers** : `apps/desktop-app/src/`

**Déploiement** : Electron (packaging desktop)

**⚠️ NOTE** : Cette application sert de **modèle de référence** pour certaines fonctionnalités, mais **N'EST PAS** l'application Web de production.

---

### `apps/api-server/` - **BACKEND API**

**Type** : NestJS  
**Usage** : API REST pour toutes les applications  
**Base de données** : PostgreSQL

**Déploiement** : Serveur dédié / Railway / Supabase

---

## 🔄 Workflow de Développement

### Pour le Frontend Web (Production)

1. **Modifier** : `apps/web-app/src/`
2. **Tester** : `cd apps/web-app && npm run dev`
3. **Déployer** : Vercel (automatique via Git)

### Pour la Version Desktop (Référence)

1. **Consulter** : `apps/desktop-app/src/` (modèle)
2. **Reproduire** : Fonctionnalités utiles dans `apps/web-app/src/`
3. **Adapter** : Code Electron → API REST

---

**Dernière mise à jour** : 2025-01-07

