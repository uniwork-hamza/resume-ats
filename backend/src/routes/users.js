import express from 'express';
import { prisma } from '../config/database.js';
import { protect } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get user dashboard statistics
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const [resumeStats, jobStats, analysisStats] = await Promise.all([
      // Resume statistics
      prisma.resume.groupBy({
        by: ['isActive'],
        where: { userId: req.user.id },
        _count: true,
      }),
      // Job description statistics
      prisma.jobDescription.groupBy({
        by: ['isActive'],
        where: { userId: req.user.id },
        _count: true,
      }),
      // Analysis statistics
      prisma.analysis.aggregate({
        where: { userId: req.user.id },
        _count: true,
        _avg: {
          overallScore: true,
        },
      }),
    ]);

    // Get recent activities
    const recentActivities = await prisma.analysis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
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

    // Process statistics
    const resumeCount = resumeStats.reduce((acc, stat) => acc + stat._count, 0);
    const activeResumes = resumeStats.find(stat => stat.isActive)?._count || 0;
    
    const jobCount = jobStats.reduce((acc, stat) => acc + stat._count, 0);
    const activeJobs = jobStats.find(stat => stat.isActive)?._count || 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          resumes: {
            total: resumeCount,
            active: activeResumes,
          },
          jobs: {
            total: jobCount,
            active: activeJobs,
          },
          analyses: {
            total: analysisStats._count,
            avgOverallScore: analysisStats._avg.overallScore || 0,
          },
        },
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user activity timeline
router.get('/activity', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, days = 30 } = req.query;
    const skip = (page - 1) * limit;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get recent resumes
    const resumes = await prisma.resume.findMany({
      where: {
        userId: req.user.id,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get recent job descriptions
    const jobs = await prisma.jobDescription.findMany({
      where: {
        userId: req.user.id,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        title: true,
        company: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get recent analyses
    const analyses = await prisma.analysis.findMany({
      where: {
        userId: req.user.id,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        matchScore: true,
        createdAt: true,
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
      orderBy: { createdAt: 'desc' },
    });

    // Combine and sort activities
    const activities = [
      ...resumes.map(resume => ({
        id: resume.id,
        type: 'resume',
        title: resume.title,
        createdAt: resume.createdAt,
      })),
      ...jobs.map(job => ({
        id: job.id,
        type: 'job',
        title: job.title,
        createdAt: job.createdAt,
      })),
      ...analyses.map(analysis => ({
        id: analysis.id,
        type: 'analysis',
        matchScore: analysis.matchScore,
        resume: analysis.resume,
        jobDescription: analysis.jobDescription,
        createdAt: analysis.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const paginatedActivities = activities.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          total: activities.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(activities.length / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user profile with statistics
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get comprehensive statistics
    const [
      totalResumes,
      totalJobs,
      totalAnalyses,
      bestAnalysis,
      recentAnalyses,
    ] = await Promise.all([
      prisma.resume.count({
        where: { userId: req.user.id },
      }),
      prisma.jobDescription.count({
        where: { userId: req.user.id },
      }),
      prisma.analysis.count({
        where: { userId: req.user.id },
      }),
      prisma.analysis.findFirst({
        where: { userId: req.user.id },
        orderBy: { matchScore: 'desc' },
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
      prisma.analysis.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          matchScore: true,
          createdAt: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          statistics: {
            totalResumes,
            totalJobs,
            totalAnalyses,
            bestMatchScore: bestAnalysis?.matchScore || 0,
            bestMatch: bestAnalysis || null,
            recentAnalyses,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Export user data (GDPR compliance)
router.get('/export', protect, async (req, res, next) => {
  try {
    const [user, resumes, jobs, analyses] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.resume.findMany({
        where: { userId: req.user.id },
      }),
      prisma.jobDescription.findMany({
        where: { userId: req.user.id },
      }),
      prisma.analysis.findMany({
        where: { userId: req.user.id },
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
    ]);

    const exportData = {
      user,
      resumes,
      jobDescriptions: jobs,
      analyses,
      exportDate: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    next(error);
  }
});

// Delete user account (with all data)
router.delete('/account', protect, async (req, res, next) => {
  try {
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return next(new AppError('Password confirmation is required', 400));
    }

    // Get user with password for verification
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isPasswordValid = await bcrypt.compare(confirmPassword, user.password);

    if (!isPasswordValid) {
      return next(new AppError('Invalid password', 401));
    }

    // Delete user and all associated data (cascading delete)
    await prisma.user.delete({
      where: { id: req.user.id },
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router; 