# 💾 Système de Sauvegarde des Notes - Module Examens

## 🎯 Objectif
Toutes les notes saisies dans le module "Examens" sont maintenant sauvegardées de manière persistante dans la base de données `academia-hub.db`.

## 🗄️ Structure de la Base de Données

### Base de Données Principale
- **Fichier**: `C:\Users\HP\AppData\Roaming\academia-hub\academia-hub.db`
- **Utilisée par**: Tous les modules de l'application
- **Moteur**: SQLite via `better-sqlite3`

### Table `exam_grades`
```sql
CREATE TABLE IF NOT EXISTS exam_grades (
  id TEXT PRIMARY KEY,
  studentId TEXT NOT NULL,
  academicYearId TEXT NOT NULL,
  quarterId TEXT NOT NULL,
  level TEXT NOT NULL,
  classId TEXT NOT NULL,
  subjectId TEXT NOT NULL,
  evaluationType TEXT NOT NULL,
  notes TEXT NOT NULL,
  moyenne REAL NOT NULL,
  rang INTEGER NOT NULL,
  appreciation TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (academicYearId) REFERENCES academic_years(id),
  FOREIGN KEY (quarterId) REFERENCES quarters(id),
  FOREIGN KEY (classId) REFERENCES classes(id),
  FOREIGN KEY (subjectId) REFERENCES subjects(id)
);
```

## 🔄 Flux de Sauvegarde

### 1. **Saisie des Notes** 📝
- L'utilisateur saisit les notes dans l'interface
- Les notes sont stockées temporairement dans l'état React (`notes`)

### 2. **Sauvegarde** 💾
- Clic sur "Enregistrer" → `handleSaveNotes()`
- Validation des paramètres requis
- Préparation des données au format `GradeRecord`
- Appel de `apiService.saveGrades()`
- Sauvegarde dans la table `exam_grades` via `INSERT OR REPLACE`

### 3. **Rechargement** 🔄
- Au rafraîchissement de l'application
- `loadExistingNotes()` récupère les notes depuis la BDD
- Parsing des notes JSON
- Mise à jour de l'état React

## 🛠️ Fonctions Clés

### `saveGrades()` - Sauvegarde
```typescript
// Sauvegarde les notes dans exam_grades
INSERT OR REPLACE INTO exam_grades 
(id, studentId, academicYearId, quarterId, level, classId, subjectId, evaluationType, notes, moyenne, rang, appreciation, createdAt, updatedAt)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

### `getExistingGrades()` - Récupération
```typescript
// Récupère les notes existantes
SELECT * FROM exam_grades 
WHERE academicYearId = ? AND quarterId = ? AND level = ? AND classId = ? AND subjectId = ?
```

### `updateGrades()` - Mise à jour
```typescript
// Met à jour les notes existantes
UPDATE exam_grades 
SET notes = ?, moyenne = ?, rang = ?, appreciation = ?, updatedAt = ?
WHERE studentId = ? AND academicYearId = ? AND quarterId = ? AND level = ? AND classId = ? AND subjectId = ? AND evaluationType = ?
```

## 🔧 Configuration

### Base de Données
- **Fichier**: `C:\Users\HP\AppData\Roaming\academia-hub\academia-hub.db`
- **Table**: `exam_grades` (créée dans la base principale)
- **Moteur**: SQLite via `better-sqlite3`
- **Partagée avec**: Tous les autres modules de l'application

### APIs Electron
- **Sauvegarde**: `window.electronAPI.database.executeQuery()`
- **Récupération**: `window.electronAPI.database.executeQuery()`
- **Mise à jour**: `window.electronAPI.database.executeQuery()`

## 🧪 Tests

### Script de Vérification de la Base de Données
```javascript
// Dans la console du navigateur
window.verifyExamDatabase.verify()
```

### Script de Test des Notes
```javascript
// Dans la console du navigateur
window.testExamGrades.runAll()
```

### Tests Disponibles
1. **Vérification de la base**: Vérifie que `exam_grades` existe dans `academia-hub.db`
2. **Structure de la table**: Vérifie toutes les colonnes attendues
3. **Tables liées**: Vérifie `students`, `classes`, `subjects`
4. **Test d'insertion**: Teste l'insertion et récupération d'une note
5. **Sauvegarde**: Teste l'insertion de notes via l'API
6. **Récupération**: Teste la lecture des notes via l'API

## 📊 Données Sauvegardées

### Format des Notes
```json
{
  "ie1": "15.5",
  "ie2": "16.0", 
  "ds1": "14.5",
  "ds2": "17.0"
}
```

### Métadonnées
- **ID unique**: `studentId_academicYearId_quarterId_level_classId_subjectId_evaluationType`
- **Moyenne calculée**: Automatiquement calculée
- **Rang dynamique**: Calculé en temps réel
- **Appréciation**: Texte libre
- **Timestamps**: `createdAt` et `updatedAt`

## 🚨 Gestion d'Erreurs

### Fallbacks
1. **API spécifique non disponible** → Utilise `executeQuery`
2. **API générique non disponible** → Mode simulation
3. **Erreur de sauvegarde** → Affiche un toast d'erreur

### Logs de Debug
```javascript
console.log('💾 Sauvegarde dans la table exam_grades de academia-hub.db');
console.log('📚 Récupération des notes depuis exam_grades');
console.log('💾 Mise à jour des notes dans exam_grades');
```

## ✅ Vérification

### Après Sauvegarde
1. ✅ Modal de succès affiché
2. ✅ Notes visibles après rafraîchissement
3. ✅ Données persistantes dans la BDD
4. ✅ Calculs de moyenne et rang corrects

### Après Rafraîchissement
1. ✅ Notes automatiquement rechargées
2. ✅ Interface mise à jour
3. ✅ État cohérent avec la BDD

## 🔄 Cycle de Vie

```
Saisie → Validation → Sauvegarde → Persistance → Rechargement → Affichage
   ↓         ↓           ↓            ↓           ↓           ↓
Interface → React → API Service → Database → Load → Display
```

## 📝 Notes Importantes

- **Clé primaire composite**: Garantit l'unicité des notes
- **INSERT OR REPLACE**: Évite les doublons
- **JSON des notes**: Permet la flexibilité des évaluations
- **Timestamps**: Suivi des modifications
- **Contraintes FK**: Intégrité référentielle

---

**🎉 Toutes les notes sont maintenant sauvegardées de manière persistante dans `academia-hub.db` !**
