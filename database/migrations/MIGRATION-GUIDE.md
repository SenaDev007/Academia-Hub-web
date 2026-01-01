# 📚 GUIDE DE MIGRATION SQLITE → POSTGRESQL

## 🎯 Objectif

Migrer les données de l'application Desktop (SQLite) vers la plateforme SaaS (PostgreSQL) de manière sécurisée, sans perte de données, et avec isolation par tenant.

---

## 📋 Prérequis

### 1. Environnement

- Node.js 18+ installé
- PostgreSQL 14+ installé et configuré
- Accès au fichier SQLite `academia-hub.db`
- Schéma PostgreSQL créé (voir `database/schemas/postgresql-complete-multi-tenant.sql`)

### 2. Dépendances

```bash
npm install better-sqlite3 pg @types/node @types/pg
```

### 3. Configuration

Créer un fichier `.env` à la racine du projet :

```env
# SQLite
SQLITE_PATH=C:/Users/Username/AppData/Roaming/academia-hub/academia-hub.db

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=academia_hub
PG_USER=postgres
PG_PASSWORD=your_password

# Options de migration
BACKUP=true          # Créer un backup avant migration
DRY_RUN=false        # Mode test (ne modifie pas la base)
```

---

## 🚀 Exécution

### 1. Préparation

```bash
# 1. Vérifier que le schéma PostgreSQL est créé
psql -U postgres -d academia_hub -f database/schemas/postgresql-complete-multi-tenant.sql

# 2. Vérifier que les pays sont créés (BJ par défaut)
psql -U postgres -d academia_hub -f database/seeders/seed-countries-and-policies.ts

# 3. Vérifier le fichier SQLite
ls -la "C:/Users/Username/AppData/Roaming/academia-hub/academia-hub.db"
```

### 2. Mode Test (Dry Run)

```bash
# Tester la migration sans modifier la base
DRY_RUN=true npm run migrate:sqlite-to-postgresql
```

### 3. Migration Réelle

```bash
# Exécuter la migration
npm run migrate:sqlite-to-postgresql
```

---

## 📊 Processus de Migration

### Étape 1 : Initialisation

1. ✅ Vérification du fichier SQLite
2. ✅ Connexion SQLite (readonly)
3. ✅ Connexion PostgreSQL
4. ✅ Vérification du schéma PostgreSQL

### Étape 2 : Backup (optionnel)

Si `BACKUP=true` :
- Création d'un backup PostgreSQL avec `pg_dump`
- Fichier sauvegardé dans `database/backups/`

### Étape 3 : Création des Tenants

Pour chaque école dans SQLite :
1. Création d'un tenant unique dans PostgreSQL
2. Association au pays par défaut (BJ)
3. Création de l'école liée au tenant
4. Mapping `school_id` → `tenant_id`

### Étape 4 : Migration des Tables

Pour chaque table métier :
1. Lecture des données SQLite
2. Transformation avec injection de `tenant_id`
3. Insertion dans PostgreSQL avec `ON CONFLICT DO NOTHING` (idempotent)
4. Logs détaillés de chaque opération

### Étape 5 : Vérification

1. Statistiques de migration
2. Logs d'erreurs éventuelles
3. Rapport final

---

## 🔍 Mapping des Tables

### Tables SaaS (créées automatiquement)

| SQLite | PostgreSQL | Notes |
|--------|------------|-------|
| - | `tenants` | Créé depuis `schools` |
| `users` | `users` | + `tenant_id` |
| - | `roles` | Rôles système par défaut |
| - | `permissions` | Permissions par défaut |

### Tables Métier

| SQLite | PostgreSQL | Transformation |
|--------|------------|----------------|
| `schools` | `schools` | + `tenant_id`, création tenant |
| `academic_years` | `academic_years` | + `tenant_id`, `created_by` |
| `quarters` | `quarters` | + `tenant_id`, `created_by` |
| `classes` | `classes` | + `tenant_id`, `created_by` |
| `subjects` | `subjects` | + `tenant_id`, `created_by` |
| `students` | `students` | + `tenant_id`, `educmaster_number` |
| `teachers` | `teachers` | + `tenant_id`, `created_by` |
| `departments` | `departments` | + `tenant_id`, `created_by` |
| `rooms` | `rooms` | + `tenant_id`, `equipment` (JSONB) |
| `absences` | `absences` | + `tenant_id`, `created_by` |
| `discipline` | `discipline` | + `tenant_id`, `created_by` |
| `exams` | `exams` | + `tenant_id`, `created_by` |
| `grades` | `grades` | + `tenant_id`, `created_by` |
| `fee_configurations` | `fee_configurations` | + `tenant_id`, `created_by` |
| `payments` | `payments` | + `tenant_id`, `created_by` |
| `expenses` | `expenses` | + `tenant_id`, `created_by` |

---

## 🔄 Réexécution (Idempotence)

Le script est **idempotent** : il peut être exécuté plusieurs fois sans problème.

### Mécanismes de protection

1. **Tenants** : `ON CONFLICT (slug) DO NOTHING`
2. **Tables métier** : `ON CONFLICT (id) DO NOTHING`
3. **Vérifications** : Vérifie l'existence avant création

### Cas d'usage

- ✅ Migration interrompue → Réexécuter
- ✅ Migration partielle → Compléter
- ✅ Test de migration → Mode dry-run

---

## 🔙 Rollback

### Option 1 : Restauration depuis Backup

```bash
# Restaurer le backup PostgreSQL
pg_restore -h localhost -U postgres -d academia_hub database/backups/postgresql-backup-YYYY-MM-DD.sql
```

