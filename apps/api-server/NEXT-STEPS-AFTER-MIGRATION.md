# 🚀 Prochaines Étapes - Après Migration Initiale

**Date**: Migration initiale réussie  
**Migration**: `20260117123009_init_academia_hub`  
**Base de données**: `academia_hub` (PostgreSQL Local)  
**Statut**: ✅ **Migration appliquée avec succès**

---

## 📋 Checklist Post-Migration

### ✅ Étape 1 : Vérification dans pgAdmin

**Actions**:
1. Ouvrez pgAdmin 4
2. Actualisez la base `academia_hub` (clic droit → Refresh)
3. Développez : `academia_hub` → `Schemas` → `public` → `Tables`
4. Vérifiez que toutes les tables sont présentes

**Tables principales à vérifier**:
- `tenants` - Tenants (écoles)
- `users` - Utilisateurs
- `countries` - Pays
- `academic_years` - Années scolaires
- `school_levels` - Niveaux scolaires
- `students` - Élèves
- `classes` - Classes
- `teachers` - Enseignants
- Et toutes les autres tables du schéma...

**Compter les tables**:
```sql
-- Dans pgAdmin Query Tool
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

---

### ✅ Étape 2 : Vérifier les Index et Relations

**Dans pgAdmin**:

1. **Vérifier les Index**:
   - `academia_hub` → `Schemas` → `public` → `Tables` → `tenants` → `Indexes`
   - Vérifiez que les index sont créés (tenantId, academicYearId, etc.)

2. **Vérifier les Foreign Keys**:
   - `academia_hub` → `Schemas` → `public` → `Tables` → `students` → `Foreign Keys`
   - Vérifiez que les relations FK sont présentes

**Avec SQL**:
```sql
-- Compter les index
SELECT COUNT(*) FROM pg_indexes 
WHERE schemaname = 'public';

-- Compter les foreign keys
SELECT COUNT(*) FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_schema = 'public';
```

---

### ✅ Étape 3 : Tester Prisma Client

**Créer un script de test** (`test-prisma.ts`):

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    // Test 1: Connexion
    await prisma.$connect();
    console.log('✅ Connexion Prisma réussie');

    // Test 2: Compter les tables
    const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    console.log(`✅ Nombre de tables: ${result[0].count}`);

    // Test 3: Vérifier que la table Tenant existe
    const tenantCount = await prisma.tenant.count();
    console.log(`✅ Table Tenant accessible (${tenantCount} enregistrements)`);

    console.log('\n✅ Tous les tests Prisma ont réussi!');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
```

**Exécuter**:
```bash
cd apps/api-server
ts-node test-prisma.ts
```

---

### ✅ Étape 4 : Créer des Données de Test (Optionnel)

