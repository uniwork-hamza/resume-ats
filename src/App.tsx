import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { resumeApi, Resume, Analysis } from './services/api';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import Loading from './components/Loading';
import Results from './components/Results';
import ResumeSettings from './components/Settings';
import ResumeScreen from './components/ResumeScreen';
import ReviewResume from './components/ReviewResume';
import Header from './components/Header';
import Layout from './components/Layout';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { analysisApi } from './services/api';
import { Loader2 } from 'lucide-react';

interface AnalysisData {
  overallScore: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  formatScore: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  keywordData: Array<{
    category: string;
    matched: number;
    total: number;
    percentage: number;
  }>;
  detailedAnalysis?: {
    experienceMatch: string;
    skillsMatch: string;
    educationMatch: string;
    overallFit: string;
  };
}

interface ResumeFormData {
  name: string;
  email: string;
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
  const { isAuthenticated, isLoading } = useAuth();
  const [resumeData, setResumeData] = useState<Resume | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisData | null>(null);
  const [parsedResumeData, setParsedResumeData] = useState<{ parsedContent: ResumeFormData; fileName: string } | null>(null);
  const [isNavigatingFromReview, setIsNavigatingFromReview] = useState(false);

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
    
    const handleStartAnalysis = async () => {
      if (!isAuthenticated) {
        goTo('/auth/signin');
        return;
      }
      
      try {
        // Check if user has existing resume
        const response = await resumeApi.getResume();
        if (response.success && response.data) {
          let existingResume = null;
          
          // Handle both old format (resumes array) and new format (single resume)
          if ('resume' in response.data && response.data.resume) {
            // New format: single resume object
            existingResume = response.data.resume;
          } else if ('resumes' in response.data && Array.isArray(response.data.resumes) && response.data.resumes.length > 0) {
            // Old format: resumes array (fallback)
            existingResume = response.data.resumes[0];
          }
          
          if (existingResume) {
            // User has resume, go directly to job description
            setResumeData({ ...existingResume.content, id: existingResume.id, title: existingResume.title });
            setJobDescription('');
            setAnalysisResults(null);
            goTo('/job-description');
          } else {
            // No resume, go to resume upload
            setResumeData(null);
            setJobDescription('');
            setAnalysisResults(null);
            goTo('/resume-upload');
          }
        } else {
          // No resume, go to resume upload
          setResumeData(null);
          setJobDescription('');
          setAnalysisResults(null);
          goTo('/resume-upload');
        }
      } catch (error) {
        console.error('Error checking resume:', error);
        // Fallback to resume upload
        setResumeData(null);
        setJobDescription('');
        setAnalysisResults(null);
        goTo('/resume-upload');
      }
    };

