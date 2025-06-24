import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import Loading from './components/Loading';
import Results from './components/Results';

function App() {
  const [userEmail, setUserEmail] = useState('');
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');

  const useNav = () => {
    const navigate = useNavigate();
    return {
      goTo: (path: string) => navigate(path),
    };
  };

  function LandingScreen() {
    const { goTo } = useNav();
    return <Landing onGetStarted={() => goTo('/auth/signin')} />;
  }

  function AuthScreen({ mode }: { mode: 'signin' | 'signup' }) {
    const { goTo } = useNav();
    return (
      <Auth
        mode={mode}
        onLogin={(email) => { setUserEmail(email); goTo('/dashboard'); }}
        onBack={() => goTo('/')}
      />
    );
  }

  function DashboardScreen() {
    const { goTo } = useNav();
    return (
      <Dashboard
        userEmail={userEmail}
        onTestResume={() => goTo('/resume-upload')}
        onLogout={() => { setUserEmail(''); setResumeData(null); setJobDescription(''); goTo('/'); }}
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
    <Router>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="/auth/signin" element={<AuthScreen mode="signin" />} />
        <Route path="/auth/signup" element={<AuthScreen mode="signup" />} />
        <Route path="/dashboard" element={userEmail ? <DashboardScreen /> : <Navigate to="/" />} />
        <Route path="/resume-upload" element={userEmail ? <ResumeUploadScreen /> : <Navigate to="/" />} />
        <Route path="/job-description" element={userEmail && resumeData ? <JobDescriptionScreen /> : <Navigate to="/" />} />
        <Route path="/loading" element={userEmail && resumeData && jobDescription ? <LoadingScreen /> : <Navigate to="/" />} />
        <Route path="/results" element={userEmail && resumeData && jobDescription ? <ResultsScreen /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;