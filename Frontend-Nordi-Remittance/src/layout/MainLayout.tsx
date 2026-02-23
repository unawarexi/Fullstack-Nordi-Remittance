// ============================================================================
// MAIN LAYOUT - App layout with responsive navbar and footer
// ============================================================================

import React from 'react';
import { ResponsiveNavbar } from '@components/navbar_components/ResponsiveNavbar';
import RemitFooter from './RemitFooter';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      {/* Responsive Navigation - handles mobile and desktop */}
      <ResponsiveNavbar />
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <RemitFooter />
    </div>
  );
};

export default MainLayout;