    return (
      <Landing
        onGetStarted={() => goTo('/auth/signin')}
        onGoToDashboard={() => goTo('/dashboard')}
        onStartAnalysis={handleStartAnalysis}
      />
    );
  }

  function AuthScreen({ mode }: { mode: 'signin' | 'signup' }) {
    const { goTo } = useNav();
    
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    
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

    const handleForgotPassword = () => {
      goTo('/forgot-password');
    };

    return (
      <Auth
        mode={mode}
        onLogin={handleLoginSuccess}
        onBack={() => goTo('/')}
        onForgotPassword={handleForgotPassword}
      />
    );
  }

  function DashboardScreen() {
    const { goTo } = useNav();
    
    const handleStartNewTest = async () => {
      try {
        // Check if user has existing resume
        const response = await resumeApi.getResume();
        if (response.success && response.data) {
          let existingResume = null;
          
          // Handle both old format (resumes array) and new format (single resume)
          if ('resume' in response.data && response.data.resume) {
            // New format: single resume object
            existingResume = response.data.resume;
          } else if ('resumes' in response.data && Array.isArray(response.data.resumes) && response.data.resumes.length > 0) {
            // Old format: resumes array (fallback)
            existingResume = response.data.resumes[0];
          }
          
          if (existingResume) {
            // User has resume, go directly to job description
            setResumeData({ ...existingResume.content, id: existingResume.id, title: existingResume.title });
            setJobDescription('');
            setAnalysisResults(null);
            goTo('/job-description');
          } else {
            // No resume, go to resume upload
            setResumeData(null);
            setJobDescription('');
            setAnalysisResults(null);
            goTo('/resume-upload');
          }
        } else {
          // No resume, go to resume upload
          setResumeData(null);
          setJobDescription('');
          setAnalysisResults(null);
          goTo('/resume-upload');
        }
      } catch (error) {
        console.error('Error checking resume:', error);
        // Fallback to resume upload
        setResumeData(null);
        setJobDescription('');
        setAnalysisResults(null);
        goTo('/resume-upload');
      }
    };

    return (
      <Layout>
        <Dashboard
          onTestResume={handleStartNewTest}
        />
      </Layout>
    );
  }

  function ReportsScreen() {
    return (
      <Layout>
        <Reports />
      </Layout>
    );
  }

  function ResumeScreenWrapper() {
    return (
      <Layout>
        <ResumeScreen />
      </Layout>
    );
  }

  function ResumeUploadScreen() {
    const { goTo } = useNav();
    
    return (
      <Layout>
        <ResumeUpload
          onNext={(data) => { 
            if (data) {
              // Handle both form data and API response
              if ('content' in data) {
                // API response format
                setResumeData(data as Resume);
              } else {
                // Form data format - create a mock Resume object
                const mockResume: Resume = {
                  id: 'temp-id',
                  title: 'User Resume',
                  type: 'form',
                  content: data,
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                setResumeData(mockResume);
              }
            }
            setAnalysisResults(null);
            
            // Check if user came from resume section or dashboard
            const fromResume = window.location.search.includes('from=resume');
            if (fromResume) {
              goTo('/resume'); // Go back to resume section
            } else {
              goTo('/job-description'); // Continue with analysis flow
            }
          }}
          onParseComplete={(parsedData) => {
            // Store parsed data and navigate to review
            setParsedResumeData(parsedData);
            goTo('/review-resume');
          }}
          onBack={() => {
            // Check if user came from resume section
            const fromResume = window.location.search.includes('from=resume');
            if (fromResume) {
              goTo('/resume'); // Go back to resume section
            } else {
              goTo('/dashboard'); // Go back to dashboard
            }
          }}
        />
      </Layout>
    );
  }

  function ReviewResumeScreen() {
    const { goTo } = useNav();
    
    if (!parsedResumeData && !isNavigatingFromReview) {
      // If no parsed data and not in the middle of navigation, redirect to upload
      goTo('/resume-upload');
      return null;
    }
    
    if (!parsedResumeData) {
      return null;
    }
    
    return (
      <Layout>
        <ReviewResume
          parsedData={parsedResumeData.parsedContent}
          fileName={parsedResumeData.fileName}
          onNext={(resumeData) => {
            // Convert the response to proper Resume format
            const fullResumeData: Resume = {
              id: resumeData.id,
              title: resumeData.title,
              type: 'file',
              content: resumeData.content,
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setResumeData(fullResumeData);
            setAnalysisResults(null);
            setIsNavigatingFromReview(true);
            setParsedResumeData(null); // Clear parsed data
            goTo('/job-description');
          }}
          onBack={() => {
            setIsNavigatingFromReview(false); // Reset navigation flag
            setParsedResumeData(null); // Clear parsed data when going back
            goTo('/resume-upload');
          }}
        />
      </Layout>
    );
  }

  function JobDescriptionScreen() {
    const { goTo } = useNav();
    const navigate = useNavigate();
    
    // Reset navigation flag when we successfully reach job description
    if (isNavigatingFromReview) {
      setIsNavigatingFromReview(false);
    }
    
    return (
<Layout>
        <JobDescription
          onNext={(desc) => { 
            setJobDescription(desc); 
            setAnalysisResults(null);
            goTo('/loading'); 
          }}
          onBack={() => navigate(-1)}
        />
</Layout>
    );
  }

  function LoadingScreen() {
    const { goTo } = useNav();
    
    if (!resumeData) {
      goTo('/resume-upload');
      return null;
    }

    // Transform backend analysis data to frontend format
    const transformAnalysisData = (backendData: Analysis): AnalysisData => {
      // Use the new database fields directly, with fallbacks to legacy fields and AI response
      return {
        overallScore: typeof backendData.overallScore === 'number' ? backendData.overallScore : 
                     typeof backendData.matchScore === 'number' ? backendData.matchScore : 
                     typeof backendData.aiResponse?.overallScore === 'number' ? backendData.aiResponse.overallScore : 0,
        keywordMatch: typeof backendData.keywordMatch === 'number' ? backendData.keywordMatch : 
                     typeof backendData.aiResponse?.keywordMatch === 'number' ? backendData.aiResponse.keywordMatch : 0,
        skillsMatch: typeof backendData.skillsMatch === 'number' ? backendData.skillsMatch : 
                    typeof backendData.aiResponse?.skillsMatch === 'number' ? backendData.aiResponse.skillsMatch : 0,
        experienceMatch: typeof backendData.experienceMatch === 'number' ? backendData.experienceMatch : 
                        typeof backendData.aiResponse?.experienceMatch === 'number' ? backendData.aiResponse.experienceMatch : 0,
        formatScore: typeof backendData.formatScore === 'number' ? backendData.formatScore : 
                    typeof backendData.aiResponse?.formatScore === 'number' ? backendData.aiResponse.formatScore : 0,
        
        strengths: Array.isArray(backendData.strengths) ? backendData.strengths : 
                  Array.isArray(backendData.aiResponse?.strengths) ? backendData.aiResponse.strengths : [],
        improvements: Array.isArray(backendData.improvements) ? backendData.improvements : 
                     Array.isArray(backendData.weaknesses) ? backendData.weaknesses : 
                     Array.isArray(backendData.suggestions) ? backendData.suggestions : 
                     Array.isArray(backendData.aiResponse?.improvements) ? backendData.aiResponse.improvements : [],
        missingKeywords: Array.isArray(backendData.missingKeywords) ? backendData.missingKeywords : 
                        Array.isArray(backendData.missingSkills) ? backendData.missingSkills : 
                        Array.isArray(backendData.aiResponse?.missingKeywords) ? backendData.aiResponse.missingKeywords : [],
        
        keywordData: Array.isArray(backendData.keywordData) ? backendData.keywordData : 
                    Array.isArray(backendData.aiResponse?.keywordData) ? backendData.aiResponse.keywordData : [
          { category: 'Technical Skills', matched: 0, total: 0, percentage: 0 },
          { category: 'Soft Skills', matched: 0, total: 0, percentage: 0 },
          { category: 'Tools & Technologies', matched: 0, total: 0, percentage: 0 },
          { category: 'Methodologies', matched: 0, total: 0, percentage: 0 }
        ],
        
        detailedAnalysis: (backendData.detailedAnalysis && typeof backendData.detailedAnalysis === 'object') ? 
                         backendData.detailedAnalysis as { experienceMatch: string; skillsMatch: string; educationMatch: string; overallFit: string; } :
                         (backendData.aiResponse?.detailedAnalysis && typeof backendData.aiResponse.detailedAnalysis === 'object') ?
                         backendData.aiResponse.detailedAnalysis as { experienceMatch: string; skillsMatch: string; educationMatch: string; overallFit: string; } :
                         undefined
      };
    };

    // Prevent duplicate API calls: if analysisResults exists, do not render Loading
    if (analysisResults) {
      return null;
    }
    return (
      <Layout>
        <Loading 
          resumeData={resumeData}
          jobDescription={jobDescription}
          onComplete={(analysisData) => {
            console.log('App: Received analysis completion');
            const transformedData = transformAnalysisData(analysisData);
            setAnalysisResults(transformedData);
            goTo(`/results/${analysisData.id}`);
          }}
        />
      </Layout>
    );
  }

  function AnalysisScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Use existing analysis results if available, otherwise fetch from API
    const [data, setData] = useState<AnalysisData | null>(analysisResults);
    const [loading, setLoading] = useState(!analysisResults);
    
    useEffect(() => {
      // Only fetch from API if we don't have analysis results already
      if (!analysisResults) {
        (async () => {
          try {
            const res = await analysisApi.getAnalysis(id!);
            if (res.success && res.data?.analysis) {
              const a = res.data.analysis;
              setData({
                overallScore: a.overallScore,
                keywordMatch: a.keywordMatch,
                skillsMatch: a.skillsMatch,
                experienceMatch: a.experienceMatch,
                formatScore: a.formatScore,
                strengths: a.strengths,
                improvements: a.improvements,
                missingKeywords: a.missingKeywords,
                keywordData: a.keywordData,
                detailedAnalysis: a.detailedAnalysis
              });
            }
          } catch (error) { 
            console.error(error); 
          }
          setLoading(false);
        })();
      }
    }, [id, analysisResults]);
    
    const handleStartNewTest = async () => {
      try {
        // Check if user has existing resume
        const response = await resumeApi.getResume();
        if (response.success && response.data) {
          let existingResume = null;
          
          // Handle both old format (resumes array) and new format (single resume)
          if ('resume' in response.data && response.data.resume) {
            // New format: single resume object
            existingResume = response.data.resume;
          } else if ('resumes' in response.data && Array.isArray(response.data.resumes) && response.data.resumes.length > 0) {
            // Old format: resumes array (fallback)
            existingResume = response.data.resumes[0];
          }
          
          if (existingResume) {
            // User has resume, go directly to job description
            setResumeData({ ...existingResume.content, id: existingResume.id, title: existingResume.title });
            setJobDescription('');
            setAnalysisResults(null);
            navigate('/job-description');
          } else {
            // No resume, go to resume upload
            setResumeData(null);
            setJobDescription('');
            setAnalysisResults(null);
            navigate('/resume-upload');
          }
        } else {
          // No resume, go to resume upload
          setResumeData(null);
          setJobDescription('');
          setAnalysisResults(null);
          navigate('/resume-upload');
        }
      } catch (error) {
        console.error('Error checking resume:', error);
        // Fallback to resume upload
        setResumeData(null);
        setJobDescription('');
        setAnalysisResults(null);
        navigate('/resume-upload');
      }
    };
    
    if (loading) {
      return (
        <Layout>
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading analysis...</p>
            </div>
          </div>
        </Layout>
      );
    }
    if (!data) {
      return (
        <Layout>
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="text-center">
              <p className="text-gray-600">Analysis not found. Please try again.</p>
            </div>
          </div>
        </Layout>
      );
    }
    return (
      <Layout>
        <Results analysisData={data} onBack={() => navigate('/dashboard')} onStartNewTest={handleStartNewTest} />
      </Layout>
    );
  }

  function ForgotPasswordScreen() {
    const navigate = useNavigate();
    return <ForgotPassword onBack={() => navigate('/auth/signin')} />;
  }

  return (
    <Routes>
      <Route path="/resume" element={isAuthenticated ? <ResumeScreenWrapper /> : <Navigate to="/auth/signin?redirect=/resume" />} />
      <Route path="/" element={<LandingScreen />} />
      <Route path="/auth/signin" element={<AuthScreen mode="signin" />} />
      <Route path="/auth/signup" element={<AuthScreen mode="signup" />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={isAuthenticated ? <DashboardScreen /> : <Navigate to="/auth/signin?redirect=/dashboard" />} />
      <Route path="/reports" element={isAuthenticated ? <ReportsScreen /> : <Navigate to="/auth/signin?redirect=/reports" />} />
      <Route path="/resume-upload" element={isAuthenticated ? <ResumeUploadScreen /> : <Navigate to="/auth/signin?redirect=/resume-upload" />} />
      <Route path="/review-resume" element={isAuthenticated && parsedResumeData ? <ReviewResumeScreen /> : <Navigate to="/resume-upload" />} />
      <Route path="/job-description" element={isAuthenticated && resumeData ? <JobDescriptionScreen /> : <Navigate to="/auth/signin?redirect=/job-description" />} />
      <Route path="/loading" element={isAuthenticated && resumeData && jobDescription ? <LoadingScreen /> : <Navigate to="/auth/signin?redirect=/loading" />} />
      <Route path="/results/:id" element={isAuthenticated ? <AnalysisScreen /> : <Navigate to="/auth/signin?redirect=/results" />} />
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