import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { resumeApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

interface ReviewResumeProps {
  parsedData: ResumeFormData;
  fileName: string;
  onNext: (resumeData: { id: string; title: string; content: ResumeFormData }) => void;
  onBack: () => void;
}

export default function ReviewResume({ parsedData, fileName, onNext, onBack }: ReviewResumeProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<ResumeFormData>({
    name: parsedData.name || user?.name || '',
    email: parsedData.email || user?.email || '',
    summary: parsedData.summary || '',
    experience: parsedData.experience && parsedData.experience.length > 0 
      ? parsedData.experience 
      : [{ company: '', position: '', duration: '', description: '' }],
    education: parsedData.education && parsedData.education.length > 0 
      ? parsedData.education 
      : [{ institution: '', degree: '', year: '', gpa: '' }],
    skills: parsedData.skills || ''
  });

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
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
        title: fileName.replace(/\.[^/.]+$/, '') + " Resume",
        type: 'file',
        content: formData
      });

      if (response.success && response.data?.resume) {
        setSuccess('Resume saved successfully!');
        setTimeout(() => {
          onNext(response.data!.resume);
        }, 1000);
      } else {
        throw new Error('Failed to save resume');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save resume');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12">
        {/* <button
          onClick={onBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
          disabled={isLoading}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button> */}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Review Your Resume</h1>
          <p className="text-xl text-blue-800">
            We've extracted your information from <span className="font-medium text-blue-800">{fileName}</span>. 
            Please review and complete any missing fields.
          </p>
        </div>

        {/* AI Extraction Notice */}
        <div className="bg-gray-100 border border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-900" />
            <span className="text-blue-900 font-medium">✨ AI Extraction Complete</span>
          </div>
          <p className="text-blue-900 mt-2">
            Your resume has been automatically parsed. Please review all fields and fill in any missing information before saving.
          </p>
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
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
          </div>

          {/* Professional Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
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
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900  hover:bg-gray-700 text-white  transition-colors"
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
                  {/* <input
                    type="text"
                    placeholder="GPA (optional)"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  /> */}
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
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
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gray-900  hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving Resume...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5" />
                  <span>Save Resume</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 