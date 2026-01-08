import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { StudentsModule } from './students/students.module';
import { AcademicYearsModule } from './academic-years/academic-years.module';
import { QuartersModule } from './quarters/quarters.module';
import { SchoolsModule } from './schools/schools.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TeachersModule } from './teachers/teachers.module';
import { DepartmentsModule } from './departments/departments.module';
import { RoomsModule } from './rooms/rooms.module';
import { AbsencesModule } from './absences/absences.module';
import { DisciplineModule } from './discipline/discipline.module';
import { ExamsModule } from './exams/exams.module';
import { GradesModule } from './grades/grades.module';
import { FeeConfigurationsModule } from './fee-configurations/fee-configurations.module';
import { PaymentsModule } from './payments/payments.module';
import { ExpensesModule } from './expenses/expenses.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CountriesModule } from './countries/countries.module';
import { GradingPoliciesModule } from './grading-policies/grading-policies.module';
import { SalaryPoliciesModule } from './salary-policies/salary-policies.module';
import { ComplianceModule } from './compliance/compliance.module';
import { SchoolLevelsModule } from './school-levels/school-levels.module';
import { AcademicTracksModule } from './academic-tracks/academic-tracks.module';
import { TenantFeaturesModule } from './tenant-features/tenant-features.module';
import { PaymentFlowsModule } from './payment-flows/payment-flows.module';
import { OrionBilingualModule } from './orion/orion-bilingual.module';
import { CommunicationModule } from './communication/communication.module';
import { GeneralModule } from './modules/general/general.module';
import { ModulesModule } from './modules/modules.module';
import { ContextModule } from './common/context/context.module';
import { SynthesisModule } from './modules/synthesis/synthesis.module';
import { SyncModule } from './sync/sync.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TenantValidationGuard } from './common/guards/tenant-validation.guard';
import { TenantIsolationGuard } from './common/guards/tenant-isolation.guard';
import { ContextValidationGuard } from './common/guards/context-validation.guard';
import { SchoolLevelIsolationGuard } from './common/guards/school-level-isolation.guard';
import { AcademicYearEnforcementGuard } from './common/guards/academic-year-enforcement.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { ContextInterceptor } from './common/interceptors/context.interceptor';
import { SchoolLevelEnforcementInterceptor } from './common/interceptors/school-level-enforcement.interceptor';
import { AcademicYearEnforcementInterceptor } from './common/interceptors/academic-year-enforcement.interceptor';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    StudentsModule,
    
    // Academic modules
    AcademicYearsModule,
    QuartersModule,
    SchoolsModule,
    
    // Pedagogical modules
    ClassesModule,
    SubjectsModule,
    TeachersModule,
    DepartmentsModule,
    RoomsModule,
    
    // Attendance & Discipline
    AbsencesModule,
    DisciplineModule,
    
    // Evaluation modules
    ExamsModule,
    GradesModule,
    
    // Finance modules
    FeeConfigurationsModule,
    PaymentsModule,
    ExpensesModule,
    
    // System modules
    RolesModule,
    PermissionsModule,
    AuditLogsModule,
    
    // Country & Policies modules
    CountriesModule,
    GradingPoliciesModule,
    SalaryPoliciesModule,
    
    // Compliance module
    ComplianceModule,
    
    // School Levels module
    SchoolLevelsModule,
    
    // Academic Tracks module (Bilingue FR/EN)
    AcademicTracksModule,
    
    // Tenant Features module (Feature Flags)
    TenantFeaturesModule,
    
    // Payment Flows module (Séparation SAAS/TUITION)
    PaymentFlowsModule,
    
    // ORION Bilingual Analysis module
    OrionBilingualModule,
    
    // Communication module
    CommunicationModule,
    
    // General module (Agrégations contrôlées cross-level)
    GeneralModule,
    
    // Modules module
    ModulesModule,
    
    // Context module (DOIT être après ModulesModule, SchoolLevelsModule, TenantsModule)
    ContextModule,
    
    // Module-specific calculation modules
    // Note: Ces modules fournissent des endpoints de calcul par module
    // Les modules métier (StudentsModule, PaymentsModule, etc.) restent pour CRUD
    // ScolariteModule, // Décommenter quand prêt
    // FinancesModule, // Décommenter quand prêt
    
    // Synthesis module (Module général de synthèse - Lecture seule)
    SynthesisModule,
    
    // Sync & Offline
    SyncModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Authentification JWT
    },
    {
      provide: APP_GUARD,
      useClass: TenantValidationGuard, // Validation du tenant
    },
    {
      provide: APP_GUARD,
      useClass: TenantIsolationGuard, // Isolation par tenant
    },
    {
      provide: APP_GUARD,
      useClass: ContextValidationGuard, // Validation du contexte (tenant + school_level + module)
    },
    {
      provide: APP_GUARD,
      useClass: SchoolLevelIsolationGuard, // Isolation stricte des niveaux scolaires (RÈGLE STRUCTURANTE)
    },
    {
      provide: APP_GUARD,
      useClass: AcademicYearEnforcementGuard, // Enforcement academic_year_id obligatoire (DIMENSION OBLIGATOIRE)
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ContextInterceptor, // Résolution du contexte (DOIT être avant autres interceptors)
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SchoolLevelEnforcementInterceptor, // Enforcement school_level_id obligatoire
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AcademicYearEnforcementInterceptor, // Enforcement academic_year_id obligatoire
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor, // Logs d'audit
    },
  ],
})
export class AppModule {}

