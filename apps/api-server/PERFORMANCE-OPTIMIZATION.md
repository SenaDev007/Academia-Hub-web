# 🚀 GUIDE D'OPTIMISATION PERFORMANCE - Academia Hub

## ✅ Optimisations Implémentées

### 1. Backend - Middleware de Profiling
- **Fichier**: `src/common/interceptors/performance-logging.interceptor.ts`
- **Fonction**: Mesure automatiquement le temps de réponse de toutes les routes
- **Logging**: Routes > 500ms sont loggées en warning
- **Activation**: Déjà activé globalement dans `app.module.ts`

**Variables d'environnement:**
```env
LOG_PERFORMANCE=true      # Logger toutes les routes
LOG_ALL_ROUTES=true       # Logger même les routes rapides
LOG_SLOW_QUERIES=true     # Logger requêtes Prisma > 200ms
```

### 2. Cache Backend
- **Fichier**: `src/common/services/cache.service.ts`
- **Usage**: Cache en mémoire pour données stables (années, niveaux, paramètres)
- **TTL par défaut**: 5 minutes
- **TODO**: Migrer vers Redis en production si nécessaire

**Exemple d'utilisation:**
```typescript
// Dans un service
const cacheKey = `academic-years-${tenantId}`;
let years = this.cacheService.get<AcademicYear[]>(cacheKey);

if (!years) {
  years = await this.prisma.academicYear.findMany({...});
  this.cacheService.set(cacheKey, years, 10 * 60 * 1000); // 10 min
}
```

### 3. PrismaService Optimisé
- **Fichier**: `src/database/prisma.service.ts`
- **Optimisations**:
  - Connection pooling via `DATABASE_URL` (ajouter `?pgbouncer=true` si disponible)
  - Middleware pour logger requêtes lentes
  - Logging configurable

**Configuration DATABASE_URL:**
```env
# Avec pooling (Supabase/Heroku)
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=20"

# Standard
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20"
```

### 4. Index PostgreSQL Critiques
- **Fichier**: `prisma/migrations/001_performance_indexes.sql`
- **À exécuter**: Dans pgAdmin ou via migration Prisma
- **Index créés**:
  - `idx_students_tenant_year` - Élèves par tenant/année
  - `idx_classes_tenant_year` - Classes par tenant/année
  - `idx_grades_student_exam` - Notes par élève/examen
  - `idx_payments_tenant_year` - Paiements par tenant/année
  - Et 15+ autres index critiques

**Exécution:**
```bash
# Via pgAdmin
psql -U postgres -d academia_hub -f prisma/migrations/001_performance_indexes.sql

# Ou copier-coller dans Query Tool
```

### 5. DTO de Pagination
- **Fichier**: `src/common/dto/pagination.dto.ts`
- **Usage**: Standardiser pagination sur toutes les routes list

**Exemple dans un controller:**
```typescript
@Get()
async findAll(
  @TenantId() tenantId: string,
  @Query() pagination: PaginationDto,
) {
  return this.service.findAll(tenantId, pagination);
}
```

**Exemple dans un service:**
```typescript
async findAll(tenantId: string, pagination: PaginationDto) {
  const [data, total] = await Promise.all([
    this.prisma.student.findMany({
      where: { tenantId },
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        fullName: true,
        // Seulement les champs nécessaires
      },
    }),
    this.prisma.student.count({ where: { tenantId } }),
  ]);

  return createPaginatedResponse(data, total, pagination);
}
```

### 6. ✅ Pagination Appliquée sur Routes Critiques

#### Students (`/api/students`)
- ✅ Controller accepte `PaginationDto`
- ✅ Service retourne `PaginatedResponse<Student>`
- ✅ Repository optimisé avec `select` ciblé
- ✅ Méthode `count()` ajoutée

**Usage:**
```bash
GET /api/students?page=1&limit=20&academicYearId=xxx
```

#### Payments (`/api/payments`)
- ✅ Controller accepte `PaginationDto`
- ✅ Service retourne `PaginatedResponse<Payment>`
- ✅ Repository optimisé avec QueryBuilder
- ✅ Méthode `count()` avec filtres

**Usage:**
```bash
GET /api/payments?page=1&limit=20&studentId=xxx&status=completed
```

#### Classes (`/api/classes`)
- ✅ Controller accepte `PaginationDto`
- ✅ Service retourne `PaginatedResponse<Class>`
- ✅ Repository optimisé avec QueryBuilder
- ✅ Méthode `count()` ajoutée

**Usage:**
```bash
GET /api/classes?page=1&limit=20&academicYearId=xxx
```

## 🔴 Optimisations À Faire (Priorité Haute)

