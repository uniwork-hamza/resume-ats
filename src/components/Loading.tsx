import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, BarChart3 } from 'lucide-react';

interface LoadingProps {
  onComplete: () => void;
}

export default function Loading({ onComplete }: LoadingProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 1, text: 'Parsing resume content...', icon: Target, duration: 2000 },
    { id: 2, text: 'Analyzing job requirements...', icon: Clock, duration: 2500 },
    { id: 3, text: 'Comparing skills and experience...', icon: BarChart3, duration: 2000 },
    { id: 4, text: 'Generating recommendations...', icon: CheckCircle, duration: 1500 }
  ];

  useEffect(() => {
    const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let currentTime = 0;

    const timer = setInterval(() => {
      currentTime += 100;
      const newProgress = Math.min((currentTime / totalDuration) * 100, 100);
      setProgress(newProgress);

      // Update current step
      let accumulatedTime = 0;
      for (let i = 0; i < steps.length; i++) {
        accumulatedTime += steps[i].duration;
        if (currentTime <= accumulatedTime) {
          setCurrentStep(i);
          break;
        }
      }

      if (currentTime >= totalDuration) {
        clearInterval(timer);
        setTimeout(onComplete, 500);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-4">
              <Target className="h-12 w-12 text-white animate-spin" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-20 animate-ping"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Your Resume</h1>
          <p className="text-xl text-gray-600">
            Our AI is comparing your resume against the job requirements
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-500 ${
                  isActive 
                    ? 'bg-blue-50 border-2 border-blue-200 transform scale-105' 
                    : isCompleted 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-white border-2 border-gray-100'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isActive 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-white" />
                  ) : (
                    <Icon className={`h-6 w-6 text-white ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    isCompleted 
                      ? 'text-green-700' 
                      : isActive 
                      ? 'text-blue-700' 
                      : 'text-gray-600'
                  }`}>
                    {step.text}
                  </p>
                </div>
                {isActive && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500">
            This usually takes about 8-10 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}