import express from 'express';
import path from 'path'; 
import { body, validationResult, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload, uploadFile } from '../utils/upload.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all properties with optional filters
router.get(
  '/',
  [
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('location').optional().isString(),
  ],
  async (req, res, next) => {
    try {
      const { minPrice, maxPrice, location } = req.query;

      const where = {};

      // Price filter
      if (minPrice || maxPrice) {
        where.pricePerNight = {};
        if (minPrice) where.pricePerNight.gte = parseFloat(minPrice);
        if (maxPrice) where.pricePerNight.lte = parseFloat(maxPrice);
      }

      // Location filter (case-insensitive partial match)
      if (location) {
        where.location = {
          contains: location,
          mode: 'insensitive',
        };
      }

      const properties = await prisma.property.findMany({
        where,
        include: {
          host: {
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

      res.json({ properties });
    } catch (error) {
      next(error);
    }
  }
);

// Get single property by ID (increment views)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Property not found',
      });
    }

    // Increment views
    await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    const updatedProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.json({ property: updatedProperty });
  } catch (error) {
    next(error);
  }
});

// Create property (Host only)
router.post(
  '/',
  authenticate,
  requireRole('host', 'admin'),
  upload.array('images', 10),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('pricePerNight')
      .isFloat({ min: 0 })
      .withMessage('Valid price is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('amenities').optional().isJSON().withMessage('Amenities must be valid JSON'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, pricePerNight, location, amenities, country } = req.body;

      // Parse amenities if provided as string
      let amenitiesData = [];
      if (amenities) {
        try {
          amenitiesData = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        } catch (e) {
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid amenities format',
          });
        }
      }

      // Upload images
      const imageUrls = [];
if (req.files && req.files.length > 0) {
  for (const file of req.files) {
    let url;
    
    // Якщо використовується S3, URL вже в file.location
    if (file.location) {
      url = file.location;
    } else if (file.buffer) {
      // Якщо локальне зберігання, завантажуємо через uploadFile
      url = await uploadFile(file.buffer, file.originalname, file.mimetype);
    } else if (file.path) {
      // Якщо файл вже збережений локально
      url = `/uploads/${path.basename(file.path)}`;
    } else {
      throw new Error('Unable to get file URL - check storage configuration');
    }
    
    imageUrls.push(url);
  }
}

      // Create property
      const property = await prisma.property.create({
        data: {
          hostId: req.user.id,
          title,
          description,
          pricePerNight: parseFloat(pricePerNight),
          location,
          images: imageUrls,
          amenities: amenitiesData,
          country: country || null,
        },
        include: {
          host: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Property created successfully',
        property,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get host's properties
router.get('/host/my-properties', authenticate, requireRole('host', 'admin'), async (req, res, next) => {
  try {
    const properties = await prisma.property.findMany({
      where: { hostId: req.user.id },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ properties });
  } catch (error) {
    next(error);
  }
});

// Search locations for autocomplete
router.get('/locations/search', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ locations: [] });
    }

    // Get unique locations that match the search query
    const properties = await prisma.property.findMany({
      where: {
        location: {
          contains: q,
          mode: 'insensitive',
        },
      },
      select: {
        location: true,
        country: true,
      },
      take: 10, // Limit results
      distinct: ['location'], // Get unique locations
    });

    // Also search by country if available
    let countryResults = [];
    if (properties.length < 5) {
      countryResults = await prisma.property.findMany({
        where: {
          country: {
            contains: q,
            mode: 'insensitive',
          },
        },
        select: {
          location: true,
          country: true,
        },
        take: 10,
        distinct: ['location'],
      });
    }

    // Combine and deduplicate results
    const allResults = [...properties, ...countryResults];
    const uniqueLocations = allResults.filter((item, index, self) =>
      index === self.findIndex(t => t.location === item.location)
    );

    // Format results
    const locations = uniqueLocations.map(item => ({
      name: item.location,
      country: item.country || '',
      displayName: item.country ? `${item.location}, ${item.country}` : item.location,
    }));

    res.json({ locations });
  } catch (error) {
    next(error);
  }
});

export default router;

