import React, { useEffect, useState } from 'react';
import { ArrowLeft, Upload, FileText, Plus, Loader2 } from 'lucide-react';
import { resumeApi, Resume } from '../services/api';
import { useNavigate } from 'react-router-dom';
import ResumeSettings from './Settings';

export default function ResumeScreen() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResume() {
      setLoading(true);
      try {
        const res = await resumeApi.getResume();
        if (res.success && res.data?.resume) {
          setResume(res.data.resume);
        } else {
          // No resume found - user is new
          setResume(null);
        }
      } catch (e) {
        console.error('Error loading resume:', e);
        setError('Failed to load resume');
      } finally {
        setLoading(false);
      }
    }
    loadResume();
  }, []);

  const handleUploadNewResume = () => {
    navigate('/resume-upload?from=resume');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-900">Loading...</p>
        </div>
      </div>
    );
  }

  // If user has no resume, redirect to upload page
  if (!resume) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Resume Found</h1>
          <p className="text-xl text-blue-900 mb-8">
            You haven't uploaded a resume yet. Let's get started!
          </p>
          
          <button
            onClick={handleUploadNewResume}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center space-x-2 transition-colors"
          >
            <Upload className="h-6 w-6" />
            <span>Upload Your First Resume</span>
          </button>
        </div>
      </div>
    );
  }

  // If user has a resume, show the settings with upload option
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-gray-100 border border-blue-800 rounded-lg p-4 mb-6 flex justify-between">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-6 w-6 text-blue-800" />
          <div>
            <h3 className="font-semibold text-blue-900">Current Resume</h3>
            <p className="text-blue-800">{resume.title}</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleUploadNewResume}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Upload New Resume</span>
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <ResumeSettings />
    </div>
  );
} 