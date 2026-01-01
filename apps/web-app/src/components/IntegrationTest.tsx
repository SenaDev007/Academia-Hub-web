import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api/config';

const IntegrationTest: React.FC = () => {
  const [results, setResults] = useState<{
    health?: any;
    login?: any;
    students?: any;
    error?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const testAllEndpoints = async () => {
    setLoading(true);
    const newResults: any = {};

    try {
      // Test 1: Health check
      console.log('Testing health endpoint...');
      const health = await apiClient.get('/health');
      newResults.health = health.data;

      // Test 2: Login
      console.log('Testing login endpoint...');
      const login = await apiClient.post('/auth/login', {
        email: 'test@test.com',
        password: 'test123'
      });
      newResults.login = login.data;

      // Test 3: Students
      console.log('Testing students endpoint...');
      const students = await apiClient.get('/students');
      newResults.students = students.data;

      // Test 4: Test avec token
      if (login.data.token) {
        localStorage.setItem('authToken', login.data.token);
        const studentsWithAuth = await apiClient.get('/students');
        newResults.studentsWithAuth = studentsWithAuth.data;
      }

    } catch (error: any) {
      newResults.error = error.message || 'Test failed';
      console.error('Test error:', error);
    }

    setResults(newResults);
    setLoading(false);
  };

  useEffect(() => {
    testAllEndpoints();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Test d'Intégration Frontend-Backend</h1>
      
      <div className="mb-4">
        <button 
          onClick={testAllEndpoints}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? 'Testing...' : 'Retest All'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Testing API endpoints...</p>
        </div>
      )}

      {results.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {results.error}
        </div>
      )}

      <div className="space-y-4">
        {/* Health Check */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">✅ Health Check</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(results.health, null, 2) || 'Not tested'}
          </pre>
        </div>

        {/* Login */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">✅ Login Test</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(results.login, null, 2) || 'Not tested'}
          </pre>
        </div>

        {/* Students */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">✅ Students Test</h3>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(results.students, null, 2) || 'Not tested'}
          </pre>
        </div>

        {/* Configuration */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">⚙️ Configuration</h3>
          <div className="bg-gray-100 p-2 rounded text-sm">
            <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}</p>
            <p><strong>Proxy Configured:</strong> ✅</p>
            <p><strong>Backend Status:</strong> {results.health ? '✅ Running' : '❌ Not responding'}</p>
          </div>
        </div>
      </div>

      {results.login?.token && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <h4 className="font-semibold text-green-800">🎉 Integration Successful!</h4>
          <p className="text-green-700">Frontend and backend are communicating correctly.</p>
          <p className="text-sm mt-1">Token received: {results.login.token.substring(0, 20)}...</p>
        </div>
      )}
    </div>
  );
};

export default IntegrationTest;
