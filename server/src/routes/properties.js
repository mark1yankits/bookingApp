import express from 'express';
import path from 'path';
import { body, validationResult, query } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.js';
import { upload, uploadFile } from '../utils/upload.js';

const jsonParser = express.json({ limit: '10mb' });
const urlencodedParser = express.urlencoded({ extended: true, limit: '10mb' });

const router = express.Router();
const prisma = new PrismaClient();

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
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Transform properties to include reviewCount
      const transformedProperties = properties.map(({ _count, ...prop }) => ({
        ...prop,
        reviewCount: _count.reviews,
      }));

      res.json({ properties: transformedProperties });
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
        _count: {
          select: {
            reviews: true,
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
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    // Transform to include reviewCount
    const { _count, ...transformedProperty } = updatedProperty;
    transformedProperty.reviewCount = _count.reviews;

    res.json({ property: transformedProperty });
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
  urlencodedParser,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('pricePerNight')
      .isNumeric()
      .withMessage('Price must be a valid number')
      .custom(value => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
          throw new Error('Price must be a positive number');
        }
        return true;
      }),
    body('location').notEmpty().withMessage('Location is required'),
    body('amenities').optional(),
    body('rules').optional(),
    body('type').optional().isString(),
    body('bedrooms').optional().isInt({ min: 1 }).withMessage('Bedrooms must be a positive integer'),
    body('bathrooms').optional().isInt({ min: 1 }).withMessage('Bathrooms must be a positive integer'),
    body('maxGuests').optional().isInt({ min: 1 }).withMessage('Max guests must be a positive integer'),
    body('checkInTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('checkOutTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, pricePerNight, location, amenities, rules, country, type, bedrooms, bathrooms, maxGuests, checkInTime, checkOutTime } = req.body;

      console.log('Received data:', { title, description, pricePerNight, location, amenities, rules, country, type, bedrooms, bathrooms, maxGuests });

      let amenitiesData = [];
      if (amenities) {
        try {
          if (typeof amenities === 'string') {
            try {
              amenitiesData = JSON.parse(amenities);
            } catch {
              amenitiesData = amenities.split(',').map(a => a.trim()).filter(a => a);
            }
          } else if (Array.isArray(amenities)) {
            amenitiesData = amenities;
          }
        } catch (e) {
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid amenities format',
          });
        }
      }

      let rulesData = [];
      if (rules) {
        try {
          if (typeof rules === 'string') {
            try {
              rulesData = JSON.parse(rules);
            } catch {
              rulesData = rules.split('\n').map(r => r.trim()).filter(r => r);
            }
          } else if (Array.isArray(rules)) {
            rulesData = rules;
          }
        } catch (e) {
          return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid rules format',
          });
        }
      }
      const imageUrls = [];
if (req.files && req.files.length > 0) {
  for (const file of req.files) {
    let url;
    
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

      // Validate and parse price
      const priceValue = parseFloat(pricePerNight);
      if (isNaN(priceValue) || priceValue <= 0) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid price value',
        });
      }

      // Create property - only include fields that exist in schema
      const propertyData = {
        hostId: req.user.id,
        title,
        description,
        pricePerNight: priceValue,
        location,
        images: imageUrls,
        amenities: amenitiesData,
        country: country || null,
      };

      // Add optional fields if they exist in schema (after migration)
      if (rules !== undefined) propertyData.rules = rulesData;
      if (type !== undefined) propertyData.type = type || 'Квартира';
      if (bedrooms !== undefined) propertyData.bedrooms = bedrooms ? parseInt(bedrooms, 10) : 1;
      if (bathrooms !== undefined) propertyData.bathrooms = bathrooms ? parseInt(bathrooms, 10) : 1;
      if (maxGuests !== undefined) propertyData.maxGuests = maxGuests ? parseInt(maxGuests, 10) : 2;
      if (checkInTime !== undefined) propertyData.checkInTime = checkInTime || '14:00';
      if (checkOutTime !== undefined) propertyData.checkOutTime = checkOutTime || '12:00';

      const property = await prisma.property.create({
        data: propertyData,
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
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedProperties = properties.map(({ _count, ...prop }) => ({
      ...prop,
      reviewCount: _count.reviews,
    }));

    res.json({ properties: transformedProperties });
  } catch (error) {
    next(error);
  }
});

router.get('/locations/search', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ locations: [] });
    }

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
      take: 10, 
      distinct: ['location'], 
    });

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

    const allResults = [...properties, ...countryResults];
    const uniqueLocations = allResults.filter((item, index, self) =>
      index === self.findIndex(t => t.location === item.location)
    );

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

