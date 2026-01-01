# 🚀 Academia Hub API Server

Backend API central pour Academia Hub - Multi-tenant SaaS.

## 🎯 Caractéristiques

- ✅ **NestJS** : Framework backend moderne et scalable
- ✅ **PostgreSQL** : Base de données multi-tenant
- ✅ **JWT Authentication** : Authentification sécurisée
- ✅ **Multi-tenant** : Isolation des données par tenant
- ✅ **API REST** : Endpoints RESTful standardisés
- ✅ **TypeORM** : ORM pour PostgreSQL
- ✅ **Validation** : Validation automatique des DTOs
- ✅ **Architecture propre** : Controllers → Services → Repositories

## 🏗️ Architecture

```
apps/api-server/
├── src/
│   ├── auth/               # Module d'authentification
│   │   ├── guards/        # Guards JWT et Local
│   │   ├── strategies/    # Strategies Passport
│   │   ├── dto/           # DTOs (LoginDto, RegisterDto)
│   │   └── decorators/    # Decorators (Public, Roles)
│   │
│   ├── users/             # Module utilisateurs
│   │   ├── entities/     # User entity
│   │   ├── dto/          # DTOs
│   │   ├── repositories/ # Data access layer
│   │   └── services/      # Business logic
│   │
│   ├── tenants/           # Module tenants
│   │   ├── entities/     # Tenant entity
│   │   ├── repositories/ # Data access layer
│   │   └── services/      # Business logic
│   │
│   ├── students/          # Module étudiants
│   │   ├── entities/     # Student entity
│   │   ├── dto/          # DTOs (CreateStudentDto, UpdateStudentDto)
│   │   ├── repositories/ # Data access layer
│   │   └── services/      # Business logic
│   │
│   ├── common/            # Code commun
│   │   ├── decorators/   # TenantId, CurrentUser
│   │   ├── guards/       # TenantGuard
│   │   └── interceptors/ # TenantInterceptor
│   │
│   ├── database/          # Configuration base de données
│   ├── app.module.ts     # Module principal
│   └── main.ts           # Point d'entrée
│
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Démarrage

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation

```bash
cd apps/api-server
npm install
```

### Configuration

Copier `.env.example` vers `.env` et configurer :

```bash
cp .env.example .env
```

Éditer `.env` :
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=academia_hub
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

### Base de données

Créer la base de données PostgreSQL :

```sql
CREATE DATABASE academia_hub;
```

### Développement

```bash
npm run start:dev
```

L'API sera disponible sur `http://localhost:3000/api`

### Production

```bash
npm run build
npm run start:prod
```

## 📡 Endpoints

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/refresh` - Rafraîchir le token

### Utilisateurs

- `GET /api/users/me` - Profil utilisateur actuel
- `GET /api/users` - Liste des utilisateurs (tenant)
- `GET /api/users/:id` - Détails utilisateur
- `PATCH /api/users/:id` - Modifier utilisateur
- `DELETE /api/users/:id` - Supprimer utilisateur

### Tenants

- `POST /api/tenants` - Créer un tenant
- `GET /api/tenants` - Liste des tenants
- `GET /api/tenants/:id` - Détails tenant
- `GET /api/tenants/slug/:slug` - Trouver par slug
- `PATCH /api/tenants/:id` - Modifier tenant
- `DELETE /api/tenants/:id` - Supprimer tenant

### Étudiants

- `POST /api/students` - Créer un étudiant
- `GET /api/students` - Liste des étudiants (tenant)
- `GET /api/students/:id` - Détails étudiant
- `PATCH /api/students/:id` - Modifier étudiant
- `DELETE /api/students/:id` - Supprimer étudiant

## 🔐 Authentification

### Inscription

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "tenantId": "uuid-optional"
}
```

### Connexion

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Réponse :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": "uuid"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Utilisation du token

Ajouter le token dans le header :

```
Authorization: Bearer <accessToken>
```

## 🌍 Multi-tenant

### Résolution du tenant

Le tenant est résolu automatiquement via :

1. **Sous-domaine** : `school-a.academiahub.com`
2. **Header** : `X-Tenant-ID: <tenant-id>`
3. **JWT** : `tenantId` dans le payload du token

### Utilisation dans les controllers

```typescript
@Get()
findAll(@TenantId() tenantId: string) {
  return this.service.findAll(tenantId);
}
```

## 📚 Structure des Modules

Chaque module suit cette structure :

```
module-name/
├── entities/          # Entités TypeORM
├── dto/               # Data Transfer Objects
├── repositories/      # Couche d'accès aux données
├── services/          # Logique métier
├── controllers/       # Contrôleurs HTTP
└── module-name.module.ts
```

## 🔒 Sécurité

- ✅ **JWT Authentication** : Tokens sécurisés
- ✅ **Password Hashing** : Bcrypt
- ✅ **Validation** : Class-validator
- ✅ **CORS** : Configuré
- ✅ **Multi-tenant Isolation** : Données isolées par tenant

## 🧪 Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Migrations

```bash
# Générer une migration
npm run migration:generate -- -n MigrationName

# Exécuter les migrations
npm run migration:run

# Revenir en arrière
npm run migration:revert
```

## ⚠️ Règles Importantes

1. **API = Seule source de vérité** : Toute logique métier dans le backend
2. **Multi-tenant** : Toutes les requêtes sont filtrées par tenant
3. **Validation** : Tous les DTOs sont validés automatiquement
4. **Séparation des couches** : Controllers → Services → Repositories

---

*Backend API - Multi-tenant SaaS*