**Créer un script seed** (`prisma/seed.ts`):

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Créer un pays
  const country = await prisma.country.upsert({
    where: { code: 'BJ' },
    update: {},
    create: {
      code: 'BJ',
      name: 'Bénin',
      code3: 'BEN',
      numericCode: '204',
      currencyCode: 'XOF',
      currencySymbol: 'CFA',
      phonePrefix: '+229',
      flagEmoji: '🇧🇯',
      isDefault: true,
      isActive: true,
    },
  });

  console.log('✅ Pays créé:', country.name);

  // 2. Créer un tenant (école)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'École Test Academia Hub',
      slug: 'ecole-test',
      subdomain: 'ecole-test',
      countryId: country.id,
      type: 'SCHOOL',
      subscriptionStatus: 'TRIAL',
      status: 'active',
      subscriptionPlan: 'free',
    },
  });

  console.log('✅ Tenant créé:', tenant.name);

  // 3. Créer un utilisateur admin
  const user = await prisma.user.create({
    data: {
      email: 'admin@ecole-test.com',
      firstName: 'Admin',
      lastName: 'Test',
      role: 'DIRECTOR',
      tenantId: tenant.id,
      status: 'active',
    },
  });

  console.log('✅ Utilisateur créé:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Configurer le seed dans `package.json`**:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Exécuter le seed**:
```bash
npx prisma db seed
```

---

### ✅ Étape 5 : Configurer RLS (Row Level Security)

**Fichiers SQL disponibles**:
- `apps/api-server/prisma/migrations/rls-policies.sql`
- `apps/api-server/migrations/005_supabase_rls_complete.sql`

**Appliquer RLS** (si nécessaire):
```bash
# Dans pgAdmin Query Tool, exécutez le fichier SQL
# Ou via psql :
psql -U postgres -d academia_hub -f prisma/migrations/rls-policies.sql
```

**Note**: RLS est surtout utile pour Supabase. Pour PostgreSQL local, vous pouvez l'appliquer si vous voulez tester la sécurité multi-tenant.

---

### ✅ Étape 6 : Préparer le Basculement vers Supabase

**Quand vous serez prêt à basculer**:

1. **Résoudre le problème IPv4/IPv6**:
   - Activer l'add-on IPv4 dans Supabase, OU
   - Configurer IPv6 sur votre réseau

2. **Exporter les données locales** (si vous avez des données importantes):
   ```bash
   pg_dump -U postgres -d academia_hub -F c -f academia_hub_backup.dump
   ```

3. **Mettre à jour `.env`**:
   ```bash
   # Remplacez par les credentials Supabase
   DATABASE_URL=postgresql://postgres:PASSWORD@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:PASSWORD@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
   ```

4. **Appliquer les migrations sur Supabase**:
   ```bash
   # Vérifier l'état
   npx prisma migrate status

   # Appliquer toutes les migrations
   npx prisma migrate deploy
   ```

5. **Importer les données** (si nécessaire):
   ```bash
   pg_restore -U postgres -d academia_hub -f academia_hub_backup.dump
   ```

---

### ✅ Étape 7 : Tests et Validation

**Tests de validation**:

1. **Tester les requêtes Prisma**:
   ```typescript
   // Test simple
   const tenants = await prisma.tenant.findMany();
   console.log('Tenants:', tenants);
   ```

2. **Vérifier les relations**:
   ```typescript
   // Test de relation
   const tenantWithCountry = await prisma.tenant.findFirst({
    include: { country: true }
   });
   console.log('Tenant avec pays:', tenantWithCountry);
   ```

3. **Tester les contraintes**:
   - Essayer de créer un tenant avec un `countryId` invalide → doit échouer
   - Essayer de créer un student sans `tenantId` → doit échouer (si required)

---

## 📊 Statistiques Attendues

Après la migration complète, vous devriez avoir :

- **~100+ tables** (selon le schéma Prisma complet)
- **Tous les index** créés (tenantId, academicYearId, composites, etc.)
- **Toutes les relations FK** en place
- **Migration tracker** (`_prisma_migrations` table)

---

## 🎯 Résumé des Actions Recommandées

1. ✅ **Vérifier dans pgAdmin** : Toutes les tables sont créées
2. ✅ **Tester Prisma Client** : Requêtes basiques fonctionnent
3. ✅ **Créer des données de test** (optionnel) : Seed script
4. ✅ **Configurer RLS** (optionnel) : Pour tester la sécurité multi-tenant
5. ✅ **Préparer Supabase** : Résoudre IPv4/IPv6 quand prêt

---

## 🆘 En Cas de Problème

### Migration échoue
- Vérifiez les logs dans `prisma/migrations/migration.sql`
- Vérifiez que PostgreSQL est démarré
- Vérifiez les credentials dans `.env`

### Prisma Client ne génère pas
```bash
npx prisma generate
```

### Tables manquantes
```bash
npx prisma migrate deploy
```

---

**Migration initiale terminée avec succès** ✅  
**Base de données prête pour le développement** ✅
