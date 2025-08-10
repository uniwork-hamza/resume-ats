import express from 'express';
import { prisma } from '../config/database.js';
import { protect } from '../middleware/auth.js';
import { validate, jobSchemas } from '../utils/validation.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Helper function to extract job title from description
function extractTitleFromDescription(description) {
  // Simple extraction - look for common patterns
  const lines = description.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Look for lines that might contain job titles
    if (trimmed.length > 3 && trimmed.length < 100) {
      // Check if it looks like a title (not too long, no bullet points)
      if (!trimmed.includes('•') && !trimmed.includes('-') && !trimmed.startsWith('Requirements')) {
        const titleMatch = trimmed.match(/^(.+?)(?:\s*-\s*|\s*at\s*|\s*@\s*|$)/i);
        if (titleMatch) {
          return titleMatch[1].trim();
        }
      }
    }
  }
  return null;
}

// Get all job descriptions for current user
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            company: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.jobDescription.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.jobDescription.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        jobs,
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

// Get single job description
router.get('/:id', protect, async (req, res, next) => {
  try {
    const job = await prisma.jobDescription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!job) {
      return next(new AppError('Job description not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        job,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new job description
router.post('/', protect, validate(jobSchemas.create), async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // If no title provided, try to extract from description or use default
    const jobTitle = title || extractTitleFromDescription(description) || 'Job Position';

    const newJob = await prisma.jobDescription.create({
      data: {
        title: jobTitle,
        description,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        job: newJob,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update job description
router.patch('/:id', protect, validate(jobSchemas.update), async (req, res, next) => {
  try {
    const { title, description, isActive } = req.body;

    // Check if job exists and belongs to user
    const existingJob = await prisma.jobDescription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingJob) {
      return next(new AppError('Job description not found', 404));
    }

    const updatedJob = await prisma.jobDescription.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...(title && { title }),
        ...(description && { 
          description,
          title: title || extractTitleFromDescription(description) || existingJob.title 
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        job: updatedJob,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete job description
router.delete('/:id', protect, async (req, res, next) => {
  try {
    // Check if job exists and belongs to user
    const existingJob = await prisma.jobDescription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingJob) {
      return next(new AppError('Job description not found', 404));
    }

    // Delete job description from database
    await prisma.jobDescription.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Job description deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Duplicate job description
router.post('/:id/duplicate', protect, async (req, res, next) => {
  try {
    const originalJob = await prisma.jobDescription.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!originalJob) {
      return next(new AppError('Job description not found', 404));
    }

    const duplicatedJob = await prisma.jobDescription.create({
      data: {
        title: `${originalJob.title} (Copy)`,
        description: originalJob.description,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        job: duplicatedJob,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get job statistics
router.get('/stats/overview', protect, async (req, res, next) => {
  try {
    const [totalJobs, activeJobs, recentJobs] = await Promise.all([
      prisma.jobDescription.count({
        where: { userId: req.user.id },
      }),
      prisma.jobDescription.count({
        where: { userId: req.user.id, isActive: true },
      }),
      prisma.jobDescription.count({
        where: {
          userId: req.user.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        recentJobs,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router; 