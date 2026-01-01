// Script de test pour vérifier la sauvegarde des notes dans academia-hub.db
// Ce script peut être exécuté dans la console du navigateur pour tester la persistance

console.log('🧪 Test de sauvegarde des notes dans academia-hub.db');

// Fonction pour tester la sauvegarde
async function testSaveGrades() {
  try {
    console.log('📝 Test de sauvegarde...');
    
    // Données de test
    const testData = {
      academicYearId: 'academic-year-2025-2026',
      quarterId: '370cb878-1f52-4e7a-962a-db543c1083b2',
      level: '1er_cycle',
      classId: 'class-1',
      subjectId: 'subject-1',
      evaluationType: 'ie1',
      studentsGrades: [
        {
          studentId: 'student-1',
          notes: { ie1: '15.5' },
          moyenne: 15.5,
          rang: 1,
          appreciation: 'Très bien'
        },
        {
          studentId: 'student-2',
          notes: { ie1: '14.0' },
          moyenne: 14.0,
          rang: 2,
          appreciation: 'Bien'
        }
      ]
    };

    // Appeler l'API de sauvegarde
    const response = await window.electronAPI.database.executeQuery(`
      INSERT OR REPLACE INTO exam_grades 
      (id, studentId, academicYearId, quarterId, level, classId, subjectId, evaluationType, notes, moyenne, rang, appreciation, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'test-student-1_2025-2026_q1_1er_cycle_class-1_subject-1_ie1',
      'student-1',
      'academic-year-2025-2026',
      '370cb878-1f52-4e7a-962a-db543c1083b2',
      '1er_cycle',
      'class-1',
      'subject-1',
      'ie1',
      JSON.stringify({ ie1: '15.5' }),
      15.5,
      1,
      'Très bien',
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    console.log('✅ Test de sauvegarde réussi:', response);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de sauvegarde:', error);
    return false;
  }
}

// Fonction pour tester la récupération
async function testGetGrades() {
  try {
    console.log('📚 Test de récupération...');
    
    const result = await window.electronAPI.database.executeQuery(`
      SELECT * FROM exam_grades 
      WHERE academicYearId = ? AND quarterId = ? AND level = ? AND classId = ? AND subjectId = ?
    `, [
      'academic-year-2025-2026',
      '370cb878-1f52-4e7a-962a-db543c1083b2',
      '1er_cycle',
      'class-1',
      'subject-1'
    ]);

    console.log('✅ Test de récupération réussi:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du test de récupération:', error);
    return null;
  }
}

// Fonction pour vérifier la structure de la table
async function testTableStructure() {
  try {
    console.log('🔍 Vérification de la structure de la table...');
    
    const result = await window.electronAPI.database.executeQuery(`
      PRAGMA table_info(exam_grades)
    `);

    console.log('✅ Structure de la table exam_grades:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la structure:', error);
    return null;
  }
}

// Exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests...');
  
  // Test 1: Vérifier la structure de la table
  await testTableStructure();
  
  // Test 2: Sauvegarder des notes
  const saveResult = await testSaveGrades();
  
  if (saveResult) {
    // Test 3: Récupérer les notes
    await testGetGrades();
  }
  
  console.log('🏁 Tests terminés');
}

// Exporter les fonctions pour utilisation manuelle
window.testExamGrades = {
  save: testSaveGrades,
  get: testGetGrades,
  structure: testTableStructure,
  runAll: runAllTests
};

console.log('💡 Utilisez window.testExamGrades.runAll() pour exécuter tous les tests');
