# 🔐 Configuration Supabase Auth - Academia Hub

## ✅ Statut : Configuration RLS et Auth

Ce document décrit la configuration complète de Supabase Auth et RLS pour Academia Hub.

---

## 📋 1. Configuration des Redirect URLs

Dans le **Supabase Dashboard** > **Authentication** > **URL Configuration**, ajoutez les URLs suivantes :

### Redirect URLs autorisées :

```
# Local Development
http://localhost:3000/**
http://localhost:3001/**
http://127.0.0.1:3000/**
http://127.0.0.1:3001/**

# Vercel Preview
https://*.vercel.app/**

# Production
https://*.academia-hub.com/**
https://academia-hub.com/**
```

### Site URL :

```
# Local
http://localhost:3001

# Production
https://academia-hub.com
```

---

## 📋 2. Exécution des Policies RLS

### Étape 1 : Accéder à Supabase SQL Editor

1. Ouvrez le **Supabase Dashboard**
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête

### Étape 2 : Exécuter le script RLS

Copiez et exécutez le contenu du fichier :
```
apps/api-server/prisma/migrations/rls-policies.sql
```

### Étape 3 : Vérifier l'activation

Exécutez cette requête pour vérifier que RLS est activé :

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tenants', 'users', 'students', 'payments')
ORDER BY tablename;
```

Toutes les tables doivent avoir `rowsecurity = true`.

---

## 📋 3. Configuration Backend (NestJS)

### Implémenter SET LOCAL dans les requêtes

Dans votre backend NestJS, vous devez définir les variables de session avant chaque requête :

```typescript
// Exemple dans un service
async findStudents(tenantId: string, userId: string, isSuperAdmin: boolean) {
  await this.prisma.$executeRaw`
    SET LOCAL app.current_tenant_id = ${tenantId}::UUID;
    SET LOCAL app.current_user_id = ${userId}::UUID;
    SET LOCAL app.is_super_admin = ${isSuperAdmin};
    SET LOCAL app.is_orion = false;
  `;
  
  return this.prisma.student.findMany({
    where: { tenantId }
  });
}
```

### Créer un Prisma Middleware

Créer un middleware Prisma pour automatiser cela :

```typescript
// src/prisma/prisma.middleware.ts
import { Prisma } from '@prisma/client';

export function createTenantContext(tenantId: string, userId: string, isSuperAdmin = false, isOrion = false) {
  return Prisma.sql`
    SET LOCAL app.current_tenant_id = ${tenantId}::UUID;
    SET LOCAL app.current_user_id = ${userId}::UUID;
    SET LOCAL app.is_super_admin = ${isSuperAdmin};
    SET LOCAL app.is_orion = ${isOrion};
  `;
}
```

---

## 📋 4. Rôles et Permissions

### Rôles PostgreSQL créés :

1. **`academia_app`** : Rôle application (CRUD limité au tenant)
2. **`academia_orion`** : Rôle ORION (lecture seule globale)
3. **`academia_super_admin`** : Rôle super admin (accès global)

### Permissions :

- **academia_app** : SELECT, INSERT, UPDATE, DELETE sur toutes les tables (avec RLS)
- **academia_orion** : SELECT uniquement sur toutes les tables (avec RLS)
- **academia_super_admin** : Toutes les permissions (bypass RLS)

---

## 📋 5. Tests de Sécurité

### Test 1 : Isolation Tenant

```sql
-- Se connecter en tant qu'application
SET ROLE academia_app;
SET LOCAL app.current_tenant_id = 'tenant-1-uuid'::UUID;
SET LOCAL app.current_user_id = 'user-1-uuid'::UUID;
SET LOCAL app.is_super_admin = false;

-- Ne doit retourner que les étudiants du tenant-1
SELECT * FROM students;
```

### Test 2 : Accès Parent

```sql
SET ROLE academia_app;
SET LOCAL app.current_tenant_id = 'tenant-1-uuid'::UUID;
SET LOCAL app.current_user_id = 'parent-user-uuid'::UUID;
SET LOCAL app.is_super_admin = false;

-- Ne doit retourner que les enfants du parent
SELECT * FROM students;
```

### Test 3 : ORION Lecture Seule

```sql
SET ROLE academia_orion;
SET LOCAL app.is_orion = true;

-- Peut lire toutes les données
SELECT * FROM students;
SELECT * FROM payments;

-- Ne peut PAS modifier
-- INSERT INTO students ... -- DOIT ÉCHOUER
```

---

## 📋 6. Variables d'Environnement

Assurez-vous que ces variables sont définies dans `.env.local` :

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_key_here

# Database (server-side only)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

---

## ⚠️ Notes Importantes

1. **RLS est évalué AVANT chaque requête** : Les policies sont vérifiées avant l'exécution de la requête.

2. **SET LOCAL est transactionnel** : Les variables définies avec `SET LOCAL` sont valides uniquement pour la transaction courante.

3. **Performance** : RLS ajoute une légère surcharge. Pour les requêtes fréquentes, considérez l'utilisation d'index sur `tenant_id`.

4. **Migration** : Exécutez le script RLS sur une base de test d'abord pour valider le comportement.

5. **Backup** : Faites un backup de la base de données avant d'activer RLS en production.

---

## 🔗 Ressources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Prisma + RLS](https://www.prisma.io/docs/guides/security/row-level-security)
