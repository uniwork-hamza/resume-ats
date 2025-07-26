import React, { useEffect, useState } from 'react';
import { Upload, FileText, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { analysisApi, Analysis } from '../services/api';
import Header from './Header';

interface DashboardProps {
  onTestResume: () => void;
}

export default function Dashboard({ onTestResume }: DashboardProps) {
  // State for recent analyses
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch recent analyses on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await analysisApi.getAnalyses({ page: 1, limit: 3 });
        setAnalyses(res.data?.analyses || []);
      } catch {
        setAnalyses([]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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
            {loading ? (
              <div className="p-6">Loading...</div>
            ) : analyses.length > 0 ? (
              analyses.map((analysis) => (
                <div key={analysis.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{analysis.jobDescription?.title || 'Unknown Job'}</h3>
                        <p className="text-gray-600">{analysis.resume?.title || 'Unknown Resume'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">
                            {analysis.overallScore}%
                          </span>
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${analysis.overallScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(analysis.createdAt).toISOString().slice(0, 10)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6">No tests found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}