# 🌐 Academia Hub Web SaaS

Application Web SaaS pour Academia Hub - Gestion scolaire multi-tenant.

## 🎯 Caractéristiques

- ✅ **Online-First** : Fonctionne uniquement avec connexion internet
- ✅ **Multi-tenant** : Support multi-écoles natif
- ✅ **API REST** : Communication via backend NestJS
- ✅ **Aucun Electron** : Application Web pure
- ✅ **Aucun accès DB direct** : Tout passe par l'API

## 🏗️ Architecture

```
apps/web-app/
├── src/
│   ├── app/                    # Application principale
│   │   ├── App.tsx            # Point d'entrée
│   │   └── main.tsx           # Bootstrap
│   │
│   ├── components/            # Composants React
│   │   ├── auth/              # Authentification
│   │   ├── dashboard/         # Modules dashboard
│   │   ├── common/            # Composants communs
│   │   └── modals/            # Modales
│   │
│   ├── lib/                   # Bibliothèques
│   │   ├── api/               # Client API HTTP
│   │   │   └── client.ts      # Axios instance
│   │   └── auth/              # Gestion authentification
│   │
│   ├── hooks/                 # Hooks React personnalisés
│   ├── contexts/              # Contextes React
│   ├── services/              # Services frontend (API calls)
│   ├── types/                 # Types TypeScript
│   └── utils/                 # Utilitaires
│
├── public/                    # Assets statiques
├── package.json              # Dépendances Web uniquement
├── vite.config.ts            # Configuration Vite
└── tsconfig.json             # Configuration TypeScript
```

## 🚀 Démarrage

### Installation

```bash
cd apps/web-app
npm install
```

### Développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Build Production

```bash
npm run build
```

Le build sera dans `dist/`

## 📦 Dépendances

### Core
- **React 18** : UI library
- **TypeScript** : Type safety
- **Vite** : Build tool
- **React Router** : Routing

### UI
- **Tailwind CSS** : Styling
- **Headless UI** : Composants UI
- **Heroicons** : Icônes
- **Lucide React** : Icônes supplémentaires

### State & Data
- **Zustand** : State management
- **React Query** : Data fetching & caching
- **Axios** : HTTP client

### Utilitaires
- **date-fns** : Manipulation dates
- **uuid** : Génération UUID
- **jspdf** : Génération PDF
- **xlsx** : Manipulation Excel

## 🔐 Authentification

L'application utilise JWT pour l'authentification :

1. Login via `/api/auth/login`
2. Token stocké dans httpOnly cookie (sécurisé)
3. Token inclus automatiquement dans les requêtes API
4. Refresh automatique avant expiration

## 🌍 Multi-tenant

Résolution du tenant :
- Par sous-domaine : `ecole-a.academiahub.com`
- Par header : `X-Tenant-ID`
- Par JWT : `tenant_id` dans le token

## 📡 API

Toutes les données proviennent de l'API backend :

- Base URL : `process.env.VITE_API_URL` ou `http://localhost:3000`
- Endpoints : `/api/*`
- Format : REST JSON
- Authentification : JWT Bearer token

## 🧪 Tests

```bash
# Lint
npm run lint

# Type check
npm run type-check

# Format
npm run format
```

## 📚 Structure des Modules

Chaque module suit cette structure :

```
modules/students/
├── components/        # Composants spécifiques
├── hooks/            # Hooks spécifiques
├── services/         # Services API
└── types/            # Types TypeScript
```

## ⚠️ Règles Importantes

1. **Aucun Electron** : Pas de `window.electronAPI`
2. **Aucun accès DB** : Tout passe par l'API
3. **Online-First** : Pas de mode offline
4. **API uniquement** : Pas de logique métier dans le frontend

## 🔄 Migration depuis Desktop

Pour migrer du code Desktop vers Web :

1. Remplacer `electronBridge` par `apiClient`
2. Remplacer `window.electronAPI` par appels HTTP
3. Adapter les types Electron → API
4. Supprimer toute logique offline

---

*Application Web SaaS - Online-First*
