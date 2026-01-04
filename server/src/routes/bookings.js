import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create booking
router.post(
  '/',
  authenticate,
  [
    body('propertyId').isUUID().withMessage('Valid property ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { propertyId, startDate, endDate } = req.body;

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start >= end) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'End date must be after start date',
        });
      }

      if (start < now) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Start date cannot be in the past',
        });
      }

      // Check if property exists
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Property not found',
        });
      }

      // Check for overlapping bookings
      const overlappingBookings = await prisma.booking.findMany({
        where: {
          propertyId,
          status: {
            in: ['pending', 'confirmed'],
          },
          OR: [
            {
              AND: [
                { startDate: { lte: start } },
                { endDate: { gt: start } },
              ],
            },
            {
              AND: [
                { startDate: { lt: end } },
                { endDate: { gte: end } },
              ],
            },
            {
              AND: [
                { startDate: { gte: start } },
                { endDate: { lte: end } },
              ],
            },
          ],
        },
      });

      if (overlappingBookings.length > 0) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Property is not available for the selected dates',
        });
      }

      // Calculate total price
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalPrice = property.pricePerNight * nights;

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          propertyId,
          userId: req.user.id,
          startDate: start,
          endDate: end,
          totalPrice,
          status: 'pending',
        },
        include: {
          property: {
            include: {
              host: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Booking created successfully',
        booking,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's bookings
router.get('/my-bookings', authenticate, async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

// Get bookings for host's properties
router.get('/host-bookings', authenticate, requireRole('host', 'admin'), async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        property: {
          hostId: req.user.id,
        },
      },
      include: {
        property: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

// Cancel booking (User can cancel their own booking)
router.patch('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Booking not found',
      });
    }

    // Verify user owns the booking (unless admin)
    if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only cancel your own bookings',
      });
    }

    // Check if booking can be cancelled (not already cancelled or completed)
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Booking is already cancelled',
      });
    }

    // Update booking status to cancelled
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Create cancellation message for host
    await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: booking.property.host.id,
        propertyId: booking.propertyId,
        bookingId: booking.id,
        type: 'cancellation',
        content: reason || 'Бронювання скасовано користувачем',
        isRead: false,
      },
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
});

// Update booking status (Host/Admin only)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('host', 'admin'),
  [
    body('status')
      .isIn(['pending', 'confirmed', 'cancelled'])
      .withMessage('Valid status is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Check if booking exists and belongs to host's property
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          property: true,
        },
      });

      if (!booking) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Booking not found',
        });
      }

      // Verify host owns the property (unless admin)
      if (req.user.role !== 'admin' && booking.property.hostId !== req.user.id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only update bookings for your own properties',
        });
      }

      // Update booking
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: { status },
        include: {
          property: {
            include: {
              host: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      // TODO: Create status update message for user (when Message model is updated)

      res.json({
        message: 'Booking status updated',
        booking: updatedBooking,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

