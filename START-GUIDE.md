# 🚀 Guide de Démarrage - Academia Hub

**Date** : 2025-01-17  
**Version** : 1.0.0

---

## 📋 Table des Matières

1. [Méthodes de Démarrage](#méthodes-de-démarrage)
2. [Ordre Professionnel](#ordre-professionnel)
3. [Scripts Disponibles](#scripts-disponibles)
4. [Vérifications](#vérifications)

---

## 🎯 Méthodes de Démarrage

Vous avez **3 options** pour démarrer Academia Hub :

### Option 1 : Script Orchestré (Recommandé) ⭐

**Linux/Mac** :
```bash
./start-dev.sh
# ou
npm run start:dev
```

**Windows** :
```cmd
start-dev.bat
# ou
npm run start:dev:win
```

✅ **Avantages** :
- Démarrage automatique dans le bon ordre
- Vérifications de santé intégrées
- Gestion des erreurs

---

### Option 2 : Docker Compose (Recommandé pour équipe) 🐳

```bash
# Démarrer tous les services
docker-compose -f docker-compose.dev.yml up

# Ou en arrière-plan
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f
```

✅ **Avantages** :
- Environnement identique pour tous
- Isolation complète
- Pas besoin d'installer PostgreSQL localement

📖 **Voir** : [DOCKER-COMPOSE-GUIDE.md](./DOCKER-COMPOSE-GUIDE.md)

---

### Option 3 : Démarrage Manuel (Pour debug)

**Ordre obligatoire** :

1. **PostgreSQL** (Port 5432)
   ```bash
   # Vérifier que PostgreSQL est démarré
   pg_isready -h localhost -p 5432
   ```

2. **API Server** (Port 3000)
   ```bash
   cd apps/api-server
   npm run start:dev
   ```

3. **Frontend** (Port 3001)
   ```bash
   cd apps/web-app
   npm run dev
   ```

---

## 📊 Ordre Professionnel

L'application respecte l'ordre professionnel de démarrage :

```
┌─────────────────────────────────────────┐
│         FRONTEND (UI Layer)            │ ← Dernier (Port 3001)
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP/REST
                  ▼
┌─────────────────────────────────────────┐
│         API SERVER (Business Logic)   │ ← Deuxième (Port 3000)
└─────────────────┬───────────────────────┘
                  │
                  │ SQL/Prisma
                  ▼
┌─────────────────────────────────────────┐
│         DATABASE (Data Layer)          │ ← Premier (Port 5432)
└─────────────────────────────────────────┘
```

### Pourquoi cet ordre ?

1. **Database** : Infrastructure de base, doit être disponible
2. **API Server** : Dépend de la DB, doit être prêt avant le frontend
3. **Frontend** : Dépend de l'API, démarre en dernier

---

## 🔧 Scripts Disponibles

### Scripts NPM (Racine)

```bash
# Démarrage orchestré (Linux/Mac)
npm run start:dev

# Démarrage orchestré (Windows)
npm run start:dev:win

# Démarrage Docker Compose
npm run start:docker
npm run start:docker:detached  # En arrière-plan

# Arrêter Docker Compose
npm run stop:docker

# Voir les logs Docker
npm run logs:docker

# Démarrer un service individuellement
npm run start:api
npm run start:frontend
```

### Scripts API Server

```bash
cd apps/api-server

# Développement
npm run start:dev

# Production
npm run build
npm run start:prod

# Migrations Prisma
npm run migrate:dev
npm run migrate:deploy
```

### Scripts Frontend

```bash
cd apps/web-app

# Développement
npm run dev

# Production
npm run build
npm run start
```

---

## ✅ Vérifications

### 1. Vérifier PostgreSQL

```bash
# Linux/Mac
pg_isready -h localhost -p 5432

# Windows
psql -h localhost -U postgres -d academia_hub
```

### 2. Vérifier l'API

```bash
# Health check
curl http://localhost:3000/api/health

# Readiness check (pour orchestration)
curl http://localhost:3000/api/ready
```

**Réponse attendue** :
```json
{
  "status": "ok",
  "timestamp": "2025-01-17T...",
  "service": "academia-hub-api",
  "database": {
    "status": "connected"
  }
}
```

### 3. Vérifier le Frontend

Ouvrir dans le navigateur : `http://localhost:3001`

---

## 🐛 Dépannage

### Problème : PostgreSQL non accessible

**Solution** :
- **Linux** : `sudo systemctl start postgresql`
- **Mac** : `brew services start postgresql`
- **Windows** : Vérifier le service PostgreSQL dans les Services Windows
- **Docker** : Utiliser Docker Compose (Option 2)

### Problème : API ne démarre pas

**Vérifications** :
1. PostgreSQL est-il démarré ?
2. Les migrations Prisma sont-elles appliquées ?
3. Le fichier `.env` existe-t-il dans `apps/api-server/` ?
4. Voir les logs : `tail -f /tmp/academia-hub/api-server.log`

### Problème : Frontend ne peut pas se connecter à l'API

**Vérifications** :
1. L'API est-elle démarrée ? (`curl http://localhost:3000/api/health`)
2. Le fichier `.env.local` existe-t-il dans `apps/web-app/` ?
3. `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api` est-il défini ?

### Problème : Erreurs CORS

**Solution** :
- Vérifier que `FRONTEND_URL=http://localhost:3001` est défini dans `apps/api-server/.env`

---

## 📝 Variables d'Environnement Requises

### API Server (`apps/api-server/.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/academia_hub
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/academia_hub

# API
PORT=3000
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

## 🎯 Quick Start

### Pour un nouveau développeur

```bash
# 1. Cloner le repo
git clone <repo>
cd academia-hub

# 2. Installer les dépendances
npm install
cd apps/api-server && npm install && cd ../..
cd apps/web-app && npm install && cd ../..

# 3. Démarrer avec Docker Compose (recommandé)
docker-compose -f docker-compose.dev.yml up

# OU démarrer avec le script orchestré
./start-dev.sh  # Linux/Mac
start-dev.bat   # Windows
```

### Pour un développeur expérimenté

```bash
# Option 1 : Script orchestré
npm run start:dev

# Option 2 : Docker Compose
npm run start:docker

# Option 3 : Manuel (si besoin de debug)
# 1. Démarrer PostgreSQL
# 2. npm run start:api
# 3. npm run start:frontend
```

---

## 📚 Documentation Complémentaire

- [DOCKER-COMPOSE-GUIDE.md](./DOCKER-COMPOSE-GUIDE.md) - Guide Docker Compose
- [ARCHITECTURE-ANALYSIS.md](./ARCHITECTURE-ANALYSIS.md) - Analyse architecturale
- [API-ENDPOINTS.md](./apps/api-server/API-ENDPOINTS.md) - Documentation API

---

**Dernière mise à jour** : 2025-01-17
