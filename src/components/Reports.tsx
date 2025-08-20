import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, BarChart3, FileText, Eye, Clock } from 'lucide-react';
import { analysisApi, userApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Analysis {
    id: string;
    jobTitle?: string;
    jobDescription?: { title: string };
    resume?: { title: string };
    overallScore: number;
    createdAt: string;
}

interface DashboardStats {
    totalTests: number;
    averageScore: number;
}

export default function Reports() {
    const [analyses, setAnalyses] = useState<Analysis[]>([]);
    const [stats, setStats] = useState<DashboardStats>({ totalTests: 0, averageScore: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all analyses
                const analysesResponse = await analysisApi.getAnalyses({ page: 1, limit: 50 });
                if (analysesResponse.success) {
                    setAnalyses(analysesResponse.data.analyses || []);
                }

                // Fetch dashboard stats
                const dashboardRes = await userApi.getDashboard();
                if (dashboardRes.success && dashboardRes.data) {
                    const data = dashboardRes.data as {
                        stats: {
                            analyses: {
                                total: number;
                                avgOverallScore: number;
                            };
                        };
                    };
                    setStats({
                        totalTests: data.stats.analyses.total,
                        averageScore: Math.round(data.stats.analyses.avgOverallScore)
                    });
                }
            } catch (error) {
                console.error('Error fetching reports data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTestResume = () => {
        navigate('/upload');
    };

    const handleViewAnalysis = (analysisId: string) => {
        navigate(`/results/${analysisId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toISOString().slice(0, 10);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-14 py-12">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Your Resume Performance Reports
                </h1>
                <p className="text-xl text-gray-600">
                    Track your test history, scores, and insights to improve your resume effectiveness.
                </p>
            </div>

            {/* Main Cards Grid */}
            <div className="grid grid-cols-2 gap-8 mb-12">

                {/* Tests Completed */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Tests Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
                        </div>
                    </div>
                </div>

                {/* Average Score */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Average Score</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Recent Tests Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Tests</h2>

                {analyses.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No tests completed yet. Start your first test to see results here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {analyses.map((analysis) => (
                            <div
                                key={analysis.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <FileText className="h-6 w-6 text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-600">{analysis.jobTitle || analysis.jobDescription?.title || 'Unknown Job'}</p>
                                        <p className="text-sm text-gray-600">{analysis.resume?.title || 'Unknown Resume'}</p>
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
                                        {formatDate(analysis.createdAt)}
                                    </div>

                                    <button
                                        onClick={() => handleViewAnalysis(analysis.id)}
                                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                                    >
                                        <Eye className="h-4 w-4" />
                                        <span>View</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
