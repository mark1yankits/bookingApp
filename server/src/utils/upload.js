import multer from 'multer';
import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists for local storage
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for memory storage (for S3) or disk storage (for local)
const storage = multer.memoryStorage();

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

// Initialize S3 if credentials are provided
let s3 = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  });
}

/**
 * Upload file to S3 or save locally
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - MIME type
 * @returns {Promise<string>} URL of uploaded file
 */
export const uploadFile = async (fileBuffer, originalName, mimetype) => {
  const fileExtension = path.extname(originalName);
  const fileName = `${uuidv4()}${fileExtension}`;

  // Use S3 if configured
  if (s3 && process.env.AWS_S3_BUCKET) {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `properties/${fileName}`,
      Body: fileBuffer,
      ContentType: mimetype,
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();
    return result.Location;
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
    if (s3 && process.env.AWS_S3_BUCKET) {
      const key = fileUrl.split('/').slice(-2).join('/'); // Extract key from URL
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      }).promise();
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

