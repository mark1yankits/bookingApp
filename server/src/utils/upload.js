import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists for local storage
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize S3 client if credentials are provided
let s3Client = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Configure storage: S3 if available, otherwise local
let storage;

if (s3Client && process.env.AWS_S3_BUCKET &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    !process.env.AWS_ACCESS_KEY_ID.startsWith('your_') &&
    !process.env.AWS_SECRET_ACCESS_KEY.startsWith('your_')) {
  // S3 тільки якщо креденшали налаштовані правильно
  storage = multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      // Створюємо шлях: uploads/ID_користувача/час_назва.jpg
      const userId = req.user?.id || req.body?.userId || 'anonymous';
      const timestamp = Date.now();
      const fileName = `uploads/${userId}/${timestamp}-${file.originalname}`;
      cb(null, fileName);
    },
  });
} else {
  // Fallback to local storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      cb(null, fileName);
    },
  });
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Upload file to S3 or save locally (for backward compatibility)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - MIME type
 * @returns {Promise<string>} URL of uploaded file
 */
export const uploadFile = async (fileBuffer, originalName, mimetype) => {
  // Перевірка на наявність fileBuffer
  if (!fileBuffer) {
    throw new Error('File buffer is undefined - check multer configuration');
  }

  const fileExtension = path.extname(originalName);
  const fileName = `${uuidv4()}${fileExtension}`;

  // Use S3 if configured and credentials are valid
  if (s3Client && process.env.AWS_S3_BUCKET &&
      process.env.AWS_ACCESS_KEY_ID &&
      !process.env.AWS_ACCESS_KEY_ID.startsWith('your_') &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      !process.env.AWS_SECRET_ACCESS_KEY.startsWith('your_')) {
    try {
      const { Upload } = await import('@aws-sdk/lib-storage');

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `properties/${fileName}`,
        Body: fileBuffer,
        ContentType: mimetype,
        ACL: 'public-read',
      };

      const upload = new Upload({
        client: s3Client,
        params: uploadParams,
      });

      const result = await upload.done();
      return result.Location;
    } catch (error) {
      console.warn('S3 upload failed, falling back to local storage:', error.message);
      // Fall back to local storage
    }
  }

  // Fallback to local storage
  const localPath = path.join(uploadsDir, fileName);
  fs.writeFileSync(localPath, fileBuffer);
  
  // Return relative URL (in production, this should be an absolute URL)
  return `/uploads/${fileName}`;
};

/**
 * Delete file from S3 or local storage
 * @param {string} fileUrl - URL of the file to delete
 */
export const deleteFile = async (fileUrl) => {
  // If it's an S3 URL
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    if (s3Client && process.env.AWS_S3_BUCKET) {
      const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

      // Extract key from URL (for S3 URLs)
      const urlParts = fileUrl.split('/');
      const key = urlParts.slice(-2).join('/'); // Get last two parts of path

      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      };

      await s3Client.send(new DeleteObjectCommand(deleteParams));
    }
  } else {
    // Local file
    const fileName = path.basename(fileUrl);
    const localPath = path.join(uploadsDir, fileName);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
};

