# Redirection Multi-Tenant - Guide Complet

## 📋 Vue d'ensemble

Système de redirection multi-tenant sécurisé pour Academia Hub, compatible avec :
- ✅ Local (sans DNS)
- ✅ Preview Vercel
- ✅ Production (domaine custom)

## 🎯 Fonctionnalités

### ✅ Implémenté

1. **Redirection intelligente**
   - Local : Query params (`?tenant=...`)
   - Preview/Prod : Sous-domaines réels

2. **Protection automatique**
   - Vérification tenant_id obligatoire sur `/app`
   - Validation de l'existence du tenant
   - Vérification du statut d'abonnement

3. **Logging complet**
   - Toutes les redirections sont loggées
   - Tentatives d'accès non autorisées
   - Analytics et audit

4. **Compatibilité Supabase Auth**
   - Intégration avec Supabase
   - Support des JWT claims
   - Session management

## 🔧 Configuration

### Variables d'environnement

```bash
# .env.local (développement)
NEXT_PUBLIC_BASE_DOMAIN=localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.production
NEXT_PUBLIC_BASE_DOMAIN=academia-hub.com
NEXT_PUBLIC_APP_URL=https://academia-hub.com
NEXT_PUBLIC_API_URL=https://api.academia-hub.com/api
```

## 📖 Utilisation

### Hook React (Recommandé)

```tsx
import { useTenantRedirect } from '@/lib/hooks/useTenantRedirect';

function PortalPage() {
  const { redirectToTenant } = useTenantRedirect();

  const handleSchoolSelect = async (school: School) => {
    await redirectToTenant({
      tenantSlug: school.slug,
      tenantId: school.id,
      path: '/login',
      portalType: 'SCHOOL',
    });
  };

  return <button onClick={() => handleSchoolSelect(school)}>Accéder</button>;
}
```

### Fonction directe

```ts
import { redirectToTenant, getTenantRedirectUrl } from '@/lib/utils/tenant-redirect';

// Obtenir l'URL
const url = getTenantRedirectUrl({
  tenantSlug: 'college-x',
  path: '/login',
  portalType: 'SCHOOL',
});

// Rediriger avec logging
await redirectToTenant({
  tenantSlug: 'college-x',
  tenantId: 'uuid',
  path: '/login',
  portalType: 'SCHOOL',
});
```

## 🔒 Sécurité

### Protection Middleware

Le middleware Next.js protège automatiquement :

```ts
// ✅ Accès autorisé
https://college-x.academia-hub.com/app
http://localhost:3001/app?tenant=college-x

// ❌ Accès refusé → Redirection vers /portal
http://localhost:3001/app (sans tenant)
https://academia-hub.com/app (sans sous-domaine)
```

### Logging des accès

Toutes les tentatives sont loggées :
- ✅ Accès réussis
- ⚠️ Tentatives sans tenant
- ⚠️ Tentatives vers tenant inexistant
- ⚠️ Tentatives vers tenant inactif

## 🌍 Environnements

### Local (Development)

**URL générée** :
```
http://localhost:3001/login?tenant=college-x&portal=school
```

**Avantages** :
- Pas besoin de DNS
- Pas besoin de `/etc/hosts`
- Fonctionne immédiatement

### Preview (Vercel)

**URL générée** :
```
https://college-x-abc123.vercel.app/login?portal=school
```

### Production

**URL générée** :
```
https://college-x.academia-hub.com/login?portal=school
```

## 📊 Logging

### Redirections

Toutes les redirections sont loggées automatiquement :

```ts
{
  tenantId: "uuid",
  tenantSlug: "college-x",
  fromUrl: "https://academia-hub.com/portal",
  toUrl: "https://college-x.academia-hub.com/login",
  method: "subdomain",
  environment: "production",
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

### Accès

Toutes les tentatives d'accès sont loggées :

```ts
{
  path: "/app/dashboard",
  tenantId: "uuid",
  tenantSlug: "college-x",
  reason: "SUCCESS" | "NO_TENANT" | "TENANT_NOT_FOUND",
  ipAddress: "1.2.3.4",
  userAgent: "Mozilla/5.0...",
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

## 🧪 Tests

### Test local

1. Démarrer l'application : `npm run dev`
2. Accéder à `http://localhost:3001/portal`
3. Sélectionner un portail
4. Rechercher une école
5. Vérifier la redirection avec `?tenant=...`

### Test production

1. Déployer sur Vercel
2. Accéder à `https://academia-hub.com/portal`
3. Sélectionner un portail
4. Rechercher une école
5. Vérifier la redirection vers sous-domaine

## 🚨 Dépannage

### Problème : Redirection ne fonctionne pas

**Vérifier** :
- ✅ `NEXT_PUBLIC_BASE_DOMAIN` est défini
- ✅ `NEXT_PUBLIC_APP_URL` est défini
- ✅ Le tenant existe dans la base de données
- ✅ Le tenant est actif

### Problème : Accès refusé en local

**Solution** :
- Utiliser le paramètre `?tenant=...` dans l'URL
- Ou configurer le header `X-Tenant-Subdomain` en développement

### Problème : Logging ne fonctionne pas

**Vérifier** :
- ✅ L'endpoint `/api/portal/redirect-log` existe
- ✅ L'endpoint backend `/portal/redirect-log` existe
- ✅ Les erreurs ne bloquent pas la redirection (comportement attendu)

## 📝 Migration

### Depuis l'ancien système

L'ancienne fonction `getTenantRedirectUrl` de `urls.ts` est toujours disponible mais dépréciée. Elle utilise maintenant la nouvelle implémentation.

**Migration** :
```ts
// ❌ Ancien
import { getTenantRedirectUrl } from '@/lib/utils/urls';
const url = getTenantRedirectUrl('college-x', '/login');

// ✅ Nouveau
import { getTenantRedirectUrl } from '@/lib/utils/tenant-redirect';
const url = getTenantRedirectUrl({
  tenantSlug: 'college-x',
  path: '/login',
});
```

## 🎯 Prochaines étapes

- [ ] Ajouter analytics détaillés
- [ ] Implémenter rate limiting sur les redirections
- [ ] Ajouter cache pour les résolutions tenant
- [ ] Optimiser les performances du middleware

## 📚 Documentation

- [Documentation détaillée](./src/lib/utils/tenant-redirect.md)
- [Configuration multi-tenant](./MULTI-TENANT-CONFIG.md)
- [Architecture](./ARCHITECTURE.md)
