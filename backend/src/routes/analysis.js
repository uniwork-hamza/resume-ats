import express from 'express';
import { prisma } from '../config/database.js';
import { protect } from '../middleware/auth.js';
import { validate, analysisSchemas } from '../utils/validation.js';
import { AppError } from '../middleware/errorHandler.js';
import { analyzeResume, optimizeResume } from '../services/openai.js';

const router = express.Router();

// Get all analyses for current user
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      prisma.analysis.findMany({
        where: {
          userId: req.user.id,
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          resume: {
            select: {
              id: true,
              title: true,
            },
          },
          jobDescription: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.analysis.count({
        where: { userId: req.user.id },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        analyses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single analysis
router.get('/:id', protect, async (req, res, next) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
        jobDescription: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!analysis) {
      return next(new AppError('Analysis not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new analysis
router.post('/', protect, validate(analysisSchemas.create), async (req, res, next) => {
  try {
    const { resumeId, jobDescId } = req.body;

    // Validate that resume and job description exist and belong to user
    const [resume, jobDescription] = await Promise.all([
      prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: req.user.id,
        },
      }),
      prisma.jobDescription.findFirst({
        where: {
          id: jobDescId,
          userId: req.user.id,
        },
      }),
    ]);

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    if (!jobDescription) {
      return next(new AppError('Job description not found', 404));
    }

    // Check if analysis already exists for this combination
    const existingAnalysis = await prisma.analysis.findFirst({
      where: {
        resumeId,
        jobDescId,
        userId: req.user.id,
      },
    });

    if (existingAnalysis) {
      return next(new AppError('Analysis already exists for this resume and job combination', 400));
    }

    // Perform AI analysis
    const analysisResult = await analyzeResume(resume.content, jobDescription);
    console.log('OpenAI Analysis Result:', analysisResult);
    
    // Save analysis to database with proper field mapping
    const newAnalysis = await prisma.analysis.create({
      data: {
        // Map OpenAI response fields to database schema
        overallScore: analysisResult.aiResponse.overallScore || analysisResult.matchScore || 0,
        keywordMatch: analysisResult.aiResponse.keywordMatch || 0,
        skillsMatch: analysisResult.aiResponse.skillsMatch || 0,
        experienceMatch: analysisResult.aiResponse.experienceMatch || 0,
        formatScore: analysisResult.aiResponse.formatScore || 0,
        jobTitle: analysisResult.aiResponse.jobTitle || null,
        strengths: analysisResult.aiResponse.strengths || analysisResult.strengths || [],
        improvements: analysisResult.aiResponse.improvements || analysisResult.weaknesses || [],
        missingKeywords: analysisResult.aiResponse.missingKeywords || analysisResult.missingSkills || [],
        keywordData: analysisResult.aiResponse.keywordData || [],
        detailedAnalysis: analysisResult.aiResponse.detailedAnalysis || null,
        recommendations: analysisResult.aiResponse.recommendations || null,
        aiResponse: analysisResult.aiResponse,
        userId: req.user.id,
        resumeId,
        jobDescId,
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
        jobDescription: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        analysis: newAnalysis,
      },
    });
  } catch (error) {
    console.error('Analysis creation error:', error);
    next(error);
  }
});

// Re-analyze (update existing analysis)
router.post('/:id/reanalyze', protect, async (req, res, next) => {
  try {
    // Check if analysis exists and belongs to user
    const existingAnalysis = await prisma.analysis.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        resume: true,
        jobDescription: true,
      },
    });

    if (!existingAnalysis) {
      return next(new AppError('Analysis not found', 404));
    }

    // Perform AI analysis again
    const analysisResult = await analyzeResume(
      existingAnalysis.resume.content,
      existingAnalysis.jobDescription
    );

    // Update analysis in database
    const updatedAnalysis = await prisma.analysis.update({
      where: {
        id: req.params.id,
      },
      data: {
        // Map OpenAI response fields to database schema
        overallScore: analysisResult.aiResponse.overallScore || analysisResult.matchScore || 0,
        keywordMatch: analysisResult.aiResponse.keywordMatch || 0,
        skillsMatch: analysisResult.aiResponse.skillsMatch || 0,
        experienceMatch: analysisResult.aiResponse.experienceMatch || 0,
        formatScore: analysisResult.aiResponse.formatScore || 0,
        jobTitle: analysisResult.aiResponse.jobTitle || null,
        strengths: analysisResult.aiResponse.strengths || analysisResult.strengths || [],
        improvements: analysisResult.aiResponse.improvements || analysisResult.weaknesses || [],
        missingKeywords: analysisResult.aiResponse.missingKeywords || analysisResult.missingSkills || [],
        keywordData: analysisResult.aiResponse.keywordData || [],
        detailedAnalysis: analysisResult.aiResponse.detailedAnalysis || null,
        recommendations: analysisResult.aiResponse.recommendations || null,
        aiResponse: analysisResult.aiResponse,
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
        jobDescription: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        analysis: updatedAnalysis,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete analysis
router.delete('/:id', protect, async (req, res, next) => {
  try {
    // Check if analysis exists and belongs to user
    const existingAnalysis = await prisma.analysis.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingAnalysis) {
      return next(new AppError('Analysis not found', 404));
    }

    // Delete analysis from database
    await prisma.analysis.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get optimization suggestions
router.post('/optimize', protect, async (req, res, next) => {
  try {
    const { resumeId, jobDescId } = req.body;

    // Validate that resume and job description exist and belong to user
    const [resume, jobDescription] = await Promise.all([
      prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: req.user.id,
        },
      }),
      prisma.jobDescription.findFirst({
        where: {
          id: jobDescId,
          userId: req.user.id,
        },
      }),
    ]);

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    if (!jobDescription) {
      return next(new AppError('Job description not found', 404));
    }

    // Get optimization suggestions from AI
    const optimizationResult = await optimizeResume(resume.content, jobDescription);

    res.status(200).json({
      success: true,
      data: {
        optimization: optimizationResult,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get analysis statistics
router.get('/stats/overview', protect, async (req, res, next) => {
  try {
    const [totalAnalyses, avgMatchScore, recentAnalyses] = await Promise.all([
      prisma.analysis.count({
        where: { userId: req.user.id },
      }),
      prisma.analysis.aggregate({
        where: { userId: req.user.id },
        _avg: {
          matchScore: true,
        },
      }),
      prisma.analysis.count({
        where: {
          userId: req.user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    // Get top performing analyses
    const topAnalyses = await prisma.analysis.findMany({
      where: { userId: req.user.id },
      orderBy: {
        matchScore: 'desc',
      },
      take: 5,
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
        jobDescription: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalAnalyses,
        avgMatchScore: avgMatchScore._avg.matchScore || 0,
        recentAnalyses,
        topAnalyses,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router; 