import OpenAI from 'openai';
import { AppError } from '../middleware/errorHandler.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Resume analysis prompt template
const createAnalysisPrompt = (resumeData, jobDescription) => {
  return `
You are an expert ATS (Applicant Tracking System) and HR consultant. Analyze the following resume against the job description and provide a comprehensive evaluation.

**RESUME DATA:**
${JSON.stringify(resumeData, null, 2)}

**JOB DESCRIPTION:**
Title: ${jobDescription.title}
${jobDescription.description}

**ANALYSIS REQUIREMENTS:**
Please provide a detailed analysis in the following JSON format:

{
  "matchScore": [number between 0-100],
  "strengths": [array of candidate's strengths matching the job],
  "weaknesses": [array of areas where candidate is lacking],
  "suggestions": [array of specific improvements candidate can make],
  "missingSkills": [array of required skills not found in resume],
  "detailedAnalysis": {
    "experienceMatch": "[detailed analysis of experience alignment]",
    "skillsMatch": "[detailed analysis of skills alignment]",
    "educationMatch": "[detailed analysis of education alignment]",
    "overallFit": "[overall assessment of candidate fit]"
  },
  "recommendations": {
    "resumeImprovements": [array of specific resume improvements],
    "skillDevelopment": [array of skills to develop],
    "experienceGaps": [array of experience gaps to address]
  }
}

**ANALYSIS CRITERIA:**
1. **Match Score Calculation:**
   - Skills match: 40%
   - Experience relevance: 30%
   - Education/Qualifications: 20%
   - Overall presentation: 10%

2. **Focus Areas:**
   - Technical skills alignment
   - Experience level and relevance
   - Education and certifications
   - Resume completeness and presentation
   - Keyword matching for ATS compatibility

3. **Provide Specific Feedback:**
   - Be specific in recommendations
   - Suggest concrete actions
   - Highlight both positive aspects and areas for improvement
   - Consider ATS optimization

Please ensure the response is valid JSON and provides actionable insights.
`;
};

// Resume optimization prompt
const createOptimizationPrompt = (resumeData, jobDescription) => {
  return `
You are an expert resume writer and ATS optimization specialist. Analyze the resume and provide specific optimization recommendations for the given job description.

**RESUME DATA:**
${JSON.stringify(resumeData, null, 2)}

**JOB DESCRIPTION:**
${JSON.stringify(jobDescription, null, 2)}

**OPTIMIZATION REQUIREMENTS:**
Provide optimization recommendations in the following JSON format:

{
  "atsOptimization": {
    "keywordSuggestions": [array of keywords to include],
    "formattingTips": [array of formatting improvements],
    "sectionRecommendations": [array of section improvements]
  },
  "contentOptimization": {
    "summaryImprovement": "[improved summary suggestion]",
    "experienceEnhancements": [array of experience section improvements],
    "skillsAlignment": [array of skills to emphasize or add],
    "achievementHighlights": [array of achievements to emphasize]
  },
  "strategicRecommendations": {
    "priorityChanges": [array of most important changes],
    "industrySpecificTips": [array of industry-specific recommendations],
    "competitiveAdvantage": [array of ways to stand out]
  }
}

Focus on:
1. ATS compatibility and keyword optimization
2. Content relevance and impact
3. Strategic positioning for the specific role
4. Quantifiable achievements and results
`;
};

// Resume parsing prompt template
const createResumeParsingPrompt = (resumeText) => {
  return `
You are an expert resume parser. Extract and structure the following resume text into a standardized JSON format.

**RESUME TEXT:**
${resumeText}

**REQUIRED JSON FORMAT:**
{
  "name": "[Full name of the candidate]",
  "email": "[Email address]",
  "phone": "[Phone number]",
  "summary": "[Professional summary or objective - if not present, create a brief one based on the resume]",
  "experience": [
    {
      "company": "[Company name]",
      "position": "[Job title/position]",
      "duration": "[Employment period, e.g., 'Jan 2020 - Present' or 'Jan 2020 - Dec 2022']",
      "description": "[Job description and key achievements]"
    }
  ],
  "education": [
    {
      "institution": "[Educational institution name]",
      "degree": "[Degree type and field, e.g., 'Bachelor of Science in Computer Science']",
      "year": "[Graduation year or period]",
      "gpa": "[GPA if mentioned, otherwise empty string]"
    }
  ],
  "skills": "[Comma-separated list of all skills mentioned in the resume]"
}

**EXTRACTION GUIDELINES:**
1. **Personal Information**: Extract name, email, phone from contact section
2. **Summary**: Use existing summary/objective, or create one based on experience (2-3 sentences)
3. **Experience**: List all jobs in reverse chronological order
   - Include company name, position, duration, and detailed description
   - Combine responsibilities and achievements into description
4. **Education**: List all educational qualifications
   - Include institution, degree, graduation year
   - Only include GPA if explicitly mentioned
5. **Skills**: Extract all technical and soft skills mentioned throughout the resume
   - Combine into a comma-separated string
   - Include programming languages, tools, certifications, etc.

**IMPORTANT:**
- Return ONLY valid JSON
- If any field is missing, use empty string "" for strings or empty array [] for arrays
- Ensure all strings are properly escaped
- Be comprehensive but accurate to the source material
- If no summary exists, create a professional one based on the candidate's experience
`;
};

