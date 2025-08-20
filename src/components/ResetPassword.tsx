import React, { useState, useEffect } from 'react';
import { Target, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import logo from '../assets/images/resumeATS-white.png'

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        setIsValidating(false);
        return;
      }

      try {
        const response = await authApi.verifyResetToken(token);
        if (response.success) {
          setIsValidToken(true);
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Invalid reset link';
        setError(errorMessage);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (formData.newPassword.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.resetPassword(token!, formData.newPassword, formData.confirmPassword);

      if (response.success) {
        setIsSuccess(true);
        toast.success('Password reset successful!');
      } else {
        setError(response.error || 'Failed to reset password');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      setError(errorMessage);
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Welcome Section */}
            <div className="w-full lg:w-1/2 bg-gradient-to-r from-[#182541] to-[#1e1c47] relative overflow-hidden">
              {/* Content */}
              <div className="relative z-10 flex flex-col justify-center text-white px-6 md:px-8 py-12 lg:py-0">
                <div className="flex items-center md:justify-center">
                  <img src={logo} alt="ResumeATS Logo" className="w-[253px] md:mt-[3rem] ml-[-12px]" onClick={() => navigate('/auth/signin')} />
                </div>
                <div className='flex flex-col justify-center text-white md:px-14 my-[3rem]'>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4">Password Reset</h1>
                  <p className="text-lg lg:text-xl opacity-90">We're validating your reset link.</p>
                </div>
              </div>
            </div>

            {/* Right Side - Loading Section */}
            <div className="w-full lg:w-1/2 bg-gray-50 p-6 lg:p-8 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Validating reset link...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Welcome Section */}
            <div className="w-full lg:w-1/2 bg-gradient-to-r from-[#182541] to-[#1e1c47] relative overflow-hidden">
              {/* Content */}
              <div className="relative z-10 flex flex-col justify-center text-white px-6 md:px-8 py-12 lg:py-0">
                <div className="flex items-center md:justify-center">
                  <img src={logo} alt="ResumeATS Logo" className="w-[253px] md:mt-[3rem] ml-[-12px]" onClick={() => navigate('/auth/signin')} />
                </div>
                <div className='flex flex-col justify-center text-white md:px-14 my-[3rem]'>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4">Success!</h1>
                  <p className="text-lg lg:text-xl opacity-90">Your password has been reset successfully.</p>
                </div>
              </div>
            </div>

            {/* Right Side - Success Section */}
            <div className="w-full lg:w-1/2 bg-gray-50 p-6 lg:p-8 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                  <p className="text-gray-600">
                    Your password has been successfully reset. You can now sign in with your new password.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/auth/signin')}
                  className="w-full bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Welcome Section */}
            <div className="w-full lg:w-1/2 bg-gradient-to-r from-[#182541] to-[#1e1c47] relative overflow-hidden">
              {/* Content */}
              <div className="relative z-10 flex flex-col justify-center text-white px-6 md:px-8 py-12 lg:py-0">
                <div className="flex items-center md:justify-center">
                  <img src={logo} alt="ResumeATS Logo" className="w-[253px] md:mt-[3rem] ml-[-12px]" onClick={() => navigate('/auth/signin')} />
                </div>
                <div className='flex flex-col justify-center text-white md:px-14 md:mt-[3rem]'>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4">Invalid Link</h1>
                  <p className="text-lg lg:text-xl opacity-90">This reset link is no longer valid.</p>
                </div>
              </div>
            </div>

            {/* Right Side - Error Section */}
            <div className="w-full lg:w-1/2 bg-gray-50 p-6 lg:p-8 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                  <p className="text-gray-600 mb-6">
                    {error || 'This password reset link is invalid or has expired.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/forgot-password')}
                    className="w-full bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Request New Reset Link
                  </button>
                  <button
                    onClick={() => navigate('/auth/signin')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Welcome Section */}
          <div className="w-full lg:w-1/2 bg-gradient-to-r from-[#182541] to-[#1e1c47] relative overflow-hidden">
            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center text-white px-6 md:px-8 py-12 lg:py-0">
              <div className="flex items-center md:justify-center">
                <img src={logo} alt="ResumeATS Logo" className="w-[253px] md:mt-[3rem] ml-[-12px]" />
              </div>
              <div className='flex flex-col justify-center text-white md:px-14 md:mt-[3rem]'>
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">Reset Password</h1>
                <p className="text-lg lg:text-xl opacity-90">Create a new secure password for your account.</p>
              </div>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="w-full lg:w-1/2 bg-gray-50 p-6 lg:p-8 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                Set New Password
              </h2>
              <p className="text-gray-600 mb-6 lg:mb-8">
                Enter your new password below to complete the reset process.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Enter your new password"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Confirm your new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-700 text-white disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Resetting Password...</span>
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/auth/signin')}
                  disabled={isLoading}
                  className="inline-flex items-center space-x-2 text-blue-900 hover:text-gray-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 