import express from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/property/:propertyId', authenticate, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        bookings: {
          where: { userId },
        },
      },
    });

    if (!property) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Property not found',
      });
    }


    const messages = await prisma.message.findMany({
      where: { propertyId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  authenticate,
  [
    body('propertyId').notEmpty().withMessage('Property ID is required'),
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('content').notEmpty().withMessage('Message content is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { propertyId, receiverId, content } = req.body;
      const senderId = req.user.id;

      // Verify property exists and user has access
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Property not found',
        });
      }

      const isHost = property.hostId === receiverId;
      const isSenderHost = property.hostId === senderId;

      if (isSenderHost) {
        // Host sending - receiver must be a guest who has messaged or booked
        const hasMessage = await prisma.message.findFirst({
          where: {
            propertyId,
            senderId: receiverId,
          },
        });

        const hasBooking = await prisma.booking.findFirst({
          where: {
            propertyId,
            userId: receiverId,
          },
        });

        if (!hasMessage && !hasBooking) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Can only reply to guests who have messaged or booked',
          });
        }
      } else {
        // Guest sending - receiver must be the host
        if (!isHost) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'Guests can only message property hosts',
          });
        }
      }

      const message = await prisma.message.create({
        data: {
          propertyId,
          senderId,
          receiverId,
          content,
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          receiver: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get chat participants for a property
router.get('/property/:propertyId/participants', authenticate, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Property not found',
      });
    }

    // Get all unique participants from messages
    const messages = await prisma.message.findMany({
      where: { propertyId },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const participantIds = new Set();
    messages.forEach((msg) => {
      participantIds.add(msg.senderId);
      participantIds.add(msg.receiverId);
    });

    // Get bookings to find guests
    const bookings = await prisma.booking.findMany({
      where: { propertyId },
      select: {
        userId: true,
      },
    });

    bookings.forEach((booking) => {
      participantIds.add(booking.userId);
    });

    // Always include host
    participantIds.add(property.hostId);

    // Get user details
    const participants = await prisma.user.findMany({
      where: {
        id: { in: Array.from(participantIds) },
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    res.json({ participants });
  } catch (error) {
    next(error);
  }
});

export default router;

