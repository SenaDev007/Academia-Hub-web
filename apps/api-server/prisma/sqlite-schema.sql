-- ============================================================================
-- SCHÉMA SQLITE - ACADEMIA HUB (OFFLINE-FIRST)
-- ============================================================================
-- 
-- Ce schéma SQLite reflète STRICTEMENT le schéma PostgreSQL.
-- PostgreSQL est la source de vérité.
-- SQLite = miroir exact avec colonnes techniques supplémentaires.
-- 
-- RÈGLES :
-- - Noms de tables identiques à PostgreSQL
-- - Colonnes métier identiques (types convertis : String→TEXT, DateTime→TEXT)
-- - Colonnes techniques ajoutées : local_id, sync_status, local_updated_at, device_id
-- 
-- ============================================================================

-- ============================================================================
-- TABLE DE VERSIONNEMENT DU SCHÉMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_version (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT NOT NULL UNIQUE,
  schema_hash TEXT NOT NULL,
  description TEXT,
  applied_at TEXT DEFAULT (datetime('now')) NOT NULL
);

-- ============================================================================
-- TABLE DE JOURNALISATION OFFLINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS offline_operations (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK(operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  payload TEXT NOT NULL,  -- JSON immuable de l'état complet
  created_at TEXT DEFAULT (datetime('now')) NOT NULL,
  sync_status TEXT DEFAULT 'PENDING' CHECK(sync_status IN ('PENDING', 'SYNCING', 'SYNCED', 'FAILED', 'CONFLICT')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  synced_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_offline_operations_table_record ON offline_operations(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_offline_operations_sync_status ON offline_operations(sync_status, created_at);
CREATE INDEX IF NOT EXISTS idx_offline_operations_created_at ON offline_operations(created_at);

-- ============================================================================
-- TABLE 1: STUDENTS
-- ============================================================================
-- 
-- Correspondance PostgreSQL : table "students"
-- Colonnes techniques ajoutées : local_id, sync_status, local_updated_at, device_id
-- 
-- ============================================================================

CREATE TABLE IF NOT EXISTS students (
  -- Colonnes métier (identiques à PostgreSQL)
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  academicYearId TEXT NOT NULL,
  currentAcademicYearId TEXT,
  schoolLevelId TEXT NOT NULL,
  studentCode TEXT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  dateOfBirth TEXT,  -- DateTime → TEXT (ISO 8601)
  gender TEXT,
  nationality TEXT,
  primaryLanguage TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL,
  
  -- Colonnes techniques offline
  local_id TEXT UNIQUE,  -- ID temporaire si généré offline
  sync_status TEXT DEFAULT 'PENDING' CHECK(sync_status IN ('PENDING', 'SYNCED', 'CONFLICT', 'ERROR')),
  local_updated_at TEXT DEFAULT (datetime('now')) NOT NULL,
  device_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_students_tenantId ON students(tenantId);
CREATE INDEX IF NOT EXISTS idx_students_academicYearId ON students(academicYearId);
CREATE INDEX IF NOT EXISTS idx_students_schoolLevelId ON students(schoolLevelId);
CREATE INDEX IF NOT EXISTS idx_students_tenantId_academicYearId_schoolLevelId ON students(tenantId, academicYearId, schoolLevelId);
CREATE INDEX IF NOT EXISTS idx_students_tenantId_status ON students(tenantId, status);
CREATE INDEX IF NOT EXISTS idx_students_tenantId_studentCode ON students(tenantId, studentCode);
CREATE INDEX IF NOT EXISTS idx_students_sync_status ON students(sync_status);
CREATE INDEX IF NOT EXISTS idx_students_local_updated_at ON students(local_updated_at);

-- ============================================================================
-- TABLE 2: PAYMENTS
-- ============================================================================
-- 
-- Correspondance PostgreSQL : table "payments"
-- Colonnes techniques ajoutées : local_id, sync_status, local_updated_at, device_id
-- 
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  -- Colonnes métier (identiques à PostgreSQL)
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  academicYearId TEXT,
  studentId TEXT NOT NULL,
  schoolLevelId TEXT NOT NULL,
  feeConfigurationId TEXT,
  amount REAL NOT NULL,  -- Decimal → REAL
  paymentMethod TEXT,
  paymentDate TEXT NOT NULL,  -- Date → TEXT (ISO 8601)
  reference TEXT,
  receiptNumber TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  paymentFlowId TEXT,
  notes TEXT,
  createdBy TEXT,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL,
  studentFeeId TEXT,
  
  -- Colonnes techniques offline
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'PENDING' CHECK(sync_status IN ('PENDING', 'SYNCED', 'CONFLICT', 'ERROR')),
  local_updated_at TEXT DEFAULT (datetime('now')) NOT NULL,
  device_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_tenantId_schoolLevelId ON payments(tenantId, schoolLevelId);
CREATE INDEX IF NOT EXISTS idx_payments_studentId ON payments(studentId);
CREATE INDEX IF NOT EXISTS idx_payments_studentFeeId ON payments(studentFeeId);
CREATE INDEX IF NOT EXISTS idx_payments_sync_status ON payments(sync_status);
CREATE INDEX IF NOT EXISTS idx_payments_local_updated_at ON payments(local_updated_at);

-- ============================================================================
-- TABLE 3: STUDENT_FEE_PROFILES
-- ============================================================================
-- 
-- Correspondance PostgreSQL : table "student_fee_profiles"
-- Colonnes techniques ajoutées : local_id, sync_status, local_updated_at, device_id
-- 
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_fee_profiles (
  -- Colonnes métier (identiques à PostgreSQL)
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  academicYearId TEXT NOT NULL,
  feeRegimeId TEXT NOT NULL,
  justification TEXT,
  validatedBy TEXT,
  validatedAt TEXT,  -- DateTime → TEXT
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL,
  
  -- Colonnes techniques offline
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'PENDING' CHECK(sync_status IN ('PENDING', 'SYNCED', 'CONFLICT', 'ERROR')),
  local_updated_at TEXT DEFAULT (datetime('now')) NOT NULL,
  device_id TEXT,
  
  -- Contrainte unique (identique PostgreSQL)
  UNIQUE(studentId, academicYearId)
);

CREATE INDEX IF NOT EXISTS idx_student_fee_profiles_studentId ON student_fee_profiles(studentId);
CREATE INDEX IF NOT EXISTS idx_student_fee_profiles_academicYearId ON student_fee_profiles(academicYearId);
CREATE INDEX IF NOT EXISTS idx_student_fee_profiles_feeRegimeId ON student_fee_profiles(feeRegimeId);
CREATE INDEX IF NOT EXISTS idx_student_fee_profiles_sync_status ON student_fee_profiles(sync_status);
CREATE INDEX IF NOT EXISTS idx_student_fee_profiles_local_updated_at ON student_fee_profiles(local_updated_at);

-- ============================================================================
-- TABLE 4: COLLECTION_CASES
-- ============================================================================
-- 
-- Correspondance PostgreSQL : table "collection_cases"
-- Colonnes techniques ajoutées : local_id, sync_status, local_updated_at, device_id
-- 
-- ============================================================================

CREATE TABLE IF NOT EXISTS collection_cases (
  -- Colonnes métier (identiques à PostgreSQL)
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  studentId TEXT NOT NULL,
  academicYearId TEXT NOT NULL,
  totalDue REAL NOT NULL,  -- Decimal → REAL
  totalPaid REAL NOT NULL DEFAULT 0,  -- Decimal → REAL
  outstandingAmount REAL NOT NULL,  -- Decimal → REAL
  status TEXT NOT NULL DEFAULT 'ON_TIME',
  escalationLevel INTEGER NOT NULL DEFAULT 0,
  lastActionAt TEXT,  -- DateTime → TEXT
  blockedUntil TEXT,  -- DateTime → TEXT
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL,
  
  -- Colonnes techniques offline
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'PENDING' CHECK(sync_status IN ('PENDING', 'SYNCED', 'CONFLICT', 'ERROR')),
  local_updated_at TEXT DEFAULT (datetime('now')) NOT NULL,
  device_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_collection_cases_tenantId ON collection_cases(tenantId);
CREATE INDEX IF NOT EXISTS idx_collection_cases_studentId ON collection_cases(studentId);
CREATE INDEX IF NOT EXISTS idx_collection_cases_academicYearId ON collection_cases(academicYearId);
CREATE INDEX IF NOT EXISTS idx_collection_cases_status ON collection_cases(status);
CREATE INDEX IF NOT EXISTS idx_collection_cases_sync_status ON collection_cases(sync_status);
CREATE INDEX IF NOT EXISTS idx_collection_cases_local_updated_at ON collection_cases(local_updated_at);

-- ============================================================================
-- TABLE 5: STUDENT_DOCUMENTS
-- ============================================================================
-- 
-- Correspondance PostgreSQL : table "student_documents"
-- Note: "pedagogic_documents" fait référence à cette table
-- Colonnes techniques ajoutées : local_id, sync_status, local_updated_at, device_id
-- 
-- ============================================================================

CREATE TABLE IF NOT EXISTS student_documents (
  -- Colonnes métier (identiques à PostgreSQL)
  id TEXT PRIMARY KEY,
  tenantId TEXT NOT NULL,
  academicYearId TEXT NOT NULL,
  schoolLevelId TEXT NOT NULL,
  studentId TEXT NOT NULL,
  documentType TEXT NOT NULL,
  fileName TEXT NOT NULL,
  filePath TEXT NOT NULL,
  fileSize INTEGER,
  mimeType TEXT,
  uploadedBy TEXT,
  createdAt TEXT DEFAULT (datetime('now')) NOT NULL,
  updatedAt TEXT DEFAULT (datetime('now')) NOT NULL,
  
  -- Colonnes techniques offline
  local_id TEXT UNIQUE,
  sync_status TEXT DEFAULT 'PENDING' CHECK(sync_status IN ('PENDING', 'SYNCED', 'CONFLICT', 'ERROR')),
  local_updated_at TEXT DEFAULT (datetime('now')) NOT NULL,
  device_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_student_documents_tenantId_academicYearId ON student_documents(tenantId, academicYearId);
CREATE INDEX IF NOT EXISTS idx_student_documents_studentId ON student_documents(studentId);
CREATE INDEX IF NOT EXISTS idx_student_documents_documentType ON student_documents(documentType);
CREATE INDEX IF NOT EXISTS idx_student_documents_sync_status ON student_documents(sync_status);
CREATE INDEX IF NOT EXISTS idx_student_documents_local_updated_at ON student_documents(local_updated_at);

-- ============================================================================
-- CORRESPONDANCE POSTGRESQL ↔ SQLITE
-- ============================================================================

-- Résumé des correspondances :
-- 
-- PostgreSQL          SQLite               Notes
-- ----------          ------               -----
-- students            students             Colonnes techniques ajoutées
-- payments            payments             Colonnes techniques ajoutées
-- student_fee_profiles student_fee_profiles Colonnes techniques ajoutées
-- collection_cases    collection_cases     Colonnes techniques ajoutées
-- student_documents   student_documents    Colonnes techniques ajoutées
-- 
-- Colonnes techniques (uniquement SQLite) :
-- - local_id TEXT UNIQUE              (ID temporaire offline)
-- - sync_status TEXT                  (PENDING | SYNCED | CONFLICT | ERROR)
-- - local_updated_at TEXT             (Date modification locale)
-- - device_id TEXT                    (Identifiant dispositif)
-- 
-- Conversion de types :
-- - String → TEXT                     (identique)
-- - DateTime → TEXT                   (ISO 8601: 'YYYY-MM-DD HH:MM:SS')
-- - Date → TEXT                       (ISO 8601: 'YYYY-MM-DD')
-- - Decimal → REAL                    (approximation, précision 10.2)
-- - Boolean → INTEGER                 (0 = false, 1 = true)
-- - Json → TEXT                       (JSON string)
-- 
-- ============================================================================
