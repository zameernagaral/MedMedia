import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Configure Cloudinary (automatically picks up CLOUDINARY_URL from env if set)
let upload: multer.Multer;

if (process.env.CLOUDINARY_URL) {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'medmedia_uploads',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov'],
      resource_type: 'auto'
    } as any
  });
  upload = multer({ storage });
} else {
  // Fallback to local disk storage if Cloudinary is not configured
  const uploadDir = path.join(__dirname, '../../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  upload = multer({ storage });
}

router.post('/', requireAuth, upload.single('media'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    let fileUrl = '';
    if (process.env.CLOUDINARY_URL) {
      fileUrl = (req.file as any).path; // Cloudinary URL
    } else {
      // Local URL
      const host = req.get('host');
      const protocol = req.protocol;
      fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    res.status(201).json({ success: true, url: fileUrl });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'File upload failed', error: error.message });
  }
});

export default router;
