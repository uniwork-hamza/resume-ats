import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import Loading from './components/Loading';
import Results from './components/Results';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    gpa: string;
  }>;
  skills: string;
}

function AppContent() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState('');

  const useNav = () => {
    const navigate = useNavigate();
    return {
      goTo: (path: string) => navigate(path),
    };
  };

  // Show loading spinner while auth is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  function LandingScreen() {
    const { goTo } = useNav();
    return (
      <Landing
        onGetStarted={() => goTo('/auth/signin')}
        onGoToDashboard={() => goTo('/dashboard')}
        onStartAnalysis={() => goTo('/resume-upload')}
      />
    );
  }

  function AuthScreen({ mode }: { mode: 'signin' | 'signup' }) {
    const { goTo } = useNav();
    
    const handleLoginSuccess = () => {
      // Check if there's a redirect parameter in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      
      // If there's a redirect parameter, go there; otherwise go to dashboard
      if (redirectTo && redirectTo !== '/auth/signin' && redirectTo !== '/auth/signup') {
        goTo(redirectTo);
      } else {
        goTo('/dashboard');
      }
    };

    return (
      <Auth
        mode={mode}
        onLogin={handleLoginSuccess}
        onBack={() => goTo('/')}
      />
    );
  }

  function DashboardScreen() {
    const { goTo } = useNav();
    return (
      <Dashboard
        userEmail={user?.email || ''}
        onTestResume={() => goTo('/resume-upload')}
        onLogout={async () => {
          await logout();
          setResumeData(null);
          setJobDescription('');
          goTo('/');
        }}
      />
    );
  }

  function ResumeUploadScreen() {
    const { goTo } = useNav();
    return (
      <ResumeUpload
        onNext={(data) => { setResumeData(data); goTo('/job-description'); }}
        onBack={() => goTo('/dashboard')}
      />
    );
  }

  function JobDescriptionScreen() {
    const { goTo } = useNav();
    return (
      <JobDescription
        onNext={(desc) => { setJobDescription(desc); goTo('/loading'); }}
        onBack={() => goTo('/resume-upload')}
      />
    );
  }

  function LoadingScreen() {
    const { goTo } = useNav();
    return <Loading onComplete={() => goTo('/results')} />;
  }

  function ResultsScreen() {
    const { goTo } = useNav();
    return (
      <Results
        onBack={() => goTo('/dashboard')}
        onStartNewTest={() => { setResumeData(null); setJobDescription(''); goTo('/resume-upload'); }}
      />
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingScreen />} />
      <Route path="/auth/signin" element={<AuthScreen mode="signin" />} />
      <Route path="/auth/signup" element={<AuthScreen mode="signup" />} />
      <Route path="/dashboard" element={isAuthenticated ? <DashboardScreen /> : <Navigate to="/auth/signin?redirect=/dashboard" />} />
      <Route path="/resume-upload" element={isAuthenticated ? <ResumeUploadScreen /> : <Navigate to="/auth/signin?redirect=/resume-upload" />} />
      <Route path="/job-description" element={isAuthenticated && resumeData ? <JobDescriptionScreen /> : <Navigate to="/auth/signin?redirect=/job-description" />} />
      <Route path="/loading" element={isAuthenticated && resumeData && jobDescription ? <LoadingScreen /> : <Navigate to="/auth/signin?redirect=/loading" />} />
      <Route path="/results" element={isAuthenticated && resumeData && jobDescription ? <ResultsScreen /> : <Navigate to="/auth/signin?redirect=/results" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;