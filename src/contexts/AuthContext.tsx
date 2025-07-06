import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, User, TokenManager } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: { name?: string; avatarUrl?: string }) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Clear error function
  const clearError = () => setError(null);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = TokenManager.getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          // Invalid token, remove it
          TokenManager.removeToken();
        }
      } catch (error) {
        console.error('Failed to get current user:', error);
        TokenManager.removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Attempting login for:', email);
      const response = await authApi.login({ email, password });
      console.log('Login response:', response);
      
      if (response.success && response.data && response.data.user) {
        console.log('Login successful, setting user:', response.data.user);
        setUser(response.data.user);
        // Clear any existing error
        setError(null);
      } else {
        console.log('Login failed - no user data:', response);
        throw new Error('Login failed - no user data received');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      // Clear user state on error
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authApi.register({ email, password, name });
      
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (userData: { name?: string; avatarUrl?: string }) => {
    try {
      setError(null);
      const response = await authApi.updateProfile(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setError(errorMessage);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback}</> || null;
  }

  return <>{children}</>;
} 