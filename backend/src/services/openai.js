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
Please provide a detailed analysis in the following JSON format exactly as specified:

{
  "overallScore": [number between 1-100 - overall match score],
  "keywordMatch": [number between 1-100 - keyword alignment score],
  "skillsMatch": [number between 1-100 - skills alignment score],
  "experienceMatch": [number between 1-100 - experience relevance score],
  "formatScore": [number between 1-100 - resume format and ATS compatibility score],
  "strengths": [array of 3-5 specific strengths where candidate excels],
  "improvements": [array of 3-5 specific areas for improvement],
  "missingKeywords": [array of 5-10 important keywords from job description missing in resume],
  "keywordData": [
    {
      "category": "Technical Skills",
      "matched": [number of matched technical skills],
      "total": [total technical skills required],
      "percentage": [calculated percentage]
    },
    {
      "category": "Soft Skills", 
      "matched": [number of matched soft skills],
      "total": [total soft skills required],
      "percentage": [calculated percentage]
    },
    {
      "category": "Tools & Technologies",
      "matched": [number of matched tools/technologies],
      "total": [total tools/technologies required],
      "percentage": [calculated percentage]
    },
    {
      "category": "Methodologies",
      "matched": [number of matched methodologies],
      "total": [total methodologies required],
      "percentage": [calculated percentage]
    }
  ],
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
1. **Score Calculation Guidelines:**
   - overallScore: Weighted average of all other scores
   - keywordMatch: How well resume keywords match job description (1-100)
   - skillsMatch: Alignment of candidate skills with job requirements (1-100)
   - experienceMatch: Relevance of work experience to the role (1-100)
   - formatScore: ATS-friendliness and resume structure quality (1-100)

2. **Focus Areas:**
   - Extract and count actual keywords from job description
   - Compare technical skills, soft skills, tools, and methodologies
   - Assess experience relevance and level
   - Evaluate resume format and ATS compatibility
   - Provide specific, actionable recommendations

3. **Requirements:**
   - Be specific in all recommendations
   - Count actual keywords and skills for accuracy
   - Calculate percentages based on real matches
   - Provide concrete, actionable feedback
   - Consider ATS optimization

CRITICAL: Return ONLY valid JSON with the exact structure specified above.
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
    // console.log("analysis", analysis);
    // if (!analysis.matchScore || !analysis.strengths || !analysis.weaknesses) {
    //   throw new AppError('Incomplete analysis response', 500);
    // }

    return {
      // Keep backward compatibility for old fields
      matchScore: analysis.overallScore || 0,
      strengths: analysis.strengths || [],
      weaknesses: analysis.improvements || [],
      suggestions: analysis.recommendations?.resumeImprovements || [],
      missingSkills: analysis.missingKeywords || [],
      // Store complete AI response
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