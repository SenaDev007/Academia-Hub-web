# 🔍 Audit des Erreurs API - Academia Hub

**Date** : 2025-01-17  
**Statut** : PASS 1 - Identification des causes racines

---

## 📊 Résumé Exécutif

**Total d'erreurs identifiées** : 10+ (compilation TypeScript)  
**Catégories principales** : 4  
**Causes racines** : 5-6 patterns répétitifs

---

## 🎯 Catégorisation des Erreurs

### 1️⃣ Erreurs Prisma Client (3 erreurs)

#### ERREUR #1 : `tenantId: null` non autorisé
**Fichier** : `src/common/services/access-denied-log.service.ts:54`
```typescript
tenantId: null, // ❌ Type 'null' is not assignable to type 'never'
```
**Cause** : Le schéma Prisma exige `tenantId` obligatoire, mais le code tente de passer `null`
**Impact** : Impossible de logger les refus d'accès sans tenant

#### ERREUR #2 : Propriétés inexistantes dans Student (TypeORM legacy)
**Fichier** : `src/students/students.repository.ts:42,47,50`
```typescript
'fullName',  // ❌ Type '"fullName"' is not assignable to type 'keyof Student'
'status',    // ❌ Type '"status"' is not assignable to type 'keyof Student'
'academicYearId', // ❌ Type '"academicYearId"' is not assignable to type 'keyof Student'
```
**Cause** : Repository TypeORM utilise des propriétés qui n'existent pas dans le modèle Prisma
**Impact** : Requêtes TypeORM échouent

---

### 2️⃣ Erreurs TypeScript - Types (4 erreurs)

#### ERREUR #3 : Mauvais type de paramètre
**Fichier** : `src/modules/general/general.service.ts:76`
```typescript
const students = await this.studentsService.findAll(tenantId, level.id, academicYearId);
// ❌ Argument of type 'string' is not assignable to parameter of type 'PaginationDto'
```
**Cause** : Signature de méthode a changé, attend `PaginationDto` mais reçoit `string`
**Impact** : Appels de service incorrects

#### ERREUR #4 : Propriété inexistante sur PaginatedResponse
**Fichier** : `src/modules/general/general.service.ts:77`
```typescript
const count = students.length; // ❌ Property 'length' does not exist on type 'PaginatedResponse<Student>'
```
**Cause** : `findAll` retourne `PaginatedResponse` (objet avec `data` et `meta`), pas un array
**Impact** : Accès aux données incorrect

#### ERREUR #5 : Type Date vs string
**Fichier** : `src/modules/general/general.service.ts:138`
```typescript
startDate, // ❌ Argument of type 'Date' is not assignable to parameter of type 'string'
```
**Cause** : Incompatibilité de types entre Date et string
**Impact** : Appels de méthode incorrects

#### ERREUR #6 : Méthode reduce sur PaginatedResponse
**Fichier** : `src/modules/general/general.service.ts:141`
```typescript
const revenue = payments.reduce(...); // ❌ Property 'reduce' does not exist on type 'PaginatedResponse<Payment>'
```
**Cause** : `payments` est un `PaginatedResponse`, pas un array
**Impact** : Calculs incorrects

---

### 3️⃣ Erreurs Logiques API (3 erreurs)

#### ERREUR #7 : Duplication d'erreur #3
**Fichier** : `src/modules/general/general.service.ts:218`
```typescript
const students = await this.studentsService.findAll(tenantId, level.id, academicYearId);
// ❌ Même erreur que #3
```

#### ERREUR #8 : Duplication d'erreur #4
**Fichier** : `src/modules/general/general.service.ts:220`
```typescript
const studentCount = students.length; // ❌ Même erreur que #4
```

---

## 🔍 Patterns Identifiés

### Pattern 1 : `tenantId: null` dans les logs
**Fichiers affectés** :
- `access-denied-log.service.ts`
- `kpi-calculation.service.ts` (potentiel)
- `meeting-minutes-template.service.ts` (potentiel)

**Solution** : Récupérer `tenantId` depuis le contexte de requête

---

### Pattern 2 : Repository TypeORM vs Prisma
**Fichiers affectés** :
- `students.repository.ts` (utilise TypeORM avec modèle Prisma)

**Solution** : Migrer vers Prisma ou adapter les propriétés

---

### Pattern 3 : PaginatedResponse vs Array
**Fichiers affectés** :
- `general.service.ts` (plusieurs occurrences)

**Solution** : Accéder à `response.data` au lieu de `response` directement

---

### Pattern 4 : Signatures de méthodes obsolètes
**Fichiers affectés** :
- `general.service.ts` (appels à `findAll` avec mauvais paramètres)

**Solution** : Mettre à jour les signatures et appels

---

## 📋 Plan de Correction par Couches

### 🥇 PASS 2 - Socle API (Priorité 1)

1. **Fixer Prisma Client - tenantId obligatoire**
   - Créer helper `requireTenant()` depuis le contexte
   - Corriger `access-denied-log.service.ts`
   - Vérifier tous les `tenantId: null`

2. **Créer helpers de contexte**
   - `requireTenant(req)` : Récupère tenantId depuis requête
   - `requireAcademicYear(req)` : Récupère academicYearId
   - `requireSchoolLevel(req)` : Récupère schoolLevelId

3. **Mettre à jour types partagés**
   - Types pour PaginatedResponse
   - Types pour contexte de requête

---

### 🥈 PASS 3 - Services Métier (Priorité 2)

1. **Corriger general.service.ts**
   - Adapter appels `findAll` avec PaginationDto
   - Accéder à `response.data` au lieu de `response`
   - Corriger types Date vs string

2. **Migrer students.repository.ts**
   - Soit migrer vers Prisma complètement
   - Soit adapter les propriétés pour correspondre au schéma

---

### 🥉 PASS 4 - Nettoyage Final (Priorité 3)

1. Vérifier tous les imports
2. Mettre à jour les enums
3. Supprimer le code mort
4. Vérifier que l'API démarre sans erreurs

---

## 🎯 Fichiers à Corriger (Ordre de Priorité)

### Priorité HAUTE (Socle)
1. ✅ `src/common/services/access-denied-log.service.ts` - tenantId null
2. ✅ `src/common/context/request-context.service.ts` - Helpers de contexte
3. ✅ Types partagés pour PaginatedResponse

### Priorité MOYENNE (Services)
4. ✅ `src/modules/general/general.service.ts` - Types et PaginatedResponse
5. ✅ `src/students/students.repository.ts` - Propriétés TypeORM

### Priorité BASSE (Nettoyage)
6. ✅ Vérifier autres fichiers avec `tenantId: null`
7. ✅ Imports et types restants

---

## 📊 Métriques

- **Erreurs critiques** : 3 (tenantId null, types Prisma)
- **Erreurs de logique** : 4 (PaginatedResponse, signatures)
- **Erreurs TypeORM** : 3 (propriétés obsolètes)
- **Fichiers affectés** : ~5-6 fichiers principaux

---

**Prochaine étape** : PASS 2 - Correction du socle API
