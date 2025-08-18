import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Header />
      
      {/* Main Content Area */}
      <div className="flex-1  overflow-y-auto" style={{ height: '100vh' }}>
        {children}
      </div>
    </div>
  );
}
