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

// Get all messages for current user (both sent and received)
router.get('/my-messages', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
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
        createdAt: 'desc',
      },
    });

    // Group messages by conversation (property + other participant)
    const conversations = {};
    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const conversationKey = `${message.propertyId}-${otherUserId}`;

      if (!conversations[conversationKey]) {
        conversations[conversationKey] = {
          property: message.property,
          otherUser: message.senderId === userId ? message.receiver : message.sender,
          messages: [],
          lastMessage: message,
          unreadCount: 0,
        };
      }

      conversations[conversationKey].messages.push(message);

      // Count unread messages
      if (message.receiverId === userId && !message.isRead) {
        conversations[conversationKey].unreadCount++;
      }
    });

    const conversationList = Object.values(conversations);

    res.json({
      conversations: conversationList,
      totalCount: conversationList.length,
    });
  } catch (error) {
    next(error);
  }
});

// Create a new message
router.post('/', authenticate, [
  body('receiverId').isUUID().withMessage('Valid receiver ID is required'),
  body('propertyId').isUUID().withMessage('Valid property ID is required'),
  body('content').isLength({ min: 1 }).withMessage('Message content is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId, propertyId, content } = req.body;
    const senderId = req.user.id;

    // Simple validation - just check if property exists and users are different
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Property not found',
      });
    }

    // Don't allow messaging yourself
    if (senderId === receiverId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot send message to yourself',
      });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        propertyId,
        content,
        isRead: false,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
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
});

// Mark message as read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user is the receiver
    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Message not found',
      });
    }

    if (message.receiverId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only mark your own messages as read',
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      message: 'Message marked as read',
      message: updatedMessage,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

