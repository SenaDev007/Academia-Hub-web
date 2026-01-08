import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Overview from './Overview';
import Students from './Students';
import Finance from './Finance';
import Planning from './Planning';
import Communication from './Communication';
import Settings from './Settings';
import Analytics from './Analytics';
import Cafeteria from './Cafeteria';
import Health from './Health';
import HR from './HR';
import PayrollManagement from './PayrollManagement';
import Library from './Library';
import Laboratory from './Laboratory';
import Transport from './Transport';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-transparent transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/students" element={<Students />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/payroll" element={<PayrollManagement />} />
              <Route path="/planning" element={<Planning />} />
              <Route path="/library" element={<Library />} />
              <Route path="/laboratory" element={<Laboratory />} />
              <Route path="/transport" element={<Transport />} />
              <Route path="/cafeteria" element={<Cafeteria />} />
              <Route path="/hr" element={<HR />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;