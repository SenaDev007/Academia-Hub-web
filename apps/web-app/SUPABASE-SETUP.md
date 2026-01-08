# 🚀 Configuration Supabase - Guide Rapide

## ✅ Étapes de Configuration

### 1. Créer le fichier `.env.local`

Créez un fichier `.env.local` dans `apps/web-app/` avec le contenu suivant :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ankbtgwlofidxtafdueu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1XCM6w3jm4368f-P36BaKw_XrCoHmZy

# Alternative (si vous utilisez l'ancien nom)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_1XCM6w3jm4368f-P36BaKw_XrCoHmZy

# Database Connection (server-side only - pour Prisma)
DATABASE_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_PLATFORM=web
NEXT_PUBLIC_ENV=development
```

⚠️ **IMPORTANT** : 
- Ne jamais commiter `.env.local` (déjà dans `.gitignore`)
- `DATABASE_URL` et `DIRECT_URL` sont server-side only (pas de `NEXT_PUBLIC_`)

### 2. Installer les dépendances

Les dépendances Supabase ont déjà été ajoutées au `package.json`. Si nécessaire, réinstallez :

```bash
cd apps/web-app
npm install
```

### 3. Tester la connexion

Créez une page de test pour vérifier la connexion :

```bash
# La page d'exemple existe déjà à :
# apps/web-app/src/app/api/supabase-example/page.tsx
```

Accédez à : `http://localhost:3001/api/supabase-example`

### 4. Configuration Prisma (Backend)

Pour le backend (`apps/api-server/`), configurez également `.env` :

```bash
# Connection pooling (recommandé pour production)
DATABASE_URL=postgresql://postgres.ankbtgwlofidxtafdueu:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection (pour migrations uniquement)
DIRECT_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
```

Le `schema.prisma` a déjà été mis à jour pour supporter `directUrl`.

---

## 📁 Fichiers Créés

✅ **`src/utils/supabase/server.ts`** - Client Supabase pour Server Components  
✅ **`src/utils/supabase/client.ts`** - Client Supabase pour Client Components  
✅ **`src/utils/supabase/middleware.ts`** - Client Supabase pour Middleware  
✅ **`src/middleware.ts`** - Mis à jour avec intégration Supabase  
✅ **`src/app/api/supabase-example/page.tsx`** - Page d'exemple  
✅ **`package.json`** - Dépendances Supabase ajoutées  
✅ **`apps/api-server/prisma/schema.prisma`** - Support `directUrl` ajouté  

---

## 🔐 Variables d'Environnement

### Frontend (`apps/web-app/.env.local`)

| Variable | Description | Public ? |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | ✅ Oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ Oui |
| `DATABASE_URL` | Connection string PostgreSQL | ❌ Non (server-side) |
| `DIRECT_URL` | Connection directe (migrations) | ❌ Non (server-side) |

### Backend (`apps/api-server/.env`)

| Variable | Description | Usage |
|----------|-------------|-------|
| `DATABASE_URL` | Connection pooling (recommandé) | Requêtes ORM |
| `DIRECT_URL` | Connection directe | Migrations Prisma uniquement |

---

## 🚀 Utilisation

### Server Component

```typescript
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('your_table')
    .select('*');

  return <div>...</div>;
}
```

### Client Component

```typescript
'use client';

import { createClient } from '@/utils/supabase/client';

export default function Component() {
  const supabase = createClient();
  // ...
}
```

---

## ✅ Checklist

- [x] ✅ Fichiers utilitaires Supabase créés
- [x] ✅ Middleware mis à jour
- [x] ✅ Dépendances installées
- [x] ✅ Schema Prisma mis à jour
- [ ] ⏳ Créer `.env.local` avec vos credentials
- [ ] ⏳ Tester la connexion Supabase
- [ ] ⏳ Configurer les tables dans Supabase Dashboard

---

**Configuration Supabase terminée** ✅  
**Prêt pour utilisation** ✅

