# 📚 Référence Complète des Commandes - Academia Hub

**Date** : 2025-01-17  
**Version** : 1.0.0  
**Statut** : ✅ **Projet Prêt pour Développement**

---

## 📋 Table des Matières

1. [État du Projet](#état-du-projet)
2. [Commandes Racine (Monorepo)](#commandes-racine-monorepo)
3. [Commandes API Server](#commandes-api-server)
4. [Commandes Frontend (Web App)](#commandes-frontend-web-app)
5. [Commandes Base de Données (Prisma)](#commandes-base-de-données-prisma)
6. [Commandes Docker](#commandes-docker)
7. [Commandes Desktop App](#commandes-desktop-app)
8. [Workflows Recommandés](#workflows-recommandés)

---

## ✅ État du Projet

### Architecture

```
Academia Hub (Monorepo)
├── apps/
│   ├── api-server/      ✅ NestJS + Prisma + PostgreSQL
│   ├── web-app/         ✅ Next.js (Production)
│   ├── desktop-app/     ✅ Vite + React (Modèle)
│   └── mobile-app/      📱 Prévu (React Native)
├── docker-compose.dev.yml ✅ Configuration Docker
├── start-dev.sh         ✅ Script orchestré (Linux/Mac)
└── start-dev.bat        ✅ Script orchestré (Windows)
```

### Statut des Composants

| Composant | Statut | Port | URL |
|-----------|--------|------|-----|
| **PostgreSQL** | ✅ Configuré | 5432 | `postgresql://localhost:5432/academia_hub` |
| **API Server** | ✅ Compilé sans erreurs | 3000 | `http://localhost:3000/api` |
| **Frontend Web** | ✅ Configuré | 3001 | `http://localhost:3001` |
| **Health Check** | ✅ Implémenté | - | `http://localhost:3000/api/health` |
| **Docker Compose** | ✅ Configuré | - | - |

---

## 🎯 Commandes Racine (Monorepo)

**Dossier** : Racine du projet (`D:\Projet YEHI OR Tech\Academia Hub Web\`)

### Démarrage Orchestré

```bash
# Linux/Mac - Démarrage automatique (PostgreSQL → API → Frontend)
npm run start:dev
# ou
./start-dev.sh

# Windows - Démarrage automatique
npm run start:dev:win
# ou
start-dev.bat
```

### Démarrage Individuel

```bash
# Démarrer uniquement l'API
npm run start:api

# Démarrer uniquement le Frontend
npm run start:frontend
```

### Docker Compose

```bash
# Démarrer tous les services (logs visibles)
npm run start:docker

# Démarrer en arrière-plan
npm run start:docker:detached

# Arrêter les services
npm run stop:docker

# Voir les logs
npm run logs:docker

# Vérifier l'état des services
npm run docker:ps

# Reconstruire les images
npm run docker:build
```

### Autres Commandes

```bash
# Build général
npm run build

# Lint
npm run lint

# Nettoyage
npm run clean
npm run clean:all
```

---

## 🔧 Commandes API Server

**Dossier** : `apps/api-server/`

### Développement

```bash
cd apps/api-server

# Démarrer en mode développement (watch mode)
npm run start:dev

# Démarrer en mode debug
npm run start:debug

# Démarrer en mode production
npm run build
npm run start:prod
```

### Build & Compilation

```bash
# Compiler le projet
npm run build

# Vérifier la compilation (sans erreurs ✅)
npm run build
```

### Tests

```bash
# Lancer les tests
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Code Quality

```bash
# Linter et corriger
npm run lint

# Formater le code
npm run format
```

### Migrations Prisma (Base de Données)

```bash
# Vérifier le statut des migrations
npm run migrate:status

# Créer une nouvelle migration (développement)
npm run migrate:dev

# Appliquer les migrations (production)
npm run migrate:deploy

# Générer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio
```

### Scripts Utilitaires

```bash
# Valider le schéma
npm run validate:schema

# Analyser le schéma
npm run analyze:schema

# Vérifier RLS (Row-Level Security)
npm run verify:rls

# Générer migrations sécurisées
npm run migrate:generate-safe

# Valider les migrations
npm run migrate:validate
```

### TypeORM (Legacy - Migration en cours)

```bash
# Générer une migration TypeORM
npm run migration:generate

# Appliquer les migrations TypeORM
npm run migration:run

# Revenir en arrière
npm run migration:revert
```

### SQLite (Offline-First - Legacy)

```bash
# Générer le schéma SQLite
npm run generate:sqlite-schema

# Gérer les migrations SQLite
npm run migrate:sqlite:generate
npm run migrate:sqlite:up
npm run migrate:sqlite:down
```

---

## 🌐 Commandes Frontend (Web App)

**Dossier** : `apps/web-app/`

### Développement

```bash
cd apps/web-app

# Démarrer en mode développement
npm run dev
# → http://localhost:3001

# Build pour production
npm run build

# Démarrer en mode production
npm run start
```

### Code Quality

```bash
# Vérification TypeScript
npm run type-check

# Linter
npm run lint
```

### Optimisation & SEO

```bash
# Optimiser les images
npm run optimize-images

# Vérifier le SEO
npm run check-seo

# Générer le sitemap
npm run generate-sitemap

# Analyse Lighthouse
npm run lighthouse
```

---

## 🗄️ Commandes Base de Données (Prisma)

**Dossier** : `apps/api-server/`

### Prisma Client

```bash
cd apps/api-server

# Générer le client Prisma (après modification du schema)
npx prisma generate

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio
# → http://localhost:5555
```

### Migrations

```bash
# Vérifier le statut des migrations
npx prisma migrate status

# Créer une nouvelle migration (développement)
npx prisma migrate dev
# ou
npm run migrate:dev

# Appliquer les migrations (production)
npx prisma migrate deploy
# ou
npm run migrate:deploy

# Réinitialiser la base de données (⚠️ supprime toutes les données)
npx prisma migrate reset
```

### Schéma

```bash
# Valider le schéma Prisma
npx prisma validate

# Formater le schéma
npx prisma format

# Introspecter une base de données existante
npx prisma db pull
```

### Seed (Données de test)

```bash
# Exécuter le seed
npx prisma db seed
# ou
npm run prisma:seed
```

### Connexion Directe

```bash
# Se connecter à PostgreSQL via psql
psql -h localhost -U postgres -d academia_hub

# Ou via Prisma
npx prisma db execute --stdin
```

---

## 🐳 Commandes Docker

**Dossier** : Racine du projet

### Démarrage & Arrêt

```bash
# Démarrer tous les services (logs visibles)
docker compose -f docker-compose.dev.yml up

# Démarrer en arrière-plan
docker compose -f docker-compose.dev.yml up -d

# Arrêter (garder les données)
docker compose -f docker-compose.dev.yml down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker compose -f docker-compose.dev.yml down -v
```

### Logs

```bash
# Voir tous les logs
docker compose -f docker-compose.dev.yml logs -f

# Logs d'un service spécifique
docker compose -f docker-compose.dev.yml logs -f api-server
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f postgres
```

### Gestion des Services

```bash
# Vérifier l'état des services
docker compose -f docker-compose.dev.yml ps

# Redémarrer un service
docker compose -f docker-compose.dev.yml restart api-server
docker compose -f docker-compose.dev.yml restart frontend
docker compose -f docker-compose.dev.yml restart postgres

# Arrêter un service
docker compose -f docker-compose.dev.yml stop api-server

# Démarrer un service
docker compose -f docker-compose.dev.yml start api-server
```

### Build

```bash
# Reconstruire toutes les images
docker compose -f docker-compose.dev.yml build

# Reconstruire un service spécifique
docker compose -f docker-compose.dev.yml build api-server
docker compose -f docker-compose.dev.yml build frontend
```

### Shell & Exécution

```bash
# Accéder au shell de l'API
docker compose -f docker-compose.dev.yml exec api-server sh

# Accéder à PostgreSQL
docker compose -f docker-compose.dev.yml exec postgres psql -U postgres -d academia_hub

# Exécuter une commande dans un conteneur
docker compose -f docker-compose.dev.yml exec api-server npx prisma migrate deploy
docker compose -f docker-compose.dev.yml exec api-server npm run build
```

---

## 💻 Commandes Desktop App

**Dossier** : `apps/desktop-app/`

### Développement

```bash
cd apps/desktop-app

# Démarrer en mode développement
npm run dev

# Build
npm run build

# Preview
npm run preview
```

### Code Quality

```bash
# Vérification TypeScript
npm run type-check

# Linter
npm run lint

# Formater
npm run format
```

---

## 🔄 Workflows Recommandés

### Workflow 1 : Développement Local (Sans Docker)

```bash
# 1. Démarrer PostgreSQL (si pas déjà démarré)
# Windows: Vérifier le service PostgreSQL
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql

# 2. Appliquer les migrations
cd apps/api-server
npm run migrate:deploy

# 3. Démarrer l'API
npm run start:dev
# → http://localhost:3000/api

# 4. Dans un autre terminal, démarrer le Frontend
cd apps/web-app
npm run dev
# → http://localhost:3001
```

### Workflow 2 : Développement Local (Avec Docker) ⭐ Recommandé

```bash
# 1. Démarrer Docker Desktop

# 2. Démarrer tous les services
npm run start:docker
# ou
docker compose -f docker-compose.dev.yml up

# 3. Tout est prêt automatiquement :
#    - PostgreSQL sur localhost:5432
#    - API sur http://localhost:3000/api
#    - Frontend sur http://localhost:3001
```

### Workflow 3 : Développement avec Script Orchestré

```bash
# Linux/Mac
./start-dev.sh

# Windows
start-dev.bat

# Le script gère automatiquement :
# 1. Vérification PostgreSQL
# 2. Application des migrations
# 3. Démarrage API
# 4. Démarrage Frontend
```

### Workflow 4 : Modification du Schéma Prisma

```bash
cd apps/api-server

# 1. Modifier prisma/schema.prisma

# 2. Créer une migration
npm run migrate:dev
# ou
npx prisma migrate dev --name nom_de_la_migration

# 3. Générer le client Prisma
npx prisma generate

# 4. Redémarrer l'API
npm run start:dev
```

### Workflow 5 : Déploiement Production

```bash
# API Server
cd apps/api-server
npm run build
npm run start:prod

# Frontend
cd apps/web-app
npm run build
npm run start
```

---

## 📊 Commandes par Catégorie

### 🚀 Démarrage Rapide

| Commande | Description | Dossier |
|----------|-------------|---------|
| `npm run start:dev` | Démarrage orchestré (Linux/Mac) | Racine |
| `npm run start:dev:win` | Démarrage orchestré (Windows) | Racine |
| `npm run start:docker` | Démarrage Docker Compose | Racine |
| `./start-dev.sh` | Script orchestré (Linux/Mac) | Racine |
| `start-dev.bat` | Script orchestré (Windows) | Racine |

### 🔧 API Server

| Commande | Description |
|----------|-------------|
| `npm run start:dev` | Développement (watch mode) |
| `npm run start:prod` | Production |
| `npm run build` | Compiler |
| `npm run test` | Tests |
| `npm run lint` | Linter |

### 🗄️ Base de Données

| Commande | Description |
|----------|-------------|
| `npm run migrate:dev` | Créer migration (dev) |
| `npm run migrate:deploy` | Appliquer migrations (prod) |
| `npm run migrate:status` | Statut des migrations |
| `npx prisma generate` | Générer client Prisma |
| `npx prisma studio` | Interface graphique |

### 🌐 Frontend

| Commande | Description |
|----------|-------------|
| `npm run dev` | Développement |
| `npm run build` | Build production |
| `npm run start` | Production |
| `npm run type-check` | Vérification TypeScript |

### 🐳 Docker

| Commande | Description |
|----------|-------------|
| `npm run start:docker` | Démarrer tous les services |
| `npm run stop:docker` | Arrêter tous les services |
| `npm run logs:docker` | Voir les logs |
| `npm run docker:ps` | État des services |

---

## ✅ Vérifications de Santé

### Vérifier que l'API fonctionne

```bash
# Health check
curl http://localhost:3000/api/health

# Réponse attendue :
{
  "status": "ok",
  "database": { "status": "connected" }
}

# Readiness check
curl http://localhost:3000/api/ready

# Réponse attendue :
{
  "ready": true,
  "database": "connected"
}
```

### Vérifier PostgreSQL

```bash
# Linux/Mac
pg_isready -h localhost -p 5432

# Windows (PowerShell)
Get-Service -Name postgresql*

# Connexion directe
psql -h localhost -U postgres -d academia_hub
```

### Vérifier les Ports

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :3000
lsof -i :3001
lsof -i :5432
```

---

## 🔍 Commandes de Debug

### API Server

```bash
cd apps/api-server

# Mode debug
npm run start:debug

# Voir les logs en temps réel
# (Les logs s'affichent dans le terminal)
```

### Frontend

```bash
cd apps/web-app

# Mode développement avec logs détaillés
npm run dev

# Vérifier les erreurs TypeScript
npm run type-check
```

### Docker

```bash
# Logs en temps réel
docker compose -f docker-compose.dev.yml logs -f api-server

# Shell dans le conteneur API
docker compose -f docker-compose.dev.yml exec api-server sh

# Vérifier les variables d'environnement
docker compose -f docker-compose.dev.yml exec api-server env
```

---

## 📝 Variables d'Environnement Requises

### API Server (`apps/api-server/.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/academia_hub
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/academia_hub

# API
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend (`apps/web-app/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

---

## 🎯 Commandes Essentielles (Quick Reference)

### Démarrage Rapide

```bash
# Option 1 : Script orchestré (recommandé)
npm run start:dev

# Option 2 : Docker Compose
npm run start:docker

# Option 3 : Manuel
npm run start:api      # Terminal 1
npm run start:frontend # Terminal 2
```

### Base de Données

```bash
cd apps/api-server

# Appliquer les migrations
npm run migrate:deploy

# Générer le client Prisma
npx prisma generate

# Ouvrir Prisma Studio
npx prisma studio
```

### Build Production

```bash
# API
cd apps/api-server
npm run build

# Frontend
cd apps/web-app
npm run build
```

---

## 📚 Documentation Complémentaire

- [START-GUIDE.md](./START-GUIDE.md) - Guide de démarrage complet
- [DOCKER-COMPOSE-GUIDE.md](./DOCKER-COMPOSE-GUIDE.md) - Guide Docker Compose
- [DOCKER-INSTALLATION-GUIDE.md](./DOCKER-INSTALLATION-GUIDE.md) - Installation Docker
- [API-ENDPOINTS.md](./apps/api-server/API-ENDPOINTS.md) - Documentation API
- [ARCHITECTURE-ANALYSIS.md](./ARCHITECTURE-ANALYSIS.md) - Analyse architecturale

---

**Dernière mise à jour** : 2025-01-17  
**Statut** : ✅ **Documentation Complète**
