import express from 'express';
import { prisma } from '../config/database.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { validate, resumeSchemas } from '../utils/validation.js';
import { AppError } from '../middleware/errorHandler.js';
import { extractTextFromFile, isSupportedFileType } from '../services/textExtraction.js';
import { parseResumeText } from '../services/openai.js';
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
          type: true,
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

// Upload resume file and parse with AI
router.post('/upload', protect, uploadSingle('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    const { title } = req.body;
    if (!title || title.trim().length === 0) {
      return next(new AppError('Resume title is required', 400));
    }

    // Validate file type
    if (!isSupportedFileType(req.file.mimetype)) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(new AppError('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.', 400));
    }

    try {
      // Extract text from the uploaded file
      console.log('Extracting text from file:', req.file.path);
      const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new AppError('No text could be extracted from the file', 400);
      }

      console.log('Parsing resume with OpenAI...');
      // Parse the extracted text using OpenAI
      const parsedContent = await parseResumeText(extractedText);
      
      // Create resume in database with parsed content
      const newResume = await prisma.resume.create({
        data: {
          title: title.trim(),
          type: 'file',
          content: parsedContent,
          fileName: req.file.originalname,
          filePath: req.file.filename,
          fileSize: req.file.size,
          userId: req.user.id,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          resume: newResume,
        },
        message: 'Resume uploaded and processed successfully',
      });

    } catch (error) {
      // Clean up uploaded file if processing fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (error instanceof AppError) {
        return next(error);
      }
      
      console.error('Resume processing error:', error);
      return next(new AppError('Failed to process resume file. Please try again or use the form option.', 500));
    }

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

// Legacy upload route for updating existing resume (keeping for compatibility)
router.post('/:id/upload', protect, uploadSingle('resume'), async (req, res, next) => {
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

    if (!req.file) {
      return next(new AppError('No file uploaded', 400));
    }

    // Validate file type
    if (!isSupportedFileType(req.file.mimetype)) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return next(new AppError('Unsupported file type. Please upload PDF, DOC, DOCX, or TXT files.', 400));
    }

    try {
      // Extract text from the uploaded file
      const extractedText = await extractTextFromFile(req.file.path, req.file.mimetype);
      
      if (!extractedText || extractedText.trim().length === 0) {
        throw new AppError('No text could be extracted from the file', 400);
      }

      // Parse the extracted text using OpenAI
      const parsedContent = await parseResumeText(extractedText);

      // Delete old file if exists
      if (existingResume.filePath) {
        const oldFilePath = join(__dirname, '../../uploads', existingResume.filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update resume with new file and parsed content
      const updatedResume = await prisma.resume.update({
        where: {
          id: req.params.id,
        },
        data: {
          type: 'file',
          content: parsedContent,
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
        message: 'Resume updated and processed successfully',
      });

    } catch (error) {
      // Clean up uploaded file if processing fails
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (error instanceof AppError) {
        return next(error);
      }
      
      console.error('Resume processing error:', error);
      return next(new AppError('Failed to process resume file. Please try again.', 500));
    }

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