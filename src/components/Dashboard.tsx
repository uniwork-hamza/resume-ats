import React from 'react';
import { Target, Upload, FileText, BarChart3, Clock, CheckCircle } from 'lucide-react';

interface DashboardProps {
  userEmail: string;
  onTestResume: () => void;
  onLogout: () => void;
}

export default function Dashboard({ userEmail, onTestResume, onLogout }: DashboardProps) {
  const recentTests = [
    { id: 1, position: 'Software Engineer', company: 'TechCorp', score: 85, date: '2024-01-15' },
    { id: 2, position: 'Product Manager', company: 'StartupXYZ', score: 92, date: '2024-01-10' },
    { id: 3, position: 'Data Analyst', company: 'DataFirm', score: 78, date: '2024-01-05' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">ResumeATS</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {userEmail.split('@')[0]}</span>
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Ready to optimize your resume for your next job application?</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Test Your Resume</h2>
              <p className="text-blue-100 mb-6">
                Upload your resume and compare it against a job description to get instant feedback and optimization suggestions.
              </p>
              <button
                onClick={onTestResume}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center space-x-2"
              >
                <Upload className="h-5 w-5" />
                <span>Start New Test</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Tests Completed</h3>
                  <p className="text-2xl font-bold text-green-600">3</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Average Score</h3>
                  <p className="text-2xl font-bold text-blue-600">85%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tests */}
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Tests</h2>
          </div>
          <div className="divide-y">
            {recentTests.map((test) => (
              <div key={test.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{test.position}</h3>
                      <p className="text-gray-600">{test.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-600">{test.score}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${test.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {test.date}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}