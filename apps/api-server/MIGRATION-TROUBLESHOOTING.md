# 🔧 Dépannage Migration - Connexion Supabase

## ❌ Erreur Détectée

```
Error: P1001: Can't reach database server at `db.ankbtgwlofidxtafdueu.supabase.co:5432`
```

## 🔍 Causes Possibles

### 1. Serveur Supabase Non Accessible

**Vérifications**:
- ✅ Le projet Supabase est actif dans le Dashboard
- ✅ Le projet n'est pas en pause
- ✅ La région du projet est correcte

**Solution**:
1. Accédez au Dashboard Supabase: https://app.supabase.com
2. Vérifiez que le projet est actif
3. Si le projet est en pause, réactivez-le

### 2. Credentials Incorrects

**Vérifications**:
- ✅ Le mot de passe dans DATABASE_URL est correct
- ✅ Le mot de passe est encodé en URL (`%40` pour `@`, `%21` pour `!`)
- ✅ L'utilisateur est `postgres`

**Solution**:
1. Allez dans Supabase Dashboard > Settings > Database
2. Récupérez le mot de passe de la base de données
3. Mettez à jour `.env` avec le bon mot de passe (encodé en URL)

### 3. Firewall / Réseau

**Vérifications**:
- ✅ Votre IP n'est pas bloquée
- ✅ Le port 5432 est accessible
- ✅ Aucun VPN/firewall ne bloque la connexion

**Solution**:
1. Vérifiez les paramètres de sécurité réseau dans Supabase
2. Ajoutez votre IP aux IPs autorisées si nécessaire
3. Testez depuis un autre réseau

### 4. Format de l'URL

**Format attendu**:
```
postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

**Vérifications**:
- ✅ Format `postgresql://` (pas `postgres://`)
- ✅ Port `5432` (direct connection)
- ✅ Hostname correct: `db.ankbtgwlofidxtafdueu.supabase.co`

## 🚀 Solutions

### Solution 1: Vérifier les Credentials

```bash
# Dans Supabase Dashboard > Settings > Database
# Copiez le "Connection string" (URI)
# Format: postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres

# Pour DIRECT_URL, utilisez le port 5432:
# postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### Solution 2: Tester la Connexion avec psql

```bash
# Installer psql si nécessaire
# Tester la connexion directement
psql "postgresql://postgres:PASSWORD@db.ankbtgwlofidxtafdueu.supabase.co:5432/postgres"
```

### Solution 3: Utiliser Connection Pooling (Alternative)

Si le port 5432 est bloqué, vous pouvez utiliser le pooler (port 6543) pour les requêtes, mais **PAS pour les migrations**.

**Pour les migrations**, vous DEVEZ utiliser le port 5432 (direct connection).

## 📋 Checklist de Vérification

- [ ] Projet Supabase actif dans le Dashboard
- [ ] Credentials DATABASE_URL corrects dans `.env`
- [ ] Credentials DIRECT_URL corrects dans `.env`
- [ ] Mot de passe encodé en URL (`%40` pour `@`, etc.)
- [ ] Port 5432 accessible depuis votre réseau
- [ ] Format de l'URL correct (`postgresql://...`)

## 🔄 Une Fois la Connexion Résolue

```bash
cd apps/api-server
npx prisma migrate dev --name init_academia_hub --schema=prisma/schema.prisma
```

---

**Note**: La migration ne peut pas être créée tant que la connexion à Supabase n'est pas fonctionnelle.
