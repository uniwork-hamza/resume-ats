// PDFReportTemplate.tsx
import React from 'react';

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
}

interface PDFReportTemplateProps {
  analysisData: AnalysisData;
}

const PDFReportTemplate: React.FC<PDFReportTemplateProps> = ({ analysisData }) => {
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

  const getMatchLevel = (score: number) => {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Strong Match';
    if (score >= 55) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      width: '210mm', // A4 width
      minHeight: '297mm', // A4 height
      background: 'white',
      color: '#333',
      fontSize: '12px',
      lineHeight: '1.4',
      padding: '0',
      margin: '0'
    }}>
      <style>
        {`
          @media print {
            * { 
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          }
          
          .pdf-page {
            width: 210mm;
            min-height: 290mm;
            padding: 20mm;
            box-sizing: border-box;
            page-break-after: always;
            position: relative;
          }
          
          .pdf-page:last-child {
            page-break-after: auto;
          }
          
          .pdf-header {
            margin-bottom: 5px;
            padding-bottom: 15px;
            border-bottom: 3px solid #1e40af;
          }
          
          .pdf-title {
            font-size: 24px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 5px;
            line-height: 1.2;
          }
          
          .pdf-subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
          }
          
          .pdf-meta {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #9ca3af;
          }
          
          .pdf-score-section {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            text-align: center;
          }
          
          .pdf-score-large {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 5px;
            line-height: 1;
          }
          
          .pdf-match-level {
            padding: 0px 12px 5px 12px;
            border-radius: 15px;
            font-weight: 600;
            margin: 15px 10px 10px 10px;
            display: inline-block;
            font-size: 12px;
          }
          
          .pdf-progress-main {
            width: 100%;
            height: 8px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 4px;
            overflow: hidden;
          }
          
          .pdf-progress-bar {
            height: 100%;
            background: white;
            border-radius: 4px;
            transition: none;
          }
          
          .pdf-section {
            margin-bottom: 25px;
            break-inside: avoid;
          }
          
          .pdf-section-title {
            font-size: 16px;
            color: #1e40af;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 15px;
            font-weight: 600;
            break-after: avoid;
          }
          
          .pdf-metrics-container {
            background: #f8fafc;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          
          .pdf-metrics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          
          .pdf-metric-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
          }
          
          .pdf-metric-value {
            font-size: 20px;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 3px;
            line-height: 1;
          }
          
          .pdf-metric-label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }
          
          .pdf-metric-progress {
            width: 100%;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
          }
          
          .pdf-metric-progress .pdf-progress-bar {
            background: #1e40af;
          }
          
          .pdf-table-container {
            background: white;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            margin-bottom: 20px;
            break-inside: avoid;
          }
          
          .pdf-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .pdf-table-header {
            background: #1e40af;
            color: white;
          }
          
          .pdf-table-cell {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
            text-align: left;
          }
          
          .pdf-table tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          
          .pdf-content-box {
            background: #f0f9ff;
            border: 1px solid #bfdbfe;
            border-left: 4px solid #1e40af;
            border-radius: 0 6px 6px 0;
            padding: 12px;
            margin-bottom: 12px;
            break-inside: avoid;
          }
          
          .pdf-content-title {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 5px;
            font-size: 12px;
          }
          
          .pdf-content-text {
            font-size: 11px;
            color: #1e3a8a;
            line-height: 1.3;
          }
          
          .pdf-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .pdf-list-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 6px;
            font-size: 11px;
            line-height: 1.3;
            break-inside: avoid;
          }
          
          .pdf-bullet {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            margin-right: 8px;
            margin-top: 4px;
            flex-shrink: 0;
          }
          
          .pdf-bullet-green { background: #10b981; }
          .pdf-bullet-orange { background: #f59e0b; }
          .pdf-bullet-red { background: #ef4444; }
          .pdf-bullet-blue { background: #3b82f6; }
          .pdf-bullet-purple { background: #8b5cf6; }
          
          .pdf-keyword-container {
            margin-bottom: 15px;
          }
          
          .pdf-keyword-tag {
            display: inline-block;
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
            padding: 0 6px 9px 6PX;
            border-radius: 3px;
            font-size: 10px;
            margin: 0 3PX
          }
          
          .pdf-footer {
            position: absolute;
            bottom:10mm;
            left: 20mm;
            right: 20mm;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            text-align: center;
            font-size: 10px;
            color: #9ca3af;
          }
          
          .pdf-subsection {
            margin-bottom: 15px;
            break-inside: avoid;
          }
          
          .pdf-subsection-title {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #374151;
          }
          
          .pdf-two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .pdf-column {
            break-inside: avoid;
          }
        `}
      </style>

      {/* Page 1 */}
      <div className="pdf-page">
        {/* Header */}
        <div className="pdf-header">
          <h1 className="pdf-title">Resume Analysis Report</h1>
          <p className="pdf-subtitle">Professional ATS & Job Match Analysis</p>
          {analysisData.jobTitle && (
            <p className="pdf-subtitle" style={{ color: '#1e40af', fontWeight: '600', marginTop: '5px' }}>
              Position: {analysisData.jobTitle}
            </p>
          )}
          <div className="pdf-meta">
            <span>Generated: {currentDate}</span>
            <span>Confidential Report</span>
          </div>
        </div>

        {/* Overall Score */}
        <div className="pdf-score-section">
          <div className="pdf-score-large">{overallScore}%</div>
          <div className="pdf-match-level">{getMatchLevel(overallScore)}</div>
          <div className="pdf-progress-main">
            <div className="pdf-progress-bar" style={{width: `${overallScore}%`}}></div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="pdf-section">
          <h2 className="pdf-section-title">Performance Overview</h2>
          <div className="pdf-metrics-container">
            <div className="pdf-metrics-grid">
              <div className="pdf-metric-card">
                <div className="pdf-metric-value">{keywordMatch}%</div>
                <div className="pdf-metric-label">Keyword Match</div>
                <div className="pdf-metric-progress">
                  <div className="pdf-progress-bar" style={{width: `${keywordMatch}%`}}></div>
                </div>
              </div>
              <div className="pdf-metric-card">
                <div className="pdf-metric-value">{skillsMatch}%</div>
                <div className="pdf-metric-label">Skills Match</div>
                <div className="pdf-metric-progress">
                  <div className="pdf-progress-bar" style={{width: `${skillsMatch}%`}}></div>
                </div>
              </div>
              <div className="pdf-metric-card">
                <div className="pdf-metric-value">{experienceMatch}%</div>
                <div className="pdf-metric-label">Experience Match</div>
                <div className="pdf-metric-progress">
                  <div className="pdf-progress-bar" style={{width: `${experienceMatch}%`}}></div>
                </div>
              </div>
              <div className="pdf-metric-card">
                <div className="pdf-metric-value">{formatScore}%</div>
                <div className="pdf-metric-label">Format Score</div>
                <div className="pdf-metric-progress">
                  <div className="pdf-progress-bar" style={{width: `${formatScore}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Keyword Analysis Table */}
        <div className="pdf-section">
          <h2 className="pdf-section-title">Keyword Analysis Breakdown</h2>
          <div className="pdf-table-container">
            <table className="pdf-table">
              <thead className="pdf-table-header">
                <tr>
                  <th className="pdf-table-cell">Category</th>
                  <th className="pdf-table-cell">Found</th>
                  <th className="pdf-table-cell">Total</th>
                  <th className="pdf-table-cell">Score</th>
                </tr>
              </thead>
              <tbody>
                {keywordData.map((item, index) => (
                  <tr key={index}>
                    <td className="pdf-table-cell">{item.category}</td>
                    <td className="pdf-table-cell">{item.matched}</td>
                    <td className="pdf-table-cell">{item.total}</td>
                    <td className="pdf-table-cell">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two Column Layout for Strengths and Improvements */}
        {(strengths.length > 0 || improvements.length > 0) && (
          <div className="pdf-two-column">
            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="pdf-column">
                <div className="pdf-section">
                  <h2 className="pdf-section-title">Key Strengths</h2>
                  <ul className="pdf-list">
                    {strengths.slice(0, 6).map((strength, index) => (
                      <li key={index} className="pdf-list-item">
                        <span className="pdf-bullet pdf-bullet-green"></span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {improvements.length > 0 && (
              <div className="pdf-column">
                <div className="pdf-section">
                  <h2 className="pdf-section-title">Areas for Improvement</h2>
                  <ul className="pdf-list">
                    {improvements.slice(0, 6).map((improvement, index) => (
                      <li key={index} className="pdf-list-item">
                        <span className="pdf-bullet pdf-bullet-orange"></span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer for Page 1 */}
        <div className="pdf-footer">
          <p><strong>Page 1 - Resume Analysis Overview</strong></p>
        </div>
      </div>

      {/* Page 2 - Detailed Analysis and Recommendations */}
      <div className="pdf-page">
        {/* Detailed Analysis */}
        {detailedAnalysis && (
          <div className="pdf-section">
            <h2 className="pdf-section-title">Detailed Professional Assessment</h2>
            
            <div className="pdf-content-box">
              <div className="pdf-content-title">Overall Fit Assessment</div>
              <div className="pdf-content-text">{detailedAnalysis.overallFit}</div>
            </div>

            <div className="pdf-content-box">
              <div className="pdf-content-title">Skills Assessment</div>
              <div className="pdf-content-text">{detailedAnalysis.skillsMatch}</div>
            </div>

            <div className="pdf-content-box">
              <div className="pdf-content-title">Experience Assessment</div>
              <div className="pdf-content-text">{detailedAnalysis.experienceMatch}</div>
            </div>

            <div className="pdf-content-box">
              <div className="pdf-content-title">Education Assessment</div>
              <div className="pdf-content-text">{detailedAnalysis.educationMatch}</div>
            </div>
          </div>
        )}

        {/* Professional Recommendations */}
        {recommendations && (
          <div className="pdf-section">
            <h2 className="pdf-section-title">Professional Recommendations</h2>
            
            {recommendations.experienceGaps && recommendations.experienceGaps.length > 0 && (
              <div className="pdf-subsection">
                <h3 className="pdf-subsection-title">Experience Gaps to Address</h3>
                <ul className="pdf-list">
                  {recommendations.experienceGaps.slice(0, 5).map((gap, index) => (
                    <li key={index} className="pdf-list-item">
                      <span className="pdf-bullet pdf-bullet-red"></span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.skillDevelopment && recommendations.skillDevelopment.length > 0 && (
              <div className="pdf-subsection">
                <h3 className="pdf-subsection-title">Skill Development Suggestions</h3>
                <ul className="pdf-list">
                  {recommendations.skillDevelopment.slice(0, 5).map((skill, index) => (
                    <li key={index} className="pdf-list-item">
                      <span className="pdf-bullet pdf-bullet-blue"></span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.resumeImprovements && recommendations.resumeImprovements.length > 0 && (
              <div className="pdf-subsection">
                <h3 className="pdf-subsection-title">Resume Enhancement Tips</h3>
                <ul className="pdf-list">
                  {recommendations.resumeImprovements.slice(0, 5).map((improvement, index) => (
                    <li key={index} className="pdf-list-item">
                      <span className="pdf-bullet pdf-bullet-purple"></span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Missing Keywords */}
        {missingKeywords.length > 0 && (
          <div className="pdf-section">
            <h2 className="pdf-section-title">Missing Keywords</h2>
            <p style={{fontSize: '11px', color: '#6b7280', marginBottom: '10px'}}>
              Consider adding these important keywords from the job description to improve your ATS score:
            </p>
            <div className="pdf-keyword-container">
              {missingKeywords.slice(0, 20).map((keyword, index) => (
                <span key={index} className="pdf-keyword-tag">{keyword}</span>
              ))}
              {missingKeywords.length > 20 && (
                <span className="pdf-keyword-tag">+{missingKeywords.length - 20} more</span>
              )}
            </div>
          </div>
        )}

        {/* Additional Strengths/Improvements if any overflow from page 1 */}
        {strengths.length > 6 && (
          <div className="pdf-section">
            <h2 className="pdf-section-title">Additional Strengths</h2>
            <ul className="pdf-list">
              {strengths.slice(6).map((strength, index) => (
                <li key={index + 6} className="pdf-list-item">
                  <span className="pdf-bullet pdf-bullet-green"></span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvements.length > 6 && (
          <div className="pdf-section">
            <h2 className="pdf-section-title">Additional Improvement Areas</h2>
            <ul className="pdf-list">
              {improvements.slice(6).map((improvement, index) => (
                <li key={index + 6} className="pdf-list-item">
                  <span className="pdf-bullet pdf-bullet-orange"></span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer for Page 2 */}
        <div className="pdf-footer">
          <p><strong>Page 2 - Detailed Analysis & Recommendations</strong></p>
          <p style={{marginTop: '5px'}}>Generated by AI-Powered Resume Analysis System | Confidential & Proprietary</p>
        </div>
      </div>
    </div>
  );
};

export default PDFReportTemplate;