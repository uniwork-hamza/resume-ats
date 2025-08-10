import React, { useState, useEffect } from 'react';
import { Target, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';


interface AuthProps {
  mode?: 'signin' | 'signup';
  onLogin: (email: string) => void;
  onBack: () => void;
  onForgotPassword?: () => void;
}

export default function Auth({ mode = 'signin', onLogin, onBack, onForgotPassword }: AuthProps) {
  const [isLogin, setIsLogin] = useState(mode === 'signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { login, register, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    setIsLogin(mode === 'signin');
    clearError();
    setValidationErrors([]);
  }, [mode, clearError]);

  // Clear errors when form data changes
  useEffect(() => {
    if (error) clearError();
    setValidationErrors([]);
  }, [formData, error, clearError]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (!isLogin) {
      if (!formData.name || formData.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }

      if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.name);
      }
      
      // If successful, call the onLogin callback
    onLogin(formData.email);
    } catch (error: unknown) {
      // Error is handled by the auth context
      console.error('Authentication error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
          >
            <Target className="h-8 w-8" />
            <span className="text-2xl font-bold">ResumeATS</span>
          </button>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin 
              ? 'Sign in to your account to continue' 
              : 'Join thousands who improved their job prospects'
            }
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Messages */}
          {(error || validationErrors.length > 0) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Please fix the following errors:</span>
              </div>
              <ul className="mt-2 text-sm text-red-600 space-y-1">
                {error && <li>{error}</li>}
                {validationErrors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Confirm your password"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-medium underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
            
            {isLogin && onForgotPassword && (
              <p className="text-gray-600">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={isLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
                >
                  Forgot your password?
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}