// Main analysis function
export const analyzeResume = async (resumeData, jobDescription) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError('OpenAI API key is not configured', 500);
    }

    const prompt = createAnalysisPrompt(resumeData, jobDescription);

    const response = await openai.chat.completions.create({
      model: 'gpt-4', // or 'gpt-3.5-turbo' for cost efficiency
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS and HR consultant. Provide detailed, actionable resume analysis in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const analysisText = response.choices[0].message.content;
    
    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new AppError('Invalid response format from OpenAI', 500);
      }
    }

    // Validate required fields
    if (!analysis.matchScore || !analysis.strengths || !analysis.weaknesses) {
      throw new AppError('Incomplete analysis response', 500);
    }

    return {
      matchScore: analysis.matchScore,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      suggestions: analysis.suggestions || [],
      missingSkills: analysis.missingSkills || [],
      aiResponse: analysis,
    };

  } catch (error) {
    console.error('OpenAI Analysis Error:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new AppError('OpenAI quota exceeded. Please try again later.', 503);
    }
    
    if (error.code === 'rate_limit_exceeded') {
      throw new AppError('Too many requests. Please try again later.', 429);
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Failed to analyze resume. Please try again.', 500);
  }
};

// Resume optimization function
export const optimizeResume = async (resumeData, jobDescription) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError('OpenAI API key is not configured', 500);
    }

    const prompt = createOptimizationPrompt(resumeData, jobDescription);

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer and ATS optimization specialist. Provide specific optimization recommendations in valid JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const optimizationText = response.choices[0].message.content;
    
    // Parse the JSON response
    let optimization;
    try {
      optimization = JSON.parse(optimizationText);
    } catch (parseError) {
      const jsonMatch = optimizationText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimization = JSON.parse(jsonMatch[0]);
      } else {
        throw new AppError('Invalid response format from OpenAI', 500);
      }
    }

    return optimization;

  } catch (error) {
    console.error('OpenAI Optimization Error:', error);
    
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Failed to optimize resume. Please try again.', 500);
  }
};

// Resume parsing function
export const parseResumeText = async (resumeText) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError('OpenAI API key is not configured', 500);
    }

    const prompt = createResumeParsingPrompt(resumeText);

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume parser. Extract resume information into the exact JSON format specified. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent parsing
      max_tokens: 2000,
    });

    const parseText = response.choices[0].message.content;
    
    // Parse the JSON response
    let parsedResume;
    try {
      parsedResume = JSON.parse(parseText);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Try to extract JSON from the response
      const jsonMatch = parseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResume = JSON.parse(jsonMatch[0]);
      } else {
        throw new AppError('Invalid response format from OpenAI', 500);
      }
    }

    // Validate required structure
    const requiredFields = ['name', 'email', 'phone', 'summary', 'experience', 'education', 'skills'];
    const missingFields = requiredFields.filter(field => !(field in parsedResume));
    
    if (missingFields.length > 0) {
      console.error('Missing fields in parsed resume:', missingFields);
      // Fill in missing fields with defaults
      requiredFields.forEach(field => {
        if (!(field in parsedResume)) {
          if (field === 'experience' || field === 'education') {
            parsedResume[field] = [];
          } else {
            parsedResume[field] = '';
          }
        }
      });
    }

    // Ensure experience and education are arrays
    if (!Array.isArray(parsedResume.experience)) {
      parsedResume.experience = [];
    }
    if (!Array.isArray(parsedResume.education)) {
      parsedResume.education = [];
    }

    // Validate experience objects
    parsedResume.experience = parsedResume.experience.map(exp => ({
      company: exp.company || '',
      position: exp.position || '',
      duration: exp.duration || '',
      description: exp.description || ''
    }));

    // Validate education objects
    parsedResume.education = parsedResume.education.map(edu => ({
      institution: edu.institution || '',
      degree: edu.degree || '',
      year: edu.year || '',
      gpa: edu.gpa || ''
    }));

    // Ensure skills is a string
    if (typeof parsedResume.skills !== 'string') {
      parsedResume.skills = '';
    }

    return parsedResume;

  } catch (error) {
    console.error('Resume Parsing Error:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new AppError('OpenAI quota exceeded. Please try again later.', 503);
    }
    
    if (error.code === 'rate_limit_exceeded') {
      throw new AppError('Too many requests. Please try again later.', 429);
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Failed to parse resume. Please try again.', 500);
  }
};

// Simple chat function for general questions
export const chatWithAI = async (message, context = null) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new AppError('OpenAI API key is not configured', 500);
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful career counselor and resume expert. Provide concise, actionable advice.',
      },
    ];

    if (context) {
      messages.push({
        role: 'user',
        content: `Context: ${JSON.stringify(context)}`,
      });
    }

    messages.push({
      role: 'user',
      content: message,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('OpenAI Chat Error:', error);
    throw new AppError('Failed to get AI response. Please try again.', 500);
  }
}; 