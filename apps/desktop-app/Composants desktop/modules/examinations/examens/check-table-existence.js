// Script de vérification de l'existence de la table exam_grades dans academia-hub.db
// À exécuter dans la console du navigateur de l'application
// Base de données: C:\Users\HP\AppData\Roaming\academia-hub\academia-hub.db

console.log('🔍 Vérification de l\'existence de la table exam_grades dans academia-hub.db');

// Fonction pour vérifier l'existence de la table
async function checkTableExistence() {
  try {
    console.log('📋 Vérification de l\'existence de la table exam_grades...');
    
    // Vérifier que l'API database est disponible
    if (!window.electronAPI || !window.electronAPI.database) {
      console.error('❌ API database non disponible');
      return false;
    }
    
    console.log('✅ API database disponible');
    
    // Vérifier l'existence de la table
    const tableInfo = await window.electronAPI.database.executeQuery(`
      PRAGMA table_info(exam_grades)
    `);
    
    if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table exam_grades trouvée !');
      console.log('📊 Informations sur la table:');
      console.table(tableInfo);
      
      // Vérifier le nombre d'enregistrements
      const countResult = await window.electronAPI.database.executeQuery(`
        SELECT COUNT(*) as count FROM exam_grades
      `);
      
      const recordCount = countResult[0]?.count || 0;
      console.log(`📈 Nombre d'enregistrements dans exam_grades: ${recordCount}`);
      
      return {
        exists: true,
        columns: tableInfo,
        recordCount: recordCount
      };
    } else {
      console.log('❌ Table exam_grades non trouvée');
      return {
        exists: false,
        columns: [],
        recordCount: 0
      };
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return {
      exists: false,
      error: error.message,
      columns: [],
      recordCount: 0
    };
  }
}

// Fonction pour lister toutes les tables de la base de données
async function listAllTables() {
  try {
    console.log('📋 Liste de toutes les tables dans academia-hub.db...');
    
    const tables = await window.electronAPI.database.executeQuery(`
      SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
    `);
    
    console.log('📊 Tables trouvées:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name}`);
    });
    
    // Vérifier si exam_grades est dans la liste
    const examGradesExists = tables.some(table => table.name === 'exam_grades');
    console.log(`\n🔍 Table exam_grades présente: ${examGradesExists ? 'OUI' : 'NON'}`);
    
    return {
      tables: tables.map(t => t.name),
      examGradesExists
    };
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tables:', error);
    return {
      tables: [],
      examGradesExists: false,
      error: error.message
    };
  }
}

