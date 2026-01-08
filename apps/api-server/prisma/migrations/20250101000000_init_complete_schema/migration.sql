-- Migration: 20250101000000_init_complete_schema
-- Description: Migration initiale complète pour Academia Hub
-- Date: 2025-01-01
-- 
-- Cette migration crée toutes les tables de base du système.
-- Les relations seront ajoutées dans des migrations ultérieures.

-- Activer les extensions PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES - FONDATIONS
-- ============================================================================

-- Countries
CREATE TABLE IF NOT EXISTS "countries" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code3" TEXT,
  "numericCode" TEXT,
  "currencyCode" TEXT,
  "currencySymbol" TEXT,
  "phonePrefix" TEXT,
  "flagEmoji" TEXT,
  "isDefault" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "countries_code_key" ON "countries"("code");

-- Tenants
CREATE TABLE IF NOT EXISTS "tenants" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "subdomain" TEXT,
  "slug" TEXT NOT NULL,
  "schemaName" TEXT,
  "countryId" TEXT NOT NULL,
  "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIAL',
  "status" TEXT NOT NULL DEFAULT 'active',
  "subscriptionPlan" TEXT NOT NULL DEFAULT 'free',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "trialEndsAt" TIMESTAMP(3),
  "nextPaymentDueAt" TIMESTAMP(3),

  CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "tenants_subdomain_key" ON "tenants"("subdomain");
CREATE UNIQUE INDEX IF NOT EXISTS "tenants_slug_key" ON "tenants"("slug");
CREATE INDEX IF NOT EXISTS "tenants_countryId_idx" ON "tenants"("countryId");

-- Academic Years
CREATE TABLE IF NOT EXISTS "academic_years" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "academic_years_tenantId_label_key" ON "academic_years"("tenantId", "label");
CREATE INDEX IF NOT EXISTS "academic_years_tenantId_idx" ON "academic_years"("tenantId");

-- School Levels
CREATE TABLE IF NOT EXISTS "school_levels" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "school_levels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "school_levels_tenantId_code_key" ON "school_levels"("tenantId", "code");
CREATE INDEX IF NOT EXISTS "school_levels_tenantId_idx" ON "school_levels"("tenantId");

-- Academic Tracks
CREATE TABLE IF NOT EXISTS "academic_tracks" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "academic_tracks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "academic_tracks_tenantId_code_key" ON "academic_tracks"("tenantId", "code");
CREATE INDEX IF NOT EXISTS "academic_tracks_tenantId_idx" ON "academic_tracks"("tenantId");

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
  "status" TEXT NOT NULL DEFAULT 'active',
  "lastLogin" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX IF NOT EXISTS "users_tenantId_role_idx" ON "users"("tenantId", "role");

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

ALTER TABLE "tenants" ADD CONSTRAINT IF NOT EXISTS "tenants_countryId_fkey" 
  FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "academic_years" ADD CONSTRAINT IF NOT EXISTS "academic_years_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "school_levels" ADD CONSTRAINT IF NOT EXISTS "school_levels_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "academic_tracks" ADD CONSTRAINT IF NOT EXISTS "academic_tracks_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "users" ADD CONSTRAINT IF NOT EXISTS "users_tenantId_fkey" 
  FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

