import express from 'express';
import { prisma } from '../config/database.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { validate, resumeSchemas } from '../utils/validation.js';
import { AppError } from '../middleware/errorHandler.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get all resumes for current user
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id,
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };

    const [resumes, total] = await Promise.all([
      prisma.resume.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          fileName: true,
          fileSize: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.resume.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        resumes,
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

// Get single resume
router.get('/:id', protect, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        resume,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create new resume
router.post('/', protect, validate(resumeSchemas.create), async (req, res, next) => {
  try {
    const { title, type, content } = req.body;

    const newResume = await prisma.resume.create({
      data: {
        title,
        type,
        content,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        resume: newResume,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update resume
router.patch('/:id', protect, validate(resumeSchemas.update), async (req, res, next) => {
  try {
    const { title, type, content, isActive } = req.body;

    // Check if resume exists and belongs to user
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingResume) {
      return next(new AppError('Resume not found', 404));
    }

    const updatedResume = await prisma.resume.update({
      where: {
        id: req.params.id,
      },
      data: {
        ...(title && { title }),
        ...(type && { type }),
        ...(content && { content }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.status(200).json({
      success: true,
      data: {
        resume: updatedResume,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete resume
router.delete('/:id', protect, async (req, res, next) => {
  try {
    // Check if resume exists and belongs to user
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingResume) {
      return next(new AppError('Resume not found', 404));
    }

    // Delete associated file if exists
    if (existingResume.filePath) {
      const filePath = join(__dirname, '../../uploads', existingResume.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete resume from database
    await prisma.resume.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Upload resume file
router.post('/:id/upload', protect, uploadSingle('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    // Check if resume exists and belongs to user
    const existingResume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingResume) {
      return next(new AppError('Resume not found', 404));
    }

    // Delete old file if exists
    if (existingResume.filePath) {
      const oldFilePath = join(__dirname, '../../uploads', existingResume.filePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update resume with file information
    const updatedResume = await prisma.resume.update({
      where: {
        id: req.params.id,
      },
      data: {
        fileName: req.file.originalname,
        filePath: req.file.filename,
        fileSize: req.file.size,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        resume: updatedResume,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Download resume file
router.get('/:id/download', protect, async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!resume) {
      return next(new AppError('Resume not found', 404));
    }

    if (!resume.filePath) {
      return next(new AppError('No file associated with this resume', 404));
    }

    const filePath = join(__dirname, '../../uploads', resume.filePath);

    if (!fs.existsSync(filePath)) {
      return next(new AppError('File not found', 404));
    }

    res.download(filePath, resume.fileName);
  } catch (error) {
    next(error);
  }
});

// Duplicate resume
router.post('/:id/duplicate', protect, async (req, res, next) => {
  try {
    const originalResume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!originalResume) {
      return next(new AppError('Resume not found', 404));
    }

    const duplicatedResume = await prisma.resume.create({
      data: {
        title: `${originalResume.title} (Copy)`,
        content: originalResume.content,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        resume: duplicatedResume,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router; 