/**
 * ============================================================================
 * SEED - TENANT CSPEB-EVEIL D'AFRIQUE EDUCATION
 * ============================================================================
 * 
 * Script pour créer le tenant CSPEB et les utilisateurs associés
 * - Tenant: CSPEB-Eveil d'Afrique Education
 * - Utilisateur Directeur: s.akpovitohou@gmail.com
 * - Super Admin: yehiortech@gmail.com
 * 
 * Usage: npx ts-node prisma/seed-tenant-cspeb.ts
 * 
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed CSPEB...\n');

  // ============================================================================
  // 1. VÉRIFIER/CRÉER LE PAYS BJ (BÉNIN)
  // ============================================================================
  console.log('1️⃣  Vérification du pays BJ (Bénin)...');
  
  let country = await prisma.country.findUnique({
    where: { code: 'BJ' },
  });

  if (!country) {
    country = await prisma.country.create({
      data: {
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
    console.log(`   ✅ Pays créé: ${country.name} (${country.code})`);
  } else {
    console.log(`   ℹ️  Pays déjà existant: ${country.name} (${country.code})`);
  }

  // ============================================================================
  // 2. CRÉER LE TENANT CSPEB
  // ============================================================================
  console.log('\n2️⃣  Création du tenant CSPEB-Eveil d\'Afrique Education...');
  
  const tenantSlug = 'cspeb-eveil-afrique';
  const tenantSubdomain = 'cspeb';

  let tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { slug: tenantSlug },
        { subdomain: tenantSubdomain },
      ],
    },
  });

  if (tenant) {
    console.log(`   ℹ️  Tenant déjà existant: ${tenant.name} (${tenant.slug})`);
    console.log(`   🔄 Mise à jour des informations...`);
    
    tenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name: 'CSPEB-Eveil d\'Afrique Education',
        slug: tenantSlug,
        subdomain: tenantSubdomain,
        countryId: country.id,
        type: 'SCHOOL',
        subscriptionStatus: 'ACTIVE_SUBSCRIBED',
        status: 'active',
        subscriptionPlan: 'premium',
      },
    });
    console.log(`   ✅ Tenant mis à jour: ${tenant.name}`);
  } else {
    tenant = await prisma.tenant.create({
      data: {
        name: 'CSPEB-Eveil d\'Afrique Education',
        slug: tenantSlug,
        subdomain: tenantSubdomain,
        countryId: country.id,
        type: 'SCHOOL',
        subscriptionStatus: 'ACTIVE_SUBSCRIBED',
        status: 'active',
        subscriptionPlan: 'premium',
      },
    });
    console.log(`   ✅ Tenant créé: ${tenant.name} (${tenant.slug})`);
  }

  // ============================================================================
  // 3. HASHER LES MOTS DE PASSE
  // ============================================================================
  console.log('\n3️⃣  Hachage des mots de passe...');
  
  const directorPassword = 'C@ptain.Yehioracadhub2021';
  const superAdminPassword = 'C@ptain.Superadmin1';
  
  const directorPasswordHash = await bcrypt.hash(directorPassword, 10);
  const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 10);
  
  console.log('   ✅ Mots de passe hashés');

  // ============================================================================
  // 4. CRÉER L'UTILISATEUR DIRECTEUR
  // ============================================================================
  console.log('\n4️⃣  Création de l\'utilisateur Directeur...');
  
  const directorEmail = 's.akpovitohou@gmail.com';
  
  let directorUser = await prisma.user.findUnique({
    where: { email: directorEmail },
  });

  if (directorUser) {
    console.log(`   ℹ️  Utilisateur directeur déjà existant: ${directorEmail}`);
    console.log(`   🔄 Mise à jour...`);
    
    directorUser = await prisma.user.update({
      where: { id: directorUser.id },
      data: {
        tenantId: tenant.id,
        passwordHash: directorPasswordHash,
        firstName: 'Directeur',
        lastName: 'CSPEB',
        role: 'DIRECTOR',
        isSuperAdmin: false,
        status: 'active',
      },
    });
    console.log(`   ✅ Utilisateur directeur mis à jour: ${directorUser.email}`);
  } else {
    directorUser = await prisma.user.create({
      data: {
        email: directorEmail,
        passwordHash: directorPasswordHash,
        firstName: 'Directeur',
        lastName: 'CSPEB',
        role: 'DIRECTOR',
        tenantId: tenant.id,
        isSuperAdmin: false,
        status: 'active',
      },
    });
    console.log(`   ✅ Utilisateur directeur créé: ${directorUser.email}`);
  }

  // ============================================================================
  // 5. CRÉER LE SUPER ADMIN
  // ============================================================================
  console.log('\n5️⃣  Création du Super Admin...');
  
  const superAdminEmail = 'yehiortech@gmail.com';
  
  let superAdminUser = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (superAdminUser) {
    console.log(`   ℹ️  Super Admin déjà existant: ${superAdminEmail}`);
    console.log(`   🔄 Mise à jour...`);
    
    superAdminUser = await prisma.user.update({
      where: { id: superAdminUser.id },
      data: {
        passwordHash: superAdminPasswordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_DIRECTOR',
        isSuperAdmin: true,
        status: 'active',
        // Super Admin n'a pas de tenantId (accès global)
        tenantId: null,
      },
    });
    console.log(`   ✅ Super Admin mis à jour: ${superAdminUser.email}`);
  } else {
    superAdminUser = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash: superAdminPasswordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_DIRECTOR',
        isSuperAdmin: true,
        status: 'active',
        // Super Admin n'a pas de tenantId (accès global)
        tenantId: null,
      },
    });
    console.log(`   ✅ Super Admin créé: ${superAdminUser.email}`);
  }

  // ============================================================================
  // 6. CRÉER L'ANNÉE SCOLAIRE ACTIVE (si elle n'existe pas)
  // ============================================================================
  console.log('\n6️⃣  Vérification de l\'année scolaire active...');
  
  const currentYear = new Date().getFullYear();
  const academicYearName = `${currentYear}-${currentYear + 1}`;
  
  let academicYear = await prisma.academicYear.findFirst({
    where: {
      tenantId: tenant.id,
      name: academicYearName,
    },
  });

  if (!academicYear) {
    const startDate = new Date(`${currentYear}-09-01`);
    const endDate = new Date(`${currentYear + 1}-07-31`);
    const preEntryDate = new Date(`${currentYear}-09-02`);

    academicYear = await prisma.academicYear.create({
      data: {
        tenantId: tenant.id,
        name: academicYearName,
        label: `Année scolaire ${academicYearName}`,
        startDate: startDate,
        endDate: endDate,
        preEntryDate: preEntryDate,
        isActive: true,
        isAutoGenerated: false,
      },
    });
    console.log(`   ✅ Année scolaire créée: ${academicYear.label}`);
  } else {
    console.log(`   ℹ️  Année scolaire déjà existante: ${academicYear.label}`);
  }

  // ============================================================================
  // RÉSUMÉ
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ Seed CSPEB terminé avec succès!');
  console.log('='.repeat(60));
  console.log('\n📊 Données créées/mises à jour:');
  console.log(`   - Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`   - Utilisateur Directeur: ${directorUser.email}`);
  console.log(`     Mot de passe: ${directorPassword}`);
  console.log(`   - Super Admin: ${superAdminUser.email}`);
  console.log(`     Mot de passe: ${superAdminPassword}`);
  console.log(`   - Année scolaire: ${academicYear.label}`);
  console.log('\n🎯 La base de données est prête à l\'usage!');
}

main()
  .catch((e) => {
    console.error('\n❌ Erreur lors du seed CSPEB:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
