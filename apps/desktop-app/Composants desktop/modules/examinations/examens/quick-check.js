// Vérification rapide de l'existence de la table exam_grades
// Script simple à exécuter dans la console du navigateur
// Base de données: C:\Users\HP\AppData\Roaming\academia-hub\academia-hub.db

console.log('⚡ Vérification rapide de la table exam_grades');

// Fonction de vérification rapide
async function quickCheck() {
  try {
    console.log('🔍 Vérification en cours...');
    
    // Vérifier l'API
    if (!window.electronAPI || !window.electronAPI.database) {
      console.log('❌ API database non disponible');
      return false;
    }
    
    // Vérifier l'existence de la table
    const result = await window.electronAPI.database.executeQuery(`
      SELECT name FROM sqlite_master WHERE type='table' AND name='exam_grades'
    `);
    
    if (result && result.length > 0) {
      console.log('✅ Table exam_grades trouvée dans academia-hub.db');
      
      // Compter les enregistrements
      const count = await window.electronAPI.database.executeQuery(`
        SELECT COUNT(*) as count FROM exam_grades
      `);
      
      console.log(`📊 Nombre d'enregistrements: ${count[0]?.count || 0}`);
      return true;
    } else {
      console.log('❌ Table exam_grades non trouvée dans academia-hub.db');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

// Exécuter la vérification
quickCheck().then(success => {
  if (success) {
    console.log('🎉 La table exam_grades est présente et fonctionnelle !');
  } else {
    console.log('⚠️ La table exam_grades n\'est pas présente ou il y a un problème.');
    console.log('💡 Redémarrez l\'application pour créer la table si elle n\'existe pas.');
  }
});

// Exporter pour utilisation manuelle
window.quickCheckExamGrades = quickCheck;