// Fonction pour vérifier la structure de la table exam_grades
async function checkTableStructure() {
  try {
    console.log('🔧 Vérification de la structure de la table exam_grades...');
    
    const columns = await window.electronAPI.database.executeQuery(`
      PRAGMA table_info(exam_grades)
    `);
    
    if (columns && columns.length > 0) {
      console.log('✅ Structure de la table exam_grades:');
      console.table(columns);
      
      // Vérifier les colonnes attendues
      const expectedColumns = [
        'id', 'studentId', 'academicYearId', 'quarterId', 'level', 
        'classId', 'subjectId', 'evaluationType', 'notes', 
        'moyenne', 'rang', 'appreciation', 'createdAt', 'updatedAt'
      ];
      
      const actualColumns = columns.map(col => col.name);
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
      
      console.log('\n📋 Analyse des colonnes:');
      console.log(`✅ Colonnes attendues présentes: ${expectedColumns.length - missingColumns.length}/${expectedColumns.length}`);
      
      if (missingColumns.length > 0) {
        console.log(`❌ Colonnes manquantes: ${missingColumns.join(', ')}`);
      }
      
      if (extraColumns.length > 0) {
        console.log(`⚠️ Colonnes supplémentaires: ${extraColumns.join(', ')}`);
      }
      
      return {
        columns: actualColumns,
        missingColumns,
        extraColumns,
        isValid: missingColumns.length === 0
      };
    } else {
      console.log('❌ Impossible de récupérer la structure de la table');
      return {
        columns: [],
        missingColumns: [],
        extraColumns: [],
        isValid: false
      };
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la structure:', error);
    return {
      columns: [],
      missingColumns: [],
      extraColumns: [],
      isValid: false,
      error: error.message
    };
  }
}

// Fonction pour tester l'insertion d'une note de test
async function testTableFunctionality() {
  try {
    console.log('🧪 Test de fonctionnalité de la table exam_grades...');
    
    const testId = `test-${Date.now()}`;
    const testData = {
      id: testId,
      studentId: 'student-test',
      academicYearId: 'academic-year-test',
      quarterId: 'quarter-test',
      level: 'test-level',
      classId: 'class-test',
      subjectId: 'subject-test',
      evaluationType: 'test-eval',
      notes: JSON.stringify({ test: '15.5' }),
      moyenne: 15.5,
      rang: 1,
      appreciation: 'Test de fonctionnalité',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Test d'insertion
    console.log('📝 Test d\'insertion...');
    await window.electronAPI.database.executeQuery(`
      INSERT INTO exam_grades 
      (id, studentId, academicYearId, quarterId, level, classId, subjectId, evaluationType, notes, moyenne, rang, appreciation, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      testData.id, testData.studentId, testData.academicYearId, testData.quarterId,
      testData.level, testData.classId, testData.subjectId, testData.evaluationType,
      testData.notes, testData.moyenne, testData.rang, testData.appreciation,
      testData.createdAt, testData.updatedAt
    ]);
    
    console.log('✅ Insertion réussie');
    
    // Test de récupération
    console.log('📖 Test de récupération...');
    const selectResult = await window.electronAPI.database.executeQuery(`
      SELECT * FROM exam_grades WHERE id = ?
    `, [testId]);
    
    if (selectResult && selectResult.length > 0) {
      console.log('✅ Récupération réussie:', selectResult[0]);
    } else {
      console.log('❌ Échec de la récupération');
      return false;
    }
    
    // Test de mise à jour
    console.log('🔄 Test de mise à jour...');
    await window.electronAPI.database.executeQuery(`
      UPDATE exam_grades SET moyenne = ?, updatedAt = ? WHERE id = ?
    `, [16.0, new Date().toISOString(), testId]);
    
    console.log('✅ Mise à jour réussie');
    
    // Test de suppression
    console.log('🗑️ Test de suppression...');
    await window.electronAPI.database.executeQuery(`
      DELETE FROM exam_grades WHERE id = ?
    `, [testId]);
    
    console.log('✅ Suppression réussie');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de fonctionnalité:', error);
    return false;
  }
}

// Fonction principale de vérification complète
async function fullVerification() {
  console.log('🚀 DÉMARRAGE DE LA VÉRIFICATION COMPLÈTE');
  console.log('=' .repeat(50));
  
  // 1. Vérifier l'existence de la table
  console.log('\n1️⃣ VÉRIFICATION DE L\'EXISTENCE');
  const existence = await checkTableExistence();
  
  // 2. Lister toutes les tables
  console.log('\n2️⃣ LISTE DE TOUTES LES TABLES');
  const allTables = await listAllTables();
  
  // 3. Vérifier la structure
  console.log('\n3️⃣ VÉRIFICATION DE LA STRUCTURE');
  const structure = await checkTableStructure();
  
  // 4. Tester la fonctionnalité
  console.log('\n4️⃣ TEST DE FONCTIONNALITÉ');
  const functionality = await testTableFunctionality();
  
  // Résumé final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
  console.log('=' .repeat(50));
  
  console.log(`✅ Table exam_grades existe: ${existence.exists ? 'OUI' : 'NON'}`);
  console.log(`✅ Table dans la liste: ${allTables.examGradesExists ? 'OUI' : 'NON'}`);
  console.log(`✅ Structure valide: ${structure.isValid ? 'OUI' : 'NON'}`);
  console.log(`✅ Fonctionnalité: ${functionality ? 'OUI' : 'NON'}`);
  
  if (existence.exists && allTables.examGradesExists && structure.isValid && functionality) {
    console.log('\n🎉 SUCCÈS: La table exam_grades est correctement configurée dans academia-hub.db !');
  } else {
    console.log('\n⚠️ PROBLÈMES DÉTECTÉS: La table exam_grades nécessite une attention particulière.');
  }
  
  return {
    existence,
    allTables,
    structure,
    functionality,
    success: existence.exists && allTables.examGradesExists && structure.isValid && functionality
  };
}

// Exporter les fonctions
window.checkExamGradesTable = {
  full: fullVerification,
  existence: checkTableExistence,
  listTables: listAllTables,
  structure: checkTableStructure,
  test: testTableFunctionality
};

console.log('💡 Utilisez window.checkExamGradesTable.full() pour une vérification complète');
console.log('💡 Ou utilisez les fonctions individuelles: existence, listTables, structure, test');
