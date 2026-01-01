// Script de vérification de la base de données academia-hub.db
// Ce script vérifie que la table exam_grades est bien créée dans la base de données principale

console.log('🔍 Vérification de la base de données academia-hub.db');

// Fonction pour vérifier la structure de la table exam_grades
async function verifyExamGradesTable() {
  try {
    console.log('📋 Vérification de la table exam_grades...');
    
    // Vérifier que la table existe
    const tableInfo = await window.electronAPI.database.executeQuery(`
      PRAGMA table_info(exam_grades)
    `);
    
    if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Table exam_grades trouvée dans academia-hub.db');
      console.log('📊 Structure de la table:', tableInfo);
      
      // Vérifier les colonnes attendues
      const expectedColumns = [
        'id', 'studentId', 'academicYearId', 'quarterId', 'level', 
        'classId', 'subjectId', 'evaluationType', 'notes', 
        'moyenne', 'rang', 'appreciation', 'createdAt', 'updatedAt'
      ];
      
      const actualColumns = tableInfo.map(col => col.name);
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ Toutes les colonnes attendues sont présentes');
      } else {
        console.log('❌ Colonnes manquantes:', missingColumns);
      }
      
      return true;
    } else {
      console.log('❌ Table exam_grades non trouvée dans academia-hub.db');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la table:', error);
    return false;
  }
}

// Fonction pour vérifier les tables liées
async function verifyRelatedTables() {
  try {
    console.log('🔗 Vérification des tables liées...');
    
    const tables = ['students', 'classes', 'subjects'];
    const results = {};
    
    for (const table of tables) {
      try {
        const result = await window.electronAPI.database.executeQuery(`
          SELECT COUNT(*) as count FROM ${table}
        `);
        results[table] = result[0]?.count || 0;
        console.log(`✅ Table ${table}: ${results[table]} enregistrements`);
      } catch (error) {
        console.log(`❌ Table ${table} non trouvée ou erreur:`, error.message);
        results[table] = -1;
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des tables liées:', error);
    return {};
  }
}

// Fonction pour tester l'insertion d'une note de test
async function testInsertGrade() {
  try {
    console.log('🧪 Test d\'insertion d\'une note de test...');
    
    const testId = `test-${Date.now()}`;
    const testData = {
      id: testId,
      studentId: 'student-1',
      academicYearId: 'academic-year-2025-2026',
      quarterId: 'quarter-1',
      level: '1er_cycle',
      classId: 'class-1',
      subjectId: 'subject-1',
      evaluationType: 'ie1',
      notes: JSON.stringify({ ie1: '15.5' }),
      moyenne: 15.5,
      rang: 1,
      appreciation: 'Test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const insertQuery = `
      INSERT INTO exam_grades 
      (id, studentId, academicYearId, quarterId, level, classId, subjectId, evaluationType, notes, moyenne, rang, appreciation, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await window.electronAPI.database.executeQuery(insertQuery, [
      testData.id,
      testData.studentId,
      testData.academicYearId,
      testData.quarterId,
      testData.level,
      testData.classId,
      testData.subjectId,
      testData.evaluationType,
      testData.notes,
      testData.moyenne,
      testData.rang,
      testData.appreciation,
      testData.createdAt,
      testData.updatedAt
    ]);
    
    console.log('✅ Note de test insérée avec succès');
    
    // Vérifier l'insertion
    const selectResult = await window.electronAPI.database.executeQuery(`
      SELECT * FROM exam_grades WHERE id = ?
    `, [testId]);
    
    if (selectResult && selectResult.length > 0) {
      console.log('✅ Note de test récupérée:', selectResult[0]);
      
      // Nettoyer la note de test
      await window.electronAPI.database.executeQuery(`
        DELETE FROM exam_grades WHERE id = ?
      `, [testId]);
      
      console.log('🧹 Note de test supprimée');
      return true;
    } else {
      console.log('❌ Impossible de récupérer la note de test');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test d\'insertion:', error);
    return false;
  }
}

// Fonction principale de vérification
async function verifyDatabase() {
  console.log('🚀 Démarrage de la vérification de la base de données...');
  
  // Vérification 1: Structure de la table
  const tableExists = await verifyExamGradesTable();
  
  // Vérification 2: Tables liées
  const relatedTables = await verifyRelatedTables();
  
  // Vérification 3: Test d'insertion
  const insertTest = await testInsertGrade();
  
  // Résumé
  console.log('\n📊 RÉSUMÉ DE LA VÉRIFICATION:');
  console.log(`✅ Table exam_grades: ${tableExists ? 'OK' : 'ERREUR'}`);
  console.log(`✅ Tables liées: ${Object.keys(relatedTables).length > 0 ? 'OK' : 'ERREUR'}`);
  console.log(`✅ Test d'insertion: ${insertTest ? 'OK' : 'ERREUR'}`);
  
  if (tableExists && insertTest) {
    console.log('🎉 Base de données academia-hub.db correctement configurée !');
  } else {
    console.log('⚠️ Problèmes détectés dans la configuration de la base de données');
  }
  
  return {
    tableExists,
    relatedTables,
    insertTest
  };
}

// Exporter les fonctions pour utilisation manuelle
window.verifyExamDatabase = {
  verify: verifyDatabase,
  table: verifyExamGradesTable,
  related: verifyRelatedTables,
  test: testInsertGrade
};

console.log('💡 Utilisez window.verifyExamDatabase.verify() pour exécuter la vérification complète');
