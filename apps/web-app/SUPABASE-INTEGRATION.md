# 🔗 Intégration Supabase - Academia Hub

## ✅ Statut : CONFIGURÉ

L'application **Next.js** (`apps/web-app/`) a été configurée pour utiliser Supabase comme backend.

---

## 📋 Configuration

### Variables d'Environnement

Créez un fichier `.env.local` dans `apps/web-app/` avec les variables suivantes :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ankbtgwlofidxtafdueu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_1XCM6w3jm4368f-P36BaKw_XrCoHmZy

# Alternative (ancien nom)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_1XCM6w3jm4368f-P36BaKw_XrCoHmZy

# Database Connection (server-side only - pour Prisma)
DATABASE_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
```

⚠️ **IMPORTANT** : Ne jamais exposer `DATABASE_URL` avec le préfixe `NEXT_PUBLIC_` (server-side only).

---

## 📁 Fichiers Créés

### Utilitaires Supabase

1. ✅ **`src/utils/supabase/server.ts`** - Client Supabase pour Server Components
2. ✅ **`src/utils/supabase/client.ts`** - Client Supabase pour Client Components
3. ✅ **`src/utils/supabase/middleware.ts`** - Client Supabase pour Middleware

### Exemple

4. ✅ **`src/app/api/supabase-example/page.tsx`** - Page d'exemple d'utilisation

### Configuration

5. ✅ **`.env.local.example`** - Template des variables d'environnement
6. ✅ **`src/middleware.ts`** - Mis à jour avec intégration Supabase

---

## 🚀 Utilisation

### Dans un Server Component

```typescript
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Récupérer l'utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Récupérer des données
  const { data, error } = await supabase
    .from('your_table')
    .select('*');

  return <div>...</div>;
}
```

### Dans un Client Component

```typescript
'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function ClientComponent() {
  const supabase = createClient();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('your_table')
        .select('*');
      
      if (data) setData(data);
    };

    fetchData();
  }, []);

  return <div>...</div>;
}
```

### Dans le Middleware

Le middleware a été mis à jour pour intégrer Supabase automatiquement. Il rafraîchit la session utilisateur à chaque requête.

---

## 🔐 Authentification

### Connexion

```typescript
const supabase = createClient();

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});
```

### Inscription

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
});
```

### Déconnexion

```typescript
await supabase.auth.signOut();
```

### Vérifier l'utilisateur actuel

```typescript
const {
  data: { user },
} = await supabase.auth.getUser();
```

---

## 📊 Base de Données

### Connection String

```
postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
```

### Prisma Configuration

Pour utiliser Prisma avec Supabase, configurez `schema.prisma` :

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Connection Pooling (Recommandé pour Production)

```bash
# Utilisez le pooler pour les requêtes client/ORM
DATABASE_URL=postgresql://postgres.ankbtgwlofidxtafdueu:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection pour les migrations uniquement
DIRECT_URL=postgresql://postgres:C%40ptain.Yehioracadhub202%21@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres
```

---

## 📦 Dépendances Installées

- `@supabase/ssr` - Support SSR pour Next.js
- `@supabase/supabase-js` - Client JavaScript Supabase

---

## ✅ Checklist

- [x] ✅ Fichiers utilitaires Supabase créés
- [x] ✅ Middleware mis à jour avec Supabase
- [x] ✅ Variables d'environnement documentées
- [x] ✅ Exemple d'utilisation créé
- [x] ✅ Dépendances ajoutées au `package.json`
- [ ] ⏳ Créer le fichier `.env.local` avec vos credentials
- [ ] ⏳ Installer les dépendances : `npm install`
- [ ] ⏳ Tester la connexion Supabase

---

## 🐛 Dépannage

### Erreur: "Missing Supabase environment variables"

**Solution** : Vérifiez que `.env.local` contient bien `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Erreur de connexion à la base de données

**Solution** : Vérifiez que `DATABASE_URL` est correct et que le mot de passe est encodé en URL (ex: `%40` pour `@`).

### Erreur CORS

**Solution** : Configurez les règles CORS dans le dashboard Supabase pour autoriser votre domaine.

---

## 📚 Documentation Complémentaire

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase avec Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

**Intégration Supabase terminée** ✅  
**Configuration complète** ✅  
**Prêt pour utilisation** ✅

