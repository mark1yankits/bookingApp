import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
    body('role').optional().isIn(['guest', 'host', 'admin']).withMessage('Invalid role'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, phone, role = 'guest' } = req.body;

      // Validate required fields for new registration
      if (!name || !phone) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Name and phone number are required'
        });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
          phone,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          createdAt: true,
        },
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update profile
router.patch(
  '/profile',
  authenticate,
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('currentPassword').optional().isLength({ min: 6 }).withMessage('Current password must be at least 6 characters'),
    body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, currentPassword, newPassword } = req.body;
      const updateData = {};

      // If email is being updated, check if it's not taken by another user
      if (email && email !== req.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(409).json({
            error: 'Conflict',
            message: 'Email is already taken by another user',
          });
        }

        updateData.email = email;
      }

      // If password is being updated, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Current password is required to change password',
          });
        }

        // Get current user with password hash
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
        });

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isValidPassword) {
          return res.status(401).json({
            error: 'Unauthorized',
            message: 'Current password is incorrect',
          });
        }

        // Hash new password
        updateData.passwordHash = await bcrypt.hash(newPassword, 10);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

