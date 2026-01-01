/**
 * Script de test pour l'intégration du module examens avec la base de données
 * Ce script teste la connexion et les opérations CRUD
 */

const { ipcRenderer } = require('electron');

class ExamIntegrationTest {
  constructor() {
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Début des tests d\'intégration du module examens...');
    
    try {
      await this.testDatabaseConnection();
      await this.testStudentsOperations();
      await this.testClassesOperations();
      await this.testSubjectsOperations();
      await this.testExamsOperations();
      await this.testGradesOperations();
      await this.testBulletinsOperations();
      await this.testStatisticsOperations();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
    }
  }

  async testDatabaseConnection() {
    console.log('📊 Test de connexion à la base de données...');
    
    try {
      const result = await ipcRenderer.invoke('db-query', 'SELECT name FROM sqlite_master WHERE type="table"');
      
      if (result.success) {
        const tables = result.data.map(row => row.name);
        const expectedTables = ['students', 'classes', 'subjects', 'exams', 'grades', 'bulletins'];
        const hasRequiredTables = expectedTables.every(table => tables.includes(table));
        
        if (hasRequiredTables) {
          this.testResults.push({ test: 'Database Connection', status: '✅ PASS', details: `Tables trouvées: ${tables.join(', ')}` });
        } else {
          this.testResults.push({ test: 'Database Connection', status: '❌ FAIL', details: 'Tables manquantes' });
        }
      } else {
        this.testResults.push({ test: 'Database Connection', status: '❌ FAIL', details: result.error });
      }
    } catch (error) {
      this.testResults.push({ test: 'Database Connection', status: '❌ FAIL', details: error.message });
    }
  }

  async testStudentsOperations() {
    console.log('👥 Test des opérations sur les étudiants...');
    
    try {
      // Test de récupération des étudiants
      const getResult = await ipcRenderer.invoke('db-query', 'SELECT COUNT(*) as count FROM students');
      
      if (getResult.success) {
        const studentCount = getResult.data[0].count;
        this.testResults.push({ 
          test: 'Students - Get', 
          status: '✅ PASS', 
          details: `${studentCount} étudiants trouvés` 
        });
      } else {
        this.testResults.push({ test: 'Students - Get', status: '❌ FAIL', details: getResult.error });
      }

      // Test d'insertion d'un étudiant de test
      const testStudent = {
        id: 'test-student-' + Date.now(),
        firstName: 'Test',
        lastName: 'Student',
        gender: 'M',
        classId: 'test-class',
        registrationNumber: 'TEST' + Date.now(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const insertResult = await ipcRenderer.invoke('db-insert', 'students', testStudent);
      
      if (insertResult.success) {
        this.testResults.push({ test: 'Students - Insert', status: '✅ PASS', details: 'Étudiant de test créé' });
        
        // Nettoyer l'étudiant de test
        await ipcRenderer.invoke('db-delete', 'students', { id: testStudent.id });
      } else {
        this.testResults.push({ test: 'Students - Insert', status: '❌ FAIL', details: insertResult.error });
      }
    } catch (error) {
      this.testResults.push({ test: 'Students Operations', status: '❌ FAIL', details: error.message });
    }
  }

  async testClassesOperations() {
    console.log('🏫 Test des opérations sur les classes...');
    
    try {
      const result = await ipcRenderer.invoke('db-query', 'SELECT COUNT(*) as count FROM classes');
      
      if (result.success) {
        const classCount = result.data[0].count;
        this.testResults.push({ 
          test: 'Classes - Get', 
          status: '✅ PASS', 
          details: `${classCount} classes trouvées` 
        });
      } else {
        this.testResults.push({ test: 'Classes - Get', status: '❌ FAIL', details: result.error });
      }
    } catch (error) {
      this.testResults.push({ test: 'Classes Operations', status: '❌ FAIL', details: error.message });
    }
  }

  async testSubjectsOperations() {
    console.log('📚 Test des opérations sur les matières...');
    
    try {
      const result = await ipcRenderer.invoke('db-query', 'SELECT COUNT(*) as count FROM subjects');
      
      if (result.success) {
        const subjectCount = result.data[0].count;
        this.testResults.push({ 
          test: 'Subjects - Get', 
          status: '✅ PASS', 
          details: `${subjectCount} matières trouvées` 
        });
      } else {
        this.testResults.push({ test: 'Subjects - Get', status: '❌ FAIL', details: result.error });
      }
    } catch (error) {
      this.testResults.push({ test: 'Subjects Operations', status: '❌ FAIL', details: error.message });
    }
  }

  async testExamsOperations() {
    console.log('📝 Test des opérations sur les examens...');
    
    try {
      const result = await ipcRenderer.invoke('db-query', 'SELECT COUNT(*) as count FROM exams');
      
      if (result.success) {
        const examCount = result.data[0].count;
        this.testResults.push({ 
          test: 'Exams - Get', 
          status: '✅ PASS', 
          details: `${examCount} examens trouvés` 
        });
      } else {
        this.testResults.push({ test: 'Exams - Get', status: '❌ FAIL', details: result.error });
      }
    } catch (error) {
      this.testResults.push({ test: 'Exams Operations', status: '❌ FAIL', details: error.message });
    }
  }

  async testGradesOperations() {
    console.log('📊 Test des opérations sur les notes...');
    
    try {
      const result = await ipcRenderer.invoke('db-query', 'SELECT COUNT(*) as count FROM grades');
      
      if (result.success) {
        const gradeCount = result.data[0].count;
        this.testResults.push({ 
          test: 'Grades - Get', 
          status: '✅ PASS', 
          details: `${gradeCount} notes trouvées` 
        });
      } else {
        this.testResults.push({ test: 'Grades - Get', status: '❌ FAIL', details: result.error });
      }
    } catch (error) {
      this.testResults.push({ test: 'Grades Operations', status: '❌ FAIL', details: error.message });
    }
  }

  async testBulletinsOperations() {
    console.log('📋 Test des opérations sur les bulletins...');
    
    try {
      const result = await ipcRenderer.invoke('db-query', 'SELECT COUNT(*) as count FROM bulletins');
      
      if (result.success) {
        const bulletinCount = result.data[0].count;
        this.testResults.push({ 
          test: 'Bulletins - Get', 
          status: '✅ PASS', 
          details: `${bulletinCount} bulletins trouvés` 
        });
      } else {
        this.testResults.push({ test: 'Bulletins - Get', status: '❌ FAIL', details: result.error });
      }
    } catch (error) {
      this.testResults.push({ test: 'Bulletins Operations', status: '❌ FAIL', details: error.message });
    }
  }

  async testStatisticsOperations() {
    console.log('📈 Test des opérations de statistiques...');
    
    try {
      // Test de calcul de statistiques basiques
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT s.id) as totalStudents,
          AVG(g.score) as averageScore,
          COUNT(CASE WHEN g.score >= 10 THEN 1 END) as successCount,
          COUNT(g.id) as totalGrades
        FROM students s
        LEFT JOIN grades g ON s.id = g.studentId
        WHERE s.status = 'active'
      `;
      
      const result = await ipcRenderer.invoke('db-query', statsQuery);
      
      if (result.success) {
        const stats = result.data[0];
        this.testResults.push({ 
          test: 'Statistics - Calculate', 
          status: '✅ PASS', 
          details: `Élèves: ${stats.totalStudents}, Moyenne: ${stats.averageScore?.toFixed(2) || 'N/A'}` 
        });
      } else {
        this.testResults.push({ test: 'Statistics - Calculate', status: '❌ FAIL', details: result.error });
      }
    } catch (error) {
      this.testResults.push({ test: 'Statistics Operations', status: '❌ FAIL', details: error.message });
    }
  }

  printResults() {
    console.log('\n📊 RÉSULTATS DES TESTS D\'INTÉGRATION');
    console.log('=====================================');
    
    const passed = this.testResults.filter(r => r.status.includes('✅')).length;
    const failed = this.testResults.filter(r => r.status.includes('❌')).length;
    
    this.testResults.forEach(result => {
      console.log(`${result.status} ${result.test}: ${result.details}`);
    });
    
    console.log('\n📈 RÉSUMÉ');
    console.log(`✅ Tests réussis: ${passed}`);
    console.log(`❌ Tests échoués: ${failed}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 Tous les tests sont passés ! Le module examens est prêt à être utilisé.');
    } else {
      console.log('\n⚠️  Certains tests ont échoué. Vérifiez la configuration de la base de données.');
    }
  }
}

// Exécuter les tests si le script est appelé directement
if (typeof window !== 'undefined') {
  const testRunner = new ExamIntegrationTest();
  testRunner.runAllTests();
}

module.exports = ExamIntegrationTest;
