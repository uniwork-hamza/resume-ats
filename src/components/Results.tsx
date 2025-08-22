import React from 'react';
import { ArrowLeft, Download, CheckCircle, AlertTriangle, TrendingUp, Target, FileText, Award, BookOpen, Lightbulb, Brain, GraduationCap, Briefcase } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import PDFReportTemplate from './PDFReportTemplate'; // Adjust path as needed


interface AnalysisData {
  overallScore: number;
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  formatScore: number;
  jobTitle?: string;
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
    overallFit: string;
    skillsMatch: string;
    educationMatch: string;
    experienceMatch: string;
  };
  recommendations?: {
    experienceGaps: string[];
    skillDevelopment: string[];
    resumeImprovements: string[];
  };
  aiResponse?: {
    strengths: string[];
    improvements: string[];
    keywordMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    formatScore: number;
    overallScore: number;
    missingKeywords: string[];
    keywordData: Array<{
      category: string;
      matched: number;
      total: number;
      percentage: number;
    }>;
    detailedAnalysis: {
      overallFit: string;
      skillsMatch: string;
      educationMatch: string;
      experienceMatch: string;
    };
    recommendations: {
      experienceGaps: string[];
      skillDevelopment: string[];
      resumeImprovements: string[];
    };
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
    keywordData,
    detailedAnalysis,
    recommendations
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

  const handleDownload = async () => {
    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    document.body.appendChild(tempContainer);

    // Render the PDF template
    const { createRoot } = await import('react-dom/client');
    const root = createRoot(tempContainer);

    // Create the PDF template component
    const pdfTemplate = React.createElement(PDFReportTemplate, { analysisData });
    root.render(pdfTemplate);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const canvas = await html2canvas(tempContainer.firstChild as HTMLElement, {
        width: 794,
        scale: 2,
        useCORS: true,
        allowTaint: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`resume-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div id="analysis-report" className="px-14 py-12">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-end py-4 px-4">
          {/* <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button> */}
          <div className="float-right">
            <button onClick={handleDownload} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              <Download className="h-4 w-4 text-white" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-[#182541] to-[#1e1c47] rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Resume Analysis Complete</h1>
              <p className="text-blue-100">Your resume scored {overallScore}% for this position</p>
              {analysisData.jobTitle && (
                <p className="text-blue-100 text-lg font-medium mt-2">Position: {analysisData.jobTitle}</p>
              )}
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
                    <h3 className="font-semibold text-gray-900">Structure Score</h3>
                    <p className="text-sm text-gray-600">Clarity of Resume structure</p>
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
            <div className="grid grid-cols-2 gap-4">
              {keywordData.map((item, index) => (
                <div key={index} className="flex flex-col  justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.category}</h3>
                    <p className="text-sm text-gray-600">{item.matched} of {item.total} keywords found</p>
                  </div>
                  <div className="">
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

          {/* Detailed Analysis Insights */}
          {detailedAnalysis && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <span>Deep Analysis Insights</span>
              </h2>

              <div className="space-y-6">
                {/* Overall Fit */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Overall Fit Assessment</h3>
                  </div>
                  <p className="text-blue-800 text-sm leading-relaxed">{detailedAnalysis.overallFit}</p>
                </div>

                {/* Skills Analysis */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Award className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Skills Assessment</h3>
                  </div>
                  <p className="text-green-800 text-sm leading-relaxed">{detailedAnalysis.skillsMatch}</p>
                </div>

                {/* Experience Analysis */}
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Briefcase className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-indigo-900">Experience Assessment</h3>
                  </div>
                  <p className="text-indigo-800 text-sm leading-relaxed">{detailedAnalysis.experienceMatch}</p>
                </div>

                {/* Education Analysis */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">Education Assessment</h3>
                  </div>
                  <p className="text-purple-800 text-sm leading-relaxed">{detailedAnalysis.educationMatch}</p>
                </div>
              </div>
            </div>
          )}

          {/* Comprehensive Recommendations */}
          {recommendations && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
                <span>Professional Recommendations</span>
              </h2>

              <div className="space-y-6">
                {/* Experience Gaps */}
                {recommendations.experienceGaps && recommendations.experienceGaps.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-red-900">Experience Gaps to Address</h3>
                    </div>
                    <ul className="space-y-2">
                      {recommendations.experienceGaps.map((gap, index) => (
                        <li key={index} className="flex items-start space-x-2 text-red-800 text-sm">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full flex-shrink-0 mt-2"></span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skill Development */}
                {recommendations.skillDevelopment && recommendations.skillDevelopment.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <BookOpen className="h-5 w-5 text-orange-600" />
                      <h3 className="font-semibold text-orange-900">Skill Development Suggestions</h3>
                    </div>
                    <ul className="space-y-2">
                      {recommendations.skillDevelopment.map((skill, index) => (
                        <li key={index} className="flex items-start space-x-2 text-orange-800 text-sm">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0 mt-2"></span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resume Improvements */}
                {recommendations.resumeImprovements && recommendations.resumeImprovements.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Resume Enhancement Tips</h3>
                    </div>
                    <ul className="space-y-2">
                      {recommendations.resumeImprovements.map((improvement, index) => (
                        <li key={index} className="flex items-start space-x-2 text-blue-800 text-sm">
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0 mt-2"></span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
  );
}