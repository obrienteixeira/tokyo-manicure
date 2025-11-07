import React from 'react';
import type { Page } from '../../App';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
  page: Page;
  label: string;
  // FIX: Changed JSX.Element to React.ReactElement to resolve namespace issue.
  icon: React.ReactElement;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isSidebarOpen: boolean;
}> = ({ page, label, icon, currentPage, setCurrentPage, isSidebarOpen }) => {
  // 1. Determine if the current nav item is active.
  const isActive = currentPage === page;

  // 2. Render a single navigation item.
  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setCurrentPage(page);
        }}
        className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-primary text-white shadow-md'
            : 'text-text-secondary hover:bg-pink-100 hover:text-primary'
        }`}
      >
        {icon}
        <span className={`ml-4 font-medium transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{label}</span>
      </a>
    </li>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setOpen }) => {
  // 3. Define navigation items with their respective icons and labels.
  // FIX: Changed JSX.Element to React.ReactElement to resolve namespace issue.
  const navItems: { page: Page; label: string; icon: React.ReactElement }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { page: 'scheduling', label: 'Agendamentos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> },
    { page: 'clients', label: 'Clientes', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { page: 'employees', label: 'Funcionários', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 14h13a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z"/></svg> },
    { page: 'transactions', label: 'Transações', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { page: 'services', label: 'Serviços', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m20.3 2.2-1.2 1.2a2 2 0 0 0-.6 1.4V8h-2.1c-.9-.4-2-.7-3.2-.7-2.3 0-4.3 1.3-5.5 3.1L2.2 17.7c-.8 1.3.2 3 1.7 3h16.2c1.5 0 2.5-1.7 1.7-3l-5.4-7.2c-1.1-1.8-3.2-3.1-5.5-3.1-1.2 0-2.3.3-3.2.7V4.8c0-.5-.2-1-.6-1.4l-1.2-1.2"/></svg> },
    { page: 'products', label: 'Produtos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg> },
    { page: 'reports', label: 'Relatórios', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8a6 6 0 0 0-8.1 1.4l-4.1 4.1"/><path d="M12.5 18.2a6 6 0 0 0 8.1-1.4l4.1-4.1"/><path d="m12.5 11.7 3.6-3.6"/><path d="M8.9 15.3 5.3 19"/></svg> },
    { page: 'packages', label: 'Pacotes', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><path d="M12 22.08V12"/><path d="M17 14V7.5"/><path d="M21.5 10.5 17 13l-4.5-2.5"/><path d="M17 18a4 4 0 0 0 0-8"/></svg> },
    { page: 'users', label: 'Usuários', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><circle cx="18" cy="18" r="3"/></svg> },
  ];

  // 4. Main sidebar container with transitions for opening and closing.
  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen bg-surface border-r border-gray-200/80 transition-width duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="flex flex-col h-full">
        {/* 5. Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/80">
          <div className={`flex items-center overflow-hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.3 2.2 22 4l-2.8 2.8-1.2-1.2Z"/><path d="m2.2 20.3 1.8-1.8L1 15.7l-1.2 1.2a2 2 0 0 0 0 2.8l1.6 1.6Zm.4-11.9-1.2 1.2a2 2 0 0 0 0 2.8l8.5 8.5 1.2-1.2-8.5-8.5Z"/><path d="M10.4 2.2 12 4l-1.4 1.4-1.2-1.2Z"/><path d="m11.8 12.8 5.6-5.6 1.2 1.2-5.6 5.6Z"/><path d="m18.9 8.8 1.2 1.2-2.8 2.8-1.2-1.2Z"/></svg>
            <h1 className="ml-2 text-xl font-bold text-secondary font-jp whitespace-nowrap">Tokyo Nails</h1>
          </div>
        </div>

        {/* 6. Navigation Menu */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.page} {...item} currentPage={currentPage} setCurrentPage={setCurrentPage} isSidebarOpen={isOpen} />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;