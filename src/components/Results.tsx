import React from 'react';
import { ArrowLeft, Download, Share2, CheckCircle, AlertTriangle, TrendingUp, Target, FileText, Award } from 'lucide-react';

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

interface ResultsProps {
  analysisData: AnalysisData;
  onBack: () => void;
  onStartNewTest: () => void;
}

export default function Results({ analysisData, onBack, onStartNewTest }: ResultsProps) {
  const {
    overallScore,
    keywordMatch,
    skillsMatch,
    experienceMatch,
    formatScore,
    strengths,
    improvements,
    missingKeywords,
    keywordData
  } = analysisData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchLevel = (score: number) => {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Strong Match';
    if (score >= 55) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </button>
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share Results</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overall Score */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Resume Analysis Complete</h1>
                <p className="text-blue-100">Your resume scored {overallScore}% for this position</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold mb-2">{overallScore}%</div>
                <div className="bg-white bg-opacity-20 rounded-full px-4 py-2">
                  <span className="text-sm font-medium">{getMatchLevel(overallScore)}</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${overallScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Detailed Scores */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Analysis</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Keyword Match</h3>
                      <p className="text-sm text-gray-600">How well your resume matches job keywords</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(keywordMatch)}`}>{keywordMatch}%</div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className={`h-full rounded-full ${getProgressColor(keywordMatch)}`} style={{ width: `${keywordMatch}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Award className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Skills Match</h3>
                      <p className="text-sm text-gray-600">Alignment of your skills with requirements</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(skillsMatch)}`}>{skillsMatch}%</div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className={`h-full rounded-full ${getProgressColor(skillsMatch)}`} style={{ width: `${skillsMatch}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Experience Match</h3>
                      <p className="text-sm text-gray-600">Relevance of your work experience</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(experienceMatch)}`}>{experienceMatch}%</div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className={`h-full rounded-full ${getProgressColor(experienceMatch)}`} style={{ width: `${experienceMatch}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Format Score</h3>
                      <p className="text-sm text-gray-600">ATS-friendliness of your resume format</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(formatScore)}`}>{formatScore}%</div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div className={`h-full rounded-full ${getProgressColor(formatScore)}`} style={{ width: `${formatScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Keyword Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Keyword Analysis</h2>
              <div className="space-y-4">
                {keywordData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.category}</h3>
                      <p className="text-sm text-gray-600">{item.matched} of {item.total} keywords found</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(item.percentage)}`}>{item.percentage}%</div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(item.percentage)}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Keywords */}
            {missingKeywords.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Missing Keywords</h2>
                <p className="text-gray-600 mb-4">
                  Consider adding these important keywords from the job description to improve your ATS score:
                </p>
                <div className="flex flex-wrap gap-2">
                  {missingKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-red-50 text-red-700 px-3 py-2 rounded-lg font-medium border border-red-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span>Strengths</span>
                </h3>
                <div className="space-y-3">
                  {strengths.map((strength, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {improvements.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <span>Areas for Improvement</span>
                </h3>
                <div className="space-y-3">
                  {improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{improvement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Ready for Another Test?</h3>
              <p className="text-green-100 mb-6">
                Test your resume against different job descriptions to maximize your chances.
              </p>
              <button
                onClick={onStartNewTest}
                className="w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Start New Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}