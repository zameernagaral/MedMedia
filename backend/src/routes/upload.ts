import { Router, Request, Response } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import os from 'os';
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

const stagingDir = path.join(os.tmpdir(), 'medmedia-upload-staging');
fs.mkdirSync(stagingDir, { recursive: true });

export function detectMediaMimeType(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6))) return 'image/gif';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (bytes.length >= 12 && bytes.toString('ascii', 4, 8) === 'ftyp') {
    const majorBrand = bytes.toString('ascii', 8, 12);
    if (!/^[a-zA-Z0-9 ]{4}$/.test(majorBrand)) return null;
    return majorBrand === 'qt  ' ? 'video/quicktime' : 'video/mp4';
  }
  return null;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, stagingDir),
    filename: (_req, _file, callback) => callback(null, randomUUID())
  }),
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes[extension]?.includes(file.mimetype)) return callback(new Error('Unsupported file type'));
    callback(null, true);
  },
  limits: { fileSize: 50 * 1024 * 1024, files: 1, fields: 10 }
});

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
}, async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  try {
    const handle = await fs.promises.open(file.path, 'r');
    const signature = Buffer.alloc(16);
    let bytesRead = 0;
    try {
      ({ bytesRead } = await handle.read(signature, 0, signature.length, 0));
    } finally {
      await handle.close();
    }

    const actualMimeType = detectMediaMimeType(signature.subarray(0, bytesRead));
    const extension = path.extname(file.originalname).toLowerCase();
    if (!actualMimeType || actualMimeType !== file.mimetype || !allowedTypes[extension]?.includes(actualMimeType)) {
      return res.status(400).json({ success: false, message: 'File contents do not match a supported image or video type' });
    }

    let fileUrl: string;
    if (process.env.CLOUDINARY_URL) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'medmedia_uploads',
        resource_type: actualMimeType.startsWith('video/') ? 'video' : 'image',
        use_filename: false,
        unique_filename: true
      });
      if (!result.secure_url) throw new Error('Storage provider returned no secure URL');
      fileUrl = result.secure_url;
    } else {
      const uploadDir = path.resolve(__dirname, '../../../uploads');
      await fs.promises.mkdir(uploadDir, { recursive: true });
      const filename = `media-${randomUUID()}${extension}`;
      const finalPath = path.join(uploadDir, filename);
      await fs.promises.copyFile(file.path, finalPath, fs.constants.COPYFILE_EXCL);
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    }

    res.status(201).json({ success: true, url: fileUrl });
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'http_code' in error
      ? String((error as { http_code: unknown }).http_code).slice(0, 20)
      : 'STORAGE_ERROR';
    console.error(`[Upload] storage operation failed (${code})`);
    res.status(process.env.CLOUDINARY_URL ? 502 : 500).json({ success: false, message: 'Upload could not be stored' });
  } finally {
    await fs.promises.unlink(file.path).catch(() => undefined);
  }
});

export default router;
