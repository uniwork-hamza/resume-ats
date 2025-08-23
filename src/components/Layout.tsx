import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {showSidebar && <Header />}
      
      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${showSidebar ? '' : 'w-full'}`} style={{ height: '100vh' }}>
        {children}
      </div>
    </div>
  );
}
