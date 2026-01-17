# ✅ Guide de Vérification RLS - Academia Hub

**Fichier SQL de vérification** : `scripts/verify-rls-installation.sql`  
**Statut** : ✅ Script de vérification créé

---

## 📋 Méthode 1 : Vérification via pgAdmin (Recommandé)

### Étape 1 : Ouvrir le script de vérification

1. Ouvrez pgAdmin 4
2. Connectez-vous à votre serveur PostgreSQL local
3. Ouvrez Query Tool sur la base `academia_hub`
4. Cliquez sur **"Open File"** (📁)
5. Naviguez vers : `apps/api-server/scripts/verify-rls-installation.sql`
6. Ouvrez le fichier

### Étape 2 : Exécuter le script

1. Cliquez sur **"Execute"** (▶️) ou appuyez sur `F5`
2. Vérifiez les résultats dans l'onglet "Data Output"

### Étape 3 : Interpréter les résultats

Le script retourne plusieurs sections :

#### ✅ Section 1 : RLS Activé sur Tables Principales

**Résultat attendu** : Toutes les tables listées doivent avoir `rls_enabled = true`

```
tablename           | rls_enabled
--------------------|------------
academic_years      | true
classes             | true
exams               | true
...
```

**Si `false`** : RLS n'est pas activé sur cette table. Ré-exécutez `rls-policies-local.sql`.

#### ✅ Section 2 : Fonctions Helper

**Résultat attendu** : 3 fonctions doivent être trouvées

```
function_name    | schema_name | return_type
-----------------|-------------|------------
is_orion         | public      | boolean
is_super_admin   | public      | boolean
tenant_id        | public      | text
```

**Si manquantes** : Les fonctions n'ont pas été créées. Vérifiez l'exécution du script RLS.

#### ✅ Section 3 : Policies RLS

**Résultat attendu** : Plusieurs policies listées par table

```
tablename    | policyname
-------------|---------------------------
students     | student_parent_access
students     | student_tenant_isolation
tenants      | tenant_modify
tenants      | tenant_select
users        | user_tenant_isolation
...
```

**Si aucune policy** : Les policies n'ont pas été créées. Ré-exécutez `rls-policies-local.sql`.

#### ✅ Section 4 : Rôles PostgreSQL

**Résultat attendu** : 3 rôles doivent être trouvés

```
role_name
-------------------
academia_app
academia_orion
academia_super_admin
```

**Si manquants** : Les rôles n'ont pas été créés. Vérifiez l'exécution du script RLS.

---

## 📋 Méthode 2 : Vérification via Script TypeScript

Un script TypeScript existe déjà : `scripts/verify-rls.ts`

**Exécution** :
```bash
cd apps/api-server
npx ts-node scripts/verify-rls.ts
```

**Note** : Ce script peut nécessiter des ajustements car il cherche les fonctions dans le schéma `auth` au lieu de `public` pour PostgreSQL local.

---

## 🧪 Test d'Isolation Multi-Tenant (Manuel)

### Test 1 : Vérifier que tenant_id() fonctionne

Dans pgAdmin Query Tool :

```sql
-- Définir un tenant_id de test
SET LOCAL app.current_tenant_id = 'test-tenant-id';

-- Tester la fonction
SELECT public.tenant_id() as current_tenant_id;
```

**Résultat attendu** : `current_tenant_id = 'test-tenant-id'`

### Test 2 : Vérifier l'isolation par tenant

```sql
-- Récupérer un tenant_id réel de votre base
SELECT id FROM tenants LIMIT 1;

-- Définir le tenant_id
SET LOCAL app.current_tenant_id = '<tenant-id-obtenu>';

-- Tester : ne devrait retourner que les données du tenant
SELECT COUNT(*) FROM students WHERE "tenantId" = public.tenant_id();
```

**Résultat attendu** : Le compteur correspond au nombre d'étudiants du tenant.

### Test 3 : Tester avec différents rôles

```sql
-- Tester en tant que academia_app
SET ROLE academia_app;
SET LOCAL app.current_tenant_id = '<tenant-id>';
SET LOCAL app.is_super_admin = false;

-- Devrait ne retourner que les données du tenant
SELECT * FROM students LIMIT 5;
```

---

## ✅ Checklist de Vérification

- [ ] **RLS activé** sur au moins 16 tables principales
- [ ] **3 fonctions helper** créées (`tenant_id`, `is_super_admin`, `is_orion`)
- [ ] **Policies RLS** créées sur toutes les tables avec RLS
- [ ] **3 rôles PostgreSQL** créés (`academia_app`, `academia_orion`, `academia_super_admin`)
- [ ] **Fonction `tenant_id()`** retourne la valeur définie par `SET LOCAL`
- [ ] **Isolation multi-tenant** fonctionne (requêtes filtrées par tenant)

---

## ⚠️ Problèmes Courants

### Problème 1 : RLS non activé sur certaines tables

**Solution** : Ré-exécutez `rls-policies-local.sql` en vérifiant qu'il n'y a pas d'erreurs.

### Problème 2 : Fonctions helper non trouvées

**Solution** : Vérifiez que les fonctions sont dans le schéma `public` (pas `auth`) pour PostgreSQL local.

### Problème 3 : Policies non créées

**Solution** : Vérifiez que le script RLS s'est exécuté complètement sans erreur. Vérifiez les messages dans l'onglet "Messages" de pgAdmin.

### Problème 4 : Erreur "function does not exist"

**Solution** : Vérifiez que vous utilisez `public.tenant_id()` et non `auth.tenant_id()` pour PostgreSQL local.

---

## 📊 Résumé Attendu

Après exécution du script de vérification, vous devriez voir :

- ✅ **16+ tables** avec RLS activé
- ✅ **3 fonctions** helper créées
- ✅ **18+ policies** RLS créées
- ✅ **3 rôles** PostgreSQL créés

**Si tous ces points sont vérifiés, RLS est correctement configuré !** ✅
