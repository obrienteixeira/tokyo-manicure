
import React from 'react';

interface HeaderProps {
  onLogout: () => void;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, toggleSidebar }) => {
  // 1. Header component providing controls for the user session and UI.
  return (
    <header className="flex items-center justify-between h-16 bg-surface px-4 sm:px-6 lg:px-8 border-b border-gray-200/80 sticky top-0 z-30">
      {/* 2. Button to toggle the sidebar visibility. */}
      <button onClick={toggleSidebar} className="p-2 rounded-md text-text-secondary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      {/* 3. User actions section, primarily for logging out. */}
      <div className="flex items-center">
        <button
          onClick={onLogout}
          className="flex items-center text-sm font-medium text-text-secondary hover:text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
