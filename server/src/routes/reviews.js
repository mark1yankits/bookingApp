import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all reviews for a property
router.get('/property/:propertyId', async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            // Можна додати ім'я користувача, якщо буде поле name
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
});

// Create a new review (Authenticated users only)
router.post(
  '/',
  authenticate,
  [
    body('propertyId').notEmpty().withMessage('Property ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { propertyId, rating, comment } = req.body;
      const userId = req.user.id;

      // Check if user already reviewed this property
      console.log('Creating review for propertyId:', propertyId, 'userId:', userId);
      const existingReview = await prisma.review.findFirst({
        where: {
          propertyId,
          userId,
        },
      });

      console.log('Existing review found:', !!existingReview);

      if (existingReview) {
        console.log('User already reviewed this property, returning 400');
        return res.status(400).json({
          error: 'Bad Request',
          message: 'You have already reviewed this property',
        });
      }

      console.log('Creating new review...');

      // Create review
      console.log('About to create review in database...');
      const review = await prisma.review.create({
        data: {
          propertyId,
          userId,
          rating: parseInt(rating),
          comment: comment || null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      console.log('Review created successfully:', review.id);

      // Update property rating
      try {
        const allReviews = await prisma.review.findMany({
          where: { propertyId },
          select: { rating: true },
        });

        const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.property.update({
          where: { id: propertyId },
          data: {
            rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          },
        });
      } catch (ratingError) {
        console.warn('Failed to update property rating:', ratingError.message);
        // Don't fail the whole request if rating update fails
      }

      res.status(201).json({
        message: 'Review created successfully',
        review,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update a review (Review owner only)
router.put(
  '/:reviewId',
  authenticate,
  [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;

      // Check if review exists and belongs to user
      const review = await prisma.review.findFirst({
        where: {
          id: reviewId,
          userId,
        },
      });

      if (!review) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Review not found or you do not have permission to edit it',
        });
      }

      // Update review
      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          ...(rating !== undefined && { rating: parseInt(rating) }),
          ...(comment !== undefined && { comment }),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      // Update property rating
      const allReviews = await prisma.review.findMany({
        where: { propertyId: review.propertyId },
        select: { rating: true },
      });

      const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await prisma.property.update({
        where: { id: review.propertyId },
        data: {
          rating: Math.round(averageRating * 10) / 10,
        },
      });

      res.json({
        message: 'Review updated successfully',
        review: updatedReview,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete a review (Review owner or admin only)
router.delete('/:reviewId', authenticate, async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if review exists and user can delete it
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        ...(userRole !== 'admin' && { userId }), // Only check userId if not admin
      },
    });

    if (!review) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Review not found or you do not have permission to delete it',
      });
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Update property rating
    const allReviews = await prisma.review.findMany({
      where: { propertyId: review.propertyId },
      select: { rating: true },
    });

    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    await prisma.property.update({
      where: { id: review.propertyId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
      },
    });

    res.json({
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
