import React, { useState } from 'react';
import LoginView from './components/auth/LoginView';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/dashboard/DashboardView';
import ClientManagementView from './components/clients/ClientManagementView';
import EmployeeManagementView from './components/employees/EmployeeManagementView';
import ServiceManagementView from './components/services/ServiceManagementView';
import ProductManagementView from './components/products/ProductManagementView';
import SchedulingView from './components/scheduling/SchedulingView';
import TransactionManagementView from './components/transactions/TransactionManagementView';
import ReportsView from './components/reports/ReportsView';
import PackageManagementView from './components/packages/PackageManagementView';
import UserManagementView from './components/users/UserManagementView';

export type Page = 'dashboard' | 'clients' | 'employees' | 'services' | 'products' | 'scheduling' | 'transactions' | 'packages' | 'reports' | 'users';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardView />;
      case 'clients':
        return <ClientManagementView />;
      case 'employees':
        return <EmployeeManagementView />;
      case 'services':
        return <ServiceManagementView />;
      case 'products':
        return <ProductManagementView />;
      case 'scheduling':
        return <SchedulingView />;
      case 'transactions':
        return <TransactionManagementView />;
       case 'reports':
        return <ReportsView />;
      case 'packages':
        return <PackageManagementView />;
      case 'users':
        return <UserManagementView />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-surface rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-secondary mb-2">Em Breve</h2>
              <p className="text-text-secondary">A funcionalidade '{currentPage}' está em desenvolvimento.</p>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-background font-jp">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <Header onLogout={handleLogout} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

// FIX: Added default export for the App component to resolve the import error in index.tsx.
export default App;