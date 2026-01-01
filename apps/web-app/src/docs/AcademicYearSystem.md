# Système de Gestion des Années Scolaires Dynamiques

## Vue d'ensemble

Le système d'années scolaires dynamiques permet de gérer automatiquement les années scolaires dans tous les modules de l'application. Il calcule automatiquement l'année scolaire actuelle basée sur la date (septembre à juillet) et fournit des outils pour la gestion des données par année scolaire.

## Fonctionnalités

- ✅ **Calcul automatique** de l'année scolaire actuelle
- ✅ **Persistance** des préférences par module
- ✅ **Composants réutilisables** pour l'interface
- ✅ **Hooks personnalisés** pour la gestion d'état
- ✅ **Fonctions utilitaires** pour la validation des dates
- ✅ **Support multi-années** (5 ans passés, 2 ans futurs)

## Architecture

### 1. Service Central (`AcademicYearService.ts`)

```typescript
import { academicYearService } from '../services/AcademicYearService';

// Obtenir l'année scolaire actuelle
const currentYear = academicYearService.getCurrentAcademicYear();

// Obtenir toutes les années scolaires
const allYears = academicYearService.getAllAcademicYears();

// Vérifier si une date est dans une année scolaire
const isInYear = academicYearService.isDateInAcademicYear(date, yearId);
```

### 2. Hook Principal (`useAcademicYear`)

```typescript
import { useAcademicYear } from '../services/AcademicYearService';

const MyComponent = () => {
  const { 
    academicYears, 
    currentAcademicYear, 
    loading,
    getAcademicYearOptions 
  } = useAcademicYear();
  
  // Utilisation...
};
```

### 3. Hook d'État (`useAcademicYearState`)

```typescript
import { useAcademicYearState } from '../hooks/useAcademicYearState';

const MyModule = () => {
  const { 
    selectedAcademicYear, 
    setSelectedAcademicYear 
  } = useAcademicYearState('moduleName');
  
  // L'état est automatiquement persisté dans localStorage
};
```

## Composants Réutilisables

### 1. Sélecteur d'Année Scolaire

```tsx
import AcademicYearSelector from '../components/common/AcademicYearSelector';

<AcademicYearSelector
  value={selectedYear}
  onChange={setSelectedYear}
  className="w-full max-w-xs"
  showCurrentLabel={true}
  placeholder="Sélectionner une année"
/>
```

### 2. Affichage de l'Année Actuelle

```tsx
import CurrentAcademicYearDisplay from '../components/common/CurrentAcademicYearDisplay';

// Variant compact
<CurrentAcademicYearDisplay variant="compact" />

// Variant détaillé
<CurrentAcademicYearDisplay 
  variant="detailed" 
  showPeriod={true}
  showIcon={true}
/>
```

## Utilisation dans les Modules

### Module Students

```tsx
import { useAcademicYearState } from '../hooks/useAcademicYearState';

const StudentsModule = () => {
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('students');
  
  // Filtrer les étudiants par année scolaire
  const studentsForYear = students.filter(student => 
    student.academicYearId === selectedAcademicYear
  );
  
  return (
    <div>
      <AcademicYearSelector
        value={selectedAcademicYear}
        onChange={setSelectedAcademicYear}
      />
      {/* Contenu du module */}
    </div>
  );
};
```

### Module HR

```tsx
const HRModule = () => {
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('hr');
  
  // Filtrer les employés par année scolaire
  const employeesForYear = employees.filter(employee => 
    employee.academicYearId === selectedAcademicYear
  );
  
  return (
    <div>
      <CurrentAcademicYearDisplay variant="compact" />
      <AcademicYearSelector
        value={selectedAcademicYear}
        onChange={setSelectedAcademicYear}
      />
      {/* Contenu du module */}
    </div>
  );
};
```

### Module Finance

```tsx
const FinanceModule = () => {
  const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('finance');
  
  // Filtrer les paiements par année scolaire
  const paymentsForYear = payments.filter(payment => 
    payment.academicYearId === selectedAcademicYear
  );
  
  return (
    <div>
      <CurrentAcademicYearDisplay variant="detailed" />
      <AcademicYearSelector
        value={selectedAcademicYear}
        onChange={setSelectedAcademicYear}
      />
      {/* Contenu du module */}
    </div>
  );
};
```

## Fonctions Utilitaires

### Validation des Dates

```typescript
import { academicYearService } from '../services/AcademicYearService';

// Vérifier si une date est dans une année scolaire
const isInAcademicYear = academicYearService.isDateInAcademicYear(
  new Date('2025-09-15'), 
  '2025-2026'
);

// Obtenir l'année scolaire pour une date
const academicYear = academicYearService.getAcademicYearForDate(
  new Date('2025-09-15')
);
```

### Filtrage des Données

```typescript
// Filtrer des données par année scolaire
const filterByAcademicYear = (data: any[], academicYearId: string) => {
  return data.filter(item => {
    if (item.academicYearId) {
      return item.academicYearId === academicYearId;
    }
    if (item.date) {
      return academicYearService.isDateInAcademicYear(
        new Date(item.date), 
        academicYearId
      );
    }
    return false;
  });
};
```

## Configuration

### Années Scolaires Disponibles

Le système génère automatiquement :
- **5 années passées** (ex: 2020-2021 à 2024-2025)
- **Année actuelle** (ex: 2025-2026)
- **2 années futures** (ex: 2026-2027, 2027-2028)

### Persistance des Préférences

Chaque module peut avoir sa propre préférence d'année scolaire :
- `academicYear_finance` : Préférence du module Finance
- `academicYear_students` : Préférence du module Students
- `academicYear_hr` : Préférence du module HR

## Migration des Modules Existants

### 1. Remplacer les états statiques

```typescript
// Avant
const [selectedYear, setSelectedYear] = useState('2025-2026');

// Après
const { selectedAcademicYear, setSelectedAcademicYear } = useAcademicYearState('moduleName');
```

### 2. Remplacer les sélecteurs statiques

```tsx
// Avant
<select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
  <option value="2025-2026">2025-2026</option>
  <option value="2024-2025">2024-2025</option>
</select>

// Après
<AcademicYearSelector
  value={selectedAcademicYear}
  onChange={setSelectedAcademicYear}
/>
```

### 3. Utiliser les fonctions utilitaires

```typescript
// Avant
const isCurrentYear = selectedYear === '2025-2026';

// Après
const isCurrentYear = academicYearService.getCurrentAcademicYear()?.id === selectedAcademicYear;
```

## Avantages

1. **Automatique** : Plus besoin de mettre à jour manuellement les années
2. **Cohérent** : Même logique dans tous les modules
3. **Persistant** : Les préférences sont sauvegardées
4. **Flexible** : Facilement personnalisable
5. **Maintenable** : Code centralisé et réutilisable

## Support

Pour toute question ou problème avec le système d'années scolaires, consultez :
- Les exemples dans `src/examples/AcademicYearUsageExamples.tsx`
- Les tests dans `src/tests/AcademicYearService.test.ts`
- La documentation du service dans `src/services/AcademicYearService.ts`
