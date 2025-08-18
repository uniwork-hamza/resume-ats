import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, FileText, Briefcase } from 'lucide-react';

interface JobDescriptionProps {
  onNext: (jobDescription: string) => void;
  onBack: () => void;
}

export default function JobDescription({ onNext, onBack }: JobDescriptionProps) {
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      onNext(jobDescription);
    }
  };

  const sampleJobs = [
    {
      title: 'Software Engineer',
      company: 'TechCorp',
      description: `We are seeking a talented Software Engineer to join our growing team. The ideal candidate will have experience with modern web technologies and a passion for building scalable applications.

Key Responsibilities:
• Develop and maintain web applications using React, Node.js, and TypeScript
• Collaborate with cross-functional teams to deliver high-quality software
• Write clean, maintainable, and well-documented code
• Participate in code reviews and contribute to technical discussions
• Work with cloud services (AWS, Azure) and containerization technologies

Requirements:
• Bachelor's degree in Computer Science or related field
• 3+ years of experience in software development
• Proficiency in JavaScript, TypeScript, React, and Node.js
• Experience with databases (SQL and NoSQL)
• Familiarity with version control systems (Git)
• Strong problem-solving skills and attention to detail
• Excellent communication and teamwork abilities

Preferred Qualifications:
• Experience with cloud platforms (AWS, Azure, GCP)
• Knowledge of containerization (Docker, Kubernetes)
• Understanding of CI/CD pipelines
• Experience with testing frameworks (Jest, Cypress)
• Agile development methodology experience`
    },
    {
      title: 'Product Manager',
      company: 'InnovateCorp',
      description: `We're looking for an experienced Product Manager to lead our product development initiatives and drive strategic product decisions.

Key Responsibilities:
• Define product strategy and roadmap in alignment with business objectives
• Conduct market research and competitive analysis
• Collaborate with engineering, design, and marketing teams
• Gather and prioritize product requirements
• Monitor product performance and user feedback
• Lead product launches and go-to-market strategies

Requirements:
• Bachelor's degree in Business, Engineering, or related field
• 5+ years of product management experience
• Strong analytical and problem-solving skills
• Experience with product management tools (Jira, Confluence, etc.)
• Excellent communication and presentation skills
• Understanding of software development lifecycle
• Data-driven decision making approach

Preferred Qualifications:
• MBA or advanced degree
• Experience in SaaS products
• Technical background or engineering experience
• Experience with A/B testing and analytics tools
• Agile/Scrum methodology experience`
    }
  ];

  const applySample = (sample: typeof sampleJobs[0]) => {
    setJobDescription(sample.description);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Description</h1>
        <p className="text-xl text-gray-600">Paste the job description you're applying for to get targeted feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Copy and paste the complete job description here including requirements, responsibilities, and qualifications..."
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {jobDescription.length} characters
                </div>
                <button
                  type="submit"
                  disabled={!jobDescription.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
                >
                  <span>Analyze Resume</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sample Jobs Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Sample Jobs</span>
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Try one of these sample job descriptions to see how the analysis works
            </p>
            
            <div className="space-y-3">
              {sampleJobs.map((job, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => applySample(job)}
                >
                  <h4 className="font-semibold text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-700">
                    Use this sample →
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Pro Tip</h4>
                <p className="text-blue-700 text-sm">
                  Include the complete job description with requirements, responsibilities, and preferred qualifications for the most accurate analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}