### Option 2 : Suppression Manuelle

```sql
-- ATTENTION : Supprime toutes les données migrées
-- À utiliser uniquement en cas d'urgence

-- Supprimer les tenants créés
DELETE FROM tenants WHERE created_at > '2024-01-01';

-- Les autres tables seront supprimées en cascade
```

---

## 📝 Logs

### Emplacement

Les logs sont sauvegardés dans :
```
database/migrations/logs/migration-YYYY-MM-DDTHH-MM-SS.log
```

### Format

```
[2024-01-15T10:30:00.000Z] [INFO] 🚀 Démarrage de la migration SQLite → PostgreSQL
[2024-01-15T10:30:01.000Z] [SUCCESS] ✅ Fichier SQLite trouvé: C:/Users/...
[2024-01-15T10:30:02.000Z] [SUCCESS] ✅ Connexion SQLite établie
[2024-01-15T10:30:03.000Z] [SUCCESS] ✅ Connexion PostgreSQL établie
[2024-01-15T10:30:04.000Z] [INFO] 🏫 Création des tenants depuis les écoles SQLite...
[2024-01-15T10:30:05.000Z] [SUCCESS] ✅ Tenant créé: École Primaire (uuid-123)
...
```

### Niveaux de log

- **INFO** : Informations générales
- **SUCCESS** : Opération réussie
- **WARN** : Avertissement (non bloquant)
- **ERROR** : Erreur (peut être récupérée)

---

## ⚠️ Problèmes Courants

### 1. Fichier SQLite introuvable

**Erreur** : `Fichier SQLite introuvable: ...`

**Solution** :
- Vérifier le chemin dans `.env`
- Vérifier les permissions d'accès
- Utiliser le chemin absolu

### 2. Connexion PostgreSQL échouée

**Erreur** : `Erreur de connexion PostgreSQL: ...`

**Solution** :
- Vérifier que PostgreSQL est démarré
- Vérifier les credentials dans `.env`
- Vérifier que la base existe : `CREATE DATABASE academia_hub;`

### 3. Schéma PostgreSQL manquant

**Erreur** : `relation "tenants" does not exist`

**Solution** :
```bash
psql -U postgres -d academia_hub -f database/schemas/postgresql-complete-multi-tenant.sql
```

### 4. Pays par défaut manquant

**Erreur** : `Aucun pays par défaut trouvé`

**Solution** :
```bash
# Exécuter le seeder des pays
psql -U postgres -d academia_hub -f database/seeders/seed-countries-and-policies.ts
```

### 5. Conflits de données

**Erreur** : `duplicate key value violates unique constraint`

**Solution** :
- Le script utilise `ON CONFLICT DO NOTHING` (idempotent)
- Vérifier les logs pour les enregistrements ignorés
- Si nécessaire, nettoyer les doublons manuellement

---

## ✅ Vérification Post-Migration

### 1. Vérifier les Tenants

```sql
SELECT id, name, slug, country_id, status, created_at
FROM tenants
ORDER BY created_at;
```

### 2. Vérifier les Données Migrées

```sql
-- Compter les étudiants par tenant
SELECT 
    t.name AS tenant_name,
    COUNT(s.id) AS student_count
FROM tenants t
LEFT JOIN students s ON s.tenant_id = t.id
GROUP BY t.id, t.name
ORDER BY student_count DESC;
```

### 3. Vérifier l'Isolation

```sql
-- Vérifier qu'aucun enregistrement n'a tenant_id NULL
SELECT 
    'students' AS table_name,
    COUNT(*) AS null_tenant_count
FROM students
WHERE tenant_id IS NULL
UNION ALL
SELECT 'teachers', COUNT(*) FROM teachers WHERE tenant_id IS NULL
UNION ALL
SELECT 'classes', COUNT(*) FROM classes WHERE tenant_id IS NULL;
-- Doit retourner 0 pour toutes les tables
```

### 4. Vérifier les Relations

```sql
-- Vérifier que les étudiants sont bien liés aux classes du même tenant
SELECT 
    s.id AS student_id,
    s.tenant_id AS student_tenant,
    c.id AS class_id,
    c.tenant_id AS class_tenant
FROM students s
INNER JOIN classes c ON c.id = s.class_id
WHERE s.tenant_id != c.tenant_id;
-- Doit retourner 0 lignes
```

---

## 📊 Statistiques Attendues

Après une migration réussie, vous devriez voir :

```
📊 Statistiques de migration:
  - Tenants créés: X
  - Tables migrées: 17
  - Enregistrements migrés: Y
  - Erreurs: 0
```

---

## 🔐 Sécurité

### Bonnes Pratiques

1. ✅ **Toujours faire un backup** avant migration
2. ✅ **Tester en mode dry-run** d'abord
3. ✅ **Vérifier les logs** après migration
4. ✅ **Valider les données** post-migration
5. ✅ **Conserver le fichier SQLite** original

### Données Sensibles

- Les mots de passe des utilisateurs sont migrés tels quels
- Vérifier la conformité RGPD après migration
- Les données sont isolées par tenant (sécurité multi-tenant)

---

## 📞 Support

En cas de problème :

1. Consulter les logs dans `database/migrations/logs/`
2. Vérifier la documentation PostgreSQL
3. Vérifier les contraintes d'intégrité
4. Contacter l'équipe technique

---

**Date** : 2024  
**Version** : 1.0.0  
**Status** : ✅ **Script de migration prêt**

