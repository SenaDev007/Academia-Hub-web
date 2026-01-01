// Fonction utilitaire pour formater le rang avec gestion du sexe et ex-aequo
export const formatRang = (rang: number, sexe: string, moyenne?: number, allStudents?: any[]) => {
  // Vérifier s'il y a des ex-aequo si les données sont fournies
  let isExAequo = false;
  if (moyenne !== undefined && allStudents) {
    const studentsWithSameMoyenne = allStudents.filter(s => s.moyenne === moyenne);
    isExAequo = studentsWithSameMoyenne.length > 1;
  }
  
  let suffix = '';
  if (rang === 1) {
    suffix = sexe === 'F' ? 'ère' : 'er';
  } else {
    suffix = 'ème';
  }
  
  const baseRang = `${rang}${suffix}`;
  return isExAequo ? `${baseRang} ex-æquo` : baseRang;
};