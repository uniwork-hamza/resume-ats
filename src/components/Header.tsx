import React, { useState, useEffect, useRef } from 'react';
import { Target, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
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
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">ResumeATS</span>
          </div>
          <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(open => !open)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <span>Welcome, {user?.email?.split('@')[0] || 'User'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); navigate('/resume'); }}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                >
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 