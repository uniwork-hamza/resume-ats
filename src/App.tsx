import React, { useState } from 'react';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import Loading from './components/Loading';
import Results from './components/Results';

type Screen = 'landing' | 'auth' | 'dashboard' | 'resume-upload' | 'job-description' | 'loading' | 'results';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userEmail, setUserEmail] = useState('');
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');

  const handleGetStarted = () => {
    setCurrentScreen('auth');
  };

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUserEmail('');
    setResumeData(null);
    setJobDescription('');
    setCurrentScreen('landing');
  };

  const handleTestResume = () => {
    setCurrentScreen('resume-upload');
  };

  const handleResumeComplete = (data: any) => {
    setResumeData(data);
    setCurrentScreen('job-description');
  };

  const handleJobDescriptionComplete = (description: string) => {
    setJobDescription(description);
    setCurrentScreen('loading');
  };

  const handleAnalysisComplete = () => {
    setCurrentScreen('results');
  };

  const handleStartNewTest = () => {
    setResumeData(null);
    setJobDescription('');
    setCurrentScreen('resume-upload');
  };

  const handleBackFromAuth = () => {
    setCurrentScreen('landing');
  };

  const handleBackFromResumeUpload = () => {
    setCurrentScreen('dashboard');
  };

  const handleBackFromJobDescription = () => {
    setCurrentScreen('resume-upload');
  };

  const handleBackFromResults = () => {
    setCurrentScreen('dashboard');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'landing':
        return <Landing onGetStarted={handleGetStarted} />;
      case 'auth':
        return <Auth onLogin={handleLogin} onBack={handleBackFromAuth} />;
      case 'dashboard':
        return (
          <Dashboard
            userEmail={userEmail}
            onTestResume={handleTestResume}
            onLogout={handleLogout}
          />
        );
      case 'resume-upload':
        return (
          <ResumeUpload
            onNext={handleResumeComplete}
            onBack={handleBackFromResumeUpload}
          />
        );
      case 'job-description':
        return (
          <JobDescription
            onNext={handleJobDescriptionComplete}
            onBack={handleBackFromJobDescription}
          />
        );
      case 'loading':
        return <Loading onComplete={handleAnalysisComplete} />;
      case 'results':
        return (
          <Results
            onBack={handleBackFromResults}
            onStartNewTest={handleStartNewTest}
          />
        );
      default:
        return <Landing onGetStarted={handleGetStarted} />;
    }
  };

  return <div className="App">{renderScreen()}</div>;
}

export default App;