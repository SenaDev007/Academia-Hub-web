import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { authService, studentsService, classesService } from '../services/api';
import { dashboardService } from '../services/api/dashboard';

const ApiTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentName, setStudentName] = useState('');

  // Test hooks
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError, execute: loadDashboard } = useApi(
    () => dashboardService.getDashboardStats(),
    { immediate: false }
  );

  const { data: studentsData, loading: studentsLoading, error: studentsError, execute: loadStudents } = useApi(
    () => studentsService.getStudents(),
    { immediate: false }
  );

  const { data: classesData, loading: classesLoading, error: classesError, execute: loadClasses } = useApi(
    () => classesService.getClasses(),
    { immediate: false }
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login({ email, password });
      alert(`Login successful! Welcome ${response.user.firstName}`);
    } catch (error) {
      alert('Login failed: ' + (error as Error).message);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const student = await studentsService.createStudent({
        firstName: studentName,
        lastName: 'Test',
        classId: 'test-class-id', // Replace with actual class ID
        academicYearId: 'test-year-id' // Replace with actual year ID
      });
      alert(`Student created: ${student.firstName} ${student.lastName}`);
      setStudentName('');
    } catch (error) {
      alert('Failed to create student: ' + (error as Error).message);
    }
  };

  const handleLogout = () => {
    authService.logout();
    alert('Logged out successfully');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Integration Test</h1>
      
      {/* Authentication Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Authentication</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Login
          </button>
          <button type="button" onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded ml-2">
            Logout
          </button>
        </form>
      </div>

      {/* Dashboard Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Dashboard</h2>
        <button 
          onClick={() => loadDashboard()} 
          disabled={dashboardLoading}
          className="bg-green-500 text-white px-4 py-2 rounded mb-2"
        >
          {dashboardLoading ? 'Loading...' : 'Load Dashboard Stats'}
        </button>
        {dashboardError && <p className="text-red-500">Error: {dashboardError.message}</p>}
        {dashboardData && (
          <pre className="bg-gray-100 p-2 rounded text-sm">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        )}
      </div>

      {/* Students Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Students</h2>
        <button 
          onClick={() => loadStudents()} 
          disabled={studentsLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded mb-2"
        >
          {studentsLoading ? 'Loading...' : 'Load Students'}
        </button>
        {studentsError && <p className="text-red-500">Error: {studentsError.message}</p>}
        {studentsData && (
          <p>Found {studentsData.total || 0} students</p>
        )}
        
        <form onSubmit={handleCreateStudent} className="mt-3 space-y-2">
          <input
            type="text"
            placeholder="Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Student
          </button>
        </form>
      </div>

      {/* Classes Test */}
      <div className="mb-6 p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Classes</h2>
        <button 
          onClick={() => loadClasses()} 
          disabled={classesLoading}
          className="bg-orange-500 text-white px-4 py-2 rounded mb-2"
        >
          {classesLoading ? 'Loading...' : 'Load Classes'}
        </button>
        {classesError && <p className="text-red-500">Error: {classesError.message}</p>}
        {classesData && (
          <p>Found {classesData.total || 0} classes</p>
        )}
      </div>

      {/* Auth Status */}
      <div className="p-4 border rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Auth Status</h2>
        <p>Authenticated: {authService.isAuthenticated() ? 'Yes' : 'No'}</p>
        <p>Current User: {authService.getCurrentUser()?.email || 'None'}</p>
        <p>Token: {authService.getToken()?.substring(0, 20) + '...' || 'None'}</p>
      </div>
    </div>
  );
};

export default ApiTest;
