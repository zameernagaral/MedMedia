import { Router, Request, Response } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Upload limit reached. Try again later.' }
});
const isProduction = process.env.NODE_ENV === 'production';
const allowedTypes: Record<string, string[]> = {
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.mp4': ['video/mp4'],
  '.mov': ['video/quicktime']
};
const uploadOptions = {
  fileFilter: (_req: any, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes[extension]?.includes(file.mimetype)) {
      return callback(new Error('Unsupported file type'));
    }
    callback(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 10 }
};

// Configure Cloudinary (automatically picks up CLOUDINARY_URL from env if set)
let upload: multer.Multer;

if (process.env.CLOUDINARY_URL) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'medmedia_uploads',
      allowed_formats: Object.keys(allowedTypes).map(extension => extension.slice(1)),
      resource_type: 'auto'
    } as any
  });
  upload = multer({ storage, ...uploadOptions });
} else if (isProduction) {
  upload = multer({ storage: multer.memoryStorage(), ...uploadOptions });
} else {
  const uploadDir = path.join(__dirname, '../../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `media-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
  });
  upload = multer({ storage, ...uploadOptions });
}

router.post('/', requireAuth, uploadLimiter, (req: Request, res: Response, next) => {
  if (isProduction && !process.env.CLOUDINARY_URL) {
    return res.status(503).json({ success: false, message: 'Persistent media storage is not configured' });
  }

  upload.single('media')(req, res, error => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'File exceeds the 50 MB limit' });
    }
    if (error) return res.status(400).json({ success: false, message: 'Unsupported or invalid upload' });
    next();
  });
}, (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileUrl = process.env.CLOUDINARY_URL
    ? (req.file as any).path
    : `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(201).json({ success: true, url: fileUrl });
});

export default router;
