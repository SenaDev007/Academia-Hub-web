# 🔍 Guide de Vérification de la Table exam_grades

## 🎯 Objectif
Vérifier que la table `exam_grades` existe bien dans la base de données `academia-hub.db` située à `C:\Users\HP\AppData\Roaming\academia-hub\academia-hub.db`.

## 🚀 Méthodes de Vérification

### 1. **Vérification Rapide** ⚡
```javascript
// Dans la console du navigateur (F12)
// Copier et coller le contenu de quick-check.js
```

**Résultat attendu :**
```
✅ Table exam_grades trouvée dans academia-hub.db
📊 Nombre d'enregistrements: X
🎉 La table exam_grades est présente et fonctionnelle !
```

### 2. **Vérification Complète** 🔍
```javascript
// Dans la console du navigateur (F12)
// Copier et coller le contenu de check-table-existence.js
// Puis exécuter :
window.checkExamGradesTable.full()
```

**Résultat attendu :**
```
🚀 DÉMARRAGE DE LA VÉRIFICATION COMPLÈTE
==================================================

1️⃣ VÉRIFICATION DE L'EXISTENCE
✅ Table exam_grades trouvée !

2️⃣ LISTE DE TOUTES LES TABLES
📊 Tables trouvées:
1. classes
2. exam_grades
3. students
...

3️⃣ VÉRIFICATION DE LA STRUCTURE
✅ Structure de la table exam_grades:
[Tableau des colonnes]

4️⃣ TEST DE FONCTIONNALITÉ
✅ Insertion réussie
✅ Récupération réussie
✅ Mise à jour réussie
✅ Suppression réussie

==================================================
📊 RÉSUMÉ DE LA VÉRIFICATION
==================================================
✅ Table exam_grades existe: OUI
✅ Table dans la liste: OUI
✅ Structure valide: OUI
✅ Fonctionnalité: OUI

🎉 SUCCÈS: La table exam_grades est correctement configurée dans academia-hub.db !
```

## 🛠️ Dépannage

### Si la table n'existe pas ❌
1. **Redémarrer l'application** pour déclencher la création des tables
2. **Vérifier les logs** dans la console pour des erreurs de création
3. **Vérifier les permissions** sur le dossier `C:\Users\HP\AppData\Roaming\academia-hub`

### Si l'API n'est pas disponible ❌
1. **Vérifier que l'application est en mode Electron** (pas en mode web)
2. **Redémarrer l'application** complètement
3. **Vérifier le preload script** dans `electron/preload.cjs`

### Si la structure est incorrecte ⚠️
1. **Supprimer la table** (si elle existe) :
   ```sql
   DROP TABLE IF EXISTS exam_grades;
   ```
2. **Redémarrer l'application** pour recréer avec la bonne structure

## 📊 Structure Attendue

La table `exam_grades` doit contenir les colonnes suivantes :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | TEXT PRIMARY KEY | Identifiant unique |
| `studentId` | TEXT NOT NULL | ID de l'étudiant |
| `academicYearId` | TEXT NOT NULL | ID de l'année académique |
| `quarterId` | TEXT NOT NULL | ID du trimestre |
| `level` | TEXT NOT NULL | Niveau scolaire |
| `classId` | TEXT NOT NULL | ID de la classe |
| `subjectId` | TEXT NOT NULL | ID de la matière |
| `evaluationType` | TEXT NOT NULL | Type d'évaluation |
| `notes` | TEXT NOT NULL | Notes en JSON |
| `moyenne` | REAL NOT NULL | Moyenne calculée |
| `rang` | INTEGER NOT NULL | Rang de l'étudiant |
| `appreciation` | TEXT | Appréciation |
| `createdAt` | TEXT NOT NULL | Date de création |
| `updatedAt` | TEXT NOT NULL | Date de mise à jour |

## 🔗 Clés Étrangères

- `studentId` → `students(id)`
- `classId` → `classes(id)`
- `subjectId` → `subjects(id)`

## 📝 Notes Importantes

1. **Base de données partagée** : La table est dans la même base que tous les autres modules
2. **Création automatique** : La table est créée au démarrage de l'application
3. **Persistance** : Les données sont sauvegardées de manière permanente
4. **Intégrité** : Les clés étrangères assurent la cohérence des données

## 🧪 Tests de Validation

### Test d'Insertion
```javascript
// Insérer une note de test
await window.electronAPI.database.executeQuery(`
  INSERT INTO exam_grades (id, studentId, academicYearId, quarterId, level, classId, subjectId, evaluationType, notes, moyenne, rang, appreciation, createdAt, updatedAt)
  VALUES ('test-1', 'student-1', 'year-1', 'quarter-1', 'level-1', 'class-1', 'subject-1', 'eval-1', '{"test": "15.5"}', 15.5, 1, 'Test', '2024-01-01', '2024-01-01')
`);
```

### Test de Récupération
```javascript
// Récupérer toutes les notes
const notes = await window.electronAPI.database.executeQuery(`
  SELECT * FROM exam_grades
`);
console.log('Notes trouvées:', notes);
```

### Test de Suppression
```javascript
// Supprimer la note de test
await window.electronAPI.database.executeQuery(`
  DELETE FROM exam_grades WHERE id = 'test-1'
`);
```

---

**💡 Conseil :** Utilisez la vérification rapide pour un contrôle quotidien, et la vérification complète pour un diagnostic approfondi.
