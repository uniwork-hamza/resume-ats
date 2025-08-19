import React, { useState } from 'react';
import { Target, Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import logo from '../assets/images/resumeATS-white.png'
interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.forgotPassword(email);
      
      if (response.success) {
        setIsSubmitted(true);
        toast.success('Password reset email sent successfully!');
      } else {
        setError(response.error || 'Failed to send reset email');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      setError(errorMessage);
      toast.error('Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex">
            {/* Left Side - Welcome Section */}
            <div className="w-1/2 bg-gradient-to-r from-[#182541] to-[#1e1c47] relative overflow-hidden">
              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-center text-white px-8">
                <button
                  onClick={onBack}
                  className="inline-flex items-center space-x-2 mb-8"
                >
                  <Target className="h-8 w-8" />
                  <span className="text-2xl font-bold">ResumeATS</span>
                </button>
                <h1 className="text-4xl font-bold mb-4">Password Reset</h1>
                <p className="text-xl opacity-90">We've got you covered.</p>
              </div>
            </div>

            {/* Right Side - Success Section */}
            <div className="w-1/2 bg-gray-50 p-8 flex flex-col justify-center">
              <div className="max-w-md mx-auto w-full text-center">
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                  <p className="text-gray-600">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Didn't receive the email?</strong> Check your spam folder or try again with a different email address.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    Send Another Email
                  </button>
                  <button
                    onClick={onBack}
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
        <div className="flex">
          {/* Left Side - Welcome Section */}
          <div className="w-1/2 bg-gradient-to-r from-[#182541] to-[#1e1c47] relative overflow-hidden">
            {/* Content */}
            <div className="flex items-center justify-center">
          <img src={logo} alt="ResumeATS Logo" className="w-[245px] w-[253px] mt-[3rem]" />
          {/* <span className="text-2xl font-bold text-white">ResumeATS</span> */}
        </div>

            <div className=" flex flex-col justify-center text-white px-14 mt-[3rem]">
              {/* <button
                onClick={onBack}
                className="inline-flex items-center space-x-2 mb-8"
              >
                <Target className="h-8 w-8" />
                <span className="text-2xl font-bold">ResumeATS</span>
              </button> */}
                         <h1 className="text-2xl font-bold mb-4">Forgot Password?</h1>
              <p className="text-xl opacity-90">Don't worry, we'll help you get back in.</p>
            </div>
          </div>

          {/* Right Side - Form Section */}
          <div className="w-1/2 bg-gray-50 p-8 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Reset Your Password
              </h2>
              <p className="text-gray-600 mb-8">
                Enter your email address and we'll send you a link to reset your password.
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
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Enter your email address"
                      required
                    />
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
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={onBack}
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