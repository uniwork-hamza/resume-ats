import React, { useEffect, useState, ChangeEvent } from 'react';
import { ArrowLeft, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { resumeApi, Resume, ResumeContent } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function ResumeSettings() {
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [formData, setFormData] = useState<ResumeContent>({
    name: '',
    email: '',
    phone: '',
    summary: '',
    experience: [{ company: '', position: '', duration: '', description: '' }],
    education: [{ institution: '', degree: '', year: '', gpa: '' }],
    skills: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await resumeApi.getResume();
        if (res.success && res.data?.resume) {
          setResume(res.data.resume);
          setFormData(res.data.resume.content);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addExperience = () => {
    setFormData(prev => ({ ...prev, experience: [...prev.experience, { company: '', position: '', duration: '', description: '' }] }));
  };
  const removeExperience = (i: number) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));
  };
  const updateExperience = (i: number, field: keyof ResumeContent['experience'][0], value: string) => {
    setFormData(prev => {
      const exp = [...prev.experience];
      exp[i] = { ...exp[i], [field]: value };
      return { ...prev, experience: exp };
    });
  };

  const addEducation = () => {
    setFormData(prev => ({ ...prev, education: [...prev.education, { institution: '', degree: '', year: '', gpa: '' }] }));
  };
  const removeEducation = (i: number) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));
  };
  const updateEducation = (i: number, field: keyof ResumeContent['education'][0], value: string) => {
    setFormData(prev => {
      const edu = [...prev.education];
      edu[i] = { ...edu[i], [field]: value };
      return { ...prev, education: edu };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) return;
    setSaving(true);
    setError(null);
    try {
      const res = await resumeApi.updateResume(resume.id, { content: formData });
      if (res.success && res.data?.resume) {
        setResume(res.data.resume);
        setSuccess('Resume saved successfully!');
      } else {
        setError(res.error || 'Failed to update resume');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update resume');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your resume...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Resume</h1>
          <p className="text-xl text-gray-600">Edit your resume details below</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"><AlertCircle className="inline-block mr-2"/> {error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"><CheckCircle className="inline-block mr-2"/> {success}</div>}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required disabled={saving} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required disabled={saving} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required disabled={saving} />
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary *</label>
            <textarea name="summary" value={formData.summary} onChange={handleChange} rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required disabled={saving} />
          </div>
          {/* Experience */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Work Experience *</h3>
              <button type="button" onClick={addExperience}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm" disabled={saving}>Add Experience</button>
            </div>
            {formData.experience.map((exp, i) => (
              <div key={i} className="border rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Experience {i+1}</h4>
                  {formData.experience.length>1 && <button type="button" onClick={()=>removeExperience(i)} className="text-red-600"><X/></button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Company Name" value={exp.company}
                    onChange={e=>updateExperience(i,'company',e.target.value)} required disabled={saving}
                    className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Job Title" value={exp.position}
                    onChange={e=>updateExperience(i,'position',e.target.value)} required disabled={saving}
                    className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Duration" value={exp.duration}
                    onChange={e=>updateExperience(i,'duration',e.target.value)} required disabled={saving}
                    className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <textarea placeholder="Description" value={exp.description}
                  onChange={e=>updateExperience(i,'description',e.target.value)} rows={3} required disabled={saving}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          {/* Education */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Education *</h3>
              <button type="button" onClick={addEducation}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm" disabled={saving}>Add Education</button>
            </div>
            {formData.education.map((edu,i)=>(
              <div key={i} className="border rounded-lg p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Education {i+1}</h4>
                  {formData.education.length>1 && <button type="button" onClick={()=>removeEducation(i)} className="text-red-600"><X/></button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" placeholder="Institution" value={edu.institution}
                    onChange={e=>updateEducation(i,'institution',e.target.value)} required disabled={saving}
                    className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Degree" value={edu.degree}
                    onChange={e=>updateEducation(i,'degree',e.target.value)} required disabled={saving}
                    className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input type="text" placeholder="Year" value={edu.year}
                    onChange={e=>updateEducation(i,'year',e.target.value)} required disabled={saving}
                    className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <input type="text" placeholder="GPA" value={edu.gpa}
                  onChange={e=>updateEducation(i,'gpa',e.target.value)} required disabled={saving}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
          </div>
          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated) *</label>
            <textarea name="skills" value={formData.skills} onChange={handleChange} rows={2} required disabled={saving}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={saving}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold">
            {saving ? 'Saving...' : 'Save Resume'}
          </button>
        </form>
      </div>
    </div>
  );
} 