# 📋 Guide - Seed CSPEB-Eveil d'Afrique Education

## Option 1: Utiliser le script TypeScript (Recommandé) ✅

Le script TypeScript utilise Prisma directement et fonctionne sans problème de compilation bcrypt.

```bash
cd apps/api-server
npx ts-node prisma/seed-tenant-cspeb.ts
```

**Avantages:**
- ✅ Fonctionne directement avec Prisma
- ✅ Pas besoin de remplacer des placeholders
- ✅ Gère automatiquement les hashés de mots de passe

---

## Option 2: Utiliser le fichier SQL dans pgAdmin 4

### Étape 1: Générer les hashés de mots de passe

Vous avez deux options pour obtenir les hashés:

#### Option A: Utiliser Node.js (si bcrypt est installé)

Créez un fichier temporaire `hash-passwords.js`:

```javascript
const bcrypt = require('bcrypt');

async function hashPasswords() {
  const directorHash = await bcrypt.hash('C@ptain.Yehioracadhub2021', 10);
  const superAdminHash = await bcrypt.hash('C@ptain.Superadmin1', 10);
  
  console.log('\n📋 Hashés générés:\n');
  console.log('Directeur (s.akpovitohou@gmail.com):');
  console.log(directorHash);
  console.log('\nSuper Admin (yehiortech@gmail.com):');
  console.log(superAdminHash);
}

hashPasswords();
```

Exécutez:
```bash
node hash-passwords.js
```

#### Option B: Utiliser un générateur bcrypt en ligne

Allez sur https://bcrypt-generator.com/ et générez les hashés pour:
- `C@ptain.Yehioracadhub2021` (Directeur)
- `C@ptain.Superadmin1` (Super Admin)

### Étape 2: Remplacer les placeholders dans le SQL

Ouvrez `apps/api-server/prisma/seed-cspeb.sql` et remplacez:

1. `PLACEHOLDER_DIRECTOR_PASSWORD_HASH` → Hash bcrypt du mot de passe Directeur
2. `PLACEHOLDER_SUPERADMIN_PASSWORD_HASH` → Hash bcrypt du mot de passe Super Admin

### Étape 3: Exécuter dans pgAdmin 4

1. Ouvrez **pgAdmin 4**
2. Connectez-vous à votre base de données PostgreSQL
3. Sélectionnez la base `academia_hub`
4. Ouvrez **Query Tool** (Menu: Tools → Query Tool)
5. Chargez le fichier `apps/api-server/prisma/seed-cspeb.sql`
6. Exécutez (F5 ou bouton Execute)

---

## 📊 Données créées

- **Tenant**: CSPEB-Eveil d'Afrique Education
  - Slug: `cspeb-eveil-afrique`
  - Subdomain: `cspeb`
  
- **Utilisateur Directeur**: 
  - Email: `s.akpovitohou@gmail.com`
  - Mot de passe: `C@ptain.Yehioracadhub2021`
  - Rôle: `DIRECTOR`

- **Super Admin**:
  - Email: `yehiortech@gmail.com`
  - Mot de passe: `C@ptain.Superadmin1`
  - Rôle: `SUPER_DIRECTOR`
  - `isSuperAdmin: true`

- **Année scolaire**: Créée automatiquement pour l'année courante (ex: 2024-2025)

---

## ⚠️ Notes importantes

- Le script est **idempotent** : vous pouvez l'exécuter plusieurs fois sans créer de doublons
- Si un tenant/utilisateur existe déjà, il sera mis à jour avec les nouvelles valeurs
- Les mots de passe sont hashés avec bcrypt (10 rounds)