### 1. Normaliser Requêtes Prisma (En cours)
**❌ À éviter:**
```typescript
prisma.student.findMany({
  include: {
    class: true,
    payments: true,
    notes: true,
    guardians: true,
  }
});
```

**✅ À faire:**
```typescript
prisma.student.findMany({
  select: {
    id: true,
    fullName: true,
    class: { select: { name: true }},
    // Seulement ce qui est nécessaire
  },
  where: { tenantId },
  take: 20,
  skip: page * 20
});
```

### 2. Pagination Obligatoire (En cours - 3/109 routes faites)
Toutes les routes `findAll` doivent accepter `PaginationDto`:
- ✅ `GET /api/students?page=1&limit=20`
- ✅ `GET /api/payments?page=1&limit=20`
- ✅ `GET /api/classes?page=1&limit=20`
- 🔴 `GET /api/teachers?page=1&limit=20` (À faire)
- 🔴 `GET /api/grades?page=1&limit=20` (À faire)
- 🔴 Et 100+ autres routes...

### 3. Cache Données Stables
Mettre en cache:
- Années scolaires (TTL: 1h)
- Niveaux scolaires (TTL: 1h)
- Paramètres école (TTL: 30min)
- Feature flags (TTL: 5min)

### 4. Frontend - React Query
```bash
cd apps/web-app
npm install @tanstack/react-query
```

**Configuration:**
```typescript
// app/providers.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

**Usage:**
```typescript
const { data, isLoading } = useQuery(
  ['students', tenantId],
  () => fetchStudents(tenantId),
  { staleTime: 5 * 60 * 1000 }
);
```

### 5. Dynamic Imports Frontend
```typescript
// Composants lourds
const Chart = dynamic(() => import('./Chart'), {
  ssr: false,
  loading: () => <SkeletonChart />
});

const OrionDashboard = dynamic(() => import('./OrionDashboard'), {
  ssr: false,
  loading: () => <SkeletonDashboard />
});
```

### 6. Skeleton Loaders
Ajouter des skeletons sur:
- Tables de données
- Dashboard
- Graphiques
- Cartes statistiques

## 📊 Monitoring

### Vérifier Performance Backend
```bash
# Activer logs
export LOG_PERFORMANCE=true
export LOG_SLOW_QUERIES=true

# Démarrer serveur
npm run start:dev

# Observer les warnings dans les logs
```

### Vérifier Requêtes PostgreSQL Lentes
```sql
-- Dans pgAdmin
EXPLAIN ANALYZE SELECT * FROM students WHERE tenant_id = 'xxx';

-- Vérifier index utilisés
SELECT * FROM pg_stat_user_indexes WHERE schemaname = 'public';
```

### Vérifier Cache
```typescript
// Dans un service
console.log('Cache size:', this.cacheService.size());
this.cacheService.cleanup();
```

## 🎯 Objectifs de Performance

| Métrique | Avant | Cible | Statut |
|----------|-------|-------|--------|
| Navigation | 5-50s | < 1s | 🟡 En cours (pagination appliquée) |
| Pages lourdes | 10-30s | < 2s | 🟡 En cours |
| Requêtes API | 1-5s | < 500ms | 🟡 En cours (profiling activé) |
| Requêtes DB | 500ms-2s | < 100ms | 🟡 En cours (index créés) |
| Cache hit rate | 0% | > 70% | 🔴 À implémenter |

## 🚀 Prochaines Étapes

1. ✅ Middleware profiling (FAIT)
2. ✅ Cache service (FAIT)
3. ✅ Index SQL (FAIT)
4. ✅ DTO pagination (FAIT)
5. ✅ Pagination sur 3 routes critiques (FAIT: students, payments, classes)
6. 🔴 Appliquer pagination sur routes restantes (106 routes)
7. 🔴 Normaliser requêtes Prisma (select au lieu de include)
8. 🔴 Implémenter cache sur données stables
9. 🔴 React Query frontend
10. 🔴 Dynamic imports frontend
11. 🔴 Skeleton loaders

## 📝 Notes

- Les index PostgreSQL doivent être créés **immédiatement** pour voir des gains significatifs
- Le cache backend est simple (mémoire) - migrer vers Redis si > 1000 utilisateurs
- Le profiling est activé par défaut - désactiver en production si nécessaire
- La pagination est **obligatoire** sur toutes les routes list - 3 routes critiques sont faites, 106 restent

## 📈 Résultats Attendus

Après application complète:
- **Réduction 90%** du temps de chargement des listes
- **Réduction 80%** de la charge base de données
- **Amélioration 95%** de l'expérience utilisateur
