# Migration: 20250101000000_init_complete_schema

## 📋 Description

Migration initiale complète pour Academia Hub - Tables de base uniquement.

Cette migration crée les tables fondamentales du système :
- Countries (Pays)
- Tenants (Écoles/Établissements)
- Academic Years (Années scolaires)
- School Levels (Niveaux scolaires)
- Academic Tracks (Tracks académiques FR/EN)
- Users (Utilisateurs)

## 📊 Tables Créées

- `countries` - Pays
- `tenants` - Tenants (écoles)
- `academic_years` - Années scolaires
- `school_levels` - Niveaux scolaires (Maternelle, Primaire, Secondaire)
- `academic_tracks` - Tracks académiques (FR, EN)
- `users` - Utilisateurs

## ⚠️  Informations Importantes

- **Destructive** : NON ✅
- **Backup requis** : NON
- **Temps estimé** : 1-2 minutes

## 🔄 Application

```bash
# Vérifier la migration
npx prisma migrate status --schema=prisma/schema.prisma

# Appliquer la migration
npx prisma migrate deploy --schema=prisma/schema.prisma

# En développement
npx prisma migrate dev --schema=prisma/schema.prisma
```

## 📝 Notes

- Cette migration crée uniquement les tables de base.
- Les autres tables seront créées via des migrations supplémentaires.
- Toutes les contraintes FK sont définies.
- Tous les index nécessaires sont créés.

## ✅ Vérification Post-Migration

```sql
-- Vérifier les tables créées
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('countries', 'tenants', 'academic_years', 'school_levels', 'academic_tracks', 'users')
ORDER BY table_name;

-- Vérifier les index
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('countries', 'tenants', 'academic_years', 'school_levels', 'academic_tracks', 'users')
ORDER BY tablename, indexname;
```

