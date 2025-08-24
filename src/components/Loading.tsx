import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle, Clock, BarChart3, AlertCircle } from 'lucide-react';
import { analysisApi, jobApi, Resume, Analysis } from '../services/api';

interface LoadingProps {
  resumeData: Resume;
  jobDescription: string;
  onComplete: (analysisData: Analysis) => void;
}

// Global execution tracking to prevent duplicates across component instances
const ANALYSIS_EXECUTION_KEY = 'current_analysis_execution';

export default function Loading({ resumeData, jobDescription, onComplete }: LoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const executedRef = useRef(false);
  const analysisIdRef = useRef<string>('');

  const steps = [
    { id: 1, text: 'Create JD', description: 'Creating Job Description...', icon: Target, duration: 1000 },
    { id: 2, text: 'Analyse Requirements', description: 'Analysing Job Requirements...', icon: Clock, duration: 1500 },
    { id: 3, text: 'Compare Skills', description: 'Comparing Skills and Experience...', icon: BarChart3, duration: 3000 },
    { id: 4, text: 'Generate Recommendations', description: 'Generating Recommendations...', icon: CheckCircle, duration: 2500 }
  ];

  // Generate unique analysis ID for this session
  useEffect(() => {
    const analysisId = `${resumeData.id}-${jobDescription.slice(0, 50)}-${Date.now()}`;
    analysisIdRef.current = analysisId;
  }, [resumeData.id, jobDescription]);

  useEffect(() => {
    const performAnalysis = async () => {
      // Check global execution state
      const currentExecution = localStorage.getItem(ANALYSIS_EXECUTION_KEY);
      
      if (executedRef.current || currentExecution) {
        console.log('Analysis already executed globally or locally, skipping...', {
          localExecuted: executedRef.current,
          globalExecution: currentExecution
        });
        return;
      }
      
      // Mark as executing globally and locally
      executedRef.current = true;
      localStorage.setItem(ANALYSIS_EXECUTION_KEY, analysisIdRef.current);
      
      console.log('Starting analysis execution with ID:', analysisIdRef.current);

      try {
        setIsAnalyzing(true);
        setError(null);
        
        // Step 1: Create job description
        setCurrentStep(0);
        setProgress(10);
        
        console.log('Creating job description...');
        const jobResponse = await jobApi.createJob({
          title: 'Analysis Job',
          description: jobDescription
        });
        
        if (!jobResponse.success || !jobResponse.data?.job) {
          throw new Error('Failed to create job description');
        }
        
        console.log('Job created successfully:', jobResponse.data.job.id);
        
        // Step 2: Analyze job requirements
        setCurrentStep(1);
        setProgress(25);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Step 3: Perform analysis
        setCurrentStep(2);
        setProgress(50);
        
        console.log('Creating analysis...');
        const analysisResponse = await analysisApi.createAnalysis({
          resumeId: resumeData.id,
          jobDescId: jobResponse.data.job.id
        });
        
        if (!analysisResponse.success || !analysisResponse.data?.analysis) {
          throw new Error('Failed to perform analysis');
        }
        
        console.log('Analysis completed successfully');
        
        // Step 4: Generate recommendations
        setCurrentStep(3);
        setProgress(85);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProgress(100);
        
        // Clear global execution state before completing
        localStorage.removeItem(ANALYSIS_EXECUTION_KEY);
        
        // Complete with analysis data
        setTimeout(() => {
          console.log('Calling onComplete with analysis data');
          onComplete(analysisResponse.data!.analysis);
        }, 500);
        
      } catch (error) {
        console.error('Analysis error:', error);
        setError(error instanceof Error ? error.message : 'Analysis failed');
        
        // Reset states on error
        executedRef.current = false;
        localStorage.removeItem(ANALYSIS_EXECUTION_KEY);
      } finally {
        setIsAnalyzing(false);
      }
    };

    performAnalysis();
  }, []); // Empty dependency array - execute only once

  const handleRetry = () => {
    console.log('Retrying analysis...');
    setError(null);
    setProgress(0);
    setCurrentStep(0);
    
    // Reset both local and global states
    executedRef.current = false;
    localStorage.removeItem(ANALYSIS_EXECUTION_KEY);
    
    // Reload the page to ensure clean state
    window.location.reload();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center px-6 py-8">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis Failed</h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 hover:bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get current step data
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isCompleted = progress === 100;
  const stepProgress = isCompleted ? 100 : 50;

  return (
    <div className="flex items-center justify-center px-6 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="bg-gradient-to-r from-[#182541] to-[#1e1c47] rounded-full p-4">
              <Target className="h-12 w-12 text-white animate-spin" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-[#182541] to-[#1e1c47] rounded-full opacity-20 animate-ping"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysing Your Resume</h1>
          <p className="text-xl text-gray-600">
            Our AI is analysing your resume against the job requirements
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-[#182541] to-[#1e1c47] h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-green-500' 
                    : index === currentStep 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </div>

        {/* Current Step Card */}
        <div className="bg-white rounded-lg p-8 transition-all duration-500 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
              isCompleted 
                ? 'bg-green-500' 
                : 'bg-blue-900'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-8 w-8 text-white" />
              ) : (
                <Icon className="h-8 w-8 text-white animate-pulse" />
              )}
            </div>
            
            <div className="text-center">
              <h3 className={`font-semibold text-2xl mb-2 ${
                isCompleted
                  ? 'text-green-700'
                  : 'text-gray-900'
              }`}>
                {currentStepData.text}
              </h3>
              <p className="text-lg text-gray-500">{currentStepData.description}</p>
            </div>
          </div>
          
          {/* Progress Bar for current step */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{isCompleted ? 'Complete' : `${stepProgress}%`}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : 'bg-blue-900'
                }`}
                style={{ width: `${stepProgress}%` }}
              />
            </div>
          </div>
          
          {/* Status indicator */}
          {/* {!isCompleted && isAnalyzing && (
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-3 h-3 bg-blue-900 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-blue-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}