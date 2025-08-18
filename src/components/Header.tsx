import React, { useState, useEffect, useRef } from 'react';
import { Target, ChevronDown, X, FileText, LayoutDashboard, LogOut, ClipboardPlus  } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/resumeATS.png'

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-blue-600 text-white p-2 rounded-lg shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ height: '100vh' }}>
        {/* Close button for mobile */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Logo and App Name */}
        <div className="flex items-center justify-center py-8 px-6 border-b border-gray-700">
          <img src={logo} alt="ResumeATS Logo" className="h-12 w-12 object-contain" />
          {/* <span className="text-2xl font-bold text-white">ResumeATS</span> */}
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 px-4 flex-1">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => { setSidebarOpen(false); navigate('/dashboard'); }}
              className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-150 flex items-center space-x-3"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => { setSidebarOpen(false); navigate('/resume'); }}
              className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-150 flex items-center space-x-3"
            >
              <FileText className="h-5 w-5" />
              <span>Resume</span>
            </button>
            <button
              type="button"
              onClick={() => { setSidebarOpen(false); navigate('/dashboard'); }}
              className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-150 flex items-center space-x-3"
            >
              <ClipboardPlus  className="h-5 w-5" />
              <span>Reports</span>
            </button>
          </div>
        </nav>

        {/* User Info at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
          <div className="flex items-center space-x-1 text-gray-300">
            <span className="text-sm font-medium">Logged in</span>
          </div>
          <div className="text-white text-sm mt-1">
            {user?.name || 'User'}
          </div>
          <button
            type="button"
            onClick={() => { setSidebarOpen(false); handleLogout(); }}
            className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors duration-150 flex items-center space-x-3"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>


      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
} 