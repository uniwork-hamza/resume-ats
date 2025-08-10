import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma, supabase } from '../config/database.js';
import { protect, createSendToken } from '../middleware/auth.js';
import { validate, userSchemas } from '../utils/validation.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Register new user
router.post('/register', validate(userSchemas.register), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new AppError('User already exists with this email', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in our database
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Send success response
    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
});

// Login user
router.post('/login', validate(userSchemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Note: We're not using Supabase authentication for login since we're using our own system
    // Supabase is used mainly for email delivery and user management

    // Send success response
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// Logout user
router.post('/logout', protect, async (req, res, next) => {
  try {
    // Note: We're not using Supabase authentication, so no need to sign out from there
    // Our JWT token is handled by the frontend

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', protect, async (req, res, next) => {
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

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/profile', protect, validate(userSchemas.updateProfile), async (req, res, next) => {
  try {
    const { name, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(avatarUrl && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.patch('/change-password', protect, validate(userSchemas.changePassword), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password in database
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedNewPassword,
      },
    });

    // Note: We're not updating Supabase password since we're using our own authentication system

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', validate(userSchemas.forgotPassword), async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send password reset email through Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl,
    });

    if (error) {
      console.error('Supabase reset email error:', error);
      // Continue with custom implementation even if Supabase fails
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', validate(userSchemas.resetPassword), async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Note: We're not updating Supabase password here because:
    // 1. The user is not authenticated during password reset
    // 2. Our primary authentication is handled by our own system
    // 3. Supabase is used mainly for email delivery

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now sign in with your new password.',
    });
  } catch (error) {
    next(error);
  }
});

// Verify reset token
router.get('/verify-reset-token/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reset token is valid',
    });
  } catch (error) {
    next(error);
  }
});

export default router; 