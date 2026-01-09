/**
 * PatronatCandidatesPage Component
 */

'use client';

import { useState, useEffect } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import { cn } from '@/lib/utils';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  school: string;
  center: string;
  tableNumber: string;
  exam: string;
  status: string;
}

export default function PatronatCandidatesPage({ tenantId }: { tenantId: string }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    exam: '',
    school: '',
    center: '',
  });

  useEffect(() => {
    // TODO: Charger depuis l'API avec filtres
    setCandidates([
      { id: '1', firstName: 'Jean', lastName: 'Dupont', matricule: 'CEP2024001', school: 'École Les Pionniers', center: 'Centre A', tableNumber: '12', exam: 'CEP 2024', status: 'REGISTERED' },
      { id: '2', firstName: 'Marie', lastName: 'Martin', matricule: 'CEP2024002', school: 'Collège Excellence', center: 'Centre B', tableNumber: '25', exam: 'CEP 2024', status: 'CONFIRMED' },
    ]);
    setLoading(false);
  }, [tenantId, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Candidats</h1>
        <p className="text-gray-600 mt-1">Gérez les candidats aux examens</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Examen</label>
            <select
              value={filters.exam}
              onChange={(e) => setFilters({ ...filters, exam: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Tous les examens</option>
              <option value="cep">CEP 2024</option>
              <option value="bepc">BEPC 2024</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">École</label>
            <select
              value={filters.school}
              onChange={(e) => setFilters({ ...filters, school: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Toutes les écoles</option>
              <option value="1">École Les Pionniers</option>
              <option value="2">Collège Excellence</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Centre</label>
            <select
              value={filters.center}
              onChange={(e) => setFilters({ ...filters, center: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Tous les centres</option>
              <option value="a">Centre A</option>
              <option value="b">Centre B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">École</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Centre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Table</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Aucun candidat</td></tr>
              ) : (
                candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {candidate.firstName} {candidate.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.matricule}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.school}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.center}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{candidate.tableNumber}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

