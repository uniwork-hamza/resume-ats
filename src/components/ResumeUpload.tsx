import React, { useState, useEffect } from 'react';
import { Upload, FileText, X, ArrowLeft, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { resumeApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ResumeUploadProps {
  onNext: (resumeData: ResumeFormData | { id: string; title: string; content: ResumeFormData } | null) => void;
  onBack: () => void;
  onParseComplete?: (parsedData: { parsedContent: ResumeFormData; fileName: string }) => void;
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

export default function ResumeUpload({ onNext, onBack, onParseComplete }: ResumeUploadProps) {
  const { user } = useAuth();
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'form' | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasExistingResumes, setHasExistingResumes] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const [formData, setFormData] = useState<ResumeFormData>({
    name: user?.name || '',
    email: user?.email || '',
    summary: '',
    experience: [{ company: '', position: '', duration: '', description: '' }],
    education: [{ institution: '', degree: '', year: '', gpa: '' }],
    skills: ''
  });

  // Check if user has existing resumes
  useEffect(() => {
    const checkExistingResumes = async () => {
      try {
        setIsChecking(true);
        const response = await resumeApi.getResume();
        if (response.success && response.data) {
          // Handle both old format (resumes array) and new format (single resume)
          if ('resume' in response.data && response.data.resume) {
            // New format: single resume object
            setHasExistingResumes(true);
          } else if ('resumes' in response.data && Array.isArray(response.data.resumes) && response.data.resumes.length > 0) {
            // Old format: resumes array (fallback)
            setHasExistingResumes(true);
          } else {
            setHasExistingResumes(false);
          }
        } else {
          setHasExistingResumes(false);
        }
      } catch (error) {
        console.error('Error checking existing resumes:', error);
        setHasExistingResumes(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkExistingResumes();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setUploadedFile(file);
        clearMessages();
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setUploadedFile(file);
        clearMessages();
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file.');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.summary) {
        throw new Error('Please fill in all required fields.');
      }

      if (formData.experience.some(exp => !exp.company || !exp.position || !exp.duration || !exp.description)) {
        throw new Error('Please fill in all experience fields.');
      }

      if (formData.education.some(edu => !edu.institution || !edu.degree || !edu.year)) {
        throw new Error('Please fill in all required education fields.');
      }

      if (!formData.skills) {
        throw new Error('Please provide your skills.');
      }

      // Create resume with form data
      const response = await resumeApi.createResume({
        title: `${formData.name}'s Resume`,
        type: 'form',
        content: formData
      });

      if (response.success && response.data?.resume) {
        setSuccess('Resume created successfully!');
        setTimeout(() => {
          onNext(response.data!.resume);
        }, 1000);
      } else {
        throw new Error('Failed to create resume');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) return;

    setIsLoading(true);
    clearMessages();

    try {
      if (onParseComplete) {
        // New flow: Parse only and go to review
        const result = await resumeApi.parseResume(uploadedFile);

        if (result.success && result.data) {
          setSuccess('Resume parsed successfully!');
          setTimeout(() => {
            onParseComplete(result.data!);
          }, 1000);
        } else {
          throw new Error(result.error || 'Failed to parse resume');
        }
      } else {
        // Old flow: Upload and save directly
        const title = uploadedFile.name.replace(/\.[^/.]+$/, '') + " Resume";
        
        const result = await resumeApi.uploadResume(uploadedFile, title);

        if (result.success && result.data) {
          setSuccess('Resume uploaded and processed successfully!');
          setTimeout(() => {
            onNext(result.data!.resume);
          }, 1000);
        } else {
          throw new Error(result.error || 'Failed to upload resume');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process resume');
    } finally {
      setIsLoading(false);
    }
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (index: number) => {
    if (formData.experience.length > 1) {
      setFormData(prev => ({
        ...prev,
        experience: prev.experience.filter((_, i) => i !== index)
      }));
    }
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', year: '', gpa: '' }]
    }));
  };

  const removeEducation = (index: number) => {
    if (formData.education.length > 1) {
      setFormData(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    }
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Show loading while checking for existing resumes
  if (isChecking) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For new users without resumes, show required message
  if (hasExistingResumes === false && !uploadMethod) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button> */}

        <div className="text-center mb-12">
          <div className="bg-gray-100  rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-blue-800" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Resume Required</h1>
          <p className="text-xl text-gray-600 mb-8">
            To get started with Resume ATS analysis, you need to provide your resume information first.
          </p>
          {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">This is a one-time setup</span>
            </div>
            <p className="text-yellow-700 mt-2">
              Once you add your resume, you can create multiple job analyses and update your resume anytime from settings.
            </p>
          </div> */}
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div 
            onClick={() => setUploadMethod('upload')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-800"
          >
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Upload className="h-8 w-8 text-blue-800" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Upload Resume</h3>
              <p className="text-gray-600 mb-6">
                Upload your existing resume file and our AI will automatically extract and organize your information.
              </p>
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">✨ AI-powered parsing</p>
                <p className="text-sm text-blue-800">Supports PDF, DOC, DOCX, TXT</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setUploadMethod('form')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-800"
          >
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Fill Out Form</h3>
              <p className="text-gray-600 mb-6">
                Enter your resume information using our structured form with guided fields.
              </p>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700 font-medium">📝 Step-by-step guidance</p>
                <p className="text-sm text-green-600">Perfect for creating from scratch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

    // For existing users, show normal interface with skip option
  if (!uploadMethod) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button> */}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Add Your Resume</h1>
          <p className="text-xl text-gray-600">Choose how you'd like to provide your resume information</p>
          {/* {hasExistingResumes && (
            <button
              onClick={() => onNext(null)}
              className="mt-4 text-blue-800 hover:text-blue-700 underline"
            >
              Skip and use existing resume
            </button>
          )} */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
          <div 
            onClick={() => setUploadMethod('upload')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-800"
          >
            <div className="text-center">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Upload className="h-8 w-8 text-blue-800" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Upload Resume</h3>
              {/* <p className="text-gray-600 mb-6">
                Upload your existing resume file and our AI will automatically extract and organize your information.
              </p> */}
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">✨ AI-powered parsing</p>
                <p className="text-sm text-blue-800">Supports PDF, DOC, DOCX, TXT</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setUploadMethod('form')}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-700"
          >
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Fill Out Form</h3>
              {/* <p className="text-gray-600 mb-6">
                Enter your resume information using our structured form with guided fields.
              </p> */}
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700 font-medium">📝 Step-by-step guidance</p>
                <p className="text-sm text-green-600">Perfect for creating from scratch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (uploadMethod === 'upload') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* <button
          onClick={() => setUploadMethod(null)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button> */}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h1>
          <p className="text-xl text-gray-600">Our AI will automatically extract and organize your information</p>
        </div>
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              <span className="text-gray-800 font-medium">Quick Tip</span>
            </div>
            <p className="text-gray-700 mt-2">
              Many Applicant Tracking Systems (ATS) have difficulty reading embedded graphics, tables, images, or unusual formatting. To ensure smooth parsing and better analysis, keep your resume text-based with a clear and consistent structure.
            </p>
          </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!uploadedFile ? (
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-100 border hover:border-blue-800 '
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your resume here</h3>
              <p className="text-gray-600 mb-6">or click to browse your files</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
                id="resume-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="resume-upload"
                className="inline-flex items-center px-6 py-3 bg-gray-900 hover:bg-gray-700 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose File
              </label>
              <p className="text-sm text-gray-500 mt-4">
                Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{uploadedFile.name}</h3>
              <p className="text-gray-600 mb-6">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleFileUpload}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-gray-900  hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>{onParseComplete ? 'Parse & Review' : 'Upload & Process'}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setUploadedFile(null)}
                  disabled={isLoading}
                  className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-5 w-5" />
                  <span>Remove</span>
                </button>
              </div>

              {isLoading && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 font-medium mb-2">🤖 AI Processing in Progress</p>
                  <p className="text-blue-600 text-sm">
                    {onParseComplete 
                      ? 'Our AI is extracting and organizing your resume information for review. This may take 15-30 seconds.'
                      : 'Our AI is extracting and organizing your resume information. This may take 15-30 seconds.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Form upload method
  if (uploadMethod === 'form') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* <button
          onClick={() => setUploadMethod(null)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button> */}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Resume Information</h1>
          <p className="text-xl text-gray-600">Fill out your resume details below</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Professional Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary *
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief overview of your professional background and key strengths..."
              required
              disabled={isLoading}
            />
          </div>

          {/* Experience Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Work Experience *</h3>
              <button
                type="button"
                onClick={addExperience}
                className="bg-gray-900  hover:bg-gray-700 text-white  px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={isLoading}
              >
                Add Experience
              </button>
            </div>
            
            {formData.experience.map((exp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                  {formData.experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g., Jan 2020 - Present)"
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <textarea
                  placeholder="Job description and key achievements..."
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Education *</h3>
              <button
                type="button"
                onClick={addEducation}
                className="bg-gray-900  hover:bg-gray-700 text-white  px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                disabled={isLoading}
              >
                Add Education
              </button>
            </div>
            
            {formData.education.map((edu, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                  {formData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-700"
                      disabled={isLoading}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Institution Name"
                    value={edu.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                  <input
                    type="text"
                    placeholder="Year (e.g., 2020)"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills *
            </label>
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="List your skills separated by commas (e.g., JavaScript, React, Node.js, Python...)"
              required
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => setUploadMethod(null)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gray-900  hover:bg-gray-700 text-white  px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Resume...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5" />
                  <span>Create Resume</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return null;
}