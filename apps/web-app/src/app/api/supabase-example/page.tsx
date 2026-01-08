/**
 * Exemple d'utilisation de Supabase dans une page Next.js
 * 
 * Cette page démontre comment utiliser Supabase côté serveur
 * pour récupérer des données depuis la base de données.
 */

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function SupabaseExamplePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Exemple: Récupérer des données depuis une table
  // Remplacez 'todos' par le nom de votre table
  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .limit(10);

  if (error) {
    console.error('Error fetching todos:', error);
  }

  // Exemple: Récupérer l'utilisateur actuel
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Exemple Supabase</h1>
      
      {user && (
        <div className="mb-6 p-4 bg-green-100 rounded-lg">
          <p className="font-semibold">Utilisateur connecté:</p>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Todos</h2>
        {todos && todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo: any) => (
              <li key={todo.id} className="p-3 bg-gray-100 rounded">
                {JSON.stringify(todo)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Aucun todo trouvé. Créez une table 'todos' dans Supabase pour voir des données.</p>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Cette page est un exemple. Remplacez 'todos' par le nom de votre table
          et adaptez les requêtes selon vos besoins.
        </p>
      </div>
    </div>
  );
}

