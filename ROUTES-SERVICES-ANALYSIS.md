# 📡 Analyse des Routes & Services - Academia Hub

**Date d'analyse** : 2025-01-17  
**Complément de** : `ARCHITECTURE-ANALYSIS.md`

---

## 📋 Table des Matières

1. [Vue d'Ensemble des Routes](#vue-densemble-des-routes)
2. [Structure des Controllers](#structure-des-controllers)
3. [Structure des Services](#structure-des-services)
4. [Modules Détaillés](#modules-détaillés)
5. [Patterns de Routage](#patterns-de-routage)

---

## 🎯 Vue d'Ensemble des Routes

### Préfixe Global

Toutes les routes sont préfixées par `/api` (configuré dans `main.ts`).

### Nombre de Controllers

Le projet contient **109 controllers** répartis sur tous les modules fonctionnels.

---

## 🏗️ Structure des Controllers

### Pattern de Nommage

Les controllers suivent deux patterns principaux :

1. **Controllers Prisma** : `*-prisma.controller.ts`
   - Utilisent Prisma directement
   - Pattern moderne et recommandé

2. **Controllers Legacy** : `*.controller.ts`
   - Utilisent TypeORM (legacy)
   - En cours de migration

### Structure Standard d'un Controller

```typescript
@Controller('module-name')
export class ModuleController {
  constructor(
    private readonly moduleService: ModuleService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    // Logique
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Logique
  }

  @Post()
  async create(@Body() createDto: CreateDto) {
    // Logique
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
    // Logique
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // Logique
  }
}
```

---

## 🔧 Structure des Services

### Pattern de Nommage

1. **Services Prisma** : `*-prisma.service.ts`
   - Accès direct à Prisma
   - Logique métier

2. **Services Spécialisés** : `*-service.ts`
   - Services métier spécifiques
   - Logique complexe

### Structure Standard d'un Service

```typescript
@Injectable()
export class ModuleService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(tenantId: string, filters: any) {
    return this.prisma.model.findMany({
      where: {
        tenantId,
        ...filters,
      },
    });
  }

  async findOne(id: string, tenantId: string) {
    return this.prisma.model.findUnique({
      where: {
        id,
        tenantId,
      },
    });
  }

  async create(data: CreateDto, tenantId: string) {
    return this.prisma.model.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async update(id: string, data: UpdateDto, tenantId: string) {
    return this.prisma.model.update({
      where: {
        id,
        tenantId,
      },
      data,
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.model.delete({
      where: {
        id,
        tenantId,
      },
    });
  }
}
```

---

## 📦 Modules Détaillés

### Module 1 : Scolarité (Students)

**Module** : `StudentsModule`  
**Fichier** : `apps/api-server/src/students/students.module.ts`

#### Controllers

1. **StudentsPrismaController**
   - Route : `/api/students`
   - CRUD complet des étudiants

2. **GuardiansPrismaController**
   - Route : `/api/students/guardians`
   - Gestion des tuteurs

3. **AttendancePrismaController**
   - Route : `/api/students/attendance`
   - Gestion de la présence

4. **DisciplinePrismaController**
   - Route : `/api/students/discipline`
   - Gestion de la discipline

5. **DocumentsPrismaController**
   - Route : `/api/students/documents`
   - Gestion des documents

6. **TransfersPrismaController**
   - Route : `/api/students/transfers`
   - Gestion des transferts

7. **StudentIdentifierController**
   - Route : `/api/students/identifiers`
   - Gestion des identifiants uniques

8. **StudentIdCardController**
   - Route : `/api/students/id-cards`
   - Gestion des cartes scolaires

9. **PublicVerificationController**
   - Route : `/api/public/verify`
   - Vérification publique (sans auth)

10. **StudentDossierController**
    - Route : `/api/students/dossiers`
    - Dossiers académiques complets

#### Services

- `StudentsPrismaService`
- `GuardiansPrismaService`
- `AttendancePrismaService`
- `DisciplinePrismaService`
- `DocumentsPrismaService`
- `TransfersPrismaService`
- `StudentIdentifierService`
- `StudentIdCardService`
- `PublicVerificationService`
- `StudentDossierService`
- `StudentsOrionService`

---

### Module 2 : Pédagogie

**Module** : `PedagogyModule`  
**Fichier** : `apps/api-server/src/pedagogy/pedagogy.module.ts`

#### Controllers

1. **TeachersPrismaController**
   - Route : `/api/pedagogy/teachers`
   - Gestion des enseignants

2. **SubjectsPrismaController**
   - Route : `/api/pedagogy/subjects`
   - Gestion des matières

3. **TimetablesPrismaController**
   - Route : `/api/pedagogy/timetables`
   - Gestion des emplois du temps

4. **LessonPlansPrismaController**
   - Route : `/api/pedagogy/lesson-plans`
   - Gestion des plans de cours

5. **DailyLogsPrismaController**
   - Route : `/api/pedagogy/daily-logs`
   - Gestion des journaux quotidiens

6. **ClassDiariesPrismaController**
   - Route : `/api/pedagogy/class-diaries`
   - Gestion des journaux de classe

7. **RoomsPrismaController**
   - Route : `/api/pedagogy/rooms`
   - Gestion des salles

8. **PedagogyPrismaController**
   - Route : `/api/pedagogy`
   - Endpoints généraux

9. **PedagogicalDirectorController**
   - Route : `/api/pedagogy/director`
   - Fonctionnalités directeur pédagogique

10. **PedagogicalTeacherController**
    - Route : `/api/pedagogy/teacher`
    - Fonctionnalités enseignant

11. **PedagogyOrionController**
    - Route : `/api/pedagogy/orion`
    - Analytics pédagogiques

---

### Module 3 : Examens & Notes

**Module** : `ExamsGradesModule`  
**Fichier** : `apps/api-server/src/exams-grades/exams-grades.module.ts`

#### Controllers

1. **ExamsPrismaController**
   - Route : `/api/exams`
   - Gestion des examens

2. **ExamScoresPrismaController**
   - Route : `/api/exams/scores`
   - Gestion des scores

3. **ReportCardsPrismaController**
   - Route : `/api/exams/report-cards`
   - Gestion des bulletins

4. **HonorRollsPrismaController**
   - Route : `/api/exams/honor-rolls`
   - Gestion des tableaux d'honneur

5. **CouncilDecisionsPrismaController**
   - Route : `/api/exams/council-decisions`
   - Gestion des décisions de conseil

---

### Module 4 : Finance

**Module** : `FinanceModule`  
**Fichier** : `apps/api-server/src/finance/finance.module.ts`

#### Controllers

1. **FeesPrismaController**
   - Route : `/api/finance/fees`
   - Gestion des frais

2. **PaymentsPrismaController**
   - Route : `/api/finance/payments`
   - Gestion des paiements

3. **PaymentsEnhancedController**
   - Route : `/api/finance/payments-enhanced`
   - Paiements avancés

4. **PaymentAllocationController**
   - Route : `/api/finance/payment-allocation`
   - Allocation des paiements

5. **FeeInstallmentController**
   - Route : `/api/finance/fee-installments`
   - Échéanciers de frais

6. **ExpensesPrismaController**
   - Route : `/api/finance/expenses`
   - Gestion des dépenses

7. **TreasuryPrismaController**
   - Route : `/api/finance/treasury`
   - Gestion de la trésorerie

8. **CollectionPrismaController**
   - Route : `/api/finance/collection`
   - Gestion du recouvrement

9. **CollectionCaseController**
   - Route : `/api/finance/collection-cases`
   - Cas de recouvrement

10. **ReceiptGenerationController**
    - Route : `/api/finance/receipts/generate`
    - Génération de reçus

11. **ReceiptNotificationController**
    - Route : `/api/finance/receipts/notify`
    - Notifications de reçus

12. **PublicReceiptController**
    - Route : `/api/public/receipts`
    - Reçus publics (sans auth)

13. **FeeRegimeController**
    - Route : `/api/finance/fee-regimes`
    - Régimes tarifaires

14. **StudentFeeProfileController**
    - Route : `/api/finance/student-fee-profiles`
    - Profils tarifaires étudiants

15. **StudentArrearController**
    - Route : `/api/finance/student-arrears`
    - Arriérés étudiants

16. **FinanceOrionController**
    - Route : `/api/finance/orion`
    - Analytics financiers

#### Services

- `FeesPrismaService`
- `PaymentsPrismaService`
- `PaymentsPrismaEnhancedService`
- `PaymentAllocationService`
- `FeeInstallmentService`
- `ExpensesPrismaService`
- `TreasuryPrismaService`
- `CollectionPrismaService`
- `CollectionCaseService`
- `ReceiptGenerationService`
- `ReceiptNotificationService`
- `FeeRegimeService`
- `StudentFeeProfileService`
- `StudentArrearService`
- `FinanceOrionService`

---

### Module 5 : RH & Paie

**Module** : `HRModule`  
**Fichier** : `apps/api-server/src/hr/hr.module.ts`

#### Controllers

1. **StaffPrismaController**
   - Route : `/api/hr/staff`
   - Gestion du personnel

2. **ContractsPrismaController**
   - Route : `/api/hr/contracts`
   - Gestion des contrats

3. **PayrollPrismaController**
   - Route : `/api/hr/payroll`
   - Gestion de la paie

4. **AttendancePrismaController**
   - Route : `/api/hr/attendance`
   - Présence du personnel

5. **EvaluationsPrismaController**
   - Route : `/api/hr/evaluations`
   - Évaluations du personnel

6. **CNSSPrismaController**
   - Route : `/api/hr/cnss`
   - Gestion CNSS

---

### Module 6 : Communication

**Module** : `CommunicationModule`  
**Fichier** : `apps/api-server/src/communication/communication.module.ts`

#### Controllers

1. **MessagesPrismaController**
   - Route : `/api/communication/messages`
   - Gestion des messages

2. **TemplatesPrismaController**
   - Route : `/api/communication/templates`
   - Gestion des modèles

3. **SchedulingPrismaController**
   - Route : `/api/communication/scheduling`
   - Messages programmés

4. **AutomationPrismaController**
   - Route : `/api/communication/automation`
   - Automatisation

5. **CommunicationPrismaController**
   - Route : `/api/communication`
   - Endpoints généraux

---

### Module 7 : Réunions

**Module** : `MeetingsModule`  
**Fichier** : `apps/api-server/src/meetings/meetings.module.ts`

#### Controllers

1. **MeetingsController**
   - Route : `/api/meetings`
   - Gestion des réunions

---

### Module 8 : ORION (Pilotage)

**Module** : `OrionModule`  
**Fichier** : `apps/api-server/src/orion/orion.module.ts`

#### Controllers

1. **OrionDashboardController**
   - Route : `/api/orion/dashboard`
   - Tableaux de bord

2. **OrionAlertsController**
   - Route : `/api/orion/alerts`
   - Gestion des alertes

3. **OrionKPIController**
   - Route : `/api/orion/kpi`
   - KPI et métriques

4. **OrionInsightsController**
   - Route : `/api/orion/insights`
   - Insights et analyses

5. **OrionAuditController**
   - Route : `/api/orion/audit`
   - Audit et traçabilité

6. **OrionBilingualController**
   - Route : `/api/orion/bilingual`
   - Analyses bilingues

#### Services

- `OrionDashboardService`
- `OrionAlertsService`
- `KPICalculationService`
- `OrionInsightsService`
- `OrionAuditService`
- `BilingualAnalysisService`

---

### Module 9 : Modules Complémentaires

**Module** : `ModulesComplementairesModule`  
**Fichier** : `apps/api-server/src/modules-complementaires/modules-complementaires.module.ts`

#### Controllers

1. **ModulesComplementairesController**
   - Route : `/api/modules-complementaires`
   - Gestion des modules complémentaires

**Fonctionnalités** :
- Cantine
- Transport
- Bibliothèque
- Laboratoires
- Dossiers médicaux
- Boutique
- Educast

---

### Module 10 : QHSE

**Module** : `QhsModule`  
**Fichier** : `apps/api-server/src/qhs/qhs.module.ts`

#### Controllers

1. **QhsController**
   - Route : `/api/qhs`
   - Gestion QHSE

**Fonctionnalités** :
- Inspections
- Incidents
- Actions correctives
- Conformité
- Risques
- Audit QHSE

---

### Module 11 : Paramètres

**Module** : `SettingsModule`  
**Fichier** : `apps/api-server/src/settings/settings.module.ts`

#### Controllers

1. **SettingsController**
   - Route : `/api/settings`
   - Gestion des paramètres

**Fonctionnalités** :
- Paramètres d'école
- Paramètres de sécurité
- Paramètres offline
- Paramètres ORION
- Paramètres Atlas
- Historique des paramètres

---

### Module 12 : Synchronisation

**Module** : `SyncModule`  
**Fichier** : `apps/api-server/src/sync/sync.module.ts`

#### Controllers

1. **SyncController**
   - Route : `/api/sync`
   - Synchronisation offline

**Fonctionnalités** :
- Synchronisation bidirectionnelle
- Gestion des conflits
- Logs de synchronisation

---

### Module 13 : Portail Public

**Module** : `PortalModule`  
**Fichier** : `apps/api-server/src/portal/portal.module.ts`

#### Controllers

1. **PublicPortalController**
   - Route : `/api/public/portal`
   - Portail public (sans auth)

2. **PortalAuthController**
   - Route : `/api/portal/auth`
   - Authentification portail

3. **PortalController**
   - Route : `/api/portal`
   - Portail authentifié

4. **PortalLogController**
   - Route : `/api/portal/logs`
   - Logs du portail

---

## 🎨 Patterns de Routage

### 1. RESTful Standard

```typescript
GET    /api/resource          // Liste
GET    /api/resource/:id      // Détails
POST   /api/resource          // Création
PATCH  /api/resource/:id      // Modification
DELETE /api/resource/:id      // Suppression
```

### 2. Routes Nested

```typescript
GET    /api/students/:studentId/guardians
POST   /api/students/:studentId/guardians
GET    /api/students/:studentId/documents
POST   /api/students/:studentId/documents
```

### 3. Routes Spécialisées

```typescript
GET    /api/finance/payments-enhanced
POST   /api/finance/payment-allocation
GET    /api/orion/dashboard
POST   /api/orion/alerts
```

### 4. Routes Publiques

```typescript
GET    /api/public/verify/:token
GET    /api/public/receipts/:id
GET    /api/public/portal
```

### 5. Routes ORION (Read-Only)

```typescript
GET    /api/orion/dashboard
GET    /api/orion/kpi
GET    /api/orion/insights
GET    /api/orion/audit
```

---

## 🔐 Sécurité des Routes

### Guards Appliqués

Toutes les routes (sauf publiques) sont protégées par :

1. **JwtAuthGuard** : Authentification JWT
2. **TenantValidationGuard** : Validation du tenant
3. **TenantIsolationGuard** : Isolation tenant
4. **ContextValidationGuard** : Validation du contexte
5. **SchoolLevelIsolationGuard** : Isolation niveau scolaire
6. **AcademicYearEnforcementGuard** : Enforcement année académique

### Routes Publiques

Les routes publiques sont exemptées des guards via `@Public()` :

```typescript
@Public()
@Get('verify/:token')
async verify(@Param('token') token: string) {
  // Logique publique
}
```

---

## 📊 Statistiques

### Répartition des Routes

- **Module Students** : ~10 controllers
- **Module Finance** : ~16 controllers
- **Module Pedagogy** : ~11 controllers
- **Module HR** : ~6 controllers
- **Module Communication** : ~5 controllers
- **Module ORION** : ~6 controllers
- **Autres modules** : ~55 controllers

### Méthodes HTTP

- **GET** : ~60% (lecture)
- **POST** : ~25% (création)
- **PATCH** : ~10% (modification)
- **DELETE** : ~5% (suppression)

---

## 💡 Recommandations

### 1. Documentation API

**Recommandation** : Implémenter Swagger/OpenAPI

```typescript
// Exemple
@ApiTags('Students')
@Controller('students')
export class StudentsController {
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'List of students' })
  @Get()
  async findAll() {
    // ...
  }
}
```

### 2. Versioning

**Recommandation** : Ajouter le versioning

```typescript
@Controller('v1/students')
// ou
@Controller({ path: 'students', version: '1' })
```

### 3. Validation DTO

**Recommandation** : Utiliser des DTOs stricts

```typescript
export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;
}
```

### 4. Pagination

**Recommandation** : Standardiser la pagination

```typescript
@Get()
async findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
) {
  // Pagination
}
```

### 5. Filtrage & Recherche

**Recommandation** : Standardiser les filtres

```typescript
@Get()
async findAll(
  @Query('search') search?: string,
  @Query('status') status?: string,
  @Query('sortBy') sortBy?: string,
  @Query('sortOrder') sortOrder?: 'asc' | 'desc',
) {
  // Filtrage
}
```

---

**Document généré le** : 2025-01-17  
**Version** : 1.0.0
